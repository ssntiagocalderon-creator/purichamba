import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elegirPreguntas } from '../src/preguntas.js';

const c = (id, ocupacion_id) => ({ id, ocupacion_id });
const CANDIDATAS = [
  c('C-1', 'cajero'), c('C-2', 'cajero'), c('C-3', 'cajero'),
  c('V-1', 'vendedor'), c('V-2', 'vendedor'), c('A-1', 'almacen'), c('A-2', 'almacen'), c('L-1', 'limpieza'),
];
const p = (codigo, probabilidad) => ({ codigo, cita: `frase de ${codigo}`, probabilidad });

test('nunca más de 5 y primero las de su ocupación', () => {
  const propuestas = ['V-1', 'A-1', 'A-2', 'L-1', 'V-2', 'C-2'].map((x) => p(x));
  const r = elegirPreguntas({ propuestas, candidatas: CANDIDATAS, ocupacionId: 'cajero' });
  assert.equal(r.length, 5);
  assert.equal(r[0].id, 'C-2');
  assert.ok(r.every((x) => x.propuesta));
});

test('si reconoce poco, completa con su ocupación sin cita', () => {
  const r = elegirPreguntas({ propuestas: [p('V-1')], candidatas: CANDIDATAS, ocupacionId: 'cajero' });
  assert.deepEqual(r.map((x) => [x.id, x.propuesta]), [['V-1', true], ['C-1', false], ['C-2', false], ['C-3', false]]);
  assert.equal(r[1].cita, null);
});

test('sin texto, pregunta las de su ocupación', () => {
  const r = elegirPreguntas({ propuestas: [], candidatas: CANDIDATAS, ocupacionId: 'cajero' });
  assert.deepEqual(r.map((x) => x.id), ['C-1', 'C-2', 'C-3']);
});

test('al contar más, no repite lo ya preguntado y no rellena', () => {
  const r = elegirPreguntas({
    propuestas: [p('C-1'), p('A-1'), p('V-2')],
    candidatas: CANDIDATAS,
    ocupacionId: 'cajero',
    yaPreguntadas: new Set(['C-1', 'C-2', 'C-3', 'V-1']),
    completar: false,
  });
  assert.deepEqual(r.map((x) => x.id), ['A-1', 'V-2']);
});

test('entre otras ocupaciones va primero la más probable (Laya)', () => {
  const r = elegirPreguntas({ propuestas: [p('V-1', 0.6), p('A-1', 0.9)], candidatas: CANDIDATAS, ocupacionId: 'cajero', completar: false });
  assert.deepEqual(r.map((x) => x.id), ['A-1', 'V-1']);
});

test('descarta códigos que no están entre las candidatas', () => {
  const r = elegirPreguntas({ propuestas: [p('X-9')], candidatas: CANDIDATAS, ocupacionId: 'cajero', completar: false });
  assert.deepEqual(r, []);
});
