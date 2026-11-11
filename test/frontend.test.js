import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
test('recovered frontend scripts compile and initial fixtures are consistent',()=>{
  assert.equal(scripts.length,2);
  scripts.forEach(s=>new vm.Script(s));
  const initial=vm.runInNewContext(scripts[0]+'; INITIAL');
  assert.equal(initial.categories.length,6);assert.equal(initial.groups,8);
  assert.ok(initial.games.length>0);
  assert.equal(new Set(initial.games.map(g=>g.id)).size,initial.games.length);
  for(const game of initial.games) assert.ok(initial.categories.some(c=>c.id===game.categoryId));
});
test('public source uses team codes and retains filters, update and ICS controls',()=>{
  assert.ok(html.includes('const TEAM_NAMES={};'));
  for(const id of ['category','team','round','search','rests','refresh','export','games']) assert.ok(html.includes(`id="${id}"`),id);
  assert.ok(html.includes('BEGIN:VCALENDAR'));
});
