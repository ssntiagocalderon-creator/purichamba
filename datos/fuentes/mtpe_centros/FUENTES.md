# Centros de certificación de competencias laborales autorizados (MTPE)

Listado oficial tal como se descargó el **26-10-2026** desde las páginas de "Informes y publicaciones" del MTPE en gob.pe. No se edita (regla 2 de `AGENTS.md`). De él salen `datos/procesados/mtpe_centros_certificacion_lima.csv` y las filas de certificación de `app/datos/cursos.csv`, que se rehacen con `app/api/scripts/centros_certificacion.py` (el uso está en su encabezado).

| Archivo | Contenido | Página en gob.pe (fecha del listado) | Archivo original |
|---|---|---|---|
| `listado_cccl_autorizados_2021-2026_16-09-2026.xlsx` | Centros autorizados de 2021 a 2026, una fila por centro y estándar: centro, sede, RUC, código del estándar, número de constancia, fecha de la autorización, dirección, distrito, departamento y contacto. Hojas "CCCL autorizados" y "ECL" | [7581793](https://www.gob.pe/institucion/mtpe/informes-publicaciones/7581793-listado-de-centros-de-certificacion-de-competencias-laborales-autorizados-2021-2026) (16-09-2026) | [enlace](https://cdn.www.gob.pe/uploads/document/file/9238974/7581793-listado-de-cccl-autorizados-2021-2026-16-09-2026.xlsx) |

**Por qué el listado y no el directorio web.** El directorio "Certifícate" (<https://mtpe.trabajo.gob.pe/certificatuscompetencias/certificate/>) es la página para el público, pero al 26-10-2026 está incompleto. En Lima solo muestra centros de limpieza, housekeeping (con los nombres de una versión anterior de sus estándares), ventas y cuidado de la persona en el hogar. No muestra los de almacén, caja en tiendas, caja en entidades financieras ni trabajador/a del hogar, que el listado sí tiene.

**Lo que no se copia.** El CSV procesado y la app no llevan teléfonos ni correos: están en el listado oficial, al que enlaza la app.
