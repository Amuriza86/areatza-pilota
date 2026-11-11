# Recuperación del 11 de noviembre de 2026

## Procedencia

El propietario facilitó por chat el JavaScript compilado de `index.js` del Worker. Se recuperó la lógica del servidor a partir de ese texto, eliminando los ayudantes del empaquetador `__name` / `__defProp`. Se separaron análisis, rutas y entrada en tres módulos. El HTML se descargó mediante una petición de lectura a https://areatza-pilota.areatza-pilota.workers.dev/ y se conserva su interfaz, estilos, imágenes y scripts.

Esta reconstrucción NO es una exportación íntegra ni un respaldo byte a byte del Worker del panel. No se dispone del árbol original de fuentes ni de `index.js.map`. El HTML público y el texto facilitado podrían corresponder a versiones distintas; no se ha demostrado identidad exacta de ambos. La copia privada conserva el HTML descargado sin modificar y una descripción de su procedencia. El historial de Git conserva esta versión reconstruida.

## Cambios deliberados

- `TEAM_NAMES` vacío para evitar publicar nombres personales en el repositorio público. La versión propuesta muestra los códigos federativos. No desplegar sin revisar esta diferencia.
- `collectCalendars` admite un fetch inyectable; por defecto utiliza el fetch del runtime.
- La caché está encapsulada en una instancia del manejador para permitir pruebas aisladas, manteniendo duración y comportamiento de errores.
- Configuración local nueva con nombre de Worker independiente y fecha de compatibilidad provisional. No deducida de producción.
- Se mantiene la copia inicial histórica con fecha `2026-10-21T04:17:09.874Z`. La página intenta actualizar al abrirse; si falla muestra esa copia con aviso. No presentar sus horarios como actuales.

## Pendiente de Cloudflare

No se ha podido iniciar sesión en el panel. Revisar fecha y flags de compatibilidad, variables/secretos (solo nombres), bindings KV/D1/R2 u otros, rutas/dominios, triggers, límites, observabilidad, deployments/versiones y cualquier integración Git existente. No se han consultado ni modificado estos ajustes. El código no prueba su ausencia.

## Límites heredados

El análisis de HTML mediante expresiones regulares depende del marcado concreto de la federación. Se conserva la selección de fases cuyo nombre contiene LIGAXKA y el rechazo de la actualización completa si falla alguna categoría. La caché es por instancia, no persistente. No se ha cambiado el tratamiento de caracteres del sitio externo ni la política de exportación ICS.

Las pruebas automatizadas usan fixtures sintéticos, sin escribir en Cloudflare ni en la federación. La comprobación de scripts no sustituye una revisión visual en móvil y una importación real del ICS en iPhone. Antes del despliegue también conviene contrastar una jornada con la federación en vivo.

## Validación ejecutada

- `npm test`: 8 pruebas superadas el 2026-11-11.
- `npm run build`: empaquetado correcto con Wrangler 4.160.0 y `--dry-run`; no se publicaron recursos.
- `npm run dev`: intentado, pero el entorno de trabajo devolvió `uv_interface_addresses ... Unknown system error 1` antes de arrancar. No se pudo comprobar la vista local ni las rutas mediante HTTP en el runtime de Cloudflare.
- Lectura de la web pública completada. No se verificó una actualización real del endpoint de partidos ni se probó importación ICS en un dispositivo.
