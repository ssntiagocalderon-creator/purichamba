import { consulta } from '../db.js';
import { rotulo } from '../cobertura.js';
import { explicarConIa, explicarConPlantilla } from '../ia.js';
import {
  cargarPares, competenciasDe, competenciasPorId, cursosPara, obtenerOcupacion,
} from '../repositorio.js';
import { coberturaPorTareas, eclDe, puestoDeEntrada, textosDeUnidades } from '../tareas.js';

const conRotulo = (t) => {
  const porcentaje = t.total ? Math.round((t.tiene / t.total) * 100) : 0;
  return { ...t, porcentaje, rotulo: rotulo({ ...t, porcentaje }) };
};

/** Detalle de una transición con el texto y la fuente oficial de cada tarea (D-058). */
export const detalleTransicion = async ({ origen, destino, cobertura }) => {
  const ids = [
    ...cobertura.compartidas.flatMap((c) => [c.origen, c.destino]),
    ...cobertura.faltantes,
  ];
  const textos = await textosDeUnidades([...new Set(ids)], competenciasPorId);
  const compartidas = cobertura.compartidas.map((c) => ({
    ...c,
    competencia: textos.get(c.destino),
    la_tuya: textos.get(c.origen),
  }));
  const faltantes = cobertura.faltantes.map((id) => textos.get(id));
  // Los cursos y centros están por estándar: cada tarea que falta muestra los de su estándar.
  const cursos = await cursosPara([...new Set(cobertura.faltantes.map(eclDe))]);
  return {
    origen: { id: origen.id, nombre_simple: origen.nombre_simple },
    destino: { id: destino.id, nombre_simple: destino.nombre_simple, nombre: destino.nombre },
    tiene: cobertura.tiene,
    total: cobertura.total,
    porcentaje: cobertura.porcentaje,
    rotulo: rotulo(cobertura),
    compartidas,
    faltantes: faltantes.map((f) => ({ ...f, cursos: cursos.filter((c) => c.competencia_id === eclDe(f.id)) })),
    explicacion: explicarConPlantilla({ origen, destino, compartidas, faltantes }),
  };
};

export default async function rutasTransiciones(app) {
  // Pantalla 3 (sin perfil): transiciones precalculadas de una ocupación a las demás.
  app.get('/transiciones', async (req, reply) => {
    const { origen } = req.query;
    if (!origen) return reply.code(400).send({ error: 'Falta ?origen=' });
    const { rows } = await consulta(
      `SELECT t.destino, t.tiene, t.total, o.nombre_simple, o.nombre
         FROM transiciones t JOIN ocupaciones o ON o.id = t.destino
        WHERE t.origen = $1 AND t.total > 0 AND t.tiene > 0
        ORDER BY (t.tiene::float / t.total) DESC, t.tiene DESC`,
      [origen],
    );
    return rows.map(conRotulo);
  });

  // Pantalla 4 (sin perfil): detalle ocupación → ocupación.
  app.get('/transiciones/:origen/:destino', async (req, reply) => {
    const origen = await obtenerOcupacion(req.params.origen);
    const destino = await obtenerOcupacion(req.params.destino);
    if (!origen || !destino) return reply.code(404).send({ error: 'Ocupación no encontrada' });
    const cobertura = coberturaPorTareas(
      puestoDeEntrada(origen.id, (await competenciasDe(origen.id)).map((c) => c.id)),
      destino.id,
      (await competenciasDe(destino.id)).map((c) => c.id),
      await cargarPares(),
    );
    return detalleTransicion({ origen, destino, cobertura });
  });

  // Explicación con IA (servidor de Tether o Qwen local, según EXPLICACION). Si no hay IA o falla, la plantilla.
  app.post('/transiciones/:origen/:destino/explicar', async (req, reply) => {
    const origen = await obtenerOcupacion(req.params.origen);
    const destino = await obtenerOcupacion(req.params.destino);
    if (!origen || !destino) return reply.code(404).send({ error: 'Ocupación no encontrada' });
    const cobertura = coberturaPorTareas(
      puestoDeEntrada(origen.id, (await competenciasDe(origen.id)).map((c) => c.id)),
      destino.id,
      (await competenciasDe(destino.id)).map((c) => c.id),
      await cargarPares(),
    );
    const detalle = await detalleTransicion({ origen, destino, cobertura });
    const texto = (c) => c?.texto_simple || c?.descripcion;
    // Solo se envían nombres de ocupaciones y textos oficiales de competencias: nunca el relato de la persona.
    const generada = await explicarConIa({
      origen,
      destino,
      compartidasTexto: detalle.compartidas.map((c) => texto(c.competencia)),
      faltantesTexto: detalle.faltantes.map(texto),
    });
    return generada
      ? { explicacion: generada.texto, generada_por: generada.generada_por }
      : { explicacion: detalle.explicacion, generada_por: 'plantilla' };
  });
}
