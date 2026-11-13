// Validación del RUC sin conexión (D-071): 11 dígitos, tipo de contribuyente conocido y dígito verificador de SUNAT
// (módulo 11 con pesos 5 4 3 2 7 6 5 4 3 2). Que esté "activo y habido" (D-068) solo lo dice el padrón de SUNAT:
// mientras no se consulte, la empresa queda como "verificación pendiente".
const PESOS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
// 10: persona natural con negocio · 15, 16, 17: otros casos de SUNAT · 20: persona jurídica.
const PREFIJOS = new Set(['10', '15', '16', '17', '20']);

/** Dígito verificador de los 10 primeros dígitos del RUC. */
export const digitoVerificador = (diez) => {
  const suma = PESOS.reduce((total, peso, i) => total + peso * Number(diez[i]), 0);
  return (11 - (suma % 11)) % 10;
};

/** Devuelve null si el RUC está bien escrito, o el motivo por el que no. */
export const errorDeRuc = (ruc) => {
  const limpio = String(ruc ?? '').trim();
  if (!/^\d{11}$/.test(limpio)) return 'El RUC tiene 11 dígitos, sin espacios ni guiones';
  if (!PREFIJOS.has(limpio.slice(0, 2))) return 'El RUC empieza con 10 o 20';
  if (digitoVerificador(limpio) !== Number(limpio[10])) return 'El RUC no es válido: revisa los dígitos';
  return null;
};
