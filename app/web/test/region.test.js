// Comprueba que el GPS se traduce al departamento correcto (sin navegador).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { REGIONES, regionDePunto } from '../src/region.js';

const limites = JSON.parse(readFileSync(new URL('../src/datos/departamentos.json', import.meta.url), 'utf8'));

const CIUDADES = [
  ['Plaza de Armas de Lima', -12.0464, -77.0300, 'Lima'],
  ['Universidad de Lima (Surco)', -12.0846, -76.9711, 'Lima'],
  ['Comas', -11.9577, -77.0490, 'Lima'],
  ['Huacho', -11.1067, -77.6050, 'Lima'],
  ['Callao (puerto)', -12.0566, -77.1181, 'Callao'],
  ['Arequipa', -16.4090, -71.5375, 'Arequipa'],
  ['Cusco', -13.5320, -71.9675, 'Cusco'],
  ['Trujillo', -8.1116, -79.0288, 'La Libertad'],
  ['Iquitos', -3.7437, -73.2516, 'Loreto'],
  ['Huaraz', -9.5278, -77.5278, 'Áncash'],
  ['Chachapoyas', -6.2317, -77.8690, 'Amazonas'],
  ['Puno', -15.8402, -70.0219, 'Puno'],
];

for (const [lugar, lat, lon, esperada] of CIUDADES) {
  test(`${lugar} → ${esperada}`, () => assert.equal(regionDePunto(lat, lon, limites), esperada));
}

test('fuera del Perú no devuelve región', () => {
  assert.equal(regionDePunto(-34.6037, -58.3816, limites), null); // Buenos Aires
  assert.equal(regionDePunto(-12.0, -80.0, limites), null); // mar frente a Lima
});

test('los límites cubren exactamente los 25 departamentos de la lista', () => {
  assert.deepEqual([...new Set(limites.departamentos.map((d) => d.region))].sort(), [...REGIONES].sort());
});
