// Conteo por tareas (issue #6, D-057 y D-058). Lo que se cuenta es la tarea (elemento de competencia del perfil del
// MTPE), no el estándar entero: cobrar en una tienda no es hacer las operaciones de caja de un banco.
//   - El destino se mide con las tareas de su puesto de entrada (datos/puestos_de_entrada.csv).
//   - Una tarea cuenta como "ya la haces" si es la misma o si hay un par revisado "sí" (datos/pares_marcados.csv).
//     Ningún umbral de similitud cuenta (D-057).
//   - Un estándar sin tareas en el detalle (compras) se cuenta entero, solo con equivalencias validadas.
import { readFileSync } from 'node:fs';
import { calcularCobertura } from './cobertura.js';
import { leerCsv } from './texto.js';

const leer = (nombre) => leerCsv(readFileSync(new URL(`../../datos/${nombre}`, import.meta.url), 'utf8'));

const tareas = leer('tareas.csv');
const tareasPorId = new Map(tareas.map((t) => [t.codigo_tarea, t]));
const tareasDeEcl = new Map();
for (const t of tareas) {
  if (!tareasDeEcl.has(t.codigo_ecl)) tareasDeEcl.set(t.codigo_ecl, []);
  tareasDeEcl.get(t.codigo_ecl).push(t.codigo_tarea);
}

const puestos = new Map(
  leer('puestos_de_entrada.csv').map((p) => [p.ocupacion_id, p.competencias.split(/\s+/).filter(Boolean)]),
);

// Pares de tareas revisados: "si" cuenta y "no" no; los "no_se" no se usan.
const paresTareas = new Map();
for (const p of leer('pares_marcados.csv')) {
  const respuesta = (p.es_la_misma || '').toLowerCase();
  if (respuesta !== 'si' && respuesta !== 'no') continue;
  paresTareas.set(`${p.codigo_a}|${p.codigo_b}`, { similitud: 1, metodo: 'validado', es_equivalente: respuesta === 'si' });
}

/** Estándar al que pertenece una unidad: 'K2764001-1/E2' → 'K2764001-1'. */
export const eclDe = (unidad) => unidad.split('/')[0];

/** Las tareas de esos estándares; un estándar sin tareas en el detalle queda como una sola unidad. */
export const unidadesDe = (ecls) => ecls.flatMap((e) => tareasDeEcl.get(e) || [e]);

/** Estándares del puesto de entrada de la ocupación; si no está en la lista, todos los suyos. */
export const puestoDeEntrada = (ocupacionId, ecls) => {
  const lista = puestos.get(ocupacionId);
  return lista?.length ? lista.filter((e) => ecls.includes(e)) : ecls;
};

/**
 * Cuántas tareas del puesto de entrada del destino ya hace el origen.
 * @param {string[]} origenEcls  estándares que la persona confirmó, o los del puesto de entrada de una ocupación
 * @param {string} destinoId     ocupación destino
 * @param {string[]} destinoEcls estándares de la ocupación destino
 * @param {Map} paresEcl         pares de estándares precalculados: aquí solo cuentan los validados
 */
export const coberturaPorTareas = (origenEcls, destinoId, destinoEcls, paresEcl = new Map()) =>
  coberturaDeEstandares(origenEcls, puestoDeEntrada(destinoId, destinoEcls), paresEcl);

/** Cuántas tareas de esos estándares ya hace el origen (p. ej. los que pide el aviso de una empresa). */
export const coberturaDeEstandares = (origenEcls, destinoEcls, paresEcl = new Map()) => {
  const pares = new Map(paresTareas);
  for (const [clave, par] of paresEcl) {
    if (par.metodo === 'validado') pares.set(clave, par);
  }
  return calcularCobertura(unidadesDe(origenEcls), unidadesDe(destinoEcls), pares);
};

/** Texto de cada unidad: la tarea, con su texto oficial y el simple si lo hay, sobre los datos de su estándar. */
export const textosDeUnidades = async (ids, competenciasPorId) => {
  const ecls = await competenciasPorId([...new Set(ids.map(eclDe))]);
  return new Map(ids.map((id) => {
    const ecl = ecls.get(eclDe(id));
    const tarea = tareasPorId.get(id);
    if (!tarea || !ecl) return [id, ecl];
    return [id, {
      ...ecl,
      id,
      descripcion: tarea.descripcion,
      texto_simple: tarea.texto_simple || null,
      fuente: 'MTPE - Perfil ocupacional (elementos de competencia)',
      fuente_url: tarea.fuente_url || ecl.fuente_url,
    }];
  }));
};
