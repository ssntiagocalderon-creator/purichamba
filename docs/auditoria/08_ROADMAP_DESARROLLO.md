# Roadmap de desarrollo

Fecha: 20-10-2026. Propuesta para decisión del equipo; no implica autorización de implementación. Dependencias y aceptación detalladas en [backlog](11_BACKLOG_IMPLEMENTACION.md). El punto de partida es preparación técnica, no una aplicación existente.

## Supuestos de planificación

Las fechas del concurso se verificaron en las [bases, p. 3 y 5](https://www.ulima.edu.pe/sites/default/files/centers/files/1_bases_innovathon_ulima_x_tether_0.pdf). La capacidad efectiva del equipo no está confirmada. Los intervalos siguientes son **estimaciones de ingeniería**, no compromisos ni cifras externas: un equipo con dos personas capaces de desarrollar y apoyo de diseño/datos/QA, acceso al hardware de pruebas y sin esperar una API ministerial. No sumar tareas paralelas como duración de calendario.

Mantener D-002: antes del Open Day, investigación, evaluación, datos y diseño; el equipo decide el producto. El plazo del concurso permite una demo acotada con datos ficticios, no seguridad e integraciones completas de producción.

## Secuencia hacia el concurso

| Ventana | Resultado y responsable propuesto | Dependencia / salida verificable |
|---|---|---|
| 20–22 oct | Producto/datos: preparar preguntas, un oficio con catálogo suficiente y un caso fuera de catálogo; ingeniería: contrato IA y plan de benchmark | Auditoría leída, fuentes identificadas; no construir producto antes de validar con equipo |
| 23 oct, Open Day | Producto y equipo: confirmar interpretación del reto, infraestructura y procedimientos | Registrar alcance acordado, prioridades y preguntas sin respuesta; no inferir permiso por silencio |
| 24 oct, workshops | Diseño + ingeniería: flujo probado en boceto y compatibilidad QVAC del entorno | Seleccionar un oficio y un territorio por evidencia disponible, no por conveniencia narrativa |
| 26 oct | Ingeniería: estructura producto y primer recorrido por texto, almacenamiento de sesión y catálogo curado | Iniciar, editar y recuperar una entrevista; endpoint QVAC y estado de trabajo reales |
| 27 oct | Ingeniería + datos: voz, propuestas trazables, confirmación, compatibilidad y primer paso | Completar flujo con fuente territorial y curso/centro consultable; si no hay oferta, explicar ausencia |
| 28 oct | Diseño + QA: correcciones, pruebas con consentimiento y al menos una prueba de rechazo del resultado IA | Registro de tareas, errores y cambios; usar datos ficticios mientras no pasen controles para datos reales |
| 29 oct | Equipo: pruebas del flujo, resumen de pasaporte demostrativo, ensayo y contingencia | Repetir demo desde estado limpio; no sustituir inferencia grabada sin rotularla |
| 30 oct | Presentación | Demostrar lo que corre, marcar datos de ejemplo e integraciones futuras; recoger preguntas |

**Recorte si no cabe:** primero texto, luego voz; un catálogo/oficio y un territorio; una evidencia ficticia local; resumen exportable en vez de compartir públicamente. No sacrificar confirmación, procedencia o privacidad para añadir pantallas. Si se recorta una exigencia del reto, se registra como brecha, no como cumplimiento implícito.

## Nivel 1: prototipo demostrable

Objetivo: un recorrido navegable real, no un conjunto de respuestas pregrabadas. Estimación inicial para el alcance acotado: **10–16 jornadas-persona**. Desglose propuesto, no observado: ingeniería y flujo base 4–6; datos/compatibilidad/acción 3–4; diseño 1–2; verificación y ensayo 2–4; suma de mínimos 10 y de máximos 16. Son bloques agrupados que incluyen varias partidas del backlog, no tiempos para sumar de nuevo por tarea. La ventana oficial de cuatro días exige trabajo paralelo y suficiente dedicación; dos desarrolladores solos no cubren todo ese esfuerzo. Riesgo alto de plazo si faltan responsables de datos/UX/QA o equipo de inferencia disponible; recortar antes de prometer alcance.

Criterios de salida:

- Iniciar por texto y probar voz con QVAC en el entorno declarado; mostrar modelo/versión y ejecución observables, sin exponer relato en logs.
- Proponer actividades y códigos con citas válidas; editar/rechazar; ninguna aceptación automática. Un caso ambiguo y uno sin correspondencia se resuelven sin inventar estándar.
- Mostrar ocupación compatible explicada, señal de demanda territorial con cobertura y primer paso comprobable. Si se usan fixtures de vacantes, rotularlos; no presentarlos como oferta activa.
- Generar un resumen demostrativo con estado de evidencia, sin prometer verificación gob.pe. Recargar y recuperar la sesión en el alcance declarado.
- Pasar los controles de demo de [pruebas](09_PLAN_PRUEBAS.md); tener contingencia por micrófono, modelo no disponible y red interrumpida. Video de respaldo rotulado como grabación, nunca como inferencia en vivo.

## Nivel 2: MVP funcional y piloto controlado

Estimación condicionada: **4–6 semanas adicionales**, con dos desarrolladores y dedicación parcial de diseño/datos/QA; revisar tras medir la velocidad real del prototipo. No incluye tiempos de convenio público. Alcance:

1. Endurecer contratos, autorización por propietario, persistencia, cifrado, consentimiento, retención y recuperación.
2. Evidencias privadas con validación y revisión; pasaporte con publicación selectiva, expiración y revocación. Referencias externas solo si hay diseño de consentimiento y abuso comprobado.
3. Motor determinista de compatibilidad y catálogo formativo mantenido; adaptadores versionados sin dependencia de API no disponible.
4. Suite automatizada, evaluación de IA con corpus etiquetado y benchmark de recursos; accesibilidad y usabilidad con el público objetivo.
5. Offline parcial explícito, sincronización idempotente, observabilidad sin contenido personal y restauración de respaldo.

Salida: todos los flujos críticos definidos pasan en staging; evidencia de aislamiento y privacidad; fuentes vigentes; criterios de calidad acordados; responsable operativo del piloto. Una integración pendiente se excluye con alcance visible, no se sustituye por un stub sin aviso. Que el MVP opere con catálogo curado no lo convierte en módulo oficial del Ministerio.

## Nivel 3: producción

Estimación de trabajo técnico inicial: **8–12 semanas adicionales al MVP** para endurecimiento, evaluación y operación; calendario real puede ser mayor por integración, contratación, infraestructura y revisión institucional. Es una previsión, no fecha de lanzamiento.

Puertas de salida obligatorias:

- Responsables del tratamiento, evaluación normativa de datos/IA, contratos, autorizaciones y protocolo de incidentes aprobados para el contexto real.
- Infraestructura de destino medida, cargas y límites definidos, estrategia de actualización y rollback, modelos y artefactos verificados, backup restaurado.
- Autorización e interoperabilidad acordadas con el MTPE cuando se use su identidad, datos o entorno; no basta un enlace a gob.pe.
- Accesibilidad validada manualmente además de herramientas automáticas; pruebas móviles, rendimiento, seguridad, calidad de IA y usabilidad del público real.
- Monitoreo, soporte, manejo de reclamos/correcciones y mantenedores de fuentes; documentación de operaciones y recuperación.

La nota de “100 % funcional” se reemplaza por una matriz de capacidades con prueba, versión, fecha y dependencia externa. Ningún porcentaje único sustituye esa verificación.

## Eliminar, simplificar o posponer

| Decisión recomendada | Razón y condición de revisión |
|---|---|
| Eliminar asignación automática y textos “perfil completo” a partir de IA | Los resultados guardados muestran falsos positivos; mantener propuestas y abstención |
| Eliminar equivalencia entre QR/foto/referencia y certificación | Esos mecanismos no acreditan desempeño ni autoridad certificadora |
| Simplificar entrevista a oficio, actividades, ejemplos y restricciones | Primero demostrar que se entiende y corrige, después conversación abierta |
| Posponer referencias de terceros, biometría y fraude automático | Consentimiento, suplantación y falsos positivos requieren diseño independiente; biometría sin justificación se descarta |
| Posponer app nativa e inferencia móvil | El requisito oficial permite backend; recursos reales de móviles no medidos |
| Posponer analítica agregada para el MTPE | No hay base de datos poblacional ni análisis de reidentificación; el objetivo actual es ayudar al trabajador |
| Posponer blockchain y credenciales complejas | No eliminan la necesidad de emisor confiable, consentimiento y revocación |
| No depender de API supuesta ni SSO no autorizado | Enlaces/curación verificables permiten avanzar; integración institucional tiene otra ruta |

## Decisiones inmediatas que necesita el equipo

Elegir oficio/territorio de demo, responsable de datos, hardware de QVAC y capacidad de desarrollo. Acordar límites de la palabra “confirmado” y el tratamiento de oficios sin estándar. Decidir si se publica algo compartible o se muestra un resumen privado. Registrar en el Plan las decisiones que el equipo acepte; esta auditoría solo registra recomendaciones.
