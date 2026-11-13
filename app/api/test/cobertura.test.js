import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularCobertura, decidirPar, rotulo } from '../src/cobertura.js';

const par = (similitud, es_equivalente, metodo = 'similitud') => ({ similitud, es_equivalente, metodo });

test('cuenta compartidas y faltantes con pesos iguales (D-052)', () => {
  const pares = new Map([
    ['o1|d1', par(0.9, true)],
    ['o2|d2', par(0.4, false)],
  ]);
  const r = calcularCobertura(['o1', 'o2'], ['d1', 'd2', 'd3'], pares);
  assert.equal(r.tiene, 1);
  assert.equal(r.total, 3);
  assert.equal(r.porcentaje, 33);
  assert.deepEqual(r.faltantes, ['d2', 'd3']);
  assert.equal(r.compartidas[0].origen, 'o1');
});

test('busca el par en los dos sentidos y elige el más parecido', () => {
  const pares = new Map([
    ['d1|o1', par(0.7, true)],
    ['o2|d1', par(0.8, true)],
  ]);
  const r = calcularCobertura(['o1', 'o2'], ['d1'], pares);
  assert.equal(r.compartidas[0].origen, 'o2');
});

test('sin competencias confirmadas no tiene nada', () => {
  const r = calcularCobertura([], ['d1', 'd2'], new Map());
  assert.equal(r.tiene, 0);
  assert.equal(r.porcentaje, 0);
});

test('lo validado por el equipo manda sobre el umbral', () => {
  assert.deepEqual(decidirPar({ similitud: 0.2, validacion: true, umbral: 0.6 }), { metodo: 'validado', es_equivalente: true });
  assert.deepEqual(decidirPar({ similitud: 0.9, validacion: false, umbral: 0.6 }), { metodo: 'validado', es_equivalente: false });
  assert.deepEqual(decidirPar({ similitud: 0.65, validacion: undefined, umbral: 0.6 }), { metodo: 'similitud', es_equivalente: true });
  // Con Laya, `similitud` es su probabilidad y el método queda registrado como 'decision'.
  assert.deepEqual(decidirPar({ similitud: 0.82, validacion: undefined, umbral: 0.5, metodo: 'decision' }), { metodo: 'decision', es_equivalente: true });
  assert.deepEqual(decidirPar({ similitud: 0.82, validacion: false, umbral: 0.5, metodo: 'decision' }), { metodo: 'validado', es_equivalente: false });
});

test('el rótulo habla de tareas, no de compatibilidad', () => {
  assert.equal(rotulo({ tiene: 3, total: 4, porcentaje: 75 }), 'Tienes 3 de 4 tareas · 75 %');
});
