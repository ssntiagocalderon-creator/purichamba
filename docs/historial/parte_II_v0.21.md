# Parte II del plan, versión 0.21 (archivo)

Texto completo de la Parte II del Plan de Proyecto tal como estaba en la versión 0.21 (24-10-2026), antes del reenfoque en las transiciones entre ocupaciones (D-037 y D-038). Se guarda sin cambios para consulta. Las decisiones siguen en el registro de decisiones del plan, y las referencias a secciones usan la numeración de esa versión.

---

## Parte II. La solución (v0.21)

## 4. La solución en una página

### 4.1 Las dos partes

| | Parte 1: Mi pasaporte | Parte 2: Red de oportunidades |
|---|---|---|
| **Para quién** | El trabajador | Quien necesita un servicio o personal: personas, empresas e instituciones |
| **Qué resuelve** | Nombrar, respaldar y certificar lo que sabe hacer | Conseguir trabajo hoy, mientras avanza |
| **Qué hace la IA** | Traduce el relato a competencias oficiales; la persona confirma | Traduce el pedido a competencias oficiales; quien publica confirma |
| **Resultado** | Un pasaporte con niveles de respaldo | Trabajos hechos y calificados, que vuelven al pasaporte como referencias |

### 4.2 El círculo virtuoso

```
Mi pasaporte ──► acceso a la Red ──► trabajos ──► calificaciones
     ▲                                                  │
     │                                                  ▼
mejores oportunidades ◄── certificación ◄── referencias en el pasaporte
```

Cada vuelta deja algo que hoy el trabajador informal no tiene: un historial de trabajos reales, con referencias, que lo acerca a la certificación y a mejores empleos.

### 4.3 Formalidad por dos lados

Según el INEI, un trabajador independiente es informal cuando su negocio no está registrado en SUNAT, aunque esté certificado [C-34] [C-35]. Certificarse y formalizarse son cosas distintas, y la app acompaña las dos:

| Formalidad | Qué demuestra | Quién la da | Qué hace la app |
|---|---|---|---|
| **De competencias** | Que sabe hacer el trabajo | El MTPE, con más de 400 centros autorizados [C-33] | Lo prepara y lo lleva a certificarse (Parte 1, paso 6) |
| **Del trabajo** | Que su trabajo está registrado | SUNAT, con RUC y recibo por honorarios, si es independiente [C-36]; la planilla con seguridad social, si es empleado [C-34] | Lo guía para sacar su RUC y emitir su recibo cuando trabaja por su cuenta. Es obligatorio para servicios a empresas e instituciones y no se pide en un empleo en planilla (D-032) |

### 4.4 Qué gana cada actor

- **El trabajador:** ingresos mientras avanza, un historial que hoy no tiene y un camino claro hacia la certificación y la formalidad.
- **Quien publica** (persona, empresa o institución): encuentra a alguien confiable, con competencias y referencias que puede revisar antes de elegir.
- **El Ministerio de Trabajo:** más personas llegan a su certificación y a empleos formales. A futuro, de forma agregada y anónima, podría ver qué oficios se piden y cuáles no tienen estándar. Esto no se construye en el concurso.
- **Tether:** su IA (QVAC) resuelve un problema público en los dos lados de la app, cuidando los datos de las personas.

---

## 5. Parte 1: Mi pasaporte

### 5.1 Flujo

1. **Cuéntame tu chamba.** El trabajador cuenta con sus palabras lo que hace ("arreglo celulares, cambio pantallas…"), **por voz o por escrito**, con las mismas funciones en ambos casos (D-013). Luego revisa lo que la app entendió y puede corregirlo antes de seguir.
2. **Esto es lo que sabes hacer.** La IA separa el relato en actividades y **propone** los estándares oficiales del MTPE que podrían corresponder, como preguntas simples: "¿Cortas piezas de tela siguiendo un molde?". La persona responde *Sí, lo hago*, *A veces o con ayuda*, *No* o *No estoy seguro*, y nada viene marcado de antemano (D-004). Cada propuesta muestra la frase del relato de la que salió. Si la persona corrige o borra esa frase, desaparece todo lo que dependía de ella: **corrección en cascada** (D-012).
3. **Si no encajas, no te forzamos.** Cuando una actividad no calza con ningún estándar, la app lo dice: "No encontramos un estándar para esta actividad en el catálogo del MTPE (versión 04-09-2026)". La actividad se conserva en el pasaporte como declarada. Las ocupaciones parecidas que sí tienen estándar se muestran solo como exploración, explicando qué comparten y qué no (D-011).
4. **Demuéstralo (opcional).** La persona puede agregar fotos de su trabajo o pedir a un cliente o jefe que lo confirme. Puede avanzar sin hacerlo, y una foto no convierte nada en "certificado" (D-014).
5. **Opciones cercanas.** Para cada ocupación cercana se muestran por separado tres cosas (D-015):
   - lo que ya haces: actividades compartidas;
   - lo que falta o todavía no se ha evaluado;
   - la demanda en tu región, con fuente, año y territorio: la proyección del MTPE y las vacantes que se publicaron en su bolsa de trabajo, con su fecha (sección 10.1). Ni una proyección ni una vacante pasada son una vacante abierta.

   No hay porcentajes de compatibilidad ni mensajes de "perfil completo".
6. **Tu primer paso.** La app pregunta en lenguaje simple por horario, presupuesto y si la persona puede desplazarse, con las opciones "no sé" y "prefiero no decir". Solo recomienda opciones verificables que encajen (D-016): un curso de CAPACITA-T, un centro de certificación autorizado u otra fuente oficial. Según el MTPE, la evaluación para certificarse se hace principalmente en el propio puesto [C-11b]; las condiciones de cada centro (costo, lugar, horario) se verifican caso por caso. Si no hay ninguna opción compatible, se dice y se ofrece ajustar las condiciones.
7. **Tu pasaporte.** Resume lo que la persona sabe hacer, con un **nivel de respaldo** para cada afirmación (sección 5.2). Es privado por defecto. Antes de compartir se muestra exactamente lo que verá el empleador ("recibo de lo compartido"), y compartir es voluntario (D-014). *Pendiente de diseño con el MTPE: cómo se valida un pasaporte compartido.*

**Para entrar a la Red de oportunidades** (Parte 2) basta con registrar su DNI, el primer nivel de identidad (sección 6.4), y tener al menos una competencia confirmada; la selfie y las referencias previas son opcionales (D-029, D-030, D-034). Para prestar un servicio a una empresa o institución necesita, además, RUC; para postular a un empleo en planilla, no (sección 7).

### 5.2 Niveles de respaldo del pasaporte

| Nivel | Qué significa | Ejemplo |
|---|---|---|
| **Declarado** | La persona dice que lo hace y lo confirmó en la app | "Corto piezas de tela siguiendo un molde" |
| **Con material aportado** | Además subió fotos o documentos. Su autenticidad no está verificada | Fotos de prendas que confeccionó |
| **Con referencia** | Un cliente o jefe lo confirmó; se indica quién y cómo | Confirmación de la dueña de un taller |
| **Certificado oficialmente** | Lo certificó un centro autorizado por el MTPE y se puede verificar en la fuente oficial | Certificado de competencia laboral en costura |

No es una escala automática: subir una foto o recibir una referencia no convierte una habilidad en "certificada". Ninguna afirmación dice "certificado por IA".

---

## 6. Parte 2: Red de oportunidades

> Las reglas de esta parte son nuevas (v0.5). Varias están **por confirmar** (sección 17). La auditoría del 20-10 no las evaluó (sección 19.3); la del plan v0.7 sí, y sus hallazgos se siguen en la sección 19.4.

### 6.1 Quién publica y qué se publica

**Quién publica (D-024, por confirmar).** Personas que necesitan un servicio en su casa (albañilería, carpintería, reparar un celular) y, sobre todo, empresas e instituciones que buscan personal, como una empresa de confecciones que necesita costureras (D-031). Para arrancar se prioriza la demanda institucional, porque publica pedidos más grandes y recurrentes, está más cerca del empleo formal y suele necesitar comprobante.

**Qué se publica (D-023).**

| Tipo | Ejemplo | Relación entre las partes | Cómo se formaliza |
|---|---|---|---|
| **Servicio puntual** (tipo freelance) | "Necesito un carpintero para arreglar la puerta de mi casa" | El trabajador presta el servicio por su cuenta | RUC y recibo por honorarios electrónico [C-36]: obligatorio si el servicio es para una empresa o institución, recomendado si es para una persona (D-032) |
| **Empleo** | "Empresa de confecciones busca costureras con experiencia" | La empresa contrata al trabajador | En planilla, con seguridad social [C-34]; no se pide RUC [C-37]; se conecta con Empleos Perú |

### 6.2 Flujo

1. **Publicar.** Quien necesita algo lo describe con sus palabras, por voz o por escrito; por ejemplo, una empresa de confecciones escribe: "Buscamos costureras con experiencia en máquina recta". Con el mismo traductor de la Parte 1, la IA propone las competencias oficiales que se requieren (en este caso, costura de prendas de vestir), y quien publica las confirma o corrige (D-028). También indica la zona, las fechas, el tipo (servicio o empleo), el pago ofrecido o "a convenir", si exige certificación y, si quiere, un nivel mínimo de identidad (D-034).
2. **Avisar.** La app avisa a los trabajadores que califican, según reglas visibles (sección 6.3). Ninguna IA elige ni ordena a las personas (D-025).
3. **Postular.** Cada trabajador decide si postula. Recién entonces quien publica puede ver su pasaporte, con lo que el trabajador eligió mostrar (D-014), además de su foto, su nombre completo, las zonas donde busca trabajo y su nivel de identidad. Todavía no ve su DNI (D-033).
4. **Elegir.** Quien publica compara a los postulantes: sus competencias con el nivel de respaldo de cada una, su reputación en la Red (trabajos hechos, calificación y comentarios) y la zona. Puede filtrar "solo certificados" y elige a una o varias personas (sección 7.1).
5. **Confirmar, trabajar y pagar.** El trabajador confirma que va; antes de hacerlo, la app le avisa que quien lo contrató verá su número de DNI. Recién entonces quien contrata recibe sus datos de contacto y su DNI, que puede ver hasta que termina el trabajo (D-033). Al llegar, le pide su DNI físico y revisa que el nombre, la foto y el número coincidan con el perfil. Las partes se coordinan. En la primera versión, el pago se hace fuera de la app (D-027): si es un servicio, el trabajador emite su recibo por honorarios cuando tiene RUC, que es obligatorio con empresas e instituciones (D-032); si es un empleo, la empresa lo pone en planilla.
6. **Calificar.** Al terminar, quien publicó califica el trabajo: cumplimiento, calidad, puntualidad y trato, y confirma si quien llegó era la persona del perfil. El trabajador, por su lado, confirma si lo recibió la persona que publicó el pedido (D-034). Se propone que el trabajador también califique a quien lo contrató: pago a tiempo y trato (D-026).
7. **Volver al pasaporte.** La calificación entra al pasaporte del trabajador como **referencia de un trabajo real hecho en la Red**, con su fecha. Cuando suma referencias, la app le sugiere certificarse (Parte 1, paso 6).

### 6.3 A quién le llega un aviso

Un trabajador recibe el aviso de un pedido cuando se cumplen todas estas condiciones:

- tiene **confirmadas** en su pasaporte las competencias que pide el pedido. Si el pedido no corresponde a ningún estándar oficial (por ejemplo, reparar celulares), se avisa a quienes **declararon esa actividad** fuera del catálogo, y así se indica (D-011);
- registró su **DNI** para entrar a la Red y tiene el nivel de identidad que pide el pedido, si pide uno (sección 6.4, D-034);
- busca trabajo en la **zona** del pedido; puede elegir varias (D-033);
- tiene **RUC**, si el pedido es un servicio para una empresa o institución; para un empleo en planilla no se pide (D-032);
- **activó los avisos** para ese tipo de trabajo.

Los avisos no exponen a nadie: quien publica solo ve a quienes deciden postular.

### 6.4 Confianza y seguridad

**Identidad por niveles (D-034).** Funciona como los niveles de respaldo del pasaporte: nadie queda fuera y cada nivel suma confianza.

| Nivel | Cómo se logra | Qué muestra el perfil |
|---|---|---|
| **DNI registrado** | Toma una foto de su DNI y la IA lee su nombre y su número; el nombre del perfil sale del DNI | "DNI registrado" |
| **Rostro verificado** | Una IA compara una selfie con la foto del DNI. Si no coincide, por ejemplo porque la foto tiene muchos años [C-42], se queda en el nivel anterior, sin bloqueo | "Rostro verificado" |
| **Confirmado en persona** | Al calificar, cada cliente confirma que quien llegó era la persona del perfil. Si dice que no, se genera un reporte y lo revisa una persona | "Confirmado por N clientes" |

- Para entrar a la Red basta el primer nivel. Quien publica ve el nivel y puede pedir uno mínimo; por ejemplo, "rostro verificado" para un trabajo dentro de su casa.
- El DNI no se pide al registrarse: el pasaporte se puede armar sin él. Se pide para entrar a la Red y, del otro lado, para publicar.
- Antes de la selfie, la app pide consentimiento por escrito, porque los datos biométricos son datos sensibles [C-41]. Las fotos se borran después de verificar y solo queda el resultado.
- En el concurso, los dos primeros niveles funcionan de verdad: el LLM de QVAC que acepta imágenes lee el DNI (por probar, sección 12.2) y un modelo abierto compara los rostros en nuestro backend, porque QVAC no trae uno [C-43]. En la versión real, el Ministerio podría usar ID gob.pe, la plataforma del Estado que verifica la identidad en línea a través de RENIEC con tres niveles de confianza [C-45], o el servicio facial de RENIEC para instituciones con convenio [C-40].
- El trabajador también confirma, al terminar, que lo recibió la persona que publicó el pedido, porque él también entra a una casa ajena. Si dice que no, se genera un reporte (D-034).

**Qué ve quien publica y cuándo (D-033).**

| Momento | Qué ve |
|---|---|
| Cuando el trabajador postula | Foto, nombre completo, zonas donde busca trabajo, nivel de identidad, competencias con su respaldo y reputación. Sin DNI |
| Cuando lo contrata y el trabajador confirma que va | Además, sus datos de contacto y su número de DNI, solo hasta que termina el trabajo. La app avisa al trabajador antes de que confirme, y solo lo ve un cliente que también registró su DNI |
| Al llegar | Revisa el DNI físico (nombre, foto y número) y confirma en la app que es la persona del perfil |
| Si es un empleo | La empresa le pide el DNI directamente para la planilla |

Nunca se muestran la dirección ni la fecha de nacimiento. El DNI no aparece antes porque contratar en la app es solo un clic, ya que el pago se hace fuera (D-027), y alguien podría publicar pedidos falsos para juntar datos de trabajadores (R24).

**Otras reglas:**

- **Se califica el trabajo, no a la persona.** No se aceptan comentarios sobre edad, género, origen o apariencia: se pueden reportar y se retiran.
- **Botón de reporte** de abusos, desde cualquiera de los dos lados.
- **La app conecta, no emplea.** El acuerdo es entre las partes. La responsabilidad legal de la plataforma está por evaluar (R18).

---

## 7. Cómo se conectan las dos partes

### 7.1 Entrada a la Red y reputación (D-029 y D-030)

**La idea de Santiago (D-029):** la reputación se gana trabajando, como los repartidores en las apps. Las referencias previas son opcionales: si el trabajador las tiene, suman desde el primer día. Reemplaza los niveles de acceso de D-021.

**Para entrar a la Red** bastan dos cosas: su DNI registrado, que es el primer nivel de identidad (sección 6.4), y al menos una competencia confirmada en su pasaporte (D-030, ajustada por D-034). Los niveles más altos de identidad suman confianza, porque muchas veces el trabajador entra a la casa de alguien, pero no son obligatorios.

**Qué ve quien publica en el perfil de cada postulante** (sección 6.4, D-033):
- foto, nombre completo y zonas donde busca trabajo;
- nivel de identidad: DNI registrado, rostro verificado y cuántos clientes lo confirmaron en persona (D-034);
- trabajos completados en la Red, en total y por oficio;
- calificación promedio, con el número de calificaciones;
- comentarios de clientes, con fecha y tipo de trabajo;
- competencias con su nivel de respaldo (sección 5.2) y la insignia oficial si está certificado;
- referencias externas, si las tiene, separadas de lo ganado en la Red;
- la etiqueta "Nuevo en la Red" mientras no tenga trabajos.

Ejemplo ficticio:

```
Rosa Mamani Quispe · Juliaca y alrededores       ✔ Rostro verificado
Confirmada en persona por 18 clientes
Costura de prendas · Corte de piezas
★ 4,8 (23 calificaciones) · 31 trabajos en la Red
🏅 Certificada en costura de prendas (MTPE)
"Hizo los arreglos a tiempo y con muy buen acabado" — Vecina, marzo
```

**Reglas para que la reputación sea justa (D-030):**
1. Solo califica quien contrató por la Red: no hay reseñas falsas.
2. Se califica el trabajo, no a la persona (sección 6.4).
3. El trabajador puede responder a un comentario.
4. Nadie es expulsado automáticamente por una calificación baja: lo revisa una persona y el trabajador tiene oportunidad de mejorar.
5. Los postulantes se muestran por orden de llegada, no por estrellas; quien publica puede filtrar si quiere. Así el nuevo no queda invisible.

**Diferencia con las apps de reparto:** allá la app asigna el pedido, así que un repartidor nuevo igual recibe trabajo. Aquí elige quien publica: si todos eligen al de más estrellas, el nuevo nunca consigue su primer trabajo y se repite el "no tienes experiencia" que queremos resolver. Por eso existen la regla 5 y la etiqueta "Nuevo en la Red" (R20).

**Certificación:** no reemplaza la reputación, le suma la insignia oficial. Cuando el trabajador acumula varios trabajos bien calificados, la app le sugiere certificarse. Los empleos quedan abiertos a todos, y quien publica puede filtrar "solo certificados".

### 7.2 Formalización en el camino (D-022 y D-032)

- La app explica en lenguaje simple qué es el RUC y cómo emitir un recibo por honorarios electrónico, paso a paso [C-36].
- El RUC es **obligatorio** para prestar servicios a empresas e instituciones, que suelen pedir comprobante, y **recomendado** para servicios a personas. **No se pide** para un empleo en planilla: quien solo trabaja como dependiente no debe inscribirse en el RUC, salvo excepciones puntuales [C-37] (D-032).
- Probablemente a muchas personas les dé temor el RUC por los impuestos y los trámites. Es una hipótesis que hay que validar con trabajadores (R16).

### 7.3 La historia para el pitch (propuesta)

**Rosa, costurera en Juliaca** (persona ficticia):

1. Cuenta su trabajo en un minuto. La app le propone "costura de prendas de vestir" y "corte de piezas", y ella confirma.
2. Registra su DNI, se toma una selfie que coincide con la foto del DNI y entra a la Red. La referencia de una clienta de antes aparece como referencia externa.
3. Una vecina publica que necesita arreglos de ropa. La app avisa a las costureras de la zona; Rosa postula y la vecina la elige.
4. Cuando Rosa llega, la vecina revisa su DNI. Al terminar, la califica, deja un comentario y confirma que era la persona del perfil. Su perfil suma su primer trabajo en la Red, y su pasaporte gana una referencia de un trabajo real.
5. Con cada trabajo bien calificado, Rosa construye su reputación, y la app le sugiere certificarse en costura de prendas de vestir.
6. *Seis meses después*, ya certificada, ve que una empresa de confecciones busca costureras. Postula, la empresa revisa su pasaporte y la contrata en planilla.

**Jhon, técnico de celulares** (persona ficticia). Su oficio no aparece en el catálogo oficial [C-24]. Igual entra a la Red como "Nuevo en la Red", con dos referencias externas de clientes, y recibe pedidos de reparación de celulares, marcados como actividad fuera del catálogo. Con cada trabajo va construyendo su reputación.

**Un vecino que necesita un carpintero o un albañil** para un arreglo en su casa publica su pedido, pide que tengan el rostro verificado y elige entre los postulantes mirando sus calificaciones de clientes reales. Cuando llega el trabajador, revisa su DNI.

---

## 8. Qué la hace distinta, sus límites y su encaje con el reto

### 8.1 Qué la hace distinta

- **El pasaporte sirve para algo hoy.** La Red convierte el perfil en trabajo, y cada trabajo en una referencia (D-020, D-026).
- **Reputación que se gana trabajando,** como en las apps de reparto, pero con un camino hacia la certificación y la formalidad (D-029).
- **Formalidad por dos lados.** Competencias certificadas por el MTPE y trabajo registrado: con RUC si trabaja por su cuenta, en planilla si lo contratan (D-022, D-032).
- **Identidad sin trabas.** Basta el DNI para empezar; la selfie y la confirmación de cada cliente suman confianza, y nadie queda fuera por una foto antigua (D-034).
- **El mismo traductor para los dos lados.** El trabajador y quien publica hablan con sus palabras; la IA lo traduce a competencias oficiales y las personas confirman (D-028).
- **Voz o texto, sin formularios largos.** Pensada para quien no escribe mucho ni conoce términos técnicos (D-013).
- **La persona corrige a la IA.** Ve de dónde sale cada propuesta y, si la corrige, todo lo que dependía de ella se ajusta solo (D-012).
- **Derecho a no encajar.** No obliga a nadie a ponerse la etiqueta de un oficio ajeno (D-011).
- **Un pasaporte honesto.** Muestra el nivel de respaldo de cada afirmación, que es justamente lo que el reto valora ante el empleador (D-014).
- **Recomendaciones explicables que terminan en una acción posible,** según el horario, el presupuesto y la región de la persona (D-015, D-016).
- **Completa al Estado en vez de competir con él.** Lleva gente al sistema de certificación que ya existe y que funciona [C-32].
- **Privacidad por diseño.** La IA corre en infraestructura propia con QVAC, sin nube de terceros.
- **Potencial futuro: datos para el MTPE.** De forma agregada y anónima, podría mostrar qué oficios no tienen estándar para priorizar nuevos estándares. No se construye en el concurso.

### 8.2 Qué NO es

- **No certifica.** La certificación oficial la hace el MTPE con centros autorizados. Nosotros orientamos y preparamos.
- **No es un servicio oficial.** En el concurso es un prototipo y se rotula siempre así (R8).
- **No reemplaza** Empleos Perú ni el Certificado Único Laboral. Se integra a ellos.
- **No toma decisiones automáticas** sobre las competencias de la persona sin su confirmación.
- **No muestra porcentajes** de empleabilidad o compatibilidad, ni mensajes de "perfil completo".
- **No fuerza a nadie** a encajar en un oficio ajeno.
- **No inventa** cursos, vacantes ni demanda. Si no hay datos, lo dice.
- **No es una agencia de empleo ni un empleador.** Conecta a las partes; el acuerdo es entre ellas.
- **No procesa pagos** en la primera versión, tampoco con USDT (D-027).
- **No elige ni ordena candidatos con IA.** Elige quien publica (D-025).
- **No es una app de cachuelos informales.** Empuja hacia la certificación y la formalización; exige RUC para servicios a empresas e instituciones (D-032).
- **No expone el DNI.** Solo lo ve quien ya contrató, y hasta que termina el trabajo (D-033).

### 8.3 Cómo responde a las bases del reto

| Lo que piden las bases | Cómo lo cubrimos |
|---|---|
| Identificar las competencias de quien aprendió en la práctica, sin certificados | Parte 1, pasos 1 a 3 |
| Mostrar ocupaciones compatibles con demanda en su territorio | Parte 1, paso 5, con la proyección del MTPE y las vacantes de su bolsa de trabajo (sección 10.1) |
| Proponer un primer paso formativo realista según tiempo, recursos e intereses | Parte 1, paso 6 |
| Que las competencias puedan presentarse de forma creíble ante un empleador | Niveles de respaldo (sección 5.2) y referencias de trabajos reales hechos en la Red (sección 6) |
| Acceder a un mejor empleo "sin empezar de cero ni dejar de generar ingresos mientras lo logra" | Red de oportunidades: ingresos mientras avanza y camino a empleos (sección 6) |
| Integración al portal de empleo de gob.pe, con un backend que corre IA sobre QVAC | Integración en tres niveles (sección 10.1) y arquitectura (sección 10) |

### 8.4 Cómo responde a la rúbrica

| Criterio | Cómo lo cubrimos |
|---|---|
| Comprensión del reto (25 %) | Datos oficiales verificados; formalidad entendida como dos cosas distintas, según el INEI [C-34] [C-35]; indicio de que el catálogo no cubre oficios comunes como la reparación de celulares [C-24]; insights del Open Day |
| Prototipo (25 %) | Propuesta: la Parte 1 funcionando con QVAC (voz o texto, corrección y pasaporte) y la Parte 2 navegable con datos simulados y rotulados. Se decide con el equipo |
| Creatividad (20 %) | Círculo virtuoso trabajo → referencia → certificación; el mismo traductor para los dos lados; formalidad por dos lados; corrección en cascada; derecho a no encajar |
| Viabilidad (20 %) | Se apoya en lo que ya existe: certificación (más de 400 centros autorizados [C-33]), recibo por honorarios de SUNAT [C-36], Empleos Perú y los datos abiertos del MTPE [C-46] [C-47], y en la versión real los componentes del Estado, como ID gob.pe [C-45]; arranque con demanda institucional (D-024); IA local factible (sección 12) |
| Storytelling (10 %) | La historia de Rosa de punta a punta y el caso de Jhon (sección 7.3) |

---

## 9. Ideas complementarias (para evaluar con el equipo)

Son ideas, no decisiones. Las cuatro primeras vienen de la auditoría (`docs/auditoria/06_PROPUESTAS_INNOVACION.md`); las tres últimas surgieron con la Red de oportunidades (v0.5):

- **Modo acompañante.** Un familiar u orientador ayuda con el celular, pero la persona decide qué declarar y qué compartir. Al terminar, el acompañante pierde el acceso.
- **Pausa segura en un celular compartido.** Un botón "terminar y ocultar mis datos" limpia la pantalla; al volver, el relato no aparece en la pantalla de inicio.
- **Costo de oportunidad de un curso.** Muestra cuántas horas y traslados exige cada opción para que la persona compare. No calcula ingresos si ella no los da.
- **Microevaluaciones prácticas.** Situaciones concretas del oficio para que la persona vea qué le conviene practicar. Requieren rúbricas de especialistas y nunca certifican.
- **Pagos protegidos dentro de la app.** El dinero se libera cuando el trabajo se confirma. Suma confianza, pero también complejidad y regulación; no va en la primera versión (D-027).
- **Equipos para pedidos grandes.** Varias costureras se juntan para un pedido grande, cada una con su pasaporte.
- **Pedidos recurrentes.** Empresas que publican el mismo pedido cada temporada, por ejemplo una empresa de confecciones que busca personal en temporada alta.

---

