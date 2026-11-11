// Recovered from the compiled Worker supplied by the project owner.
export const SOURCE = 'https://bizkaiapilota.eus/pub/competicion.asp?idioma=eu&idCompeticion=6175';
export function clean(s) {
  return s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/\s+/g, ' ').trim();
}
// Federation team cells append player initials inside a presentation div.
// Keep the team label alone so IDs, filters and team counts remain stable.
export function teamCell(html) {
  return clean(html.replace(/<div\b[^>]*>[\s\S]*?<\/div>/gi, ''));
}
export function options(html, id) {
  const s = [...html.matchAll(/<select\b([^>]*)>([\s\S]*?)<\/select>/gi)].find(m => m[1].includes('id="' + id + '"'));
  return s ? [...s[2].matchAll(/<option\b[^>]*value="(\d+)"[^>]*>([\s\S]*?)<\/option>/gi)].map(m => ({ id: m[1], name: clean(m[2]), selected: /\bselected\b/i.test(m[0]) })) : [];
}
export function parseCalendar(html, category, phase = 'LIGAXKA') {
  const games = [];
  let groups = 0;
  for (const table of html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)) {
    if (!/Data\/Ordua/.test(table[1])) continue;
    groups++;
    const heading = clean((table[1].match(/<th[^>]*>([\s\S]*?)<\/th>/i) || [])[1] || '');
    const group = (heading.split(/Multzoa\s*:/i)[1] || 'TALDE BAKARRA').trim();
    let round = '';
    for (const row of table[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const text = clean(row[1]);
      const roundMatch = text.match(/Jardunaldia:\s*(\d+)/i);
      if (roundMatch) { round = roundMatch[1]; continue; }
      const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((m, index) => (index === 3 || index === 4) ? teamCell(m[1]) : clean(m[1]));
      if (cells.length < 6 || !/^\d{4}\/\d{2}\/\d{2}/.test(cells[0])) continue;
      if (!/\bAREATZA\b/i.test(cells[3] + ' ' + cells[4])) continue;
      const [date, time = ''] = cells[0].split(' ');
      const rest = /atsedena|descans/i.test(cells[3] + ' ' + cells[4]);
      games.push({ id: [category.id, phase, group, round, cells[3], cells[4]].join('|'), category: category.name, categoryId: category.id, phase, group, round, date: date.replaceAll('/', '-'), time, order: cells[1], court: cells[2], home: cells[3], away: cells[4], score: cells[5] === '-' ? '' : cells[5], rest, source: 'https://bizkaiapilota.eus/pub/competicion.asp?idioma=eu&idCompeticion=' + category.id });
    }
  }
  return { games, groups };
}
export async function collectCalendars(fetcher = globalThis.fetch) {
  const get = async (url, init = {}) => {
    const r = await fetcher(url, { ...init, signal: AbortSignal.timeout(18000) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const t = await r.text();
    if (!t.includes('selCompeticion')) throw new Error('Egutegia ez dago eskuragarri');
    return t;
  };
  const first = await get(SOURCE);
  const cats = options(first, 'selCompeticion');
  if (!cats.length) throw new Error('Ez da kategoriarik aurkitu');
  const results = await Promise.allSettled(cats.map(async c => {
    const page = c.id === '6175' ? first : await get('https://bizkaiapilota.eus/pub/competicion.asp?idioma=eu&idCompeticion=' + c.id);
    const phases = options(page, 'selFase').filter(p => /LIGAXKA/i.test(p.name));
    if (!phases.length) throw new Error('Ez dago ligaxkarik kategoria honetan: ' + c.name);
    const sets = [];
    for (const phase of phases) {
      const h = phase.selected ? page : await get('https://bizkaiapilota.eus/pub/competicion.asp?idioma=eu', { method: 'POST', body: new URLSearchParams({ selCompeticion: c.id, selFase: phase.id }) });
      const parsed = parseCalendar(h, c, phase.name);
      if (!parsed.groups) throw new Error('Ezin izan da kategoria hau irakurri: ' + c.name);
      sets.push(parsed);
    }
    return { games: sets.flatMap(s => s.games), groups: sets.reduce((n, s) => n + s.groups, 0), ligaxkas: phases.length };
  }));
  const failed = results.flatMap((r, i) => r.status === 'rejected' ? [cats[i].name] : []);
  if (failed.length) throw new Error('Ezin izan dira kategoria guztiak kontsultatu: ' + failed.join(', '));
  const ok = results.map(r => r.value);
  const games = [...new Map(ok.flatMap(r => r.games).map(g => [g.id, g])).values()].sort((a,b) => (a.date + ' ' + a.time).localeCompare(b.date + ' ' + b.time));
  return { games, categories: cats.map(({id,name}) => ({id,name})), groups: ok.reduce((n,r) => n+r.groups,0), ligaxkas: ok.reduce((n,r) => n+r.ligaxkas,0), updatedAt: new Date().toISOString(), source: SOURCE };
}
