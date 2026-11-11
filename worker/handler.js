import { collectCalendars } from './calendar.js';

// Labels live in private runtime configuration, never in the public repository.
export function pageWithTeamNames(html, rawNames) {
  let names = {};
  try {
    const value = JSON.parse(rawNames || '{}');
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      names = Object.fromEntries(Object.entries(value)
        .filter(([code, label]) => /^AREATZA [A-Z0-9]+$/i.test(code) && typeof label === 'string' && label.trim())
        .map(([code, label]) => [code.toUpperCase(), label.trim().slice(0, 120)]));
    }
  } catch { /* Keep team codes when configuration is absent or invalid. */ }
  const safeJSON = JSON.stringify(names).replace(/[<>&\u2028\u2029]/g,
    c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
  return html.replace('const TEAM_NAMES={};', 'const TEAM_NAMES=' + safeJSON + ';');
}

// Each instance owns its in-memory, 60-second cache, as in the original Worker.
export function createWorker(html, collect = collectCalendars, now = Date.now) {
  let cached = null;
  return { async fetch(request, env = {}) {
    const url = new URL(request.url);
    if (url.pathname === '/api/matches') {
      try {
        if (!cached || now() - cached.at > 60000) {
          const data = await collect();
          cached = { at: now(), data };
        }
        return Response.json(cached.data, { headers: { 'Cache-Control': 'no-store' } });
      } catch (e) {
        return Response.json({ error: e.message }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
      }
    }
    if (url.pathname !== '/') return new Response('Ez da aurkitu', { status: 404 });
    return new Response(pageWithTeamNames(html, env.TEAM_NAMES_JSON), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' } });
  } };
}
