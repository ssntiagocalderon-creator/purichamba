import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Estado from '../componentes/Estado.jsx';
import SelectorRegion from '../componentes/SelectorRegion.jsx';

// Pantalla 1: ¿A qué te dedicas? Las cinco ocupaciones del MTPE (D-040).
export default function PantallaOcupacion({ ir, region, cambiarRegion }) {
  const [ocupaciones, setOcupaciones] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.ocupacionesOrigen().then(setOcupaciones).catch((e) => setError(e.message));
  }, []);

  return (
    <section>
      <p className="paso">Paso 1 de 3</p>
      <h1>¿A qué te dedicas?</h1>
      <p className="ayuda">Elige el trabajo que haces hoy o que hiciste más tiempo.</p>
      <SelectorRegion region={region} alCambiar={cambiarRegion} />
      <Estado cargando={!ocupaciones && !error} error={error} />
      <ul className="lista-opciones">
        {ocupaciones?.map((o) => (
          <li key={o.id}>
            <button
              type="button"
              className="opcion"
              disabled={o.sin_perfil}
              onClick={() => ir('sabes', { ocupacion: o })}
            >
              <span className="opcion__nombre">{o.nombre_simple}</span>
              <span className="opcion__detalle">
                {o.sin_perfil ? 'Pronto: aún no tiene perfil oficial' : `Perfil oficial: ${o.nombre}`}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="nota enlace-empresa">¿Eres una empresa formal? <a href="#/empresa">Publica un empleo</a></p>
    </section>
  );
}
