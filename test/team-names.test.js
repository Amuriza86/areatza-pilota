import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {pageWithTeamNames,createWorker} from '../worker/handler.js';
const html=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
test('private names appear in the main calendar and court summary after refresh',async()=>{
 const labelled=pageWithTeamNames(html,JSON.stringify({'AREATZA XX':'Example Pair'}));
 const record={id:'one',date:'2099-11-15',time:'10:00',court:'AREATZA',home:'AREATZA XX',away:'OTHER',categoryId:'6175',category:'Test',round:'1',group:'TEST',rest:false};
 const dom=new JSDOM(labelled,{runScripts:'dangerously',url:'https://test.invalid',beforeParse(w){
  w.fetch=async()=>({ok:true,json:async()=>({games:[record],categories:[{id:'6175',name:'Test'}],groups:1,updatedAt:new Date().toISOString()})});
  w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 }});
 await new Promise(resolve=>setImmediate(resolve));
 const doc=dom.window.document;
 assert.match(doc.getElementById('games').textContent,/Example Pair/);
 assert.match(doc.getElementById('team').textContent,/Example Pair \(AREATZA XX\)/);
 doc.getElementById('court-period').value='upcoming';doc.getElementById('court-period').dispatchEvent(new dom.window.Event('change'));
 assert.match(doc.getElementById('court-summary').textContent,/Example Pair/);
 dom.window.close();
});
test('absent or invalid configuration preserves team codes',()=>{
 for(const value of [undefined,'bad json','null','[]','42'])assert.equal(pageWithTeamNames('const TEAM_NAMES={};',value),'const TEAM_NAMES={};');
});
test('runtime values cannot terminate scripts and only valid string labels are accepted',()=>{
 const text=pageWithTeamNames('const TEAM_NAMES={};',JSON.stringify({'areatza xx':'</script><img src=x> & "pair"','bad-code':'hidden','AREATZA YY':7}));
 assert.ok(!text.includes('</script>'));
 const parsed=vm.runInNewContext(text+'; TEAM_NAMES');
 assert.equal(parsed['AREATZA XX'],'</script><img src=x> & "pair"');assert.equal(Object.keys(parsed).length,1);
});
test('request-specific runtime names are returned without changing the API response',async()=>{
 const worker=createWorker('const TEAM_NAMES={};',async()=>({games:[]}));
 const response=await worker.fetch(new Request('https://test/'),{TEAM_NAMES_JSON:'{"AREATZA XX":"Example Pair"}'});
 assert.match(await response.text(),/Example Pair/);
 const bare=await worker.fetch(new Request('https://test/'));assert.equal(await bare.text(),'const TEAM_NAMES={};');
 const api=await worker.fetch(new Request('https://test/api/matches'),{TEAM_NAMES_JSON:'{"AREATZA XX":"Example Pair"}'});
 assert.deepEqual(await api.json(),{games:[]});
});
