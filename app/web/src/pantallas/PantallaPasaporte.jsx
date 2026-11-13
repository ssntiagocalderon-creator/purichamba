import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Estado from '../componentes/Estado.jsx';

// Pasaporte compartido: lo que ve el empleador. Solo lectura, sin datos personales (D-014, D-050).
export default function PantallaPasaporte({ token }) {
  const [pasaporte, setPasaporte] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.pasaporte(token).then(setPasaporte).catch((e) => setError(e.message));
  }, [token]);

  if (!pasaporte) return <Estado cargando={!error} error={error} />;

  return (
    <section>
      <p className="paso">PURICHAMBA · Tu pasaporte</p>
      <h1>{pasaporte.ocupacion}</h1>
      <p className="aviso-respaldo">Nivel de respaldo: declarado. {pasaporte.aviso}</p>
      <h2>Competencias identificadas</h2>
      {pasaporte.competencias.length ? (
        <ul className="lista-sustento">
          {pasaporte.competencias.map((c) => (
            <li key={c.id} className="sustento sustento--tiene">
              <p>{c.texto_simple || c.descripcion}</p>
              <p className="sustento__fuente">
                Estándar {c.id} · <a href={c.fuente_url} target="_blank" rel="noreferrer">{c.fuente}</a>
              </p>
            </li>
          ))}
        </ul>
      ) : <p className="nota">La persona aún no confirmó competencias.</p>}
    </section>
  );
}
