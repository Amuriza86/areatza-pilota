import test from 'node:test';
import assert from 'node:assert/strict';
import { clean, options, parseCalendar, collectCalendars } from '../worker/calendar.js';
import { createWorker } from '../worker/handler.js';
const category = { id:'6175', name:'Test category' };
const selector = '<select id="selCompeticion"><option value="6175" selected>Test category</option></select>';
const phase = '<select id="selFase"><option value="1" selected>LIGAXKA</option><option value="2">FINAL</option></select>';
const row = (home, away, date='2026/11/15 10:30', score='-') => `<tr>${[date,'2','AREATZA',home,away,score].map(s=>`<td>${s}</td>`).join('')}</tr>`;
const calendar = (rows) => `<table><tr><th>Multzoa: 1.TALDEA</th></tr><tr><td>Data/Ordua</td></tr><tr><td>Jardunaldia: 3</td></tr>${rows}</table>`;
const page = selector + phase + calendar(row('AREATZA XX','IGORRE') + row('OTHER','OTHER'));

test('HTML cleaning and selection preserve source labels',()=>{
  assert.equal(clean('<script>bad()</script><b>A&nbsp; &amp; &#209;</b>'),'A & Ñ');
  assert.deepEqual(options(selector,'selCompeticion'),[{...category,selected:true}]);
  assert.deepEqual(options(selector,'missing'),[]);
});
test('calendar includes club fixtures and rests, missing schedules and scores',()=>{
  const parsed = parseCalendar(calendar(row('AREATZA XX','OTHER')+row('Atsedena','AREATZA YY','2026/11/22')+row('OTHER','OTHER')+row('AREATZA ZZ','OTHER','2026/11/29 09:00','22-18')),category);
  assert.equal(parsed.groups,1); assert.equal(parsed.games.length,3);
  assert.equal(parsed.games[0].date,'2026-11-15'); assert.equal(parsed.games[0].time,'10:30');
  assert.equal(parsed.games[0].round,'3'); assert.equal(parsed.games[0].group,'1.TALDEA');
  assert.equal(parsed.games[1].rest,true); assert.equal(parsed.games[1].time,'');
  assert.equal(parsed.games[2].score,'22-18');
});
test('collector loads additional LIGAXKA with POST, deduplicates and counts groups',async()=>{
  const multi=page.replace('</select><table>','<option value="3">LIGAXKA 2</option></select><table>');
  const requests=[];
  const data=await collectCalendars(async(url,init)=>{requests.push([url,init]);return new Response(multi);});
  assert.equal(requests.length,2); assert.equal(requests[1][1].method,'POST');
  assert.equal(requests[1][1].body.get('selFase'),'3');
  assert.equal(data.ligaxkas,2); assert.equal(data.groups,2); assert.equal(data.games.length,2);
});
test('collector rejects incomplete category responses instead of publishing partial data',async()=>{
  const two=page.replace('</select>','<option value="6176">Second</option></select>');
  await assert.rejects(collectCalendars(async url=>url.includes('6176')?new Response('error',{status:503}):new Response(two)),/Second/);
  await assert.rejects(collectCalendars(async()=>new Response('login page')),/Egutegia/);
});
test('routes, response headers and cache expiry',async()=>{
  let count=0,time=0; const worker=createWorker('<html>test</html>',async()=>({games:[],iteration:++count}),()=>time);
  const request=path=>new Request('https://local.test'+path);
  const root=await worker.fetch(request('/')); assert.equal(root.status,200);
  assert.equal(root.headers.get('content-type'),'text/html; charset=utf-8');
  assert.equal(root.headers.get('x-content-type-options'),'nosniff');
  assert.equal((await worker.fetch(request('/missing'))).status,404);
  assert.equal((await (await worker.fetch(request('/api/matches'))).json()).iteration,1);
  time=60000; await worker.fetch(request('/api/matches')); assert.equal(count,1);
  time=60001; const fresh=await worker.fetch(request('/api/matches')); assert.equal(count,2);
  assert.equal(fresh.headers.get('cache-control'),'no-store');
});
test('failed refresh returns 502 and does not replace last good cache',async()=>{
  let fail=false,time=0; const worker=createWorker('',async()=>{if(fail)throw new Error('offline');return {games:[]};},()=>time);
  const req=new Request('https://test/api/matches'); await worker.fetch(req);
  time=60001; fail=true; const response=await worker.fetch(req);
  assert.equal(response.status,502);assert.equal((await response.json()).error,'offline');
  fail=false; assert.equal((await worker.fetch(req)).status,200);
});

test('player initial annotations do not create additional teams or change fixture IDs',()=>{
  const basic=parseCalendar(calendar(row('AREATZA XX','OTHER')),category).games[0];
  const decorated=parseCalendar(calendar(row('AREATZA XX<div style="font-size:10px"><span>X,&nbsp;Y.</span><br><span>Z,&nbsp;W.</span></div>','OTHER<div><span>Q,&nbsp;R.</span></div>')),category).games[0];
  assert.equal(decorated.home,'AREATZA XX'); assert.equal(decorated.away,'OTHER');
  assert.equal(decorated.id,basic.id);
});
