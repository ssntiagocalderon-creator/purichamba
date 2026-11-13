// Cliente del servidor de Tether contra un servidor falso local (sin token real ni red).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';

const recibidos = [];
const servidor = createServer((req, res) => {
  let cuerpo = '';
  req.on('data', (c) => { cuerpo += c; });
  req.on('end', () => {
    recibidos.push({ ruta: req.url, auth: req.headers.authorization, cuerpo: cuerpo ? JSON.parse(cuerpo) : null });
    res.setHeader('content-type', 'application/json');
    if (req.headers.authorization !== 'Bearer token-de-prueba') {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'no autorizado' }));
    } else if (req.url === '/v1/models') {
      res.end(JSON.stringify({ data: [{ id: 'modelo-de-prueba' }] }));
    } else {
      res.end(JSON.stringify({ model: 'modelo-de-prueba', choices: [{ message: { content: '<think>\n</think>\nPuedes pasar a cajero de banco.' } }] }));
    }
  });
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
after(() => servidor.close());

process.env.TETHER_URL = `http://127.0.0.1:${servidor.address().port}/v1/`;
process.env.TETHER_TOKEN = 'token-de-prueba';
process.env.TETHER_MODELO = 'modelo-de-prueba';
process.env.EXPLICACION = 'tether';
const { chatTether, modelosTether } = await import('../src/tether.js');
const { explicarConIa } = await import('../src/ia.js');

test('lista modelos con el token y acepta la URL con /v1 al final', async () => {
  assert.deepEqual(await modelosTether(), ['modelo-de-prueba']);
  assert.equal(recibidos.at(-1).ruta, '/v1/models');
  assert.equal(recibidos.at(-1).auth, 'Bearer token-de-prueba');
});

test('el chat apaga el razonamiento y quita <think>', async () => {
  const { texto } = await chatTether({ messages: [{ role: 'user', content: 'hola' }] });
  assert.equal(texto, 'Puedes pasar a cajero de banco.');
  const { cuerpo } = recibidos.at(-1);
  assert.equal(cuerpo.reasoning_budget, false);
  assert.equal(cuerpo.chat_template_kwargs.enable_thinking, false);
  assert.equal(cuerpo.model, 'modelo-de-prueba');
});

test('la explicación solo envía datos oficiales, no el relato de la persona', async () => {
  const r = await explicarConIa({
    origen: { nombre_simple: 'Cajero de tienda' },
    destino: { nombre_simple: 'Cajero de banco' },
    compartidasTexto: ['Cobrar en caja'],
    faltantesTexto: ['Operaciones bancarias'],
  });
  assert.deepEqual(r, { texto: 'Puedes pasar a cajero de banco.', generada_por: 'tether' });
  const enviado = JSON.stringify(recibidos.at(-1).cuerpo.messages);
  assert.ok(enviado.includes('Cajero de banco'));
  assert.ok(!enviado.includes('relato'));
});

test('si el servidor rechaza el token, la explicación cae a la plantilla (null)', async () => {
  process.env.TETHER_TOKEN = 'otro';
  const { config } = await import('../src/config.js');
  config.tether.token = 'otro';
  const r = await explicarConIa({ origen: { nombre_simple: 'A' }, destino: { nombre_simple: 'B' }, compartidasTexto: [], faltantesTexto: [] });
  assert.equal(r, null);
});
