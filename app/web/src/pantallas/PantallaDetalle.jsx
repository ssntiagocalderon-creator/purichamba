import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Estado from '../componentes/Estado.jsx';

const textoDe = (c) => c?.texto_simple || c?.descripcion;

// Aviso de una empresa registrada (D-071). La persona decide si postula y deja su contacto solo para esa empresa.
function Aviso({ aviso, perfilId }) {
  const [abierto, setAbierto] = useState(false);
  const [contacto, setContacto] = useState('');
  const [listo, setListo] = useState(aviso.ya_postulaste);
  const [error, setError] = useState(null);

  const postular = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.postular(aviso.id, perfilId, contacto);
      setListo(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <li className="vacante">
      <strong>{aviso.titulo}</strong>
      <span className="vacante__detalle">
        {aviso.empresa} · {aviso.region} · S/ {aviso.sueldo} al mes · en planilla y con seguro social
        {aviso.verificada ? '' : ' · RUC por verificar en SUNAT'}
      </span>
      {aviso.rotulo ? <span className="vacante__cobertura">{aviso.rotulo} de las que pide</span> : null}
      {aviso.url ? <a href={aviso.url} target="_blank" rel="noreferrer">Ver también en Empleos Perú</a> : null}
      {!perfilId ? null : listo ? (
        <p className="nota">Postulaste. La empresa ve tu pasaporte y el contacto que dejaste.</p>
      ) : abierto ? (
        <form className="formulario" onSubmit={postular}>
          <label className="etiqueta" htmlFor={`contacto-${aviso.id}`}>Tu teléfono o correo, solo para esta empresa</label>
          <input id={`contacto-${aviso.id}`} className="campo-texto" required minLength={6} maxLength={120}
            value={contacto} onChange={(e) => setContacto(e.target.value)} />
          {error ? <p className="estado estado--error" role="alert">{error}</p> : null}
          <button type="submit" className="boton-principal">Enviar mi postulación</button>
        </form>
      ) : (
        <button type="button" className="boton-secundario" onClick={() => setAbierto(true)}>Postular</button>
      )}
    </li>
  );
}

// Pantalla 4: detalle de una transición. Lo que ya tienes, lo que te falta y cómo conseguirlo,
// vacantes reales y compartir el pasaporte (D-041, D-050).
export default function PantallaDetalle({ ocupacion, perfilId, destino, region }) {
  const [detalle, setDetalle] = useState(null);
  const [vacantes, setVacantes] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [error, setError] = useState(null);
  const [explicacionIa, setExplicacionIa] = useState(null);
  const [explicando, setExplicando] = useState(false);
  const [enlace, setEnlace] = useState(null);

  useEffect(() => {
    const pedido = perfilId ? api.detallePerfil(perfilId, destino) : api.detalleOcupacion(ocupacion.id, destino);
    pedido.then(setDetalle).catch((e) => setError(e.message));
    api.vacantes(destino, region).then(setVacantes).catch(() => setVacantes([]));
    api.avisos(destino, perfilId).then(setAvisos).catch(() => setAvisos([]));
  }, [perfilId, ocupacion.id, destino, region]);

  const explicar = async () => {
    setExplicando(true);
    try {
      const r = await api.explicar(ocupacion.id, destino);
      setExplicacionIa(r);
    } catch (e) {
      setExplicacionIa({ explicacion: `No se pudo generar: ${e.message}`, generada_por: 'error' });
    } finally {
      setExplicando(false);
    }
  };

  const compartir = async () => {
    const { token } = await api.compartir(perfilId);
    setEnlace(`${window.location.origin}${window.location.pathname}#/p/${token}`);
  };

  if (!detalle) return <Estado cargando={!error} error={error} />;

  return (
    <section>
      <p className="paso">De {detalle.origen.nombre_simple} a</p>
      <h1>{detalle.destino.nombre_simple}</h1>
      <p className="rotulo-grande">{detalle.rotulo}</p>
      <p className="ayuda">{explicacionIa?.explicacion || detalle.explicacion}</p>
      {explicacionIa?.generada_por === 'qvac' ? <p className="nota">Explicación generada con IA local (QVAC) a partir de los perfiles oficiales.</p> : null}
      {explicacionIa?.generada_por === 'tether' ? <p className="nota">Explicación generada con IA de QVAC (servidor de Tether) a partir de los perfiles oficiales.</p> : null}
      {!explicacionIa ? (
        <button type="button" className="boton-secundario" onClick={explicar} disabled={explicando}>
          {explicando ? 'Preparando explicación…' : 'Explícamelo más simple'}
        </button>
      ) : null}

      <h2>Lo que ya tienes</h2>
      {detalle.compartidas.length ? (
        <ul className="lista-sustento">
          {detalle.compartidas.map((c) => (
            <li key={c.destino} className="sustento sustento--tiene">
              <p>{textoDe(c.competencia)}</p>
              <p className="sustento__fuente">
                Es lo mismo que haces: «{textoDe(c.la_tuya)}» ({c.origen})
              </p>
              <p className="sustento__fuente">
                MTPE · {c.destino}
                {{
                  validado: ' · conexión revisada por el equipo',
                  decision: ' · conexión propuesta por IA local (QVAC)',
                }[c.metodo] ?? ' · conexión calculada automáticamente'}
              </p>
            </li>
          ))}
        </ul>
      ) : <p className="nota">Todavía ninguna, según lo que confirmaste.</p>}

      <h2>Lo que te falta y cómo conseguirlo</h2>
      {detalle.faltantes.length ? (
        <ul className="lista-sustento">
          {detalle.faltantes.map((f) => (
            <li key={f.id} className="sustento sustento--falta">
              <p>{textoDe(f)}</p>
              <p className="sustento__fuente">MTPE · {f.id}</p>
              {f.cursos?.length ? (
                <ul className="cursos">
                  {f.cursos.map((c) => (
                    <li key={c.id}>
                      <a href={c.url} target="_blank" rel="noreferrer">{c.nombre}</a>
                      {' · '}{c.tipo === 'certificacion' ? 'Certificación' : 'Curso'}
                      {c.horas ? ` · ${c.horas} h` : ''}{c.gratuito ? ' · gratis' : ''}
                    </li>
                  ))}
                </ul>
              ) : <p className="nota">Pronto: cursos y centros de certificación verificados.</p>}
            </li>
          ))}
        </ul>
      ) : <p className="nota">Ya haces todas las tareas que pide.</p>}

      <h2>Vacantes para ti en {region}</h2>
      {vacantes.length && !vacantes.some((v) => v.en_region) ? (
        <p className="nota">No encontramos vacantes en {region} para este trabajo. Estas son de otras regiones.</p>
      ) : null}
      {vacantes.length ? (
        <ul className="lista-vacantes">
          {vacantes.map((v) => (
            <li key={v.id} className="vacante">
              <a href={v.url} target="_blank" rel="noreferrer">{v.titulo}</a>
              <span className="vacante__detalle">
                {[v.empresa, v.region, v.fecha_publicacion?.slice(0, 10)].filter(Boolean).join(' · ')}
                {v.es_simulada ? ' · simulada' : ' · Empleos Perú'}
              </span>
            </li>
          ))}
        </ul>
      ) : <p className="nota">Aún no hay vacantes cargadas para este trabajo.</p>}

      {avisos.length ? (
        <>
          <h2>Empleos de empresas registradas</h2>
          <ul className="lista-vacantes">
            {avisos.map((a) => <Aviso key={a.id} aviso={a} perfilId={perfilId} />)}
          </ul>
          {!perfilId ? <p className="nota">Para postular, empieza contando qué sabes hacer.</p> : null}
        </>
      ) : null}

      {perfilId ? (
        <>
          <h2>Tu pasaporte</h2>
          <p className="ayuda">Comparte tus competencias con un empleador. Solo verá las que confirmaste, sin tus datos personales.</p>
          {enlace ? (
            <p className="enlace-compartido"><a href={enlace}>{enlace}</a></p>
          ) : (
            <button type="button" className="boton-principal" onClick={compartir}>Crear enlace para compartir</button>
          )}
        </>
      ) : null}
    </section>
  );
}
