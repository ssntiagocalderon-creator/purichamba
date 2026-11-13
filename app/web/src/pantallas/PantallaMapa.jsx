import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Estado from '../componentes/Estado.jsx';
import MapaRadial from '../componentes/MapaRadial.jsx';

// Pantalla 3: tu mapa de transiciones.
// Con perfil: cuenta lo que la persona confirmó. Sin perfil: compara ocupación con ocupación.
export default function PantallaMapa({ ocupacion, perfilId, ir }) {
  const [transiciones, setTransiciones] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const pedido = perfilId ? api.transicionesPerfil(perfilId) : api.transicionesOcupacion(ocupacion.id);
    pedido.then(setTransiciones).catch((e) => setError(e.message));
  }, [perfilId, ocupacion.id]);

  const elegir = (t) => ir('detalle', { ocupacion, perfilId, destino: t.destino });

  return (
    <section>
      <p className="paso">Paso 3 de 3</p>
      <h1>¿A qué otros trabajos puedes pasar?</h1>
      <p className="ayuda">
        {perfilId
          ? 'Según lo que confirmaste. Más cerca del centro, más tareas que ya haces.'
          : `Comparando el perfil oficial de ${ocupacion.nombre_simple} con otros perfiles del MTPE.`}
      </p>
      <Estado cargando={!transiciones && !error} error={error} />
      {transiciones?.length ? (
        <>
          <MapaRadial origen={ocupacion.nombre_simple} transiciones={transiciones} alElegir={elegir} />
          <ul className="lista-transiciones">
            {transiciones.map((t) => (
              <li key={t.destino}>
                <button type="button" className="transicion" onClick={() => elegir(t)}>
                  <span className="transicion__nombre">{t.nombre_simple}</span>
                  <span className="barra" aria-hidden="true">
                    <span className="barra__relleno" style={{ width: `${t.porcentaje}%` }} />
                  </span>
                  <span className="transicion__rotulo">{t.rotulo}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="nota">El porcentaje dice cuántas de las tareas que pide ese trabajo ya haces. No es una probabilidad de conseguirlo.</p>
        </>
      ) : null}
      {transiciones && !transiciones.length ? <p className="estado">Aún no hay transiciones calculadas.</p> : null}
    </section>
  );
}
