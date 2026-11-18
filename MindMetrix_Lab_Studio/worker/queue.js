import {PDFDocument} from 'pdf-lib';
import ui from '../public/ui-source.json' with {type:'json'};
import {getJSON,putJSON,readState,updateState,lease,release} from './store.js';
import {digest,groupActivities,extractDocx} from './content.js';
import {translateBatch,speech,audioKey,providerStatus,extractPDFPages} from './providers.js';
export function stringsFor(content,meta,ui){return [{id:'meta-title',text:meta.title},...content.activities.map(a=>({id:'title-'+a.id,text:a.title})),...content.activities.flatMap(a=>(a.config?.ingredients||[]).map((x,i)=>({id:'ingredient-'+a.id+'-'+i,text:x.label}))),...content.blocks.filter(b=>b.text.trim()).map(b=>({id:b.id,text:b.text})),...ui.map((text,i)=>({id:'ui-'+i,text}))]}
export async function runQueue(env){
 const lock=await lease(env);if(!lock)return {busy:true};let job;
 try{
  const state=await readState(env);job=state.jobs.find(j=>j.type==='extract'&&['queued','running','blocked'].includes(j.status))||state.jobs.find(j=>['queued','running','blocked'].includes(j.status));if(!job)return {idle:true};
  if(job.nextAttempt&&job.nextAttempt>Date.now())return {waiting:true,job:job.id};
  const book=state.books.find(b=>b.id===job.bookId);if(!book)throw Error('The source workbook is missing.');if(book.deletedAt){await saveJob(env,job.id,{status:'cancelled',error:'Workbook deleted.'});return {stale:true};}
  if(job.type!=='extract'&&job.hash!==book.contentHash){await saveJob(env,job.id,{status:'cancelled',error:'A newer curriculum draft replaced this conversion.'});return {stale:true}}
  await saveJob(env,job.id,{status:'running',error:null,updated:new Date().toISOString()});
  if(job.type==='extract')return await extractStep(env,job,book);
  const content=await getJSON(env,job.contentKey);
  const strings=stringsFor(content,book,ui),key='studio/results/'+job.id+'.json';
  let result=await getJSON(env,key)||{sourceHash:job.hash,language:job.language,strings:{},audio:{},ui};
  if(job.phase==='translate'){
   if(!providerStatus(env).translation)throw Object.assign(Error('Waiting for the private GEMINI_API_KEY server setting.'),{blocked:true});
   let batch=[],length=0;for(const item of strings.slice(job.cursor)){if(batch.length&&length+item.text.length>5500)break;batch.push(item);length+=item.text.length;if(batch.length===24)break;}
   // Reuse only exact source text, target language and model matches.
   const model=providerStatus(env).textModel,missing=[],cache={};for(const item of batch){const k='studio/text-cache/'+await digest(JSON.stringify({text:item.text,language:job.language,model}))+'.json';cache[item.id]=k;const hit=await getJSON(env,k);if(hit)result.strings[item.id]=hit.text;else missing.push(item)}
   if(missing.length){for(const item of await translateBatch(env,job.language,missing)){result.strings[item.id]=item.text;await putJSON(env,cache[item.id],{text:item.text})}}
   await putJSON(env,key,result);const cursor=job.cursor+batch.length;await saveJob(env,job.id,{cursor,total:strings.length,phase:cursor>=strings.length?'audio':'translate',status:'queued',attempts:0});
   return {processed:true,job:job.id,phase:'translate',cursor,total:strings.length};
  }
  if(job.language===book.sourceLanguage)for(const item of strings)result.strings[item.id]=item.text;
  if(strings.some(s=>!result.strings[s.id]))throw Error('Translation coverage is incomplete. Restart the translation stage.');
  // One persistent audio clip per workbook block and title; UI labels are translated but not narrated.
  const narratable=strings.filter(s=>!s.id.startsWith('ui-'));
  if(job.audioCursor<narratable.length){
   const item=narratable[job.audioCursor],text=result.strings[item.id];if(text.length>12000)throw Error('Split the long workbook block before generating audio.');
   const asset=await audioKey(env,text,job.language);if(!await env.BUCKET.head(asset)){if(!providerStatus(env).audio)throw Object.assign(Error('Waiting for the private GEMINI_API_KEY server setting.'),{blocked:true});await env.BUCKET.put(asset,await speech(env,text,job.language),{httpMetadata:{contentType:'audio/wav'}})}
   result.audio[item.id]='/api/files/'+asset;await putJSON(env,key,result);await saveJob(env,job.id,{audioCursor:job.audioCursor+1,audioTotal:narratable.length,total:strings.length,status:'queued',attempts:0});
   return {processed:true,job:job.id,phase:'audio',cursor:job.audioCursor+1,total:narratable.length};
  }
  await putJSON(env,key,result);await saveJob(env,job.id,{status:'ready',phase:'review',resultKey:key,total:strings.length,audioTotal:narratable.length,error:null,review:{text:false,artwork:false,simulation:false,audio:false}});return {ready:true,job:job.id};
 }catch(error){if(job){const attempts=(job.attempts||0)+1;await saveJob(env,job.id,{status:error.blocked?'blocked':(error.retry||error.name==='TimeoutError')&&attempts<4?'queued':'failed',error:error.message,attempts,nextAttempt:error.blocked?null:Date.now()+Math.min(60000*2**attempts,900000)});}return {job:job?.id,error:error.message,blocked:!!error.blocked};}finally{await release(env,lock)}
}
export async function saveJob(env,id,patch){await updateState(env,s=>{const job=s.jobs.find(j=>j.id===id);if(job&&job.status!=='cancelled')Object.assign(job,patch,{updated:new Date().toISOString()})})}
async function extractStep(env,job,book){
 let source=await env.BUCKET.get(book.sourceKey);if(!source)throw Error('The uploaded workbook file is missing.');
 let bytes=new Uint8Array(await source.arrayBuffer());
 if(book.extension==='doc'){
  if(!env.DOCUMENT_CONVERTER_URL)throw Object.assign(Error('Legacy DOC is saved. Upload a DOCX/PDF edition or connect the private document conversion service.'),{blocked:true});
  const url=new URL(env.DOCUMENT_CONVERTER_URL);if(url.protocol!=='https:')throw Error('The document conversion service must use HTTPS.');
  const r=await fetch(url,{method:'POST',headers:{'content-type':'application/msword',...(env.DOCUMENT_CONVERTER_KEY?{'authorization':'Bearer '+env.DOCUMENT_CONVERTER_KEY}:{})},body:bytes,signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('Document conversion failed; retry or upload DOCX.');bytes=new Uint8Array(await r.arrayBuffer());
 }
 if(book.extension!=='pdf'){
  const {content,media}=extractDocx(bytes);for(const image of media)await env.BUCKET.put('workbooks/'+book.id+'/'+image.asset,image.data,{httpMetadata:{contentType:image.mime}});for(const block of content.blocks)if(block.image)block.image='/api/files/workbooks/'+book.id+'/'+block.image;
  await finishExtraction(env,job,book,content);return {extracted:true,book:book.id};
 }
 const pdf=await PDFDocument.load(bytes,{ignoreEncryption:false}),count=pdf.getPageCount(),start=job.cursor||0,end=Math.min(start+3,count);if(count>300)throw Error('Split this PDF into workbooks of at most 300 pages.');
 const chunk=await PDFDocument.create();for(const page of await chunk.copyPages(pdf,Array.from({length:end-start},(_,i)=>start+i)))chunk.addPage(page);
 const blocks=await extractPDFPages(env,await chunk.save(),start+1),key='studio/extract/'+job.id+'.json';let existing=await getJSON(env,key)||[];existing.push(...blocks.map((b,i)=>({id:'b'+(existing.length+i),text:b.text,page:b.page,kind:b.kind==='heading'?'heading':'paragraph'})));await putJSON(env,key,existing);
 if(end<count){await saveJob(env,job.id,{cursor:end,total:count,status:'queued',attempts:0});return {processed:true,phase:'extract',cursor:end,total:count}}
 const content={blocks:existing,activities:groupActivities(existing),materials:[],artworkReviewRequired:true,pdfSource:true};await finishExtraction(env,job,book,content);return {extracted:true,book:book.id};
}
async function finishExtraction(env,job,book,content){const hash=await digest(JSON.stringify(content)),key='studio/content/'+book.id+'/'+hash+'.json';await putJSON(env,key,content);await updateState(env,s=>{const existingJob=s.jobs.find(j=>j.id===job.id);if(existingJob?.status==='cancelled')return;const current=s.books.find(b=>b.id===book.id);Object.assign(current,{contentKey:key,contentHash:hash,status:'review',reviewed:false,extracted:new Date().toISOString()});const j=s.jobs.find(j=>j.id===job.id);if(j.status!=='cancelled')Object.assign(j,{status:'ready',phase:'extracted',updated:new Date().toISOString()})})}
