// Consultas compartidas por las rutas.
import { consulta } from './db.js';

export const obtenerOcupacion = async (id) =>
  (await consulta('SELECT * FROM ocupaciones WHERE id = $1', [id])).rows[0] || null;

export const competenciasDe = async (ocupacionId) =>
  (await consulta(
    `SELECT id, ocupacion_id, descripcion, texto_simple, nivel, puestos, fuente, fuente_url
       FROM competencias WHERE ocupacion_id = $1 ORDER BY id`,
    [ocupacionId],
  )).rows;

export const competenciasPorId = async (ids) => {
  if (ids.length === 0) return new Map();
  const { rows } = await consulta(
    `SELECT c.id, c.ocupacion_id, c.descripcion, c.texto_simple, c.fuente, c.fuente_url, o.nombre_simple AS ocupacion
       FROM competencias c JOIN ocupaciones o ON o.id = c.ocupacion_id
      WHERE c.id = ANY($1)`,
    [ids],
  );
  return new Map(rows.map((r) => [r.id, r]));
};

/** Pares precalculados como Map `${a}|${b}` -> par. */
export const cargarPares = async () => {
  const { rows } = await consulta('SELECT a, b, similitud, metodo, es_equivalente FROM coincidencias');
  return new Map(rows.map((r) => [`${r.a}|${r.b}`, r]));
};

export const cursosPara = async (competenciaIds) => {
  if (competenciaIds.length === 0) return [];
  return (await consulta(
    'SELECT * FROM cursos WHERE competencia_id = ANY($1) ORDER BY gratuito DESC NULLS LAST, horas NULLS LAST',
    [competenciaIds],
  )).rows;
};
