# Cumplimiento y estrategia para la Innovathon

Fecha: 20-10-2026. **Evaluación del repositorio auditado, no calificación oficial ni garantía de admisión.** Bases primarias: [PDF ULima, edición Tether](https://www.ulima.edu.pe/sites/default/files/centers/files/1_bases_innovathon_ulima_x_tether_0.pdf), ocho páginas. Descarga leída mediante PDFKit; SHA-256 `85f9abed630f10ca9f4fc75e2952557a43ef265b01f662cde6dac7cd81255c94`. El lector web no abrió el PDF; la descarga directa sí permitió verificarlo. [Página del evento](https://events.ulima.edu.pe/innovathon-ulima-tether) consultada como fuente secundaria de navegación, no para resolver discrepancias internas.

## Lo que exigen las bases y su estado actual

La página 2 define el enfoque del reto. La siguiente tabla parafrasea los requisitos; los estados se basan en los archivos, no en intenciones del Plan.

| Elemento oficial | Evidencia del proyecto | Estado al corte | Evidencia necesaria para demostrarlo |
|---|---|---|---|
| Reconocer capacidades de experiencia informal/práctica | Relatos ficticios y extracción de actividades QVAC | Parcial, experimental | Relato nuevo, corrección y propuestas sustentadas sin atribución automática |
| Orientar hacia ocupaciones afines | Cálculo de cercanía en `competencias.mjs`:122–146 | Parcial e insuficiente | Requisitos comparables y explicación revisada; no solo conteo |
| Relacionar con demanda territorial | PDF nacional, datos regionales pendientes en Plan original:203–207 | No demostrado | Fuente regional con alcance/fecha, sin confundir proyección y vacante |
| Primer paso viable según condiciones personales | Descrito en Plan original:145 | Ausente en producto | Oferta real y filtro de disponibilidad, recursos e interés |
| Presentación creíble ante empleador, aspecto valorado | Evidencias y QR propuestos, sin implementación | Ausente en producto | Estado/procedencia de afirmaciones; no atribuir certificación a la IA |
| Módulo para portal de empleo de gob.pe con backend QVAC | SDK real en spike; arquitectura dibujada | Parcial en tecnología, sin integración | Backend del prototipo con inferencia observable y contrato de integración propuesto |
| Mantener datos en entorno usuario/MTPE | Intención en Plan y ejecución local del spike | Propiedad del experimento, no control de producto probado | Mapa de datos, ausencia de APIs de inferencia externas, permisos y controles de persistencia |

No presentar como obligación oficial: blockchain, pagos USDT, app nativa, inferencia en teléfono, firma estatal de un QR, SSO gubernamental, una API específica o una nota mínima de IA. Tampoco se verificó que deba entregarse un producto de producción. Pruebas, accesibilidad, seguridad y evidencias estructuradas son propuestas de calidad y requisitos del encargo de auditoría; no inventar una cláusula del concurso para justificarlas.

## Condiciones de participación y dudas verificadas

Las bases identifican a ULima/Tether y el reto del MTPE (p. 1, 8); programan trabajo del 23 al 30 de octubre y pitch de tres minutos (p. 2, 3, 5). La asignación de equipos ocurre en el Open Day (p. 5). La auditoría no verificó matrícula, admisión por correo ni asistencia individual.

Hay inconsistencias documentales que requieren aclaración del organizador: el cronograma de p. 3 cierra inscripción el 20, mientras p. 4 menciona el 21; p. 8 conserva una referencia a otra marca en el texto de datos personales. La metadata HTML del evento contiene fechas distintas del cronograma del PDF. No usar esos errores para asumir prórroga ni invalidar los requisitos técnicos. Mantener el plazo más temprano hasta recibir confirmación. Esta auditoría no contactó al organizador.

Las bases no permiten ideas previamente premiadas y remiten a procedimientos/formatos definidos durante el concurso (p. 4). **No se verificó una prohibición general expresa de toda investigación previa**; D-002 es una decisión prudente del equipo, no una cita de esa prohibición. Preguntar qué preparación puede reutilizarse y declarar su procedencia. Revisar licencias del SDK, modelos, fuentes e imágenes, y no prometer que la licencia del package propio cubre pesos o motores de terceros.

## Cómo responder a la rúbrica

Pesos verificados en p. 6: comprensión 25 %, prototipo 25 %, creatividad 20 %, viabilidad 20 % y presentación 10 %. No existe hoy una nota final demostrable de pitch/prototipo.

| Criterio | Fortalezas actuales / brecha | Acción prioritaria |
|---|---|---|
| Comprensión | Fuentes y público claros; sin observación real de uso | Validar supuestos sobre lenguaje, tiempo y confianza con trabajadores; registrar hallazgos sin inventar entrevistas |
| Prototipo | Spike real, sin interacción del trabajador | Un recorrido completo por texto/voz, con corrección y un resultado útil |
| Creatividad | Buen concepto; voz y QR por sí solos no prueban novedad | Mostrar trazabilidad, abstención y restricciones que cambian la recomendación |
| Viabilidad | QVAC ya usado; datos e integraciones incompletos | Separar lo ejecutado, datos curados y dependencias institucionales; medir entorno real |
| Storytelling | Dos personas ficticias útiles | Mostrar un caso cubierto y uno sin estándar; no atribuirles historia real ni resultados laborales |

## Demo y pitch propuestos

Guion propio de 180 segundos: problema y trabajador, 25 s; experiencia y corrección del resultado IA, 55 s; ocupación/demanda y primer paso con restricciones, 40 s; pasaporte y privacidad, 30 s; factibilidad, evidencia y siguiente validación, 30 s. Suma explícita: 25 + 55 + 40 + 30 + 30 = 180. Son tiempos propuestos, no resultados de ensayo. Si la inferencia tarda, iniciar el trabajo dentro del flujo y explicar el estado; no ocultar la latencia con una respuesta precargada presentada como nueva.

Demostrar tres diferencias concretas: editar una actividad cambia la propuesta; una restricción de horario/budget retira un curso incompatible; una habilidad sin respaldo no recibe sello oficial. El valor debe entenderse aunque el jurado no vea un panel técnico.

Preparar un registro técnico separado con commit, versión QVAC/modelos, fuentes, comandos, tiempos y límites. Mostrar el rótulo de prototipo y datos ficticios; no imitar una sesión ministerial real. No incluir relatos personales en diapositivas o logs. La grabación de respaldo debe identificarse como tal.

## Integración gubernamental: afirmaciones defendibles

| Servicio/fuente | Acción viable ahora | Dependencia pendiente |
|---|---|---|
| [Empleos Perú](https://www.gob.pe/23475-buscar-trabajo-en-el-portal-empleos-peru) | Enlazar al servicio oficial; curar una oportunidad pública identificable si sus condiciones lo permiten | No se halló contrato público de API utilizable en la búsqueda dirigida; acceso/autorización por confirmar |
| [Estándares MTPE](https://www.gob.pe/institucion/mtpe/informes-publicaciones/2992036-matriz-de-estandares-de-competencia-laboral) | Importar snapshot con fecha y validar su alcance | Revisión de cambios, unidades/criterios detallados y cruces ocupacionales |
| [EDO territorial: Lima Provincias](https://www.gob.pe/institucion/mtpe/informes-publicaciones/7519051-demanda-de-ocupaciones-en-lima-provincias-2026) | Usar como contexto agregado de su territorio exacto | No confundir Lima Provincias con Lima Metropolitana, localidad o vacante activa |
| [CAPACITA-T](https://capacitacionlaboral.trabajo.gob.pe/cursos/) | Catálogo curado y enlace con condiciones comprobadas | Frescura, requisitos y enlace funcional; certificado de curso no equivale a certificación de competencia |
| Certificación de competencias | Enlace y preparación hacia centro autorizado, comprobar oficio/requisitos | Cupos, costo, método, lugar y disponibilidad del centro; no universalizar evaluación en el puesto |
| gob.pe / [PIDE](https://www.gob.pe/institucion/pcm/pages/741-plataforma-nacional-de-interoperabilidad) | Diseñar adaptadores y contrato de futura integración | Identidad, infraestructura, autorización institucional y servicios concretos por acordar |

La investigación confirmó servicios, no permisos para acceder a bases privadas ni reutilizar credenciales. Ausencia de documentación encontrada no prueba inexistencia de API. Fuentes, accesibilidad de enlaces y restricciones legales en [seguridad](04_AUDITORIA_SEGURIDAD.md).

## Decisiones y preguntas para el Open Day

P0: confirmar arquitectura de destino, formato evaluado y qué se entiende por integración demostrable; pedir datos territoriales y catálogos detallados; aclarar reutilización del spike y procedimiento de datos reales. P1: conocer disponibilidad de API/sandbox, requisitos de identidad, centros y ofertas formativas, y quién mantendría fuentes. Preguntar soporte de lenguas/modelos y hardware sin asumir respuesta positiva. Registrar respuestas con emisor y fecha; una conversación técnica no equivale automáticamente a convenio o autorización de tratamiento.

**Recomendación estratégica:** competir como orientador explicable que convierte experiencia en un siguiente paso realizable, con control del trabajador. Mantener nombre y problema; rediseñar validación y restringir cobertura inicial. Un certificador automático o un portal gubernamental aparente debilitaría la propuesta precisamente donde la evidencia actual muestra mayor riesgo.
