"""Trae vacantes reales y vigentes de Empleos Perú para las ocupaciones de destino (D-050) y llena app/datos/vacantes.csv.

Usa la búsqueda pública del portal de candidatos de Empleos Perú (la misma que usa su web, sin iniciar sesión):
  GET https://mtpe-candidatos.empleosperu.gob.pe/api/jobs?positionTitle=<puesto>
El enlace de cada aviso es el que arma el propio portal: .../search-jobs?jobId=<id>.
Se queda con las vacantes cuyo título calza con la ocupación, las más recientes, y primero las de Lima.

Uso: python3 -I vacantes_empleos_peru.py <app/datos/vacantes.csv> [por_ocupacion] [vigentes_al AAAA-MM-DD]
Con vigentes_al, se queda solo con las que no vencen antes de esa fecha (por ejemplo, el día de la demo).
"""
import csv
import json
import re
import sys
import urllib.parse
import urllib.request

API = 'https://mtpe-candidatos.empleosperu.gob.pe/api/jobs'
ENLACE = 'https://mtpe-candidatos.empleosperu.gob.pe/search-jobs?jobId='
# ocupacion_id: (búsquedas, el título debe contener alguna de estas raíces, raíces que se descartan,
#                y, si hace falta, un patrón que debe aparecer en el título o en la empresa)
OCUPACIONES = {
    'housekeeping': (['camarera de piso', 'housekeeping', 'camarera', 'ama de llaves'],
                     ['housekeep', 'camarer', 'cuartel', 'ama de llaves', 'habitaci'],
                     ['crucero', 'bar', 'barista', 'recepcion']),
    'trabajador_hogar': (['trabajadora del hogar', 'trabajador del hogar', 'empleada del hogar', 'niñera'],
                         ['hogar', 'domést', 'domest', 'niñer', 'nana'], []),
    'caja_financiera': (['cajero bancario', 'cajero de banco', 'asesor de ventanilla', 'cajero financiero',
                         'promotor de servicios', 'cajero de agencia', 'representante de servicios', 'asesor de servicios',
                         'auxiliar de operaciones'],
                        ['cajer', 'ventanilla', 'caja', 'promotor de servicios', 'representante de servicios',
                         'asesor de servicios', 'auxiliar de operaciones'], ['practicante', 'supermercado', 'tienda'],
                        r'banc|financ|ventanilla|agencia|cooperativa|mibanco|compartamos|interbank|scotiabank|bbva|\bbcp\b'
                        r'|caja (municipal|rural|arequipa|huancayo|piura|trujillo|sullana|cusco|ica|tacna|maynas)|money|cambio'),
    'compras': (['asistente de compras', 'auxiliar de compras', 'comprador', 'compras'],
                ['compra'], ['practicante']),
}
DEPARTAMENTOS = {'01': 'Amazonas', '02': 'Áncash', '03': 'Apurímac', '04': 'Arequipa', '05': 'Ayacucho',
                 '06': 'Cajamarca', '07': 'Callao', '08': 'Cusco', '09': 'Huancavelica', '10': 'Huánuco',
                 '11': 'Ica', '12': 'Junín', '13': 'La Libertad', '14': 'Lambayeque', '15': 'Lima', '16': 'Loreto',
                 '17': 'Madre de Dios', '18': 'Moquegua', '19': 'Pasco', '20': 'Piura', '21': 'Puno',
                 '22': 'San Martín', '23': 'Tacna', '24': 'Tumbes', '25': 'Ucayali'}


def buscar(puesto):
    url = f'{API}?{urllib.parse.urlencode({"positionTitle": puesto})}'
    pedido = urllib.request.Request(url, headers={'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(pedido, timeout=30) as r:
        return json.load(r).get('data') or []


def vence(id_):
    """Fecha de vencimiento del aviso (AAAA-MM-DD), que solo trae el detalle, no la búsqueda."""
    pedido = urllib.request.Request(f'{API}/{id_}', headers={'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(pedido, timeout=30) as r:
        d = json.load(r)
    return (d.get('data', d) if isinstance(d, dict) and 'data' in d else d).get('expiration') or ''


def main():
    salida = sys.argv[1]
    cuantas = int(sys.argv[2]) if len(sys.argv) > 2 else 6
    vigentes_al = sys.argv[3] if len(sys.argv) > 3 else ''
    comentarios = [l for l in open(salida, encoding='utf-8') if l.startswith('#')]
    filas = []
    for ocupacion, (busquedas, raices, descartar, *patron) in OCUPACIONES.items():
        vistas = {}
        for b in busquedas:
            for v in buscar(b):
                titulo = re.sub(r'\s+', ' ', v.get('positionTitle') or '').strip()
                t = titulo.lower()
                # 'caja' va como palabra entera: si no, también calza en 'Cajamarca'.
                if not any(re.search(r'\b' + re.escape(r) + (r'\b' if r == 'caja' else ''), t) for r in raices) \
                        or any(re.search(r'\b' + d, t) for d in descartar):
                    continue
                if patron and not re.search(patron[0], f"{t} {(v.get('companyName') or '').lower()}"):
                    continue
                if v.get('active') is False or v.get('approvalStatus') not in (None, 'APPROVED'):
                    continue
                if vigentes_al and vence(v['id']) < vigentes_al:
                    continue
                vistas[v['id']] = v
        def orden(v):  # primero Lima y Callao, y dentro de cada grupo, la más reciente
            dep = (v.get('location') or {}).get('DEPARTMENT')
            return (dep not in ('15', '07'), -int((v.get('datePosted') or '0').replace('-', '')))
        elegidas = sorted(vistas.values(), key=orden)[:cuantas]
        for v in elegidas:
            dep = (v.get('location') or {}).get('DEPARTMENT')
            filas.append([ocupacion, DEPARTAMENTOS.get(dep, 'No indica'),
                          re.sub(r'\s+', ' ', v['positionTitle']).strip(),
                          v.get('companyName') or 'Empresa reservada', ENLACE + v['id'], v.get('datePosted') or '', 'no'])
        print(f'{ocupacion}: {len(vistas)} vacantes que calzan, se guardan {len(elegidas)}')
    with open(salida, 'w', encoding='utf-8', newline='') as f:
        csv.writer(f).writerow(['ocupacion_id', 'region', 'titulo', 'empresa', 'url', 'fecha_publicacion', 'es_simulada'])
        f.writelines(comentarios)
        csv.writer(f).writerows(filas)


if __name__ == '__main__':
    main()
