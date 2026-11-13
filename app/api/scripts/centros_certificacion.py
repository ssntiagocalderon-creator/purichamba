"""Dónde certificarse en Lima: centros autorizados por el MTPE para cada estándar de la app (D-041, D-047).

Fuente: el listado oficial de Centros de Certificación de Competencias Laborales autorizados, al 16-09-2026
(datos/fuentes/mtpe_centros/FUENTES.md). El directorio web "Certifícate" del MTPE está incompleto: por ejemplo, no
muestra centros en Lima para almacén ni para caja, que el listado sí tiene.

Para cada estándar de app/datos/ocupaciones.json, con los centros de Lima Metropolitana:
- datos/procesados/mtpe_centros_certificacion_lima.csv: un centro por fila, sin teléfonos ni correos.
- app/datos/cursos.csv: una fila de tipo certificacion. Nombra primero al centro que certifica más estándares de la
  app, para que se puedan certificar varias tareas en un mismo lugar, y cuenta los demás. Solo se reemplazan las
  filas de certificación; los cursos los pone cursos_capacitat.py.
Para certificarse hay que tener más de 6 meses de experiencia en el estándar (plan, C-38), y eso va en el texto.

Uso: python3 -I centros_certificacion.py <listado.xlsx> <app/datos/ocupaciones.json> <app/datos/cursos.csv> <salida.csv>
"""
import collections
import csv
import datetime
import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

LISTADO = ('https://www.gob.pe/institucion/mtpe/informes-publicaciones/'
           '7581793-listado-de-centros-de-certificacion-de-competencias-laborales-autorizados-2021-2026')
FECHA_LISTADO = '16-09-2026'
DEPARTAMENTO = 'LIMA METROPOLITANA'
M = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
R = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
# Nombre corto de los centros que salen primero; los demás se arman con corto().
NOMBRES = {
    'UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS- UNMSM': 'Universidad Nacional Mayor de San Marcos',
    'CENTRO DE FORMACION EN TURISMO - CENFOTUR': 'CENFOTUR',
    'ARTEMISA SOLUTIONS S.A.C.': 'Artemisa Solutions',
    'NUEVAS OPCIONES EN VARIEDADES ALIMENTICIAS @ E.I.R.L.': 'Nuevas Opciones en Variedades Alimenticias',
}
MINUSCULAS = {'de', 'del', 'la', 'las', 'los', 'y', 'en', 'el'}
# Tildes y mayúsculas que el listado escribe distinto.
DISTRITOS = {'Jesus María': 'Jesús María', 'San Martin de Porres': 'San Martín de Porres',
             'Villa el Salvador': 'Villa El Salvador', 'Lurigancho-chosica': 'Lurigancho-Chosica'}


def leer_hoja(ruta, nombre):
    """Filas de una hoja de un .xlsx como listas de texto, sin librerías externas."""
    z = zipfile.ZipFile(ruta)
    comunes = [''.join(t.text or '' for t in si.iter(M + 't'))
               for si in ET.fromstring(z.read('xl/sharedStrings.xml')).iter(M + 'si')]
    rels = {r.get('Id'): r.get('Target') for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
    hoja = next(h for h in ET.fromstring(z.read('xl/workbook.xml')).iter(M + 'sheet') if h.get('name') == nombre)
    destino = rels[hoja.get(R + 'id')].lstrip('/')
    destino = destino if destino.startswith('xl/') else 'xl/' + destino
    filas = []
    for fila in ET.fromstring(z.read(destino)).iter(M + 'row'):
        valores = {}
        for c in fila.iter(M + 'c'):
            i = 0
            for letra in re.match(r'[A-Z]+', c.get('r')).group(0):
                i = i * 26 + ord(letra) - 64
            v = c.find(M + 'v')
            if c.get('t') == 's':
                texto = comunes[int(v.text)]
            elif c.get('t') == 'inlineStr':
                texto = ''.join(t.text or '' for t in c.iter(M + 't'))
            else:
                texto = v.text if v is not None else ''
            valores[i - 1] = (texto or '').strip()
        filas.append([valores.get(i, '') for i in range(max(valores) + 1)] if valores else [])
    return filas


def fecha(valor):
    """Las fechas vienen como número de serie de Excel."""
    if re.fullmatch(r'\d+(\.\d+)?', valor):
        return (datetime.date(1899, 12, 30) + datetime.timedelta(days=int(float(valor)))).strftime('%d-%m-%Y')
    return valor


def titulo(texto):
    palabras = texto.lower().split()
    return ' '.join(p if i and p in MINUSCULAS else p[:1].upper() + p[1:] for i, p in enumerate(palabras))


def distrito(texto):
    return DISTRITOS.get(titulo(texto), titulo(texto))


def corto(centro):
    if centro in NOMBRES:
        return NOMBRES[centro]
    sin_sociedad = re.sub(r'\s*(S\.?A\.?C\.?|E\.?I\.?R\.?L\.?|S\.?R\.?L\.?|S\.?A\.?)$', '', centro.split(' - ')[0])
    return titulo(sin_sociedad)


def main():
    listado, ruta_ocupaciones, ruta_cursos, salida = sys.argv[1:5]
    codigos = sorted({c for o in json.load(open(ruta_ocupaciones, encoding='utf-8'))['ocupaciones'] for c in o['ecl']})
    filas = leer_hoja(listado, 'CCCL autorizados')
    i_cab = next(i for i, f in enumerate(filas) if 'CÓDIGO DEL ECL AUTORIZADO' in f)
    columna = lambda inicio: next(i for i, c in enumerate(filas[i_cab]) if c.startswith(inicio))
    c_centro, c_ecl, c_const, c_fecha, c_distrito, c_dep = (
        columna('CENTRO DE CERTIFICACIÓN'), columna('CÓDIGO DEL ECL'), columna('Nº DE CONSTANCIA'),
        columna('FECHA DE EMISION'), columna('DISTRITO'), columna('DEPARTAMENTO'))
    lima = [f for f in filas[i_cab + 1:] if len(f) > c_dep and f[c_dep] == DEPARTAMENTO and f[c_ecl] in codigos]
    amplitud = collections.Counter(c for c, _ in {(f[c_centro], f[c_ecl]) for f in lima})
    por_ecl = collections.defaultdict(list)
    for f in sorted(lima, key=lambda f: (f[c_ecl], -amplitud[f[c_centro]], f[c_centro])):
        por_ecl[f[c_ecl]].append(f)

    with open(salida, 'w', encoding='utf-8', newline='') as s:
        w = csv.writer(s)
        w.writerow(['codigo_ecl', 'centro', 'distrito', 'constancia', 'fecha_autorizacion', 'estandares_de_la_app'])
        for ecl in codigos:
            for f in por_ecl[ecl]:
                w.writerow([ecl, f[c_centro], distrito(f[c_distrito]), f[c_const], fecha(f[c_fecha]), amplitud[f[c_centro]]])

    certificaciones = []
    for ecl in codigos:
        centros = por_ecl[ecl]
        if not centros:
            print(f'{ecl}: sin centros en Lima')
            continue
        primero, otros = centros[0], len(centros) - 1
        nombre = f'{corto(primero[c_centro])} ({distrito(primero[c_distrito])})'
        if otros == 1:
            nombre += ' u otro centro de Lima'
        elif otros > 1:
            nombre += f' u otros {otros} centros de Lima'
        nombre += '. Necesitas más de 6 meses de experiencia'
        certificaciones.append([ecl, nombre, 'certificacion', LISTADO, '', '', '',
                                f'MTPE: listado de centros de certificación autorizados al {FECHA_LISTADO}'])
        print(f'{ecl}: {len(centros)} centros · {nombre}')

    lineas = open(ruta_cursos, encoding='utf-8').read().splitlines()
    comentarios = [l for l in lineas if l.startswith('#')]
    cabecera, *datos = list(csv.reader(l for l in lineas if not l.startswith('#')))
    cursos = [f for f in datos if f and f[cabecera.index('tipo')] != 'certificacion']
    with open(ruta_cursos, 'w', encoding='utf-8', newline='') as s:
        csv.writer(s).writerow(cabecera)
        s.writelines(l + '\n' for l in comentarios)
        csv.writer(s).writerows(cursos + certificaciones)
    print(f'{len(lima)} autorizaciones en Lima · {len(certificaciones)} filas de certificación en {ruta_cursos}')


if __name__ == '__main__':
    main()
