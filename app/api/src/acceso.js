// Acceso con clave para la demo expuesta por ngrok (opción 01 de Tether: el endpoint necesita autenticación, Plan C-67).
// Usa autenticación básica de HTTP: el navegador pide usuario y clave una vez. El usuario puede ser cualquiera.
// Si ACCESO_CLAVE está vacía, no se pide nada (desarrollo en la propia máquina).
import { timingSafeEqual } from 'node:crypto';

const iguales = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/** Devuelve true si la cabecera Authorization trae la clave correcta. */
export const claveValida = (cabecera, clave) => {
  if (!clave) return true;
  const [tipo, valor] = (cabecera || '').split(' ');
  if (tipo !== 'Basic' || !valor) return false;
  const decodificado = Buffer.from(valor, 'base64').toString('utf8');
  const separador = decodificado.indexOf(':');
  if (separador < 0) return false;
  return iguales(decodificado.slice(separador + 1), clave);
};

export const protegerConClave = (app, clave) => {
  if (!clave) return;
  app.addHook('onRequest', async (req, reply) => {
    if (claveValida(req.headers.authorization, clave)) return;
    reply
      .code(401)
      .header('WWW-Authenticate', 'Basic realm="PURICHAMBA (prototipo)", charset="UTF-8"')
      .send({ error: 'Se necesita la clave de la demo' });
  });
};
