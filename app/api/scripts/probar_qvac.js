// Prueba de QVAC con los datos del prototipo. NO necesita Postgres ni Docker: solo Node >= 22.17.
//   npm run qvac:probar
// Mide y guarda en resultados/qvac-<fecha>.json:
//   1. Cuánto tardan en cargar los modelos (la primera vez incluye la descarga).
//   2. Equivalencias con el modelo de decisión Laya (D-056): probabilidad "son la misma tarea" para los pares
//      de calibración de datos/equivalencias.csv (incluidas las sugerencias comentadas) → UMBRAL_DECISION.
//   3. Lo mismo con EmbeddingGemma (sin la coletilla del MTPE), para comparar cuál separa mejor el sí del no.
//      Se salta con PROBAR_EMBEDDINGS=no.
//   4. Propuestas para tres relatos ficticios (Laya o Qwen local, según PROPUESTAS), con su tiempo.
//   5. Una explicación de transición (servidor de Tether, Qwen local o plantilla, según EXPLICACION).
// Los relatos son de personas FICTICIAS (AGENTS.md, regla 5).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

process.env.IA_MODO = 'qvac';
const { config } = await import('../src/config.js');
const ia = await import('../src/ia.js');
const { coseno, leerCsv, sinColetilla } = await import('../src/texto.js');

const ruta = (relativa) => new URL(relativa, import.meta.url);
const seg = (inicio) => Number(((performance.now() - inicio) / 1000).toFixed(1));
const r3 = (n) => Number(n.toFixed(3));

// ---------- Datos (los mismos que carga la app) ----------
const matriz = JSON.parse(readFileSync(ruta('../../../datos/procesados/mtpe_estandares_competencia.json'), 'utf8'));
const { ocupaciones } = JSON.parse(readFileSync(ruta('../../datos/ocupaciones.json'), 'utf8'));
const simples = new Map(leerCsv(readFileSync(ruta('../../datos/textos_simples.csv'), 'utf8')).map((f) => [f.codigo_ecl, f.texto_simple]));
const ecl = new Map(matriz.registros.map((r) => [r.codigo_ecl, r]));
const competencias = ocupaciones.flatMap((o) => o.ecl.map((codigo) => ({
  id: codigo,
  ocupacion: o.id,
  descripcion: ecl.get(codigo).descripcion_ecl,
  texto_simple: simples.get(codigo) || null,
})));
const porId = new Map(competencias.map((c) => [c.id, c]));
const porOcupacion = (id) => competencias.filter((c) => c.ocupacion === id);

// Pares de calibración: filas activas y sugerencias comentadas ("# A,B,si,...") de equivalencias.csv
const calibracion = readFileSync(ruta('../../datos/equivalencias.csv'), 'utf8')
  .split(/\r?\n/)
  .map((l) => l.replace(/^#\s*/, '').split(','))
  .filter(([a, b, v]) => porId.has(a?.trim()) && porId.has(b?.trim()) && /^(si|sí|no)$/i.test(v?.trim()))
  .map(([a, b, v]) => ({ a: a.trim(), b: b.trim(), esperado: v.trim().toLowerCase().startsWith('s') }));

// Todos los pares de competencias de ocupaciones distintas.
const todos = [];
for (let i = 0; i < competencias.length; i += 1) {
  for (let j = i + 1; j < competencias.length; j += 1) {
    if (competencias[i].ocupacion !== competencias[j].ocupacion) todos.push({ a: competencias[i], b: competencias[j] });
  }
}

/** Umbral que separa los pares "sí" de los "no", si existe (punto medio del hueco). */
const sugerirUmbral = (pares) => {
  const si = pares.filter((p) => p.esperado).map((p) => p.puntaje);
  const no = pares.filter((p) => !p.esperado).map((p) => p.puntaje);
  if (si.length && no.length) {
    return Math.min(...si) > Math.max(...no) ? r3((Math.min(...si) + Math.max(...no)) / 2) : null;
  }
  return si.length ? r3(Math.min(...si) - 0.02) : null;
};

const resumirTodos = (puntajes) => {
  const filas = todos.map(({ a, b }, i) => ({ a: a.id, b: b.id, puntaje: r3(puntajes[i]) })).sort((x, y) => y.puntaje - x.puntaje);
  const valores = filas.map((f) => f.puntaje);
  return { minimo: valores.at(-1), maximo: valores[0], mediana: valores[Math.floor(valores.length / 2)], top15: filas.slice(0, 15) };
};

const mostrarCalibracion = (nombre, variable, actual, cal, sugerido) => {
  console.log(`\n   Pares de calibración con ${nombre}:`);
  console.table(cal.map((p) => ({ a: p.a, b: p.b, esperado: p.esperado ? 'si' : 'no', puntaje: p.puntaje })));
  console.log(sugerido != null
    ? `   → Umbral sugerido: ${variable}=${sugerido} (hoy: ${actual}). Son pocos pares: tómalo como punto de partida.`
    : '   → Los pares "si" y "no" se mezclan: ningún umbral los separa. Agreguen pares revisados en equivalencias.csv.');
};

const CASOS = [
  { ocupacion: 'cajero', relato: 'Atiendo a los clientes, cobro en caja con efectivo y tarjeta, y al cerrar cuadro la caja con mi supervisora.' },
  { ocupacion: 'limpieza', relato: 'Limpio las oficinas y los baños del edificio, y dejo todo listo antes de que lleguen los trabajadores.' },
  { ocupacion: 'almacen', relato: 'Recibo la mercadería, la ordeno en los estantes y la muevo con la carretilla hidráulica.' },
];

const resultado = {
  fecha: new Date().toISOString(),
  nota: 'Relatos de personas ficticias. Prueba del prototipo app/ (Plan, D-055 y D-056).',
  equipo: { plataforma: process.platform, arquitectura: process.arch, node: process.version },
  pasos: { propuestas: config.propuestas, equivalencias: config.equivalencias, explicacion: config.explicacion },
  modelos: { decision: config.modeloDecision, embeddings: config.modeloEmbeddings, llm: config.modeloLlm },
};

try {
  // 1. Carga
  console.log(`\n1) Cargando modelos: ${ia.modelosNecesarios().join(', ') || '(ninguno)'} + voz. La primera vez se descargan…`);
  await ia.precargarModelos();
  resultado.carga_segundos = ia.estadoIa().segundos;
  console.log(`   ✓ ${Object.entries(resultado.carga_segundos).map(([k, v]) => `${k} ${v} s`).join(' · ')}`);

  // 2. Laya
  console.log(`\n2) Modelo de decisión (${config.modeloDecision}): ${todos.length} pares de ocupaciones distintas…`);
  let inicio = performance.now();
  const probabilidades = await ia.juzgarPares(todos);
  const segundosLaya = seg(inicio);
  const indice = new Map(todos.map(({ a, b }, i) => [[a.id, b.id].sort().join('|'), i]));
  const calLaya = calibracion.map((p) => ({ ...p, puntaje: r3(probabilidades[indice.get([p.a, p.b].sort().join('|'))] ?? NaN) }));
  const sugeridoLaya = sugerirUmbral(calLaya);
  resultado.decision = {
    segundos: segundosLaya,
    por_par_ms: Math.round((segundosLaya * 1000) / todos.length),
    equivalentes_con_umbral_actual: probabilidades.filter((p) => p >= config.umbralDecision).length,
    ...resumirTodos(probabilidades),
    calibracion: calLaya,
    umbral_sugerido: sugeridoLaya,
    umbral_actual: config.umbralDecision,
  };
  console.log(`   ✓ ${segundosLaya} s (${resultado.decision.por_par_ms} ms por par) · probabilidades de ${resultado.decision.minimo} a ${resultado.decision.maximo} (mediana ${resultado.decision.mediana})`);
  console.log(`   Con UMBRAL_DECISION=${config.umbralDecision}: ${resultado.decision.equivalentes_con_umbral_actual} pares equivalentes de ${todos.length}`);
  console.table(resultado.decision.top15.map((p) => ({ ...p, a_texto: simples.get(p.a), b_texto: simples.get(p.b) })));
  mostrarCalibracion('Laya', 'UMBRAL_DECISION', config.umbralDecision, calLaya, sugeridoLaya);

  // 3. Embeddings, para comparar
  if (process.env.PROBAR_EMBEDDINGS !== 'no') {
    console.log(`\n3) Comparación con embeddings (${config.modeloEmbeddings}, texto sin la coletilla del MTPE)…`);
    inicio = performance.now();
    const vectores = await ia.vectorizar(competencias.map((c) => sinColetilla(c.descripcion)));
    const vec = new Map(competencias.map((c, i) => [c.id, vectores[i]]));
    const cosenos = todos.map(({ a, b }) => coseno(vec.get(a.id), vec.get(b.id)));
    const calEmb = calibracion.map((p) => ({ ...p, puntaje: r3(coseno(vec.get(p.a), vec.get(p.b))) }));
    const sugeridoEmb = sugerirUmbral(calEmb);
    resultado.embeddings = { segundos: seg(inicio), ...resumirTodos(cosenos), calibracion: calEmb, umbral_sugerido: sugeridoEmb };
    console.log(`   ✓ ${resultado.embeddings.segundos} s · similitudes de ${resultado.embeddings.minimo} a ${resultado.embeddings.maximo} (mediana ${resultado.embeddings.mediana})`);
    mostrarCalibracion('embeddings', 'UMBRAL_EMBEDDINGS', config.umbralEmbeddings, calEmb, sugeridoEmb);
  } else {
    console.log('\n3) Comparación con embeddings: omitida (PROBAR_EMBEDDINGS=no).');
  }

  // 4. Propuestas
  const quien = config.propuestas === 'llm' ? `Qwen local (${config.modeloLlm})` : `Laya (${config.modeloDecision})`;
  console.log(`\n4) Propuestas con ${quien} para ${CASOS.length} relatos ficticios (UMBRAL_PROPUESTA=${config.umbralPropuesta})…`);
  resultado.propuestas = [];
  for (const caso of CASOS) {
    inicio = performance.now();
    const { propuestas } = await ia.proponerCompetencias(caso.relato, porOcupacion(caso.ocupacion));
    const fila = { ...caso, segundos: seg(inicio), propuestas: propuestas.map((p) => ({ ...p, texto: simples.get(p.codigo) })) };
    resultado.propuestas.push(fila);
    console.log(`   ${caso.ocupacion}: ${fila.segundos} s`);
    for (const p of fila.propuestas) console.log(`     · ${p.codigo} ${p.texto}${p.probabilidad != null ? ` (${p.probabilidad})` : ''} ← "${p.cita}"`);
    if (!fila.propuestas.length) console.log('     · (ninguna propuesta)');
  }

  // 5. Explicación
  console.log(`\n5) Explicación de una transición (cajero → cajero de banco) con EXPLICACION=${config.explicacion}…`);
  inicio = performance.now();
  const generada = await ia.explicarConIa({
    origen: { nombre_simple: 'Cajero de tienda' },
    destino: { nombre_simple: 'Cajero de banco o financiera' },
    compartidasTexto: [simples.get('K2764001-1'), simples.get('K2764001-2')],
    faltantesTexto: [simples.get('K2764001-3')],
  });
  resultado.explicacion = { segundos: seg(inicio), generada_por: generada?.generada_por ?? 'plantilla', texto: generada?.texto ?? null };
  console.log(`   ${resultado.explicacion.segundos} s · ${resultado.explicacion.generada_por}\n   "${resultado.explicacion.texto ?? '(sin IA: la app usa la plantilla)'}"`);

  // Resumen para la demo
  const peor = Math.max(...resultado.propuestas.map((p) => p.segundos));
  resultado.veredicto = {
    propuestas_menos_de_10s: peor < 10,
    explicacion_menos_de_10s: resultado.explicacion.segundos < 10,
    laya_separa_calibracion: sugeridoLaya != null,
  };
  console.log(`\nResumen: propuestas ${peor < 10 ? '✓' : '⚠'} (peor ${peor} s) · explicación ${resultado.explicacion.segundos < 10 ? '✓' : '⚠'} (${resultado.explicacion.segundos} s) · Laya ${sugeridoLaya != null ? '✓ separa' : '⚠ no separa'} los pares de calibración.`);
} catch (error) {
  resultado.error = error.message;
  console.error(`\n✗ ${error.message}`);
  process.exitCode = 1;
} finally {
  mkdirSync(ruta('../resultados/'), { recursive: true });
  const archivo = ruta(`../resultados/qvac-${resultado.fecha.slice(0, 16).replace(/[:T]/g, '-')}.json`);
  writeFileSync(archivo, JSON.stringify(resultado, null, 2));
  console.log(`\nResultados guardados en ${fileURLToPath(archivo)}`);
  await ia.cerrarIa().catch(() => {});
  process.exit(process.exitCode || 0);
}
