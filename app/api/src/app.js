import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import estaticos from '@fastify/static';
import { config } from './config.js';
import { consulta } from './db.js';
import { protegerConClave } from './acceso.js';
import { estadoIa } from './ia.js';
import rutasOcupaciones from './rutas/ocupaciones.js';
import rutasTransiciones from './rutas/transiciones.js';
import rutasPerfiles from './rutas/perfiles.js';
import rutasVacantes from './rutas/vacantes.js';
import rutasVoz from './rutas/voz.js';
import rutasEmpresas from './rutas/empresas.js';

const WEB_DIST = fileURLToPath(new URL('../../web/dist', import.meta.url));

export const crearApp = async ({ logger = true } = {}) => {
  const app = Fastify({ logger, bodyLimit: 64 * 1024 });
  protegerConClave(app, config.accesoClave);
  await app.register(cors, { origin: true });

  // Todas las rutas de datos bajo /api
  await app.register(async (api) => {
    api.get('/salud', async () => {
      await consulta('SELECT 1');
      return { ok: true, ia: estadoIa() };
    });
    await api.register(rutasOcupaciones);
    await api.register(rutasTransiciones);
    await api.register(rutasPerfiles);
    await api.register(rutasVacantes);
    await api.register(rutasVoz);
    await api.register(rutasEmpresas);
  }, { prefix: '/api' });

  // Si existe el build de la web, la API también la sirve (un solo proceso para la demo).
  if (existsSync(WEB_DIST)) {
    await app.register(estaticos, { root: WEB_DIST });
    app.setNotFoundHandler((req, reply) => (
      req.url.startsWith('/api') ? reply.code(404).send({ error: 'No encontrado' }) : reply.sendFile('index.html')
    ));
  }

  app.setErrorHandler((error, req, reply) => {
    req.log.error(error);
    reply.code(error.statusCode || 500).send({ error: error.statusCode ? error.message : 'Error interno' });
  });

  return app;
};
