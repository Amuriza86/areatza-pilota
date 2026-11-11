import test from 'node:test';
import assert from 'node:assert/strict';
import {TEAM_CODES,parseTeamNames,makeWrapper} from '../scripts/preserve-team-names.mjs';
test('production build preserves all team labels without requiring real labels in Git',()=>{
 const names=Object.fromEntries(TEAM_CODES.map((code,i)=>[code,'Example '+i]));
 const restored=parseTeamNames('<script>const TEAM_NAMES='+JSON.stringify(names)+';</script>');
 assert.deepEqual(restored,names);
 const code=makeWrapper(restored);assert.ok(code.includes('TEAM_NAMES_JSON'));assert.ok(code.includes("../worker/index.js"));
});
test('production build refuses missing or incomplete team labels',()=>{
 for(const html of ['', 'const TEAM_NAMES={};', 'const TEAM_NAMES=null;', 'const TEAM_NAMES={bad json};'])assert.throws(()=>parseTeamNames(html));
});
