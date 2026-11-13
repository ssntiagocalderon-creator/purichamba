import { test } from 'node:test';
import assert from 'node:assert/strict';
import { digitoVerificador, errorDeRuc } from '../src/ruc.js';
import { coberturaDeEstandares } from '../src/tareas.js';

// RUC de SUNAT, publicado en su propio portal: 20131312955.
test('acepta un RUC con dígito verificador correcto', () => {
  assert.equal(digitoVerificador('2013131295'), 5);
  assert.equal(errorDeRuc('20131312955'), null);
  assert.equal(errorDeRuc(' 20131312955 '), null);
});

test('rechaza RUC mal escritos', () => {
  assert.match(errorDeRuc('2013131295'), /11 dígitos/);
  assert.match(errorDeRuc('20131-12955'), /11 dígitos/);
  assert.match(errorDeRuc('30131312955'), /empieza con 10 o 20/);
  assert.match(errorDeRuc('20131312954'), /no es válido/);
  assert.match(errorDeRuc(null), /11 dígitos/);
});

test('los restos 10 y 11 dan dígito 0 y 1, como en SUNAT', () => {
  // Se busca un número de cada caso y se comprueba la regla: 11 - resto, y 10 → 0, 11 → 1.
  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const resto = (d) => pesos.reduce((t, p, i) => t + p * Number(d[i]), 0) % 11;
  for (let n = 2000000000; n < 2000000200; n += 1) {
    const d = String(n);
    const esperado = { 0: 1, 1: 0 }[resto(d)] ?? 11 - resto(d);
    assert.equal(digitoVerificador(d), esperado);
  }
});

test('frente al aviso cuentan solo los estándares que pide la empresa', () => {
  // El aviso pide solo K2764001-1 (3 tareas): la cajera de tienda tiene 2, como en D-058.
  const r = coberturaDeEstandares(['G2347002-1'], ['K2764001-1']);
  assert.equal(r.tiene, 2);
  assert.equal(r.total, 3);
  assert.deepEqual(r.faltantes, ['K2764001-1/E2']);
});
