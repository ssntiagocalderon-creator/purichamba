"""Convierte la Matriz de Estándares de Competencia Laboral del MTPE a JSON y CSV limpios."""
import csv, datetime, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from xlsx_leer import leer

FUENTE = {
    'nombre': 'MTPE - Matriz de Estándares de Competencia Laboral (actualizada 04-09-2026)',
    'url': 'https://www.gob.pe/institucion/mtpe/informes-publicaciones/2992036-matriz-de-estandares-de-competencia-laboral',
    'archivo': 'https://cdn.www.gob.pe/uploads/document/file/4798642/2992036-matriz-de-estandares-04-09-2026.xlsx',
}
HOY = datetime.date(2026, 10, 20)

def limpio(v):
    if v is None:
        return None
    v = ' '.join(str(v).split())
    return None if v in ('', '-') else v

def fecha(v):
    v = limpio(v)
    if v is None:
        return None
    try:
        return (datetime.date(1899, 12, 30) + datetime.timedelta(days=int(float(v)))).isoformat()
    except ValueError:
        return v  # algunas celdas traen texto en lugar de número de serie

base = Path(__file__).resolve().parent.parent
filas = leer(base / 'fuentes' / 'mtpe_matriz_estandares_2026-09-04.xlsx')['MATRIZ DE ESTANDARES']
encabezado = filas[1]
registros = []
for f in filas[2:]:
    f = f + [None] * (len(encabezado) - len(f))
    if not limpio(f[12]):
        continue
    venc = fecha(f[18])
    prorroga = fecha(f[17])
    limite = max([d for d in (venc, prorroga) if d and d[:4].isdigit()], default=None)
    registros.append({
        'n': limpio(f[0]),
        'sector': limpio(f[2]),
        'familia_productiva': limpio(f[4]),
        'division': limpio(f[6]),
        'actividad_economica': limpio(f[8]),
        'resolucion': limpio(f[9]),
        'codigo_perfil': limpio(f[10]),
        'perfil_ocupacional': limpio(f[11]),
        'codigo_ecl': limpio(f[12]),
        'nombre_ecl': limpio(f[13]),
        'descripcion_ecl': limpio(f[14]),
        'nivel_competencia': limpio(f[15]),
        'fecha_aprobacion': fecha(f[16]),
        'fecha_prorroga': prorroga,
        'fecha_vencimiento': venc,
        'vigente_al_2026_10_20': (limite >= HOY.isoformat()) if limite else None,
        'version': limpio(f[19]),
        'ciuo': limpio(f[21]),
        'cno': limpio(f[22]),
        'puestos_asociados': limpio(f[23]),
        'observaciones': limpio(f[24]) if len(f) > 24 else None,
    })

salida = base / 'procesados'
salida.mkdir(exist_ok=True)
(salida / 'mtpe_estandares_competencia.json').write_text(
    json.dumps({'fuente': FUENTE, 'total': len(registros), 'registros': registros}, ensure_ascii=False, indent=1))
with open(salida / 'mtpe_estandares_competencia.csv', 'w', newline='') as fh:
    w = csv.DictWriter(fh, fieldnames=list(registros[0]))
    w.writeheader()
    w.writerows(registros)
print('estándares:', len(registros))
print('perfiles distintos:', len({r['codigo_perfil'] or r['perfil_ocupacional'] or r['nombre_ecl'] for r in registros}))
print('vigentes al 20-10-2026:', sum(1 for r in registros if r['vigente_al_2026_10_20']),
      '| vencidos:', sum(1 for r in registros if r['vigente_al_2026_10_20'] is False),
      '| sin fecha:', sum(1 for r in registros if r['vigente_al_2026_10_20'] is None))
print('con código CNO:', sum(1 for r in registros if r['cno']))
from collections import Counter
print(Counter(r['sector'] for r in registros).most_common(12))
