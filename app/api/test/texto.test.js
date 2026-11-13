import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  citaEsTextual, leerCsv, normalizar, similitudLexica, sinColetilla, sinRazonamiento,
} from '../src/texto.js';
import { elegirPropuestas, proponerCompetencias, textoCompetencia } from '../src/ia.js';

test('normaliza tildes y signos', () => {
  assert.equal(normalizar('¡Cobré en CAJA!'), 'cobre en caja');
});

test('similitud léxica: más alta entre textos parecidos', () => {
  const caja = 'Realizar las transacciones comerciales en caja';
  assert.ok(similitudLexica(caja, 'Ejecutar las operaciones de caja') > similitudLexica(caja, 'Preparar alimentos para la familia'));
});

test('reconoce formas distintas de la misma palabra', () => {
  assert.ok(similitudLexica('cobro en caja', 'Cobrar las ventas en caja') > 0.5);
  assert.ok(similitudLexica('cuadro la caja', 'que la caja cuadre') > 0.5);
});

test('una cita inventada no pasa la validación', () => {
  const dicho = 'cobro con tarjeta y cuadro la caja al final del día';
  assert.ok(citaEsTextual('cuadro la caja', dicho));
  assert.ok(!citaEsTextual('manejo un montacargas', dicho));
});

test('lee CSV con comillas e ignora comentarios', () => {
  const filas = leerCsv('a,b\n# comentario, x\n"uno, dos",tres\n');
  assert.deepEqual(filas, [{ a: 'uno, dos', b: 'tres' }]);
});

test('modo sin IA: el texto simple ayuda a reconocer lo que dice la persona', async () => {
  const competencias = [
    {
      id: 'G2347002-1',
      texto_simple: 'Cobrar y registrar las ventas en caja',
      descripcion: 'Realizar las transacciones comerciales en caja, de acuerdo a los procedimientos establecidos por la empresa y normativa vigente.',
    },
  ];
  const { propuestas } = await proponerCompetencias('Cobro en caja con efectivo y tarjeta', competencias);
  assert.deepEqual(propuestas.map((p) => p.codigo), ['G2347002-1']);
});

test('modo sin IA: propone solo con citas textuales y códigos de la lista', async () => {
  const competencias = [
    { id: 'G2347002-1', descripcion: 'Realizar las transacciones comerciales en caja' },
    { id: 'S3497002-1', descripcion: 'Preparar alimentos para la familia' },
  ];
  const { propuestas, propuesta_por } = await proponerCompetencias('atiendo clientes, hago transacciones en caja', competencias);
  assert.equal(propuesta_por, 'reglas');
  assert.deepEqual(propuestas.map((p) => p.codigo), ['G2347002-1']);
  assert.ok(citaEsTextual(propuestas[0].cita, 'atiendo clientes, hago transacciones en caja'));
});

test('quita la coletilla genérica del MTPE', () => {
  assert.equal(
    sinColetilla('Realizar las transacciones comerciales en caja, de acuerdo a los procedimientos establecidos por la empresa y normativa vigente.'),
    'Realizar las transacciones comerciales en caja',
  );
  assert.equal(sinColetilla('Limpiar ambientes según el plan de trabajo'), 'Limpiar ambientes');
  // Si todo el texto es coletilla, se deja como está.
  assert.equal(sinColetilla('De acuerdo a la normativa'), 'De acuerdo a la normativa');
});

test('quita el bloque <think> de Qwen, aunque venga vacío o sin cerrar', () => {
  assert.equal(sinRazonamiento('<think>\n\n</think>\n\nPuedes pasar a cajero de banco.'), 'Puedes pasar a cajero de banco.');
  assert.equal(sinRazonamiento('<think>pienso…</think>Hola'), 'Hola');
  assert.equal(sinRazonamiento('</think>Hola'), 'Hola');
});

test('texto de la competencia para los modelos: el simple o el oficial sin coletilla', () => {
  assert.equal(textoCompetencia({ texto_simple: 'Cobrar en caja', descripcion: 'X' }), 'Cobrar en caja');
  assert.equal(textoCompetencia({ descripcion: 'Cobrar en caja, de acuerdo a la normativa vigente.' }), 'Cobrar en caja');
});

test('Laya: elige la frase más probable por competencia y aplica el umbral', () => {
  const partes = ['atiendo a los clientes', 'cobro en caja', 'cuadro la caja'];
  const resultados = [
    { answers: { A: { noul: 0.9 }, B: { noul: 0.1 }, C: { noul: 0.2 } } },
    { answers: { A: { noul: 0.3 }, B: { noul: 0.8 }, C: { noul: 0.2 } } },
    { answers: { A: { noul: 0.2 }, B: { noul: 0.6 }, C: { noul: 0.4 } } },
  ];
  const propuestas = elegirPropuestas(partes, ['A', 'B', 'C'], resultados, 0.5);
  assert.deepEqual(propuestas, [
    { codigo: 'A', cita: 'atiendo a los clientes', probabilidad: 0.9 },
    { codigo: 'B', cita: 'cobro en caja', probabilidad: 0.8 },
  ]);
});
