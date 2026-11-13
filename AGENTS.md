# Instrucciones para agentes (Codex, Claude y otros)

Proyecto de concurso universitario (Innovathon Ulima x Tether, octubre 2026). Lee primero `PLAN_DE_PROYECTO.md`: es el documento maestro (reto, solución, arquitectura, decisiones, cifras y estado de tareas).

## Mantener el Plan de Proyecto (obligatorio)

Todo cambio relevante (idea, alcance, arquitectura, datos, cronograma, equipo, resultados de pruebas) se refleja en `PLAN_DE_PROYECTO.md` **en el mismo commit**:
- subir la versión en el encabezado y agregar una fila en la **Bitácora de cambios**;
- las decisiones nuevas van al **Registro de decisiones** (`D-xxx`) con fecha, motivo, alternativas descartadas, quién la tomó y su estado. Las marcadas **por confirmar** no se implementan hasta que Santiago o el equipo las confirmen;
- cada cifra nueva lleva su código `[C-xx]` y su fila en la **Tabla de control de cifras** (fuente, enlace, ubicación exacta, fecha de consulta);
- las tareas del Plan de trabajo se marcan `[x]` con la fecha de cierre.

## Reglas del equipo

1. **Ninguna cifra sin fuente que se pueda abrir.** Todo número que vaya al pitch, al prototipo o a un documento lleva enlace a la fuente oficial (INEI, MTPE, bases del concurso). Si es un cálculo propio, se muestran los insumos y la fórmula. Si algo no se puede verificar, se dice; nunca se rellena con un valor plausible.
2. **`datos/fuentes/` no se edita.** Son los documentos oficiales tal como se descargaron. Los datos limpios salen de `datos/scripts/` hacia `datos/procesados/`.
3. **`spike-qvac/` es desechable.** Sirve para aprender cómo se comporta QVAC; no se le agregan funciones de producto. El prototipo del concurso va en una carpeta nueva.
4. **Privacidad por diseño.** La IA corre local con QVAC (`@qvac/sdk`); no se envían relatos ni datos de trabajadores a APIs externas.
5. **Personas de ejemplo siempre ficticias** y marcadas como tales. Los audios reales (solo con consentimiento) van en `spike-qvac/audio/reales/` y sus resultados en `spike-qvac/audio/reales/resultados/`, ambas excluidas de git. No se pegan relatos reales en issues, commits ni chats con asistentes.
6. Idioma del proyecto: español (código, comentarios y textos de interfaz).
7. **Commits solo con los archivos propios.** Codex y Claude pueden trabajar en paralelo en esta carpeta: se agregan rutas explícitas (`git add <ruta>`), nunca `git add -A`, y se revisa `git status` antes de cada commit.

## QVAC: lo que ya sabemos (SDK v0.22)

- Corre en Node.js/Bare (Mac, Linux, Windows) y en Android/iOS vía Expo (solo dispositivo físico, no emulador). No corre en el navegador: el front web habla con un backend Node.
- Voz a texto en español: `PARAKEET_TDT_0_6B_V3_Q8_0` (`modelType: 'parakeet-transcription'`) transcribió mejor y más rápido que `WHISPER_SMALL_Q8_0` en las pruebas: 5,1 % y 4,3 % de error por palabra (WER), frente a 22,0 % y 5,3 % (C-26 del plan; `spike-qvac/resultados/voz.json`). La calidad de voz se mide con WER, no con "% de palabras del guion".
- Búsqueda por significado: `EMBEDDINGGEMMA_300M_Q8_0` + `ragIngest`/`ragSearch` (base vectorial local incluida). Prefijos de EmbeddingGemma: documentos `title: ... | text: ...`, consultas `task: search result | query: ...`.
- Salida estructurada: `completion({ responseFormat: { type: 'json_schema', json_schema: { name, schema } } })`. Con Qwen3 agregar `/no_think` al mensaje de sistema.
- Servidor HTTP (`qvac serve --openai`; `qvac serve openai` está obsoleto): el chat respeta `response_format` con `json_schema` (no se combina con `tools`). Con modelos que razonan, un `max_tokens` bajo puede dejar la respuesta vacía. Fuera de 127.0.0.1 exige `--api-key` o `--api-key-file`; `/docs` y `/openapi.json` quedan públicos. Plan, C-69.
- Modelos de decisión: `modelType: 'llamacpp-decision'`, constantes `LAYA_421M_*`, `LAYA_MULTILINGUAL_322M_*` y `LAYA_TYPED_DECISIONS_421M_*`; `decide()` con preguntas `choice`, `score` y `noul` (probabilidad de que una afirmación sea cierta). La documentación no dice si funciona en español.
- Parakeet espera audio WAV, 16 kHz, mono: el webm que graba el navegador hay que convertirlo.
- Docs: https://docs.qvac.tether.io (agregar `.md` a cualquier ruta para leerla en Markdown; índice en `/llms.txt`).
