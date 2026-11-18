import {rm,cp,mkdir} from 'node:fs/promises';import {spawnSync} from 'node:child_process';
for(const path of ['dist/server','dist/client','dist/.openai','.generated-public'])await rm(path,{recursive:true,force:true});
await mkdir('.generated-public',{recursive:true});await cp('dist','.generated-public',{recursive:true});await cp('public','.generated-public',{recursive:true});
const run=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build'],{stdio:'inherit'});process.exit(run.status??1);
