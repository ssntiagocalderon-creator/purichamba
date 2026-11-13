import { test } from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { claveValida, protegerConClave } from '../src/acceso.js';

const basica = (usuario, clave) => `Basic ${Buffer.from(`${usuario}:${clave}`).toString('base64')}`;

test('sin clave configurada, todo pasa', () => {
  assert.ok(claveValida(undefined, ''));
});

test('acepta cualquier usuario con la clave correcta y rechaza lo demás', () => {
  assert.ok(claveValida(basica('jurado', 'tether2026'), 'tether2026'));
  assert.ok(!claveValida(basica('jurado', 'otra'), 'tether2026'));
  assert.ok(!claveValida('Bearer tether2026', 'tether2026'));
  assert.ok(!claveValida(undefined, 'tether2026'));
});

test('el servidor responde 401 sin clave y 200 con clave', async () => {
  const app = Fastify();
  protegerConClave(app, 'tether2026');
  app.get('/api/salud', async () => ({ ok: true }));
  const sin = await app.inject({ url: '/api/salud' });
  assert.equal(sin.statusCode, 401);
  assert.match(sin.headers['www-authenticate'], /^Basic/);
  const con = await app.inject({ url: '/api/salud', headers: { authorization: basica('x', 'tether2026') } });
  assert.equal(con.statusCode, 200);
});
