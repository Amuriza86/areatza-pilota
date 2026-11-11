# Preparación de la publicación autorizada

El propietario autorizó publicar la actualización revisada en la previsualización privada: apertura del resumen por frontón tras la actualización inicial, conservando los nombres de los equipos y la URL habitual.

Cloudflare se conectó manualmente a `Amuriza86/areatza-pilota`, rama main, con compilaciones habilitadas y comando `npx wrangler deploy`, según las capturas del propietario. La última versión pública observada antes de este trabajo fue 33b45281. La conexión impide considerar main una rama sin efectos de publicación.

La configuración de esta propuesta apunta a `areatza-pilota`, con workers.dev y vistas previas activadas, compatibilidad 2026-10-21, sin flags adicionales, sin cron y con observabilidad desactivada, de acuerdo con las capturas. No se configuran rutas o dominios personalizados.

La compilación recupera el mapa de etiquetas del HTML público de la versión actual y exige que los nueve códigos tengan su etiqueta. Las incluye en un módulo generado y excluido de Git. Si la fuente falla o está incompleta, el proceso termina con error antes de publicar. Una variable privada TEAM_NAMES_JSON puede sustituir esas etiquetas en ejecución. De este modo no se publican los nombres en el código fuente de GitHub.

Validación previa: 20 pruebas automatizadas; empaquetado local de Wrangler con --dry-run usando una copia recién descargada de la web actual. La revisión final requiere observar el despliegue de Cloudflare y comprobar el HTML, la actualización API y la ventana en la URL pública. La previsualización privada ya permitió revisar la ventana y los nombres; no sustituye esa comprobación de producción.

La copia privada de recuperación conserva el HTML previo y la reconstrucción del servidor; no es una exportación byte a byte del Worker ni un respaldo de sus ajustes remotos. Si fuera necesario revertir, usar la versión anterior desde el historial de implementaciones de Cloudflare; no se ha eliminado ninguna versión desde este flujo.
