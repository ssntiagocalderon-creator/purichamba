#!/bin/sh
# Detalle de los perfiles del MTPE (elementos, criterios de desempeño y conocimientos) a partir de los PDF oficiales.
# Requiere macOS: el texto se saca con PDFKit, porque varios PDF usan fuentes que otros lectores no decodifican.
# Uso, desde la raíz del repositorio: sh datos/scripts/perfiles_mtpe.sh
set -e
F=datos/fuentes/mtpe_perfiles
T=datos/procesados/mtpe_perfiles_texto
B=${TMPDIR:-/tmp}/perfiles_mtpe
mkdir -p "$T" "$B"
swiftc -O -o "$B/pdf_texto" datos/scripts/pdf_texto.swift
swiftc -O -o "$B/pdf_lineas" datos/scripts/pdf_lineas.swift

# 1. Documentos con formato lineal: texto directo.
for f in M2981001_servicios_de_limpieza H2452001_operaciones_de_almacen K2764001_caja_en_entidades_financieras \
         G2347007_ventas G2347008_post_ventas G2347002_caja_en_establecimientos_comerciales; do
  "$B/pdf_texto" "$F/$f.pdf" > "$T/$f.txt"
done
# 2. Trabajador/a del Hogar: tabla "etiqueta | contenido"; se ordena por filas.
"$B/pdf_lineas" "$F/S3497002_trabajador_del_hogar_remunerado.pdf" > "$T/S3497002_trabajador_del_hogar_remunerado.tsv"
python3 -I datos/scripts/perfiles_tablas.py lineal "$T/S3497002_trabajador_del_hogar_remunerado.tsv" "$T/S3497002_trabajador_del_hogar_remunerado.txt"
# 3. Housekeeping: dos elementos lado a lado; se lee por columnas.
"$B/pdf_lineas" "$F/I2555002_operaciones_de_housekeeping.pdf" > "$T/I2555002_operaciones_de_housekeeping.tsv"

python3 -I datos/scripts/perfiles_a_csv.py "$B/lineales.csv" "$T"/M2981001_*.txt "$T"/H2452001_*.txt "$T"/K2764001_*.txt \
  "$T"/G2347007_*.txt "$T"/G2347008_*.txt "$T"/G2347002_*.txt "$T"/S3497002_*.txt
python3 -I datos/scripts/perfiles_tablas.py columnas "$T/I2555002_operaciones_de_housekeeping.tsv" "$B/housekeeping.csv" \
  I2555002 I2555002_operaciones_de_housekeeping.pdf
python3 -I datos/scripts/perfiles_unir.py datos/procesados/mtpe_perfiles_detalle.csv \
  datos/procesados/mtpe_estandares_competencia.json "$B/lineales.csv" "$B/housekeeping.csv"
