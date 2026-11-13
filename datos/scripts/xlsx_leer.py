"""Lee un .xlsx solo con la librería estándar y devuelve filas por hoja."""
import re, sys, zipfile, json
import xml.etree.ElementTree as ET

NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}

def col_idx(ref):
    letters = re.match(r'[A-Z]+', ref).group(0)
    n = 0
    for ch in letters:
        n = n * 26 + ord(ch) - 64
    return n - 1

def leer(path):
    z = zipfile.ZipFile(path)
    shared = []
    if 'xl/sharedStrings.xml' in z.namelist():
        for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si', NS):
            shared.append(''.join(t.text or '' for t in si.iter('{%s}t' % NS['m'])))
    wb = ET.fromstring(z.read('xl/workbook.xml'))
    rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    target = {r.get('Id'): r.get('Target') for r in rels}
    hojas = {}
    for s in wb.find('m:sheets', NS):
        rid = s.get('{%s}id' % NS['r'])
        p = target[rid].lstrip('/')
        p = p if p.startswith('xl/') else 'xl/' + p
        filas = []
        for row in ET.fromstring(z.read(p)).iter('{%s}row' % NS['m']):
            vals = {}
            for c in row.findall('m:c', NS):
                v = c.find('m:v', NS)
                t = c.get('t')
                if t == 'inlineStr':
                    val = ''.join(x.text or '' for x in c.iter('{%s}t' % NS['m']))
                elif v is None:
                    continue
                elif t == 's':
                    val = shared[int(v.text)]
                else:
                    val = v.text
                vals[col_idx(c.get('r'))] = val
            if vals:
                filas.append([vals.get(i) for i in range(max(vals) + 1)])
        hojas[s.get('name')] = filas
    return hojas

if __name__ == '__main__':
    h = leer(sys.argv[1])
    for nombre, filas in h.items():
        print('HOJA', nombre, len(filas))
        for f in filas[:int(sys.argv[2]) if len(sys.argv) > 2 else 12]:
            print([(str(x)[:70] if x else x) for x in f])
