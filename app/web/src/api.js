// Cliente de la API. Todas las rutas van bajo /api (en desarrollo, Vite las redirige al puerto 3000).
const pedir = async (ruta, opciones = {}) => {
  const respuesta = await fetch(`/api${ruta}`, {
    ...opciones,
    headers: opciones.body ? { 'content-type': 'application/json' } : undefined,
    body: opciones.body ? JSON.stringify(opciones.body) : undefined,
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.error || `Error ${respuesta.status}`);
  return datos;
};

// La voz va como audio crudo (PCM 16 kHz), no como JSON.
const transcribir = async (pcm) => {
  const respuesta = await fetch('/api/voz', { method: 'POST', headers: { 'content-type': 'application/octet-stream' }, body: pcm });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.error || `Error ${respuesta.status}`);
  return datos;
};

export const api = {
  salud: () => pedir('/salud'),
  transcribir,
  ocupacionesOrigen: () => pedir('/ocupaciones?origen=true'),
  crearPerfil: (ocupacionId, descripcion, region) =>
    pedir('/perfiles', { method: 'POST', body: { ocupacion_id: ocupacionId, descripcion, region } }),
  contarMas: (perfilId, descripcion) => pedir(`/perfiles/${perfilId}/mas`, { method: 'POST', body: { descripcion } }),
  guardarRespuestas: (perfilId, respuestas) =>
    pedir(`/perfiles/${perfilId}/respuestas`, { method: 'PUT', body: { respuestas } }),
  transicionesPerfil: (perfilId) => pedir(`/perfiles/${perfilId}/transiciones`),
  transicionesOcupacion: (origen) => pedir(`/transiciones?origen=${encodeURIComponent(origen)}`),
  detallePerfil: (perfilId, destino) => pedir(`/perfiles/${perfilId}/transiciones/${destino}`),
  detalleOcupacion: (origen, destino) => pedir(`/transiciones/${origen}/${destino}`),
  explicar: (origen, destino) => pedir(`/transiciones/${origen}/${destino}/explicar`, { method: 'POST' }),
  vacantes: (ocupacion, region) =>
    pedir(`/vacantes?ocupacion=${encodeURIComponent(ocupacion)}${region ? `&region=${encodeURIComponent(region)}` : ''}`),
  compartir: (perfilId) => pedir(`/perfiles/${perfilId}/compartir`, { method: 'POST' }),
  pasaporte: (token) => pedir(`/pasaporte/${encodeURIComponent(token)}`),
  // Lado de la empresa (D-071)
  ocupaciones: () => pedir('/ocupaciones'),
  ocupacion: (id) => pedir(`/ocupaciones/${encodeURIComponent(id)}`),
  registrarEmpresa: (datos) => pedir('/empresas', { method: 'POST', body: datos }),
  panelEmpresa: (token) => pedir(`/empresas/${encodeURIComponent(token)}`),
  publicarAviso: (token, aviso) => pedir(`/empresas/${encodeURIComponent(token)}/avisos`, { method: 'POST', body: aviso }),
  postulantes: (token, avisoId) => pedir(`/empresas/${encodeURIComponent(token)}/avisos/${avisoId}/postulantes`),
  avisos: (ocupacion, perfilId) =>
    pedir(`/avisos?ocupacion=${encodeURIComponent(ocupacion)}${perfilId ? `&perfil=${perfilId}` : ''}`),
  postular: (avisoId, perfilId, contacto) =>
    pedir(`/avisos/${avisoId}/postular`, { method: 'POST', body: { perfil_id: perfilId, contacto } }),
};
