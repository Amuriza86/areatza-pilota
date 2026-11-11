import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
export const SOURCE='https://areatza-pilota.areatza-pilota.workers.dev/';
export const TEAM_CODES=['MI','GI','SL','GA','REP','IU','LTC','UL','AA'].map(code=>'AREATZA '+code);
export function parseTeamNames(html){
 const match=html.match(/const\s+TEAM_NAMES\s*=\s*(\{[\s\S]*?\});/);
 if(!match)throw new Error('No se ha encontrado el mapa de equipos en la web actual. No se publica.');
 const names=JSON.parse(match[1]);
 if(!names||typeof names!=='object'||Array.isArray(names))throw new Error('Mapa de equipos inválido. No se publica.');
 for(const code of TEAM_CODES)if(typeof names[code]!=='string'||!names[code].trim())throw new Error('Faltan etiquetas de equipos. No se publica.');
 return Object.fromEntries(TEAM_CODES.map(code=>[code,names[code]]));
}
export function makeWrapper(names){
 return "// Generated at build time; do not commit.\nimport worker from '../worker/index.js';\nconst namesJSON="+JSON.stringify(JSON.stringify(names))+";\nexport default {fetch(request,env={},ctx){return worker.fetch(request,{...env,TEAM_NAMES_JSON:env.TEAM_NAMES_JSON||namesJSON},ctx);}};\n";
}
export async function build(){
 // The file override is for reproducible local checks; CI reads the current website.
 let html;
 if(process.env.TEAM_NAMES_SOURCE_FILE)html=await readFile(process.env.TEAM_NAMES_SOURCE_FILE,'utf8');
 else{
  const response=await fetch(SOURCE,{signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache'}});
  if(!response.ok)throw new Error('No se puede recuperar la web actual (HTTP '+response.status+'). No se publica.');
  html=await response.text();
 }
 const names=parseTeamNames(html);
 await mkdir(new URL('../.generated/',import.meta.url),{recursive:true});
 await writeFile(new URL('../.generated/index.js',import.meta.url),makeWrapper(names));
 console.log('Etiquetas de los 9 equipos preservadas fuera de Git.');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await build();
