import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM, VirtualConsole} from 'jsdom';
const html=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
const game=(id,date,court,time='10:00',rest=false)=>({id,date,court,time,rest,home:'AREATZA XX',away:'OTHER',category:'Test category',categoryId:'6175',round:'3',group:'TEST',order:'1',source:'https://example.test/'});
const fixture={games:[game('past','2026-11-08','OLD'),game('friday','2026-11-13','AREATZA','16:45'),game('sun','2026-11-15',' areatza '),game('unknown','2026-11-15','  ',''),game('other','2026-11-15','BILBAO'),game('rest','2026-11-15','REST','',true),game('later','2026-11-22','LATER')],categories:[{id:'6175',name:'Test category'}],groups:1,updatedAt:'2026-11-11T10:00:00Z'};
function createPage({date='2026-11-11T10:00:00Z',fetcher}={}){
 let resolveFetch;const pending=new Promise(resolve=>resolveFetch=resolve);const errors=[];
 const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e));
 const page=new JSDOM(html,{runScripts:'dangerously',url:'https://local.test/',virtualConsole,beforeParse(w){
  const RealDate=w.Date;w.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[date]));}static now(){return new RealDate(date).getTime();}};
  w.fetch=fetcher||(()=>pending);
  // jsdom has no native modal implementation; test app sequencing/rendering here.
  w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
 }});
 const get=id=>page.window.document.getElementById(id);
 return {page,get,errors,resolveFetch:(data=fixture)=>resolveFetch({ok:true,json:async()=>data})};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
test('initial summary waits for successful refresh and uses updated games grouped by court',async()=>{
 const {page,get,resolveFetch,errors}=createPage();
 assert.equal(get('court-dialog').open,false); assert.equal(get('refresh').disabled,true);
 resolveFetch();await settle();
 assert.equal(get('court-dialog').open,true);assert.equal(get('refresh').disabled,false);
 const groups=[...get('court-summary').querySelectorAll('h3')].map(n=>n.textContent);
 assert.deepEqual(groups,['AREATZA2 partida','BILBAO1 partida','Pilotalekua zehaztu gabe1 partida']);
 const summary=get('court-summary').textContent;
 assert.ok(summary.includes('16:45'));assert.ok(summary.includes('Ordua zehaztu gabe'));
 assert.ok(!summary.includes('OLD'));assert.ok(!summary.includes('REST'));assert.ok(!summary.includes('LATER'));
 assert.equal(errors.length,0);page.window.close();
});
test('failed initial refresh keeps the modal closed and displays the fallback warning',async()=>{
 const {page,get}=createPage({fetcher:async()=>({ok:false,json:async()=>({error:'offline'})})});await settle();
 assert.equal(get('court-dialog').open,false);assert.match(get('notice').textContent,/Ezin izan/);assert.equal(get('refresh').disabled,false);page.window.close();
});
test('scope switch includes later fixtures, close restores scrolling and summary can reopen',async()=>{
 const {page,get,resolveFetch}=createPage();resolveFetch();await settle();
 get('court-period').value='upcoming';get('court-period').dispatchEvent(new page.window.Event('change'));
 assert.equal(get('court-summary').querySelectorAll('li').length,5);
 assert.ok(get('court-summary').textContent.includes('LATER'));
 get('close-courts').click();assert.equal(get('court-dialog').open,false);assert.ok(!page.window.document.body.classList.contains('court-dialog-open'));
 get('open-courts').click();assert.equal(get('court-dialog').open,true);get('done-courts').click();assert.equal(get('court-dialog').open,false);
 await page.window.refresh();assert.equal(get('court-dialog').open,false);page.window.close();
});
test('weekend calculation handles Sunday, Monday, year change and Madrid midnight',()=>{
 const {page}=createPage();
 for(const [date,start,end] of [['2026-11-15','2026-11-13','2026-11-15'],['2026-11-16','2026-11-20','2026-11-22'],['2027-01-01','2027-01-01','2027-01-03']]){
 const actual=page.window.weekendRange(date);assert.equal(actual.start,start);assert.equal(actual.end,end);
 }page.window.close();
 const madrid=createPage({date:'2026-11-15T23:30:00Z'});assert.equal(madrid.page.window.eval('today()'),'2026-11-16');madrid.page.window.close();
});
test('empty weekend is explicit, and court/team strings are escaped',async()=>{
 const {page,get,resolveFetch}=createPage();resolveFetch({...fixture,games:[game('far','2026-11-22','<img src=x onerror=alert(1)>')]});await settle();
 assert.match(get('court-summary').textContent,/Ez dago asteburu/);
 get('court-period').value='upcoming';get('court-period').dispatchEvent(new page.window.Event('change'));
 assert.equal(get('court-summary').querySelector('img'),null);assert.match(get('court-summary').textContent,/<IMG/);page.window.close();
});
