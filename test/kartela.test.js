import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWorker} from '../worker/handler.js';
const html=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
test('poster assets, PIN validation and existing route fallback',async()=>{
 const worker=createWorker(html,async()=>({games:[]}));
 const get=path=>worker.fetch(new Request('https://local.test'+path));
 for(const [pin,status] of [['1234',403],['0000',200]]){
  const r=await worker.fetch(new Request('https://local.test/api/kartela-template',{method:'POST',body:JSON.stringify({pin})}));
  assert.equal(r.status,status);
  if(status===200){assert.equal(r.headers.get('Content-Type'),'image/jpeg');assert.ok((await r.arrayBuffer()).byteLength>10000);}
 }
 const logo=await get('/assets/areatza-logo-3d.webp');assert.equal(logo.status,200);assert.equal(logo.headers.get('Content-Type'),'image/webp');
 assert.equal((await get('/api/kartela-template')).status,404);
 const malformed=await worker.fetch(new Request('https://local.test/api/kartela-template',{method:'POST',body:'invalid'}));assert.equal(malformed.status,400);
});
test('approved poster offers PNG download and no WhatsApp contacts',()=>{
 assert.match(html,/id="open-kartela"/);assert.match(html,/Areatzako frontoia/);
 assert.match(html,/id="download-kartela"/);assert.doesNotMatch(html,/kartela-whatsapp|wa\.me|605751581|659284183|699783197/);
});
