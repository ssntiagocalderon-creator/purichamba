import { useState } from 'react';
import { REGIONES, detectarRegion } from '../region.js';

// "¿En qué región buscas trabajo?": lista de los 25 departamentos y botón para detectarla con el GPS.
// La persona siempre puede cambiarla (por ejemplo, vive en Callao pero busca en Lima).
export default function SelectorRegion({ region, alCambiar }) {
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState(null);

  const usarUbicacion = async () => {
    setBuscando(true);
    setAviso(null);
    try {
      const detectada = await detectarRegion();
      alCambiar(detectada);
      setAviso({ tipo: 'ok', texto: `Estás en ${detectada}. No guardamos tu ubicación, solo la región.` });
    } catch (error) {
      setAviso({ tipo: 'error', texto: error.message });
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="region">
      <label className="region__etiqueta" htmlFor="region">¿En qué región buscas trabajo?</label>
      <div className="region__fila">
        <select id="region" className="region__lista" value={region} onChange={(e) => { setAviso(null); alCambiar(e.target.value); }}>
          {REGIONES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button type="button" className="boton-secundario region__gps" onClick={usarUbicacion} disabled={buscando}>
          {buscando ? 'Buscando…' : '📍 Usar mi ubicación'}
        </button>
      </div>
      {aviso ? <p className={aviso.tipo === 'ok' ? 'nota' : 'nota nota--error'} role="status">{aviso.texto}</p> : null}
    </div>
  );
}
