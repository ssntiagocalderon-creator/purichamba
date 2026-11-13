# Auditoría técnica — Pasaporte de Oficio

Fecha: **20-10-2026 (America/Lima)**. Revisión base: `c24523f1bee8a64a21a8a1d2a9bdeee128415c69`. Modalidad: inspección de solo lectura y comprobaciones no destructivas; se crean documentos de auditoría, sin cambiar fuente, fuentes oficiales, datos procesados, modelos, resultados ni lockfile.

## Dictamen y alcance

**Hay una preparación documental y un experimento local de IA; todavía no hay una aplicación.** El propio plan la sitúa en Fase 0 (`PLAN_DE_PROYECTO.md:8`, sección 7). Su calidad debe juzgarse como investigación temprana. La inexistencia de autenticación, recuperación o UI es una brecha para el prototipo/MVP, no una vulnerabilidad explotada de un servidor existente.

Calificación técnica orientativa, criterio de auditor: **calidad/gobierno de datos 5/10; mantenibilidad para producto 2/10; aplicación ejecutable 1/10; pruebas automatizadas de producto 0/10; despliegue y operación 0/10**. Las tres primeras corresponden a las categorías generales del diagnóstico; las dos últimas son subcapacidades sin implementación. No son resultados de un benchmark ni porcentajes de avance. Los archivos del spike prueban decisiones técnicas, no la cobertura del recorrido del trabajador.

## Inventario verificado

| Componente | Evidencia | Estado real |
|---|---|---|
| Gobierno del proyecto | `AGENTS.md`, `PLAN_DE_PROYECTO.md`, `README.md`, `CLAUDE.md` | Documentación coherente con preparación; decisiones y cifras con trazabilidad |
| Conversión de datos | `datos/scripts/xlsx_leer.py:15`, `matriz_a_json.py:29` | Python con librería estándar; lectura XLSX → JSON/CSV |
| Fuentes | `datos/fuentes/` | XLSX MTPE, PDF EDO 2026 y PDF CNO 2015; no modificados |
| Catálogo procesado | `datos/procesados/mtpe_estandares_competencia.json:2` y CSV | Datos estáticos con URL de procedencia y fecha fija |
| IA experimental | `spike-qvac/voz.mjs`, `competencias.mjs`, `competencias_v2.mjs`, `listar.mjs` | Cuatro scripts Node ESM; no servicio HTTP |
| SDK y nativos | `spike-qvac/package.json:13`, `package-lock.json:846` | `@qvac/sdk` solicitado `^0.22.0`, resuelto e instalado **0.22.0**; paquetes nativos transitivos |
| Entradas y resultados | `spike-qvac/audio/`, `resultados/` | Dos relatos ficticios con WAV sintéticos; cinco resultados JSON históricos |
| Configuración | `spike-qvac/qvac.config.json:1` | Log informativo y parámetros de descarga; sin despliegue productivo |
| Frontend y móvil | Inventario completo `git ls-files` | Ausentes: framework web, HTML, componentes, rutas, formularios, navegación, PWA/Expo |
| Backend y persistencia de usuario | Inventario completo y scripts | Ausentes: servidor, endpoints, DB de dominio, sesiones, permisos, archivos de evidencias, migraciones |
| Calidad y operación | `spike-qvac/package.json:6` e inventario | `npm test` es placeholder; sin CI, lint de proyecto, tests, contenedores ni configuración de hosting |

La persistencia del índice vectorial QVAC y los JSON de experimentos **no equivalen** a guardar entrevistas, consentimientos, evidencias o pasaportes de usuarios.

## Comprobaciones ejecutadas

Entorno observado: `node --version` → `v24.18.0`; `python3 --version` → `Python 3.9.6`. No se instaló ni actualizó ninguna dependencia. El directorio `node_modules` ya existía; `du -sh` devolvió `2.1G`, medida de disco local, no memoria RAM ni tamaño de modelos.

| Comprobación | Ejecución y resultado | Límite |
|---|---|---|
| Sintaxis JS | `node --check` para los cuatro `.mjs`: **exit 0** en los cuatro | No importa QVAC ni demuestra inferencia |
| Sintaxis Python | `ast.parse` de los dos `.py`: **OK** | No ejecuta efectos de escritura del original |
| Regeneración de datos | Copia temporal de los dos scripts y del XLSX; `python3 -B -I <temporal>/scripts/matriz_a_json.py`: **exit 0** | Solo escribe en directorio temporal; no valida jurídicamente la vigencia |
| Reproducibilidad | JSON y CSV regenerados **idénticos byte a byte** a los versionados | Verifica la fuente local, no descarga ni autenticidad del XLSX |
| Integridad básica | JSON parseable, CSV con mismo orden de códigos, sin duplicados de `codigo_ecl` | No se ha revisado manualmente cada estándar |
| Dependencias conocidas | `npm audit --package-lock-only --ignore-scripts --json`: **exit 0**, 0 avisos, 236 dependencias totales | Consulta de avisos npm, no auditoría de binarios ni garantía de seguridad |
| Estado del lock | `git diff --exit-code -- spike-qvac/package-lock.json`: **exit 0** tras consulta | Confirma que audit no actualizó el lock |

Salida exacta del conversor ejecutado en la copia temporal:

```text
estándares: 449
perfiles distintos: 192
vigentes al 20-10-2026: 434 | vencidos: 15 | sin fecha: 0
con código CNO: 89
[('INDUSTRIAS MANUFACTURERAS', 160), ('CONSTRUCCIÓN', 68), ('ACTIVIDADES PROFESIONALES CIENTÍFICAS Y TÉCNICAS', 51), ('AGRICULTURA, GANADERÍA, SILVICULTURA Y PESCA', 42), ('TRANSPORTE Y ALMACENAMIENTO', 26), ('ACTIVIDADES DE ALOJAMIENTO Y SERVICIOS DE COMIDAS', 22), ('OTRAS ACTIVIDADES DE SERVICIOS', 14), ('ELECTRICIDAD, GAS Y AGUA', 13), ('INFORMACIÓN Y COMUNICACIONES', 12), ('EXPLOTACIÓN DE MINAS Y CANTERAS', 10), ('SALUD HUMANA Y DE ASISTENCIA SOCIAL', 9), ('COMERCIO', 8)]
```

Cálculos adicionales sobre los registros locales: **185** perfiles distintos en las filas vigentes, usando el mismo fallback del conversor (`codigo_perfil` → nombre de perfil → nombre de estándar); **89/449** filas con CNO. Las **360** restantes no contienen CNO. No hay coincidencias de `celular|electr[oó]nic` en ningún campo: esto prueba ausencia de esas palabras, no una auditoría exhaustiva de todos los oficios relacionados. Hay 54 registros sin código/nombre de perfil, pero con descripción de estándar; no deben descartarse automáticamente como errores. Hay 334 sin actividad económica y un registro sin puestos asociados.

La primera consulta npm falló por DNS del sandbox (`ENOTFOUND registry.npmjs.org`, exit 1); se repitió con escalación aprobada y terminó correctamente. Metadatos exactos del informe npm: `prod:201`, `dev:0`, `optional:36`, `peer:0`, `peerOptional:0`, `total:236`; no sumar manualmente las categorías porque npm contabiliza categorías solapadas. Fuente de avisos: registro npm, consultado durante esta auditoría.

**No ejecutado:** inferencia QVAC nueva, entrenamiento, descarga de modelos, interfaz en navegador, HTTP, E2E, carga, móvil, usuarios, restauración, offline real o escaneo dinámico de un servicio. No existe ese servicio para probarlo. No se ejecutó el placeholder `npm test`; su definición explícita devuelve error y no contiene casos de prueba.

## Hallazgos priorizados

Complejidad: **baja**, cambio acotado; **media**, varios módulos/contratos; **alta**, varias capas y validación externa. Las prioridades se refieren a aceptar el hito indicado, no a exigir producción durante la preparación.

| ID | Hecho y evidencia | Impacto / hipótesis delimitada | Acción recomendada | Prioridad / complejidad / aceptación |
|---|---|---|---|---|
| TEC-01 | Solo existe CLI experimental; `README.md:33`, `spike-qvac/package.json:5` e inventario | No se puede completar ni observar el recorrido del trabajador | Crear el producto en carpeta nueva, preservando el spike desechable según `AGENTS.md:17`; UI móvil, API y casos de uso separados | **P0 prototipo / alta.** Desde un navegador completar texto/voz → revisión → oportunidad → primer paso → pasaporte de demostración; estados reales y demostrativos identificados |
| TEC-02 | `package.json:7` define `echo "Error: no test specified" && exit 1`; no tests/CI | No hay barrera de regresión ni evidencia de aceptación automatizada | Añadir en el futuro producto contratos, casos de dominio y un E2E crítico; CI de sintaxis, validación de datos y pruebas | **P0 MVP / media.** Flujo crítico y fallos de IA/persistencia cubiertos; pipeline bloquea regresiones |
| TEC-03 | CLI usa rutas relativas al cwd: `competencias.mjs:33,151`, `voz.mjs:58`, `competencias_v2.mjs:26,100`; argumentos sin validación | Fallo si se inicia desde otra carpeta o falta un audio; nombres/modelos inválidos llegan tarde al SDK | Resolver recursos desde `import.meta.url`, validar entradas y lista de modelos; salidas por ejecución con nombre seguro | **P1 / baja.** Mensaje claro y exit definido para argumento ausente, WAV inexistente, modelo no permitido; ejecución independiente del cwd |
| TEC-04 | JSON de resultados se escribe directamente y se reemplaza por nombre (`voz.mjs:58`, `competencias.mjs:150`, `competencias_v2.mjs:99`) | No hay historial reproducible; caída durante escritura puede dejar archivo parcial; no es almacenamiento de producto | Servicio transaccional de dominio; artefactos de experimentos con run ID, versión y escritura atómica; separar catálogo, datos personales y benchmarks | **P0 MVP / media.** Borrador recuperable tras cierre, escritura interrumpida sin corrupción y exportación/restauración comprobadas |
| TEC-05 | Vigencia codificada al `2026-10-20`: `matriz_a_json.py:12,56`; ambos spikes filtran ese booleano | Es una foto histórica válida, pero caducará si se reutiliza como catálogo operativo | Guardar metadatos de snapshot/hash y evaluar vigencia con fecha de consulta; importación versionada, no mutar el original | **P1 / media.** Pruebas de vencimiento, prórroga, fecha ausente y cambios de versión; UI indica fecha/fuente |
| TEC-06 | RAG se reutiliza solo si existe el nombre fijo: `competencias.mjs:18,81`, `competencias_v2.mjs:16,54` | Cambio de datos/modelo/prefijos puede consultar un índice obsoleto sin aviso; hipótesis de riesgo, no corrupción observada | Identidad de índice por hash de catálogo+modelo+normalización+esquema; reconstrucción en un índice nuevo y cambio controlado | **P1 / media.** Modificar cualquier insumo invalida índice; reconstrucción fallida conserva versión anterior |
| TEC-07 | Cada script copia carga/transcripción/esquemas/búsqueda y termina con `process.exit`; `competencias.mjs:44,55,154`, v2:33,40,103 | Duplicación aceptable para experimentos descartables, inadecuada como backend concurrente | Compartir en producto puertos de ASR/LLM/retrieval; errores tipados y `finally`; gestor de modelos con cola, cancelación y límites | **P1 / media.** Error en cualquier etapa libera recursos sin terminar el servidor ni mezclar sesiones |
| TEC-08 | No hay demanda regional procesada, vacantes, cursos, centros ni cruces robustos; `PLAN_DE_PROYECTO.md`, sección 6 (Datos); CNO ausente en 360 filas | Catálogo de competencias no basta para recomendar un empleo territorial o formación viable | Adaptadores con fuente, fecha, ubicación, vigencia, costo y disponibilidad; joins curados/versionados; fallback a servicio oficial | **P0 prototipo / alta.** Cada recomendación identifica fuente real y por qué aplica; sin cobertura, se informa la ausencia |
| TEC-09 | `package.json:14` permite parches 0.22.x, lock fija 0.22.0; sin `engines` ni comando de build/start ni CI | Reproducción depende de seguir README y del SO/binario; no hay contrato de despliegue | En nuevo producto declarar Node soportado, instalar con `npm ci`, fijar imagen/arquitectura y pesos por hash, runbook y healthchecks | **P1 / media.** Instalación desde checkout limpio y despliegue repetible en hardware objetivo sin descargas durante la demo |
| TEC-10 | Parser XLSX asume hoja y posiciones; `matriz_a_json.py:30,31,35,49` y `xlsx_leer.py:16,30` | Un cambio de formato oficial podría mapear columnas incorrectas o fallar, sin diagnóstico de esquema | Validar encabezados, tipos/fechas/códigos/conteos y duplicados antes de publicar; rechazar importación inconsistente | **P1 / media.** Hoja/columna cambiada se rechaza; fixtures conservados y diferencias del catálogo revisables |
| TEC-11 | No hay despliegue, configuración de secretos de producto, observabilidad, backups ni recuperación | No se puede evaluar disponibilidad ni operar con trabajadores reales | Incorporar esas capas después del MVP, con responsables y ensayo de restauración | **P0 producción / alta.** Restauración y reversión probadas, métricas sin relatos personales y alertas operativas |

## Simplificar, eliminar o posponer

- Mantener `spike-qvac/` como registro experimental, no convertir sus scripts largos en endpoints mediante una envoltura superficial.
- Retirar del lenguaje de producto las etiquetas automáticas de «confirmadas», «perfil completo» y porcentajes de empleabilidad hasta que existan validación y significado definido; ver IA-02/IA-05.
- Posponer app nativa, aprendizaje/fine-tuning, P2P de inferencia, blockchain y arquitectura de microservicios. El problema inicial cabe en UI + API modular + un worker QVAC + persistencia + adaptadores.
- Evitar un motor de vacantes inventadas. La demanda EDO es estadística, no un feed de vacantes abiertas. El prototipo puede usar un conjunto pequeño curado y rotulado con fuentes verificables.
- Empezar por pocas familias ocupacionales con estándar y una rama explícita «no encuentro un estándar»; medir la calidad antes de ampliar.

## Secuencia técnica recomendada

1. Contratos de entrevista, actividad con cita, propuesta ECL y confirmación de usuario; catálogo versionado; amenazas y datos mínimos.
2. UI accesible por texto y voz + API propia + adaptador QVAC probado con la misma versión. Persistencia de sesión separada del índice de catálogo.
3. Confirmación corregible, evidencias con niveles de respaldo, compatibilidad explicable y primer paso con fuente/fecha.
4. Pasaporte consentido y revocable; enlace seguro de aplicación. La integración oficial requiere autorización y no se presume.
5. Evaluación automatizada, pruebas con usuarios y hardware objetivo; luego endurecimiento, operación e integraciones autorizadas.

Consúltese [arquitectura propuesta](07_ARQUITECTURA_PROPUESTA.md), [roadmap](08_ROADMAP_DESARROLLO.md), [plan de pruebas](09_PLAN_PRUEBAS.md) y [backlog](11_BACKLOG_IMPLEMENTACION.md) para la aceptación transversal. Esta auditoría autoriza recomendaciones documentales, no implementación.

## Fuentes

- Archivos y resultados del commit base, referidos con línea de inicio. Enlaces de código: [repositorio privado](https://github.com/ssntiagocalderon-creator/innovathon-tether/tree/c24523f1bee8a64a21a8a1d2a9bdeee128415c69).
- [Matriz oficial MTPE](https://www.gob.pe/institucion/mtpe/informes-publicaciones/2992036-matriz-de-estandares-de-competencia-laboral), procedencia declarada y usada por el conversor; la regeneración se hizo contra el archivo local preservado.
- [QVAC JS/TS v0.22](https://docs.qvac.tether.io/sdk/js-ts-sdk), [requisitos de sistema](https://docs.qvac.tether.io/sdk/system-requirements) y [RAG](https://docs.qvac.tether.io/sdk/ai-capabilities/rag), consultados 20-10-2026; detalle y límites en [auditoría IA](03_AUDITORIA_IA_QVAC.md).
