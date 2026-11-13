// Prueba de voz a texto con Parakeet (QVAC) en esta máquina. NO necesita Postgres.
//   npm run voz:probar
// Transcribe los audios FICTICIOS de spike-qvac/audio (voz sintética, AGENTS.md regla 5) de dos formas:
//   - archivo WAV (como en la prueba técnica)
//   - PCM s16le 16 kHz mono en memoria (como lo manda la web: el audio no se guarda en disco)
// Mide la carga, el tiempo por audio y el error por palabra (WER) contra el guion, y guarda
// resultados/voz-<fecha>.json.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

process.env.IA_MODO = 'qvac';
const { config } = await import('../src/config.js');
const ia = await import('../src/ia.js');

const ruta = (relativa) => new URL(relativa, import.meta.url);
const seg = (inicio) => Number(((performance.now() - inicio) / 1000).toFixed(2));

// WER: distancia de edición entre palabras / palabras del guion. Mismo método que C-26 del plan:
// minúsculas, sin tildes ni puntuación, sin normalizar números.
const palabras = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-zñ0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
const wer = (guion, texto) => {
  const a = palabras(guion);
  const b = palabras(texto);
  let fila = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    const nueva = [i];
    for (let j = 1; j <= b.length; j += 1) {
      nueva[j] = Math.min(fila[j] + 1, nueva[j - 1] + 1, fila[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    fila = nueva;
  }
  return Number(((fila[b.length] / a.length) * 100).toFixed(1));
};

const AUDIOS = ['jhon', 'rosa'];
const resultado = {
  fecha: new Date().toISOString(),
  nota: 'Audios de personas ficticias (voz sintética). Prueba de voz del prototipo app/.',
  equipo: { plataforma: process.platform, arquitectura: process.arch, node: process.version },
  modelo: config.modeloVoz,
  audios: [],
};

try {
  console.log(`\n1) Cargando ${config.modeloVoz}. La primera vez se descarga…`);
  let inicio = performance.now();
  await ia.precargarVoz();
  resultado.carga_segundos = seg(inicio);
  console.log(`   ✓ ${resultado.carga_segundos} s`);

  console.log('\n2) Transcribiendo…');
  for (const nombre of AUDIOS) {
    const archivo = fileURLToPath(ruta(`../../../spike-qvac/audio/${nombre}.wav`));
    const guion = readFileSync(ruta(`../../../spike-qvac/audio/${nombre}.txt`), 'utf8');
    const wav = readFileSync(archivo);
    const duracion = Number(((wav.length - 44) / 32000).toFixed(1));

    inicio = performance.now();
    const deArchivo = await ia.transcribirArchivo(archivo);
    const segArchivo = seg(inicio);

    inicio = performance.now();
    const dePcm = await ia.transcribir(wav.subarray(44));
    const segPcm = seg(inicio);

    const fila = {
      audio: nombre, duracion_segundos: duracion,
      archivo: { segundos: segArchivo, wer: wer(guion, deArchivo), texto: deArchivo },
      pcm: { segundos: segPcm, wer: wer(guion, dePcm), texto: dePcm },
    };
    resultado.audios.push(fila);
    console.log(`   ${nombre} (${duracion} s de audio): archivo ${segArchivo} s · WER ${fila.archivo.wer} % | PCM ${segPcm} s · WER ${fila.pcm.wer} %`);
    console.log(`     "${dePcm}"`);
  }

  const peor = Math.max(...resultado.audios.map((a) => a.pcm.segundos));
  resultado.veredicto = { pcm_menos_de_3s: peor < 3 };
  console.log(`\nResumen: ${peor < 3 ? '✓' : '⚠'} peor transcripción ${peor} s. Meta: menos de 3 s para unos 40 s de audio.`);
} catch (error) {
  resultado.error = error.message;
  console.error(`\n✗ ${error.message}`);
  process.exitCode = 1;
} finally {
  mkdirSync(ruta('../resultados/'), { recursive: true });
  const archivo = ruta(`../resultados/voz-${resultado.fecha.slice(0, 16).replace(/[:T]/g, '-')}.json`);
  writeFileSync(archivo, JSON.stringify(resultado, null, 2));
  console.log(`\nResultados guardados en ${fileURLToPath(archivo)}`);
  await ia.cerrarIa().catch(() => {});
  process.exit(process.exitCode || 0);
}
