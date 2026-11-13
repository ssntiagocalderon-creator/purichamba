// PRUEBA DESECHABLE: del relato de un trabajador a competencias oficiales del MTPE, todo local con QVAC.
//   1. Voz a texto (Parakeet)
//   2. La IA separa el relato en actividades concretas
//   3. Búsqueda por significado de cada actividad entre los estándares vigentes del MTPE
//   4. La IA decide cuáles estándares sí están respaldados por el relato, citando la frase
//   5. Cálculo (sin IA) de qué tan cerca está de cada perfil ocupacional
// Uso: node competencias.mjs audio/rosa.wav [QWEN3_4B_INST_Q4_K_M | QWEN3_1_7B_INST_Q4]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as sdk from '@qvac/sdk';
const {
  loadModel, unloadModel, transcribe, completion, close,
  ragIngest, ragSearch, ragListWorkspaces,
  PARAKEET_TDT_0_6B_V3_Q8_0, EMBEDDINGGEMMA_300M_Q8_0,
} = sdk;

const audio = process.argv[2];
const llmNombre = process.argv[3] || 'QWEN3_4B_INST_Q4_K_M';
const WORKSPACE = 'ecl-mtpe-2026-09-04';
const tiempos = {};
const cron = async (etapa, fn) => {
  const t = performance.now();
  const r = await fn();
  tiempos[etapa] = Number(((performance.now() - t) / 1000).toFixed(1));
  console.log(`  ✓ ${etapa}: ${tiempos[etapa]}s`);
  return r;
};
const progreso = (p) => {
  process.stderr.write(`\r  descargando ${p.percentage.toFixed(0)}%   `);
  if (p.percentage >= 100) process.stderr.write('\n');
};

// Estándares de competencia vigentes (Matriz MTPE, 04-09-2026)
const matriz = JSON.parse(readFileSync('../datos/procesados/mtpe_estandares_competencia.json', 'utf8'));
const ecl = matriz.registros.filter((r) => r.vigente_al_2026_10_20);
const porCodigo = new Map(ecl.map((r) => [r.codigo_ecl, r]));
const textoEcl = (r) => [
  `[${r.codigo_ecl}]`,
  r.perfil_ocupacional ? `Perfil: ${r.perfil_ocupacional}.` : '',
  r.nombre_ecl ? `Estándar: ${r.nombre_ecl}.` : '',
  r.descripcion_ecl || '',
  r.puestos_asociados ? `Puestos: ${r.puestos_asociados}.` : '',
].filter(Boolean).join(' ');

// Salida de la IA con formato obligatorio (json_schema) para que siempre se pueda leer
const esquema = (name, schema) => ({ type: 'json_schema', json_schema: { name, schema } });
async function pedirJson(modelId, sistema, usuario, formato) {
  const run = completion({
    modelId, stream: false, responseFormat: formato,
    history: [{ role: 'system', content: `${sistema} /no_think` }, { role: 'user', content: usuario }],
  });
  const final = await run.final;
  return JSON.parse(final.contentText.trim());
}

try {
  console.log(`\n▸ Audio: ${audio} | modelo de lenguaje: ${llmNombre}`);

  // 1. Voz a texto
  const asr = await loadModel({ modelSrc: PARAKEET_TDT_0_6B_V3_Q8_0, modelType: 'parakeet-transcription', onProgress: progreso });
  const relato = (await cron('1_voz_a_texto', () => transcribe({ modelId: asr, audioChunk: audio }))).trim();
  await unloadModel({ modelId: asr });
  console.log(`  "${relato}"\n`);

  // 2. Actividades concretas
  // ctx_size: por defecto QVAC da 1024 tokens de contexto y la lista de candidatos no entra
  const llm = await cron('carga_modelo_lenguaje', () => loadModel({ modelSrc: sdk[llmNombre], modelConfig: { ctx_size: 8192 }, onProgress: progreso }));
  const { actividades, habilidades_transversales } = await cron('2_actividades', () => pedirJson(llm,
    'Eres orientador laboral del Ministerio de Trabajo del Perú. Separa el relato de un trabajador en actividades laborales concretas que realiza (verbo + objeto, en español neutro y técnico). Para cada una copia la frase exacta del relato que la respalda. Aparte, lista habilidades transversales que se evidencian (por ejemplo atención al cliente, manejo de personal, cálculo, ventas). No inventes nada que no esté en el relato.',
    relato,
    esquema('actividades', {
      type: 'object', additionalProperties: false, required: ['actividades', 'habilidades_transversales'],
      properties: {
        actividades: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['actividad', 'cita'], properties: { actividad: { type: 'string' }, cita: { type: 'string' } } } },
        habilidades_transversales: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['habilidad', 'cita'], properties: { habilidad: { type: 'string' }, cita: { type: 'string' } } } },
      },
    })));
  actividades.forEach((a) => console.log(`    · ${a.actividad}  ←  "${a.cita}"`));

  // 3. Búsqueda por significado entre los estándares (EmbeddingGemma, base vectorial local de QVAC)
  const emb = await loadModel({ modelSrc: EMBEDDINGGEMMA_300M_Q8_0, onProgress: progreso });
  const existentes = (await ragListWorkspaces()).map((w) => (typeof w === 'string' ? w : w.name));
  if (!existentes.includes(WORKSPACE)) {
    await cron('indexar_estandares', () => ragIngest({ modelId: emb, workspace: WORKSPACE, chunk: false,
      documents: ecl.map((r) => `title: ${r.perfil_ocupacional || r.nombre_ecl || 'none'} | text: ${textoEcl(r)}` ) }));
  }
  const candidatos = new Map();
  await cron('3_busqueda', async () => {
    for (const q of [...actividades.map((a) => a.actividad), ...habilidades_transversales.map((h) => h.habilidad)]) {
      const res = await ragSearch({ modelId: emb, workspace: WORKSPACE, query: `task: search result | query: ${q}`, topK: 4 });
      for (const r of res) {
        const cod = r.content.match(/\[([A-Z0-9-]+)\]/)?.[1];
        if (cod && porCodigo.has(cod) && (!candidatos.has(cod) || candidatos.get(cod).score < r.score)) candidatos.set(cod, { score: r.score, por: q });
      }
    }
  });
  await unloadModel({ modelId: emb });
  console.log(`    ${candidatos.size} estándares candidatos`);

  // 4. La IA confirma solo los estándares respaldados por el relato
  const MAX_CANDIDATOS = 25;
  const lista = [...candidatos.entries()].sort((a, b) => b[1].score - a[1].score).slice(0, MAX_CANDIDATOS)
    .map(([c]) => textoEcl(porCodigo.get(c))).join('\n');
  // La IA no escribe citas libres (las inventaba): señala qué actividades numeradas respaldan cada estándar
  const numeradas = actividades.map((a, i) => `${i + 1}. ${a.actividad} ("${a.cita}")`).join('\n');
  const { competencias } = await cron('4_confirmacion', () => pedirJson(llm,
    'Eres evaluador de competencias laborales del Ministerio de Trabajo del Perú. Recibes las actividades que un trabajador dice realizar y una lista de estándares oficiales. Devuelve SOLO los estándares cuya función principal coincide con una o más actividades, indicando los números de esas actividades. Un estándar transversal (por ejemplo seguridad y salud en el trabajo) solo si alguna actividad lo menciona de forma explícita. Si ninguna actividad lo respalda directamente, no lo incluyas. Usa exactamente el código entre corchetes.',
    `ACTIVIDADES DEL TRABAJADOR:\n${numeradas}\n\nESTÁNDARES CANDIDATOS:\n${lista}`,
    esquema('competencias', {
      type: 'object', additionalProperties: false, required: ['competencias'],
      properties: { competencias: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['codigo_ecl', 'actividades', 'confianza'],
        properties: { codigo_ecl: { type: 'string' }, actividades: { type: 'array', items: { type: 'integer' } }, confianza: { type: 'string', enum: ['alta', 'media', 'baja'] } } } } },
    })));
  await unloadModel({ modelId: llm });

  // Control contra invenciones: el código debe existir y apuntar a actividades reales; la cita sale del relato
  const confirmadas = competencias
    .map((c) => ({ ...c, actividades: [...new Set(c.actividades)].filter((n) => n >= 1 && n <= actividades.length) }))
    .filter((c) => porCodigo.has(c.codigo_ecl) && c.actividades.length)
    .map((c) => ({ ...c, cita: [...new Set(c.actividades.map((n) => actividades[n - 1].cita))].join(' / ') }));
  const descartadas = competencias.length - confirmadas.length;

  // 5. Cercanía a perfiles ocupacionales (cálculo directo sobre la matriz, sin IA)
  const perfiles = new Map();
  for (const r of ecl) {
    const k = r.codigo_perfil || r.codigo_ecl;
    if (!perfiles.has(k)) perfiles.set(k, { perfil: r.perfil_ocupacional || r.nombre_ecl, total: 0, tiene: [], faltan: [] });
    perfiles.get(k).total++;
  }
  for (const r of ecl) {
    const p = perfiles.get(r.codigo_perfil || r.codigo_ecl);
    const etiqueta = r.puestos_asociados || r.nombre_ecl || r.codigo_ecl;
    (confirmadas.some((c) => c.codigo_ecl === r.codigo_ecl) ? p.tiene : p.faltan).push(etiqueta);
  }
  const cercanos = [...perfiles.values()].filter((p) => p.tiene.length).sort((a, b) => b.tiene.length / b.total - a.tiene.length / a.total);

  console.log('\n▸ COMPETENCIAS OFICIALES RESPALDADAS POR EL RELATO');
  for (const c of confirmadas) {
    const r = porCodigo.get(c.codigo_ecl);
    console.log(`  [${c.confianza}] ${r.perfil_ocupacional || r.nombre_ecl} — ${r.puestos_asociados || ''} (${c.codigo_ecl})\n      prueba: "${c.cita}"`);
  }
  if (descartadas) console.log(`  (${descartadas} respuesta(s) de la IA descartadas por el control)`);
  console.log('\n▸ HABILIDADES TRANSVERSALES');
  habilidades_transversales.forEach((h) => console.log(`  · ${h.habilidad}  ←  "${h.cita}"`));
  console.log('\n▸ PERFILES OCUPACIONALES MÁS CERCANOS');
  for (const p of cercanos.slice(0, 5)) {
    console.log(`  ${p.perfil}: tiene ${p.tiene.length} de ${p.total} estándares${p.faltan.length ? ` | le falta: ${p.faltan.join('; ')}` : ' | ¡perfil completo!'}`);
  }
  console.log('\n▸ TIEMPOS', tiempos);

  // Audios reales: resultados a una carpeta excluida de git (D-017 del plan)
  const carpeta = audio.includes('/reales/') ? 'audio/reales/resultados' : 'resultados';
  mkdirSync(carpeta, { recursive: true });
  const nombre = audio.split('/').pop().replace('.wav', '');
  writeFileSync(`${carpeta}/${nombre}-${llmNombre}.json`, JSON.stringify({ audio, modelo: llmNombre, relato, actividades, habilidades_transversales, candidatos: Object.fromEntries(candidatos), competencias_ia: competencias, confirmadas, perfiles_cercanos: cercanos.slice(0, 5), tiempos }, null, 1));
  await close();
  process.exit(0);
} catch (e) {
  console.error('✖', e);
  process.exit(1);
}
