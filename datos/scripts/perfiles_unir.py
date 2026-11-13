"""Une las tablas de detalle de los perfiles del MTPE y marca qué estándares están en la matriz oficial.

Uso: python3 -I perfiles_unir.py salida.csv matriz.json tabla1.csv [tabla2.csv ...]
  matriz.json = datos/procesados/mtpe_estandares_competencia.json (matriz del MTPE del 04-09-2026)
"""
import csv
import json
import sys

salida, matriz, tablas = sys.argv[1], sys.argv[2], sys.argv[3:]
datos = json.load(open(matriz, encoding='utf-8'))
filas_matriz = next(v for v in datos.values() if isinstance(v, list))
en_matriz = {f['codigo_ecl'] for f in filas_matriz}

columnas = ['perfil_codigo', 'ecl_codigo', 'nivel', 'elemento', 'tipo', 'n', 'texto', 'fuente']
filas = []
for tabla in tablas:
    lector = csv.reader(open(tabla, encoding='utf-8'))
    for fila in lector:
        if fila[:2] == columnas[:2]:
            continue  # encabezado
        filas.append(fila + ['sí' if fila[1] in en_matriz else 'no'])

with open(salida, 'w', encoding='utf-8', newline='') as f:
    w = csv.writer(f)
    w.writerow(columnas + ['en_matriz'])
    w.writerows(filas)
ecls = sorted({f[1] for f in filas})
print(f'{len(filas)} filas, {len(ecls)} estándares; fuera de la matriz: {[e for e in ecls if e not in en_matriz]}')
