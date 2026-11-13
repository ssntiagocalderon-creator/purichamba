import { randomBytes } from 'node:crypto';
import { consulta, pool } from '../db.js';
import { rotulo } from '../cobertura.js';
import { cargarPares, competenciasDe, competenciasPorId, obtenerOcupacion } from '../repositorio.js';
import { errorDeRuc } from '../ruc.js';
import { coberturaDeEstandares, textosDeUnidades } from '../tareas.js';

// Lado de la empresa (D-071, por confirmar). La empresa no busca personas: publica lo que necesita y la persona
// decide a qué aviso postular y compartirle su pasaporte. La app sigue sin guardar nombre ni DNI.

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const texto = (valor, maximo) => {
  const limpio = typeof valor === 'string' ? valor.trim() : '';
  return limpio && limpio.length <= maximo ? limpio : null;
};

const empresaPorToken = async (token) =>
  (await consulta('SELECT * FROM empresas WHERE token_panel = $1', [String(token)])).rows[0] || null;

const sinToken = ({ token_panel: _token, ...empresa }) => empresa;

// Solo cuenta lo que la persona confirmó con "Sí, lo hago" (igual que en perfiles.js).
const confirmadasDe = async (perfilId) =>
  (await consulta(
    `SELECT competencia_id FROM perfil_competencia WHERE perfil_id = $1 AND respuesta = 'si'`,
    [perfilId],
  )).rows.map((r) => r.competencia_id);

const pedidasPor = async (avisoIds) => {
  const { rows } = await consulta(
    'SELECT aviso_id, competencia_id FROM aviso_competencia WHERE aviso_id = ANY($1) ORDER BY competencia_id',
    [avisoIds],
  );
  const porAviso = new Map(avisoIds.map((id) => [id, []]));
  for (const r of rows) porAviso.get(r.aviso_id).push(r.competencia_id);
  return porAviso;
};

/** "Tienes 2 de 3 tareas" de la persona frente a lo que pide el aviso. */
const coberturaFrente = (confirmadas, pedidas, pares) => {
  const cob = coberturaDeEstandares(confirmadas, pedidas, pares);
  return { tiene: cob.tiene, total: cob.total, porcentaje: cob.porcentaje, rotulo: rotulo(cob), faltantes: cob.faltantes };
};

export default async function rutasEmpresas(app) {
  // Registro con RUC. Sin contraseñas: la empresa recibe un enlace privado a su panel.
  app.post('/empresas', async (req, reply) => {
    const cuerpo = req.body || {};
    const ruc = String(cuerpo.ruc ?? '').trim();
    const errorRuc = errorDeRuc(ruc);
    if (errorRuc) return reply.code(400).send({ error: errorRuc });
    const razonSocial = texto(cuerpo.razon_social, 200);
    const region = texto(cuerpo.region, 80);
    const correo = texto(cuerpo.correo, 200);
    if (!razonSocial || !region) return reply.code(400).send({ error: 'Faltan la razón social o la región' });
    if (!correo || !CORREO.test(correo)) return reply.code(400).send({ error: 'El correo no es válido' });

    const token = randomBytes(18).toString('base64url');
    const { rows: [empresa] } = await consulta(
      `INSERT INTO empresas (ruc, razon_social, region, correo, token_panel)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (ruc) DO NOTHING RETURNING id`,
      [ruc, razonSocial, region, correo, token],
    );
    // No se devuelve el enlace de otra empresa ya registrada con ese RUC.
    if (!empresa) return reply.code(409).send({ error: 'Ese RUC ya está registrado. Usa el enlace de tu panel.' });
    return { token };
  });

  // Panel de la empresa: sus datos y sus avisos con cuántas postulaciones tiene cada uno.
  app.get('/empresas/:token', async (req, reply) => {
    const empresa = await empresaPorToken(req.params.token);
    if (!empresa) return reply.code(404).send({ error: 'Panel no encontrado' });
    const { rows: avisos } = await consulta(
      `SELECT a.*, o.nombre_simple AS ocupacion, count(p.id)::int AS postulaciones
         FROM avisos a JOIN ocupaciones o ON o.id = a.ocupacion_id
         LEFT JOIN postulaciones p ON p.aviso_id = a.id
        WHERE a.empresa_id = $1 GROUP BY a.id, o.nombre_simple ORDER BY a.creado_en DESC`,
      [empresa.id],
    );
    const pedidas = await pedidasPor(avisos.map((a) => a.id));
    return { empresa: sinToken(empresa), avisos: avisos.map((a) => ({ ...a, competencias: pedidas.get(a.id) })) };
  });

  // Publicar un aviso: ocupación y estándares de la lista oficial, con planilla, sueldo y seguro social (D-068).
  app.post('/empresas/:token/avisos', async (req, reply) => {
    const empresa = await empresaPorToken(req.params.token);
    if (!empresa) return reply.code(404).send({ error: 'Panel no encontrado' });
    const cuerpo = req.body || {};
    const ocupacion = await obtenerOcupacion(cuerpo.ocupacion_id);
    if (!ocupacion || ocupacion.sin_perfil) return reply.code(400).send({ error: 'Ocupación no válida' });
    const titulo = texto(cuerpo.titulo, 150);
    const region = texto(cuerpo.region, 80);
    if (!titulo || !region) return reply.code(400).send({ error: 'Faltan el título o la región' });
    const sueldo = Number(cuerpo.sueldo);
    if (!Number.isInteger(sueldo) || sueldo <= 0) return reply.code(400).send({ error: 'Indica el sueldo mensual en soles' });
    if (cuerpo.en_planilla !== true || cuerpo.seguro_social !== true) {
      return reply.code(400).send({ error: 'Solo se publican empleos formales: con contrato en planilla y seguro social' });
    }
    const url = cuerpo.url ? texto(cuerpo.url, 500) : null;
    if (cuerpo.url && !/^https:\/\//.test(url || '')) return reply.code(400).send({ error: 'El enlace debe empezar con https://' });

    const oficiales = new Set((await competenciasDe(ocupacion.id)).map((c) => c.id));
    const pedidas = [...new Set(Array.isArray(cuerpo.competencias) ? cuerpo.competencias : [])];
    if (pedidas.length === 0) return reply.code(400).send({ error: 'Marca al menos una competencia' });
    const ajena = pedidas.find((c) => !oficiales.has(c));
    if (ajena) return reply.code(400).send({ error: `La competencia ${ajena} no es de esa ocupación` });

    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      const { rows: [aviso] } = await cliente.query(
        `INSERT INTO avisos (empresa_id, ocupacion_id, titulo, region, sueldo, en_planilla, seguro_social, url)
         VALUES ($1, $2, $3, $4, $5, true, true, $6) RETURNING id`,
        [empresa.id, ocupacion.id, titulo, region, sueldo, url],
      );
      for (const c of pedidas) {
        await cliente.query('INSERT INTO aviso_competencia (aviso_id, competencia_id) VALUES ($1, $2)', [aviso.id, c]);
      }
      await cliente.query('COMMIT');
      return { id: aviso.id };
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  });

  // Postulantes de un aviso: su "X de Y", lo que confirmaron, el contacto que dejaron y su pasaporte.
  app.get('/empresas/:token/avisos/:id/postulantes', async (req, reply) => {
    const empresa = await empresaPorToken(req.params.token);
    if (!empresa) return reply.code(404).send({ error: 'Panel no encontrado' });
    const { rows: [aviso] } = await consulta(
      'SELECT * FROM avisos WHERE id = $1 AND empresa_id = $2',
      [Number(req.params.id) || 0, empresa.id],
    );
    if (!aviso) return reply.code(404).send({ error: 'Aviso no encontrado' });
    const pedidas = (await pedidasPor([aviso.id])).get(aviso.id);
    const pares = await cargarPares();
    const { rows } = await consulta(
      `SELECT p.id, p.contacto, p.estado, p.creado_en, pf.id AS perfil_id, pf.token_publico, o.nombre_simple AS ocupacion
         FROM postulaciones p JOIN perfiles pf ON pf.id = p.perfil_id JOIN ocupaciones o ON o.id = pf.ocupacion_id
        WHERE p.aviso_id = $1 ORDER BY p.creado_en`,
      [aviso.id],
    );
    const postulantes = [];
    for (const { perfil_id: perfilId, token_publico: tokenPublico, ...p } of rows) {
      const cob = coberturaFrente(await confirmadasDe(perfilId), pedidas, pares);
      const textos = await textosDeUnidades(cob.faltantes, competenciasPorId);
      const faltantes = cob.faltantes.map((id) => textos.get(id)?.texto_simple || textos.get(id)?.descripcion || id);
      postulantes.push({ ...p, pasaporte: tokenPublico, ...cob, faltantes });
    }
    await consulta(`UPDATE postulaciones SET estado = 'vista' WHERE aviso_id = $1 AND estado = 'nueva'`, [aviso.id]);
    return postulantes.sort((a, b) => b.porcentaje - a.porcentaje);
  });

  // Lado de la persona: avisos de empresas registradas para una ocupación, con su "X de Y" si hay perfil.
  app.get('/avisos', async (req, reply) => {
    const { ocupacion, perfil } = req.query;
    if (!ocupacion) return reply.code(400).send({ error: 'Falta ?ocupacion=' });
    const { rows: avisos } = await consulta(
      `SELECT a.id, a.titulo, a.region, a.sueldo, a.url, a.creado_en, e.razon_social AS empresa, e.ruc, e.verificada
         FROM avisos a JOIN empresas e ON e.id = a.empresa_id
        WHERE a.ocupacion_id = $1 AND a.activo ORDER BY a.creado_en DESC LIMIT 10`,
      [ocupacion],
    );
    if (avisos.length === 0) return [];
    const pedidas = await pedidasPor(avisos.map((a) => a.id));
    const conPerfil = /^[0-9a-f-]{36}$/i.test(perfil || '');
    const confirmadas = conPerfil ? await confirmadasDe(perfil) : null;
    const yaPostulo = conPerfil
      ? new Set((await consulta('SELECT aviso_id FROM postulaciones WHERE perfil_id = $1', [perfil])).rows.map((r) => r.aviso_id))
      : new Set();
    const pares = confirmadas ? await cargarPares() : null;
    return avisos.map((a) => ({
      ...a,
      ya_postulaste: yaPostulo.has(a.id),
      ...(confirmadas ? (({ faltantes: _f, ...cob }) => cob)(coberturaFrente(confirmadas, pedidas.get(a.id), pares)) : {}),
    }));
  });

  // Postular: la persona deja un teléfono o correo, por voluntad propia y solo para esa empresa.
  // La empresa ve su pasaporte, así que se crea el enlace de solo lectura si aún no existe.
  app.post('/avisos/:id/postular', async (req, reply) => {
    const { perfil_id: perfilId } = req.body || {};
    const contacto = texto(req.body?.contacto, 120);
    if (!contacto || contacto.length < 6) return reply.code(400).send({ error: 'Deja un teléfono o correo para que la empresa te contacte' });
    if (!/^[0-9a-f-]{36}$/i.test(perfilId || '')) return reply.code(400).send({ error: 'Perfil no válido' });
    const { rows: [perfil] } = await consulta('SELECT id, token_publico FROM perfiles WHERE id = $1', [perfilId]);
    const { rows: [aviso] } = await consulta('SELECT id FROM avisos WHERE id = $1 AND activo', [Number(req.params.id) || 0]);
    if (!perfil || !aviso) return reply.code(404).send({ error: 'No encontrado' });
    if (!perfil.token_publico) {
      await consulta('UPDATE perfiles SET token_publico = $2 WHERE id = $1', [perfil.id, randomBytes(12).toString('base64url')]);
    }
    const { rowCount } = await consulta(
      `INSERT INTO postulaciones (aviso_id, perfil_id, contacto) VALUES ($1, $2, $3)
       ON CONFLICT (aviso_id, perfil_id) DO NOTHING`,
      [aviso.id, perfil.id, contacto],
    );
    return { ok: true, ya_habias_postulado: rowCount === 0 };
  });
}
