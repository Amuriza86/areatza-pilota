import { collectCalendars } from './calendar.js';

// Each instance owns its in-memory, 60-second cache, as in the original Worker.
export function createWorker(html, collect = collectCalendars, now = Date.now) {
  let cached = null;
  return { async fetch(request) {
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
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' } });
  } };
}
