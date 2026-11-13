import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { MAX_SEGUNDOS, aPcm16k, empezarGrabacion, vozSoportada } from '../voz.js';

// "Prefiero hablar": graba, transcribe con Parakeet (QVAC) y deja el texto en el campo para que la
// persona lo revise y lo corrija. Solo aparece si el navegador puede grabar y la API tiene la voz lista;
// si no, la pantalla funciona igual por texto.
export default function BotonVoz({ alTranscribir }) {
  const [disponible, setDisponible] = useState(false);
  const [fase, setFase] = useState('lista'); // lista | grabando | transcribiendo
  const [segundos, setSegundos] = useState(0);
  const [error, setError] = useState(null);
  const detener = useRef(null);

  useEffect(() => {
    if (!vozSoportada()) return;
    api.salud().then((s) => setDisponible(s.ia?.voz === 'listo')).catch(() => {});
  }, []);

  useEffect(() => {
    if (fase !== 'grabando') return undefined;
    const reloj = setInterval(() => setSegundos((n) => n + 1), 1000);
    return () => clearInterval(reloj);
  }, [fase]);

  const terminar = async () => {
    if (!detener.current) return;
    const parar = detener.current;
    detener.current = null;
    setFase('transcribiendo');
    try {
      const { texto } = await api.transcribir(await aPcm16k(await parar()));
      if (texto) alTranscribir(texto);
      else setError('No te escuchamos bien. Prueba otra vez, más cerca del micrófono.');
    } catch (e) {
      setError(e.message);
    } finally {
      setFase('lista');
    }
  };

  useEffect(() => {
    if (fase === 'grabando' && segundos >= MAX_SEGUNDOS) terminar();
  }, [fase, segundos]);

  const empezar = async () => {
    setError(null);
    try {
      detener.current = await empezarGrabacion();
      setSegundos(0);
      setFase('grabando');
    } catch {
      setError('No pudimos usar el micrófono. Revisa el permiso del navegador o escribe.');
    }
  };

  if (!disponible) return null;

  return (
    <div className="voz">
      {fase === 'grabando' ? (
        <button type="button" className="boton-voz boton-voz--grabando" onClick={terminar}>
          ■ Terminar ({segundos} s)
        </button>
      ) : (
        <button type="button" className="boton-voz" onClick={empezar} disabled={fase === 'transcribiendo'}>
          {fase === 'transcribiendo' ? 'Pasando tu voz a texto…' : '🎤 Prefiero hablar'}
        </button>
      )}
      <p className="nota">
        {fase === 'grabando'
          ? `Cuenta qué haces en un día normal. Máximo ${MAX_SEGUNDOS} segundos.`
          : 'Tu voz se convierte en texto aquí mismo y no se guarda. Después puedes corregir lo que salga.'}
      </p>
      {error ? <p className="estado estado--error" role="alert">{error}</p> : null}
    </div>
  );
}
