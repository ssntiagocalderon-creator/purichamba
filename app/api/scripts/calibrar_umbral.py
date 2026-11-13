"""Marca los pares de tareas ("es la misma" o no) y calcula qué umbral de similitud separa mejor (D-053, D-056).

Las marcas las puso Claude a pedido de Santiago (26-10), con una razón por par, para que Santiago las revise. La regla:
"Sí" si es la misma tarea (misma acción y mismo objeto, aunque cambie el lugar: oficina, casa u hotel; tienda o banco);
"No" si son tareas distintas, aunque sean del mismo oficio, de otro paso (abrir o cerrar la caja) o de otro nivel
(hacer o supervisar); "No sé" si una tarea contiene a la otra solo en parte. Los "No sé" no cuentan para el umbral.

Pares marcados: los 60 de pares_clave.csv (P01-P60), los 51 más parecidos que no estaban en la muestra (E01-E51,
similitud de 0,80 o más) y 4 pares clave de limpieza, hogar, hotel y caja (X01-X04).

Escribe app/datos/pares_marcados.csv y muestra precisión, cobertura y F1 para cada umbral, con las dos variantes de
similitud (solo la tarea; la tarea con tres ejemplos) y con la regla extra de exigir el mismo nivel de competencia.

Uso: python3 -I calibrar_umbral.py <pares-similitud-*.json> <app/datos>
"""
import csv
import json
import sys

MARCAS_MUESTRA = {  # P01-P60: (marca, razón)
    'P01': ('no', 'Despachar mercadería no es gestionar recursos de una entidad financiera'),
    'P02': ('no', 'Almacenar mercadería no es supervisar el área de caja'),
    'P03': ('no', 'Ordenar el área no es preparar los productos de limpieza'),
    'P04': ('no_se', 'Las dos atienden pedidos de clientes, pero una son operaciones bancarias y otra pedidos de huéspedes'),
    'P05': ('no', 'Habilitar las cajas de una agencia no es negociar una venta'),
    'P06': ('no', 'Recibir mercadería no es atender al huésped'),
    'P07': ('no', 'Las dos supervisan, pero una inventarios y otra cajas'),
    'P08': ('no', 'Cuidarse de riesgos no es atender al huésped'),
    'P09': ('no', 'Recibir mercadería no es dirigir el área de cajas'),
    'P10': ('no', 'Almacenar mercadería no es cuidar a niños o adultos mayores'),
    'P11': ('no', 'Organizar la limpieza no es cerrar ventas'),
    'P12': ('no', 'Ordenar el área de limpieza no es dirigir el almacén'),
    'P13': ('no', 'Ordenar el área no es lavar ropa'),
    'P14': ('no', 'Fidelizar clientes no es abrir la caja'),
    'P15': ('no', 'Organizar la limpieza y limpiar son pasos distintos'),
    'P16': ('no_se', 'Cobrar incluye atender al cliente, pero no es la misma tarea'),
    'P17': ('no', 'Preparar una preventa no es organizar la limpieza'),
    'P18': ('no', 'Fidelizar clientes no es seguir estándares de atención en un hotel'),
    'P19': ('no', 'Despachar mercadería no es preparar una habitación'),
    'P20': ('no', 'Operaciones bancarias no son preparar productos de limpieza'),
    'P21': ('no', 'Preparar productos de limpieza no es acondicionar una habitación'),
    'P22': ('no', 'Ordenar la casa no es organizar el trabajo de limpieza'),
    'P23': ('no', 'Supervisar al personal de limpieza no es acondicionar una habitación'),
    'P24': ('no', 'Dirigir el almacén no es dirigir la bóveda'),
    'P25': ('no', 'Atender después de la venta no es guardar ropa'),
    'P26': ('no', 'Dirigir la bóveda no es controlar la apertura de las cajas del personal'),
    'P27': ('no', 'Almacenar mercadería no es cerrar ventas'),
    'P28': ('no', 'Supervisar el almacén no es atender al huésped'),
    'P29': ('no', 'Supervisar la limpieza no es revisar montacargas'),
    'P30': ('no', 'Ordenar una base de datos de clientes no es atender al huésped'),
    'P31': ('no', 'Cerrar la caja no es negociar una venta'),
    'P32': ('no', 'Planificar la limpieza no es cuadrar la caja'),
    'P33': ('no', 'Recibir mercadería no es atender después de la venta'),
    'P34': ('no', 'Supervisar el almacén no es preparar una habitación'),
    'P35': ('no_se', 'Las operaciones bancarias incluyen atender al cliente, pero no es la misma tarea'),
    'P36': ('no', 'Atender después de la venta no es cobrar'),
    'P37': ('no', 'Preparar insumos de cocina no es acondicionar una habitación'),
    'P38': ('no', 'Ordenar el área no es gestionar recursos de una entidad financiera'),
    'P39': ('no', 'Controlar la apertura de cajas no es acondicionar una habitación'),
    'P40': ('no', 'Evaluar la post venta no es dirigir el área de cajas'),
    'P41': ('no', 'Gestionar recursos financieros no es limpiar'),
    'P42': ('no', 'Supervisar la limpieza y limpiar son de distinto nivel'),
    'P43': ('no', 'Dirigir el almacén no es gestionar recursos de una entidad financiera'),
    'P44': ('no', 'Almacenar mercadería y guardar ropa usan objetos y técnicas distintos'),
    'P45': ('no', 'Cobrar no es preparar productos de limpieza'),
    'P46': ('no', 'Supervisar el almacén no es preparar una preventa'),
    'P47': ('no', 'Limpiar y preparar los productos de limpieza son pasos distintos'),
    'P48': ('no', 'Organizar la limpieza no es trasladar mercadería'),
    'P49': ('no', 'Recibir mercadería no es ordenar la casa'),
    'P50': ('no', 'Cerrar ventas no es controlar la apertura de las cajas'),
    'P51': ('no', 'Abrir la ventanilla y cuadrar la caja al cierre son pasos distintos'),
    'P52': ('no', 'Medir la gestión de cajas no es cuidar personas'),
    'P53': ('no', 'Revisar equipos del almacén no es supervisar la caja'),
    'P54': ('si', 'Las dos preparan materiales, equipos y productos de limpieza, en casa o en hotel'),
    'P55': ('no', 'Ordenar el área no es organizar el trabajo de limpieza'),
    'P56': ('no', 'Las dos supervisan, pero una la limpieza y otra la caja'),
    'P57': ('no', 'Trasladar mercadería no es fidelizar clientes'),
    'P58': ('no', 'Limpiar no es abrir una ventanilla de banco'),
    'P59': ('no', 'Fidelizar clientes no es atender pedidos de huéspedes'),
    'P60': ('no', 'Medir la gestión de cajas no es organizar la limpieza'),
}
MARCAS_EXTRA = [  # (id, código A, código B, marca, razón)
    ('E01', 'K2764001-2/E2', 'G2347002-2/E2', 'si', 'Las dos supervisan las operaciones de caja (anulaciones, efectivo), en banco o en tienda'),
    ('E02', 'M2981001-1/E1', 'I2555002-1/E1', 'si', 'Las dos organizan la limpieza de las áreas asignadas'),
    ('E03', 'K2764001-1/E1', 'G2347002-1/E1', 'si', 'Las dos abren la caja: revisan equipos, materiales y el fondo de dinero'),
    ('E04', 'K2764001-2/E2', 'G2347002-3/E2', 'no_se', 'Las dos controlan el área de caja, pero una es de nivel 2 y otra dirige al personal (nivel 3)'),
    ('E05', 'G2347008-1/E1', 'I2555002-3/E2', 'si', 'Las dos atienden pedidos y reclamos del cliente, los resuelven o los derivan'),
    ('E06', 'K2764001-2/E1', 'G2347002-1/E1', 'no', 'Habilitar las cajas del personal (supervisión) no es abrir la propia caja'),
    ('E07', 'K2764001-1/E2', 'G2347002-3/E2', 'no', 'Atender operaciones no es dirigir el área de cajas'),
    ('E08', 'K2764001-1/E3', 'G2347002-1/E3', 'si', 'Las dos cuentan el efectivo y cuadran la caja al cierre'),
    ('E09', 'M2981001-2/E2', 'I2555002-1/E1', 'no', 'Supervisar la limpieza no es organizar la propia limpieza'),
    ('E10', 'K2764001-1/E2', 'G2347002-1/E3', 'no', 'Atender operaciones y cuadrar la caja son pasos distintos'),
    ('E11', 'K2764001-2/E1', 'G2347002-2/E1', 'si', 'Las dos supervisan la apertura y el cierre de las cajas del personal'),
    ('E12', 'K2764001-2/E2', 'G2347002-2/E1', 'no', 'Supervisar operaciones del día no es controlar la apertura y el cierre'),
    ('E13', 'M2981001-1/E2', 'I2555002-1/E1', 'no', 'Limpiar y organizar la limpieza son pasos distintos'),
    ('E14', 'M2981001-1/E2', 'I2555002-1/E2', 'si', 'Las dos limpian las áreas asignadas'),
    ('E15', 'M2981001-1/E1', 'I2555002-1/E2', 'no', 'Organizar la limpieza y limpiar son pasos distintos'),
    ('E16', 'K2764001-1/E2', 'G2347002-1/E1', 'no', 'Atender operaciones y abrir la caja son pasos distintos'),
    ('E17', 'K2764001-1/E3', 'G2347002-2/E1', 'no', 'Cuadrar la propia caja no es supervisar la de otros'),
    ('E18', 'K2764001-2/E2', 'G2347002-1/E3', 'no', 'Supervisar operaciones no es cuadrar la propia caja'),
    ('E19', 'K2764001-1/E1', 'G2347002-2/E1', 'no', 'Abrir la propia ventanilla no es supervisar la apertura de otros'),
    ('E20', 'K2764001-1/E3', 'G2347002-3/E2', 'no', 'Cuadrar la caja no es dirigir el área de cajas'),
    ('E21', 'K2764001-1/E2', 'G2347002-2/E1', 'no', 'Atender operaciones no es supervisar la apertura de cajas'),
    ('E22', 'K2764001-1/E2', 'G2347002-2/E2', 'no', 'Atender operaciones no es supervisar el área de caja'),
    ('E23', 'K2764001-3/E1', 'G2347002-3/E2', 'no', 'Dirigir la bóveda no es dirigir al personal de cajas'),
    ('E24', 'K2764001-1/E3', 'G2347002-1/E1', 'no', 'Cerrar y abrir la caja son pasos distintos'),
    ('E25', 'K2764001-2/E2', 'G2347002-1/E1', 'no', 'Supervisar operaciones no es abrir la propia caja'),
    ('E26', 'G2347008-1/E1', 'I2555002-3/E1', 'no_se', 'Atender después de la venta incluye la atención al cliente, pero no es la misma tarea'),
    ('E27', 'K2764001-2/E1', 'G2347002-3/E2', 'no', 'Habilitar las cajas no es dirigir al personal de cajas'),
    ('E28', 'H2452001-1/E3', 'I2555002-3/E2', 'no', 'Despachar mercadería no es atender al huésped'),
    ('E29', 'K2764001-1/E1', 'G2347002-3/E2', 'no', 'Abrir la ventanilla no es dirigir el área de cajas'),
    ('E30', 'K2764001-1/E2', 'G2347002-3/E1', 'no', 'Atender operaciones no es medir la gestión del área'),
    ('E31', 'K2764001-3/E1', 'G2347002-1/E3', 'no', 'Dirigir la bóveda no es cuadrar la propia caja'),
    ('E32', 'K2764001-2/E1', 'G2347002-1/E3', 'no', 'Habilitar las cajas del personal no es cuadrar la propia caja'),
    ('E33', 'K2764001-3/E1', 'G2347002-2/E2', 'no', 'Dirigir la bóveda no es supervisar el área de caja'),
    ('E34', 'K2764001-2/E2', 'G2347002-3/E1', 'no', 'Supervisar operaciones no es medir la gestión del área'),
    ('E35', 'H2452001-1/E3', 'G2347002-1/E2', 'no', 'Despachar mercadería no es cobrar'),
    ('E36', 'K2764001-3/E1', 'G2347002-1/E1', 'no', 'Dirigir la bóveda no es abrir la propia caja'),
    ('E37', 'K2764001-1/E3', 'G2347002-2/E2', 'no', 'Cuadrar la propia caja no es supervisar el área'),
    ('E38', 'H2452001-3/E1', 'G2347002-3/E2', 'no', 'Dirigir el almacén no es dirigir el área de cajas'),
    ('E39', 'M2981001-2/E1', 'I2555002-1/E1', 'no', 'Planificar la limpieza de un equipo no es organizar la propia (distinto nivel)'),
    ('E40', 'H2452001-1/E3', 'G2347002-1/E3', 'no', 'Despachar mercadería no es cuadrar la caja'),
    ('E41', 'K2764001-3/E2', 'G2347002-3/E2', 'no_se', 'Las dos dirigen el área de caja, pero una gestiona documentos financieros y otra al personal'),
    ('E42', 'H2452001-3/E1', 'G2347002-1/E3', 'no', 'Dirigir el almacén no es cuadrar la caja'),
    ('E43', 'K2764001-1/E1', 'G2347002-2/E2', 'no', 'Abrir la ventanilla no es supervisar el área de caja'),
    ('E44', 'K2764001-2/E1', 'G2347002-2/E2', 'no', 'Controlar la apertura y el cierre no es supervisar las operaciones del día'),
    ('E45', 'K2764001-3/E2', 'G2347002-1/E3', 'no', 'Gestionar recursos financieros no es cuadrar la propia caja'),
    ('E46', 'K2764001-1/E3', 'G2347002-3/E1', 'no', 'Cuadrar la caja no es medir la gestión del área'),
    ('E47', 'M2981001-1/E3', 'S3497002-2/E3', 'si', 'Las dos ordenan los muebles y objetos del espacio a cargo'),
    ('E48', 'S3497002-2/E1', 'I2555002-1/E2', 'no', 'Preparar los productos y limpiar son pasos distintos'),
    ('E49', 'H2452001-1/E2', 'I2555002-3/E2', 'no', 'Almacenar mercadería no es atender al huésped'),
    ('E50', 'M2981001-1/E3', 'H2452001-2/E1', 'no', 'Ordenar el área no es revisar montacargas'),
    ('E51', 'K2764001-3/E2', 'G2347002-2/E2', 'no_se', 'Las dos supervisan el área de caja, pero una además gestiona documentos financieros'),
    ('X01', 'M2981001-1/E2', 'S3497002-2/E2', 'si', 'Las dos limpian: áreas de un establecimiento o muebles y espacios de una casa'),
    ('X02', 'S3497002-2/E2', 'I2555002-1/E2', 'si', 'Las dos limpian: una casa o las áreas de un hotel'),
    ('X03', 'G2347002-1/E2', 'K2764001-1/E2', 'no', 'Comparten la base de recibir y contar dinero, pero las operaciones del banco cuentan como lo que falta (decisión de Santiago, D-058)'),
    ('X04', 'M2981001-1/E1', 'S3497002-2/E1', 'si', 'Las dos preparan equipos y productos de limpieza antes de limpiar'),
]
QUIEN = {'X03': 'Santiago (26-10)'}  # marcas que decidió una persona; el resto, Claude


def metricas(filas, campo, umbral, mismo_nivel=False):
    vp = fp = fn = vn = 0
    for f in filas:
        positivo = f[campo] >= umbral and (not mismo_nivel or f['nivel_a'] == f['nivel_b'])
        if f['marca'] == 'si':
            vp, fn = vp + positivo, fn + (not positivo)
        else:
            fp, vn = fp + positivo, vn + (not positivo)
    precision = vp / (vp + fp) if vp + fp else 0
    cobertura = vp / (vp + fn) if vp + fn else 0
    f1 = 2 * precision * cobertura / (precision + cobertura) if precision + cobertura else 0
    return vp, fp, fn, vn, precision, cobertura, f1


def main():
    datos = json.load(open(sys.argv[1], encoding='utf-8'))
    carpeta = sys.argv[2]
    nivel = {e['id']: e['nivel'] for e in datos['elementos']}
    sim = {frozenset((p['a'], p['b'])): p for p in datos['pares']}
    clave = {r['par']: r for r in csv.DictReader(open(f'{carpeta}/pares_clave.csv', encoding='utf-8'))}
    pares = [(par, clave[par]['codigo_a'], clave[par]['codigo_b'], m, r) for par, (m, r) in MARCAS_MUESTRA.items()]
    pares += MARCAS_EXTRA
    filas = []
    for par, a, b, marca, razon in pares:
        p = sim[frozenset((a, b))]
        filas.append({'par': par, 'codigo_a': a, 'codigo_b': b, 'marca': marca, 'razon': razon,
                      'sim_elemento': p['sim_elemento'], 'sim_con_ejemplos': p['sim_con_ejemplos'],
                      'nivel_a': nivel[a], 'nivel_b': nivel[b]})
    with open(f'{carpeta}/pares_marcados.csv', 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        w.writerow(['par', 'codigo_a', 'codigo_b', 'es_la_misma', 'quien', 'nota', 'sim_elemento', 'sim_con_ejemplos'])
        f.write('# Marcas de Claude (IA) a pedido de Santiago, 26-10, por revisar por Santiago (D-056). '
                'es_la_misma: si | no | no_se. Los no_se no cuentan para el umbral.\n')
        for x in filas:
            w.writerow([x['par'], x['codigo_a'], x['codigo_b'], x['marca'], QUIEN.get(x['par'], 'Claude (IA), por revisar'), x['razon'],
                        x['sim_elemento'], x['sim_con_ejemplos']])
    validas = [x for x in filas if x['marca'] != 'no_se']
    conteo = {m: sum(1 for x in filas if x['marca'] == m) for m in ('si', 'no', 'no_se')}
    print(f'{len(filas)} pares marcados: {conteo}')
    for campo in ('sim_elemento', 'sim_con_ejemplos'):
        si = sorted(x[campo] for x in validas if x['marca'] == 'si')
        no = sorted(x[campo] for x in validas if x['marca'] == 'no')
        # probabilidad de que un "sí" tenga más similitud que un "no" (área bajo la curva)
        auc = sum((s > n) + 0.5 * (s == n) for s in si for n in no) / (len(si) * len(no))
        print(f'\n== {campo}: "sí" de {si[0]:.3f} a {si[-1]:.3f}; "no" hasta {no[-1]:.3f}; AUC {auc:.3f}')
        for mismo in (False, True):
            mejor = max((metricas(validas, campo, u / 1000, mismo) + (u / 1000,) for u in range(600, 960, 5)),
                        key=lambda m: (m[6], m[4]))
            vp, fp, fn, vn, pr, co, f1, u = mejor
            regla = 'mismo nivel y ' if mismo else ''
            print(f'  mejor umbral ({regla}similitud ≥ {u:.3f}): F1 {f1:.2f} · precisión {pr:.2f} · cobertura {co:.2f} '
                  f'· {vp} sí bien, {fn} sí perdidos, {fp} no aceptados')


if __name__ == '__main__':
    main()
