import { useState } from 'react';
import { api } from '../api.js';
import Estado from '../componentes/Estado.jsx';
import BotonVoz from '../componentes/BotonVoz.jsx';

const OPCIONES = [
  { valor: 'si', texto: 'Sí, lo hago' },
  { valor: 'a_veces', texto: 'A veces o con ayuda' },
  { valor: 'no', texto: 'No' },
  { valor: 'no_seguro', texto: 'No estoy seguro' },
];

// Pantalla 2: ¿Qué sabes hacer? La persona escribe algo breve; la IA propone y la persona confirma (D-004, D-012).
export default function PantallaSabes({ ocupacion, ir, region }) {
  const [descripcion, setDescripcion] = useState('');
  const [perfil, setPerfil] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [mas, setMas] = useState('');
  const [contandoMas, setContandoMas] = useState(false);
  const [avisoMas, setAvisoMas] = useState(null);

  const proponer = async () => {
    setCargando(true);
    setError(null);
    try {
      setPerfil(await api.crearPerfil(ocupacion.id, descripcion.trim(), region));
      setRespuestas({});
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  // "Cuéntanos más": la IA recibe todo lo que contó y marca lo que ahora reconoce; las respuestas se mantienen.
  const contarMas = async () => {
    setCargando(true);
    setError(null);
    setAvisoMas(null);
    try {
      const { competencias, reconocidas } = await api.contarMas(perfil.perfil_id, mas.trim());
      const citas = new Map(reconocidas.map((r) => [r.id, r.cita]));
      setPerfil((p) => ({
        ...p,
        competencias: [
          ...p.competencias.map((c) => (citas.has(c.id) ? { ...c, propuesta: true, cita: citas.get(c.id) } : c)),
          ...competencias,
        ],
      }));
      setMas('');
      setContandoMas(false);
      const total = competencias.length + reconocidas.length;
      setAvisoMas(total
        ? `Con lo que contaste reconocimos ${total} ${total === 1 ? 'tarea más' : 'tareas más'}: están marcadas arriba.`
        : 'No encontramos otras tareas en lo que contaste. Puedes intentarlo con otras palabras.');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  const verMapa = async () => {
    setCargando(true);
    setError(null);
    try {
      const lista = Object.entries(respuestas).map(([competencia_id, respuesta]) => ({ competencia_id, respuesta }));
      await api.guardarRespuestas(perfil.perfil_id, lista);
      ir('mapa', { perfilId: perfil.perfil_id, ocupacion });
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  const respondidas = Object.keys(respuestas).length;

  return (
    <section>
      <p className="paso">Paso 2 de 3 · {ocupacion.nombre_simple}</p>
      <h1>¿Qué sabes hacer?</h1>

      {!perfil ? (
        <>
          <p className="ayuda">Cuéntalo con tus palabras, en pocas líneas. Por ejemplo, qué haces en un día normal.</p>
          <label className="etiqueta" htmlFor="descripcion">Lo que haces en tu trabajo</label>
          <textarea
            id="descripcion"
            className="campo-texto"
            rows={5}
            maxLength={2000}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej.: atiendo a los clientes, cobro en efectivo y con tarjeta, y cuadro la caja al cerrar."
          />
          <BotonVoz alTranscribir={(texto) => setDescripcion((d) => (d.trim() ? `${d.trim()} ${texto}` : texto).slice(0, 2000))} />
          <button type="button" className="boton-principal" onClick={proponer} disabled={cargando}>
            {descripcion.trim() ? 'Ver qué reconocemos' : 'Seguir sin escribir'}
          </button>
          <button type="button" className="boton-secundario" onClick={() => ir('mapa', { ocupacion })}>
            Solo explorar a qué trabajos se parece
          </button>
        </>
      ) : (
        <>
          <p className="ayuda">
            Estas son las competencias oficiales de tu ocupación. Responde con sinceridad: nada está marcado de antemano.
          </p>
          <ul className="lista-competencias">
            {perfil.competencias.map((c) => (
              <li key={c.id} className={`competencia ${c.propuesta ? 'competencia--propuesta' : ''}`}>
                {c.propuesta ? (
                  <p className="competencia__cita">
                    Lo reconocimos en lo que escribiste: <q>{c.cita}</q>
                  </p>
                ) : null}
                <p className="competencia__texto">{c.texto_simple || c.descripcion}</p>
                <p className="competencia__codigo">
                  Estándar {c.id} · MTPE
                </p>
                <fieldset className="respuestas">
                  <legend className="sr-only">¿Lo haces?</legend>
                  {OPCIONES.map((o) => (
                    <label key={o.valor} className={`respuesta ${respuestas[c.id] === o.valor ? 'respuesta--elegida' : ''}`}>
                      <input
                        type="radio"
                        name={c.id}
                        value={o.valor}
                        checked={respuestas[c.id] === o.valor}
                        onChange={() => setRespuestas((r) => ({ ...r, [c.id]: o.valor }))}
                      />
                      {o.texto}
                    </label>
                  ))}
                </fieldset>
              </li>
            ))}
          </ul>
          {contandoMas ? (
            <div className="contar-mas">
              <label className="etiqueta" htmlFor="mas">¿Qué más haces?</label>
              <textarea
                id="mas"
                className="campo-texto"
                rows={4}
                maxLength={2000}
                value={mas}
                onChange={(e) => setMas(e.target.value)}
                placeholder="Ej.: también ordeno la mercadería y hago el inventario."
              />
              <BotonVoz alTranscribir={(texto) => setMas((d) => (d.trim() ? `${d.trim()} ${texto}` : texto).slice(0, 2000))} />
              <button type="button" className="boton-secundario" onClick={contarMas} disabled={cargando || !mas.trim()}>
                Buscar más preguntas
              </button>
            </div>
          ) : (
            <button type="button" className="boton-secundario" onClick={() => setContandoMas(true)}>
              ¿Sientes que faltó algo? Cuéntanos más
            </button>
          )}
          {avisoMas ? <p className="nota" aria-live="polite">{avisoMas}</p> : null}
          <button type="button" className="boton-principal" onClick={verMapa} disabled={cargando || respondidas === 0}>
            Ver mi mapa de trabajos
          </button>
          <p className="nota">Respondiste {respondidas} de {perfil.competencias.length}.</p>
        </>
      )}
      <Estado cargando={cargando} error={error} mensaje="Un momento…" />
    </section>
  );
}
