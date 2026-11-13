# Auditoría del Plan de Proyecto: versión 0.7

Fecha: **22-10-2026, America/Lima**. Documento auditado: [PLAN_DE_PROYECTO.md, v0.7](https://github.com/ssntiagocalderon-creator/innovathon-tether/blob/3375c46825a77a4bbd4ee04dcd12b19892c3a61b/PLAN_DE_PROYECTO.md). Corte: `3375c46825a77a4bbd4ee04dcd12b19892c3a61b`. Todas las líneas citadas abajo corresponden a ese corte, anterior al registro documental de esta auditoría.

La revisión empezó con v0.5 (`278b119`) y se actualizó tras los commits concurrentes de v0.6/v0.7. **Se retiraron las observaciones ya resueltas:** referencias obligatorias y acceso a empleos reservado a certificados. D-029/D-030 ya permiten entrar sin referencias, mantienen los empleos abiertos, incorporan respuesta a comentarios, revisión humana y orden de llegada. No se atribuyen a la auditoría esas decisiones del usuario.

## Dictamen

**Mantener las dos partes aprobadas, pero no tratar todavía el plan como una especificación cerrada para implementar u operar la Red.** Hay mejoras claras de trazabilidad y rigor; los problemas restantes se concentran en reglas tributarias, significado de la reputación, acceso a oportunidades y ejecución del alcance.

La Red puede dar utilidad al pasaporte, pero introduce una plataforma de dos lados con contratación, reputación, datos de terceros y operación. Reutilizar QVAC no elimina ese trabajo. La recomendación es conservar la propuesta de **Mi pasaporte funcional y Red simulada y rotulada para el concurso**, y cerrar las reglas mínimas antes de convertir la Red en un piloto real. Esto es compatible con D-019, D-020, D-029 y D-030; no revoca ni adopta decisiones por el equipo.

**P1** identifica un ajuste importante antes de cerrar diseño o preparar el hito indicado. **P2** es una precisión o validación posterior que no impide el trabajo conceptual. Las condiciones antes de un piloto son puertas futuras; no se ha demostrado una explotación ni una infracción de una aplicación operativa. Complejidad baja/media/alta expresa esfuerzo relativo de especificación y validación, no tiempo prometido.

## Lo que está mejor y debe conservarse

- Voz y texto equivalentes; revisión de transcripción; propuestas con origen y corrección en cascada (líneas 223–225).
- Respaldo opcional, niveles por afirmación y pasaporte privado con vista previa (226, 234, 238–247).
- Demanda agregada separada de vacante y primer paso sujeto a oferta verificable (227–233).
- WER con método y resultado 8B tratado como hipótesis, sin declarar precisión general (482–510; D-010).
- Diferencia explícita entre integraciones simuladas y futuras autorizaciones (450); varias decisiones tienen autor y estado, sin implementar las pendientes.
- D-029/D-030 reemplazan el acceso por niveles anterior, permiten comenzar sin historial, distinguen referencias externas y evitan expulsión automática por una nota baja (299–332, 666–667).

No se cuenta como defecto del plan la ausencia actual de una app: Fase 0 y D-002 la explican. La pregunta auditada es si sus reglas, evidencias y compromisos son coherentes y suficientemente verificables.

## Hallazgos principales

### AP-01 · P1 · El filtro de RUC también excluye a postulantes a empleo dependiente

**Hecho:** la línea 283 exige RUC cuando publica una empresa o institución; 337 y D-022 (659) repiten la condición. El sistema distingue empleos en planilla (264), y 332 dice que los empleos están abiertos a todos. La condición tributaria del prestador independiente se está aplicando por tipo de publicador, sin distinguir el tipo de relación.

**Contraste:** [SUNAT, RUC del trabajador dependiente](https://personas.sunat.gob.pe/trabajador-dependiente/ruc), indica que quien percibe exclusivamente quinta categoría no necesita inscribirse en RUC. El plan podría excluir a una persona elegible antes de que conozca la vacante. No se afirma que ninguna persona asalariada pueda necesitar RUC por otras actividades.

**Acción recomendada:** conservar la formalización aprobada, separar empleo dependiente de servicio independiente y revisar la regla pendiente de D-022 antes de confirmarla. **Complejidad:** baja en especificación, media al validar ramas. **Aceptación:** una persona sin RUC puede recibir avisos y postular a una vacante en planilla que no lo requiera por otra razón legítima; los requisitos tributarios de un servicio se explican por la operación, no solo por quién publica.

### AP-02 · P1 · El recibo por honorarios se presenta como solución universal

**Hecho:** servicios puntuales, confección de uniformes y coordinación final desembocan en RHE (263, 272, 347); C-36 solo documenta cómo emitirlo. Ese folleto no determina qué comprobante corresponde a cada actividad.

**Contraste:** [SUNAT, cuarta categoría](https://personas.sunat.gob.pe/trabajador-independiente/rentas-cuarta-categoria) diferencia el oficio personal independiente de la actividad empresarial; [Ley del Impuesto a la Renta, arts. 28 y 33](https://www.sunat.gob.pe/legislacion/renta/ley/capv.pdf) distingue sus categorías. El ejemplo de uniformes no permite clasificar a Rosa sin saber si presta un servicio personal o produce/vende bienes como actividad empresarial. No se concluye que necesariamente sea tercera categoría.

**Acción:** sustituir el itinerario tributario único por orientación según empleo dependiente, servicio personal y actividad empresarial; derivar dudas a la fuente competente. No pedir Clave SOL ni emitir comprobantes por cuenta del usuario sin un proyecto y autorización específicos. **Complejidad:** media. **Aceptación:** el ejemplo de uniformes explicita la operación; no todos los servicios reciben automáticamente la indicación de emitir RHE ni se presenta obtener RUC como prueba de cumplimiento integral.

### AP-03 · P1; resolver antes de reseñas reales · La reputación promete más de lo que verifica

**Hecho:** 324 afirma que restringir reseñas al contratante elimina las reseñas falsas; 274 y 348 convierten la calificación en referencia de un trabajo real. La coordinación y el pago son externos (272). R21 (607) admite que siguen existiendo reseñas falsas o infladas. Ya están previstos respuesta y revisión humana: no se reportan ausentes.

**Riesgo concreto:** dos cuentas pueden registrar una contratación ficticia; una contratación puede cancelarse; una valoración de una interacción real puede ser falsa o abusiva. Autorizar al contratante a opinar no prueba ejecución, pago ni calidad técnica. El riesgo está en elevar un hecho no comprobado al historial, no en que se permita una opinión negativa.

**Acción:** conservar D-026/D-030 y separar contratación registrada, cancelación, finalización declarada/confirmada, controversia y opinión. Sustituir la garantía de ausencia de falsedad por una medida de reducción de abuso; identificar qué comprueba la plataforma. **Complejidad:** media/alta. **Aceptación:** cancelar no suma un trabajo completado; el contrato registrado no produce por sí solo una prestación autenticada; una rectificación cambia recuentos y referencias afectadas; la disputa tiene trazabilidad sin expulsión automática ni publicación innecesaria de pruebas personales. La [Ley 29733, arts. 8 y 20](https://www.minsa.gob.pe/Recursos/OGTI/SINADEF/Ley-29733.pdf) apoya calidad y rectificación de datos, sin convertir cualquier desacuerdo con una opinión en obligación de borrarla.

### AP-04 · P1 · La IA todavía influye en quién conoce una oportunidad

**Hecho:** la IA propone competencias del pedido (268); el aviso exige todas las competencias confirmadas (278–284). D-025 (662) atribuye a no ordenar candidatos la prevención de sesgos y decisiones automáticas. Sin embargo, una exigencia inventada en el pedido o una competencia omitida en el perfil del trabajador puede impedir la coincidencia antes de que el contratante elija. Omitir un requisito del pedido podría producir el fallo contrario: admitir coincidencias insuficientes. La revisión humana reduce el riesgo; no lo elimina.

La reutilización del traductor está pendiente en D-028 (665), y el plan reconoce que no se probó con pedidos (478). Describir experiencia propia y especificar lo que se necesita contratar son tareas distintas. El código del spike está instruido para extraer lo que realiza un trabajador (`spike-qvac/competencias_v2.mjs:47–50`).

**Acción:** conservar elección humana y orden aceptado; separar requisitos esenciales, deseables, alternativas y datos desconocidos. Añadir descubrimiento de oportunidades fuera del aviso automático y explicación/corrección del filtro. Si se confirma D-028, evaluar pedidos con etiquetas propias. **Complejidad:** media. **Aceptación:** un requisito deseable o no preguntado no excluye automáticamente; corregir una extracción recupera coincidencias; “busco quien corte; yo no corto” no se interpreta como habilidad del publicador; se pueden consultar oportunidades aunque no haya aviso. La eventual clasificación jurídica del sistema debe evaluar el circuito completo, no solo el algoritmo que ordena: [DS 115-2025-PCM](https://busquedas.elperuano.pe/dispositivo/NL/2436426-1), sin asignar aquí automáticamente riesgo alto.

### AP-05 · P1 · La definición de entrada todavía deja ambiguo el caso fuera de catálogo

**Hecho:** 236, 303 y D-030 (667) exigen una competencia confirmada. En cambio, 225 y D-011 (648) conservan lo no cubierto como actividad declarada; 280 admite avisos por esa actividad y 351 promete que Jhon entra. Si “competencia” se implementa como un ECL obligatorio, la persona sin ECL vuelve a quedar fuera pese a la intención aprobada.

**Acción:** precisar que una actividad confirmada por la persona, con o sin estándar oficial, puede satisfacer el requisito de entrada. Separar identidad, confirmación de declaración y certificación. El filtro “solo certificados” debe indicar qué competencia del pedido y qué vigencia evalúa; un certificado de un oficio no respalda otro.

**Complejidad:** baja. **Aceptación:** Jhon entra y puede recibir pedidos sin que se le asigne un ECL ajeno; no certificado puede explorar empleos; certificado A no se presenta como respaldo de B. Esto concreta D-011/D-030, sin restaurar los niveles de acceso que ya se descartaron.

### AP-06 · P1 · La demanda pública requiere un circuito distinto del privado

**Hecho:** 257 y D-024 (661) incluyen municipalidades en la demanda inicial; 271–272 presentan elección de postulantes y coordinación como flujo general. Un colegio puede ser público o privado: el caso no lo especifica. RUC no acredita por sí solo habilitación ni procedimiento para contratar con una entidad pública.

**Contraste:** [OECE, contratos menores](https://www.gob.pe/institucion/oece/pages/70088-gestionar-contratos-menores) documenta requerimientos, cotizaciones, evaluación, registro y requisitos según supuesto. Hay excepciones: no corresponde exigir universalmente RNP ni suponer que la Red reemplaza la contratación pública.

**Acción:** distinguir instituciones privadas de entidades contratantes públicas. En estas últimas, difusión y derivación al procedimiento aplicable, salvo integración institucional acordada. **Complejidad:** media/alta. **Aceptación:** el pedido municipal identifica responsable y circuito oficial; escoger por estrellas/pasaporte en la Red no se presenta como adjudicación suficiente. Para demostrar el flujo privado puede usarse una institución ficticia privada rotulada, sin atribuir un acuerdo real.

### AP-07 · P1 antes de colocación real · No ser empleador no descarta actividad de agencia

**Hecho:** 293, 381 y R18 (604) usan “conecta, no emplea” para delimitar el papel de la plataforma. El flujo incluye avisos dirigidos, postulaciones, selección e historial (268–274).

**Contraste:** el [DS 020-2012-TR, arts. 2.1 y 2.4](https://busquedas.elperuano.pe/dispositivo/NL/883943-12) contempla vinculación laboral privada sin formar parte de la relación de empleo y diferencia la mera difusión de avisos. Por ello, no ser empleador no basta para concluir que no hay actividad de agencia. El operador público del MTPE y uno privado del equipo no tienen por qué recibir el mismo tratamiento. Esta auditoría no determina automáticamente obligación de RENAPE.

**Acción:** definir quién operaría demo, piloto y producto institucional, qué actividades ejecutaría y qué régimen corresponde; mantener la cuestión como pendiente de clasificación. **Complejidad:** media, con dependencia institucional/jurídica. **Aceptación:** antes de colocación real existe una definición documentada del operador y alcance; los términos no prometen excluir responsabilidades únicamente por autodenominarse intermediario técnico. La simulación de concurso puede avanzar con su rótulo y sin contratación real.

### AP-08 · P1 · El calendario no tiene todavía una ruta de entrega verificable

**Hecho:** el alcance se cierra el 24 (552–553), pero 557–560 proponen backend mínimo, Parte 1 completa, toda la Red simulada, pruebas con usuarios y ensayo en días consecutivos. Los roles técnicos siguen por asignar (575–579). El corpus anunciado en 508 no tiene una tarea explícita en la preparación (529–539). El hardware disponible es el del experimento (480), no una capacidad de servicio; el ministerial sigue como pregunta (616).

No se afirma que ese calendario sea imposible. **No hay suficiente información para sostenerlo**: faltan responsables, dependencias, disponibilidad, equipo de demo, modelos provisionados y un recorte condicionado a fallos. Que las pantallas de la Red usen datos ficticios reduce integración, pero no elimina estados, navegación, permisos representados ni pruebas.

**Acción:** después del Open Day, según D-019, cerrar una matriz por flujo: real/simulado/pendiente, dueño, dependencia, criterio de aceptación y alternativa. Separar infraestructura ministerial futura de máquina concreta de demostración. **Complejidad:** media. **Aceptación:** antes del 26 se identifican los flujos que se pueden demostrar, los que se recortan y quién decide el recorte; constan modelo/versiones, carga, memoria observada, latencia, límite de concurrencia y comportamiento si falta QVAC. El corpus queda como tarea de evaluación con resultado esperado, sin confundir más relatos con validación suficiente.

### AP-09 · P1 · La corrección en cascada necesita límites frente al historial

**Hecho:** 224 y D-012 (649) retiran todo lo dependiente de una frase corregida. La Red introduce postulaciones, elecciones y referencias de trabajos (270–274), además de reputación histórica (306–310). El plan no distingue la versión actual de una afirmación del perfil compartido al postular ni del registro de un trabajo pasado.

**Riesgo:** corregir una frase podría borrar una referencia histórica, mantener una postulación sustentada en información retirada o alterar silenciosamente lo que el contratante había visto. Es una ambigüedad del dominio, no una pérdida de datos observada.

**Acción:** separar perfil actual, versión compartida y eventos de pedido/postulación/trabajo. Definir retirada, rectificación y conservación mínima según la finalidad; un snapshot no autoriza retención indefinida de datos retirados. **Complejidad:** media. **Aceptación:** una corrección cambia futuros avisos y propuestas, identifica las postulaciones afectadas y mantiene trazabilidad de cambios del historial sin cambiar automáticamente una opinión o inventar que el trabajo nunca ocurrió.

### AP-10 · P1 para demo; bloqueo antes de datos reales · Falta el mínimo de aceptación y privacidad del prototipo

**Hecho:** R11 (597) y 759–761 posponen recomendaciones de producción; la fase de desarrollo enumera entregas y usuarios, sin una lista mínima de comprobación. No se distingue qué se pospone legítimamente de qué necesita toda prueba con personas. Identidad pendiente (290), coordinación externa (272) y avisos que supuestamente no exponen a nadie (286) requieren un límite operativo si se usan fuera de una simulación.

**Acción:** conservar pendiente el sistema completo de producción, pero definir una puerta de demo pequeña. Con voluntarios, consentimiento y casos ficticios no equivalen a contratar un servicio real ni justifican exponer documentos/ubicaciones. Si se elige SMS (451), hay procesamiento por operadores/proveedores: preferir mensajes genéricos y documentar datos, finalidad y destinatarios. La ausencia de IA externa no significa ausencia de terceros en todas las comunicaciones.

**Complejidad:** media. **Aceptación demo:** texto con micrófono denegado, corrección, fuera de catálogo, oferta incompatible, rechazo a compartir, fallo QVAC y estados simulados comprobados como pasa/falla/no ejecutado. Demanda territorial y primer paso verificable siguen siendo salidas mínimas del reto aunque la Red sea simulada. **Antes de piloto:** divulgación gradual de contacto/ubicación, permisos por contraparte, datos mínimos y gestión de reportes; una postulación no revela automáticamente domicilio. Verificar identidad no garantiza seguridad física. Fuente: [Ley 29733, arts. 7, 9 y 18](https://www.minsa.gob.pe/Recursos/OGTI/SINADEF/Ley-29733.pdf); las medidas domiciliarias propuestas son criterios de producto, no obligaciones legales específicas inventadas.

### AP-11 · P1 antes de prometer tracción · La liquidez y la equidad siguen siendo hipótesis

**Hecho:** priorizar instituciones (257, D-024 y R12) y ordenar por llegada (328–330, R20) se presentan como mitigaciones. No se aporta validación de pedidos recurrentes, disposición a contratar o elección efectiva de personas nuevas. El plan reconoce correctamente ambos riesgos: lo pendiente es probar las mitigaciones.

**Riesgo delimitado:** orden de llegada puede favorecer conexiones rápidas y no asegura que el publicador revise a los nuevos; entrada libre de referencias no crea demanda. No se ha medido ninguno de esos efectos en este proyecto, ni se propone revocar el orden aceptado.

**Acción:** validar un oficio/territorio con demandantes y trabajadores; conservar el orden, pero mostrar todas las postulaciones dentro de plazo, pendientes de revisión y opción voluntaria de descubrir perfiles nuevos. Mantener Mi pasaporte y el primer paso útiles sin pedidos en la Red. **Complejidad:** media. **Aceptación:** una persona nueva que postula tarde dentro del plazo con red lenta aparece y puede ser encontrada; ningún corte oculto por estrellas; se registra demanda contrastada antes de afirmar ingresos o resolver el arranque en frío. Un escenario ficticio de Rosa no es evidencia de tracción.

### AP-12 · P1 para bocetos y alcance · La oferta no contiene aún condiciones suficientes para decidir

**Hecho:** 268 enumera zona, fechas, tipo y pago o “a convenir”; 278–284 cruzan competencias, identidad, zona, RUC y avisos. Las restricciones de tiempo/recursos se preguntan para formación (233), pero no se especifican para decidir si un servicio o empleo resulta viable. Tampoco se definen retirada de postulación, cancelación, no selección y cierre controvertido.

**Acción:** en la ficha y bocetos diferenciar tareas/resultado, dedicación u horario, traslado, materiales/herramientas, pago y condiciones conocidas o por acordar. No es necesario que todo sea obligatorio o conocido: sí debe verse lo que falta. Mantener acciones claras por rol en la misma cuenta, sin registros duplicados. **Complejidad:** media. **Aceptación:** antes de postular, la persona entiende servicio frente a empleo, quién aporta materiales, qué información comparte y qué falta acordar; puede retirar su candidatura; “a convenir” no se transforma en ingreso garantizado ni se clasifica automáticamente como compatible.

## Precisiones de evidencia y narrativa · P2

**Resultado de certificación:** C-32 identifica correctamente una declaración del MTPE sin metodología publicada; sin embargo, 153 concluye que el mecanismo funciona y 368 lo generaliza como evidencia de eficacia. La [nota oficial del MTPE](https://www.gob.pe/institucion/mtpe/noticias/1395698-mtpe-mas-de-4500-trabajadores-certificaron-sus-competencias-laborales) reporta inserción, pero no permite atribuir causalidad al certificado ni transferir ese resultado a la futura Red. Mantener el dato atribuido y su límite; validar por separado si referencias de la Red ayudan a la evaluación de cada centro. No demorar la derivación de una persona con experiencia suficiente solo para que acumule reputación.

**Cobertura del catálogo:** C-24 y 154 ya están formulados como indicio; el caso de Jhon en 351 vuelve a afirmar ausencia de su oficio como hecho. Usar de forma uniforme “no encontramos un estándar en este catálogo revisado” y conservar la ruta sin ECL. No cambiar la conclusión por un vecino semántico.

**Identificadores y vigencia:** no se encontraron decisiones/cifras duplicadas ni referencias `[C-xx]` sin fila al revisar la base inicial. Las filas sin cita en el cuerpo no son un error por sí solas: pueden servir como registro. La comprobación local de fechas del catálogo no encontró cambios de vigencia entre el 20 y el 22; no se reporta una cifra vencida sin evidencia. Para uso operativo debe seguir mostrándose fecha del snapshot.

## Decisiones propuestas para el equipo, sin adopción automática

| Momento | Acción propuesta | Responsable a asignar | Salida verificable |
|---|---|---|---|
| Antes de confirmar reglas de la Red | Separar empleo, servicio personal y actividad empresarial; precisar entrada sin ECL y filtro por certificación pertinente | Producto + validación tributaria/institucional | Tabla de ejemplos que resuelve AP-01/AP-02/AP-05; D-022/D-023 no se implementan mientras sigan pendientes |
| Cierre de alcance del 24 | Mantener ambas partes, fijar qué funciona y qué se simula; proteger demanda territorial y primer paso reales | Equipo + desarrollo + datos | Ruta de entrega, hardware y lista de pruebas de AP-08/AP-10 |
| Diseño de contratación/reputación | Definir estados, autoría, finalización, impugnación y rectificación; historial separado del perfil vigente | Producto + desarrollo + privacidad | Ejemplos y transiciones de AP-03/AP-09/AP-12 |
| Antes de piloto institucional | Definir operador, cliente público/privado, circuito de colocación y responsabilidad de datos | Enlace institucional + revisión competente | Clasificación y permisos de AP-06/AP-07/AP-10 |
| Antes de prometer efecto laboral | Probar pedidos, filtros, descubrimiento y participación de nuevos | Datos + investigación de usuarios | Experimentos de AP-04/AP-11 con resultados y límites, sin convertir simulación en prueba de mercado |

## Comprobaciones y límites de esta revisión

Se leyó el plan completo, su registro de decisiones, las diferencias de v0.5 a v0.7, las instrucciones actuales y la estructura del repositorio. Se contrastaron afirmaciones clave con fuentes oficiales de SUNAT, OECE, MTPE, normativa y evidencia anterior. No se repitieron pruebas de sintaxis o inferencia: no resolverían las contradicciones de un plan documental. No se accedió a audio real, credenciales, documentos de identidad ni expedientes de trabajadores; no hubo contacto con terceros, contratación, pentest o pruebas con usuarios.

Las bases del concurso ya habían sido descargadas y verificadas en la auditoría anterior. El visor web volvió a rechazar su apertura; no se afirma haber validado una edición nueva del PDF en esta revisión. MTPE rechazó la primera apertura web de su nota; se recuperó su contenido oficial por descarga directa y búsqueda del dominio. SUNAT y las páginas normativas indicadas fueron consultadas el 22-10-2026. La fuente histórica de informalidad permite describir una definición estadística; no sustituye las reglas tributarias, laborales o de contratación de cada caso.

Las referencias jurídicas identifican errores de generalización y condiciones a verificar, no certifican cumplimiento ni imponen automáticamente un régimen a un operador todavía no definido. Las aceptaciones son propuestas de ingeniería/producto, no pruebas ya aprobadas ni obligaciones del concurso inventadas.

**Conclusión:** el plan mejoró y la decisión de dos partes puede mantenerse. Antes de construir, necesita precisión en elegibilidad, formalización y estados de reputación, y una entrega con pruebas mínimas. Para el concurso, una Red bien explicada y simulada puede acompañar a un pasaporte útil; para operar trabajos reales, esas ambigüedades son bloqueadores que una maqueta o un disclaimer no resuelven.
