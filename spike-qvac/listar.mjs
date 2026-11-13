// Lista las constantes de modelos que exporta @qvac/sdk (para elegir cuáles probar)
import * as sdk from '@qvac/sdk';
const nombres = Object.keys(sdk).filter(k => /^[A-Z0-9_]+$/.test(k));
const interes = /WHISPER|PARAKEET|LLAMA|QWEN|GEMMA|SALAMANDRA|PHI|SMOL|GTE|BGE|EMBED|OCR|TTS|SILERO|VAD|GPT|MISTRAL|BERGAMOT_(EN_ES|ES_EN)|PSY|MEDGEMMA|NOMIC|E5|JINA/;
const sel = nombres.filter(n => interes.test(n));
for (const n of sel) {
  const v = sdk[n];
  const info = typeof v === 'object' && v ? (v.name || v.src || v.modelId || JSON.stringify(v).slice(0, 120)) : String(v).slice(0, 120);
  console.log(n.padEnd(48), info);
}
console.log('total constantes:', nombres.length, '| de interés:', sel.length);
process.exit(0);
