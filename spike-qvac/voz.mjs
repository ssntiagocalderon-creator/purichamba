// PRUEBA DESECHABLE: compara dos motores de voz a texto de QVAC con audios en español.
// Uso: node voz.mjs audio/jhon.wav audio/rosa.wav
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import {
  loadModel, unloadModel, transcribe, close,
  WHISPER_SMALL_Q8_0, VAD_SILERO_5_1_2, PARAKEET_TDT_0_6B_V3_Q8_0,
} from '@qvac/sdk';

const audios = process.argv.slice(2);
const progreso = (p) => {
  const mb = (n) => (n / 1e6).toFixed(0);
  process.stderr.write(`\r  descargando ${p.percentage.toFixed(0)}% (${mb(p.downloaded)}/${mb(p.total)} MB)   `);
  if (p.percentage >= 100) process.stderr.write('\n');
};

// Porcentaje de palabras del guion que aparecen en la transcripción (medida simple de calidad)
function aciertoPalabras(original, transcrito) {
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zñ0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  const a = norm(original);
  const b = new Set(norm(transcrito));
  return Math.round((a.filter((w) => b.has(w)).length / a.length) * 100);
}

const motores = [
  {
    nombre: 'Whisper small (multilingüe)',
    cargar: () => loadModel({
      modelSrc: WHISPER_SMALL_Q8_0,
      modelType: 'whisper',
      modelConfig: { vadModelSrc: VAD_SILERO_5_1_2, language: 'es', strategy: 'greedy', no_timestamps: true, temperature: 0.0 },
      onProgress: progreso,
    }),
  },
  {
    nombre: 'Parakeet TDT 0.6B v3 (multilingüe)',
    cargar: () => loadModel({ modelSrc: PARAKEET_TDT_0_6B_V3_Q8_0, modelType: 'parakeet-transcription', onProgress: progreso }),
  },
];

const informe = [];
try {
  for (const m of motores) {
    console.log(`\n▸ ${m.nombre}`);
    let t = performance.now();
    const modelId = await m.cargar();
    const tCarga = ((performance.now() - t) / 1000).toFixed(1);
    for (const a of audios) {
      t = performance.now();
      const texto = await transcribe({ modelId, audioChunk: a });
      const seg = ((performance.now() - t) / 1000).toFixed(1);
      const guion = readFileSync(a.replace(/\.wav$/, '.txt'), 'utf8');
      const acierto = aciertoPalabras(guion, texto);
      console.log(`  ${a}: ${seg}s | ${acierto}% de palabras del guion\n  "${texto.trim()}"`);
      informe.push({ motor: m.nombre, audio: a, segundos: Number(seg), carga_s: Number(tCarga), acierto_palabras_pct: acierto, texto: texto.trim() });
    }
    await unloadModel({ modelId });
  }
  // Audios reales: resultados a una carpeta excluida de git (D-017 del plan)
  const carpeta = audios.some((a) => a.includes('/reales/')) ? 'audio/reales/resultados' : 'resultados';
  mkdirSync(carpeta, { recursive: true });
  writeFileSync(`${carpeta}/voz.json`, JSON.stringify(informe, null, 1));
  await close();
  process.exit(0);
} catch (e) {
  console.error('✖', e);
  process.exit(1);
}
