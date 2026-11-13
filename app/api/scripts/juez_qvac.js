// ¿Puede QVAC (Qwen3 8B) decidir si dos tareas son la misma, como se marcó a mano en app/datos/pares_marcados.csv?
// Si acierta casi siempre, sirve para pre-marcar los pares de una ocupación nueva y que una persona solo revise
// (D-056, D-057). Se compara su respuesta con la marca de cada par ("no sé" no cuenta).
// Uso: IA_MODO=qvac node --env-file-if-exists=.env scripts/juez_qvac.js
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ruta = (r) => fileURLToPath(new URL(r, import.meta.url));
const { leerCsv } = await import('../src/texto.js');
const s = await import('@qvac/sdk');

const MODELO = process.env.QVAC_MODELO_LLM || 'QWEN3_8B_INST_Q4_K_M';
const GENERICO = /(uniforme|indumentaria|presentación personal|imagen personal|equipos? de protección personal)/i;
const tareas = new Map();
for (const f of leerCsv(readFileSync(ruta('../../../datos/procesados/mtpe_perfiles_detalle.csv'), 'utf8'))) {
  const id = `${f.ecl_codigo}/E${f.elemento}`;
  if (!tareas.has(id)) tareas.set(id, { texto: '', ejemplos: [] });
  if (f.tipo === 'elemento') tareas.get(id).texto = f.texto;
  if (f.tipo === 'criterio' && !GENERICO.test(f.texto)) tareas.get(id).ejemplos.push(f.texto);
}
const describir = (id) => `${tareas.get(id).texto}\nEjemplos: ${tareas.get(id).ejemplos.slice(0, 4).join(' | ')}`;
const pares = leerCsv(readFileSync(ruta('../../datos/pares_marcados.csv'), 'utf8')).filter((p) => p.es_la_misma !== 'no_se');

const sistema = [
  'Evalúas competencias laborales del Ministerio de Trabajo del Perú.',
  'Te doy dos tareas de perfiles ocupacionales oficiales, con ejemplos de lo que hace la persona en cada una.',
  'Responde "si" solo si son la misma tarea: la misma acción sobre lo mismo, aunque cambie el lugar',
  '(una oficina, una casa o un hotel; una tienda o un banco).',
  'Responde "no" si son tareas distintas, aunque sean del mismo oficio: otro paso del trabajo (por ejemplo, abrir la caja',
  'y cerrarla) u otro nivel (por ejemplo, hacer la tarea y supervisar a quienes la hacen). /no_think',
].join(' ');
const esquema = {
  type: 'json_schema',
  json_schema: {
    name: 'juicio',
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['es_la_misma', 'razon'],
      properties: { es_la_misma: { type: 'string', enum: ['si', 'no'] }, razon: { type: 'string' } },
    },
  },
};

console.log(`Cargando ${MODELO}…`);
const modelId = await s.loadModel({ modelSrc: s[MODELO], modelConfig: { ctx_size: 4096 } });
const resultados = [];
const inicio = performance.now();
for (const p of pares) {
  const run = s.completion({
    modelId,
    stream: false,
    responseFormat: esquema,
    history: [
      { role: 'system', content: sistema },
      { role: 'user', content: `Tarea A:\n${describir(p.codigo_a)}\n\nTarea B:\n${describir(p.codigo_b)}` },
    ],
  });
  const texto = (await run.final).contentText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  let juicio;
  try {
    juicio = JSON.parse(texto);
  } catch {
    juicio = { es_la_misma: 'error', razon: texto.slice(0, 200) };
  }
  resultados.push({ par: p.par, marca: p.es_la_misma, qvac: juicio.es_la_misma, razon: juicio.razon });
  process.stdout.write(juicio.es_la_misma === p.es_la_misma ? '.' : 'x');
}
const segundos = (performance.now() - inicio) / 1000;
const cuenta = (m, q) => resultados.filter((r) => r.marca === m && r.qvac === q).length;
const vp = cuenta('si', 'si');
const fn = cuenta('si', 'no');
const fp = cuenta('no', 'si');
const vn = cuenta('no', 'no');
const errores = resultados.filter((r) => r.qvac === 'error').length;
console.log(`\n${resultados.length} pares en ${segundos.toFixed(0)} s (${(segundos / resultados.length).toFixed(1)} s por par)`);
console.log(`Coincide en ${vp + vn} de ${resultados.length}. "Sí": ${vp} de ${vp + fn} encontrados. "No" aceptados como "sí": ${fp} de ${fp + vn}. Errores de formato: ${errores}`);
mkdirSync(ruta('../resultados'), { recursive: true });
writeFileSync(ruta(`../resultados/juez-qvac-${MODELO}-2026-10-26.json`), JSON.stringify({ modelo: MODELO, segundos, vp, fn, fp, vn, resultados }, null, 1));
// Sin esto el proceso no termina: el SDK queda abierto.
if (s.close) await s.close();
