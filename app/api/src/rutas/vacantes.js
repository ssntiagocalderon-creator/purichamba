import { consulta } from '../db.js';

export default async function rutasVacantes(app) {
  // "Vacantes para ti" (D-050): vacantes reales cargadas a mano desde Empleos Perú, con enlace y fecha.
  // Con ?region=, primero las de esa región; si no hay, se muestran las de otras regiones
  // (en_region = false) para que la pantalla no quede vacía. La web lo avisa.
  app.get('/vacantes', async (req, reply) => {
    const { ocupacion, region } = req.query;
    if (!ocupacion) return reply.code(400).send({ error: 'Falta ?ocupacion=' });
    const { rows } = await consulta(
      `SELECT *, (lower(region) = lower($2)) AS en_region
         FROM vacantes WHERE ocupacion_id = $1
        ORDER BY (lower(region) = lower($2)) DESC, fecha_publicacion DESC NULLS LAST LIMIT 10`,
      [ocupacion, region || ''],
    );
    // Si hay vacantes en la región, solo esas; si no, todas (marcadas como de otra región).
    const enRegion = rows.filter((v) => v.en_region);
    return region && enRegion.length ? enRegion : rows;
  });
}
