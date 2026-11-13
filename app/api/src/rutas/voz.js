import { transcribir, vozDisponible } from '../ia.js';

// Voz a texto (D-003, Parakeet en QVAC). La web manda PCM s16le, 16 kHz, mono, ya convertido en el navegador.
// El audio no se guarda: se transcribe en memoria y se descarta (Plan R9). Devuelve el texto para que la
// persona lo revise y lo corrija antes de seguir: la IA no propone nada todavía en este paso.
const MAX_SEGUNDOS = 120;
const BYTES_POR_SEGUNDO = 16000 * 2;

export default async function rutasVoz(app) {
  app.addContentTypeParser('application/octet-stream', { parseAs: 'buffer', bodyLimit: MAX_SEGUNDOS * BYTES_POR_SEGUNDO }, (req, cuerpo, listo) => listo(null, cuerpo));

  app.post('/voz', async (req, reply) => {
    if (!vozDisponible()) return reply.code(503).send({ error: 'La voz no está disponible. Puedes escribir.' });
    const pcm = req.body;
    if (!Buffer.isBuffer(pcm) || pcm.length < BYTES_POR_SEGUNDO / 2 || pcm.length % 2 !== 0) {
      return reply.code(400).send({ error: 'El audio es muy corto o no tiene el formato esperado' });
    }
    const inicio = performance.now();
    const texto = await transcribir(pcm);
    return {
      texto,
      segundos_audio: Number((pcm.length / BYTES_POR_SEGUNDO).toFixed(1)),
      segundos_transcripcion: Number(((performance.now() - inicio) / 1000).toFixed(2)),
    };
  });
}
