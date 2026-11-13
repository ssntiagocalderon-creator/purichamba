// Exporta el deck del pitch (las diapositivas HTML del artifact) a PNG, PDF y un PPTX editable.
// Uso: node exportar.mjs <carpeta project del deck> <carpeta de salida>
// El PPTX copia la posición, el tamaño y el color de cada elemento tal como los dibuja Chrome.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import pptxgen from 'pptxgenjs';

const [RAIZ, SALIDA] = process.argv.slice(2);
if (!RAIZ || !SALIDA) throw new Error('Uso: node exportar.mjs <project> <salida>');
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const deck = JSON.parse(fs.readFileSync(path.join(RAIZ, 'deck.json'), 'utf8'));
fs.mkdirSync(path.join(SALIDA, 'png'), { recursive: true });

// Íconos del deck → Phosphor (regular), el mismo estilo de línea.
const ICONOS = {
  Chat: 'chat-circle-dots', CheckCircle: 'check-circle', Chart: 'chart-line-up', GraduationCap: 'graduation-cap',
  Verified: 'seal-check', Search: 'magnifying-glass', Lock: 'lock', Database: 'database', Users: 'users',
};
const svgDe = (nombre) => {
  if (!ICONOS[nombre]) throw new Error(`Ícono sin equivalente: ${nombre}`);
  return fs.readFileSync(path.join(AQUI, 'node_modules/@phosphor-icons/core/assets/regular', `${ICONOS[nombre]}.svg`), 'utf8');
};
const conIconos = (html) => html.replace(/<x-icon name="([^"]+)" style="([^"]*)"><\/x-icon>/g,
  (_, nombre, estilo) => `<span class="xi" data-icono="${nombre}" style="${estilo}">${svgDe(nombre)}</span>`);

const fuentes = Object.values(deck.faces).map((f) => `<link rel="stylesheet" href="${f.href}">`).join('');
const BASE = `<style>
*{box-sizing:border-box;margin:0;padding:0}
@page{size:1920px 1080px;margin:0}
body{background:#fff}
section{width:1920px;height:1080px;position:relative;overflow:hidden;break-after:page}
ul{padding-left:1.1em}
aside{display:none}
.xi{display:block;flex:none}
.xi svg{width:100%;height:100%;display:block;fill:currentColor}
</style>`;
const pagina = (cuerpo) => `<!doctype html><html><head><meta charset="utf-8">${fuentes}${BASE}</head><body>${cuerpo}</body></html>`;

// Corre dentro de Chrome: lee cada caja, ícono y texto ya dibujados.
function extraer() {
  const sec = document.querySelector('section');
  const cs = (el) => getComputedStyle(el);
  const hex = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(',').map((v) => parseFloat(v));
    if (a === 0) return null;
    return [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
  };
  const caja = (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
  const datos = { id: sec.id, fondo: hex(cs(sec).backgroundColor), cajas: [], iconos: [], textos: [], notas: (sec.querySelector('aside')?.textContent || '').trim() };
  for (const el of sec.querySelectorAll('div')) {
    const s = cs(el);
    const grosor = parseFloat(s.borderTopWidth) || 0;
    const fondo = hex(s.backgroundColor);
    const borde = grosor ? hex(s.borderTopColor) : null;
    if (fondo || borde) datos.cajas.push({ ...caja(el), fondo, borde, grosor, radio: parseFloat(s.borderTopLeftRadius) || 0 });
  }
  for (const el of sec.querySelectorAll('.xi')) datos.iconos.push({ ...caja(el), nombre: el.dataset.icono, color: hex(cs(el).color) });
  for (const el of sec.querySelectorAll('h1,h2,h3,p,ul')) {
    if (el.closest('aside')) continue;
    const s = cs(el);
    const tam = parseFloat(s.fontSize);
    datos.textos.push({
      ...caja(el), etiqueta: el.tagName, absoluto: s.position === 'absolute',
      texto: el.tagName === 'UL' ? null : el.innerText.trim(),
      items: el.tagName === 'UL' ? [...el.querySelectorAll('li')].map((li) => li.innerText.trim()) : null,
      familia: s.fontFamily.split(',')[0].replace(/["']/g, '').trim(), tam, peso: parseInt(s.fontWeight, 10),
      color: hex(s.color), interlinea: parseFloat(s.lineHeight) || tam * 1.2, espaciado: parseFloat(s.letterSpacing) || 0,
    });
  }
  return datos;
}

// Avisos de diseño: texto que se sale del lienzo o que choca con el pie de página.
const revisar = (d) => {
  const avisos = [];
  const pie = d.textos.find((t) => t.absoluto);
  for (const t of d.textos) {
    if (t.x + t.w > 1920 - 120 || t.y + t.h > 1080 - 40) avisos.push(`se sale del margen: «${(t.texto || t.items.join(' / ')).slice(0, 50)}»`);
    if (pie && !t.absoluto && t.y + t.h > pie.y - 16) avisos.push(`choca con el pie: «${(t.texto || t.items.join(' / ')).slice(0, 50)}»`);
  }
  for (const c of d.cajas) if (pie && c.y + c.h > pie.y - 16) avisos.push('una tarjeta choca con el pie');
  return avisos;
};

const navegador = await puppeteer.launch({
  executablePath: CHROME, headless: true, userDataDir: path.join(SALIDA, '.perfil-chrome'),
  args: ['--no-first-run', '--no-default-browser-check'],
});
const hoja = await navegador.newPage();
await hoja.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
const lienzo = await navegador.newPage();
await lienzo.setViewport({ width: 300, height: 300, deviceScaleFactor: 4 });
const iconoPng = async (nombre, color, lado) => {
  await lienzo.setContent(`<html><body style="margin:0;background:transparent"><div id="i" style="width:${lado}px;height:${lado}px;color:#${color}">${svgDe(nombre)}</div><style>svg{width:100%;height:100%;display:block;fill:currentColor}</style></body></html>`);
  return (await lienzo.$('#i')).screenshot({ omitBackground: true, encoding: 'base64' });
};

const diapositivas = [];
let n = 0;
for (const id of deck.order) {
  n += 1;
  const html = conIconos(fs.readFileSync(path.join(RAIZ, 'slides', `${id}.html`), 'utf8'));
  await hoja.setContent(pagina(html), { waitUntil: 'load', timeout: 90000 });
  await hoja.evaluate(async () => { await Promise.all(['700 72px Rubik', '400 30px "Public Sans"', '700 30px "Public Sans"'].map((f) => document.fonts.load(f))); await document.fonts.ready; });
  const fuentesOk = await hoja.evaluate(() => document.fonts.check('700 72px Rubik') && document.fonts.check('400 30px "Public Sans"'));
  await hoja.screenshot({ path: path.join(SALIDA, 'png', `${String(n).padStart(2, '0')}-${id}.png`) });
  const datos = await hoja.evaluate(extraer);
  for (const i of datos.iconos) i.png = await iconoPng(i.nombre, i.color, Math.round(i.w));
  diapositivas.push(datos);
  const avisos = revisar(datos);
  console.log(`${n}. ${id}: ${datos.textos.length} textos, ${datos.cajas.length} cajas, ${datos.iconos.length} íconos${fuentesOk ? '' : ' · ⚠ fuentes sin cargar'}${avisos.length ? ` · ⚠ ${avisos.join(' · ')}` : ''}`);
}

// PDF: todas las diapositivas, una por página, tal como se ven.
const todas = deck.order.map((id) => conIconos(fs.readFileSync(path.join(RAIZ, 'slides', `${id}.html`), 'utf8'))).join('\n');
await hoja.setContent(pagina(todas), { waitUntil: 'load', timeout: 90000 });
await hoja.evaluate(async () => { await Promise.all(['700 72px Rubik', '400 30px "Public Sans"', '700 30px "Public Sans"'].map((f) => document.fonts.load(f))); await document.fonts.ready; });
await hoja.pdf({ path: path.join(SALIDA, `${deck.title}.pdf`), width: '1920px', height: '1080px', printBackground: true });

// Hoja de contacto para revisar las 8 de un vistazo.
const miniaturas = fs.readdirSync(path.join(SALIDA, 'png')).filter((f) => f.endsWith('.png')).sort()
  .map((f) => `<img src="data:image/png;base64,${fs.readFileSync(path.join(SALIDA, 'png', f)).toString('base64')}">`).join('');
await hoja.setViewport({ width: 1640, height: 1900, deviceScaleFactor: 1 });
await hoja.setContent(`<html><body style="margin:0;background:#888;display:grid;grid-template-columns:800px 800px;gap:16px;padding:12px">${miniaturas}<style>img{width:800px;height:450px;display:block}</style></body></html>`);
await hoja.screenshot({ path: path.join(SALIDA, 'contacto.png'), fullPage: true });
await navegador.close();

// PPTX editable: 13,33 × 7,5 pulgadas = 1920 × 1080 px, así que 1 px = 1/144 pulgada = 0,5 pt.
const pulg = (px) => px / 144;
const secciones = Object.fromEntries(Object.values(deck.sections).map((s) => [s.start, s.description]));
const armarPptx = async (lista, archivo) => {
  const pres = new pptxgen(); // uno nuevo por archivo
  pres.layout = 'LAYOUT_WIDE';
  pres.title = deck.title;
  let seccion = null;
  for (const d of lista) {
    if (secciones[d.id]) { seccion = secciones[d.id]; pres.addSection({ title: seccion }); }
    const s = pres.addSlide(seccion ? { sectionTitle: seccion } : undefined);
    s.background = { color: d.fondo };
    for (const c of d.cajas) {
      s.addShape(c.radio ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, {
        x: pulg(c.x), y: pulg(c.y), w: pulg(c.w), h: pulg(c.h),
        fill: c.fondo ? { color: c.fondo } : { color: d.fondo, transparency: 100 },
        ...(c.borde ? { line: { color: c.borde, width: c.grosor * 0.75 } } : {}),
        ...(c.radio ? { rectRadius: pulg(c.radio) } : {}),
      });
    }
    for (const i of d.iconos) s.addImage({ data: `image/png;base64,${i.png}`, x: pulg(i.x), y: pulg(i.y), w: pulg(i.w), h: pulg(i.h) });
    for (const t of d.textos) {
      const opciones = {
        x: pulg(t.x), y: pulg(t.y), w: pulg(t.w + 6), h: pulg(t.h),
        fontFace: t.familia, fontSize: t.tam / 2, bold: t.peso >= 600, color: t.color,
        margin: 0, valign: 'top', align: 'left', lineSpacing: t.interlinea / 2, paraSpaceAfter: 0, fit: 'none',
        ...(t.espaciado ? { charSpacing: t.espaciado / 2 } : {}),
      };
      if (t.items) {
        s.addText(t.items.map((texto, k) => ({ text: texto, options: { bullet: { indent: t.tam * 1.1 / 2 }, breakLine: k < t.items.length - 1 } })), opciones);
      } else {
        s.addText(t.texto, opciones);
      }
    }
    if (d.notas) s.addNotes(d.notas);
  }
  await pres.writeFile({ fileName: archivo });
};
await armarPptx(diapositivas, path.join(SALIDA, `${deck.title}.pptx`));
// Para revisar cómo lo abre otro programa: una presentación de una sola diapositiva por cada una.
if (process.env.POR_DIAPOSITIVA) {
  fs.mkdirSync(path.join(SALIDA, 'una'), { recursive: true });
  for (const [k, d] of diapositivas.entries()) await armarPptx([d], path.join(SALIDA, 'una', `${String(k + 1).padStart(2, '0')}-${d.id}.pptx`));
}
console.log(`Listo: ${path.join(SALIDA, `${deck.title}.pptx`)} y .pdf`);
