// Similitud de EmbeddingGemma entre los elementos de competencia de ocupaciones distintas (D-053, Plan sección 10.3).
// Sirve para elegir qué pares le damos al equipo para marcar a mano "es la misma" o "no es la misma".
// Calcula dos variantes: solo el texto del elemento, y el elemento con tres de sus criterios de desempeño.
// No necesita Postgres. Uso: IA_MODO=qvac npm run pares:similitud  (guarda el resultado en api/resultados/)
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

// Ocupación de cada estándar, según app/datos/ocupaciones.json (y por el código del perfil si el estándar es nuevo).
const { ocupaciones } = JSON.parse(readFileSync(ruta('../../datos/ocupaciones.json'), 'utf8'));
const porEcl = new Map();
const porPerfil = new Map();
for (const o of ocupaciones) {
  for (const ecl of o.ecl) {
    porEcl.set(ecl, o);
    porPerfil.set(ecl.split('-')[0], o);
  }
}

// Criterios que se repiten en casi todos los estándares y no dicen nada del oficio.
const GENERICO = /(uniforme|indumentaria|presentación personal|imagen personal|equipos? de protección personal)/i;

const filas = leerCsv(readFileSync(ruta('../../../datos/procesados/mtpe_perfiles_detalle.csv'), 'utf8'));
const elementos = new Map();
for (const f of filas) {
  const id = `${f.ecl_codigo}/E${f.elemento}`;
  if (!elementos.has(id)) {
    const o = porEcl.get(f.ecl_codigo) || porPerfil.get(f.perfil_codigo);
    elementos.set(id, { id, ecl: f.ecl_codigo, nivel: f.nivel, ocupacion: o?.id || f.perfil_codigo, ocupacion_nombre: o?.nombre_simple || f.perfil_codigo, texto: '', criterios: [] });
  }
  const e = elementos.get(id);
  if (f.tipo === 'elemento') e.texto = f.texto;
  if (f.tipo === 'criterio' && !GENERICO.test(f.texto)) e.criterios.push(f.texto);
}
const lista = [...elementos.values()];
const conEjemplos = (e) => `${e.texto} Por ejemplo: ${e.criterios.slice(0, 3).join(' ')}`;

// QVAC procesa cada llamada como un solo lote, y falla si el lote pasa de 1024 tokens (issue #8).
// Se vectoriza por partes, con un tope aproximado de caracteres por llamada.
const vectorizarEnLotes = async (textos, maxCaracteres = 2000) => {
  const vectores = [];
  let lote = [];
  let largo = 0;
  for (const t of textos) {
    if (lote.length && largo + t.length > maxCaracteres) {
      vectores.push(...(await ia.vectorizar(lote)));
      lote = [];
      largo = 0;
    }
    lote.push(t);
    largo += t.length;
  }
  if (lote.length) vectores.push(...(await ia.vectorizar(lote)));
  return vectores;
};

console.log(`Vectorizando ${lista.length} elementos (dos variantes)…`);
const inicio = performance.now();
const v1 = await vectorizarEnLotes(lista.map((e) => e.texto));
const v2 = await vectorizarEnLotes(lista.map(conEjemplos));
console.log(`  listo en ${((performance.now() - inicio) / 1000).toFixed(1)} s`);

const pares = [];
for (let i = 0; i < lista.length; i += 1) {
  for (let j = i + 1; j < lista.length; j += 1) {
    if (lista[i].ocupacion === lista[j].ocupacion) continue;
    pares.push({
      a: lista[i].id,
      b: lista[j].id,
      sim_elemento: Number(coseno(v1[i], v1[j]).toFixed(4)),
      sim_con_ejemplos: Number(coseno(v2[i], v2[j]).toFixed(4)),
    });
  }
}
pares.sort((x, y) => y.sim_elemento - x.sim_elemento);

const fecha = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
mkdirSync(ruta('../resultados'), { recursive: true });
const salida = ruta(`../resultados/pares-similitud-${fecha}.json`);
writeFileSync(salida, JSON.stringify({ fecha, modelo: config.modeloEmbeddings, elementos: lista, pares }, null, 1));
console.log(`${pares.length} pares de ocupaciones distintas. Guardado en ${salida}`);
await ia.cerrarIa();
