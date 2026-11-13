// Las preguntas de "¿Qué sabes hacer?": como máximo 5 por vez (pedido de César, 29-10).
// Primero lo que la IA o las reglas reconocieron en lo que contó la persona: las de su propia ocupación antes y, entre
// iguales, la más probable. Para la demo las candidatas son solo las de su ocupación (rutas/perfiles.js); la función
// también sirve para el catálogo entero (D-063). Si quedan lugares, se completan con
// las tareas de su ocupación que aún no se le preguntaron, sin cita. Si la persona cuenta más, se vuelve a elegir
// entre lo que todavía no se le preguntó.
export const MAXIMO_PREGUNTAS = 5;

/**
 * @param {{codigo: string, cita: string, probabilidad?: number}[]} propuestas ya validadas (código y cita textual)
 * @param {{id: string, ocupacion_id: string}[]} candidatas competencias entre las que se elige
 * @param {string} ocupacionId ocupación de la persona
 * @param {Set<string>} yaPreguntadas competencias que ya se le mostraron
 * @param {boolean} completar si se completan los lugares libres con tareas de su ocupación
 */
export const elegirPreguntas = ({ propuestas, candidatas, ocupacionId, yaPreguntadas = new Set(), completar = true, maximo = MAXIMO_PREGUNTAS }) => {
  const porId = new Map(candidatas.map((c) => [c.id, c]));
  const reconocidas = propuestas
    .filter((p) => porId.has(p.codigo) && !yaPreguntadas.has(p.codigo))
    .map((p, orden) => ({ ...p, orden, propia: porId.get(p.codigo).ocupacion_id === ocupacionId }))
    .sort((a, b) => (b.propia - a.propia) || ((b.probabilidad ?? 0) - (a.probabilidad ?? 0)) || (a.orden - b.orden))
    .slice(0, maximo)
    .map((p) => ({ ...porId.get(p.codigo), propuesta: true, cita: p.cita }));
  if (!completar) return reconocidas;
  const elegidas = new Set(reconocidas.map((c) => c.id));
  const relleno = candidatas
    .filter((c) => c.ocupacion_id === ocupacionId && !elegidas.has(c.id) && !yaPreguntadas.has(c.id))
    .slice(0, maximo - reconocidas.length)
    .map((c) => ({ ...c, propuesta: false, cita: null }));
  return [...reconocidas, ...relleno];
};
