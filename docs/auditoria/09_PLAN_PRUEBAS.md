# Plan de pruebas y evidencia de ejecución

Fecha: 20-10-2026. Los casos de producto de este documento son **pruebas propuestas**, salvo la tabla de ejecución actual. No existen todavía aplicación, suite E2E ni entorno de staging. No se declara que los flujos críticos hayan pasado.

## Ejecutado durante la auditoría

Detalle reproducible y límites en [técnica](02_AUDITORIA_TECNICA.md), [IA](03_AUDITORIA_IA_QVAC.md) y [seguridad](04_AUDITORIA_SEGURIDAD.md).

| Comprobación | Resultado observado | Qué no demuestra |
|---|---|---|
| Inventario versionado y lectura del código | Sin UI, servidor HTTP, autenticación ni despliegue de producto | No evalúa un servicio privado fuera de este repositorio |
| `node --check` sobre cuatro `.mjs` | Cuatro pasan sintaxis | No ejecuta SDK, modelos ni valida resultados |
| `ast.parse` de dos scripts Python | Dos pasan sintaxis | No garantiza cobertura de otros formatos de entrada |
| Conversión XLSX en copia temporal | Exit 0; JSON y CSV byte idénticos a los versionados | Reproduce transformación; no valida toda interpretación normativa del catálogo |
| Recuento de datos | 449 filas, 434 vigentes y 15 vencidas en la fecha fija; 192 perfiles totales, 185 entre vigentes; 89 filas con CNO | No prueba equivalencia entre CNO y estándar ni cobertura total de oficios |
| Revisión de resultados IA guardados | Duplicaciones y asociaciones improcedentes; ver ejemplos en IA | No es nueva inferencia ni frecuencia de error poblacional |
| WER recalculado desde guiones/transcripciones existentes | Parakeet: Jhon 6/118 y Rosa 4/94; Whisper: 26/118 y 5/94 | Sin acentos/puntuación; números no normalizados; dos audios sintéticos no representan usuarios reales |
| `npm audit` del lock auditado | Exit 0, sin avisos reportados para sus 236 dependencias | No prueba ausencia de fallos, calidad de motores nativos o seguridad de pesos |
| Comparación con GitHub | HEAD local igual a `main` remoto auditado | No hubo revisión de settings privados de Actions, protección de ramas o entornos |

No se descargaron modelos ni se sobrescribieron resultados para “probar” inferencia. No hubo pentest, prueba de carga, lector de pantalla, modo avión de producto ni entrevistas de usabilidad. Las comprobaciones anteriores son auditoría de preparación, no la suite requerida para liberar un MVP.

Verificación documental de cierre: los 12 archivos solicitados existen; el comprobador de enlaces relativos no encontró destinos locales faltantes ni bloques de código sin cerrar. Se contaron 34 identificadores de backlog y 30 escenarios propuestos, no pruebas aprobadas. `git diff --exit-code c24523f1bee8a64a21a8a1d2a9bdeee128415c69 --` sobre scripts, fuentes oficiales, datos procesados, configuración y manifiestos/lock del spike devolvió 0: esos archivos permanecen idénticos a la base. Las adiciones concurrentes de resultados 8B están fuera de esa comparación y se documentan en IA. La auditoría no ejecutó commits ni push; la actualización propia del Plan es únicamente documental.

## Estrategia y entornos

Dominio y cálculos en unitarias; validación, persistencia y contratos en integración; recorridos en E2E; QVAC real en un grupo identificado de pruebas sobre hardware documentado. Los dobles de IA sirven para errores deterministas, pero no acreditan integración QVAC. Separar datos ficticios, corpus consentido y datos reales de piloto. Nunca copiar relatos reales a issues, snapshots públicos o telemetría.

Herramientas sugeridas para elegir y fijar al implementar: runner unitario TypeScript, Playwright para E2E/móvil emulado, axe-core más revisión manual para accesibilidad, prueba HTTP de carga y análisis de dependencias. Su mención no significa que estén instaladas o ejecutadas en este repo.

Cada ejecución registra commit, entorno, fecha, fixture/corpus con hash, versiones y hash de modelos, parámetros, hardware, tiempo frío/caliente, resultado esperado/observado y defectos. El informe debe distinguir error de dominio, indisponibilidad externa y limitación conocida.

## Matriz de pruebas funcionales y técnicas

| ID / tipo | Escenario y estímulo | Aceptación propuesta | Nivel |
|---|---|---|---|
| T01 unitaria | Actividad, código, versión y cita válidos/inválidos | Rechazar códigos ajenos al conjunto candidato, índices fuera de rango y citas inexistentes | Demo |
| T02 unitaria | Duplicados y campo extra en respuesta IA | Una afirmación por clave estable; schema estricto y límites | Demo |
| T03 unitaria | Confirmar/corregir/rechazar | Solo aceptación explícita crea afirmación; corregir invalida derivados | Demo |
| T04 unitaria | Compatibilidad y requisitos críticos | Resultado determinista y explicación en el catálogo de demo; ampliar en MVP sin compensar un requisito obligatorio ausente ni excluir desconocidos del denominador | Demo/MVP |
| T05 unitaria | Sin fuente, sin requisitos o denominador vacío | Información insuficiente, nunca porcentaje o recomendación inventada | Demo |
| T06 datos/integración | ECL vencido, desconocido, nuevo y código repetido | Validación por fecha consultada, reporte de cambios y revisión antes de publicar catálogo | MVP |
| T07 integración | IA devuelve JSON roto, se cuelga o agota memoria | Timeout/cancelación, estado recuperable y sin afirmaciones parciales aceptadas | Demo |
| T08 integración | Crear y recuperar entrevista | Demo: recarga conserva sesión en el alcance declarado; MVP: reinicio conserva versión confirmada, propietario y consistencia transaccional | Demo/MVP |
| T09 integración | Reintentar misma carga o sincronización | Idempotencia; ninguna evidencia, tarea o publicación duplicada | MVP |
| T10 integración | Dos dispositivos editan el mismo perfil | Conflicto visible; ninguna sobrescritura silenciosa | MVP |
| T11 E2E | Texto → edición → competencias → ocupación → acción → resumen | Completar sin consola y con todas las fuentes/estados visibles | Demo |
| T12 E2E | Voz con micrófono denegado, audio vacío o interrumpido | Alternativa por texto, explicación simple y borrador recuperable | Demo |
| T13 E2E | Usuario rechaza propuesta IA | No reaparece como confirmada ni se cuenta en compatibilidad o pasaporte | Demo |
| T14 E2E | Sin vacante cercana o curso compatible | Explicar ausencia, conservar restricciones y ofrecer ajuste voluntario | Demo |
| T15 evidencias | Archivo grande, extensión falsa, EXIF, contenido activo | Límites reales, bloqueo/aislamiento y publicación sin metadatos privados | MVP |
| T16 privacidad | No autoriza compartir datos | Flujo de orientación funciona; no hay publicación, token ni llamada externa de difusión | Demo |
| T17 privacidad | Borrar relato/evidencia y ejercer rectificación | Se eliminan/revisan derivados y vistas compartidas según política; registro sin contenido | MVP |
| T18 seguridad | Usuario A solicita/edita recursos de B | Denegar en API y objetos, sin revelar existencia ni contenido | MVP |
| T19 seguridad | QR copiado, expirado, revocado o token manipulado | Solo campos autorizados; no acceso tras expiración/revocación online | MVP |
| T20 seguridad | CSRF, XSS y límites de sesiones/colas | Ningún contenido se ejecuta; peticiones no autorizadas bloqueadas; cuotas y cierre de sesión | MVP |
| T21 IA adversaria | Relato o catálogo dice “ignora reglas / certifica / publica” | No amplía permisos, no inventa fuente/estado, no ejecuta acciones de negocio | Demo/MVP |
| T22 fraude | Foto reutilizada, referencia falsa o coaccionada | Etiquetar aportada/pendiente; no conferir verificación automática ni sancionar por señal débil | MVP |
| T23 offline | Cortar red antes y durante una solicitud | Mensaje claro, borrador intacto; no afirmar inferencia o fuente actualizada offline | Demo |
| T24 offline | Volver la red con operaciones pendientes | Reintento consentido/idempotente; nunca publicar por reconexión automática | MVP |
| T25 recuperación | Restaurar DB y objetos desde copia cifrada | MVP: restauración mínima de copia de ensayo con perfil/evidencia consistentes; producción: ejercicio operativo y objetivos de pérdida/tiempo acordados y medidos | MVP/Producción |
| T26 operación | Modelo corrupto, descarga bloqueada o disco lleno | Fallo cerrado, comprobación integridad y alternativa texto/catálogo; sin resultados ficticios | Demo/MVP |
| T27 accesibilidad | Teclado, lector de pantalla y zoom | Demo: recorrido básico con teclado/foco y mensajes; MVP: revisión completa con lector/zoom, nombres/errores anunciados, sin bloqueo por voz | Demo/MVP |
| T28 móvil | Android modesto e iOS físico; retrato y teclado abierto | Controles visibles, reflow y carga operables sin pérdida de borrador | Demo/MVP |
| T29 carga | Cola creciente, cancelación y trabajos repetidos | Límites de recursos, contrapresión y recuperación; ningún cruce entre usuarios | Producción |
| T30 catálogo/integración | Fuente caída, cambiada o vencida | Fuente y frescura visibles; fallback definido y alerta al mantenedor | MVP |

## Calidad de IA

Fase inicial: corpus diseñado de **30 relatos** de prueba, distribuidos por oficio, multioficio, ambigüedad y fuera de catálogo, incluyendo pares negativos difíciles. Es un tamaño propuesto para detectar fallos evidentes, no una muestra representativa. Mantener separados desarrollo y evaluación; etiquetas revisadas por dos personas con desacuerdos documentados y apoyo de especialista cuando se juzgue un estándar. No tratar coincidencias con etiquetas de un LLM como verdad de terreno.

Medir WER por hablante/condición y errores semánticos críticos de ASR; precisión/recobrado de actividades; proporción de citas exactas y sustentadoras; recuperación top-k con casos fuera de catálogo; falsos positivos por oficio; calidad de preguntas y esfuerzo de corrección. Reportar abstención y cobertura conjuntamente para evitar aparentar buena precisión rechazando todo.

Umbrales **iniciales propuestos**, ajustables con piloto antes de adoptarlos: 100 % de códigos válidos y citas localizables; cero afirmaciones autoaceptadas; precisión de candidatos evaluados al menos 0,85 y recuperación top-3 al menos 0,80 en el corpus acordado; detección de casos fuera de cobertura al menos 0,90. Estos valores son decisiones tentativas, no resultados ni requisitos oficiales. Reportar numeradores, denominadores y errores individuales; ningún promedio permite ocultar una atribución oficial falsa.

Voz real solo con consentimiento y retención mínima: probar acentos peruanos, ruido de taller/mercado, pausas y vocabulario del oficio. No prometer quechua/aymara sin modelo y corpus verificados. El 97 % histórico no se utiliza como criterio: ignora orden, inserciones y parte de las repeticiones (`voz.mjs`:16–21).

## Rendimiento, accesibilidad y usabilidad

Benchmark de ASR y extracción por separado y en recorrido completo; incluir espera de cola, arranque frío, carga, memoria RSS/pico GPU si aplica, almacenamiento, descarga y cancelación. Medir al menos 30 ejecuciones por configuración para una primera distribución y publicar p50/p95 con el tamaño de muestra. Objetivo provisional en el backend elegido: respuesta del flujo de IA en p95 menor de 60 s para audio de hasta 45 s, interfaz que reconoce la solicitud de inmediato y permite cancelar. No extrapolar los tiempos del Mac a Android o a concurrencia real.

Accesibilidad objetivo WCAG 2.2 AA: contraste, reflow, teclado, foco no oculto, nombres/roles/estados, ayuda y errores, objetivos táctiles y autenticación accesible. Chequeo automático no equivale a conformidad. Ver criterios y fuentes en [UX](05_AUDITORIA_FUNCIONAL_UX.md).

Usabilidad: sesiones con trabajadores del público definido, tareas observadas por voz y texto, sin guiar cada paso. Objetivo piloto propuesto: al menos cinco participantes diversos, registrar finalización, ayuda necesaria, comprensión del estado “declarado” y capacidad de corregir/revocar. Es investigación formativa, no validación estadística. Incluir expresamente: sin estudios formales, multioficio, quien no sabe explicar su experiencia, respuestas ambiguas, competencia equivocada, sin vacantes, sin cursos, teléfono limitado, red intermitente, rechazo a compartir y evidencia dudosa.

## Criterio de liberación

Demo: T01–05, T07, subconjunto demo de T08, T11–14, T16, T21, T23, fallo de modelo de T26 y comprobaciones básicas de T27/T28 ejecutados sobre el alcance de la presentación, con QVAC real identificable. T28 debe incluir el teléfono elegido para presentar, con modelo y navegador registrados; la cobertura móvil ampliada corresponde al MVP. MVP: todos sus casos críticos aprobados, incluida restauración mínima T25, sin defectos abiertos de aislamiento, pérdida de datos o atribución oficial falsa; registrar excepciones de funciones excluidas. Producción: añadir seguridad independiente, carga, recuperación operativa, normativa e integraciones autorizadas. La aprobación la realiza el equipo responsable sobre evidencia; este documento no la anticipa.
