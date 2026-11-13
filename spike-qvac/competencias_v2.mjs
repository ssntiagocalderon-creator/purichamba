// PRUEBA DESECHABLE v2: igual que competencias.mjs, pero la IA ya no juzga 25 estándares a la vez
// (en v1 se confundía y repetía). Ahora:
//   - por cada actividad se buscan los 3 estándares más parecidos
//   - la IA responde sí/no para cada par actividad-estándar, con un prompt corto
//   - si una actividad no calza con ningún estándar, se reporta el más cercano como "puente"
// Uso: node competencias_v2.mjs audio/jhon.wav [QWEN3_4B_INST_Q4_K_M | QWEN3_1_7B_INST_Q4]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as sdk from '@qvac/sdk';
const {
  loadModel, unloadModel, transcribe, completion, close, ragIngest, ragSearch, ragListWorkspaces,
  PARAKEET_TDT_0_6B_V3_Q8_0, EMBEDDINGGEMMA_300M_Q8_0,
} = sdk;

const audio = process.argv[2];
const llmNombre = process.argv[3] || 'QWEN3_4B_INST_Q4_K_M';
const WORKSPACE = 'ecl-mtpe-2026-09-04';
const TOP_K = 3;
const tiempos = {};
const cron = async (etapa, fn) => {
  const t = performance.now();
  const r = await fn();
  tiempos[etapa] = Number(((performance.now() - t) / 1000).toFixed(1));
  return r;
};

const matriz = JSON.parse(readFileSync('../datos/procesados/mtpe_estandares_competencia.json', 'utf8'));
const ecl = matriz.registros.filter((r) => r.vigente_al_2026_10_20);
const porCodigo = new Map(ecl.map((r) => [r.codigo_ecl, r]));
const textoEcl = (r) => [`[${r.codigo_ecl}]`, r.perfil_ocupacional ? `Perfil: ${r.perfil_ocupacional}.` : '', r.nombre_ecl ? `Estándar: ${r.nombre_ecl}.` : '',
  r.descripcion_ecl || '', r.puestos_asociados ? `Puestos: ${r.puestos_asociados}.` : ''].filter(Boolean).join(' ');
const nombreEcl = (r) => `${(r.perfil_ocupacional || r.nombre_ecl || '').replace(/^Perfil Ocupacional de /i, '')} — ${r.puestos_asociados || r.codigo_ecl}`;

const esquema = (name, schema) => ({ type: 'json_schema', json_schema: { name, schema } });
async function pedirJson(modelId, sistema, usuario, formato) {
  const run = completion({ modelId, stream: false, responseFormat: formato,
    history: [{ role: 'system', content: `${sistema} /no_think` }, { role: 'user', content: usuario }] });
  return JSON.parse((await run.final).contentText.trim());
}

try {
  console.log(`\n▸ ${audio} | ${llmNombre}`);
  const asr = await loadModel({ modelSrc: PARAKEET_TDT_0_6B_V3_Q8_0, modelType: 'parakeet-transcription' });
  const relato = (await cron('voz_a_texto', () => transcribe({ modelId: asr, audioChunk: audio }))).trim();
  await unloadModel({ modelId: asr });

  const llm = await loadModel({ modelSrc: sdk[llmNombre], modelConfig: { ctx_size: 4096 } });
  const { actividades } = await cron('actividades', () => pedirJson(llm,
    'Eres orientador laboral del Ministerio de Trabajo del Perú. Separa el relato de un trabajador en actividades laborales concretas que realiza (verbo + objeto, en español neutro y técnico). Para cada una copia la frase exacta del relato que la respalda. No inventes nada que no esté en el relato.',
    relato,
    esquema('actividades', { type: 'object', additionalProperties: false, required: ['actividades'], properties: {
      actividades: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['actividad', 'cita'], properties: { actividad: { type: 'string' }, cita: { type: 'string' } } } } } })));

  const emb = await loadModel({ modelSrc: EMBEDDINGGEMMA_300M_Q8_0 });
  const existentes = (await ragListWorkspaces()).map((w) => (typeof w === 'string' ? w : w.name));
  if (!existentes.includes(WORKSPACE)) {
    await ragIngest({ modelId: emb, workspace: WORKSPACE, chunk: false,
      documents: ecl.map((r) => `title: ${r.perfil_ocupacional || r.nombre_ecl || 'none'} | text: ${textoEcl(r)}`) });
  }
  const pares = [];
  await cron('busqueda', async () => {
    for (const a of actividades) {
      const res = await ragSearch({ modelId: emb, workspace: WORKSPACE, query: `task: search result | query: ${a.actividad}`, topK: TOP_K });
      a.candidatos = res.map((r) => ({ codigo: r.content.match(/\[([A-Z0-9-]+)\]/)?.[1], score: Number(r.score.toFixed(3)) })).filter((c) => porCodigo.has(c.codigo));
      a.candidatos.forEach((c) => pares.push({ a, c }));
    }
  });
  await unloadModel({ modelId: emb });

  // Sí/no por par, prompt corto
  await cron('verificacion_si_no', async () => {
    for (const { a, c } of pares) {
      const r = porCodigo.get(c.codigo);
      const { coincide } = await pedirJson(llm,
        'Eres evaluador de competencias laborales. Responde si la actividad que realiza el trabajador demuestra directamente la función que describe el estándar oficial. Responde false si solo se parecen en una palabra o si el estándar es de otro oficio.',
        `ACTIVIDAD: ${a.actividad} (el trabajador dijo: "${a.cita}")\nESTÁNDAR: ${textoEcl(r)}`,
        esquema('veredicto', { type: 'object', additionalProperties: false, required: ['coincide'], properties: { coincide: { type: 'boolean' } } }));
      c.coincide = coincide;
    }
  });
  await unloadModel({ modelId: llm });

  console.log(`  relato: "${relato}"`);
  const competencias = new Map();
  for (const a of actividades) {
    const ok = a.candidatos.filter((c) => c.coincide);
    console.log(`\n  · ${a.actividad}  ←  "${a.cita}"`);
    if (ok.length) {
      ok.forEach((c) => {
        console.log(`      ✔ ${nombreEcl(porCodigo.get(c.codigo))} (${c.codigo}, similitud ${c.score})`);
        if (!competencias.has(c.codigo)) competencias.set(c.codigo, []);
        competencias.get(c.codigo).push(a.cita);
      });
    } else {
      const c = a.candidatos[0];
      console.log(`      ✘ sin estándar oficial | más cercano (puente): ${c ? `${nombreEcl(porCodigo.get(c.codigo))} (${c.score})` : '—'}`);
    }
  }
  console.log(`\n▸ ${competencias.size} competencias oficiales distintas | tiempos`, tiempos, `| pares evaluados: ${pares.length}`);
  // Audios reales: resultados a una carpeta excluida de git (D-017 del plan)
  const carpeta = audio.includes('/reales/') ? 'audio/reales/resultados' : 'resultados';
  mkdirSync(carpeta, { recursive: true });
  const nombre = audio.split('/').pop().replace('.wav', '');
  writeFileSync(`${carpeta}/v2-${nombre}-${llmNombre}.json`, JSON.stringify({ audio, modelo: llmNombre, relato, actividades, competencias: Object.fromEntries(competencias), tiempos }, null, 1));
  await close();
  process.exit(0);
} catch (e) {
  console.error('✖', e);
  process.exit(1);
}
