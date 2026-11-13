// Mapa de transiciones: tu ocupación al centro y las demás alrededor.
// Más cerca del centro = más tareas que ya haces. Se puede tocar cada ocupación.
const ANCHO = 340;
const CENTRO = ANCHO / 2;
const RADIO_MIN = 62;
const RADIO_MAX = 140;
const MARGEN = 96; // espacio a los lados para que los nombres no se corten

const corto = (texto, max = 16) => (texto.length > max ? `${texto.slice(0, max - 1)}…` : texto);

export default function MapaRadial({ origen, transiciones, alElegir }) {
  const n = transiciones.length || 1;
  return (
    <svg
      className="mapa"
      viewBox={`${-MARGEN} 0 ${ANCHO + 2 * MARGEN} ${ANCHO}`}
      role="img"
      aria-label={`Mapa de trabajos parecidos a ${origen}`}
    >
      {[0.5, 1].map((f) => (
        <circle key={f} cx={CENTRO} cy={CENTRO} r={RADIO_MIN + (RADIO_MAX - RADIO_MIN) * f} className="mapa__anillo" />
      ))}
      {transiciones.map((t, i) => {
        const angulo = (2 * Math.PI * i) / n - Math.PI / 2;
        const r = RADIO_MAX - (RADIO_MAX - RADIO_MIN) * (t.porcentaje / 100);
        const x = CENTRO + r * Math.cos(angulo);
        const y = CENTRO + r * Math.sin(angulo);
        const cerca = t.porcentaje >= 50;
        const radioPunto = 9 + t.tiene * 2;
        // El nombre va hacia afuera del punto: a la izquierda o derecha según el lado del mapa.
        const cos = Math.cos(angulo);
        const lado = Math.abs(cos) < 0.3 ? 'middle' : cos > 0 ? 'start' : 'end';
        const tx = lado === 'middle' ? x : x + Math.sign(cos) * (radioPunto + 4);
        const ty = lado === 'middle' ? y + (Math.sin(angulo) < 0 ? -(radioPunto + 6) : radioPunto + 14) : y + 4;
        return (
          <g
            key={t.destino}
            className="mapa__nodo"
            role="button"
            tabIndex={0}
            onClick={() => alElegir(t)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && alElegir(t)}
          >
            <line x1={CENTRO} y1={CENTRO} x2={x} y2={y} className={`mapa__linea ${cerca ? 'mapa__linea--cerca' : ''}`} />
            <circle cx={x} cy={y} r={radioPunto} className={`mapa__punto ${cerca ? 'mapa__punto--cerca' : ''}`} />
            <text x={tx} y={ty} textAnchor={lado} className="mapa__texto">{corto(t.nombre_simple, 15)}</text>
            <text x={x} y={y + 4} textAnchor="middle" className="mapa__cifra">{t.porcentaje}%</text>
          </g>
        );
      })}
      <circle cx={CENTRO} cy={CENTRO} r={34} className="mapa__centro" />
      <text x={CENTRO} y={CENTRO + 4} textAnchor="middle" className="mapa__centro-texto">{corto(origen, 12)}</text>
    </svg>
  );
}
