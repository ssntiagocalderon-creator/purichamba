// Grabación de voz en el navegador. Parakeet espera PCM 16 kHz mono (AGENTS.md); el navegador graba en
// webm/ogg, así que aquí se decodifica y se convierte antes de mandarlo. Nada se guarda en el dispositivo.
const FRECUENCIA = 16000;
export const MAX_SEGUNDOS = 90;

export const vozSoportada = () => Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder && window.isSecureContext);

/** Empieza a grabar. Devuelve una función que detiene la grabación y resuelve con el audio grabado (Blob). */
export const empezarGrabacion = async () => {
  const flujo = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
  const grabadora = new MediaRecorder(flujo);
  const partes = [];
  grabadora.ondataavailable = (e) => { if (e.data.size) partes.push(e.data); };
  const terminado = new Promise((resolver) => {
    grabadora.onstop = () => {
      flujo.getTracks().forEach((t) => t.stop());
      resolver(new Blob(partes, { type: grabadora.mimeType }));
    };
  });
  grabadora.start();
  return () => {
    if (grabadora.state !== 'inactive') grabadora.stop();
    return terminado;
  };
};

/** Convierte el audio grabado a PCM s16le, 16 kHz, mono. */
export const aPcm16k = async (blob) => {
  const contexto = new AudioContext();
  const original = await contexto.decodeAudioData(await blob.arrayBuffer());
  await contexto.close();
  const muestras = Math.ceil(original.duration * FRECUENCIA);
  const fuera = new OfflineAudioContext(1, muestras, FRECUENCIA);
  const fuente = fuera.createBufferSource();
  fuente.buffer = original;
  fuente.connect(fuera.destination);
  fuente.start();
  const mono = (await fuera.startRendering()).getChannelData(0);
  const pcm = new Int16Array(mono.length);
  for (let i = 0; i < mono.length; i += 1) {
    const x = Math.max(-1, Math.min(1, mono[i]));
    pcm[i] = x < 0 ? x * 0x8000 : x * 0x7fff;
  }
  return pcm.buffer;
};
