# Pitch de 3 minutos: Demo Day (30-10-2026)

> Borrador del 28-10 para la mentoría pre-pitch. Lo arman Santiago y Claude: el mockup y el PPT son entregables [C-50]. La versión final se decide en equipo (D-002).

**Diapositivas:** <https://claude.ai/artifact/4uqrt4Nyep8PRFMD6pzGdJ>. Es una página privada de Santiago en claude.ai: para que otra persona la abra, hay que compartirla desde el menú Compartir. Para editar en grupo, Santiago sube la copia en PPTX al Drive del equipo y la abre con Presentaciones de Google, que tiene las fuentes Rubik y Public Sans. La copia en PDF sirve para mandarla por WhatsApp.

**Fuente de las diapositivas:** `diapositivas/` (una por archivo, en el orden de `deck.json`). El PPTX y el PDF se rehacen con `exportar/`: `npm install` y luego `npm run exportar`, con Google Chrome instalado. El PPTX copia la posición, el tamaño y el color de cada elemento tal como los dibuja Chrome, y lleva el guion en las notas.

**Preguntas del jurado:** las respuestas a la mentoría pre-pitch (28-10), con una frase para decir y su fuente, están en [respuestas_jurado.html](respuestas_jurado.html). También están en claude.ai (<https://claude.ai/artifact/Se3FUAHTy9vft8B86dLnU7>, página privada de Santiago) y en PDF.

## Guion (unos 2 min 20 s; el límite es de 3 minutos)

| Diapositiva | Tiempo | Qué decir | Fuentes |
|---|---|---|---|
| 1. Portada | 0:00–0:05 | Hola, somos [equipo]. Les presentamos PURICHAMBA. | — |
| 2. Un caso real | 0:05–0:25 | Esta semana entrevistamos a un señor que fue carpintero. Lo dejó porque necesitaba mucha fuerza. Hoy lava autos hace tres años y ya arregla las máquinas del local. Ahora paga una academia que encontró en TikTok para aprender a reparar motos. No conocía los cursos gratis del Ministerio. Y su carpintería tiene un estándar oficial del MTPE; el lavado y las motos, todavía no. | C-81 |
| 3. El problema | 0:25–0:45 | En el Perú, 7 de cada 10 trabajadores tienen un empleo informal. Muchos aprendieron su oficio trabajando, pero entre 2010 y 2023 solo unas 59 mil personas certificaron sus competencias. Y uno de cada cinco trabajadores está muy expuesto a la automatización. | C-01, C-11, C-59 |
| 4. La solución | 0:45–1:05 | PURICHAMBA hace lo que pide el Ministerio: partir de una ocupación y mostrar a qué otras puedes pasar, con lo que ya sabes y lo que te falta. Son tres pasos. Lo cuentas, con tu voz o escribiendo. La IA lo traduce a las tareas oficiales del MTPE y tú confirmas lo que es cierto. Y ves tu mapa: a qué trabajos puedes pasar y cómo conseguir lo que te falta. | C-12, C-49 |
| 5. Así se ve | 1:05–1:30 | Así se ve con un cajero de tienda. Cuenta lo que hace, confirma, y la app le muestra que ya hace 2 de las 3 tareas del cajero de banco: abrir la caja, cuadrarla y cerrarla. Le falta lo propio del banco, como depósitos, préstamos y cambio de moneda. Y le dice cómo conseguirlo: un curso gratis de 6 horas del Ministerio, dónde certificarse en Lima y vacantes reales de cajero en cajas municipales, en Empleos Perú. Y en nuestras pruebas con QVAC, si además cuenta que pinta paredes, lo reconoce como pintura en edificaciones. | C-71, C-72, C-73, C-78 |
| 6. Cómo funciona | 1:30–1:50 | ¿Cómo funciona? Con QVAC, la IA local de Tether, en nuestra máquina: ahí se procesan la voz y el texto de la persona. Al servidor de Tether solo van textos oficiales, para redactar la explicación. Usamos solo datos públicos y oficiales: los perfiles del MTPE, los cursos gratis de CAPACÍTA-T, el listado de centros de certificación y las vacantes de Empleos Perú. Y la IA solo propone: lo que cuenta es lo que la persona confirma. | C-73, C-88 |
| 7. Viabilidad | 1:50–2:10 | Hoy muestra caminos revisados por el equipo desde dos de las cinco ocupaciones del reto, caja y limpieza, con cursos gratis, centros de Lima y vacantes reales, y corre en una laptop. Con el Ministerio puede crecer: sus especialistas validan qué tareas son iguales, se suman más perfiles y regiones, se entra con ID gob.pe y las empresas publican sus empleos. | C-49 (D-040), C-78 |
| 8. Cierre | 2:10–2:20 | Lo que sabes hacer ya vale. Con PURICHAMBA, ahora tiene nombre oficial y un camino para llegar más lejos. Gracias. | — |

Las cifras con código `[C-xx]` están en la tabla de control del Plan de Proyecto. El cajero de la diapositiva 5 es un ejemplo y se dice así; sus datos son reales (perfiles G2347002 y K2764001 del MTPE, CAPACÍTA-T, listado oficial de centros y Empleos Perú).

## Antes de presentarlo

- Poner los nombres del equipo en la portada y el cierre.
- Pedir el permiso del lavador para contar su historia (D-062). Si no lo da, la diapositiva 2 pasa al ejemplo de la cajera, rotulado como ejemplo.
- Vacantes (29-10, D-069): en Lima no hay vigentes para el 30-10, así que la diapositiva 5 y el mockup muestran las 2 de cajas municipales fuera de Lima. El 30-10 a las 7:30 se vuelve a consultar.
- R35: el Foro Económico Mundial pone a los cajeros de banco entre los empleos que más rápido caen [C-57], y el ejemplo de la demo lleva de cajero de tienda a cajero de banco. Por eso el guion ya no cita al Foro sobre cajeros. Santiago decide si se cambia el ejemplo.
- La app ya cuenta solo lo que la persona confirma y los pares que revisó el equipo, por tareas (D-070), como dice la diapositiva 6.
- Ensayar con cronómetro el 29-10.

## Demo en vivo (unos 40 s, en la Mac de Santiago)

1. Antes de empezar: `colima start`, `docker start pasaporte-db` y, en `app/api`, `npm run demo`. Los modelos cargan en unos 10 s. Se abre <http://127.0.0.1:3000>; la clave está en `app/api/.env`.
2. Elegir **Cajero de tienda**.
3. Escribir, o decir con «Prefiero hablar»: «Atiendo a los clientes, cobro en caja con efectivo y tarjeta, y al cerrar cuadro la caja con mi supervisora».
4. **Ver qué reconocemos.** En unos 5 s, Qwen3 8B de QVAC propone «Cobrar y registrar las ventas en caja» y «Controlar que la caja cuadre», cada una con la frase de la que sale [C-97]. Responder **Sí** a esas dos y **No** a la tercera.
5. **Ver mi mapa de trabajos**: «Cajero de banco o financiera · Tienes 2 de 3 tareas» [C-96].
6. Tocarlo: lo que ya hace, lo que le falta (las operaciones de caja del banco), el curso gratis, dónde certificarse y las vacantes.

Si algo falla, el mockup en el celular (<https://pasaporte-de-oficio.vercel.app/mockup/>) muestra el mismo recorrido. En vivo no se escribe melamina ni pintura: la app todavía no reconoce oficios de otras ocupaciones (D-063); eso se muestra con el mockup.
