# Resumen de partidos por frontón al abrir la web

La página conserva su actualización inicial de `/api/matches`. Solo si finaliza correctamente, abre un diálogo con los datos recibidos. Un fallo mantiene el aviso existente y no abre automáticamente el diálogo con la copia anterior.

El resumen está en euskera, como el resto de la página. Muestra por defecto el fin de semana próximo o en curso, de viernes a domingo, según la fecha de Madrid; omite los días anteriores al actual. El selector permite mostrar todos los partidos próximos. No depende de los filtros del calendario principal, ni los modifica.

Agrupa los frontones sin distinguir mayúsculas ni espacios redundantes. Ordena los partidos por fecha, hora y orden de partido; muestra categoría, jornada, equipos y los datos pendientes. Los partidos sin frontón figuran en un grupo aparte, al final. Excluye los descansos.

Se puede cerrar mediante la cruz, el botón «Ikusi egutegia» o Escape del diálogo nativo. «Pilotalekuka», junto al botón de exportación, permite volver a abrirlo. Una actualización manual no vuelve a abrir automáticamente un diálogo ya cerrado.

## Validación

14 pruebas automatizadas superadas. Las cinco nuevas ejecutan los scripts reales de la página sobre jsdom: secuencia de actualización, respuesta fallida, agrupación y orden, datos pendientes, cambios de periodo, cierre/reapertura, fechas de fin de semana y cambio de día en Madrid, ausencia de partidos y escape de texto externo.

jsdom simula showModal/close; no valida el foco nativo, la distribución visual ni el gesto de cierre en iOS. El navegador de pruebas no permite abrir el archivo local de vista previa. Queda pendiente comprobar el diálogo en un navegador real, incluido iPhone. El empaquetado de Wrangler con --dry-run se ha completado sin publicar.

Esta propuesta parte de la rama de recuperación; su diff añade solo la función de resumen, pruebas y documentación. No incorpora la recuperación a main ni modifica Cloudflare. Los nombres y el destino de despliegue conservan el comportamiento de esa rama base; resolverlos antes de publicar sobre la web actual.
