// Carga ocupaciones y competencias desde app/datos/ y la matriz oficial procesada.
// Se puede correr varias veces: actualiza lo que existe y borra lo que ya no está en ocupaciones.json.
import { readFileSync } from 'node:fs';
import { pool } from '../src/db.js';
import { leerCsv } from '../src/texto.js';

const ruta = (relativa) => new URL(relativa, import.meta.url);
const leerJson = (relativa) => JSON.parse(readFileSync(ruta(relativa), 'utf8'));
const leerCsvArchivo = (relativa) => leerCsv(readFileSync(ruta(relativa), 'utf8'));
const siNo = (valor) => (valor === '' ? null : ['si', 'sí', 'true', '1'].includes(valor.toLowerCase()));

const matriz = leerJson('../../../datos/procesados/mtpe_estandares_competencia.json');
const { ocupaciones } = leerJson('../../datos/ocupaciones.json');
const textosSimples = new Map(leerCsvArchivo('../../datos/textos_simples.csv').map((f) => [f.codigo_ecl, f.texto_simple]));
const ecl = new Map(matriz.registros.map((r) => [r.codigo_ecl, r]));
const FUENTE = `${matriz.fuente.nombre}`;

const cliente = await pool.connect();
try {
  await cliente.query('BEGIN');
  const codigosVigentes = [];

  for (const o of ocupaciones) {
    const registros = o.ecl.map((codigo) => {
      const r = ecl.get(codigo);
      if (!r) throw new Error(`${o.id}: el estándar ${codigo} no está en la matriz`);
      if (!r.vigente_al_2026_10_20) console.warn(`⚠ ${codigo} no está vigente al 20-10-2026`);
      return r;
    });
    const nombre = o.nombre
      || registros[0]?.perfil_ocupacional?.replace(/^Perfil Ocupacional de /i, '')
      || o.nombre_simple;
    await cliente.query(
      `INSERT INTO ocupaciones (id, nombre, nombre_simple, codigo_perfil, es_origen, sin_perfil, nota)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, nombre_simple = EXCLUDED.nombre_simple,
         codigo_perfil = EXCLUDED.codigo_perfil, es_origen = EXCLUDED.es_origen,
         sin_perfil = EXCLUDED.sin_perfil, nota = EXCLUDED.nota`,
      [o.id, nombre, o.nombre_simple, o.codigo_perfil, Boolean(o.es_origen), Boolean(o.sin_perfil), o.nota || null],
    );
    for (const r of registros) {
      codigosVigentes.push(r.codigo_ecl);
      await cliente.query(
        `INSERT INTO competencias (id, ocupacion_id, descripcion, texto_simple, nivel, puestos, fuente, fuente_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET ocupacion_id = EXCLUDED.ocupacion_id, descripcion = EXCLUDED.descripcion,
           texto_simple = EXCLUDED.texto_simple, nivel = EXCLUDED.nivel, puestos = EXCLUDED.puestos,
           fuente = EXCLUDED.fuente, fuente_url = EXCLUDED.fuente_url`,
        [r.codigo_ecl, o.id, r.descripcion_ecl, textosSimples.get(r.codigo_ecl) || null,
          r.nivel_competencia, r.puestos_asociados, FUENTE, matriz.fuente.url],
      );
    }
  }

  await cliente.query('DELETE FROM competencias WHERE NOT (id = ANY($1))', [codigosVigentes]);
  await cliente.query('DELETE FROM ocupaciones WHERE NOT (id = ANY($1)) AND id NOT IN (SELECT ocupacion_id FROM perfiles)',
    [ocupaciones.map((o) => o.id)]);

  // Vacantes y cursos: se recargan completos desde los CSV.
  await cliente.query('TRUNCATE vacantes, cursos RESTART IDENTITY');
  const vacantes = leerCsvArchivo('../../datos/vacantes.csv');
  for (const v of vacantes) {
    if (!v.url) throw new Error(`Vacante sin enlace: ${v.titulo}`);
    await cliente.query(
      `INSERT INTO vacantes (ocupacion_id, region, titulo, empresa, url, fecha_publicacion, es_simulada)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [v.ocupacion_id, v.region, v.titulo, v.empresa || null, v.url, v.fecha_publicacion || null, siNo(v.es_simulada) ?? false],
    );
  }
  const cursos = leerCsvArchivo('../../datos/cursos.csv');
  for (const c of cursos) {
    await cliente.query(
      `INSERT INTO cursos (competencia_id, nombre, tipo, url, horas, modalidad, gratuito, fuente)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [c.codigo_ecl, c.nombre, c.tipo, c.url, c.horas ? Number(c.horas) : null, c.modalidad || null, siNo(c.gratuito), c.fuente],
    );
  }

  await cliente.query('COMMIT');
  console.log(`✓ ${ocupaciones.length} ocupaciones, ${codigosVigentes.length} competencias, ${vacantes.length} vacantes, ${cursos.length} cursos`);
} catch (error) {
  await cliente.query('ROLLBACK');
  console.error('✗', error.message);
  process.exitCode = 1;
} finally {
  cliente.release();
  await pool.end();
}
