// Fórmula fija y verificable de transiciones (Plan, secciones 5.3 y 10.3). Sin IA.
//
// cobertura(origen, destino) = competencias del destino que tienen al menos una equivalente
//                              entre las competencias de origen / total de competencias del destino.
// En el prototipo todas pesan igual, para que "3 de 4" y "75 %" coincidan (D-052).

// Decide si un par es equivalente: lo validado por el equipo manda; si no, el umbral.
// `similitud` es la probabilidad de Laya (metodo 'decision') o el coseno/léxico (metodo 'similitud').
export const decidirPar = ({ similitud, validacion, umbral, metodo = 'similitud' }) => {
  if (validacion === true || validacion === false) {
    return { metodo: 'validado', es_equivalente: validacion };
  }
  return { metodo, es_equivalente: similitud >= umbral };
};

/**
 * @param {string[]} origen  códigos de competencia que la persona u ocupación ya tiene
 * @param {string[]} destino códigos de competencia que pide la ocupación destino
 * @param {Map<string, {similitud:number, metodo:string, es_equivalente:boolean}>} pares clave `${a}|${b}`
 */
export const calcularCobertura = (origen, destino, pares) => {
  const compartidas = [];
  const faltantes = [];
  for (const d of destino) {
    let mejor = null;
    for (const o of origen) {
      if (o === d) {
        mejor = { destino: d, origen: o, similitud: 1, metodo: 'misma' };
        break;
      }
      const par = pares.get(`${o}|${d}`) || pares.get(`${d}|${o}`);
      if (par?.es_equivalente && (!mejor || par.similitud > mejor.similitud)) {
        mejor = { destino: d, origen: o, similitud: par.similitud, metodo: par.metodo };
      }
    }
    if (mejor) compartidas.push(mejor);
    else faltantes.push(d);
  }
  const total = destino.length;
  const tiene = compartidas.length;
  return {
    tiene,
    total,
    porcentaje: total ? Math.round((tiene / total) * 100) : 0,
    compartidas,
    faltantes,
  };
};

// Texto que ve la persona: nunca "compatibilidad" ni "probabilidad" (D-052). Se cuentan tareas (D-058).
export const rotulo = ({ tiene, total, porcentaje }) =>
  `Tienes ${tiene} de ${total} tareas · ${porcentaje} %`;
