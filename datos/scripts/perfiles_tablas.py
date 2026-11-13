"""Perfiles del MTPE que vienen en tablas: los pasa a texto lineal o a filas del CSV de detalle.

Entrada: líneas con su posición, sacadas con pdf_lineas.swift (página, x0, y0, x1, y1, texto).

Dos casos:
  lineal   Tabla de dos columnas "etiqueta | contenido" (p. ej. Trabajador/a del Hogar): ordena las líneas por
           filas para que cada etiqueta quede seguida de su contenido, y escribe un .txt que lee perfiles_a_csv.py.
  columnas Página apaisada con dos elementos de competencia lado a lado (p. ej. Housekeeping): lee cada columna
           por separado y escribe filas con el mismo formato que perfiles_a_csv.py.

Uso:
  python3 -I perfiles_tablas.py lineal   entrada.lineas.tsv salida.txt
  python3 -I perfiles_tablas.py columnas entrada.lineas.tsv salida.csv perfil fuente.pdf
"""
import csv
import re
import sys


def leer(ruta):
    lineas = []
    for fila in open(ruta, encoding='utf-8'):
        partes = fila.rstrip('\n').split('\t', 5)
        if len(partes) < 6:
            continue
        p, x0, y0, x1, y1, t = partes
        lineas.append((int(p), float(x0), float(y0), float(x1), float(y1), t.strip()))
    return lineas


def lineal(lineas, salida):
    """Agrupa en filas las líneas cuya altura difiere en 3 puntos o menos y las ordena de izquierda a derecha."""
    texto = []
    for pagina in sorted({l[0] for l in lineas}):
        filas = []
        for l in sorted((l for l in lineas if l[0] == pagina), key=lambda l: l[2]):
            if filas and abs(filas[-1][-1][2] - l[2]) <= 3:
                filas[-1].append(l)
            else:
                filas.append([l])
        texto.append(f'=== página {pagina}')
        for fila in filas:
            texto.append(' '.join(l[5] for l in sorted(fila, key=lambda l: l[1])))
    open(salida, 'w', encoding='utf-8').write('\n'.join(texto) + '\n')


def normalizar(s):
    s = re.sub(r'(?<=[a-záéíóúñ)])\d{1,2}(?=[\s,.;:)]|$)', '', s)  # llamadas a notas al pie
    s = s.replace('', '')
    s = re.sub(r'\s+', ' ', s).strip()
    return re.sub(r'\s+([,.;:])', r'\1', s)


ENCABEZADOS = [
    (re.compile(r'^Elemento de Competencia', re.I), 'elemento'),
    (re.compile(r'^Criterios de Desempeño', re.I), 'criterio'),
    (re.compile(r'^Evidencias de Desempeño', re.I), 'desempeno'),
    (re.compile(r'^Evidencias de Conocimiento', re.I), 'conocimiento'),
]
FICHA = re.compile(r'^(Nivel de Competencia|Estándar de competencia laboral \d|Sector|Familia|División|Código|Versión|'
                   r'Aprobación|Vigencia|ACTIVIDADES|SERVICIO DE|Hoteles|Actividades de|Página \d+ de \d+|'
                   r'Fecha de actualización)')
NOTA = re.compile(r'^\d{1,2} [A-ZÁÉÍÓÚ]')


def columnas(lineas, salida, perfil, fuente, corte_x=380):
    """Lee cada estándar por columnas: la izquierda es el elemento 1 y la derecha, el elemento 2."""
    filas, vistos = [], []
    ecl, nivel, estado, items = None, '', {}, {}

    def cerrar():
        for col, n_el in (('L', 1), ('R', 2)):
            datos = items.get(col)
            if not datos or not ecl:
                continue
            filas.append([perfil, ecl, nivel, n_el, 'elemento', 0, normalizar(' '.join(datos['elemento'])), fuente])
            for tipo in ('criterio', 'conocimiento'):
                for k, t in enumerate((normalizar(x) for x in datos[tipo] if normalizar(x)), 1):
                    filas.append([perfil, ecl, nivel, n_el, tipo, k, t, fuente])

    def procesar_linea(x0, t):
        col = 'L' if x0 < corte_x else 'R'
        encabezado = next((tipo for patron, tipo in ENCABEZADOS if patron.match(t)), None)
        if encabezado:
            estado[col] = encabezado
            items.setdefault(col, {'elemento': [], 'criterio': [], 'conocimiento': []})
            return
        tipo = estado.get(col)
        if tipo is None or tipo == 'desempeno':
            return
        datos = items[col]
        if NOTA.match(t) or t.startswith('E: '):
            vistos.append(t)  # nota al pie o firma de página
        elif tipo == 'elemento':
            datos['elemento'].append(t)
        elif tipo == 'criterio':
            if re.match(r'^\d+\.(\s|$)', t):
                datos['criterio'].append(re.sub(r'^\d+\.\s*', '', t))
            elif datos['criterio'] and (x0 > 60 or t[:1].islower() or not datos['criterio'][-1]):
                datos['criterio'][-1] += ' ' + t  # continuación o viñeta interna
            else:
                vistos.append(t)  # subtítulo, p. ej. "Al finalizar su tarea de limpieza:"
        elif tipo == 'conocimiento':
            if t.startswith(('', '-', '•')):
                datos['conocimiento'].append(t)
            elif datos['conocimiento']:
                datos['conocimiento'][-1] += ' ' + t

    for pagina in sorted({l[0] for l in lineas}):
        de_pagina = [l for l in lineas if l[0] == pagina and l[2] >= 40]  # sin la cabecera de página
        # El código del estándar puede caer en la columna derecha: se lee antes que las columnas.
        for l in sorted(de_pagina, key=lambda l: l[2]):
            m = re.search(r'\b' + perfil + r'-(\d)\b', l[5])
            if m:
                cerrar()
                ecl, nivel, estado, items = f'{perfil}-{m.group(1)}', '', {}, {}
            m = re.match(r'^Nivel de Competencia:\s*(\d)', l[5])
            if m:
                nivel = m.group(1)
        fin_y = min((l[2] for l in de_pagina if re.match(r'^Contexto de Desempeño', l[5], re.I)), default=None)
        for p, x0, y0, x1, y1, t in sorted(de_pagina, key=lambda l: (l[1] >= corte_x, l[2])):
            if (fin_y is not None and y0 >= fin_y) or re.search(r'\b' + perfil + r'-\d\b', t) or FICHA.match(t):
                continue
            procesar_linea(x0, t)
        if fin_y is not None:
            estado = {'L': None, 'R': None}
    cerrar()
    with open(salida, 'w', encoding='utf-8', newline='') as f:
        csv.writer(f).writerows(filas)
    if vistos:
        print('omitidos:', vistos)
    print('filas:', len(filas))


if __name__ == '__main__':
    modo = sys.argv[1]
    if modo == 'lineal':
        lineal(leer(sys.argv[2]), sys.argv[3])
    else:
        columnas(leer(sys.argv[2]), sys.argv[3], sys.argv[4], sys.argv[5])
