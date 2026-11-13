// Región de la persona: la elige ella o se detecta con el GPS del celular.
// Privacidad: las coordenadas se convierten a departamento AQUÍ, en el navegador, y se descartan.
// Al servidor solo llega el nombre de la región (bases del reto: "demanda en su territorio").

export const REGIONES = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco',
  'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima', 'Loreto',
  'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali',
];
export const REGION_POR_DEFECTO = 'Lima';

// Punto dentro de un anillo (algoritmo de rayos). Coordenadas [longitud, latitud], como en GeoJSON.
const dentroDeAnillo = ([x, y], anillo) => {
  let dentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i, i += 1) {
    const [xi, yi] = anillo[i];
    const [xj, yj] = anillo[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
};

// Un polígono es [exterior, ...huecos].
const dentroDePoligono = (punto, [exterior, ...huecos]) =>
  dentroDeAnillo(punto, exterior) && !huecos.some((h) => dentroDeAnillo(punto, h));

/**
 * Departamento que contiene el punto, o null si está fuera del Perú.
 * @param {{departamentos: {region: string, poligonos: number[][][][]}[]}} limites
 */
export const regionDePunto = (latitud, longitud, limites) => {
  const punto = [longitud, latitud];
  return limites.departamentos.find((d) => d.poligonos.some((p) => dentroDePoligono(punto, p)))?.region ?? null;
};

/** Pide la ubicación al navegador (con permiso de la persona) y devuelve la región. */
export const detectarRegion = async () => {
  if (!('geolocation' in navigator)) throw new Error('Este celular no permite usar la ubicación.');
  if (!window.isSecureContext) throw new Error('La ubicación solo funciona con https. Elige tu región en la lista.');
  const posicion = await new Promise((resolver, rechazar) => {
    navigator.geolocation.getCurrentPosition(resolver, rechazar, {
      enableHighAccuracy: false, // basta con saber el departamento
      timeout: 10000,
      maximumAge: 10 * 60 * 1000,
    });
  }).catch((error) => {
    const mensajes = {
      1: 'No diste permiso para usar tu ubicación. Elige tu región en la lista.',
      2: 'No pudimos saber dónde estás. Elige tu región en la lista.',
      3: 'La ubicación tardó demasiado. Elige tu región en la lista.',
    };
    throw new Error(mensajes[error.code] || 'No pudimos usar tu ubicación.');
  });
  // Los límites se cargan solo cuando la persona usa el GPS (unos 120 KB).
  const { default: limites } = await import('./datos/departamentos.json');
  const region = regionDePunto(posicion.coords.latitude, posicion.coords.longitude, limites);
  if (!region) throw new Error('Parece que no estás en el Perú. Elige tu región en la lista.');
  return region;
};

// Se recuerda en este celular para no preguntar en cada pantalla. Si el navegador no deja guardar, no pasa nada.
const CLAVE = 'pasaporte.region';
export const regionGuardada = () => {
  try {
    const r = localStorage.getItem(CLAVE);
    return REGIONES.includes(r) ? r : REGION_POR_DEFECTO;
  } catch {
    return REGION_POR_DEFECTO;
  }
};
export const guardarRegion = (region) => {
  try {
    localStorage.setItem(CLAVE, region);
  } catch { /* sin almacenamiento: se usa solo en esta visita */ }
};
