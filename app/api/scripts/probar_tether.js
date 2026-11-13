// Prueba del servidor delegado de Tether. NO necesita Postgres ni modelos locales.
//   npm run tether:probar
// Necesita en .env: TETHER_URL y TETHER_TOKEN (el token NUNCA va en git ni en chats).
// Comprueba:
//   1. Qué modelos ofrece el servidor (GET /v1/models) → el nombre va en TETHER_MODELO.
//   2. Latencia de una explicación corta (lo que hace la app).
//   3. Si respeta response_format con json_schema.
// Solo envía textos oficiales de competencias de ejemplo; ningún dato de personas.
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { config } from '../src/config.js';
import { chatTether, modelosTether, tetherDisponible } from '../src/tether.js';

const seg = (inicio) => Number(((performance.now() - inicio) / 1000).toFixed(1));
const resultado = { fecha: new Date().toISOString(), url_configurada: Boolean(config.tether.url), modelo_configurado: config.tether.modelo || null };

if (!tetherDisponible()) {
  console.error('✗ Falta TETHER_URL o TETHER_TOKEN en app/api/.env (copia .env.example).');
  process.exit(1);
}

try {
  console.log('\n1) Modelos disponibles (GET /v1/models)…');
  let inicio = performance.now();
  resultado.modelos = await modelosTether();
  console.log(`   ✓ ${seg(inicio)} s · ${resultado.modelos.join(', ') || '(lista vacía)'}`);
  if (!config.tether.modelo && resultado.modelos.length) {
    console.log(`   → Pon en .env: TETHER_MODELO=${resultado.modelos[0]}`);
  }

  console.log('\n2) Explicación corta…');
  inicio = performance.now();
  const explicacion = await chatTether({
    messages: [
      { role: 'system', content: 'Explica en 2 frases simples, en español peruano y tuteando, por qué una persona puede pasar de una ocupación a otra. Usa solo los datos que te doy.' },
      { role: 'user', content: JSON.stringify({ desde: 'Cajero de tienda', hacia: 'Cajero de banco', ya_tiene: ['Atender al cliente', 'Cobrar en caja'], le_falta: ['Operaciones bancarias'] }) },
    ],
    maxTokens: 200,
  });
  resultado.explicacion = { segundos: seg(inicio), texto: explicacion.texto, modelo: explicacion.modelo, uso: explicacion.uso };
  console.log(`   ✓ ${resultado.explicacion.segundos} s · ${explicacion.modelo}\n   "${explicacion.texto}"`);

  console.log('\n3) ¿Respeta response_format (json_schema)?');
  inicio = performance.now();
  const json = await chatTether({
    messages: [{ role: 'user', content: 'Clasifica: "cuadro la caja al cerrar". ¿Es una tarea de cajero?' }],
    responseFormat: {
      type: 'json_schema',
      json_schema: {
        name: 'clasificacion',
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['es_cajero', 'motivo'],
          properties: { es_cajero: { type: 'boolean' }, motivo: { type: 'string' } },
        },
      },
    },
    maxTokens: 150,
  });
  let valido = false;
  try {
    const datos = JSON.parse(json.texto);
    valido = typeof datos.es_cajero === 'boolean' && typeof datos.motivo === 'string';
  } catch { /* no es JSON */ }
  resultado.json_schema = { segundos: seg(inicio), respetado: valido, texto: json.texto };
  console.log(`   ${valido ? '✓ sí' : '⚠ no'} · ${resultado.json_schema.segundos} s\n   ${json.texto}`);
} catch (error) {
  resultado.error = error.message;
  console.error(`\n✗ ${error.message}`);
  process.exitCode = 1;
} finally {
  // El archivo no incluye el token ni la URL.
  mkdirSync(new URL('../resultados/', import.meta.url), { recursive: true });
  const archivo = new URL(`../resultados/tether-${resultado.fecha.slice(0, 16).replace(/[:T]/g, '-')}.json`, import.meta.url);
  writeFileSync(archivo, JSON.stringify(resultado, null, 2));
  console.log(`\nResultados guardados en ${fileURLToPath(archivo)}`);
}
