"""Convierte el texto de los perfiles y estándares del MTPE en una tabla de elementos, criterios y conocimientos.

Entrada: archivos .txt sacados de los PDF oficiales con pdf_texto.swift (PDFKit), con el mismo nombre del PDF. Sirve para los documentos
con el formato lineal del MTPE: "Código del Estándar de Competencia Laboral: X" o "Código ECL: X - n",
"Elemento de Competencia n:", "Criterios de desempeño:", "Evidencias de Conocimientos:" y
"Evidencias de Desempeño/Producto:".

Salida (CSV, UTF-8): perfil_codigo, ecl_codigo, nivel, elemento, tipo, n, texto, fuente
  tipo = elemento | criterio | conocimiento; en las filas "elemento", n es 0.

Uso: python3 -I perfiles_a_csv.py salida.csv archivo1.txt [archivo2.txt ...]
"""
import csv
import os
import re
import sys

RE_ECL = re.compile(
    r'Código\s+(?:del\s+Estándar\s+de\s+Competencia\s+Laboral|ECL)\s*:\s*([A-Z]\d{7})\s*[-–]\s*(\d+)')
RE_NIVEL = re.compile(r'Nivel\s+de\s+Competencia\s+Laboral\s*:\s*(\d)')
RE_ELEMENTO = re.compile(r'Elemento\s+de\s+Competencia\s+(\d+)\s*:?\s*(.*?)\s*Criterios\s+de\s+desempeño\s*:', re.S | re.I)
RE_CONOC = re.compile(r'^\s*(?:Evidencias\s+de\s+)?Conocimientos?\s*:', re.I | re.M)
RE_DESEMP = re.compile(r'^\s*(?:Evidencias\s+de\s*\n?\s*)?Desempeño\s*/\s*Producto', re.I | re.M)
RE_FIN_ELEMENTO = re.compile(r'Elemento\s+de\s+Competencia\s+\d+|Contexto\s+de\s+desempeño|Equipamiento\s*/\s*Herramientas|Competencias\s+(?:Básicas|Genéricas)|Código\s+(?:del\s+Estándar|ECL)', re.I)


def limpiar_paginas(texto):
    """Quita marcas de página, números de página y notas al pie (las que se citan con un número pegado a una palabra)."""
    marcas = set(re.findall(r'[A-Za-záéíóúñ)](\d{1,2})(?=[\s,.;:)])', texto))
    salida, en_nota = [], False
    for linea in texto.split('\n'):
        if re.match(r'^=== página \d+', linea):
            en_nota = False
            continue
        if re.match(r'^\s*\d{1,3}\s*$', linea):
            continue
        m = re.match(r'^(\d{1,2}) [A-ZÁÉÍÓÚ]', linea)
        if m and m.group(1) in marcas:
            en_nota = True  # las notas van al pie: lo que sigue hasta el fin de página es parte de ellas
            continue
        if en_nota and not re.match(r'^\s*(-|Elemento|Criterios|Evidencias|Conocimientos|Desempeño)', linea):
            continue
        en_nota = False
        salida.append(linea)
    return '\n'.join(salida)


def normalizar(s):
    s = re.sub(r'(?<=[a-záéíóúñ)])\d{1,2}(?=[\s,.;:)]|$)', '', s)  # llamadas a notas al pie
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'\s+([,.;:])', r'\1', s)
    return s


SUBVINETA = re.compile(r'^o\s+([A-ZÁÉÍÓÚ].*)$')


def vinetas(bloque):
    """Separa una lista de viñetas "- ..." en ítems, uniendo las líneas cortadas.

    Las subviñetas "o ..." (en caja de entidades financieras) se vuelven ítems propios, con el subtítulo que las
    agrupa delante: "Cobro de préstamos: Comunica al usuario el monto a pagar...".
    """
    lineas = [l.strip() for l in bloque.split('\n') if l.strip()]
    items, contexto = [], None
    for i, l in enumerate(lineas):
        m = re.match(r'^[-•]\s*(.+)$', l)
        if m:
            items.append(m.group(1))
            contexto = None
            continue
        m = SUBVINETA.match(l)
        if m:
            items.append((contexto + ': ' if contexto else '') + m.group(1))
            continue
        siguiente = lineas[i + 1] if i + 1 < len(lineas) else ''
        if len(l) <= 80 and l[:1].isupper() and not l.endswith(('.', ',', ';')) and SUBVINETA.match(siguiente):
            contexto = l.rstrip(':').strip()  # subtítulo de un grupo de subviñetas, con o sin dos puntos
            continue
        if items:
            items[-1] += ' ' + l
        else:
            items.append(l)
    return [normalizar(x) for x in items if normalizar(x)]


def procesar(ruta):
    texto = limpiar_paginas(open(ruta, encoding='utf-8').read())
    fuente = re.sub(r'\.txt$', '.pdf', os.path.basename(ruta))
    ecls = list(RE_ECL.finditer(texto))
    filas = []
    for i, m in enumerate(ecls):
        perfil, num = m.group(1), m.group(2)
        bloque = texto[m.end(): ecls[i + 1].start() if i + 1 < len(ecls) else len(texto)]
        nivel = RE_NIVEL.search(bloque)
        nivel = nivel.group(1) if nivel else ''
        ecl = f'{perfil}-{num}'
        elementos = list(RE_ELEMENTO.finditer(bloque))
        for j, e in enumerate(elementos):
            n_el = int(e.group(1))
            filas.append([perfil, ecl, nivel, n_el, 'elemento', 0, normalizar(e.group(2)), fuente])
            resto = bloque[e.end(): elementos[j + 1].start() if j + 1 < len(elementos) else len(bloque)]
            c = RE_CONOC.search(resto)
            corte_crit = [x.start() for x in (c, RE_DESEMP.search(resto), RE_FIN_ELEMENTO.search(resto)) if x]
            criterios = resto[: min(corte_crit)] if corte_crit else resto
            for k, item in enumerate(vinetas(criterios), 1):
                filas.append([perfil, ecl, nivel, n_el, 'criterio', k, item, fuente])
            if c:
                tras = resto[c.end():]
                d = RE_DESEMP.search(tras)
                fin = RE_FIN_ELEMENTO.search(tras)
                corte = min(x.start() for x in (d, fin) if x) if (d or fin) else len(tras)
                for k, item in enumerate(vinetas(tras[:corte]), 1):
                    filas.append([perfil, ecl, nivel, n_el, 'conocimiento', k, item, fuente])
    return filas


def main():
    salida, entradas = sys.argv[1], sys.argv[2:]
    todas = []
    for ruta in entradas:
        filas = procesar(ruta)
        todas.extend(filas)
        resumen = {}
        for f in filas:
            r = resumen.setdefault(f[1], {'nivel': f[2], 'elemento': 0, 'criterio': 0, 'conocimiento': 0})
            r[f[4]] += 1
        print(os.path.basename(ruta))
        for ecl, r in resumen.items():
            print(f"  {ecl} nivel {r['nivel']}: {r['elemento']} elementos, {r['criterio']} criterios, {r['conocimiento']} conocimientos")
    with open(salida, 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        w.writerow(['perfil_codigo', 'ecl_codigo', 'nivel', 'elemento', 'tipo', 'n', 'texto', 'fuente'])
        w.writerows(todas)
    print('filas:', len(todas))


if __name__ == '__main__':
    main()
