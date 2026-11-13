import { useEffect, useState } from 'react';
import PantallaOcupacion from './pantallas/PantallaOcupacion.jsx';
import PantallaSabes from './pantallas/PantallaSabes.jsx';
import PantallaMapa from './pantallas/PantallaMapa.jsx';
import PantallaDetalle from './pantallas/PantallaDetalle.jsx';
import PantallaPasaporte from './pantallas/PantallaPasaporte.jsx';
import PantallaEmpresaRegistro from './pantallas/PantallaEmpresaRegistro.jsx';
import PantallaEmpresaPanel from './pantallas/PantallaEmpresaPanel.jsx';
import { guardarRegion, regionGuardada } from './region.js';

// Navegación simple con una pila de pantallas (sin librería de rutas).
// Rutas con URL propia: #/p/<token>, el pasaporte compartido; #/empresa, el registro de empresas;
// y #/empresa/<token>, el panel privado de la empresa (D-071).
const rutaDeLaUrl = () => {
  const { hash } = window.location;
  const pasaporte = hash.match(/^#\/p\/([\w-]+)$/)?.[1];
  if (pasaporte) return { tipo: 'pasaporte', token: pasaporte };
  const panel = hash.match(/^#\/empresa\/([\w-]+)$/)?.[1];
  if (panel) return { tipo: 'panel', token: panel };
  if (hash === '#/empresa') return { tipo: 'registro' };
  return null;
};

export default function App() {
  const [pila, setPila] = useState([{ pantalla: 'ocupacion' }]);
  const [ruta, setRuta] = useState(rutaDeLaUrl);
  // Región donde la persona busca trabajo: se usa para el perfil y para filtrar vacantes.
  const [region, setRegion] = useState(regionGuardada);
  const cambiarRegion = (r) => {
    setRegion(r);
    guardarRegion(r);
  };
  const actual = pila.at(-1);

  useEffect(() => {
    const alCambiar = () => setRuta(rutaDeLaUrl());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);

  // Llaves obligatorias: en Chrome reciente scrollTo devuelve una promesa, y React la tomaría como limpieza.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pila.length]);

  const ir = (pantalla, datos = {}) => setPila((p) => [...p, { pantalla, ...datos }]);
  const volver = () => setPila((p) => (p.length > 1 ? p.slice(0, -1) : p));
  const inicio = () => {
    if (ruta) window.location.hash = '';
    setPila([{ pantalla: 'ocupacion' }]);
  };

  let contenido;
  if (ruta?.tipo === 'pasaporte') contenido = <PantallaPasaporte token={ruta.token} />;
  else if (ruta?.tipo === 'registro') contenido = <PantallaEmpresaRegistro />;
  else if (ruta?.tipo === 'panel') contenido = <PantallaEmpresaPanel token={ruta.token} />;
  else if (actual.pantalla === 'ocupacion') contenido = <PantallaOcupacion ir={ir} region={region} cambiarRegion={cambiarRegion} />;
  else if (actual.pantalla === 'sabes') contenido = <PantallaSabes {...actual} ir={ir} region={region} />;
  else if (actual.pantalla === 'mapa') contenido = <PantallaMapa {...actual} ir={ir} />;
  else if (actual.pantalla === 'detalle') contenido = <PantallaDetalle {...actual} ir={ir} region={region} />;

  return (
    <div className="marco">
      <header className="encabezado">
        <div className="encabezado__barra">
          <span className="encabezado__marca">gob.pe</span>
          <span className="encabezado__aviso">Prototipo de concurso · no es un sitio oficial</span>
        </div>
        <div className="encabezado__titulo">
          {pila.length > 1 && !ruta ? (
            <button type="button" className="enlace-volver" onClick={volver} aria-label="Volver">← Volver</button>
          ) : null}
          <button type="button" className="nombre-app" onClick={inicio}>PURICHAMBA</button>
        </div>
      </header>
      <main className="contenido">{contenido}</main>
      <footer className="pie">
        Datos: Matriz de Estándares de Competencia Laboral del MTPE (04-09-2026). La IA propone; tú decides. Nada aquí es una certificación.
      </footer>
    </div>
  );
}
