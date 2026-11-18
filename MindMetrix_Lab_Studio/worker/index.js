import {LANGUAGES,MAX_FILE,validateContent,digest,queueLanguages,canPublish,id,clean} from './content.js';
import {readState,updateState,getJSON,putJSON} from './store.js';
import {runQueue} from './queue.js';
import {providerStatus} from './providers.js';
import {seeds} from './seeds.js';
import {workbookSlot,workbookConflict,archiveWorkbook,restoreWorkbook} from './workbook-library.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'cache-control':'private, no-store','x-content-type-options':'nosniff'}});
const fail=(message,status=400)=>Object.assign(Error(message),{status});
function writeGuard(request){const origin=request.headers.get('origin');if((origin&&origin!==new URL(request.url).origin)||request.headers.get('sec-fetch-site')==='cross-site')throw fail('Cross-site writes are not allowed.',403)}
function findBook(state,id){const b=state.books.find(b=>b.id===id);if(!b)throw fail('Workbook not found.',404);return b}
const isJob=j=>j.type!=='extract';
async function body(request){if(+(request.headers.get('content-length')||0)>5*1024*1024)throw fail('The review is too large.');return request.json()}
export default {async fetch(request,env,ctx){const url=new URL(request.url),path=url.pathname;
 if(!path.startsWith('/api/'))return env.ASSETS.fetch(request);
 try{
  if(!env.BUCKET)throw fail('Private storage has not been provisioned.',503);
  // This site remains owner-only at the Sites access boundary. Do not make it public
  // or grant additional visitors without adding application-level admin membership.
  if(request.method!=='GET'&&request.method!=='HEAD')writeGuard(request);
  if(path==='/api/health')return json({ok:true,storage:true,providers:providerStatus(env)});
  if(path==='/api/runner/tick'&&request.method==='POST')return json(await runQueue(env));
  if(path==='/api/state'&&request.method==='GET'){const s=await readState(env);return json({...s,providers:providerStatus(env),languages:LANGUAGES})}
  if(path==='/api/import'&&request.method==='POST'){
   const data=await body(request);if(!/^csl-[678]-(life|services)$/.test(data.seedId))throw fail('Choose an existing workbook project.');
   const seed=seeds.find(s=>s.id===data.seedId);if(!seed)throw fail('Source project not found.',404);const state=await readState(env);const previous=state.books.find(b=>b.seedId===seed.id);if(previous)return json({book:previous});
   validateContent(seed.content);const hash=await digest(JSON.stringify(seed.content));const book={...seed,id:id(),seedId:seed.id,created:new Date().toISOString(),status:'review',reviewed:false,contentHash:hash};delete book.content;book.contentKey='studio/content/'+book.id+'/'+hash+'.json';await putJSON(env,book.contentKey,seed.content);await updateState(env,s=>s.books.push(book));return json({book},201);
  }
  if(path==='/api/books'&&request.method==='POST'){
   if(+(request.headers.get('content-length')||0)>MAX_FILE+100000)throw fail('Maximum workbook upload is 18 MB.',413);
   const form=await request.formData(),file=form.get('file');if(!file||typeof file.arrayBuffer!=='function'||!file.size||file.size>MAX_FILE)throw fail('Choose a DOC, DOCX or PDF workbook up to 18 MB.');
   const extension=file.name.split('.').pop().toLowerCase();if(!['doc','docx','pdf'].includes(extension))throw fail('Use DOC, DOCX or PDF.');
   const bytes=new Uint8Array(await file.arrayBuffer());const valid=extension==='pdf'?String.fromCharCode(...bytes.slice(0,5))==='%PDF-':extension==='docx'?bytes[0]===80&&bytes[1]===75:bytes[0]===208&&bytes[1]===207;if(!valid)throw fail('The file signature does not match the selected format.');
   const title=clean(form.get('title')),grade=clean(form.get('grade')),lab=clean(form.get('lab')),workForm=clean(form.get('workForm')),sourceLanguage=clean(form.get('sourceLanguage')||'en');
   if(!title||title.length>180||!['6','7','8','9','10','11','12'].includes(grade)||!['robotics','csl','ai','it'].includes(lab)||!LANGUAGES[sourceLanguage]||(lab==='csl'&&!['life','machines','services'].includes(workForm)))throw fail('Complete the class, lab, project title and source language.');
   const sourceHash=await digest(bytes),old=await readState(env),projectId=clean(form.get('projectId'))||id();
   if(form.get('projectId')&&!old.books.some(b=>b.projectId===projectId))throw fail('Choose an existing project for a new version.');
   const previous=old.books.filter(b=>b.projectId===projectId).sort((a,b)=>b.version-a.version)[0];
   if(previous?.deletedAt)throw fail('Restore the deleted workbook before updating it.',409);
   const candidate={grade,lab,workForm};
   if(previous&&workbookSlot(previous)!==workbookSlot(candidate))throw fail('An update must use the existing class, lab and form.',409);
   const conflict=workbookConflict(old.books,candidate,previous?.projectId);
   if(conflict)return json({error:'A workbook is already configured for this class, lab and form. Update it or delete it before uploading a replacement.',code:'WORKBOOK_EXISTS',existing:conflict},409);
   const duplicate=old.books.find(b=>!b.deletedAt&&b.sourceHash===sourceHash&&b.projectId===projectId);if(duplicate)return json({book:duplicate,duplicate:true});
   const book={id:id(),projectId,title,grade,lab,workForm:lab==='csl'?workForm:null,subject:clean(form.get('subject')||lab).slice(0,100),sourceLanguage,filename:file.name.slice(0,180),extension,sourceHash,size:file.size,version:old.books.filter(b=>b.projectId===projectId).length+1,created:new Date().toISOString(),status:'extracting',reviewed:false};
   book.sourceKey='sources/'+book.id+'/original.'+extension;
   await env.BUCKET.put(book.sourceKey,bytes,{httpMetadata:{contentType:extension==='pdf'?'application/pdf':extension==='doc'?'application/msword':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}});
   const job={id:id(),type:'extract',bookId:book.id,status:'queued',phase:'extract',cursor:0,created:book.created,updated:book.created};
   await updateState(env,s=>{const conflict=workbookConflict(s.books,book,previous?.projectId);if(conflict)throw fail('Another workbook was added for this class, lab and form. Reload and choose Update.',409);if(previous&&(s.books.find(b=>b.id===previous.id)?.deletedAt||s.books.filter(b=>b.projectId===projectId).sort((a,b)=>b.version-a.version)[0]?.id!==previous.id))throw fail('This workbook changed during upload. Reload before updating it.',409);s.books.push(book);s.jobs.push(job)});ctx.waitUntil(runQueue(env));return json({book},201);
  }
  const bookMatch=path.match(/^\/api\/books\/([\w-]+)(?:\/(content|review|queue|restore))?$/);
  if(bookMatch){const [,bookId,action]=bookMatch,state=await readState(env),book=findBook(state,bookId);
   if(request.method==='DELETE'&&!action){return json(await updateState(env,s=>archiveWorkbook(s,findBook(s,bookId))))}
   if(request.method==='POST'&&action==='restore'){return json(await updateState(env,s=>restoreWorkbook(s,findBook(s,bookId))))}
   if(book.deletedAt)throw fail('This workbook is in Deleted workbooks. Restore it first.',409);
   if(request.method==='GET'&&action==='content')return json({book,content:book.contentKey?await getJSON(env,book.contentKey):null});
   if(request.method==='PUT'&&action==='content'){
    const data=await body(request);if(data.baseHash!==book.contentHash)throw fail('This draft changed in another session. Reload before saving.',409);
    const content=validateContent(data.content),hash=await digest(JSON.stringify(content)),key='studio/content/'+book.id+'/'+hash+'.json';await putJSON(env,key,content);
    await updateState(env,s=>{const b=findBook(s,book.id);if(b.contentHash!==data.baseHash)throw fail('Draft conflict. Reload before saving.',409);Object.assign(b,{contentHash:hash,contentKey:key,reviewed:false,status:'review'});for(const j of s.jobs)if(j.bookId===book.id&&isJob(j)&&j.hash!==hash&&!['cancelled','failed','ready'].includes(j.status))j.status='cancelled'});return json({hash});
   }
   if(request.method==='POST'&&action==='review'){
    const data=await body(request);if(!data.confirm||data.hash!==book.contentHash||!book.contentKey)throw fail('Review this exact curriculum version before approving.');
    validateContent(await getJSON(env,book.contentKey));await updateState(env,s=>{const b=findBook(s,book.id);if(b.contentHash!==data.hash)throw fail('Draft changed. Review the current version.',409);b.reviewed=true;b.status='approved'});return json({approved:true});
   }
   if(request.method==='POST'&&action==='queue'){
    const data=await body(request);if(!Array.isArray(data.languages)||!data.languages.length)throw fail('Select at least one language.');
    const jobs=await updateState(env,s=>queueLanguages(s,findBook(s,book.id),data.languages));ctx.waitUntil(runQueue(env));return json({jobs});
   }
  }
  const jobMatch=path.match(/^\/api\/jobs\/([\w-]+)\/(retry|cancel|review|publish|preview)$/);
  if(jobMatch){const [,jobId,action]=jobMatch,state=await readState(env),job=state.jobs.find(j=>j.id===jobId);if(!job)throw fail('Job not found.',404);
   if(action==='preview'&&request.method==='GET'){if(!job.resultKey)throw fail('The language edition is not ready.',409);const book=findBook(state,job.bookId);return json({book,job,content:await getJSON(env,job.contentKey),result:await getJSON(env,job.resultKey)})}
   if(action==='retry'&&request.method==='POST'){await updateState(env,s=>{const j=s.jobs.find(j=>j.id===jobId);if(findBook(s,j.bookId).deletedAt)throw fail('Restore the workbook before resuming conversion.',409);if(!['failed','blocked','queued','running','cancelled'].includes(j.status))throw fail('Only unfinished jobs can resume.');Object.assign(j,{status:'queued',error:null,nextAttempt:null,attempts:0})});ctx.waitUntil(runQueue(env));return json({queued:true})}
   if(action==='cancel'&&request.method==='POST'){await updateState(env,s=>{const j=s.jobs.find(j=>j.id===jobId);if(j.status==='ready')throw fail('This conversion has finished.');j.status='cancelled'});return json({cancelled:true})}
   if(action==='review'&&request.method==='POST'){const data=await body(request);await updateState(env,s=>{const j=s.jobs.find(j=>j.id===jobId),b=findBook(s,j.bookId);if(j.status!=='ready'||j.hash!==b.contentHash)throw fail('Review the current completed language edition.');j.review={text:!!data.text,artwork:!!data.artwork,simulation:!!data.simulation,audio:!!data.audio}});return json({saved:true})}
   if(action==='publish'&&request.method==='POST'){
    const book=findBook(state,job.bookId);if(book.deletedAt)throw fail('Restore the workbook before publishing.',409);if(!canPublish(book,job))throw fail('Complete all four review checks for the current workbook before publishing.',409);
    const publication={id:id(),projectId:book.projectId,bookId:book.id,jobId:job.id,language:job.language,hash:job.hash,published:new Date().toISOString()};
    await updateState(env,s=>{const current=s.jobs.find(j=>j.id===jobId),b=findBook(s,current.bookId);if(b.deletedAt||!canPublish(b,current))throw fail('The workbook changed. Review again.',409);const previous=s.published.find(p=>p.projectId===publication.projectId&&p.language===publication.language);if(previous)s.history.push(previous);s.published=s.published.filter(p=>!(p.projectId===publication.projectId&&p.language===publication.language));s.published.push(publication);});return json({published:publication});
   }
  }
  if(path==='/api/publications/rollback'&&request.method==='POST'){
   const data=await body(request);await updateState(env,s=>{const previous=s.history.find(p=>p.id===data.publicationId);if(previous&&s.books.find(b=>b.id===previous.bookId)?.deletedAt)throw fail('Restore the workbook before restoring its published edition.',409);if(!previous)throw fail('Previous publication not found.',404);const current=s.published.find(p=>p.projectId===previous.projectId&&p.language===previous.language);if(current)s.history.push(current);s.published=s.published.filter(p=>!(p.projectId===previous.projectId&&p.language===previous.language));s.published.push({...previous,id:id(),published:new Date().toISOString(),restoredFrom:previous.id})});return json({restored:true});
  }
  if(path==='/api/published'&&request.method==='GET'){
   const s=await readState(env);return json({projects:s.published.filter(p=>!s.books.find(b=>b.id===p.bookId)?.deletedAt).map(p=>{const b=s.books.find(b=>b.id===p.bookId);return {...p,title:b.title,grade:b.grade,lab:b.lab,workForm:b.workForm}}),languages:LANGUAGES});
  }
  const publicationMatch=path.match(/^\/api\/published\/([\w-]+)\/([a-z]{2})$/);
  if(publicationMatch&&request.method==='GET'){
   const s=await readState(env),p=s.published.find(p=>p.projectId===publicationMatch[1]&&p.language===publicationMatch[2]);if(!p||s.books.find(b=>b.id===p.bookId)?.deletedAt)throw fail('This project has no approved edition in the selected language.',404);const job=s.jobs.find(j=>j.id===p.jobId),book=findBook(s,p.bookId);return json({book,publication:p,content:await getJSON(env,job.contentKey),result:await getJSON(env,job.resultKey)});
  }
  if(path.startsWith('/api/files/')&&request.method==='GET'){
   const key=decodeURIComponent(path.slice(11));if(!/^(?:audio\/[a-f0-9]+\.wav|workbooks\/[\w-]+\/[\w.-]+|sources\/[\w-]+\/original\.(?:docx?|pdf))$/.test(key))throw fail('Asset not found.',404);
   const object=await env.BUCKET.get(key);if(!object)throw fail('Asset not found.',404);const headers=new Headers({'cache-control':'private, max-age=3600','x-content-type-options':'nosniff','content-security-policy':"default-src 'none'; frame-ancestors 'self'"});object.writeHttpMetadata(headers);headers.set('content-disposition','inline');return new Response(object.body,{headers});
  }
  throw fail('Not found.',404);
 }catch(e){return json({error:e.message||'The request could not be completed.'},e.status||400)}
}};
