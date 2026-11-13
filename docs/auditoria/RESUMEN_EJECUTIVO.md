# Auditoría integral: Pasaporte de Oficio

**Dictamen: mantener la propuesta y modificar significativamente su núcleo de validación, confianza y recomendación.** El problema es pertinente y QVAC está integrado en experimentos reales. El repositorio aún no contiene una aplicación: no hay interfaz, servidor de producto ni recorrido completo del trabajador. Esta auditoría no implementa funcionalidades ni declara un MVP funcional.

Fecha: **20-10-2026, America/Lima**. Base principal: `c24523f1bee8a64a21a8a1d2a9bdeee128415c69`, contrastada con GitHub al inicio. Durante el trabajo otro proceso creó `1248b91cb4d417c6c8402b19e37f632eccdd766b`, actualizó el Plan a 0.2 e incorporó resultados 8B y parte de los documentos que se estaban redactando. Se preservaron esos cambios. Los artefactos 8B se revisan como evidencia complementaria de procedencia no auditada; no son nuevas inferencias de esta auditoría. Las líneas citadas del Plan original corresponden a 0.1; véase el [corte y método](01_DIAGNOSTICO_GENERAL.md).

## Calificación por categoría

Juicio auditor sobre capacidad actualmente demostrada, no nota del concurso ni porcentaje de avance. Escala y justificación en [diagnóstico](01_DIAGNOSTICO_GENERAL.md).

| Categoría | Nota /10 |
|---|---:|
| Comprensión y encaje conceptual | 7 |
| Calidad y gobierno de datos | 5 |
| Ingeniería y mantenibilidad del producto | 2 |
| IA y QVAC | 4 |
| Funcionalidad integral | 1 |
| Seguridad y privacidad operativa | 2 |
| UX y accesibilidad implementadas | 1 |
| Integraciones y recomendaciones | 1 |
| Pruebas y rendimiento | 2 |
| Preparación demostrable para el concurso | 3 |

La nota baja de producto responde a implementación ausente, coherente con Fase 0. No implica que se haya medido incumplimiento WCAG en pantallas inexistentes ni que se haya explotado un servidor.

## Los diez problemas más importantes

| # | Problema y evidencia | Prioridad / consecuencia |
|---|---|---|
| 1 | No existe aplicación navegable: `README.md:26–34`, `spike-qvac/package.json:6–15` e inventario | P0 demo: el trabajador no puede completar ninguna tarea |
| 2 | Competencias incorrectas sobreviven a los filtros: Rosa termina asociada a perfiles forestales; Jhon a housekeeping. Resultados v1 y `competencias.mjs:115–146` | P0 veracidad: no se puede presentar la salida como capacidad reconocida |
| 3 | La confirmación humana D-004 solo existe en el diseño; `confirmadas` viene del modelo (`competencias.mjs:105–119`) | P0 demo: falta control y corrección real del titular |
| 4 | El “97 %” de voz es presencia de palabras, no precisión ASR (`voz.mjs:16–21`) | P0 comunicación: puede exagerar calidad y ocultar errores |
| 5 | Cercanía = conteo de estándares; no contempla requisitos críticos, demanda territorial ni vacantes (`competencias.mjs:122–146`) | P0 reto: no demuestra una oportunidad laboral pertinente |
| 6 | No hay oferta formativa/centros operativos ni filtro por recursos y horarios (Plan original:199–207) | P0 reto: el primer paso realista no está implementado |
| 7 | No hay persistencia del trabajador, recuperación ni pruebas de flujos; `npm test` es plantilla | P0 MVP: no hay evidencia de confiabilidad o continuidad |
| 8 | Relatos y citas se imprimen y guardan en JSON en claro (`competencias.mjs:62,151`, v2:82–100) | P0 antes de datos reales: exposición por logs, archivos o versionado |
| 9 | Evidencias, permisos y QR verificable siguen pendientes (Plan original:143–146,195) | P0 antes de compartir: ni identidad ni autenticidad quedan demostradas |
| 10 | Catálogo/índice y capacidad de IA insuficientemente gobernados: fecha fija, workspace fijo y sin corpus/hardware objetivo | P1; P0 para prometer producción/calidad: resultados obsoletos y desempeño desconocido |

La lectura complementaria 8B muestra menos aceptaciones en dos ejemplos; no establece precisión, cero errores ni suficiencia de ese modelo. El Plan 0.2 contiene una conclusión más favorable: debe tratarse como hipótesis de experimento hasta contar con etiquetas y comparación controlada. El almacén vectorial integrado de QVAC está documentado para prototipos, no debe heredarse sin revisión a producción. Fundamentos en [IA/QVAC](03_AUDITORIA_IA_QVAC.md).

## Diez mejoras recomendadas

| # | Acción | Prioridad / complejidad | Aceptación resumida |
|---|---|---|---|
| 1 | Crear una sección vertical de producto, separada del spike | P0 / alta | Completar entrevista→revisión→opción→acción→resumen desde navegador |
| 2 | Trazar frase→actividad→propuesta y permitir corregir/rechazar | P0 / media | Ninguna propuesta autoaceptada; cambios retiran derivados |
| 3 | Añadir validación semántica acotada y abstención | P0 / media | Citas localizables, códigos de candidatos, sin puente impuesto |
| 4 | Curar catálogo y demanda territorial con procedencia | P0 / media | Año/territorio/cobertura visibles; proyección separada de vacantes |
| 5 | Motor determinista de compatibilidad y restricciones | P1 / media | Explica coincidencias, brechas y datos faltantes; sin % de contratación |
| 6 | Primer paso con oferta y condiciones verificables | P0 / media | Fuente consultable; horario/costo/requisitos conocidos o por confirmar |
| 7 | Persistencia, consentimiento y control de acceso | P0 datos reales / alta | Recuperación, aislamiento A/B, retención/borrado y logs mínimos probados |
| 8 | Evidencias opcionales y pasaporte con alcance/revocación | P1 / alta | Compartir voluntario; QR opaco; adjuntar no significa certificar |
| 9 | Texto/voz equivalentes, lenguaje simple y accesibilidad | P1 / media | Completar con micrófono denegado, teclado/lector y teléfono de prueba |
| 10 | Calidad de IA, E2E, rendimiento y operación medidos | P1 / media-alta | Corpus etiquetado, controles de regresión y hardware objetivo documentado |

## Tres innovaciones diferenciadoras

1. **Entrevista adaptativa con trazabilidad y corrección.** Una pregunta útil y breve cuando falta información; cada propuesta muestra su origen. La IA propone y se abstiene; el trabajador revisa. Reduce atribuciones sin respaldo y hace visible el control.
2. **Compatibilidad explicable que termina en una acción viable.** Separar actividades compartidas, demanda y requisitos; proponer un curso/centro según tiempo, presupuesto y territorio, o reconocer ausencia de oferta. La salida valiosa es el siguiente paso comprobable.
3. **Pasaporte con respaldo y visibilidad controlados.** Distinguir declaración, material aportado, referencia y certificación externa validada. Vista previa exacta y publicación voluntaria; el QR verifica una publicación según su diseño, no certifica el oficio.

Se evaluaron las diez ideas del encargo y seis adicionales: corrección en cascada, derecho a no encajar en catálogo, modo acompañante, costo de oportunidad formativa, recibo de lo compartido y pausa segura en teléfono compartido. Comparación de impacto, originalidad, utilidad, viabilidad/QVAC, esfuerzo, plazo estimado, costo, riesgo y ventaja en [innovación](06_PROPUESTAS_INNOVACION.md). Las estimaciones no prometen un calendario ni novedad universal.

## Arquitectura técnica recomendada

Web móvil accesible → API Node con dominio modular → worker QVAC aislado y cola acotada → almacenamiento transaccional y evidencias privadas. Catálogos versionados alimentan recuperación y compatibilidad determinista; adaptadores independientes para fuentes públicas y futuras APIs autorizadas. Empezar simple, con contratos propios y un solo despliegue de negocio; separar el proceso de inferencia por recursos/fallos.

En web, la inferencia ocurre en backend: audio transmitido con TLS al entorno autorizado, procesamiento local allí y retención mínima. Offline parcial cubre interfaz/borrador/catálogos descargados, no inferencia del servidor ni ofertas actualizadas. Una futura app nativa se decide después de medir dispositivos físicos. QR sin datos personales embebidos, campos elegidos, expiración/revocación y emisor explícito. Detalle y modelo de datos en [arquitectura](07_ARQUITECTURA_PROPUESTA.md).

## Plan de implementación priorizado

| Hito | Alcance y puerta | Estimación condicionada |
|---|---|---|
| Prototipo del concurso | Un oficio/territorio, texto/voz, QVAC real, revisión, demanda y acción con fuente, resumen privado. Pruebas de errores y datos ficticios | 10–16 jornadas-persona agrupadas en ingeniería/datos/diseño/verificación; ventana oficial 26–29 oct exige paralelismo y capacidad real del equipo |
| MVP | Persistencia, autorización, evidencias privadas, compatibilidad, publicación revocable y pruebas de flujo/IA/accesibilidad | 4–6 semanas adicionales con capacidad definida; no incluye convenios |
| Producción | Integraciones autorizadas, evaluación legal, seguridad independiente, operación, carga y recuperación | 8–12 semanas técnicas adicionales; calendario institucional desconocido |

Son previsiones del auditor, no fechas garantizadas. Roles, dependencias y aceptación de 34 partidas en [backlog](11_BACKLOG_IMPLEMENTACION.md); puertas de salida y recortes en [roadmap](08_ROADMAP_DESARROLLO.md). No ejecutar desarrollo sin autorización expresa.

## Riesgos y bloqueadores

Hardware y concurrencia de destino sin definir; datos territoriales y ofertas incompletos; falsos positivos/omisiones y poca cobertura de catálogo; escasa investigación directa; privacidad de relatos/fotos/referentes y teléfonos compartidos; disponibilidad del equipo; autorización e identidad ministerial no confirmadas. La normativa peruana de datos y el posible tratamiento de IA en decisiones laborales requieren evaluación del uso real: orientar no equivale a seleccionar o filtrar trabajadores. Controles y fuentes en [seguridad e integraciones](04_AUDITORIA_SEGURIDAD.md).

Bloquea la demo afirmar funcionalidades ausentes. Bloquean datos reales la falta de límites de tratamiento, permisos y persistencia segura. Bloquea integración oficial la falta de acuerdo y pruebas del servicio autorizado. Es posible avanzar con investigación y prototipo ficticio sin fingir que esos bloqueadores están resueltos.

## Cumplimiento del concurso

Encaje conceptual alto, **cumplimiento funcional no demostrado**. Las bases verificadas requieren demanda territorial, primer paso realista y backend QVAC en el perímetro usuario/MTPE. El spike cumple una exploración tecnológica parcial; no prueba integración gubernamental ni flujo del público objetivo. Empleos Perú, estándares, EDO, certificación y CAPACITA-T son fuentes/servicios reales; no se halló documentación suficiente para afirmar APIs abiertas utilizables. No se concluye que no existan APIs internas.

El concurso no exige blockchain ni IA en el teléfono. Los criterios oficiales valoran tanto comprensión y viabilidad como un prototipo utilizable; añadir funciones sin datos no compensa esa brecha. Aclarar inconsistencias de inscripción y formatos con el organizador. Evidencia y estrategia en [concurso](10_RECOMENDACIONES_CONCURSO.md).

## Qué se comprobó y qué queda sin comprobar

Pasaron sintaxis JS/Python, regeneración de JSON/CSV en copia temporal y consulta de avisos npm sin hallazgos conocidos. Se recalculó WER sobre transcripciones guardadas; no se repitió inferencia. No se ejecutaron pruebas de producto, carga, accesibilidad, móvil, privacidad dinámica ni usabilidad. No hubo despliegue ni llamadas a APIs ministeriales autenticadas. El [plan de pruebas](09_PLAN_PRUEBAS.md) define esos controles pendientes y los escenarios exigidos.

## Decisión estratégica final

**Mantener el problema y el concepto; modificar sustancialmente validación, compatibilidad y credibilidad, y acotar el primer producto.** La evidencia apoya explorar comprensión local del relato y búsqueda de candidatos. No apoya convertir similitud, un sí del modelo o una foto en competencia oficialmente acreditada. La apuesta competitiva es que el trabajador pueda entender, corregir y usar lo que la herramienta propone para dar un siguiente paso realista.

Decisiones prioritarias del equipo: oficio/territorio y fuentes de demo; semántica de las afirmaciones; hardware/roles; alcance privado o compartible del pasaporte; condiciones del piloto y ruta de autorización ministerial. La auditoría deja propuestas revisables y criterios concretos, sin adoptar esas decisiones por el equipo.

## Documentos entregados

[01 Diagnóstico](01_DIAGNOSTICO_GENERAL.md) · [02 Técnica](02_AUDITORIA_TECNICA.md) · [03 IA/QVAC](03_AUDITORIA_IA_QVAC.md) · [04 Seguridad/integraciones](04_AUDITORIA_SEGURIDAD.md) · [05 Funcional/UX](05_AUDITORIA_FUNCIONAL_UX.md) · [06 Innovación](06_PROPUESTAS_INNOVACION.md) · [07 Arquitectura](07_ARQUITECTURA_PROPUESTA.md) · [08 Roadmap](08_ROADMAP_DESARROLLO.md) · [09 Pruebas](09_PLAN_PRUEBAS.md) · [10 Concurso](10_RECOMENDACIONES_CONCURSO.md) · [11 Backlog](11_BACKLOG_IMPLEMENTACION.md).
