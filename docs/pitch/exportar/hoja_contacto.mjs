// Junta imágenes PNG en una hoja de 2 columnas para revisarlas de un vistazo.
// Uso: node hoja_contacto.mjs <carpeta con png> <salida.png>
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
const [dir, salida] = process.argv.slice(2);
const imgs = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort()
  .map((f) => `<figure><img src="data:image/png;base64,${fs.readFileSync(path.join(dir, f)).toString('base64')}"><figcaption>${f}</figcaption></figure>`).join('');
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage();
await p.setViewport({ width: 1640, height: 1000 });
await p.setContent(`<html><body style="margin:0;background:#888;display:grid;grid-template-columns:800px 800px;gap:12px;padding:12px;font:14px sans-serif">${imgs}<style>figure{margin:0}img{width:800px;height:450px;object-fit:contain;background:#fff;display:block}figcaption{color:#fff}</style></body></html>`);
await p.screenshot({ path: salida, fullPage: true });
await b.close();
