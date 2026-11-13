# Auditoría funcional y de UX de Pasaporte de Oficio

Fecha de corte: **20-10-2026**. Alcance: repositorio inspeccionado; revisión estática de código, resultados guardados y propuesta. La auditoría no modifica código ni datos. Referencias relativas a la raíz del repositorio. Los números de línea del Plan corresponden a la versión 0.1 del commit base `c24523f1bee8a64a21a8a1d2a9bdeee128415c69`, antes de las actualizaciones concurrentes y del registro de auditoría; véase el alcance en 01.

## Dictamen y límites

**Hecho verificado:** todavía no existe una aplicación para el trabajador. El repositorio contiene datos y una prueba de concepto por consola; su propia documentación distingue el spike del producto (`README.md:26–34`). El único `package.json` pertenece al spike, depende de QVAC y no define arranque de una interfaz (`spike-qvac/package.json:1–15`). El plan declara preparación y mantiene pendientes los bocetos y el flujo navegable (`PLAN_DE_PROYECTO.md:3–8`, `:251–272`). Esto es coherente con una fase de investigación, pero impide demostrar hoy el recorrido principal.

**No se ejecutaron pruebas de navegador, móvil, lector de pantalla, accesibilidad automática ni usabilidad:** no hay interfaz sobre la que ejecutarlas. Las observaciones UX siguientes evalúan el diseño propuesto y riesgos previsibles; no son defectos observados en pantallas existentes. Los JSON almacenados son evidencia histórica del spike, no resultados reproducidos en esta auditoría. No se da por aprobado un flujo por estar descrito en el plan.

Etiquetas: **H** hecho verificable; **Hipótesis** requiere validación; **R** recomendación. P0 bloquea una demostración honesta o un uso seguro; P1 aporta valor esencial; P2 mejora el MVP; P3 corresponde a evolución posterior. Complejidad: baja, media o alta, estimación técnica relativa y revisable.

## Inventario real de funcionalidades

| Función | Estado comprobado | Evidencia y alcance |
|---|---|---|
| Inicio, registro, navegación y perfil | **Ausentes** | No hay frontend, rutas ni servidor de producto. Estructura: `README.md:26–34`; comandos existentes: `README.md:54–60`. No se encontró autenticación ni cuenta del trabajador. |
| Entrevista por voz | **Parcial: CLI experimental** | Lee una ruta de WAV y llama a `transcribe`; no captura micrófono, no pide permiso ni permite pausar/regrabar (`spike-qvac/voz.mjs:9`, `:47–54`; `spike-qvac/competencias.mjs:58–62`). |
| Entrada por texto | **Ausente como producto** | El relato llega de `transcribe`, no de un formulario ni endpoint (`spike-qvac/competencias.mjs:59–69`; `spike-qvac/competencias_v2.mjs:42–49`). Los TXT son guiones de las personas ficticias, no la alternativa interactiva. |
| Preguntas de seguimiento | **Ausentes** | Los prompts dividen un relato; no hay bucle de entrevista, selección de pregunta ni estado de respuestas (`spike-qvac/competencias.mjs:64–77`). |
| Extracción de actividades | **Implementada como experimento** | Llamada QVAC con esquema JSON y cita (`spike-qvac/competencias.mjs:67–76`). No equivale a competencia demostrada. |
| Relación con estándares | **Implementada, experimental y no confiable** | Búsqueda semántica + juicio de IA (`spike-qvac/competencias.mjs:79–119`). El plan reconoce falsos positivos (`PLAN_DE_PROYECTO.md:223–234`); hay resultados incoherentes conservados. |
| Revisión y corrección humana | **Ausentes** | El plan exige confirmación por persona (`PLAN_DE_PROYECTO.md:142`, `:332`), pero `confirmadas` se obtiene del modelo y controles de índices/códigos (`spike-qvac/competencias.mjs:105–119`); no existe interacción humana. |
| Fotos/documentos/referencias | **Ausentes** | Solo propuesta (`PLAN_DE_PROYECTO.md:143`); el spike procesa WAV y guarda resultados JSON. No hay carga, clasificación, almacenamiento de evidencia ni consentimiento de terceros. |
| Compatibilidad laboral | **Parcial: cercanía a perfiles de catálogo** | Cuenta estándares aceptados por IA / total del perfil; no compara vacantes, requisitos esenciales, ubicación o preferencias (`spike-qvac/competencias.mjs:122–146`). |
| Vacantes reales y demanda territorial | **Ausentes en ejecución** | Demanda regional pendiente (`PLAN_DE_PROYECTO.md:203–207`); no hay adaptador de vacantes ni feed de datos en los scripts. Un PDF de demanda agregada no es una bolsa de vacantes. |
| Ruta de formación/certificación | **Ausente** | Propuesta (`PLAN_DE_PROYECTO.md:145`); centros pendientes (`:207`). No hay dataset de cursos, filtro de horarios/costo ni acción comprobable de inscripción. |
| Pasaporte y QR verificable | **Ausentes** | Firma y validación pendientes por declaración expresa (`PLAN_DE_PROYECTO.md:146`, `:195`). No hay emisor, enlace, revocación ni verificador. |
| Persistencia del trabajador y recuperación | **Ausentes** | Hay escritura de informes del experimento (`spike-qvac/competencias.mjs:150–151`); no hay sesiones ni modelo de usuario, guardado del borrador o recuperación de progreso. |
| Manejo de errores para trabajador | **Ausente** | El CLI imprime el error y termina (`spike-qvac/competencias.mjs:154–156`). No hay recuperación guiada ni estado accesible. |
| Offline | **No demostrado como producto** | La inferencia local del spike no prueba carga offline de interfaz, guardado, recuperación ni disponibilidad de oportunidades. No hay aplicación offline ni pruebas de reconexión. |

No se encontró un flujo de producto **simulado mediante pantallas**. Sí existen datos ficticios del spike, marcados como tales (`README.md:64`). Si el futuro prototipo usa oportunidades de ejemplo, deberán rotularse como simuladas en el punto de uso.

## Hallazgos priorizados

| ID | Hallazgo y efecto | Prioridad / complejidad | Acción y criterio de aceptación |
|---|---|---|---|
| UX-01 | **H:** el trabajador no puede iniciar ni completar ninguna tarea. La CLI requiere entorno técnico. Evidencia: inventario anterior. | P0 / alta | Construir posteriormente un flujo vertical mínimo en carpeta de producto, tras cerrar alcance con el equipo. Aceptar cuando una persona pueda contar/escribir, corregir, confirmar, ver una ocupación y un primer paso, y revisar un pasaporte demostrativo sin terminal. Probar el recorrido completo. |
| UX-02 | **H:** el sistema llama `confirmadas` a salidas de IA, aunque D-004 exige persona. Un filtro de código existente no valida la relación semántica (`spike-qvac/competencias.mjs:115–119`). | P0 / media | Separar `propuesta_ia`, `confirmada_por_persona` y respaldo. Aceptar cuando ninguna propuesta aparezca como confirmada sin acción explícita, y una corrección invalide/recalcule sus resultados dependientes. |
| UX-03 | **H:** “tiene”, “le falta” y “¡perfil completo!” expresan dominio a partir de un conteo no validado (`spike-qvac/competencias.mjs:132–146`). Incluso aparecen perfiles de silvicultura para Rosa (`spike-qvac/resultados/rosa-QWEN3_4B_INST_Q4_K_M.json:1236–1251`). | P0 / media | Usar “actividades que declaraste”, “requisitos por revisar” y “sin evaluar”. Eliminar el mensaje de perfil completo del producto. Aceptar cuando toda compatibilidad muestre qué información la sustenta, qué falta saber y por qué no es certificación ni probabilidad de contratación. |
| UX-04 | **H:** no hay micrófono ni alternativa de texto interactiva. **Hipótesis:** la voz como única entrada excluye a personas sordas, con dificultades de habla o en un entorno sin privacidad. | P0 / media | Ofrecer voz y texto con la misma funcionalidad, permiso justo antes de grabar, indicador claro, escuchar/regrabar/corregir, y salida por texto ante fallo. Aceptar completando todo el flujo con micrófono denegado. |
| UX-05 | **H:** faltan demanda regional, vacantes y ofertas formativas ejecutables (`PLAN_DE_PROYECTO.md:203–207`). Prometer “cerca de ti” o “curso de fin de semana” hoy sería infundado. | P0 / alta | Mostrar procedencia, fecha y territorio de los datos; diferenciar ocupación demandada y vacante abierta. Aceptar con enlaces/fuentes comprobables, estados sin datos y sin recomendaciones incompatibles con restricciones declaradas. |
| UX-06 | **H:** pasaporte/QR y verificador no existen; el plan deja el mecanismo pendiente (`PLAN_DE_PROYECTO.md:146`, `:195`). | P0 antes de compartir / alta | Empezar por vista privada rotulada como demostración. Para enlaces reales: vista previa por campos, consentimiento separado, caducidad y revocación; QR solo con identificador opaco. Aceptar que rechazar compartir no impida recibir orientación y que un enlace revocado deje de mostrar datos. |
| UX-07 | **H:** se propone pedir referencias como etapa del flujo (`PLAN_DE_PROYECTO.md:143`), pero no hay mecanismo ni evidencia de necesidad de ese número. **Hipótesis:** puede excluir trabajos sin clientes accesibles o exponer relaciones laborales. | P1 / media | Hacer evidencias y referencias opcionales; permitir avanzar como autodeclarado; pedir contexto de una foto, no “prueba de autenticidad”. Aceptar completar y guardar sin fotos ni referencias, sin degradar el mensaje sobre la dignidad del oficio. |
| UX-08 | **H:** hay una propuesta “puente” que puede producir equivalencias engañosas. v2 elige el primer vecino semántico al no coincidir (`spike-qvac/competencias_v2.mjs:93–95`). | P1 / media | Conservar actividades no cubiertas; decir “no encontramos un estándar para esta actividad”. Una ocupación alternativa es exploratoria y explica diferencias. Aceptar el caso de reparación de celulares sin asignar por obligación un perfil ajeno. |
| UX-09 | **H:** no existe guardado/reanudación ni control para dispositivo compartido. **Hipótesis:** perder el relato al interrumpir aumenta abandono. | P1 / alta | Diseñar borrador protegido, estado de guardado y salida segura; resolver retención, cifrado y recuperación con seguridad. Aceptar interrupción/reapertura sin duplicar entrevista ni exponer el relato a la siguiente persona. |
| UX-10 | **H:** no hay pantallas ni pruebas; la experiencia móvil, accesibilidad y comprensión no están validadas. | P1 / media | Definir objetivo WCAG 2.2 AA, probar teclado/lector de pantalla y observar trabajadores del público objetivo. Aceptar según plan de pruebas, con incidencias registradas; una herramienta automática por sí sola no valida conformidad. |
| UX-11 | **H:** el spike imprime relato completo en consola (`spike-qvac/competencias.mjs:62`, `:136–143`) y usa voz/guiones sintéticos (`README.md:64`). **Hipótesis:** una demo con voz limpia puede ocultar fallos en uso real. | P1 / media | Preparar prueba consentida de audio real, ruido y distintos modos de entrada; evitar relatos reales en logs. Aceptar publicación de resultados con metodología y sin identificadores, distinguiendo ensayos sintéticos y humanos. |
| UX-12 | **H:** la marca estatal se propone sin integración confirmada (`PLAN_DE_PROYECTO.md:180`, `:306`). | P1 / baja | Mantener aviso permanente “Prototipo de concurso; no es un servicio oficial del MTPE”. Aceptar que la primera pantalla y el pasaporte no induzcan afiliación o certificación oficial. |

## Recorrido recomendado y microtextos

**R:** empezar sin exigir DNI, certificados, dirección exacta ni crear una cuenta para obtener orientación. La persistencia y el compartir sí necesitan una decisión explícita y un mecanismo de seguridad definido. No usar la voz para autenticar identidad.

| Paso | Interacción y texto de ejemplo | Salida controlada |
|---|---|---|
| Entrada | “Te ayudamos a contar lo que sabes hacer. Tú revisas lo que la IA propone”. Mostrar privacidad breve y enlace al detalle; indicar demo. | Empezar por voz o por texto; ayuda visible en el mismo lugar. |
| Experiencia | “¿Qué haces en un día de trabajo?”; ejemplo breve opcional. Separar empleos/oficios cuando el relato lo requiera. | Micrófono explícito o escritura; nunca grabar automáticamente. No pedir un relato largo ni obligar a decir edad/nombre. |
| Revisión del relato | “Esto entendimos. Puedes corregirlo”. Resaltar fragmentos dudosos sin inventar una confianza numérica. | Editar, volver a grabar, borrar o continuar; informar si el audio se conserva o elimina. |
| Actividades y competencias | Una tarjeta por propuesta: actividad sencilla, frase propia que la respalda y nombre del estándar disponible al expandir. | “Sí, lo hago”, “A veces / con ayuda”, “No”, “No estoy seguro”. Nada preseleccionado. Pregunta breve de aclaración solo si aporta información. |
| Evidencias | “Si quieres, agrega un trabajo que hayas realizado”. Explicar qué se verá y avisar de rostros/documentos ajenos. | Adjuntar, describir, ocultar, eliminar o saltar. No elevar automáticamente una foto a prueba auténtica. |
| Opciones cercanas | “Estas ocupaciones comparten actividades que nos contaste”. Mostrar por separado compatibilidad, demanda territorial y condiciones conocidas. | Razones concretas, brechas, información faltante y opción de corregir; no un porcentaje de empleabilidad. |
| Primer paso | Preguntar disponibilidad, presupuesto y desplazamiento en lenguaje simple, con “no sé” y “prefiero no decir”. | Una acción principal con horario/costo/fuente o mensaje honesto de ausencia; otras opciones secundarias. |
| Pasaporte | “Revisa qué quieres mostrar”. Etiquetas por afirmación y fecha de actualización. | Guardar privado; vista como empleador; compartir voluntariamente. Un PDF descargado no puede revocarse: explicar la diferencia respecto del enlace. |

**R:** evitar sobrecargar al trabajador con “ECL”, “embedding”, “RAG” o códigos oficiales en el flujo principal. El detalle técnico y las fuentes van en información expandible. “Competencia propuesta” debe poder explicarse como “algo que podrías saber hacer según lo que contaste”. Validar comprensión de esos términos con usuarios; el lenguaje coloquial “chamba” no representa necesariamente a todos los territorios.

## Estados de excepción que deben diseñarse

| Situación | Respuesta recomendada | Aceptación funcional |
|---|---|---|
| Micrófono rechazado, sin audio o ruido | Explicar qué falló sin culpar; ofrecer escribir o regrabar. | Continúa por texto sin reiniciar ni solicitar permiso en bucle. |
| QVAC sin modelo listo / servicio ocupado / fallo | Aviso concreto de preparación o demora; cancelar/reintentar; conservar entrada según consentimiento. | No muestra resultados ficticios ni descarta relato en silencio. |
| Relato ambiguo o varios oficios | Pregunta específica y opción “no sé”; separar contextos. | No fusiona competencias de oficios sin que la persona revise. |
| Propuesta incorrecta | “Gracias por corregirlo”; editar/deshacer. | El matching y pasaporte dejan de incluir inmediatamente esa afirmación. |
| Oficio sin estándar | Conservar actividad; explicar límite del catálogo. | La persona puede terminar sin recibir una equivalencia falsa. |
| Sin demanda local conocida / vacantes | Indicar “no tenemos datos suficientes” y diferenciarlo de “no hay empleo”. | Ampliar territorio solo con elección; no presentar vacantes inventadas. |
| Sin curso compatible | Mostrar qué restricción impide proponer una opción y permitir revisarla. | No inventa horario, costo ni resultado de capacitación. |
| Evidencia cuestionable | Estado “aportada; autenticidad no verificada”, contexto y revisión según reglas. | No acusa de fraude automáticamente ni la cuenta como certificación. |
| No comparte información | Confirmar guardado privado o eliminación, según elección. | Orientación completa disponible y sin QR público por defecto. |
| Conexión intermitente | Mostrar qué está guardado, qué espera conexión y qué no puede calcularse. | Sin duplicados al reintentar; no prometer inferencia offline en navegador. |

## Accesibilidad móvil propuesta

**R:** adoptar WCAG 2.2 AA como objetivo de ingeniería, no declarar cumplimiento aún. Referencia primaria consultada el 20-10-2026: [W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/). Criterios a cubrir: alternativas de contenido no textual (1.1.1), contraste (1.4.3), reflujo (1.4.10), teclado (2.1.1), foco visible/no oculto (2.4.7/2.4.11), tamaño de objetivo (2.5.8), etiquetas/errores (3.3.1/3.3.2), autenticación accesible (3.3.8), nombre/rol/valor y mensajes de estado (4.1.2/4.1.3). La conformidad debe evaluar páginas y procesos completos. Estos son objetivos técnicos propuestos; no una conclusión legal.

Aplicaciones concretas propias: botones amplios y separados; una decisión principal por pantalla; estado de grabación expresado con texto además de color; título y foco al cambiar de paso; errores junto al campo con una acción para resolverlos; controles HTML semánticos; ampliación de texto sin perder contenido; nada que dependa solo de arrastrar, del color, del audio o de recordar datos; enlaces y controles con nombres comprensibles. El QR necesita también un enlace textual accesible. No reproducir voz automáticamente en un teléfono compartido.

La lectura en voz alta es una mejora posible; no existe hoy ni se presupone que el TTS apropiado para las lenguas objetivo esté disponible. La traducción a quechua/aimara debe pasar por hablantes y validación técnica; no sustituirla por un selector de idioma sin cobertura real. El tamaño mínimo normativo y otras excepciones se deben verificar directamente en el criterio aplicable al implementarlo; proponer controles cómodos no constituye medición de conformidad.

## Investigación de usabilidad pendiente

**Hipótesis a contrastar:** confirmar con sí/no podría provocar aceptación por autoridad; usar términos oficiales podría ocultar que la persona no comprendió; las referencias podrían excluir a trabajadores con redes frágiles; el QR podría parecer un certificado. Ninguna fue medida con usuarios en este repositorio.

**R:** observar tareas con trabajadores que sepan poco de tecnología, incluyan varios oficios, no sepan describir sus tareas y usen dispositivos modestos. Incluir personas con necesidades de accesibilidad y uso de un teléfono compartido. Pedir consentimiento; no registrar identidad ni audio de investigación innecesarios. Preguntas neutrales: “¿Qué cree que significa esta tarjeta?”, “¿Quién ha comprobado esto?”, “¿Qué verá quien abra este enlace?”. Registrar bloqueos, ayuda necesaria, correcciones, comprensión de niveles de evidencia y abandono por etapa. Comparar voz/texto por éxito de tarea, no solo por preferencia declarada.

Puerta de aceptación propuesta: ningún flujo crítico necesita que el facilitador complete una acción por el trabajador; ninguna persona debe creer que la IA le emitió una certificación oficial; los errores observados deben convertirse en incidencias y volver a probarse. El número de participantes, cobertura territorial y umbrales de éxito se acuerdan antes del ensayo; una sesión pequeña sirve para detectar problemas, no para afirmar representatividad.

## Qué simplificar o posponer

| Decisión recomendada | Motivo y prioridad |
|---|---|
| Demo con un flujo vertical y un conjunto acotado de oficios | P0. Aporta más que muchas pantallas incompletas; ampliar solo tras medir extracción y comprensión. No limitar la información de la persona a un oficio si relata varios. |
| No exigir cuenta, DNI, foto ni referencias al empezar | P1. Son barreras y datos innecesarios para orientar; definir después cómo guardar de forma segura. |
| No usar “perfil completo”, certificación por IA ni porcentaje de contratación | P0. La evidencia actual no los justifica. |
| Posponer marketplace, chat con empleadores, red social, ranking de trabajadores y firma gubernamental | P3. Añaden moderación, identidad, fraude e integración sin resolver primero reconocimiento y orientación. |
| Offline de captura/borrador antes que prometer toda la IA en cualquier celular | P1 para recuperación; P3 para inferencia móvil amplia. La arquitectura concreta debe validarse con QVAC y hardware objetivo. |
| Referencias verificadas y credenciales oficiales después de una demo transparente | P2/P3 según acuerdos. Un enlace creado por el equipo no prueba identidad del referente ni vínculo con el MTPE. |

Las acciones anteriores son recomendaciones para autorización e implementación posterior; esta auditoría no crea la interfaz ni cambia las decisiones del plan maestro.
