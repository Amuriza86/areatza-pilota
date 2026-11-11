# Areatza Pilota

Agenda en euskera de los partidos del club. Cloudflare Worker con una página HTML y un endpoint `/api/matches` que consulta las ligaxkas de la federación.

## Desarrollo local

Requisitos: Node.js 22 o superior y npm.

```sh
npm ci
npm test
npm run build
npm run dev
```

Abrir la URL local que indique Wrangler (habitualmente http://127.0.0.1:8787). El desarrollo usa el runtime local; actualizar partidos realiza consultas de lectura al sitio público de la federación. `npm run build` solo empaqueta mediante `--dry-run`; no publica.

## Estructura

- `worker/index.js`: entrada y página HTML importada como texto.
- `worker/calendar.js`: limpieza, selectores, análisis y consulta de calendarios.
- `worker/handler.js`: rutas y caché en memoria durante 60 segundos.
- `web/index.html`: página recuperada, estilos, escudo embebido, filtros y exportación ICS.
- `test/`: pruebas aisladas con respuestas simuladas y comprobaciones del frontend.
- `docs/migration.md`: procedencia, diferencias y comprobaciones pendientes.

Sin dependencias de ejecución externas. Wrangler es una dependencia de desarrollo fijada en `package-lock.json`. El código recuperado no utiliza bindings ni secretos; esto no confirma la configuración remota.

## Privacidad

El repositorio es público. Se ha vaciado `TEAM_NAMES` para mostrar los códigos de equipo. No introducir nombres de menores, credenciales, `.env`, `.dev.vars` ni tokens en Git. La copia privada de recuperación contiene la página original; no subirla al repositorio. La web en producción no se ha cambiado.

## Despliegue manual

No hay integración ni workflow de despliegue automático. La configuración incluida usa el nombre independiente `areatza-pilota-migration-preview`; no representa la configuración de producción.

Antes de cualquier publicación: obtener autorización del propietario, autenticar Cloudflare (`npx wrangler login`), comprobar cuenta, nombre del Worker, bindings, variables, rutas, fecha y flags de compatibilidad y conservar una versión recuperable. Validar primero en un Worker independiente. Tras autorización, la publicación manual con esta configuración sería `npx wrangler deploy` y afectaría únicamente al nombre configurado: revisar siempre ese nombre y la cuenta antes de ejecutar.

Para producción, preparar una configuración verificada aparte y revisarla antes de publicar. No cambiar el nombre al Worker existente como parte de esta migración. No se han ejecutado comandos de publicación.

Referencia: [comandos de Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/).

## Resumen por frontón

Tras la actualización inicial correcta se abre un resumen de partidos agrupados por frontón. Permite alternar entre el fin de semana y todos los próximos partidos, cerrarlo y volver a abrirlo con «Pilotalekuka». Véanse [comportamiento y validación](docs/court-summary.md).
