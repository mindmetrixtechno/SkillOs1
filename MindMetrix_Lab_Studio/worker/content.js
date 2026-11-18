import {unzipSync,strFromU8} from 'fflate';
export const LANGUAGES={en:'English',hi:'हिन्दी',te:'తెలుగు',kn:'ಕನ್ನಡ',ta:'தமிழ்',gu:'ગુજરાતી'};
export const VOICES={en:['en-IN','en-IN-NeerjaNeural'],hi:['hi-IN','hi-IN-SwaraNeural'],te:['te-IN','te-IN-ShrutiNeural'],kn:['kn-IN','kn-IN-SapnaNeural'],ta:['ta-IN','ta-IN-PallaviNeural'],gu:['gu-IN','gu-IN-DhwaniNeural']};
export const TEMPLATES=['workbook','mix','weigh','recipe','budget','conditions'];
export const MAX_FILE=18*1024*1024;
export const clean=s=>String(s??'').trim();
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const id=()=>crypto.randomUUID();
export async function digest(data){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',typeof data==='string'?new TextEncoder().encode(data):data))].map(n=>n.toString(16).padStart(2,'0')).join('')}
export function validateContent(c){
 if(!c||!Array.isArray(c.blocks)||!c.blocks.length||c.blocks.length>8000)throw Error('Provide 1–8,000 workbook blocks.');
 const seen=new Set();for(const b of c.blocks){if(!/^[a-zA-Z0-9_-]{1,100}$/.test(b.id)||seen.has(b.id))throw Error('Block IDs must be unique.');seen.add(b.id);if(typeof b.text!=='string'||b.text.length>20000)throw Error('Invalid workbook text.');if(b.image&&!/^\/api\/files\/[a-zA-Z0-9/_-]+(?:\.[a-zA-Z0-9]+)?$/.test(b.image)&&!/^\/simulators\/[a-zA-Z0-9/_.-]+$/.test(b.image))throw Error('Use private workbook images only.');}
 if(!Array.isArray(c.activities)||!c.activities.length||c.activities.length>100)throw Error('Configure at least one activity.');
 const activities=new Set();for(const a of c.activities){if(!a.id||activities.has(a.id))throw Error('Activity IDs must be unique.');activities.add(a.id);if(!a.title||!Array.isArray(a.blocks)||a.blocks.some(k=>!seen.has(k)))throw Error('Activity references an unknown block.');if(!TEMPLATES.includes(a.template||'workbook'))throw Error('Unsupported simulation component.');
 const cfg=a.config||{};
 if(a.template==='mix'&&(!Array.isArray(cfg.ratios)||cfg.ratios.length!==3||cfg.ratios.some(n=>!Number.isFinite(n)||n<0)||cfg.ratios.reduce((s,n)=>s+n,0)<=0))throw Error('Mix needs three approved ratios in component values: {"ratios":[5,3,2]}.');
 if(a.template==='recipe'&&(!Number.isFinite(cfg.basePortions)||cfg.basePortions<=0||!Array.isArray(cfg.ingredients)||!cfg.ingredients.length||cfg.ingredients.some(x=>typeof x.label!=='string'||!Number.isFinite(x.amount)||x.amount<0)))throw Error('Recipe needs approved basePortions and ingredients [{label,amount}] in component values.');
 if(a.template==='conditions'&&(!Number.isFinite(cfg.lightBelow)||!Number.isFinite(cfg.fanAbove)))throw Error('Conditions needs approved lightBelow and fanAbove values.');}
 if(!Array.isArray(c.materials)||c.materials.some(k=>!seen.has(k)))throw Error('Invalid material block references.');
 return c;
}
export function blocksFromText(text){return text.split(/\n\s*\n|\r?\n/).map(clean).filter(Boolean).map((text,i)=>({id:'b'+i,text,page:1,kind:'paragraph'}))}
export function groupActivities(blocks){let activities=[],current=null,currentNumber=null;for(const b of blocks){const match=b.text.match(/^(?:ACTIVITY|Activity|CAPSTONE|Capstone)\s*(\d+)\s*[:·•.—-]/);if(match&&b.text.length<180&&match[1]!==currentNumber){currentNumber=match[1];current={id:'a'+activities.length,title:b.text,template:'workbook',blocks:[]};activities.push(current)}if(current)current.blocks.push(b.id)}if(activities.length){const assigned=new Set(activities.flatMap(a=>a.blocks));activities[0].blocks.unshift(...blocks.filter(b=>!assigned.has(b.id)).map(b=>b.id));}if(!activities.length)activities=[{id:'a0',title:'Workbook exploration',template:'workbook',blocks:blocks.map(b=>b.id)}];return activities;}

const decode=s=>s.replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):+n)).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&');
export function extractDocx(bytes){
 const entries=unzipSync(bytes,{filter:f=>f.originalSize<24*1024*1024&&(f.name==='word/document.xml'||f.name==='word/_rels/document.xml.rels'||/^word\/media\//.test(f.name))});
 if(!entries['word/document.xml'])throw Error('This is not a valid DOCX workbook.');
 const xml=strFromU8(entries['word/document.xml']);if(xml.length>18*1024*1024)throw Error('The expanded document is too large.');
 const rels=strFromU8(entries['word/_rels/document.xml.rels']||new Uint8Array());const images={};
 for(const m of rels.matchAll(/<Relationship\s+([^>]+)\/?\s*>/g)){const attrs=Object.fromEntries([...m[1].matchAll(/([\w:]+)="([^"]*)"/g)].map(x=>[x[1],decode(x[2])]));if(attrs.Id&&attrs.Target?.startsWith('media/')&&!attrs.Target.includes('..'))images[attrs.Id]='word/'+attrs.Target;}
 let page=1,blocks=[];const media=[];
 for(const m of xml.matchAll(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g)){
  const p=m[0];if(/<w:pageBreakBefore(?:\s[^>]*)?\s*\/>/.test(p))page++;
  const text=[...p.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(x=>decode(x[1])).join('').trim();
  if(text)blocks.push({id:'b'+blocks.length,text,page,kind:/<w:pStyle[^>]+w:val="(?:Heading|Title)/.test(p)?'heading':'paragraph'});
  for(const r of p.matchAll(/r:embed="([^"]+)"/g)){const path=images[r[1]],data=entries[path];if(path&&data){const ext=path.split('.').pop().toLowerCase();if(['png','jpg','jpeg','webp'].includes(ext)){const asset='asset'+media.length+'.'+ext;media.push({asset,data,mime:ext==='jpg'?'image/jpeg':'image/'+ext});blocks.push({id:'b'+blocks.length,text:'',image:asset,page,kind:'image'});}}}
  if(/w:type="page"/.test(p))page++;
 }
 if(!blocks.length)throw Error('No readable content was found. Upload an unprotected DOCX.');
 return {content:{blocks,activities:groupActivities(blocks),materials:[],artworkReviewRequired:media.length>0},media};
}
export function queueLanguages(state,book,languages){
 if(book.deletedAt)throw Error('Restore the workbook before starting conversion.');
 if(!book.contentHash||!book.reviewed)throw Error('Review and approve the extracted curriculum first.');
 const result=[];
 for(const language of [...new Set(languages)]){if(!LANGUAGES[language])throw Error('Unsupported language.');if(state.jobs.some(j=>j.bookId===book.id&&j.hash===book.contentHash&&j.language===language&&!['cancelled','failed'].includes(j.status))){continue}
 const job={id:id(),bookId:book.id,hash:book.contentHash,contentKey:book.contentKey,language,status:'queued',phase:language===book.sourceLanguage?'audio':'translate',cursor:0,audioCursor:0,created:new Date().toISOString(),updated:new Date().toISOString(),attempts:0,error:null};state.jobs.push(job);result.push(job)}return result;
}
export function canPublish(book,job){return !!(book.reviewed&&job&&job.bookId===book.id&&job.hash===book.contentHash&&job.status==='ready'&&job.review?.text&&job.review?.artwork&&job.review?.simulation&&job.review?.audio)}
