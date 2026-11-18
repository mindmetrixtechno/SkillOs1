export const ROOT='studio/catalog-v1.json';
export const initial=()=>({schema:1,books:[],jobs:[],published:[],history:[]});
export async function getJSON(env,key){const object=await env.BUCKET.get(key);return object?object.json():null}
export async function putJSON(env,key,value){await env.BUCKET.put(key,JSON.stringify(value),{httpMetadata:{contentType:'application/json'}})}
export async function readState(env){return await getJSON(env,ROOT)||initial()}
export async function updateState(env,fn){for(let i=0;i<8;i++){const object=await env.BUCKET.get(ROOT),state=object?await object.json():initial();const result=fn(state);const saved=await env.BUCKET.put(ROOT,JSON.stringify(state),{onlyIf:object?{etagMatches:object.etag}:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}});if(saved)return result;}throw Error('Another update is in progress. Please try again.');}
export async function lease(env){const key='studio/queue-lock.json',old=await env.BUCKET.get(key);if(old&&(await old.json()).until>Date.now())return null;const token=crypto.randomUUID();const saved=await env.BUCKET.put(key,JSON.stringify({token,until:Date.now()+60000}),{onlyIf:old?{etagMatches:old.etag}:{etagDoesNotMatch:'*'}});return saved?{key,etag:saved.etag}:null}
export async function release(env,lock){if(lock)await env.BUCKET.put(lock.key,JSON.stringify({until:0}),{onlyIf:{etagMatches:lock.etag}})}
