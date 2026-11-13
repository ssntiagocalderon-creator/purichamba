// Capa de IA. Dos modos (IA_MODO):
//   - 'qvac':   @qvac/sdk dentro de este proceso (D-055): un proceso menos en la demo y QVAC no se expone.
//   - 'sin_ia': reglas y similitud léxica, para desarrollar sin descargar modelos.
//
// Con QVAC, cada paso usa el modelo que mejor le calza (D-056, recomendación de Tether en la mentoría):
//   - Voz a texto:         Parakeet.
//   - Proponer competencias de la persona: modelo de decisión Laya (`decide`, pregunta `noul`),
//                          o Qwen local si PROPUESTAS=llm.
//   - Equivalencias entre competencias de ocupaciones distintas: Laya juzga cada par
//                          ("¿son la misma tarea?"), o EmbeddingGemma + umbral si EQUIVALENCIAS=embeddings.
//   - Explicación en lenguaje simple: servidor de Tether (Qwen 3.8 27B), Qwen local o plantilla.
// El porcentaje NO lo da la IA: es una fórmula fija que cuenta competencias (cobertura.js, D-052).
// La IA solo PROPONE; la persona confirma (D-004, D-012) y el equipo puede validar pares (D-053).
import { MAXIMO_PREGUNTAS } from './preguntas.js';
import { config } from './config.js';
import { citaEsTextual, frases, similitudLexica, sinColetilla, sinRazonamiento } from './texto.js';
import { chatTether, tetherDisponible } from './tether.js';

let sdk = null;
// Se guarda la PROMESA de carga: si llegan dos pedidos a la vez, el modelo se carga una sola vez.
const modelos = {};
// Estado para /api/salud y para los scripts de prueba.
const estado = { decision: 'sin_cargar', embeddings: 'sin_cargar', llm: 'sin_cargar', voz: 'sin_cargar', segundos: {} };

const cargarSdk = async () => {
  if (!sdk) {
    try {
      sdk = await import('@qvac/sdk');
    } catch (error) {
      throw new Error(`IA_MODO=qvac pero @qvac/sdk no está instalado (${error.message}). Usa IA_MODO=sin_ia o corre npm install con Node >= 22.17.`);
    }
  }
  return sdk;
};

// Muestra el avance de la descarga como mucho cada 5 segundos (la primera vez baja varios GB).
const avance = (nombre) => {
  let ultimo = 0;
  return (progreso) => {
    const ahora = Date.now();
    if (ahora - ultimo < 5000) return;
    ultimo = ahora;
    const pct = progreso?.percentage ?? progreso?.progress ?? progreso?.percent;
    console.log(`  … ${nombre}: ${pct != null ? `${Math.round(Number(pct))} %` : JSON.stringify(progreso).slice(0, 120)}`);
  };
};

const nombreDe = {
  decision: () => config.modeloDecision,
  embeddings: () => config.modeloEmbeddings,
  llm: () => config.modeloLlm,
  voz: () => config.modeloVoz,
};
const opcionesDe = {
  decision: () => ({ modelType: 'llamacpp-decision', modelConfig: { device: config.dispositivoDecision } }),
  embeddings: () => ({}),
  llm: () => ({ modelConfig: { ctx_size: 4096 } }),
  voz: () => ({ modelType: 'parakeet-transcription', modelConfig: { language: 'es' } }),
};

const modelo = (tipo) => {
  if (!modelos[tipo]) {
    modelos[tipo] = (async () => {
      const s = await cargarSdk();
      const nombre = nombreDe[tipo]();
      if (!s[nombre]) throw new Error(`El SDK de QVAC no tiene el modelo ${nombre}`);
      estado[tipo] = 'cargando';
      const inicio = performance.now();
      const id = await s.loadModel({ modelSrc: s[nombre], ...opcionesDe[tipo](), onProgress: avance(nombre) });
      estado.segundos[tipo] = Number(((performance.now() - inicio) / 1000).toFixed(1));
      estado[tipo] = 'listo';
      return id;
    })().catch((error) => {
      delete modelos[tipo];
      estado[tipo] = `error: ${error.message}`;
      throw error;
    });
  }
  return modelos[tipo];
};

/** Qué modelos locales hacen falta según la configuración (para no cargar lo que no se usa). */
export const modelosNecesarios = () => {
  if (config.iaModo !== 'qvac') return [];
  const lista = new Set();
  if (config.propuestas === 'decision' || config.equivalencias === 'decision') lista.add('decision');
  if (config.equivalencias === 'embeddings') lista.add('embeddings');
  if (config.propuestas === 'llm' || config.explicacion === 'local') lista.add('llm');
  return [...lista];
};

export const modoIa = () => config.iaModo;

export const estadoIa = () => ({
  modo: config.iaModo,
  pasos: { propuestas: config.propuestas, equivalencias: config.equivalencias, explicacion: config.explicacion },
  modelos: {
    decision: config.modeloDecision,
    embeddings: config.modeloEmbeddings,
    llm: config.modeloLlm,
    voz: config.modeloVoz,
    explicacion: config.explicacion === 'tether' ? `servidor de Tether${config.tether.modelo ? ` (${config.tether.modelo})` : ''}` : null,
  },
  necesarios: modelosNecesarios(),
  ...estado,
});

/**
 * Carga los modelos que hacen falta antes de abrir la app, para que la primera persona no espere
 * (en la demo, la primera llamada sin precarga puede tardar minutos).
 */
export const precargarModelos = async () => {
  if (config.iaModo !== 'qvac') return;
  const s = await cargarSdk();
  for (const tipo of modelosNecesarios()) await modelo(tipo);
  // Una primera inferencia corta deja todo "caliente".
  if (modelos.decision) {
    await s.decide({ modelId: await modelo('decision'), state: 'prueba', questions: { ok: { type: 'noul', instructions: 'Es un texto de prueba.' } } });
  }
  if (modelos.embeddings) await s.embed({ modelId: await modelo('embeddings'), text: conPrefijo('prueba') });
  if (config.explicacion === 'tether' && !tetherDisponible()) {
    console.log('  ⚠ EXPLICACION=tether pero falta TETHER_URL o TETHER_TOKEN: se usará la plantilla.');
  }
  // La voz es opcional: si no carga, la app sigue funcionando por texto.
  await precargarVoz().catch((error) => console.log(`  ⚠ Voz no disponible (${error.message}). La app sigue por texto.`));
};

// ---------- Voz a texto (Parakeet, D-003) ----------

export const vozDisponible = () => config.iaModo === 'qvac' && estado.voz !== 'sin_cargar' && !estado.voz.startsWith('error');

export const precargarVoz = async () => {
  if (config.iaModo !== 'qvac') return;
  await modelo('voz');
};

/**
 * Transcribe audio PCM s16le, 16 kHz, mono (lo que manda la web). El audio no se guarda:
 * se transcribe en memoria y se descarta (Plan R9).
 */
export const transcribir = async (pcm) => {
  if (config.iaModo !== 'qvac') throw new Error('La voz necesita IA_MODO=qvac');
  const s = await cargarSdk();
  const texto = await s.transcribe({ modelId: await modelo('voz'), audioChunk: pcm });
  return texto.trim();
};

/** Transcribe un archivo WAV de 16 kHz mono (solo para el script de prueba). */
export const transcribirArchivo = async (ruta) => {
  const s = await cargarSdk();
  return (await s.transcribe({ modelId: await modelo('voz'), audioChunk: ruta })).trim();
};

// ---------- Texto de una competencia para los modelos ----------

/** Texto corto de la competencia: el simple si existe; si no, el oficial sin la coletilla genérica. */
export const textoCompetencia = (c) => c.texto_simple || sinColetilla(c.descripcion);

// ---------- Modelo de decisión (Laya) ----------

const TAMANO_LOTE = 32;

const PREGUNTA_MISMA = {
  type: 'noul',
  instructions: 'Las dos competencias laborales describen la misma tarea: quien sabe hacer una, sabe hacer la otra.',
};

/**
 * Laya juzga pares de competencias. Devuelve, para cada par, la probabilidad de que sean la misma tarea.
 * @param {{a: object, b: object}[]} pares competencias con id, descripcion y texto_simple
 */
export const juzgarPares = async (pares) => {
  const s = await cargarSdk();
  const modelId = await modelo('decision');
  const probabilidades = [];
  for (let i = 0; i < pares.length; i += TAMANO_LOTE) {
    const lote = pares.slice(i, i + TAMANO_LOTE);
    const resultados = await s.decide({
      modelId,
      states: lote.map(({ a, b }) => `Competencia A: ${textoCompetencia(a)}.\nCompetencia B: ${textoCompetencia(b)}.`),
      questions: { misma: PREGUNTA_MISMA },
    });
    for (const r of resultados) probabilidades.push(Number(r.answers.misma.noul));
  }
  return probabilidades;
};

/**
 * Elige, para cada competencia, la frase de la persona con mayor probabilidad (Laya, pregunta noul).
 * Función pura: separada para poder probarla sin modelos.
 * @param {string[]} partes frases de lo que contó la persona (los "states")
 * @param {string[]} ids códigos de competencia (las preguntas)
 * @param {{answers: Record<string, {noul: number}>}[]} resultados uno por frase, en el mismo orden
 */
export const elegirPropuestas = (partes, ids, resultados, umbral) => {
  const propuestas = [];
  for (const id of ids) {
    let mejor = { indice: -1, probabilidad: 0 };
    resultados.forEach((r, i) => {
      const p = Number(r.answers?.[id]?.noul ?? 0);
      if (p > mejor.probabilidad) mejor = { indice: i, probabilidad: p };
    });
    if (mejor.indice >= 0 && mejor.probabilidad >= umbral) {
      propuestas.push({ codigo: id, cita: partes[mejor.indice], probabilidad: Number(mejor.probabilidad.toFixed(3)) });
    }
  }
  return propuestas;
};

const proponerConDecision = async (descripcion, competencias) => {
  const s = await cargarSdk();
  const partes = frases(descripcion);
  if (partes.length === 0) partes.push(descripcion.trim());
  const preguntas = Object.fromEntries(competencias.map((c) => [c.id, {
    type: 'noul',
    instructions: `La persona dice que en su trabajo hace esta tarea: ${textoCompetencia(c)}.`,
  }]));
  const resultados = await s.decide({ modelId: await modelo('decision'), states: partes, questions: preguntas });
  return elegirPropuestas(partes, competencias.map((c) => c.id), resultados, config.umbralPropuesta);
};

// ---------- Embeddings (opción EQUIVALENCIAS=embeddings) ----------

// Instrucción de EmbeddingGemma para similitud de frases (Plan, C-66).
const conPrefijo = (texto) => `task: sentence similarity | query: ${texto}`;

/** Devuelve un vector por texto, o null si no se usan embeddings. */
export const vectorizar = async (textos) => {
  if (config.iaModo !== 'qvac') return textos.map(() => null);
  const s = await cargarSdk();
  const modelId = await modelo('embeddings');
  const { embedding } = await s.embed({ modelId, text: textos.map(conPrefijo) });
  return embedding;
};

// ---------- Propuesta con LLM local (opción PROPUESTAS=llm) ----------

const esquemaPropuestas = {
  type: 'json_schema',
  json_schema: {
    name: 'propuestas',
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['propuestas'],
      properties: {
        propuestas: {
          type: 'array',
          // Sin maxItems: con él la gramática de llama.cpp se volvió tan pesada que Qwen no terminaba (29-10).
          // El tope de 5 lo pone elegirPreguntas.
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['codigo', 'cita'],
            properties: { codigo: { type: 'string' }, cita: { type: 'string' } },
          },
        },
      },
    },
  },
};

const TOKENS_PROPUESTAS = 400;

const proponerConLlm = async (descripcion, competencias) => {
  const s = await cargarSdk();
  const modelId = await modelo('llm');
  const lista = competencias
    .map((c) => `- ${c.id}${c.ocupacion ? ` (${c.ocupacion})` : ''}: ${textoCompetencia(c)}`)
    .join('\n');
  const sistema = [
    'Eres orientador laboral del Ministerio de Trabajo del Perú.',
    'Te doy lo que una persona cuenta de su trabajo y una lista de competencias oficiales.',
    'Devuelve SOLO las competencias de la lista que la persona describe claramente,',
    `como máximo ${MAXIMO_PREGUNTAS}: las más claras primero.`,
    'Para cada una copia literalmente la frase de la persona que la respalda.',
    'Si ninguna calza, devuelve una lista vacía. No inventes. /no_think',
  ].join(' ');
  const run = s.completion({
    modelId,
    stream: false,
    responseFormat: esquemaPropuestas,
    // Tope de tokens: 5 propuestas con su cita caben de sobra. Sin tope, con el catálogo entero Qwen3 4B
    // siguió generando más de 20 min en la laptop de César (29-10).
    generationParams: { temp: 0, predict: TOKENS_PROPUESTAS },
    history: [
      { role: 'system', content: sistema },
      { role: 'user', content: `Competencias:\n${lista}\n\nLo que cuenta la persona:\n${descripcion}` },
    ],
  });
  try {
    return JSON.parse(sinRazonamiento((await run.final).contentText)).propuestas;
  } catch {
    return []; // respuesta cortada por el tope: se preguntan las tareas de su ocupación
  }
};

// ---------- Propuesta sin IA ----------

const proponerConReglas = (descripcion, competencias) => {
  const partes = frases(descripcion);
  const propuestas = [];
  for (const c of competencias) {
    let mejor = { cita: null, puntaje: 0 };
    for (const f of partes) {
      // Se compara por separado con el texto simple y con el oficial: juntos, el oficial (largo) diluye la coincidencia.
      const puntaje = Math.max(similitudLexica(f, c.texto_simple || ''), similitudLexica(f, c.descripcion));
      if (puntaje > mejor.puntaje) mejor = { cita: f, puntaje };
    }
    if (mejor.cita && mejor.puntaje >= config.umbralLexico) propuestas.push({ codigo: c.id, cita: mejor.cita });
  }
  return propuestas;
};

/**
 * Propone qué competencias de la lista describe la persona, cada una con la frase que la respalda.
 * Se descartan códigos fuera de la lista y citas que no están en el texto (la IA no puede inventarlas).
 */
export const proponerCompetencias = async (descripcion, competencias) => {
  if (!descripcion?.trim() || competencias.length === 0) return { propuestas: [], propuesta_por: null };
  let crudas;
  let propuestaPor;
  if (config.iaModo !== 'qvac') {
    crudas = proponerConReglas(descripcion, competencias);
    propuestaPor = 'reglas';
  } else {
    crudas = config.propuestas === 'llm'
      ? await proponerConLlm(descripcion, competencias)
      : await proponerConDecision(descripcion, competencias);
    propuestaPor = 'ia';
  }
  const validos = new Set(competencias.map((c) => c.id));
  const vistos = new Set();
  const propuestas = crudas.filter((p) => {
    const ok = validos.has(p.codigo) && citaEsTextual(p.cita, descripcion) && !vistos.has(p.codigo);
    vistos.add(p.codigo);
    return ok;
  });
  return { propuestas, propuesta_por: propuestaPor };
};

// ---------- Explicación de una transición ----------

/** Explicación por plantilla (siempre disponible, sin latencia). */
export const explicarConPlantilla = ({ origen, destino, compartidas, faltantes }) => {
  if (compartidas.length === 0) {
    return `Según los perfiles oficiales, ${destino.nombre_simple} pide tareas distintas a las de ${origen.nombre_simple}. Es un cambio más largo.`;
  }
  const falta = faltantes.length === 0
    ? 'Ya haces todas las tareas que pide.'
    : faltantes.length === 1
      ? 'Te falta 1 tarea para completar el puesto.'
      : `Te faltan ${faltantes.length} tareas para completar el puesto.`;
  return `Lo que haces como ${origen.nombre_simple} también se pide en ${destino.nombre_simple}: ${compartidas.length} tarea${compartidas.length === 1 ? '' : 's'} en común según los perfiles oficiales del MTPE. ${falta}`;
};

const INSTRUCCION_EXPLICAR = 'Explica en 2 o 3 frases simples, en español peruano y tuteando, por qué una persona puede pasar de una ocupación a otra. Usa SOLO los datos que te doy, sin cifras nuevas. Nunca digas que algo está certificado.';

/**
 * Explicación en lenguaje simple. Solo reformula los datos que recibe; no agrega nada.
 * Devuelve { texto, generada_por } o null si no hay IA para esto (entonces se usa la plantilla).
 */
export const explicarConIa = async (contexto) => {
  const datos = {
    desde: contexto.origen.nombre_simple,
    hacia: contexto.destino.nombre_simple,
    ya_tiene: contexto.compartidasTexto,
    le_falta: contexto.faltantesTexto,
  };
  try {
    if (config.explicacion === 'tether' && tetherDisponible()) {
      const { texto } = await chatTether({
        messages: [{ role: 'system', content: INSTRUCCION_EXPLICAR }, { role: 'user', content: JSON.stringify(datos) }],
        maxTokens: 300,
      });
      return texto ? { texto, generada_por: 'tether' } : null;
    }
    if (config.explicacion === 'local' && config.iaModo === 'qvac') {
      const s = await cargarSdk();
      const run = s.completion({
        modelId: await modelo('llm'),
        stream: false,
        history: [
          { role: 'system', content: `${INSTRUCCION_EXPLICAR} /no_think` },
          { role: 'user', content: JSON.stringify(datos) },
        ],
      });
      const texto = sinRazonamiento((await run.final).contentText);
      return texto ? { texto, generada_por: 'qvac' } : null;
    }
  } catch (error) {
    console.error(`⚠ No se pudo generar la explicación con IA (${error.message}). Se usa la plantilla.`);
  }
  return null;
};

export const cerrarIa = async () => {
  if (sdk?.close) await sdk.close();
};
