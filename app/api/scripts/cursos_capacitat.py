"""Llena app/datos/cursos.csv con cursos de CAPACÍTA-T para las competencias que faltan en cada transición (D-041).

Lee de cada página de curso el nombre, la entidad que certifica y las horas. Según las preguntas frecuentes de la
plataforma, los cursos y su certificado son gratuitos y son en línea, a tu ritmo
(https://capacitacionlaboral.trabajo.gob.pe/preguntas-frecuentes/). Un certificado de curso no es una certificación
de competencias del MTPE.

Qué curso va con qué estándar es una propuesta (por revisar con el equipo):
  G2347007-1 Ventas: formación en ventas, cierre de ventas, vende mejor, manejo de objeciones.
  G2347008-1 Post ventas: relaciones con los clientes y orientación al cliente.
  I2555002-3 Interactuar con el cliente (housekeeping): orientación al cliente, experiencia del cliente, inglés
             para hotelería (el perfil de limpieza pide inglés básico como opcional).
  K2764001-1 Operaciones de caja en entidades financieras: educación financiera y economía básica.
  H2452001-3 y H2452004-1 (supervisar el almacén; compras): logística 360.
  S3497002-2 Limpieza del hogar, que el perfil pide "en condiciones de SST": prevención de riesgos laborales;
             salud y seguridad. (S3497002-5, cuidar de sí misma, no está en la matriz ni en la app.)

Uso: python3 -I cursos_capacitat.py <app/datos/cursos.csv>
"""
import csv
import html
import re
import sys
import urllib.request

BASE = 'https://capacitacionlaboral.trabajo.gob.pe/cursos/'
CURSOS = {
    'G2347007-1': ['formacion-en-ventas', 'cierre-de-ventas', 'vende-mejor-tecnicas-y-herramientas-clave', 'manejo-de-objeciones'],
    'G2347008-1': ['administracion-de-las-relaciones-con-los-clientes', 'orientacion-al-cliente'],
    'I2555002-3': ['orientacion-al-cliente', 'la-experiencia-del-cliente-nunca-termina', 'hospitality'],
    'K2764001-1': ['educacion-financiera-y-economia-basica'],
    'H2452001-3': ['logistica-360-claves-para-una-gestion-moderna-y-eficiente'],
    'H2452004-1': ['logistica-360-claves-para-una-gestion-moderna-y-eficiente'],
    'S3497002-2': ['prevencion-de-riesgos-laborales', 'salud-y-seguridad-para-ambientes-de-trabajo-moderno'],
}


def leer_curso(slug):
    pedido = urllib.request.Request(BASE + slug + '/', headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(pedido, timeout=30) as r:
        pagina = r.read().decode('utf-8', 'replace')
    nombre = html.unescape(re.search(r'<title>\s*(.*?)\s*»', pagina, re.S).group(1)).strip()
    texto = html.unescape(re.sub(r'<script.*?</script>|<style.*?</style>', '', pagina, flags=re.S))
    texto = re.sub(r'\s*\n\s*', '\n', re.sub(r'<[^>]+>', '\n', texto))
    i = texto.find('Certificado de')
    entidad = re.search(r'Certificado de ([^\n]+)', texto[i:i + 200]).group(1).strip()
    duracion = re.search(r'(\d+)\s+horas?', texto[i:i + 300])
    return nombre, entidad, duracion.group(1) if duracion else ''


def main():
    salida = sys.argv[1]
    comentarios = [l for l in open(salida, encoding='utf-8') if l.startswith('#')]
    # Las filas de certificación las pone centros_certificacion.py: se conservan.
    certificaciones = [f for f in csv.reader(l for l in open(salida, encoding='utf-8') if not l.startswith('#'))
                       if len(f) > 2 and f[2] == 'certificacion']
    cache, filas = {}, []
    for ecl, slugs in CURSOS.items():
        for slug in slugs:
            if slug not in cache:
                cache[slug] = leer_curso(slug)
            nombre, entidad, horas = cache[slug]
            filas.append([ecl, nombre, 'curso', BASE + slug + '/', horas, 'Virtual, a tu ritmo', 'si',
                          f'CAPACÍTA-T (MTPE); certificado de {entidad}'])
            print(f'{ecl} · {nombre} · {horas} h · {entidad}')
    with open(salida, 'w', encoding='utf-8', newline='') as f:
        csv.writer(f).writerow(['codigo_ecl', 'nombre', 'tipo', 'url', 'horas', 'modalidad', 'gratuito', 'fuente'])
        f.writelines(comentarios)
        csv.writer(f).writerows(filas + certificaciones)
    print(len(filas), 'filas de cursos;', len(certificaciones), 'de certificación conservadas')


if __name__ == '__main__':
    main()
