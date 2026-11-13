"""Arma el Excel que el equipo llena a mano: cada persona marca si cada par de tareas "es la misma" (D-053).

Lee app/datos/pares_por_marcar.csv y escribe un .xlsx con dos hojas: "Cómo marcar" (instrucciones y un ejemplo)
y "Pares" (los pares, con una lista desplegable Sí / No / No sé). No lleva fórmulas ni puntajes.

Uso: python3 -I pares_a_excel.py <app/datos> <salida.xlsx>
"""
import csv
import sys

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.worksheet.datavalidation import DataValidation

carpeta, salida = sys.argv[1], sys.argv[2]
filas = list(csv.DictReader(l for l in open(f'{carpeta}/pares_por_marcar.csv', encoding='utf-8') if not l.startswith('#')))

ARIAL = 'Arial'
amarillo = PatternFill('solid', start_color='FFF2CC')
gris = PatternFill('solid', start_color='E7E6E6')
borde = Border(*(Side(style='thin', color='BFBFBF'),) * 4)
envolver = Alignment(wrap_text=True, vertical='top')

libro = Workbook()
hoja = libro.active
hoja.title = 'Cómo marcar'
texto = [
    ('¿Es la misma tarea?', Font(name=ARIAL, size=14, bold=True)),
    ('', None),
    ('Vas a ver 60 pares de tareas de ocupaciones distintas, sacadas de los perfiles oficiales del MTPE.', None),
    ('Para cada par, piensa en una persona que ya hace bien la tarea A. Pregúntate: ¿ya sabe hacer la tarea B, o casi?', None),
    ('   Sí: es la misma tarea o casi, aunque se diga distinto o sea en otro lugar.', None),
    ('   No: son tareas distintas, aunque usen palabras parecidas.', None),
    ('   No sé: si de verdad dudas. Mejor "No sé" que adivinar.', None),
    ('', None),
    ('Mira los "Ejemplos": son acciones concretas de cada tarea y ayudan a decidir.', None),
    ('Marca por tu cuenta, sin mirar lo que marcan los demás. No hay respuestas correctas: queremos tu criterio.', None),
    ('Toma unos 20 minutos.', None),
    ('', None),
    ('Qué llenar (celdas amarillas de la hoja "Pares"):', Font(name=ARIAL, size=11, bold=True)),
    ('   Tu nombre, en la celda B3.', None),
    ('   La columna "¿Es la misma?", eligiendo de la lista: Sí, No o No sé.', None),
    ('   La columna "Comentario", si quieres explicar una duda (opcional).', None),
    ('Al terminar, guarda el archivo con tu nombre (por ejemplo, pares_Maria.xlsx) y envíaselo a Santiago.', None),
    ('', None),
    ('Ejemplo de una fila ya marcada (inventado; no es parte de los 60):', Font(name=ARIAL, size=11, bold=True)),
]
for i, (t, fuente) in enumerate(texto, 1):
    c = hoja.cell(row=i, column=1, value=t)
    c.font = fuente or Font(name=ARIAL, size=11)
ejemplo_encabezado = ['Ocupación A', 'Tarea A', 'Ocupación B', 'Tarea B', '¿Es la misma?', 'Comentario']
# Ejemplo inventado, de ocupaciones que no están en la lista, para no influir en ningún par.
ejemplo = ['Panadero', 'Hornear el pan.', 'Ayudante de pastelería', 'Hornear tortas y queques.', 'Sí',
           'Las dos son hornear masas; cambia el producto.']
fila_ej = len(texto) + 1
for j, (h, v) in enumerate(zip(ejemplo_encabezado, ejemplo), 1):
    a = hoja.cell(row=fila_ej, column=j, value=h)
    a.font, a.fill, a.border = Font(name=ARIAL, size=10, bold=True), gris, borde
    b = hoja.cell(row=fila_ej + 1, column=j, value=v)
    b.font, b.alignment, b.border = Font(name=ARIAL, size=10), envolver, borde
    if j >= 5:
        b.fill = amarillo
hoja.column_dimensions['A'].width = 24
for col, ancho in zip('BCDEF', (34, 26, 34, 14, 40)):
    hoja.column_dimensions[col].width = ancho

pares = libro.create_sheet('Pares')
pares['A1'] = 'Pares de tareas para marcar'
pares['A1'].font = Font(name=ARIAL, size=14, bold=True)
pares['A3'] = 'Tu nombre:'
pares['A3'].font = Font(name=ARIAL, size=11, bold=True)
pares['B3'].fill = amarillo
pares['B3'].border = borde
pares['B3'].font = Font(name=ARIAL, size=11)
encabezado = ['N°', 'Ocupación A', 'Tarea A', 'Ejemplos de A', 'Ocupación B', 'Tarea B', 'Ejemplos de B',
              '¿Es la misma?', 'Comentario']
for j, h in enumerate(encabezado, 1):
    c = pares.cell(row=5, column=j, value=h)
    c.font, c.fill, c.border = Font(name=ARIAL, size=10, bold=True), gris, borde
    c.alignment = Alignment(wrap_text=True, vertical='center')
for i, f in enumerate(filas, 6):
    valores = [f['par'], f['ocupacion_a'], f['tarea_a'], f['ejemplos_a'], f['ocupacion_b'], f['tarea_b'],
               f['ejemplos_b'], '', '']
    for j, v in enumerate(valores, 1):
        c = pares.cell(row=i, column=j, value=v)
        c.font, c.alignment, c.border = Font(name=ARIAL, size=10), envolver, borde
        if j >= 8:
            c.fill = amarillo
ultima = 5 + len(filas)
lista = DataValidation(type='list', formula1='"Sí,No,No sé"', allow_blank=True)
lista.error, lista.errorTitle = 'Elige Sí, No o No sé.', 'Respuesta no válida'
lista.prompt, lista.promptTitle = 'Sí, No o No sé', '¿Es la misma tarea?'
pares.add_data_validation(lista)
lista.add(f'H6:H{ultima}')
for col, ancho in zip('ABCDEFGHI', (6, 16, 30, 40, 16, 30, 40, 12, 30)):
    pares.column_dimensions[col].width = ancho
pares.freeze_panes = 'C6'
libro.save(salida)
print(f'{len(filas)} pares en {salida}')
