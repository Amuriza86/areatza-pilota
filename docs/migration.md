# Recuperación del 11 de noviembre de 2026

## Procedencia

El propietario facilitó por chat el JavaScript compilado de `index.js` del Worker. Se recuperó la lógica del servidor a partir de ese texto, eliminando los ayudantes del empaquetador `__name` / `__defProp`. Se separaron análisis, rutas y entrada en tres módulos. El HTML se descargó mediante una petición de lectura a https://areatza-pilota.areatza-pilota.workers.dev/ y se conserva su interfaz, estilos, imágenes y scripts.

Esta reconstrucción NO es una exportación íntegra ni un respaldo byte a byte del Worker del panel. No se dispone del árbol original de fuentes ni de `index.js.map`. El HTML público y el texto facilitado podrían corresponder a versiones distintas; no se ha demostrado identidad exacta de ambos. La copia privada conserva el HTML descargado sin modificar y una descripción de su procedencia. El historial de Git conserva esta versión reconstruida.

## Cambios deliberados

- `TEAM_NAMES` vacío para evitar publicar nombres personales en el repositorio público. La versión propuesta muestra los códigos federativos. No desplegar sin revisar esta diferencia.
- `collectCalendars` admite un fetch inyectable; por defecto utiliza el fetch del runtime.
- La caché está encapsulada en una instancia del manejador para permitir pruebas aisladas, manteniendo duración y comportamiento de errores.
- Configuración local con nombre de Worker independiente. Fecha de compatibilidad, ausencia de flags, logs/trazas desactivados y cron vacío contrastados con capturas de producción aportadas por el propietario.
- Se mantiene la copia inicial histórica con fecha `2026-10-21T04:17:09.874Z`. La página intenta actualizar al abrirse; si falla muestra esa copia con aviso. No presentar sus horarios como actuales.

## Configuración contrastada con capturas del propietario

Capturas de la pestaña Configuración del entorno Producción, aportadas el 11 de noviembre de 2026. No implican acceso directo del agente al panel.

| Ajuste | Valor visible |
| --- | --- |
| Nombre del Worker | `areatza-pilota` |
| Variables y secretos de runtime | Tabla vacía |
| Vinculaciones | Sin vinculaciones conectadas |
| Workers Logs / Workers Traces / Problemas | Desactivados |
| Destinos de exportación de telemetría | Ninguno disponible |
| Ubicación | Predeterminado |
| Fecha de compatibilidad | `2026-10-21` |
| Indicadores de compatibilidad | Campo vacío |
| Caché del panel | Desactivado |
| Activadores cron | Ninguno configurado |
| Consumidores de Queues | Ninguno configurado |
| Activadores de email | Ninguna regla envía correo al Worker |

La caché desactivada del panel es un ajuste distinto de la caché de 60 segundos en memoria que implementa el código; se conserva esta última. El nombre del Worker de pruebas sigue siendo `areatza-pilota-migration-preview`.

Pendiente: rutas y dominios, límites, despliegues/versiones e integración Git. La captura de Compilaciones muestra opciones para conectar proveedores, pero no basta para acreditar toda la configuración de despliegue. El botón Crear token no demuestra la ausencia de tokens existentes; no se han solicitado ni creado credenciales.

## Límites heredados

Se eliminan los bloques `div` de anotaciones de jugadores dentro de las celdas de equipo. En la fuente real estos bloques añadían iniciales al código del equipo y producían equipos duplicados en filtros y estadísticas. Una prueba verifica que las anotaciones no cambien el identificador del partido.

El análisis de HTML mediante expresiones regulares depende del marcado concreto de la federación. Se conserva la selección de fases cuyo nombre contiene LIGAXKA y el rechazo de la actualización completa si falla alguna categoría. La caché es por instancia, no persistente. No se ha cambiado el tratamiento de caracteres del sitio externo ni la política de exportación ICS.

Las pruebas automatizadas usan fixtures sintéticos, sin escribir en Cloudflare ni en la federación. La comprobación de scripts no sustituye una revisión visual en móvil y una importación real del ICS en iPhone.

## Validación ejecutada

Comprobaciones del 11 de noviembre de 2026:

- `npm test`: 9 pruebas superadas, incluida la estabilidad de equipos e IDs cuando la federación añade iniciales de jugadores.
- `npm run build`: empaquetado correcto con Wrangler 4.160.0 y `--dry-run`; no se publicaron recursos.
- Web pública en Chromium de escritorio: diseño revisado visualmente y controles de equipo, jornada, periodos, descansos, búsqueda sin resultados y restablecimiento comprobados. No se ha verificado un iPhone real ni un tamaño móvil. Estas comprobaciones corresponden a producción; la corrección del lector solo está en la rama.
- Actualización real en la web pública: aviso de éxito para 6 categorías y 8 grupos; `/api/matches` respondió HTTP 200 con 60 registros (58 partidos y 2 descansos).
- Lector corregido contrastado con las 6 páginas reales de la federación mediante un adaptador HTTP de curl: 60 registros, 60 IDs únicos y 9 equipos del club, frente a los 20 rótulos distintos del endpoint existente. No es una prueba del fetch en el runtime Cloudflare.
- Descargas reales con el botón de la web: un equipo (5 partidos) y todos (58 partidos, excluidos descansos aunque estén visibles). Ambos archivos se analizaron con `icalendar` sin errores; UIDs únicos, fechas de día completo con fin posterior, zona Europe/Madrid y líneas de como máximo 73 octetos. Esto no acredita una importación real en Calendario de Apple.
- `npm run dev` de Wrangler: falla en este entorno con `uv_interface_addresses ... Unknown system error 1`. Un servidor auxiliar Node arrancó, pero el navegador remoto no pudo acceder a su localhost. No se atribuye a estas pruebas una validación visual de la rama ni una prueba del runtime de Cloudflare.
- Cloudflare: acceso directo bloqueado por inicio de sesión; los ajustes indicados arriba se han verificado mediante capturas del propietario, sin cambiarlos en el panel. Los demás siguen pendientes.

No se ha desplegado ni modificado producción ni la rama main.
