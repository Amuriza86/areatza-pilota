# Areatza Pilota

Agenda en euskera de los partidos del club: calendario, filtros, exportación ICS y resumen por frontón tras la actualización inicial.

## Desarrollo y comprobaciones

Requisitos: Node.js 22 o superior y npm.

```sh
npm ci
npm test
npm run build
npm run dev
```

`npm run build` ejecuta Wrangler con `--dry-run`: prepara y comprueba el paquete sin publicarlo. La compilación consulta la web pública actual para conservar las etiquetas de los nueve equipos. Si no puede recuperarlas todas, falla antes de publicar. Para una comprobación local reproducible puede indicarse `TEAM_NAMES_SOURCE_FILE` con una copia HTML de esa web.

## Publicación

Cloudflare está conectado al repositorio y usa `main` como rama de producción, con el comando `npx wrangler deploy`. Incorporar cambios a main puede iniciar la publicación automática. La configuración apunta al Worker `areatza-pilota` y conserva la fecha de compatibilidad 2026-10-21.

Wrangler ejecuta `scripts/preserve-team-names.mjs` antes de empaquetar: genera `.generated/index.js` con las etiquetas recuperadas de la web actual. Ese directorio está excluido de Git; no subir sus contenidos. El Worker utiliza estos nombres como respaldo, y permite sustituirlos mediante la configuración privada `TEAM_NAMES_JSON`. No se necesitan credenciales para leer el HTML público existente.

No guardar nombres personales, credenciales o tokens en el repositorio público. Las comprobaciones y las copias privadas de recuperación se describen en [la documentación de migración](docs/migration.md).

## Estructura

- `worker/index.js`: entrada original y página HTML importada como texto.
- `worker/calendar.js`: análisis y consulta de los calendarios de la federación.
- `worker/handler.js`: rutas, caché de 60 segundos y etiquetas privadas.
- `web/index.html`: interfaz y resumen por frontón.
- `scripts/preserve-team-names.mjs`: preparación de las etiquetas antes del despliegue.
- `test/`: pruebas aisladas del servidor y la interfaz.

Véanse [comportamiento del resumen por frontón](docs/court-summary.md) y [publicación autorizada](docs/publication.md).
