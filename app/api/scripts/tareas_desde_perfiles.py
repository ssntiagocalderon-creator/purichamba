"""Arma app/datos/tareas.csv con las tareas (elementos de competencia) de los perfiles del MTPE (issue #6, D-058).

Lee datos/procesados/mtpe_perfiles_detalle.csv (C-71) y, para el enlace, la página de gob.pe de cada perfil en
datos/fuentes/mtpe_perfiles/FUENTES.md. Los textos simples de las tareas del ejemplo de la demo son los del mockup;
las demás muestran el texto oficial.

Uso (desde la raíz del repo): python3 -I app/api/scripts/tareas_desde_perfiles.py
"""
import csv
import re

DETALLE = 'datos/procesados/mtpe_perfiles_detalle.csv'
FUENTES = 'datos/fuentes/mtpe_perfiles/FUENTES.md'
SALIDA = 'app/datos/tareas.csv'
SIMPLES = {
    'G2347002-1/E1': 'Abrir la caja',
    'G2347002-1/E2': 'Cobrar y entregar lo que se compró',
    'G2347002-1/E3': 'Contar el dinero y cuadrar la caja',
    'K2764001-1/E1': 'Abrir la caja',
    'K2764001-1/E2': 'Hacer las operaciones de caja del banco',
    'K2764001-1/E3': 'Cuadrar y cerrar la caja',
}


def main():
    paginas = {}
    for linea in open(FUENTES, encoding='utf-8'):
        m = re.match(r'\| `([^`]+\.pdf)` \|[^|]*\| \[\d+\]\((https://www\.gob\.pe/[^)]+)\)', linea)
        if m:
            paginas[m.group(1)] = m.group(2)
    filas = []
    for r in csv.DictReader(open(DETALLE, encoding='utf-8')):
        if r['tipo'] != 'elemento':
            continue
        codigo = f"{r['ecl_codigo']}/E{r['elemento']}"
        filas.append([codigo, r['ecl_codigo'], r['texto'], SIMPLES.get(codigo, ''), paginas.get(r['fuente'], '')])
    with open(SALIDA, 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        w.writerow(['codigo_tarea', 'codigo_ecl', 'descripcion', 'texto_simple', 'fuente_url'])
        f.write('# Tareas (elementos de competencia) de los perfiles del MTPE: la app las cuenta una por una (D-058, issue #6).\n')
        f.write('# Se rehace con: python3 -I app/api/scripts/tareas_desde_perfiles.py. Los textos simples los escribe el equipo.\n')
        w.writerows(filas)
    sin_pagina = sum(1 for x in filas if not x[4])
    print(f'{len(filas)} tareas en {SALIDA}; sin página de gob.pe: {sin_pagina}')


if __name__ == '__main__':
    main()
