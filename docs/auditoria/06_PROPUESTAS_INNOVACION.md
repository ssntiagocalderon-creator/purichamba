# Propuestas de innovación para Pasaporte de Oficio

Fecha de corte: **20-10-2026**. Documento de recomendaciones; ninguna idea se declara implementada. La inspección encontró datos y un spike QVAC por consola, no aplicación (`README.md:26–34`; `spike-qvac/package.json:6–15`). Las innovaciones deben ayudar al trabajador a reconocer actividades, presentarlas con honestidad y elegir un primer paso realizable.

## Evidencia que condiciona la innovación

| Hecho verificado | Implicación para decidir |
|---|---|
| El spike ya llama transcripción, completado estructurado y búsqueda semántica local (`spike-qvac/competencias.mjs:58–89`). | Hay base para probar una entrevista y recuperar candidatos. No demuestra aún entrevista adaptativa, funcionamiento móvil ni exactitud general. |
| El resultado guardado para Rosa contiene perfiles de corta/silvicultura (`spike-qvac/resultados/rosa-QWEN3_4B_INST_Q4_K_M.json:1236–1251`). El plan reconoce falsos positivos (`PLAN_DE_PROYECTO.md:223–234`). | La diferenciación debe incluir abstención, trazabilidad y control humano. Un modelo mayor no sustituye la evaluación. |
| La “confirmación” es un juicio del modelo, no una acción del trabajador (`spike-qvac/competencias.mjs:105–119`). | Antes de añadir funciones, implementar el control previsto en D-004 (`PLAN_DE_PROYECTO.md:332`). Confirmar una declaración tampoco autentica la competencia. |
| La cercanía cuenta estándares por perfil (`spike-qvac/competencias.mjs:122–146`). | No presentar un conteo como empleabilidad ni como probabilidad. Hay que explicar requisitos esenciales y datos faltantes. |
| Demanda regional y centros siguen pendientes (`PLAN_DE_PROYECTO.md:203–207`); el pasaporte no tiene verificador (`:146`, `:195`). | Una recomendación depende de datos; la firma estatal depende de autorización. Son bloqueadores que deben verse en la demo. |
| D-002 reserva el producto para el concurso y el equipo (`PLAN_DE_PROYECTO.md:330`). | Esta auditoría prepara decisiones; no adelanta implementación ni modifica el alcance aprobado. |

**Hipótesis de producto:** el valor diferencial puede surgir de mostrar por qué se propone una habilidad, reconocer cuando no hay cobertura y orientar con restricciones reales. Falta comprobar con trabajadores y empleadores que esto aumenta comprensión, confianza y acción. No se realizó un estudio de patentes ni de originalidad mundial; “originalidad” indica diferenciación relativa al alcance actual y al concurso, como juicio técnico.

## Método de evaluación y estimaciones

Impacto, originalidad, utilidad, viabilidad y ventaja competitiva se califican **alto/medio/bajo**: son valoraciones del auditor, no métricas observadas. Riesgo considera error de orientación, privacidad, fraude, dependencia de terceros y sobrecarga. Coste es relativo dentro del proyecto: desarrollo, curación de datos, operación y pruebas; no un presupuesto monetario.

Estimaciones propias **IN-E1**, no plazos prometidos: S = 1–2 jornadas de una persona; M = 3–5; L = 6–10; XL = más de 10. Insumos: una persona con experiencia, jornada efectiva dedicada y frontend/backend/persistencia básicos ya disponibles; incluyen una versión acotada y sus pruebas, excluyen esperas de convenios, investigación extensa y certificación de seguridad. Se estima contando actividades de diseño, lógica, interfaz, datos y prueba; cada jornada cubre un bloque pequeño de trabajo. Las bandas son incertidumbre, no resultados del repositorio. Hoy esas bases faltan, por lo que **no se suman estas bandas para prometer una fecha**; funciones comparten trabajo. Reestimar con el equipo después del Open Day. Los identificadores IN-E y las valoraciones se limitan a la auditoría; no cambian el plan maestro.

QVAC se evalúa por el papel propuesto: **base observada** significa que el SDK ya se usa en el spike para esa operación; **pendiente** requiere validación del runtime/modelo/dispositivo; **sin IA** significa reglas de producto, sin necesidad de atribuirlas a QVAC. No se presupone soporte de navegadores, lenguas ni verificación biométrica.

## Evaluación de las diez ideas solicitadas

| ID / idea | Impacto / originalidad / utilidad | Ventaja y alcance útil para trabajador | Viabilidad / QVAC | Complejidad / tiempo IN-E1 / coste | Riesgos y prioridad |
|---|---|---|---|---|---|
| I01. Entrevistador adaptativo | Alto / medio / alto | Ayuda a quien no sabe nombrar su trabajo. Diferencia una conversación breve de un formulario largo. | Alta si se acota por oficio: transcribir/extractar tiene base observada; selección de pregunta pendiente. Plantillas revisadas + propuesta local limitada. | Media / M / medio | Preguntas sugestivas, fatiga y alucinación. P1; hacer primero texto/voz, revisión y preguntas deterministas. |
| I02. Microevaluaciones prácticas | Alto / medio / alto | Permite reflexionar con situaciones concretas y detectar qué conviene practicar. | Media: rúbricas de especialista; QVAC puede redactar variaciones, pero no debe certificar ni juzgar destreza física sin validación. | Alta / L por oficio / alto | Falsa sensación de evaluación oficial, sesgo y seguridad ocupacional. P2; simular casos inocuos, sin pedir maniobras peligrosas ni usarlo como requisito de empleo. |
| I03. Compatibilidad explicable | Alto / medio / alto | Muestra actividades compartidas, requisitos esenciales y lo que falta conocer; permite decidir y corregir. | Alta con catálogo acotado y relaciones revisadas. QVAC recupera candidatos; ranking y explicación trazable se calculan sin IA. | Media / M con datos curados / medio | Sesgo del catálogo, falsa precisión y demanda desactualizada. P1; no depender de vacantes inexistentes ni usar similitud como probabilidad. |
| I04. Ruta de aprendizaje por restricciones | Alto / medio / alto | Evita recomendar un curso incompatible con horario, presupuesto o desplazamiento. La salida es una acción comprobable. | Media/alta si existen ofertas vigentes. Filtros sin IA; QVAC solo explica en lenguaje sencillo. | Media / M más curación / medio | Datos de costo/horario incompletos, enlaces vencidos, asumir recursos. P1; abstenerse si no hay alternativa compatible. |
| I05. Verificación progresiva | Alto / medio / alto | Un empleador distingue declaración y respaldo, y el trabajador sabe cómo mejorar credibilidad. | Alta para estados y trazabilidad sin IA; verificación externa es pendiente y requiere proceso. QVAC no autentica evidencia. | Media / M para niveles, L para referentes / medio–alto | Confundir adjunto o referencia con prueba auténtica. P1 para niveles; P2 para referencias verificadas. |
| I06. Asistente de empleabilidad | Medio / bajo / medio–alto | Explica vacantes y ayuda a presentar experiencia en lenguaje claro. | Media: completado tiene base observada; acceso a vacantes y protección contra instrucciones hostiles pendientes. | Media / M / medio | Inventar experiencia o requisitos, dependencia del chat y prompt injection. P2; usar solo perfil confirmado y conservar fuente. |
| I07. Arquitectura offline-first | Alto / medio / alto | Tolerar interrupciones evita repetir un relato y perder avances. | Alta para captura/borrador protegido; inferencia en cada móvil no probada. QVAC local en servidor no hace offline al navegador. | Alta / L; inferencia móvil XL / alto | Datos en teléfono compartido, sincronización, almacenamiento/modelos pesados. P1 para reanudación; P3 para inferencia móvil amplia. |
| I08. Competencias transferibles | Alto / alto / alto | Descubre caminos afines sin encerrar al trabajador en el nombre de su empleo anterior. | Media: exige relaciones curadas, distinguir actividad transferible de equivalencia de oficio. QVAC recupera; reglas validan. | Alta / L / alto | Derivar a oficios lejanos por vocabulario común; sesgo ocupacional. P2 tras evaluar I03; nunca forzar un “puente”. |
| I09. Seguimiento de progreso | Medio / bajo / alto | Hace visible qué corrigió, documentó o aprendió y qué acción tiene pendiente. | Alta: eventos y estado sin IA; QVAC opcional para resumen. | Media / M / medio | Recordatorios invasivos, acumular datos y convertir actividad en puntuación personal. P2; avisos voluntarios y borrado. |
| I10. Pasaporte verificable | Alto / medio–alto / alto | Perfil portable con procedencia y control de lo que se muestra. | Alta para un enlace del propio prototipo; firma del MTPE/API oficial pendiente. Sin IA para integridad, caducidad y revocación. | Alta / L; integración oficial XL / alto | Suplantación, copia, QR público, inferir aval estatal. P1 para vista privada; P2 para enlace real seguro; P3 para credencial oficial. |

## Seis propuestas adicionales propias

Son propuestas adicionales para esta solución, no afirmaciones de invención universal. Algunas materializan salvaguardas de las ideas anteriores; se evalúan por separado para hacer explícito su coste y su utilidad.

| ID / idea propia | Impacto / originalidad / utilidad | Ventaja y comportamiento concreto | Viabilidad / QVAC | Complejidad / tiempo IN-E1 / coste | Riesgos, prioridad y aceptación |
|---|---|---|---|---|---|
| I11. Trazabilidad del relato y corrección en cascada | Alto / alto / alto | Al tocar una habilidad se ve la frase y actividad que la originaron. Corregir la frase retira propuestas, compatibilidades y pasaporte que dependían de ella. | Alta: IDs y dependencias sin IA; extracción local con base observada. No exige mostrar razonamiento interno del modelo. | Media / M / medio | Una cita textual puede contener datos ajenos. P1. Aceptación: al borrar/corregir la fuente no queda ninguna afirmación derivada activa; en compartir se oculta la cita si contiene datos no autorizados. |
| I12. Mapa de cobertura y derecho a no encajar | Alto / alto / alto | Mantiene un espacio para lo que la persona sabe y el catálogo aún no describe. Muestra “sin estándar encontrado”, sin fabricar equivalencias. | Alta para un estado explícito; detección automática precisa pendiente. QVAC propone, reglas y revisión permiten abstenerse. | Media / M / medio | Interpretar ausencia de coincidencia como ausencia absoluta en la normativa. P1. Aceptación: “no encontrado en este catálogo/versionado”, fuente visible y actividad conservada; puente solo exploratorio. |
| I13. Modo acompañante con control del titular | Alto / alto / alto | Un orientador ayuda a manejar la pantalla; la persona decide qué declarar y compartir. Sesión de apoyo con cierre y separación de datos. | Media: roles y permisos sin IA; QVAC igual que en sesión individual. | Alta / L / alto | Coacción, suplantación, acceso del acompañante tras terminar. P2. Aceptación: acompañante no publica ni modifica declaración sin confirmación del titular; cierre revoca acceso. |
| I14. Simulador de costo de oportunidad formativa | Alto / alto / alto | “Este curso ocupa estos horarios y este traslado; ¿es compatible con tu trabajo?”. Compara alternativas con datos elegidos por la persona; no estima ingresos sin insumos. | Alta para cálculo transparente si los datos de curso existen. Sin IA; explicación opcional con QVAC. | Media / M / medio | Inferir salario o vender una falsa optimización. P2. Aceptación: se ven insumos y cálculo; ingresos son opcionales; sin dato no se inventa una cifra ni se decide por la persona. |
| I15. Recibo visual de lo compartido | Alto / alto / alto | Antes y después de compartir, muestra exactamente campos visibles, destinatario si existe, vencimiento y cómo revocar. Dos vistas: “lo que guardas” y “lo que verá un empleador”. | Alta: control de campos sin IA. QVAC no tiene que recibir datos del destinatario ni generar permisos. | Media / M / medio | El destinatario puede guardar una copia; revocación no la elimina. P1 si existe enlace. Aceptación: prueba negativa de campos ocultos y enlace revocado; informar límites de PDF/capturas. |
| I16. Pausa segura en un teléfono compartido | Alto / medio–alto / alto | “Terminar y ocultar mis datos” limpia la vista y ofrece conservar un borrador protegido o eliminarlo. Reanudar no muestra el relato en pantalla de inicio. | Media: almacenamiento, claves y bloqueo deben diseñarse con seguridad. Sin IA; no se presume cifrado por usar QVAC. | Alta / L / alto | Claves perdidas, copia en caché, usar un PIN débil como cifrado suficiente. P1 para salida segura; P2 para recuperación avanzada. Aceptación: la siguiente persona no puede acceder al borrador ni al historial desde UI, cachés o enlaces sin autorización. |

## Las tres innovaciones elegidas

La selección se hace por impacto, riesgo controlable y posibilidad de demostración honesta con un alcance pequeño. Agrupa capacidades relacionadas; **no son tres productos separados**. Condición común: primero existen el flujo, el manejo de errores y un conjunto de datos revisado. Implementarlas sigue sujeto a autorización de desarrollo y a la decisión del equipo.

### Selección A: entrevista adaptativa con trazabilidad y control humano

Combina I01 + I11 y usa I12 como salida segura. Aporta valor incluso con un catálogo incompleto: hace una pregunta útil en lugar de inventar una competencia. QVAC transcribe y propone actividades; un orquestador acotado selecciona preguntas de plantillas revisadas. El trabajador puede responder “no sé”, corregir o salir. La búsqueda restringe por contexto/oficio cuando haya evidencia, conserva otras actividades y se abstiene cuando no hay respaldo.

- **Prioridad:** P0 confirmar/corregir; P1 adaptación acotada. **Complejidad:** media, con evaluación de IA como dependencia.
- **Demo honesta:** un relato nuevo y una corrección que cambien una propuesta; enseñar la cita y el catálogo. No solo reproducir un JSON previamente guardado.
- **Aceptación:** ninguna propuesta se convierte sola en confirmación; ninguna cita inventada se presenta como literal; se elimina la relación al corregir su fuente; el caso sin estándar termina sin perfil ajeno impuesto; funciona enteramente por texto.
- **Riesgo residual:** confirmar por autoridad. Mitigar preguntas neutrales y probar comprensión; la decisión humana no hace verdadero un diagnóstico del modelo.

### Selección B: compatibilidad explicable que termina en un primer paso viable

Combina I03 + versión mínima de I04. Separa tres salidas: actividades compartidas, información de demanda en territorio y acción siguiente. No agrega todo en un porcentaje único. Un motor de reglas usa competencias confirmadas, requisitos revisados, ubicación elegida y restricciones voluntarias. QVAC apoya la búsqueda y el lenguaje; no calcula elegibilidad ni inventa oportunidades.

- **Prioridad:** P0 conseguir procedencia territorial y ofertas comprobables; P1 motor y explicación. **Complejidad:** media/alta por calidad de datos.
- **Demo honesta:** un territorio y oficios acotados, demanda agregada rotulada y una acción cuya fuente/horario/costo estén comprobados. Si se usa una vacante ficticia, señalarlo de forma visible y no contar esa parte como integración.
- **Aceptación:** cada recomendación explica requisitos compartidos, esenciales sin confirmar, brechas e información faltante; cada curso/certificación tiene fuente, fecha y condiciones conocidas; cambiar presupuesto/horario cambia la salida o produce “sin opción compatible”; no inventa cursos ni demanda regional.
- **Riesgo residual:** catálogos incompletos y datos vencidos. La ausencia de datos produce abstención, nunca “no tienes oportunidades”.

### Selección C: pasaporte con niveles de respaldo y control de visibilidad

Combina I05 + versión mínima de I10 + I15. La innovación consiste en comunicar límites y procedencia de cada afirmación. El pasaporte distingue: **declarada por la persona**, **con material adjunto, autenticidad no verificada**, **referencia recibida con método de identidad declarado**, y **certificación externa validada por un mecanismo identificable**. No es una escala automática: una foto no asciende a certificación ni un enlace demuestra que una referencia sea real.

- **Prioridad:** P0 semántica honesta y compartir desactivado por defecto; P1 vista previa privada; P2 enlace seguro; P3 firma/convenio estatal. **Complejidad:** media en demo privada, alta al compartir de verdad.
- **Demo honesta:** perfil ficticio, vista trabajador/empleador y controles de campos; QR solo si existe un verificador real del prototipo, rotulado como tal. No atribuir validación a gob.pe.
- **Aceptación:** ninguna afirmación se llama oficialmente certificada sin fuente verificable; la vista pública no incluye relato completo, DNI, dirección exacta ni datos de referentes; negar compartir permite seguir usando orientación; si se ofrece revocación, probarla; explicar que un documento ya descargado no se recupera.
- **Riesgo residual:** copia y suplantación. Un QR prueba acceso/integridad de una publicación según su diseño, no la verdad de una competencia ni la identidad laboral del portador.

## Alcance recomendado y descartes

| Horizonte | Construir o validar | Posponer / simplificar | Puerta de salida |
|---|---|---|---|
| Prototipo demostrable | Entrevista voz/texto, corrección, catálogo acotado, compatibilidad explicada, un primer paso con fuente, pasaporte privado ficticio. Captura de datos de evaluación sin personas identificables. | Chat abierto, todas las regiones/oficios, verificación biométrica, analítica estatal, app nativa, mercado laboral propio. | Flujo nuevo completo y errores manejados; QVAC demostrado en ejecución; simulaciones visibles; revisión del equipo y reglas del concurso. |
| MVP funcional | Persistencia segura, evidencias opcionales, reanudación, datos actualizados, automatización de pruebas y compartir revocable con control de campos. | Red de referentes a gran escala, diagnóstico universal, autenticación gubernamental sin acuerdo. | Criterios de funcionalidad, seguridad, accesibilidad y calidad de IA del plan de pruebas. |
| Piloto/producción | Integraciones autorizadas, investigación territorial y accesible, controles operativos, identidad y validación externa documentadas. | Prometer cobertura que los datos no sostienen. | Convenios, fuentes mantenibles, pruebas en dispositivos reales, respuesta a incidentes y operación estable. |

**Eliminar del planteamiento:** sellos de “certificado por IA”, puntuaciones personales de confiabilidad sin fundamento, rankings de trabajadores, inferencia de honestidad mediante voz/foto, blockchain/USDT añadidos solo por patrocinio y equivalencias automáticas ante cualquier vecino semántico. No resuelven los bloqueadores actuales y pueden degradar confianza, privacidad y viabilidad. Tether/QVAC ya cumple un papel técnico justificable sin introducir pagos ni registro público de datos laborales.

## Experimentos de validación propuestos

| Incertidumbre | Experimento posterior | Evidencia para decidir |
|---|---|---|
| La entrevista ayuda sin inducir aceptación | Comparar relato libre y preguntas acotadas, revisadas por un orientador; incluir errores deliberados de propuesta y varios oficios. | Correcciones detectadas, comprensión, preguntas innecesarias y actividades justificadas; no usar solo satisfacción. |
| Las razones aumentan confianza informada | Pedir explicar por qué se sugirió una ocupación, cuál requisito falta y si es una vacante abierta. | Confusión entre similitud, demanda y vacante; capacidad de corregir la propuesta. |
| El primer paso resulta realizable | Revisar fuentes/condiciones y pedir al trabajador evaluar horario, traslado y costo sin asumir sus ingresos. | Opciones rechazadas por incompatibilidad y acciones realmente iniciadas; seguimiento voluntario. |
| Los niveles de evidencia se entienden | Mostrar versiones de pasaporte a trabajadores y empleadores, preguntar quién verificó cada afirmación. | Errores de interpretación y datos personales innecesarios solicitados. |
| La cobertura incompleta se comunica bien | Caso de oficio no cubierto y respuesta ambigua, con opción de mantener actividad sin estándar. | No degradar a la persona ni asignar oficio ajeno; conservar valor del relato. |

Las métricas, tamaños de muestra y umbrales se fijarán antes de ejecutar; no existen resultados de estos experimentos hoy. Las estimaciones deben revisarse con datos y capacidad real del equipo. La estrategia recomendada es **mantener el problema y el concepto, modificar de forma sustancial la mecánica de validación y reducir el alcance inicial**. La evidencia disponible apoya explorar extracción local y búsqueda; no respalda un certificador automático, una integración gubernamental ya disponible ni una aplicación terminada.
