// Utilidades de texto sin IA: normalizar, comparar por palabras, validar citas y leer CSV.

const PALABRAS_VACIAS = new Set(`a al ante bajo con contra de del desde durante e el en entre hacia hasta la las le les lo los
mediante para por segun según sin sobre su sus tras un una unas unos y o u que se como más mas muy ya yo mi mis me
es son era fue ser estar esta este esto estos estas eso esa ese hago hace hacer cada todo toda todos todas otro otra
acuerdo establecidos establecidas establecido procedimientos politicas políticas normativa vigente correspondiente
empresa organizacion organización teniendo cuenta considerando segun requerimientos`.split(/\s+/));

export const normalizar = (texto) =>
  (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zñ0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Raíz muy simple: quita una terminación frecuente y se queda con 5 letras,
// para que "cobro", "cobros" y "cobrar" o "cuadro" y "cuadre" coincidan.
const TERMINACIONES = ['iendo', 'ando', 'amos', 'ados', 'idos', 'ado', 'ido', 'ar', 'er', 'ir', 'es', 'as', 'os', 'a', 'e', 'o', 's'];
const raiz = (palabra) => {
  const fin = TERMINACIONES.find((t) => palabra.endsWith(t) && palabra.length - t.length >= 3);
  return (fin ? palabra.slice(0, -fin.length) : palabra).slice(0, 5);
};

export const palabrasClave = (texto) =>
  new Set(
    normalizar(texto)
      .split(' ')
      .filter((p) => p.length > 2 && !PALABRAS_VACIAS.has(p))
      .map(raiz),
  );

// Coeficiente de Dice entre conjuntos de palabras clave (0 a 1).
export const similitudLexica = (a, b) => {
  const A = palabrasClave(a);
  const B = palabrasClave(b);
  if (A.size === 0 || B.size === 0) return 0;
  let comunes = 0;
  for (const p of A) if (B.has(p)) comunes += 1;
  return (2 * comunes) / (A.size + B.size);
};

export const coseno = (a, b) => {
  let punto = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    punto += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? punto / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
};

// Quita la coletilla genérica de los estándares del MTPE ("…, de acuerdo a los procedimientos de la empresa
// y normativa vigente"). Todos la comparten, y hace que cualquier par parezca similar.
const COLETILLA = /,?\s+(de acuerdo (a|con)|según|segun|teniendo en cuenta|considerando|cumpliendo con)\b.*$/i;
export const sinColetilla = (texto) => {
  const limpio = (texto || '').replace(COLETILLA, '').replace(/[.\s]+$/, '').trim();
  return limpio || (texto || '').trim();
};

// Quita el bloque de razonamiento de modelos como Qwen3 (<think>…</think>), aunque venga vacío.
export const sinRazonamiento = (texto) => (texto || '').replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<\/?think>/gi, '').trim();

// Una cita solo vale si aparece de verdad en lo que escribió la persona (evita citas inventadas por la IA).
export const citaEsTextual = (cita, descripcion) => {
  const c = normalizar(cita);
  return c.length >= 3 && normalizar(descripcion).includes(c);
};

// Parte la descripción en frases para usarlas como citas.
export const frases = (descripcion) =>
  (descripcion || '')
    .split(/[.,;\n]+|\sy\s/)
    .map((f) => f.trim())
    .filter((f) => f.length >= 3);

// Lector de CSV mínimo (comillas dobles, comas, saltos de línea dentro de comillas).
export const leerCsv = (contenido) => {
  const filas = [];
  let fila = [];
  let campo = '';
  let enComillas = false;
  const texto = contenido.replace(/^﻿/, '');
  for (let i = 0; i < texto.length; i += 1) {
    const ch = texto[i];
    if (enComillas) {
      if (ch === '"' && texto[i + 1] === '"') {
        campo += '"';
        i += 1;
      } else if (ch === '"') enComillas = false;
      else campo += ch;
    } else if (ch === '"') enComillas = true;
    else if (ch === ',') {
      fila.push(campo);
      campo = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && texto[i + 1] === '\n') i += 1;
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = '';
    } else campo += ch;
  }
  if (campo !== '' || fila.length) {
    fila.push(campo);
    filas.push(fila);
  }
  const [cabecera, ...resto] = filas.filter((f) => f.some((c) => c.trim() !== ''));
  if (!cabecera) return [];
  return resto
    .filter((f) => !f[0]?.trim().startsWith('#'))
    .map((f) => Object.fromEntries(cabecera.map((col, j) => [col.trim(), (f[j] ?? '').trim()])));
};
