// ¿Separa mejor comparar las acciones concretas (criterios de desempeño) que la tarea completa? (Plan, sección 10.3)
// Para cada par marcado en app/datos/pares_marcados.csv calcula la "cobertura de acciones": para cada criterio de la
// tarea B, el criterio más parecido de la tarea A; luego el promedio. También la versión de ida y vuelta.
// Mide qué tan bien separa los "sí" de los "no" (AUC) y el mejor umbral, igual que calibrar_umbral.py.
// Uso: IA_MODO=qvac node --env-file-if-exists=.env scripts/similitud_criterios.js
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ruta = (r) => fileURLToPath(new URL(r, import.meta.url));
const { config } = await import('../src/config.js');
const ia = await import('../src/ia.js');
const { coseno, leerCsv } = await import('../src/texto.js');

if (config.iaModo !== 'qvac') {
  console.error('Este script necesita IA_MODO=qvac.');
  process.exit(1);
}

const GENERICO = /(uniforme|indumentaria|presentación personal|imagen personal|equipos? de protección personal)/i;
const criterios = new Map(); // elemento -> lista de criterios
for (const f of leerCsv(readFileSync(ruta('../../../datos/procesados/mtpe_perfiles_detalle.csv'), 'utf8'))) {
  if (f.tipo !== 'criterio' || GENERICO.test(f.texto)) continue;
  const id = `${f.ecl_codigo}/E${f.elemento}`;
  if (!criterios.has(id)) criterios.set(id, []);
  criterios.get(id).push(f.texto);
}
const marcados = leerCsv(readFileSync(ruta('../../datos/pares_marcados.csv'), 'utf8')).filter((p) => p.es_la_misma !== 'no_se');
const usados = [...new Set(marcados.flatMap((p) => [p.codigo_a, p.codigo_b]))];

// Vectoriza por lotes (QVAC falla si una llamada pasa de 1024 tokens, issue #8).
const vectorizarEnLotes = async (textos, maxCaracteres = 1500) => {
  const salida = [];
  let lote = [];
  let largo = 0;
  for (const t of textos) {
    if (lote.length && largo + t.length > maxCaracteres) {
      salida.push(...(await ia.vectorizar(lote)));
      lote = [];
      largo = 0;
    }
    lote.push(t);
    largo += t.length;
  }
  if (lote.length) salida.push(...(await ia.vectorizar(lote)));
  return salida;
};
const textos = usados.flatMap((id) => criterios.get(id) || []);
console.log(`Vectorizando ${textos.length} criterios de ${usados.length} tareas…`);
const vectores = await vectorizarEnLotes(textos);
const vec = new Map();
let i = 0;
for (const id of usados) {
  vec.set(id, (criterios.get(id) || []).map(() => vectores[i++]));
}

// Cobertura: qué tanto las acciones de B están en las de A (promedio del mejor parecido de cada acción de B).
const cobertura = (a, b) => {
  const va = vec.get(a);
  const vb = vec.get(b);
  return vb.reduce((s, x) => s + Math.max(...va.map((y) => coseno(x, y))), 0) / vb.length;
};
const filas = marcados.map((p) => {
  const ab = cobertura(p.codigo_a, p.codigo_b);
  const ba = cobertura(p.codigo_b, p.codigo_a);
  return { par: p.par, marca: p.es_la_misma, cobertura: ab, ida_y_vuelta: (ab + ba) / 2, minima: Math.min(ab, ba) };
});

const evaluar = (campo) => {
  const si = filas.filter((f) => f.marca === 'si').map((f) => f[campo]);
  const no = filas.filter((f) => f.marca === 'no').map((f) => f[campo]);
  let auc = 0;
  for (const s of si) for (const n of no) auc += s > n ? 1 : s === n ? 0.5 : 0;
  auc /= si.length * no.length;
  let mejor = null;
  for (let u = 0.6; u <= 0.96; u += 0.005) {
    const vp = si.filter((x) => x >= u).length;
    const fp = no.filter((x) => x >= u).length;
    const pr = vp + fp ? vp / (vp + fp) : 0;
    const co = vp / si.length;
    const f1 = pr + co ? (2 * pr * co) / (pr + co) : 0;
    if (!mejor || f1 > mejor.f1) mejor = { u, vp, fp, pr, co, f1 };
  }
  console.log(`${campo}: "sí" de ${Math.min(...si).toFixed(3)} a ${Math.max(...si).toFixed(3)}, "no" hasta ${Math.max(...no).toFixed(3)}; AUC ${auc.toFixed(3)}; mejor umbral ${mejor.u.toFixed(3)}: F1 ${mejor.f1.toFixed(2)}, precisión ${mejor.pr.toFixed(2)}, ${mejor.vp} de ${si.length} "sí", ${mejor.fp} "no" aceptados`);
  return { campo, auc, ...mejor };
};
const resumen = ['cobertura', 'ida_y_vuelta', 'minima'].map(evaluar);
mkdirSync(ruta('../resultados'), { recursive: true });
writeFileSync(ruta('../resultados/similitud-criterios-2026-10-26.json'), JSON.stringify({ resumen, filas }, null, 1));
await ia.cerrarIa();
