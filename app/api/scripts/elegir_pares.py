"""Elige los pares de tareas que el equipo marca a mano como "es la misma" o "no es la misma" (D-053).

Toma el resultado de pares_similitud.js y elige 60 pares de ocupaciones distintas, repartidos en cuatro franjas de
similitud: más pares cerca de donde debería caer el umbral y algunos claramente lejanos. Dentro de cada franja reparte
entre combinaciones de ocupaciones, para que no dominen las dos cajas. El orden final es al azar (semilla fija).

Escribe dos archivos en app/datos/:
  pares_por_marcar.csv  lo que ve el equipo, sin puntajes, para no influir en la respuesta
  pares_clave.csv       los códigos y la similitud de cada par, para calibrar después

Uso: python3 -I elegir_pares.py <pares-similitud-*.json> <carpeta app/datos>
"""
import csv
import json
import random
import re
import sys
from collections import defaultdict

FRANJAS = [  # (nombre, percentil desde, percentil hasta, cuántos)
    ('alta', 0.90, 1.00, 22),
    ('media-alta', 0.75, 0.90, 14),
    ('media', 0.40, 0.75, 14),
    ('baja', 0.00, 0.25, 10),
]
COLA = re.compile(r',?\s+(de acuerdo (a|con)|según|teniendo en cuenta|considerando|conforme a|en condiciones de)\b', re.I)


def corto(texto):
    """Deja la acción principal y quita la cola formal ("..., de acuerdo a los procedimientos de la empresa")."""
    texto = COLA.split(texto, maxsplit=1)[0]
    return texto.strip(' ,;.') + '.'


def ejemplos(elemento, n=2):
    return ' · '.join(corto(c) for c in elemento['criterios'][:n])


def main():
    datos = json.load(open(sys.argv[1], encoding='utf-8'))
    carpeta = sys.argv[2]
    elementos = {e['id']: e for e in datos['elementos']}
    pares = sorted(datos['pares'], key=lambda p: p['sim_elemento'])
    azar = random.Random(26102026)
    elegidos = []
    for nombre, desde, hasta, cuantos in FRANJAS:
        franja = pares[int(desde * len(pares)): int(hasta * len(pares))]
        por_combinacion = defaultdict(list)
        for p in franja:
            clave = tuple(sorted((elementos[p['a']]['ocupacion'], elementos[p['b']]['ocupacion'])))
            por_combinacion[clave].append(p)
        for lista in por_combinacion.values():
            azar.shuffle(lista)
        combinaciones = sorted(por_combinacion, key=lambda c: (-len(por_combinacion[c]), c))
        tomados = []
        while len(tomados) < cuantos and any(por_combinacion.values()):
            for c in combinaciones:  # una de cada combinación por vuelta
                if por_combinacion[c] and len(tomados) < cuantos:
                    tomados.append(por_combinacion[c].pop())
        elegidos += [dict(p, franja=nombre) for p in tomados]
    azar.shuffle(elegidos)

    with open(f'{carpeta}/pares_por_marcar.csv', 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        w.writerow(['par', 'ocupacion_a', 'tarea_a', 'ejemplos_a', 'ocupacion_b', 'tarea_b', 'ejemplos_b',
                    'es_la_misma', 'quien', 'nota'])
        f.write('# Pares para marcar a mano (D-053, Plan sección 10.3). es_la_misma: si | no | no_se.\n'
                '# Cada persona marca por su cuenta y sin mirar pares_clave.csv. Lo marcado manda sobre el umbral.\n')
        for i, p in enumerate(elegidos, 1):
            a, b = elementos[p['a']], elementos[p['b']]
            w.writerow([f'P{i:02d}', a['ocupacion_nombre'], corto(a['texto']), ejemplos(a),
                        b['ocupacion_nombre'], corto(b['texto']), ejemplos(b), '', '', ''])
    with open(f'{carpeta}/pares_clave.csv', 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        w.writerow(['par', 'codigo_a', 'codigo_b', 'franja', 'sim_elemento', 'sim_con_ejemplos', 'texto_a', 'texto_b'])
        for i, p in enumerate(elegidos, 1):
            w.writerow([f'P{i:02d}', p['a'], p['b'], p['franja'], p['sim_elemento'], p['sim_con_ejemplos'],
                        elementos[p['a']]['texto'], elementos[p['b']]['texto']])
    conteo = defaultdict(int)
    for p in elegidos:
        conteo[p['franja']] += 1
    print(len(elegidos), 'pares:', dict(conteo))


if __name__ == '__main__':
    main()
