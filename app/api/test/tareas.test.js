import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coberturaPorTareas, puestoDeEntrada, unidadesDe } from '../src/tareas.js';

const CAJA_FINANCIERA = ['K2764001-1', 'K2764001-2', 'K2764001-3'];

test('cajero de tienda a cajero de banco: 2 de 3 tareas y falta la operación del banco (D-058)', () => {
  const r = coberturaPorTareas(['G2347002-1'], 'caja_financiera', CAJA_FINANCIERA);
  assert.equal(r.tiene, 2);
  assert.equal(r.total, 3);
  assert.deepEqual(r.compartidas.map((c) => c.destino), ['K2764001-1/E1', 'K2764001-1/E3']);
  assert.deepEqual(r.faltantes, ['K2764001-1/E2']);
});

test('una similitud alta sin validar no cuenta (D-057)', () => {
  const pares = new Map([['G2347002-1|K2764001-1', { similitud: 0.9, metodo: 'similitud', es_equivalente: true }]]);
  const r = coberturaPorTareas(['G2347002-1'], 'caja_financiera', CAJA_FINANCIERA, pares);
  assert.equal(r.tiene, 2);
});

test('el destino se mide con su puesto de entrada', () => {
  assert.deepEqual(puestoDeEntrada('caja_financiera', CAJA_FINANCIERA), ['K2764001-1']);
  assert.deepEqual(puestoDeEntrada('ocupacion_sin_lista', ['X-1', 'X-2']), ['X-1', 'X-2']);
});

test('un estándar sin tareas en el detalle cuenta entero', () => {
  assert.deepEqual(unidadesDe(['H2452004-1']), ['H2452004-1']);
  assert.equal(unidadesDe(['K2764001-1']).length, 3);
});
