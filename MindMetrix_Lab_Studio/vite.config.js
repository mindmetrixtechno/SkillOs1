import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import { cp, mkdir } from 'node:fs/promises';
export default defineConfig({
 publicDir:'.generated-public',
 server:{host:'0.0.0.0',allowedHosts:['terminal.local']},
 plugins:[cloudflare({inspectorPort:false,viteEnvironment:{name:'server'},config:{name:'mindmetrix-studio',main:'worker/index.js',compatibility_date:'2026-05-15',assets:{binding:'ASSETS',run_worker_first:['/api/*']},r2_buckets:[{binding:'BUCKET',bucket_name:'mindmetrix-private'}]}}),
 {name:'sites-manifest',async closeBundle(){await mkdir('dist/.openai',{recursive:true});await cp('.openai/hosting.json','dist/.openai/hosting.json')}}]
});
