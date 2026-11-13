// ¿Puede QVAC traducir un aviso real de Empleos Perú a competencias del MTPE? (D-028, D-060)
// Lee el aviso con la búsqueda pública del portal, sin iniciar sesión, y le hace a Qwen3 el mismo pedido que
// proponerConQvac en src/ia.js, con las competencias de todas las ocupaciones de la app. Se prueba con dos tamaños de
// contexto: 4096, el que usa hoy la app, y 8192, porque un aviso es mucho más largo que lo que escribe una persona.
// Con 8192 se corre tres veces, para ver si el resultado se repite.
// Igual que en la app, se descartan las citas que no están en el aviso y los códigos fuera de la lista.
// Uso: node --env-file-if-exists=.env scripts/probar_aviso.js <jobId>
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const s = await import('@qvac/sdk');
const { leerCsv, citaEsTextual } = await import('../src/texto.js');

const MODELO = process.env.QVAC_MODELO_LLM || 'QWEN3_8B_INST_Q4_K_M';
const ruta = (relativa) => new URL(relativa, import.meta.url);
const matriz = JSON.parse(readFileSync(ruta('../../../datos/procesados/mtpe_estandares_competencia.json'), 'utf8'));
const { ocupaciones } = JSON.parse(readFileSync(ruta('../../datos/ocupaciones.json'), 'utf8'));
const simples = new Map(leerCsv(readFileSync(ruta('../../datos/textos_simples.csv'), 'utf8')).map((f) => [f.codigo_ecl, f.texto_simple]));
const ecl = new Map(matriz.registros.map((r) => [r.codigo_ecl, r]));
const competencias = ocupaciones.flatMap((o) => o.ecl.map((codigo) => ({
  id: codigo,
  descripcion: ecl.get(codigo).descripcion_ecl,
  texto_simple: simples.get(codigo) || null,
})));

const jobId = process.argv[2];
const respuesta = await fetch(`https://mtpe-candidatos.empleosperu.gob.pe/api/jobs/${jobId}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
const crudo = await respuesta.json();
const aviso = crudo.data ?? crudo;
const texto = aviso.jobDescription.replace(/<[^>]+>/g, '\n').replace(/\n\s*\n+/g, '\n').trim();
console.log(`${aviso.positionTitle} · ${aviso.companyName} · publicado el ${aviso.datePosted}, vence el ${aviso.expiration}`);

// El mismo pedido y el mismo esquema de src/ia.js (proponerConQvac).
const lista = competencias
  .map((c) => `- ${c.id}: ${c.descripcion}${c.texto_simple ? ` (en palabras simples: ${c.texto_simple})` : ''}`)
  .join('\n');
const sistema = [
  'Eres orientador laboral del Ministerio de Trabajo del Perú.',
  'Te doy lo que una persona cuenta de su trabajo y una lista de competencias oficiales.',
  'Devuelve SOLO las competencias de la lista que la persona describe claramente.',
  'Para cada una copia literalmente la frase de la persona que la respalda.',
  'Si ninguna calza, devuelve una lista vacía. No inventes. /no_think',
].join(' ');
const esquema = {
  type: 'json_schema',
  json_schema: {
    name: 'propuestas',
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['propuestas'],
      properties: {
        propuestas: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['codigo', 'cita'],
            properties: { codigo: { type: 'string' }, cita: { type: 'string' } },
          },
        },
      },
    },
  },
};
const validos = new Set(competencias.map((c) => c.id));

const corridas = [];
for (const contexto of [4096, 8192, 8192, 8192]) {
  const modelId = await s.loadModel({ modelSrc: s[MODELO], modelConfig: { ctx_size: contexto } });
  const inicio = performance.now();
  const run = s.completion({
    modelId,
    stream: false,
    responseFormat: esquema,
    history: [
      { role: 'system', content: sistema },
      { role: 'user', content: `Competencias:\n${lista}\n\nLo que cuenta la persona:\n${texto}` },
    ],
  });
  const salida = (await run.final).contentText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  const segundos = Number(((performance.now() - inicio) / 1000).toFixed(1));
  const propuestas = JSON.parse(salida).propuestas.map((p) => ({
    ...p,
    texto_simple: simples.get(p.codigo) || null,
    pasa: validos.has(p.codigo) && citaEsTextual(p.cita, texto),
  }));
  console.log(`\nContexto ${contexto}: ${propuestas.filter((p) => p.pasa).length} de ${propuestas.length} propuestas pasan el control de citas (${segundos} s)`);
  for (const p of propuestas) console.log(`  ${p.pasa ? '✓' : '✗'} ${p.codigo} (${p.texto_simple}): "${p.cita.slice(0, 110)}"`);
  corridas.push({ contexto, segundos, propuestas });
  await s.unloadModel({ modelId });
}

mkdirSync(ruta('../resultados'), { recursive: true });
writeFileSync(ruta(`../resultados/aviso-${jobId}-${MODELO}.json`), JSON.stringify({
  aviso: { id: jobId, titulo: aviso.positionTitle, empresa: aviso.companyName, publicado: aviso.datePosted, vence: aviso.expiration, texto },
  modelo: MODELO,
  corridas,
}, null, 1));
if (s.close) await s.close();
