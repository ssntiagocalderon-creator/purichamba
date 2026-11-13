import { useState } from 'react';
import { api } from '../api.js';

// Registro de una empresa formal con su RUC (D-068, D-071). Sin contraseñas: al registrarse recibe el enlace
// privado de su panel, como el pasaporte compartible.
export default function PantallaEmpresaRegistro() {
  const [datos, setDatos] = useState({ ruc: '', razon_social: '', region: '', correo: '' });
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));

  const registrar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const { token } = await api.registrarEmpresa(datos);
      window.location.hash = `#/empresa/${token}`;
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <section>
      <p className="paso">Para empresas</p>
      <h1>Publica un empleo formal</h1>
      <p className="ayuda">
        Publicas lo que necesitas y cada persona ve cuántas de esas tareas ya hace. Ella decide si postula y te comparte su pasaporte.
      </p>
      <form className="formulario" onSubmit={registrar}>
        <label className="etiqueta" htmlFor="ruc">RUC</label>
        <input id="ruc" className="campo-texto" inputMode="numeric" maxLength={11} required value={datos.ruc} onChange={cambiar('ruc')} />
        <label className="etiqueta" htmlFor="razon">Razón social</label>
        <input id="razon" className="campo-texto" required maxLength={200} value={datos.razon_social} onChange={cambiar('razon_social')} />
        <label className="etiqueta" htmlFor="region">Región</label>
        <input id="region" className="campo-texto" required maxLength={80} placeholder="Lima" value={datos.region} onChange={cambiar('region')} />
        <label className="etiqueta" htmlFor="correo">Correo para avisarte de postulaciones</label>
        <input id="correo" className="campo-texto" type="email" required maxLength={200} value={datos.correo} onChange={cambiar('correo')} />
        {error ? <p className="estado estado--error" role="alert">{error}</p> : null}
        <button type="submit" className="boton-principal" disabled={enviando}>
          {enviando ? 'Registrando…' : 'Registrar mi empresa'}
        </button>
      </form>
      <p className="nota">
        Revisamos que el RUC esté bien escrito. La consulta en SUNAT de que esté activo y habido queda pendiente en este prototipo.
      </p>
    </section>
  );
}
