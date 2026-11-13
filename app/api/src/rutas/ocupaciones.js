import { consulta } from '../db.js';
import { competenciasDe, obtenerOcupacion } from '../repositorio.js';

export default async function rutasOcupaciones(app) {
  // Pantalla 1: lista de ocupaciones. ?origen=true devuelve solo las cinco del MTPE.
  app.get('/ocupaciones', async (req) => {
    const soloOrigen = req.query.origen === 'true';
    const { rows } = await consulta(
      `SELECT o.*, count(c.id)::int AS competencias
         FROM ocupaciones o LEFT JOIN competencias c ON c.ocupacion_id = o.id
        ${soloOrigen ? 'WHERE o.es_origen' : ''}
        GROUP BY o.id ORDER BY o.es_origen DESC, o.nombre_simple`,
    );
    return rows;
  });

  app.get('/ocupaciones/:id', async (req, reply) => {
    const ocupacion = await obtenerOcupacion(req.params.id);
    if (!ocupacion) return reply.code(404).send({ error: 'Ocupación no encontrada' });
    return { ...ocupacion, competencias: await competenciasDe(ocupacion.id) };
  });
}
