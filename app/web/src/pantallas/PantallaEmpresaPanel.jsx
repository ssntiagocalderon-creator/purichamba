import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Estado from '../componentes/Estado.jsx';

const AVISO_VACIO = { ocupacion_id: '', titulo: '', region: '', sueldo: '', url: '', competencias: [], en_planilla: false, seguro_social: false };

// Postulantes de un aviso: su "X de Y", lo que le falta, el contacto que dejó y su pasaporte.
function Postulantes({ token, aviso }) {
  const [lista, setLista] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.postulantes(token, aviso.id).then(setLista).catch((e) => setError(e.message));
  }, [token, aviso.id]);

  if (!lista) return <Estado cargando={!error} error={error} />;
  if (lista.length === 0) return <p className="nota">Aún nadie postuló.</p>;
  return (
    <ul className="lista-sustento">
      {lista.map((p) => (
        <li key={p.id} className="sustento sustento--tiene">
          <p><strong>Hace {p.tiene} de {p.total} tareas que pides · {p.porcentaje} %</strong> · hoy trabaja como {p.ocupacion}</p>
          <p>Contacto: {p.contacto}</p>
          {p.faltantes.length ? <p className="sustento__fuente">Le falta: {p.faltantes.join(' · ')}</p> : null}
          {p.pasaporte ? <p className="sustento__fuente"><a href={`#/p/${p.pasaporte}`}>Ver su pasaporte</a></p> : null}
        </li>
      ))}
    </ul>
  );
}

// Panel privado de la empresa (D-071): sus avisos, publicar uno nuevo y ver postulantes.
export default function PantallaEmpresaPanel({ token }) {
  const [panel, setPanel] = useState(null);
  const [error, setError] = useState(null);
  const [ocupaciones, setOcupaciones] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [aviso, setAviso] = useState(AVISO_VACIO);
  const [errorAviso, setErrorAviso] = useState(null);
  const [publicando, setPublicando] = useState(false);
  const [abierto, setAbierto] = useState(null);

  const cargar = () => api.panelEmpresa(token).then(setPanel).catch((e) => setError(e.message));

  useEffect(() => {
    cargar();
    api.ocupaciones().then((os) => setOcupaciones(os.filter((o) => !o.sin_perfil))).catch(() => setOcupaciones([]));
  }, [token]);

  useEffect(() => {
    if (!aviso.ocupacion_id) return setCompetencias([]);
    api.ocupacion(aviso.ocupacion_id).then((o) => setCompetencias(o.competencias)).catch(() => setCompetencias([]));
  }, [aviso.ocupacion_id]);

  const cambiar = (campo) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setAviso((a) => ({ ...a, [campo]: valor, ...(campo === 'ocupacion_id' ? { competencias: [] } : {}) }));
  };
  const marcar = (id) => setAviso((a) => ({
    ...a,
    competencias: a.competencias.includes(id) ? a.competencias.filter((c) => c !== id) : [...a.competencias, id],
  }));

  const publicar = async (e) => {
    e.preventDefault();
    setPublicando(true);
    setErrorAviso(null);
    try {
      await api.publicarAviso(token, { ...aviso, sueldo: Number(aviso.sueldo), url: aviso.url || null });
      setAviso(AVISO_VACIO);
      await cargar();
    } catch (err) {
      setErrorAviso(err.message);
    } finally {
      setPublicando(false);
    }
  };

  if (!panel) return <Estado cargando={!error} error={error} />;
  const { empresa, avisos } = panel;

  return (
    <section>
      <p className="paso">Panel de la empresa</p>
      <h1>{empresa.razon_social}</h1>
      <p className="ayuda">RUC {empresa.ruc} · {empresa.region}</p>
      <p className="aviso-respaldo">
        {empresa.verificada ? 'RUC verificado en SUNAT.' : 'Verificación en SUNAT pendiente: el RUC está bien escrito, falta confirmar que esté activo y habido.'}
        {' '}Guarda el enlace de esta página: es tu acceso al panel.
      </p>

      <h2>Tus avisos</h2>
      {avisos.length ? (
        <ul className="lista-vacantes">
          {avisos.map((a) => (
            <li key={a.id} className="vacante">
              <strong>{a.titulo}</strong>
              <span className="vacante__detalle">
                {a.ocupacion} · {a.region} · S/ {a.sueldo} al mes · pide {a.competencias.length} {a.competencias.length === 1 ? 'competencia' : 'competencias'}
              </span>
              <button type="button" className="boton-secundario" onClick={() => setAbierto(abierto === a.id ? null : a.id)}>
                {abierto === a.id ? 'Ocultar postulantes' : `Ver postulantes (${a.postulaciones})`}
              </button>
              {abierto === a.id ? <Postulantes token={token} aviso={a} /> : null}
            </li>
          ))}
        </ul>
      ) : <p className="nota">Todavía no publicaste avisos.</p>}

      <h2>Publicar un aviso</h2>
      <form className="formulario" onSubmit={publicar}>
        <label className="etiqueta" htmlFor="ocupacion">Ocupación (catálogo del MTPE)</label>
        <select id="ocupacion" className="campo-texto" required value={aviso.ocupacion_id} onChange={cambiar('ocupacion_id')}>
          <option value="">Elige una</option>
          {ocupaciones.map((o) => <option key={o.id} value={o.id}>{o.nombre_simple}</option>)}
        </select>

        {competencias.length ? (
          <fieldset className="grupo">
            <legend className="etiqueta">¿Qué competencias pides?</legend>
            {competencias.map((c) => (
              <label key={c.id} className="casilla">
                <input type="checkbox" checked={aviso.competencias.includes(c.id)} onChange={() => marcar(c.id)} />
                <span>{c.texto_simple || c.descripcion} <span className="sustento__fuente">MTPE · {c.id}</span></span>
              </label>
            ))}
          </fieldset>
        ) : null}

        <label className="etiqueta" htmlFor="titulo">Título del aviso</label>
        <input id="titulo" className="campo-texto" required maxLength={150} value={aviso.titulo} onChange={cambiar('titulo')} />
        <label className="etiqueta" htmlFor="region-aviso">Región</label>
        <input id="region-aviso" className="campo-texto" required maxLength={80} value={aviso.region} onChange={cambiar('region')} />
        <label className="etiqueta" htmlFor="sueldo">Sueldo mensual (S/)</label>
        <input id="sueldo" className="campo-texto" type="number" min={1} step={1} required value={aviso.sueldo} onChange={cambiar('sueldo')} />
        <label className="etiqueta" htmlFor="url">Enlace en Empleos Perú (opcional)</label>
        <input id="url" className="campo-texto" type="url" placeholder="https://" value={aviso.url} onChange={cambiar('url')} />

        <fieldset className="grupo">
          <legend className="etiqueta">Empleo formal (obligatorio)</legend>
          <label className="casilla">
            <input type="checkbox" checked={aviso.en_planilla} onChange={cambiar('en_planilla')} />
            <span>Con contrato en planilla</span>
          </label>
          <label className="casilla">
            <input type="checkbox" checked={aviso.seguro_social} onChange={cambiar('seguro_social')} />
            <span>Con seguro social (EsSalud)</span>
          </label>
        </fieldset>

        {errorAviso ? <p className="estado estado--error" role="alert">{errorAviso}</p> : null}
        <button
          type="submit"
          className="boton-principal"
          disabled={publicando || !aviso.competencias.length || !aviso.en_planilla || !aviso.seguro_social}
        >
          {publicando ? 'Publicando…' : 'Publicar aviso'}
        </button>
      </form>
    </section>
  );
}
