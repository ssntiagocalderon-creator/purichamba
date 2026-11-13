export default function Estado({ cargando, error, mensaje = 'Cargando…' }) {
  if (error) return <p className="estado estado--error" role="alert">No pudimos cargar esto: {error}</p>;
  if (cargando) return <p className="estado" aria-live="polite">{mensaje}</p>;
  return null;
}
