# Diagnóstico general de Pasaporte de Oficio

Fecha: 20-10-2026, zona America/Lima. Repositorio privado: `ssntiagocalderon-creator/innovathon-tether`. Corte auditado: `c24523f1bee8a64a21a8a1d2a9bdeee128415c69`, rama `main`; el SHA de GitHub coincidió con el checkout. Estado inicial limpio. Las referencias al Plan describen su versión 0.1 en ese corte; la actualización documental posterior no cambia la evidencia original.

Durante la revisión, un proceso concurrente creó `1248b91cb4d417c6c8402b19e37f632eccdd766b`, actualizó el Plan a 0.2 e incorporó dos resultados 8B y parte de los documentos de auditoría en redacción. Esta auditoría no ejecutó ese commit ni esas inferencias y preservó sus cambios. El complemento 8B se distingue del corte inicial en [IA/QVAC](03_AUDITORIA_IA_QVAC.md); no se interpreta como validación controlada ni como ausencia de errores. La actualización del Plan que acompaña el cierre de auditoría es documental y conserva esa versión concurrente.

## Dictamen

**Es una preparación de proyecto con experimentos reales de IA, todavía no una aplicación.** Conviene conservar el problema, el público y la orientación hacia certificación, y modificar significativamente el mecanismo que convierte relatos en competencias y la forma de comunicar confianza. No hay fundamento para declarar un prototipo navegable, un MVP funcional ni preparación para producción.

Hechos: [README](../../README.md):26–34 distingue los datos del spike desechable; [package.json](../../spike-qvac/package.json):6–15 solo contiene el test de ejemplo y QVAC. El inventario versionado contiene documentación, fuentes, dos scripts Python, cuatro scripts JavaScript y resultados. No contiene interfaz, servidor HTTP, esquema de usuarios, autenticación ni despliegue. [Plan original](../../PLAN_DE_PROYECTO.md):8 ya reconoce Fase 0. **La ausencia de esos módulos es trabajo pendiente, no una regresión ni una vulnerabilidad explotada demostrada.**

## Método y límites

- Inspección del inventario completo, scripts, configuración, lockfile, datos derivados, resultados y plan. Metadatos y SHA contrastados con GitHub por `gh`.
- Comprobaciones no destructivas y revisión de artefactos; resultados exactos en [auditoría técnica](02_AUDITORIA_TECNICA.md), [IA](03_AUDITORIA_IA_QVAC.md) y [seguridad](04_AUDITORIA_SEGURIDAD.md). No se modificó código, fuentes oficiales ni archivos procesados.
- Bases descargadas desde ULima y leídas mediante PDFKit. Documentación QVAC, normativa y servicios públicos contrastados con fuentes primarias, con las limitaciones registradas en cada documento.
- No se ejecutó una aplicación inexistente, no se inspeccionó un despliegue y no se repitió la inferencia sobre los audios. Latencia histórica no equivale a rendimiento verificado durante esta auditoría. No hubo prueba con trabajadores ni dispositivos modestos.
- **Hecho**: inspeccionado o medido en esta auditoría. **Resultado histórico**: guardado por el proyecto, sin repetición del experimento. **Hipótesis**: explicación o efecto pendiente de comprobar. **Recomendación**: diseño o trabajo propuesto; no implementado ni aprobado como decisión de producto.

## Estado real por capacidad

| Capacidad | Estado comprobado | Evidencia / límite |
|---|---|---|
| Fuentes MTPE y transformación XLSX | Real, reproducible como proceso de preparación | `datos/scripts/matriz_a_json.py`:7–12,29–77; vigencia fija a una fecha |
| Transcripción QVAC | Implementada en CLI, con resultados históricos | `spike-qvac/voz.mjs`:24–58; dos guiones sintéticos |
| Extracción de actividades y búsqueda semántica | Implementada en CLI | `competencias.mjs`:64–96; faltan evaluación representativa y validación de citas |
| Asignación de competencias | Experimental e insuficiente | `competencias_v2.mjs`:69–98; la respuesta del modelo decide, no el usuario |
| Cercanía ocupacional | Cálculo experimental parcial | `competencias.mjs`:122–146; cuenta estándares, no requisitos de vacantes |
| Entrevista adaptativa, edición y confirmación | Ausentes como producto | Solo propuestas en Plan original:139–146 |
| Evidencias, referencias, QR y pasaporte | Ausentes | Plan original:143,146,195 los plantea o deja pendientes |
| Demanda territorial, vacantes y cursos | Sin conector ni catálogo operativo | Plan original:199–207; EDO nacional es PDF, no bolsa de vacantes |
| Usuarios, recuperación, sincronización y privacidad operativa | Ausentes | No hay modelo transaccional ni flujo de consentimiento |
| UX móvil, accesibilidad y offline | Sin implementación verificable | No hay pantallas ni service worker del producto |

No se encontró una interfaz que simule estas funciones. Las simulaciones comprobadas son **personas y audios sintéticos declarados**, no una app de demostración.

## Calificación por categoría

Escala de juicio auditor sobre evidencia actual: 0 = sin implementación/evidencia; 5 = capacidad parcial con validación limitada; 10 = capacidad completa y validada para su alcance. No son notas del jurado, porcentajes de avance ni mediciones estadísticas. Una buena intención no puntúa como control operativo.

| Categoría | /10 | Justificación |
|---|---:|---|
| Comprensión del problema y encaje conceptual | 7 | Público y necesidad delimitados; falta investigación directa que pruebe los supuestos |
| Calidad y gobierno de datos | 5 | Fuentes y conversión disponibles; vigencia congelada, cobertura y cruces ocupacionales pendientes |
| Ingeniería y mantenibilidad del producto | 2 | Spike legible, sin separación de capas de producto ni entrega reproducible del servicio |
| IA y QVAC | 4 | Uso real del SDK; errores semánticos y evaluación muy pequeña |
| Funcionalidad integral | 1 | Experimento parcial; ningún recorrido completo del trabajador |
| Seguridad y privacidad operativa | 2 | Principios expresos, sin controles de producto; resultados en claro |
| UX y accesibilidad | 1 | Intención pertinente, sin interfaz ni prueba con usuarios |
| Integraciones y recomendaciones | 1 | Fuentes identificadas; ninguna integración operativa ni oferta territorial |
| Pruebas y rendimiento | 2 | Resultados históricos útiles; sin suite de producto ni benchmark representativo |
| Preparación demostrable para el concurso | 3 | Investigación y spike ayudan; falta prototipo interactivo y evidencia territorial |

No se calcula una media: mezclar calidad conceptual con preparación operativa ocultaría los bloqueadores.

## Prioridades del dictamen

| Prioridad | Acción | Complejidad | Criterio de aceptación |
|---|---|---|---|
| P0 antes de demo | Construir un único recorrido completo y corregible | Alta | Texto/voz → propuestas trazables → confirmación → ocupación → primer paso → resumen; errores recuperables |
| P0 antes de presentar competencias | Sustituir la decisión de IA por propuestas revisables y abstención | Media | Ninguna competencia aceptada sin acción explícita del usuario; sin coincidencia no significa inexistencia oficial |
| P0 antes de usar datos reales | Definir límites de tratamiento, acceso, borrado y registro seguro | Alta | Consentimientos separados, aislamiento entre usuarios y relato ausente de logs |
| P0 para afirmar encaje territorial | Preparar fuentes regionales y una oferta formativa comprobable | Media | Fuente, cobertura, fecha y restricciones visibles; cero vacantes/cursos inventados |
| P1 | Persistencia, evidencias y pasaporte revocable | Alta | Recuperación probada; compartir solo campos elegidos y revocar acceso |
| P1 | Evaluación de IA, accesibilidad y pruebas del flujo | Media | Umbrales explícitos, errores por oficio y pruebas reales registradas |

P0 depende del contexto indicado: no impide seguir investigando con material ficticio. El [backlog](11_BACKLOG_IMPLEMENTACION.md) descompone estas acciones y sus dependencias; el [resumen ejecutivo](RESUMEN_EJECUTIVO.md) reúne los diez problemas y diez mejoras principales.

## Hipótesis que no deben convertirse en promesas

La voz puede reducir fricción, pero no se ha probado con el público objetivo. La confirmación humana puede reducir asignaciones erróneas, pero un usuario puede aceptar una pregunta confusa. Más parámetros de modelo podrían ayudar, pero no sustituyen un catálogo adecuado. Un QR puede facilitar la consulta, pero no acredita identidad, autoría de una foto ni competencia. La similitud semántica tampoco demuestra que una ocupación sea accesible, rentable o demandada en una localidad.

La decisión recomendada es **mantener la propuesta y rediseñar su núcleo de confianza y recomendación**, con alcance acotado para el concurso. La [arquitectura](07_ARQUITECTURA_PROPUESTA.md), el [roadmap](08_ROADMAP_DESARROLLO.md) y el [plan de pruebas](09_PLAN_PRUEBAS.md) son propuestas de ejecución posterior, no funcionalidades añadidas por esta auditoría.
