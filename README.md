# Innovathon Ulima x Tether 2026

Repositorio del equipo para la **Innovathon Ulima x Tether** (Innova Ulima, 23–30 de octubre de 2026). Proyecto: **PURICHAMBA**, segundo puesto en el Demo Day.

> Copia pública del repositorio de trabajo (estado al 30-10-2026). No incluye `docs/concurso/` (material que los organizadores entregaron solo a los participantes), aunque el plan lo menciona.

📋 **El documento maestro es [`PLAN_DE_PROYECTO.md`](PLAN_DE_PROYECTO.md)**: solución, arquitectura, plan de trabajo, decisiones, riesgos y tabla de control de cifras. Se actualiza con cada cambio.

## El reto

> ¿Cómo podríamos ayudar a las personas a reconocer y traducir las competencias que ya tienen para que accedan a un mejor trabajo o se reinventen en ocupaciones afines?

Lo plantea el Ministerio de Trabajo y Promoción del Empleo (MTPE). La solución va como integración al portal de empleo de gob.pe, con un backend que corre IA local sobre **QVAC** de Tether, para que los datos del trabajador no salgan del ecosistema usuario/MTPE. Bases: [PDF oficial](https://www.ulima.edu.pe/sites/default/files/centers/files/1_bases_innovathon_ulima_x_tether_0.pdf).

| Fecha | Etapa |
|---|---|
| vie 23-10, 16–18 h | Open Day (Torre O2, piso 10) |
| sáb 24-10, 9–16 h | Workshops |
| 26–29-10 | Desarrollo de proyectos (Zoom) |
| vie 30-10, 9–13 h | Demo Day: pitch de 3 min |

Rúbrica: comprensión del reto 25 % · prototipo 25 % · creatividad 20 % · viabilidad 20 % · presentación 10 %.

## Idea de trabajo: "Pasaporte de Oficio"

Muestra a cada persona **a qué otros trabajos puede pasar con lo que ya sabe hacer**: qué competencias tiene, cuáles le faltan y qué hacer para conseguirlas. Es lo que el Ministerio fijó como centro del reto en el Open Day: las transiciones entre ocupaciones.

1. **Mi pasaporte y mapa de transiciones**, para el trabajador. Elige su ocupación, escribe en pocas palabras qué sabe hacer, confirma sus competencias y ve las ocupaciones a las que puede pasar, con el sustento de cada conexión y un primer paso para conseguir lo que le falta.
2. **Red de empleos formales**, para empresas e instituciones que contratan en planilla. La IA traduce lo que piden a competencias oficiales, la app avisa a quienes las tienen y la empresa elige mirando su pasaporte.

Para empezar, cinco ocupaciones que propuso el Ministerio: personal de limpieza, auxiliares administrativos, operador de almacén, cajeros y vendedores de tienda. También le ayuda a reinventarse si su trabajo está cambiando, por ejemplo por la automatización. Y tiene que ser muy fácil de usar, también para quien usa poco la tecnología. El detalle está en la Parte II del plan.

## Estructura

```
datos/
  fuentes/       documentos oficiales descargados tal cual (no editar)
  procesados/    datos limpios generados por los scripts
  scripts/       conversión de fuentes a datos procesados (solo librería estándar de Python)
docs/
  auditoria/     auditorías de Codex (20-10 y 22-10)
  pitch/         guion del pitch de 1 minuto para el Open Day
spike-qvac/      prueba técnica DESECHABLE de QVAC (no es el producto)
app/             prototipo del concurso: API, web y datos que edita el equipo (ver app/README.md)
```

## Datos

| Archivo | Qué es | Fuente |
|---|---|---|
| `datos/procesados/mtpe_estandares_competencia.json` / `.csv` | 449 estándares de competencia laboral (434 vigentes al 20-10-2026) en 192 perfiles ocupacionales | [MTPE, Matriz de Estándares de Competencia Laboral, 04-09-2026](https://www.gob.pe/institucion/mtpe/informes-publicaciones/2992036-matriz-de-estandares-de-competencia-laboral) |
| `datos/fuentes/mtpe_edo_2026_peru.pdf` | Demanda de nuevos puestos de trabajo para 2026 (empresas formales de 20 a más trabajadores) | [MTPE, Informe EDO 2026](https://www.gob.pe/institucion/mtpe/informes-publicaciones/7490464-informe-de-demanda-de-ocupaciones-en-peru-2026-edo) |
| `datos/fuentes/inei_cno_2015.pdf` | Clasificador Nacional de Ocupaciones 2015 | [INEI](https://www.inei.gob.pe/media/Clasificador_Nacional_de_Ocupaciones_2015_publicado.pdf) |

Para regenerar los datos procesados:

```bash
cd datos && python3 -I scripts/matriz_a_json.py
```

## Prueba técnica de QVAC (`spike-qvac/`)

Requisitos: Node.js ≥ 22.17 y unos 6 GB libres para modelos (se descargan solos a `~/.qvac` la primera vez).

```bash
cd spike-qvac
npm install
node voz.mjs audio/jhon.wav audio/rosa.wav            # compara Whisper vs Parakeet en español
node competencias.mjs audio/rosa.wav                    # v1: la IA juzga todos los candidatos a la vez
node competencias_v2.mjs audio/jhon.wav                 # v2: sí/no por cada par actividad-estándar
```

Resultados y conclusiones en la sección 12 del Plan de Proyecto.

Los audios `audio/*.wav` son **personas ficticias** generadas con la voz sintética de macOS a partir de `audio/*.txt`.
