# Backlog priorizado de implementación

Fecha: 20-10-2026. Todas las tareas están **propuestas, sin iniciar por esta auditoría**. No autorizan modificación de código. Priorización por impacto, urgencia, esfuerzo, riesgo y dependencias; P0 se refiere a la puerta indicada, no a una vulnerabilidad explotada en un producto inexistente.

## Método

Impacto y riesgo: A alto, M medio, B bajo. Esfuerzo **relativo**, sin equivalencia numérica por tarea: S pequeño, M medio, L grande; partidas L requieren descomposición. Varias partidas comparten base, contratos y prueba; no se suman como entregas independientes. El presupuesto agrupado de demo y sus supuestos están en el roadmap, y las estimaciones incrementales de innovación presuponen bases ya disponibles. Asignar tiempos a cada tarea cuando se conozcan equipo, arquitectura y alcance. Estas tallas son juicio de ingeniería, no resultados medidos ni compromisos.

Roles propuestos: PROD producto/investigación; DEV ingeniería; DAT datos/catálogos; UX diseño/accesibilidad; QA pruebas; SEC seguridad/privacidad; INST enlace institucional. No son integrantes asignados: el equipo sigue pendiente de confirmación en el Plan original:280–290.

## Puerta A: demo útil y honesta

| ID | Prioridad / impacto-riesgo-esfuerzo | Acción y dueño | Dependencias | Criterio de aceptación |
|---|---|---|---|---|
| B01 | P0 / A-A-S | PROD+INST: cerrar alcance y reglas del concurso | Open Day | Oficio/territorio, roles, preparación reutilizable, formato y dudas registrados; dependencias sin confirmar marcadas |
| B02 | P0 / A-A-M | DAT: catálogo de demo versionado | B01 | ECL y perfiles distintos, vigencia a fecha, hash/fuente; casos cubierto y fuera de catálogo revisados |
| B03 | P0 / A-A-M | DEV: estructura producto y contratos | B01 | Interfaz/API/dominio/adaptador IA separados; arranque documentado en entorno limpio; spike preservado |
| B04 | P0 / A-A-M | DEV+UX: entrevista por texto y corrección | B03 | Crear/editar/rechazar, guardar sesión y retomar; completar sin micrófono; no exige datos innecesarios |
| B05 | P0 / A-A-M | DEV: backend QVAC y ciclo de trabajos | B03 | Versión/modelos fijados; inferencia real trazable sin relato en logs; timeout, cancelación y fallo de modelo probados |
| B06 | P0 / A-A-M | DEV+DAT: validación y confirmación | B02,B04,B05 | Código/cita/índices válidos, sin duplicados; nada autoaceptado; corrección invalida derivados; abstención explícita |
| B07 | P0 / A-A-M | DAT: demanda territorial y primer paso real | B01 | Fuente regional correcta con cobertura; curso/centro consultable con condiciones conocidas; faltantes visibles |
| B08 | P0 / A-A-M | DEV+DAT: compatibilidad explicada acotada | B06,B07 | Requisitos compartidos/pendientes y fuente separados; sin % de contratación ni mensaje de perfil completo |
| B09 | P0 / A-M-S | UX+DEV: resumen de pasaporte privado | B06 | Datos ficticios, estado de evidencia, sin aval estatal; funciona sin compartir ni QR público |
| B10 | P0 / A-A-M | QA+UX: probar recorrido y excepciones | B04–B09 | Casos de demo del plan de pruebas ejecutados y defectos críticos cerrados; evidencia y limitaciones registradas |
| B11 | P1 / A-M-M | DEV+UX: voz operativa | B04,B05 | Captura/permiso/regrabación/edición; micrófono denegado conduce a texto; audio no retenido por defecto |
| B12 | P1 / A-M-S | PROD+QA: ensayo y contingencia | B10 | Pitch cronometrado, QVAC real distinguido de grabación y simulación; fuentes abribles |

Si hay recorte, preservar B06/B07/B10 y el flujo por texto. La voz operativa está en el objetivo de prototipo del encargo: si B11 no está lista, declararla pendiente en la matriz, aunque exista transcripción CLI.

## Puerta B: datos reales y MVP multiusuario

| ID | Prioridad / impacto-riesgo-esfuerzo | Acción y dueño | Dependencias | Criterio de aceptación |
|---|---|---|---|---|
| B13 | P0 antes de datos reales / A-A-M | SEC+PROD: mapa de datos y gobierno | B01 | Responsable/encargados, finalidades, base aplicable, consentimiento, retención, derechos y flujos de borrado definidos |
| B14 | P0 antes de datos reales / A-A-L | DEV+SEC: identidad, aislamiento y almacenamiento | B03,B13 | Pruebas A/B deniegan lectura/escritura ajena; cifrado/gestión de claves, sesión y logs sin contenido personal |
| B15 | P1 / A-A-M | DEV: persistencia y recuperación | B14 | Recarga/reinicio sin pérdida; migraciones e idempotencia; restaurar copia de ensayo con objetos consistentes |
| B16 | P1 / A-A-L | DEV+SEC: evidencia privada | B14,B15 | Validar tamaño/tipo/contenido, quitar EXIF, aislar, borrar y revisar; adjunto no crea certificación |
| B17 | P1 / A-A-L | DEV+SEC+UX: publicar y revocar pasaporte | B06,B14,B16 | Vista previa exacta, consentimiento separado, token opaco, expiración y revocación probados; sin campos ocultos en payload |
| B18 | P1 / A-A-M | DAT: mapeo ocupacional y ofertas mantenibles | B02,B07 | Relaciones curadas CNO/CIUO/perfil/ECL con procedencia; requisitos/fecha de curso/vacante verificables y política de frescura |
| B19 | P1 / A-A-M | QA+DAT: corpus y calidad de IA | B05,B06 | Conjunto separado de desarrollo/evaluación con etiquetas revisadas; WER, precisión, abstención y errores por oficio publicados |
| B20 | P1 / A-M-M | DEV+QA: CI y pruebas de dominio/contratos/E2E | B03,B10 | CI falla por regresión crítica; grupo con QVAC real distinguido de dobles; ningún secreto/dato real en fixtures |
| B21 | P1 / A-A-M | UX+QA: accesibilidad y usabilidad | B04,B08,B17 | Recorrido teclado/lector/móvil revisado; usuarios entienden declaración vs certificación y pueden corregir/revocar |
| B22 | P1 / A-M-M | DEV+QA: recursos y rendimiento | B05 | Medidas frío/caliente, memoria, cola y cancelación en equipo de destino; límites y objetivos aceptados |
| B23 | P1 / A-A-L | DEV+SEC: offline parcial y sincronización | B13–B15 | Borrador optativo protegido, límites claros, conflictos e idempotencia; reconexión nunca publica sola |
| B24 | P1 / A-A-M | SEC+DEV: dependencias y modelos | B05 | SBOM, licencias, fuentes/checksums, versiones y rollback; validar transporte/artefactos y no confundir npm audit con auditoría completa |
| B25 | P2 / M-A-L | PROD+SEC: referencias de terceros | B13,B16,B17 | Identidad/método y consentimiento del referente, abuso/retirada, sin ascenso automático ni difusión de datos ajenos |
| B26 | P2 / M-M-M | DEV+UX: avance personal | B15,B18 | Eventos comprensibles, corrección y eliminación; avisos opcionales y sin ranking personal de confiabilidad |

## Puerta C: piloto institucional y producción

| ID | Prioridad / impacto-riesgo-esfuerzo | Acción y dueño | Dependencias | Criterio de aceptación |
|---|---|---|---|---|
| B27 | P0 para integración oficial / A-A-externo | INST+SEC: acuerdo e infraestructura MTPE | B13,B18 | Contrato de servicio/datos/identidad autorizado y entorno documentado; no usar logos/SSO como prueba de integración |
| B28 | P1 / A-A-L | DEV+INST: adaptadores oficiales | B27 | Contratos, autenticación, cuotas y fallback probados en sandbox autorizado; sin endpoints inferidos |
| B29 | P0 para producción / A-A-L | SEC+QA: revisión independiente | B14–B24 | Evaluación legal de datos/IA y seguridad del contexto, amenazas y hallazgos críticos resueltos; responsable acepta riesgo residual |
| B30 | P1 / A-A-L | DEV+QA: operación y recuperación | B15,B22,B24 | Monitoreo sin datos personales, alertas, runbooks, rollback y restauración medidos; SLO/RPO/RTO acordados y probados |
| B31 | P1 / A-A-M | DAT+PROD: mantenimiento de fuentes y soporte | B18,B27 | Dueño y frecuencia de revisión; detectar cambios, cursos vencidos, retiro de enlace y reclamos de corrección |
| B32 | P2 / M-M-L | DAT+DEV: transferibilidad y microevaluaciones | B19,B21 | Rúbricas curadas por oficio; evaluar utilidad y falsos positivos; ninguna equivalencia/certificación automática |
| B33 | P3 / M-A-L | DEV+QA: app nativa / inferencia móvil | B19,B22 | QVAC en dispositivo físico, memoria/batería/descarga medidas; beneficio frente a web que justifique mantenimiento |
| B34 | P3 / M-A-externo | INST+SEC: credencial oficial o analítica institucional | B27,B29 | Emisor, autorización, minimización/reidentificación y revocación definidos; no derivar de firma propia un aval público |

`externo` no significa cero trabajo: la duración depende de aprobación ajena y no puede estimarse desde el repositorio. Esas tareas no bloquean la demo curada, sí cualquier afirmación de integración oficial.

## Orden, riesgos y seguimiento

Camino crítico de demo: B01 → B03/B02/B07 → B04/B05 → B06 → B08/B09 → B10 → B12. DAT puede preparar B02/B07 en paralelo con ingeniería; UX debe probar lenguaje antes de cerrar pantallas. La disponibilidad del hardware es dependencia de B05; sin él no se afirma QVAC demostrado.

Camino crítico para uso real: B13 → B14 → B15 → B16/B17, con B19–B24 como puertas de calidad. El cronograma no adelanta datos reales por presión de la demo. Gobierno y contratos públicos pueden desarrollarse en paralelo al MVP, pero no se suponen resueltos.

Cada tarea aceptada requiere dueño, alcance, commit/versión, evidencia de prueba y actualización del Plan. No cerrar una tarea por tener una maqueta o porque el SDK ofrezca una función. Mover a diferido las que dependan de APIs no autorizadas; eliminar por diseño asignación automática de competencias, falsa certificación, biometría innecesaria y blockchain sin caso de uso.

Ver fundamentos en [diagnóstico](01_DIAGNOSTICO_GENERAL.md), [IA](03_AUDITORIA_IA_QVAC.md), [seguridad](04_AUDITORIA_SEGURIDAD.md) y [UX](05_AUDITORIA_FUNCIONAL_UX.md). La priorización se revisa tras el Open Day y después de cada evaluación con usuarios, preservando los criterios de honestidad y privacidad.
