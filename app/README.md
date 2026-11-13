# PURICHAMBA · prototipo

Antes se llamaba Pasaporte de Oficio: el equipo le cambió el nombre el 29-10 (D-072).

Prototipo del concurso, construido sobre la base técnica D-049 (Plan, sección 10): API en Node.js con Fastify, Postgres con pgvector y QVAC para la IA local. `spike-qvac/` sigue siendo desechable; el producto vive aquí.

```
app/
  api/                 API (Fastify) + scripts de datos
    sql/               esquema de la base de datos
    src/
      cobertura.js     fórmula fija de transiciones (sin IA)
      ia.js            capa de IA: QVAC o modo sin IA
      rutas/           ocupaciones, transiciones, perfiles, vacantes
    scripts/           aplicar esquema, cargar datos, precalcular transiciones
    test/              pruebas (npm test)
  web/                 web pensada para el celular (Vite + React)
  datos/               lo que edita el equipo (sin tocar código)
  docker-compose.yml   solo Postgres; QVAC corre fuera de Docker
```

## Cómo correrlo

Requisitos: Node.js ≥ 22.17 y Docker (para Postgres).

```bash
# 1. Base de datos
cd app && docker compose up -d

# 2. API: esquema, datos y transiciones precalculadas
cd api
cp .env.example .env          # IA_MODO=sin_ia para empezar sin descargar modelos
npm install
npm run preparar
npm run dev                   # http://127.0.0.1:3000/api/salud

# 3. Web (otra terminal)
cd ../web
npm install
npm run dev                   # http://localhost:5173 (redirige /api a la API)
```

### Demo para mostrar (opción 01 de Tether: web + servidor + ngrok)

Un solo proceso: la API construye y sirve la web, y QVAC corre dentro de la API sin exponerse.

```bash
cd app/web && npm install          # una vez
cd ../api
# en .env: ACCESO_CLAVE=<una clave para el equipo y el jurado>  (obligatoria con ngrok, la pidió Tether)
npm run demo                       # http://127.0.0.1:3000
ngrok http 3000                    # otra terminal: da un enlace https para abrir en cualquier celular
```

El navegador pide usuario y clave una sola vez; el usuario puede ser cualquiera. Sin `ACCESO_CLAVE`, la API avisa al arrancar y no pide nada: así solo debe usarse en la propia máquina.

**Recorrido que funciona hoy (modo sin IA):** Cajero de tienda → escribir "Atiendo a los clientes, cobro en caja con efectivo y tarjeta, y al cerrar cuadro la caja con mi supervisora" → la app reconoce 2 competencias con la frase de cada una → responder "Sí" a esas dos → mapa: **Cajero de banco o financiera, 2 de 3 tareas · 67 %** → detalle: ya haces abrir la caja y cuadrarla y cerrarla; te falta hacer las operaciones de caja del banco, con el curso de educación financiera y dónde certificarte (D-058). Es el mismo ejemplo de la cajera que usó el MTPE.

**Prender y apagar la demo en la Mac:** `bash app/demo.sh` prende Postgres, la app con QVAC y el túnel (ngrok si tiene cuenta; si no, cloudflared), y muestra los enlaces. `bash app/demo.sh --apagar` lo apaga todo. Es el equivalente del `demo.ps1` de César en Windows.

**Demo en la Mac de Santiago (29-10, plan v0.68).** En `api/.env`: `IA_MODO=qvac`, `PROPUESTAS=llm` con `QVAC_MODELO_LLM=QWEN3_8B_INST_Q4_K_M` (acertó en los tres textos de prueba y Laya no, C-97), `EXPLICACION=tether` con `TETHER_URL` y `TETHER_TOKEN`, y `ACCESO_CLAVE`. Postgres corre en el contenedor `pasaporte-db` (`docker start pasaporte-db` después de `colima start`). Luego `npm run demo`: los modelos cargan en unos 10 s con la caché. En vivo, usar el texto del cajero: la app todavía no reconoce oficios de otras ocupaciones (D-063).

### Con QVAC (IA local)

**Paso 1: la prueba, sin Postgres ni Docker.** Solo hace falta Node ≥ 22.17 y unos 6 GB libres. Funciona en Mac, Linux y Windows.

```bash
cd app/api
npm install                  # instala también @qvac/sdk
npm run qvac:probar          # la primera vez descarga los modelos (varios GB) a ~/.qvac
```

Mide y guarda en `api/resultados/qvac-<fecha>.json`:
1. cuánto tardan en cargar los modelos;
2. **el modelo de decisión Laya** (D-056, recomendación de Tether): la probabilidad de que dos competencias sean "la misma tarea", para los 250 pares de ocupaciones distintas y para los pares de calibración de `datos/equivalencias.csv` (incluidas las sugerencias comentadas). **Sugiere un `UMBRAL_DECISION`** si los pares "si" y "no" se separan;
3. lo mismo con EmbeddingGemma (sin la coletilla común del MTPE), para comparar cuál separa mejor. Se salta con `PROBAR_EMBEDDINGS=no`;
4. las propuestas para tres relatos ficticios (cajera, limpieza, almacén), con Laya o con Qwen3 según `PROPUESTAS`, con su tiempo;
5. una explicación de transición, con el servidor de Tether, Qwen3 local o la plantilla según `EXPLICACION`.

La meta para la demo es menos de 10 s por respuesta. Suban el JSON al repo: es la evidencia para el plan y para Tether.

**Paso 2: el servidor de Tether.** Pongan `TETHER_URL` y `TETHER_TOKEN` **solo en `api/.env`** (nunca en código, commits, capturas ni chats) y corran:

```bash
npm run tether:probar        # lista los modelos, mide una explicación y prueba json_schema
```

El nombre del modelo que imprime va en `TETHER_MODELO`. Con `EXPLICACION=tether`, la app manda al servidor solo los nombres de las ocupaciones y los textos oficiales de las competencias; **el relato de la persona nunca sale de la máquina** (las propuestas se hacen con Laya local). Si el servidor falla o tarda más de `TETHER_TIMEOUT_MS`, se muestra la plantilla.

**Paso 3: la app con QVAC.** En `api/.env`, `IA_MODO=qvac` y los umbrales que salieron del paso 1. Luego `npm run preparar`, que juzga los pares con Laya y recalcula las transiciones, y `npm run demo`. El servidor **carga solo los modelos que usa** antes de abrir el puerto, así la primera persona de la demo no espera; `/api/salud` muestra qué modelo hace cada paso, si están listos y cuánto tardaron.

| Variable | Opciones (la primera es la de por defecto) |
|---|---|
| `PROPUESTAS` | `decision` (Laya) · `llm` (Qwen3 local con JSON Schema) |
| `EQUIVALENCIAS` | `decision` (Laya juzga cada par) · `embeddings` (EmbeddingGemma + umbral) |
| `EXPLICACION` | `tether` si hay `TETHER_URL`, si no `plantilla` · `local` (Qwen3) |

Modelos por defecto: Laya multilingüe 322M (`LAYA_MULTILINGUAL_322M_Q8_0`), Parakeet para la voz y, solo si se eligen, EmbeddingGemma 300M y Qwen3 4B. Se cambian con `QVAC_MODELO_*` (constantes del SDK). La documentación de QVAC no dice qué idiomas cubre Laya multilingüe: por eso la calibración con pares en español es obligatoria antes de la demo.

**Por qué el SDK y no `qvac serve --openai` (D-055):** es un proceso menos que mantener vivo en la demo y QVAC no se expone; lo único accesible es la API, con clave. Las dos vías garantizan el JSON de las propuestas: el SDK con `responseFormat` y el servidor con `response_format: { type: 'json_schema' }` ([documentación oficial](https://docs.qvac.tether.io/cli/http-server/)). Con modelos que razonan (Qwen3), hay que desactivar el razonamiento (`/no_think` o `reasoning_budget: false`) o dar suficiente `max_tokens`, o la respuesta puede salir vacía.

**Qué cuenta como "ya la tienes"** (Plan, D-057, confirmada por Santiago): solo lo que la persona confirmó y las equivalencias validadas a mano (`datos/equivalencias.csv` y los "sí" de `datos/pares_marcados.csv`). Laya, EmbeddingGemma y cualquier umbral solo sugieren: la persona decide. Lo que falta para el cajero de banco son las operaciones propias del banco (D-058), y eso se cuenta por tareas (issue #6).

## Qué hace la IA y qué no

| Paso | Quién decide |
|---|---|
| Proponer qué competencias describe la persona, con la frase textual que lo respalda | Laya (QVAC, local) o reglas; se descartan códigos fuera de la lista y citas que no están en el texto |
| Confirmar cada competencia (Sí / A veces / No / No estoy seguro, nada marcado de antemano) | La persona (D-004, D-012) |
| Si dos competencias son equivalentes | Equipo (`datos/equivalencias.csv`) y, si no hay revisión, Laya ("¿son la misma tarea?") sobre un umbral |
| "Tienes 3 de 4 competencias · 75 %" | Fórmula fija, pesos iguales (D-052) |
| Explicar la transición en lenguaje simple | Plantilla; con IA (servidor de Tether o Qwen3 local), el LLM solo reformula los mismos datos |

## Lo que edita el equipo (`app/datos/`)

Después de editar, `npm run preparar` en `api/`.

| Archivo | Qué es | Quién |
|---|---|---|
| `ocupaciones.json` | Ocupaciones y los estándares (ECL) de la matriz que componen cada una | Producto y datos |
| `textos_simples.csv` | Cada estándar en palabras de todos los días (D-043) | Diseño de la experiencia |
| `equivalencias.csv` | Pares de estándares revisados a mano: "es la misma" o no (D-053). Mandan sobre el umbral | Investigación |
| `vacantes.csv` | 5 o 6 vacantes reales de Empleos Perú por ocupación de destino, con enlace y fecha (D-050). Se traen con `python3 -I api/scripts/vacantes_empleos_peru.py datos/vacantes.csv`; vencen, así que hay que volver a traerlas antes de la demo | Negocio |
| `cursos.csv` | Primer paso verificable: cursos CAPACITA-T o certificación (D-041). Se llenan con `python3 -I api/scripts/cursos_capacitat.py datos/cursos.csv`, que dice qué curso va con qué competencia | Economía |
| `pares_por_marcar.csv` | 60 pares de tareas elegidos para marcar si son la misma (D-053). El Excel está en `docs/equipo/pares_por_marcar.xlsx` | Producto y datos |
| `pares_marcados.csv` | 115 pares de tareas ya marcados por Claude con su razón (D-056). Los 12 "sí" son las equivalencias que cuenta la app (D-057); los "no sé" los revisa Santiago | Producto y datos |
| `tareas.csv` | Las tareas (elementos de competencia) de cada estándar, que es lo que cuenta la app (D-070). Se rehace con `python3 -I app/api/scripts/tareas_desde_perfiles.py` desde la raíz del repo; los textos simples los escribe el equipo | Producto y datos |
| `puestos_de_entrada.csv` | Qué estándares definen el puesto al que se postula en cada ocupación: la app cuenta sus tareas (D-070). Propuesta de Claude, por revisar | Producto y datos |
| `pares_clave.csv` | Códigos y similitud de cada par, para calibrar el umbral. No mirarlo antes de marcar | Producto y datos |

## Estado y pendientes

Funciona de punta a punta en modo sin IA: elegir ocupación, escribir, confirmar competencias, mapa de transiciones, detalle con sustento oficial, pasaporte compartible de solo lectura y acceso con clave para la demo.

- **Datos (lo más importante):** hoy cada competencia es un estándar (ECL) de la matriz, de 2 a 4 por ocupación. Con tan poco detalle, almacén y vendedor no muestran conexiones. El detalle de 8 perfiles ya está en `datos/procesados/mtpe_perfiles_detalle.csv` (elementos, criterios de desempeño y conocimientos; Plan, C-71); falta conectarlo a la app (issue #6).
- **Equivalencias:** `datos/equivalencias.csv` trae sugerencias comentadas para que el equipo las revise y active.
- **Textos simples:** `datos/textos_simples.csv` es un borrador de Claude; revisarlo con Diseño de la experiencia.
- **Umbral:** el modo sin IA usa 0,4 (con 0,3 salían conexiones dudosas, como supervisar almacén ↔ atender huéspedes). Con QVAC, calibrar `UMBRAL_DECISION` con pares marcados a mano (Plan, sección 10.3).
- **Auxiliar administrativo:** sin perfil en la matriz; aparece deshabilitado hasta tener el mapa funcional.
- **Por probar con QVAC en la Mac:** `IA_MODO=qvac` (embeddings y propuestas).
- **Voz:** botón "Prefiero hablar" en la pantalla 2, solo con `IA_MODO=qvac`. El navegador graba, convierte a PCM 16 kHz mono y lo manda a `POST /api/voz`; Parakeet transcribe en memoria (el audio no se guarda) y el texto queda en el campo para que la persona lo corrija. Sin micrófono o sin el modelo, el botón no aparece o avisa, y todo sigue por texto. `npm run voz:probar` mide la voz con los audios ficticios del spike. En una laptop Windows (Core Ultra 9, sin GPU dedicada), con los otros modelos cargados: WER 5,1 % y 4,3 %, como en la Mac; unos 3,5 s para 12 s de audio y 8–12 s para 40 s. Falta probar con voces reales y acento peruano.
- **Lado de la empresa (D-071, confirmada el 29-10: en la demo solo se usa con una empresa real; si no la hay, se muestra con el mockup):** en la pantalla 1, «¿Eres una empresa formal? Publica un empleo» lleva a `#/empresa`. La empresa se registra con su RUC (11 dígitos con dígito verificador de SUNAT; activo y habido queda pendiente) y recibe un enlace privado a su panel (`#/empresa/<token>`), sin contraseña. Publica avisos con la ocupación, los estándares que pide, sueldo, planilla y seguro social (sin eso no se publica, D-068). La persona ve esos avisos en el detalle con su «Tienes X de Y tareas» y decide si postula dejando un teléfono o correo. No se carga ninguna empresa de antemano (D-059).
- **Región (D-074):** en la pantalla 1, lista de los 25 departamentos (Lima por defecto) y botón "Usar mi ubicación". El celular convierte el GPS a departamento con `web/src/datos/departamentos.json` (geoBoundaries, dominio público, cargado solo al usar el botón) y descarta las coordenadas: al servidor solo llega la región. Las vacantes de esa región salen primero; si no hay, se avisa y se muestran otras. **El GPS solo funciona en `https` o `localhost`:** con ngrok sí; por `http://<IP>` en la red local, el botón avisa y queda la lista. Pruebas: `npm test` en `web/` (12 ciudades, fuera del Perú y los 25 departamentos).
- **Vacantes, cursos y certificación:** ya hay 13 vacantes reales de Empleos Perú, 12 cursos gratuitos de CAPACITA-T y, en `datos/cursos.csv`, dónde certificarse en Lima para 22 de los 24 estándares (Plan, C-72, C-73 y C-78). Falta revisar con el equipo qué curso va con qué competencia.
- **Estilo gob.pe:** colores provisionales; ajustar a la guía oficial (Plan, sección 10.1).
