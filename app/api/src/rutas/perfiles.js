import { randomBytes } from 'node:crypto';
import { consulta, pool } from '../db.js';
import { rotulo } from '../cobertura.js';
import { proponerCompetencias } from '../ia.js';
import { cargarPares, competenciasDe, obtenerOcupacion } from '../repositorio.js';
import { elegirPreguntas } from '../preguntas.js';
import { detalleTransicion } from './transiciones.js';
import { coberturaPorTareas } from '../tareas.js';

const RESPUESTAS = new Set(['si', 'a_veces', 'no', 'no_seguro']);
const LIMITE_DESCRIPCION = 2000;
const LIMITE_TOTAL = 6000; // lo que se junta al contar más varias veces

const sinTextosInternos = ({ ocupacion_id: _o, ...c }) => c;

// Para la demo, las preguntas salen solo de la ocupación de la persona: con todo el catálogo cada respuesta tardaba
// 31-46 s con Laya y 72-195 s con Qwen3 4B, y Laya proponía tareas del destino (p. ej. caja del banco) que rompían
// el "2 de 3 tareas" de D-058 (César, 29-10).
const candidatasDe = async (ocupacion) =>
  (await competenciasDe(ocupacion.id)).map((c) => ({ ...c, ocupacion: ocupacion.nombre_simple }));

// Guarda las preguntas de la persona sin respuesta: nada queda marcado de antemano (D-004).
const guardarPreguntas = async (cliente, perfilId, preguntas, propuestaPor) => {
  for (const c of preguntas) {
    await cliente.query(
      `INSERT INTO perfil_competencia (perfil_id, competencia_id, respuesta, propuesta_por, cita)
       VALUES ($1, $2, NULL, $3, $4) ON CONFLICT (perfil_id, competencia_id) DO NOTHING`,
      [perfilId, c.id, c.propuesta ? propuestaPor : null, c.cita],
    );
  }
};

const obtenerPerfil = async (id) => {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return (await consulta('SELECT * FROM perfiles WHERE id = $1', [id])).rows[0] || null;
};

// Solo cuenta lo que la persona confirmó con "Sí, lo hago".
const confirmadasDe = async (perfilId) =>
  (await consulta(
    `SELECT competencia_id FROM perfil_competencia WHERE perfil_id = $1 AND respuesta = 'si'`,
    [perfilId],
  )).rows.map((r) => r.competencia_id);

export default async function rutasPerfiles(app) {
  // Pantalla 2: la persona elige su ocupación y escribe brevemente qué sabe hacer.
  // Devuelve hasta 5 preguntas de su ocupación: primero lo que la IA o las reglas reconocen, con su cita, y luego
  // las demás tareas de su ocupación (ver preguntas.js).
  app.post('/perfiles', async (req, reply) => {
    const { ocupacion_id: ocupacionId, descripcion = '', region = null } = req.body || {};
    const ocupacion = await obtenerOcupacion(ocupacionId);
    if (!ocupacion) return reply.code(400).send({ error: 'Ocupación no válida' });
    if (descripcion.length > LIMITE_DESCRIPCION) return reply.code(400).send({ error: 'Descripción demasiado larga' });

    const candidatas = await candidatasDe(ocupacion);
    const { propuestas, propuesta_por: propuestaPor } = await proponerCompetencias(descripcion, candidatas);
    const preguntas = elegirPreguntas({ propuestas, candidatas, ocupacionId: ocupacion.id });

    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      const { rows: [perfil] } = await cliente.query(
        'INSERT INTO perfiles (ocupacion_id, descripcion, region) VALUES ($1, $2, $3) RETURNING id',
        [ocupacion.id, descripcion || null, region],
      );
      await guardarPreguntas(cliente, perfil.id, preguntas, propuestaPor);
      await cliente.query('COMMIT');
      return {
        perfil_id: perfil.id,
        ocupacion: { id: ocupacion.id, nombre_simple: ocupacion.nombre_simple },
        competencias: preguntas.map(sinTextosInternos),
        propuesta_por: propuestaPor,
      };
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  });

  // "Cuéntanos más": la persona agrega lo que siente que le faltó. La IA recibe todo lo que contó y vuelve a mirar su
  // ocupación: marca con su cita las preguntas que ahora reconoce y agrega las que aún no se le hicieron (hasta 5).
  // Las respuestas que ya dio no cambian.
  app.post('/perfiles/:id/mas', async (req, reply) => {
    const perfil = await obtenerPerfil(req.params.id);
    if (!perfil) return reply.code(404).send({ error: 'Perfil no encontrado' });
    const extra = typeof req.body?.descripcion === 'string' ? req.body.descripcion.trim() : '';
    if (!extra) return reply.code(400).send({ error: 'Cuéntanos algo más para buscar otras tareas' });
    if (extra.length > LIMITE_DESCRIPCION) return reply.code(400).send({ error: 'Descripción demasiado larga' });
    const descripcion = [perfil.descripcion, extra].filter(Boolean).join('\n');
    if (descripcion.length > LIMITE_TOTAL) return reply.code(400).send({ error: 'Ya contaste bastante: responde las preguntas que tienes' });

    const previas = (await consulta(
      'SELECT competencia_id, cita FROM perfil_competencia WHERE perfil_id = $1', [perfil.id],
    )).rows;
    const yaPreguntadas = new Set(previas.map((r) => r.competencia_id));
    const sinCita = new Set(previas.filter((r) => !r.cita).map((r) => r.competencia_id));
    const candidatas = await candidatasDe(await obtenerOcupacion(perfil.ocupacion_id));
    const { propuestas, propuesta_por: propuestaPor } = await proponerCompetencias(descripcion, candidatas);
    const preguntas = elegirPreguntas({
      propuestas, candidatas, ocupacionId: perfil.ocupacion_id, yaPreguntadas, completar: false,
    });
    const reconocidas = propuestas.filter((p) => sinCita.has(p.codigo)).map((p) => ({ id: p.codigo, cita: p.cita }));

    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      await cliente.query('UPDATE perfiles SET descripcion = $2 WHERE id = $1', [perfil.id, descripcion]);
      await guardarPreguntas(cliente, perfil.id, preguntas, propuestaPor);
      for (const r of reconocidas) {
        await cliente.query(
          'UPDATE perfil_competencia SET cita = $3, propuesta_por = $4 WHERE perfil_id = $1 AND competencia_id = $2',
          [perfil.id, r.id, r.cita, propuestaPor],
        );
      }
      await cliente.query('COMMIT');
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
    return {
      competencias: preguntas.map(sinTextosInternos),
      reconocidas,
      propuesta_por: propuestaPor,
    };
  });

  // La persona responde Sí / A veces / No / No estoy seguro por cada competencia.
  app.put('/perfiles/:id/respuestas', async (req, reply) => {
    const perfil = await obtenerPerfil(req.params.id);
    if (!perfil) return reply.code(404).send({ error: 'Perfil no encontrado' });
    const respuestas = req.body?.respuestas;
    if (!Array.isArray(respuestas)) return reply.code(400).send({ error: 'Falta respuestas[]' });
    for (const r of respuestas) {
      if (!RESPUESTAS.has(r.respuesta)) return reply.code(400).send({ error: `Respuesta no válida: ${r.respuesta}` });
      await consulta(
        `UPDATE perfil_competencia SET respuesta = $3 WHERE perfil_id = $1 AND competencia_id = $2`,
        [perfil.id, r.competencia_id, r.respuesta],
      );
    }
    return { ok: true, confirmadas: (await confirmadasDe(perfil.id)).length };
  });

  // Pantalla 3 (con perfil): transiciones calculadas con lo que la persona confirmó.
  app.get('/perfiles/:id/transiciones', async (req, reply) => {
    const perfil = await obtenerPerfil(req.params.id);
    if (!perfil) return reply.code(404).send({ error: 'Perfil no encontrado' });
    const confirmadas = await confirmadasDe(perfil.id);
    const pares = await cargarPares();
    const { rows: destinos } = await consulta(
      'SELECT id, nombre, nombre_simple FROM ocupaciones WHERE id <> $1 AND NOT sin_perfil',
      [perfil.ocupacion_id],
    );
    const resultado = [];
    for (const d of destinos) {
      const ids = (await competenciasDe(d.id)).map((c) => c.id);
      if (ids.length === 0) continue;
      const cob = coberturaPorTareas(confirmadas, d.id, ids, pares);
      if (cob.tiene === 0) continue; // el mapa muestra solo caminos con alguna tarea en común
      resultado.push({
        destino: d.id, nombre_simple: d.nombre_simple, nombre: d.nombre,
        tiene: cob.tiene, total: cob.total, porcentaje: cob.porcentaje, rotulo: rotulo(cob),
      });
    }
    return resultado.sort((a, b) => b.porcentaje - a.porcentaje || b.tiene - a.tiene);
  });

  // Pantalla 4 (con perfil): detalle de la transición con lo que la persona confirmó.
  app.get('/perfiles/:id/transiciones/:destino', async (req, reply) => {
    const perfil = await obtenerPerfil(req.params.id);
    const destino = await obtenerOcupacion(req.params.destino);
    if (!perfil || !destino) return reply.code(404).send({ error: 'No encontrado' });
    const origen = await obtenerOcupacion(perfil.ocupacion_id);
    const cobertura = coberturaPorTareas(
      await confirmadasDe(perfil.id),
      destino.id,
      (await competenciasDe(destino.id)).map((c) => c.id),
      await cargarPares(),
    );
    return detalleTransicion({ origen, destino, cobertura });
  });

  // "Compartir mi perfil" (D-050): crea un enlace de solo lectura. Lo decide la persona.
  app.post('/perfiles/:id/compartir', async (req, reply) => {
    const perfil = await obtenerPerfil(req.params.id);
    if (!perfil) return reply.code(404).send({ error: 'Perfil no encontrado' });
    const token = perfil.token_publico || randomBytes(12).toString('base64url');
    await consulta('UPDATE perfiles SET token_publico = $2 WHERE id = $1', [perfil.id, token]);
    return { token };
  });

  // Pasaporte público: solo competencias confirmadas, sin datos personales ni la descripción.
  app.get('/pasaporte/:token', async (req, reply) => {
    const { rows: [perfil] } = await consulta(
      `SELECT p.id, o.nombre_simple AS ocupacion, p.creado_en
         FROM perfiles p JOIN ocupaciones o ON o.id = p.ocupacion_id
        WHERE p.token_publico = $1`,
      [req.params.token],
    );
    if (!perfil) return reply.code(404).send({ error: 'Pasaporte no encontrado' });
    const { rows: competencias } = await consulta(
      `SELECT c.id, c.descripcion, c.texto_simple, c.fuente, c.fuente_url
         FROM perfil_competencia pc JOIN competencias c ON c.id = pc.competencia_id
        WHERE pc.perfil_id = $1 AND pc.respuesta = 'si' ORDER BY c.id`,
      [perfil.id],
    );
    return {
      ocupacion: perfil.ocupacion,
      creado_en: perfil.creado_en,
      nivel_respaldo: 'declarado',
      aviso: 'Competencias declaradas por la persona y relacionadas con estándares oficiales del MTPE. No es una certificación.',
      competencias,
    };
  });
}
