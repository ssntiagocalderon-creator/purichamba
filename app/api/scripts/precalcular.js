// Precalcula coincidencias entre competencias y el grafo de transiciones.
//   1. Compara cada par de competencias de ocupaciones distintas:
//        - IA_MODO=qvac y EQUIVALENCIAS=decision (por defecto): Laya responde "¿son la misma tarea?" (D-056).
//        - IA_MODO=qvac y EQUIVALENCIAS=embeddings: coseno de EmbeddingGemma.
//        - IA_MODO=sin_ia: similitud léxica.
//   2. Aplica las equivalencias validadas por el equipo (datos/equivalencias.csv), que mandan sobre el umbral.
//   3. Calcula la cobertura ocupación → ocupación por tareas, con la fórmula fija y solo pares validados
//      (issue #6, D-057 y D-058). La IA no da el porcentaje.
// Imprime los pares con puntaje más alto para ayudar a calibrar el umbral (Plan, sección 10.3).
import { readFileSync } from 'node:fs';
import { config } from '../src/config.js';
import { aVector, pool } from '../src/db.js';
import { decidirPar } from '../src/cobertura.js';
import { cerrarIa, juzgarPares, vectorizar } from '../src/ia.js';
import { coseno, leerCsv, similitudLexica, sinColetilla } from '../src/texto.js';
import { coberturaPorTareas, puestoDeEntrada } from '../src/tareas.js';

const equivalencias = new Map(
  leerCsv(readFileSync(new URL('../../datos/equivalencias.csv', import.meta.url), 'utf8'))
    .map((f) => [[f.codigo_a, f.codigo_b].sort().join('|'), f.es_equivalente.toLowerCase().startsWith('s')]),
);

try {
  const { rows: competencias } = await pool.query('SELECT id, ocupacion_id, descripcion, texto_simple FROM competencias ORDER BY id');
  const { rows: ocupaciones } = await pool.query('SELECT id FROM ocupaciones WHERE NOT sin_perfil');

  // Modo: 'decision' (Laya juzga cada par, D-056) | 'embeddings' (coseno + umbral) | 'lexico' (sin IA).
  const modo = config.iaModo !== 'qvac' ? 'lexico' : config.equivalencias;
  const umbral = { decision: config.umbralDecision, embeddings: config.umbralEmbeddings, lexico: config.umbralLexico }[modo];
  const metodo = modo === 'decision' ? 'decision' : 'similitud';
  const nombreModo = {
    decision: `modelo de decisión QVAC (${config.modeloDecision})`,
    embeddings: `embeddings QVAC (${config.modeloEmbeddings})`,
    lexico: 'léxico (sin IA)',
  }[modo];
  console.log(`Modo: ${nombreModo} · umbral ${umbral}`);

  // Pares de competencias de ocupaciones distintas.
  const candidatos = [];
  for (let i = 0; i < competencias.length; i += 1) {
    for (let j = i + 1; j < competencias.length; j += 1) {
      if (competencias[i].ocupacion_id !== competencias[j].ocupacion_id) candidatos.push({ a: competencias[i], b: competencias[j] });
    }
  }

  let puntajes;
  if (modo === 'decision') {
    const inicio = performance.now();
    puntajes = await juzgarPares(candidatos);
    console.log(`✓ ${candidatos.length} pares juzgados por Laya en ${((performance.now() - inicio) / 1000).toFixed(1)} s`);
  } else if (modo === 'embeddings') {
    // Sin la coletilla común del MTPE, que hace parecidos a todos los pares.
    const lista = await vectorizar(competencias.map((c) => sinColetilla(c.descripcion)));
    const vectores = new Map(competencias.map((c, i) => [c.id, lista[i]]));
    for (const c of competencias) {
      await pool.query('UPDATE competencias SET embedding = $2 WHERE id = $1', [c.id, aVector(vectores.get(c.id))]);
    }
    console.log(`✓ ${competencias.length} competencias vectorizadas (${lista[0]?.length} dimensiones)`);
    puntajes = candidatos.map(({ a, b }) => coseno(vectores.get(a.id), vectores.get(b.id)));
  } else {
    puntajes = candidatos.map(({ a, b }) => similitudLexica(a.descripcion, b.descripcion));
  }

  const pares = new Map();
  const filas = [];
  candidatos.forEach(({ a, b }, i) => {
    const similitud = puntajes[i];
    const clave = [a.id, b.id].sort().join('|');
    const decision = decidirPar({ similitud, validacion: equivalencias.get(clave), umbral, metodo });
    const par = { a: a.id, b: b.id, similitud: Number(similitud.toFixed(4)), ...decision };
    pares.set(`${a.id}|${b.id}`, par);
    filas.push(par);
  });

  const porOcupacion = new Map(ocupaciones.map((o) => [o.id, competencias.filter((c) => c.ocupacion_id === o.id).map((c) => c.id)]));
  let total = 0;
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    await cliente.query('TRUNCATE coincidencias, transiciones');
    for (const p of filas) {
      await cliente.query(
        'INSERT INTO coincidencias (a, b, similitud, metodo, es_equivalente) VALUES ($1, $2, $3, $4, $5)',
        [p.a, p.b, p.similitud, p.metodo, p.es_equivalente],
      );
    }
    for (const origen of ocupaciones) {
      for (const destino of ocupaciones) {
        if (origen.id === destino.id) continue;
        const cob = coberturaPorTareas(
          puestoDeEntrada(origen.id, porOcupacion.get(origen.id)), destino.id, porOcupacion.get(destino.id), pares,
        );
        await cliente.query(
          'INSERT INTO transiciones (origen, destino, tiene, total, compartidas, faltantes) VALUES ($1, $2, $3, $4, $5, $6)',
          [origen.id, destino.id, cob.tiene, cob.total, JSON.stringify(cob.compartidas), JSON.stringify(cob.faltantes)],
        );
        total += 1;
      }
    }
    await cliente.query('COMMIT');
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }

  console.log(`✓ ${filas.length} pares comparados · ${filas.filter((p) => p.es_equivalente).length} equivalentes · ${total} transiciones`);
  console.log(`\nPares con puntaje más alto (${modo === 'decision' ? 'probabilidad de Laya' : 'similitud'}, para calibrar el umbral):`);
  console.table(
    [...filas].sort((x, y) => y.similitud - x.similitud).slice(0, 15)
      .map((p) => ({ a: p.a, b: p.b, similitud: p.similitud, metodo: p.metodo, equivalente: p.es_equivalente })),
  );
} catch (error) {
  console.error('✗', error.message);
  process.exitCode = 1;
} finally {
  await cerrarIa();
  await pool.end();
}
