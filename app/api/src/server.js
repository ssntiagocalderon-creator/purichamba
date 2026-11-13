import { crearApp } from './app.js';
import { config } from './config.js';
import { pool } from './db.js';
import { cerrarIa, estadoIa, precargarModelos } from './ia.js';

// Con IA_MODO=qvac, los modelos se cargan ANTES de abrir el puerto: la app no acepta personas
// hasta que la IA está lista. La primera vez descarga los modelos (varios GB).
if (config.iaModo === 'qvac') {
  const { necesarios, modelos } = estadoIa();
  console.log(`Cargando modelos de QVAC (${necesarios.map((t) => modelos[t]).join(', ')} y voz)…`);
  try {
    await precargarModelos();
    const { segundos, pasos } = estadoIa();
    console.log(`✓ Modelos listos: ${Object.entries(segundos).map(([t, s]) => `${t} ${s} s`).join(', ')}`);
    console.log(`  Propuestas: ${pasos.propuestas} · equivalencias: ${pasos.equivalencias} · explicación: ${pasos.explicacion}`);
  } catch (error) {
    console.error(`✗ No se pudieron cargar los modelos de QVAC: ${error.message}`);
    console.error('  Revisa la conexión para la primera descarga, o usa IA_MODO=sin_ia.');
    await cerrarIa().catch(() => {});
    process.exit(1);
  }
}

const app = await crearApp();

const cerrar = async () => {
  await app.close();
  await cerrarIa();
  await pool.end();
  process.exit(0);
};
process.on('SIGINT', cerrar);
process.on('SIGTERM', cerrar);

await app.listen({ port: config.puerto, host: config.host });
app.log.info(`IA en modo: ${config.iaModo}`);
if (!config.accesoClave) {
  app.log.warn('ACCESO_CLAVE vacía: la app no pide clave. No la expongas con ngrok sin definirla en .env');
}
