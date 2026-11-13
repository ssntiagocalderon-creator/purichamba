// Configuración leída de variables de entorno (ver .env.example).
const num = (valor, porDefecto) => {
  const n = Number(valor);
  return Number.isFinite(n) ? n : porDefecto;
};
const opcion = (valor, permitidas, porDefecto) => (permitidas.includes(valor) ? valor : porDefecto);

const iaModo = process.env.IA_MODO === 'qvac' ? 'qvac' : 'sin_ia';

export const config = {
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:dev@localhost:5432/pasaporte',
  puerto: num(process.env.PUERTO, 3000),
  // 127.0.0.1 por defecto. Para probar desde un celular en la misma red: HOST=0.0.0.0
  host: process.env.HOST || '127.0.0.1',
  // Clave para la demo por ngrok. Vacía = sin clave (solo en la propia máquina).
  accesoClave: process.env.ACCESO_CLAVE || '',
  iaModo,

  // Qué hace cada paso con IA_MODO=qvac (D-056, recomendación de Tether: modelos de decisión).
  //   propuestas:    'decision' (Laya, rápido) | 'llm' (Qwen local)
  //   equivalencias: 'decision' (Laya juzga cada par) | 'embeddings' (EmbeddingGemma + umbral)
  //   explicacion:   'tether' (servidor de Tether) | 'local' (Qwen local) | 'plantilla'
  propuestas: opcion(process.env.PROPUESTAS, ['decision', 'llm'], 'decision'),
  equivalencias: opcion(process.env.EQUIVALENCIAS, ['decision', 'embeddings'], 'decision'),
  explicacion: opcion(process.env.EXPLICACION, ['tether', 'local', 'plantilla'], process.env.TETHER_URL ? 'tether' : 'plantilla'),

  modeloEmbeddings: process.env.QVAC_MODELO_EMBEDDINGS || 'EMBEDDINGGEMMA_300M_Q8_0',
  modeloLlm: process.env.QVAC_MODELO_LLM || 'QWEN3_4B_INST_Q4_K_M',
  modeloVoz: process.env.QVAC_MODELO_VOZ || 'PARAKEET_TDT_0_6B_V3_Q8_0',
  modeloDecision: process.env.QVAC_MODELO_DECISION || 'LAYA_MULTILINGUAL_322M_Q8_0',
  dispositivoDecision: process.env.QVAC_DISPOSITIVO_DECISION === 'gpu' ? 'gpu' : 'cpu',

  // Umbrales. POR CALIBRAR con los pares de datos/equivalencias.csv (npm run qvac:probar).
  // Las equivalencias validadas por el equipo siempre mandan sobre cualquier umbral.
  umbralDecision: num(process.env.UMBRAL_DECISION, 0.5), // probabilidad de Laya: "son la misma tarea"
  umbralPropuesta: num(process.env.UMBRAL_PROPUESTA, 0.5), // probabilidad de Laya: "la persona hace esta tarea"
  umbralEmbeddings: num(process.env.UMBRAL_EMBEDDINGS, 0.6),
  umbralLexico: num(process.env.UMBRAL_LEXICO, 0.4),

  // Servidor delegado de Tether (Qwen 3.8 27B). El token va SOLO en .env, nunca en git.
  tether: {
    url: (process.env.TETHER_URL || '').replace(/\/+$/, ''),
    token: process.env.TETHER_TOKEN || '',
    modelo: process.env.TETHER_MODELO || '',
    timeoutMs: num(process.env.TETHER_TIMEOUT_MS, 30000),
  },
};
