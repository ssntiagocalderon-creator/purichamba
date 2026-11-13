// Cliente del servidor delegado de Tether (Qwen 3.8 27B), compatible con OpenAI (Plan C-70).
// El token va SOLO en .env (TETHER_TOKEN) y nunca se escribe en logs ni en git.
// Con esta opción, el texto que se envía sale de la máquina hacia el servidor de Tether: el pitch lo dice así.
import { config } from './config.js';
import { sinRazonamiento } from './texto.js';

// Acepta la URL con o sin /v1 al final.
const base = () => config.tether.url.replace(/\/v1$/, '');

export const tetherDisponible = () => Boolean(config.tether.url && config.tether.token);

const pedir = async (ruta, opciones = {}) => {
  if (!tetherDisponible()) throw new Error('Falta TETHER_URL o TETHER_TOKEN en .env');
  const respuesta = await fetch(`${base()}${ruta}`, {
    ...opciones,
    headers: {
      authorization: `Bearer ${config.tether.token}`,
      'content-type': 'application/json',
      'ngrok-skip-browser-warning': 'true', // evita la página de aviso de ngrok
      ...(opciones.headers || {}),
    },
    signal: AbortSignal.timeout(config.tether.timeoutMs),
  });
  const texto = await respuesta.text();
  if (!respuesta.ok) throw new Error(`Servidor de Tether respondió ${respuesta.status}: ${texto.slice(0, 200)}`);
  try {
    return JSON.parse(texto);
  } catch {
    throw new Error(`Respuesta no válida del servidor de Tether: ${texto.slice(0, 200)}`);
  }
};

/** Lista los modelos del servidor (para saber el nombre exacto que va en "model"). */
export const modelosTether = async () => (await pedir('/v1/models')).data?.map((m) => m.id) ?? [];

/**
 * Chat con el servidor de Tether. Si se pasa responseFormat (json_schema), se manda como response_format.
 * Desactiva el razonamiento para que no salgan bloques <think> ni respuestas vacías. El servidor de Tether
 * (qwen-38-27b) ignora reasoning_budget y /no_think: razona hasta agotar max_tokens y devuelve content vacío.
 * Lo que sí respeta es chat_template_kwargs.enable_thinking (probado el 27-10). Se mandan los dos.
 */
export const chatTether = async ({ messages, responseFormat, maxTokens = 400, temperature = 0.3 }) => {
  const cuerpo = {
    ...(config.tether.modelo ? { model: config.tether.modelo } : {}),
    messages,
    max_tokens: maxTokens,
    temperature,
    reasoning_budget: false,
    chat_template_kwargs: { enable_thinking: false },
    ...(responseFormat ? { response_format: responseFormat } : {}),
  };
  const datos = await pedir('/v1/chat/completions', { method: 'POST', body: JSON.stringify(cuerpo) });
  const contenido = datos.choices?.[0]?.message?.content;
  if (typeof contenido !== 'string') throw new Error('El servidor de Tether no devolvió texto');
  return { texto: sinRazonamiento(contenido), modelo: datos.model, uso: datos.usage };
};
