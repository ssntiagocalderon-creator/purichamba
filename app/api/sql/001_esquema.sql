-- Esquema de la base de datos del prototipo (Postgres 16 + pgvector).
-- Se aplica con: npm run db:esquema   (desde app/api)
-- Es idempotente: se puede correr varias veces.

CREATE EXTENSION IF NOT EXISTS vector;

-- Ocupaciones: las cinco de partida del MTPE y sus destinos.
-- Una ocupación del prototipo corresponde a un perfil ocupacional del MTPE (o a un grupo de estándares).
CREATE TABLE IF NOT EXISTS ocupaciones (
  id            text PRIMARY KEY,           -- slug: 'cajero', 'limpieza', ...
  nombre        text NOT NULL,              -- nombre oficial del perfil
  nombre_simple text NOT NULL,              -- como lo diría la persona
  codigo_perfil text,                       -- código del perfil en la matriz (p. ej. G2347002)
  es_origen     boolean NOT NULL DEFAULT false, -- una de las cinco del MTPE
  sin_perfil    boolean NOT NULL DEFAULT false, -- no tiene perfil en la matriz (p. ej. auxiliar administrativo)
  nota          text
);

-- Competencias: por ahora, un estándar de competencia laboral (ECL) por fila.
-- Cuando el equipo estructure las unidades de competencia del Catálogo, se agregan aquí con su propio id.
CREATE TABLE IF NOT EXISTS competencias (
  id            text PRIMARY KEY,           -- código ECL (p. ej. G2347002-1)
  ocupacion_id  text NOT NULL REFERENCES ocupaciones(id) ON DELETE CASCADE,
  descripcion   text NOT NULL,              -- texto oficial del estándar
  texto_simple  text,                       -- versión en palabras de todos los días (la escribe el equipo)
  nivel         text,                       -- nivel de competencia según la matriz
  puestos       text,                       -- puestos asociados según la matriz
  fuente        text NOT NULL,              -- de dónde sale (nombre + fecha)
  fuente_url    text NOT NULL,
  embedding     vector(768)                 -- EmbeddingGemma 300M (D-054); NULL en modo sin IA
);
CREATE INDEX IF NOT EXISTS competencias_ocupacion_idx ON competencias(ocupacion_id);

-- Coincidencias entre pares de competencias de ocupaciones distintas (precalculadas).
-- metodo: 'validado'  (lo marcó el equipo en equivalencias.csv)
--       | 'decision'  (el modelo de decisión Laya juzgó que son la misma tarea; similitud = su probabilidad, D-056)
--       | 'similitud' (embeddings o léxico sobre el umbral).
CREATE TABLE IF NOT EXISTS coincidencias (
  a              text NOT NULL REFERENCES competencias(id) ON DELETE CASCADE,
  b              text NOT NULL REFERENCES competencias(id) ON DELETE CASCADE,
  similitud      real NOT NULL,
  metodo         text NOT NULL CHECK (metodo IN ('validado', 'decision', 'similitud')),
  es_equivalente boolean NOT NULL,
  PRIMARY KEY (a, b)
);
-- Bases creadas antes de D-056: se reemplaza la restricción para aceptar 'decision'.
ALTER TABLE coincidencias DROP CONSTRAINT IF EXISTS coincidencias_metodo_check;
ALTER TABLE coincidencias ADD CONSTRAINT coincidencias_metodo_check CHECK (metodo IN ('validado', 'decision', 'similitud'));

-- Grafo de transiciones ocupación → ocupación (precalculado; pantalla 3 sin perfil personal).
CREATE TABLE IF NOT EXISTS transiciones (
  origen      text NOT NULL REFERENCES ocupaciones(id) ON DELETE CASCADE,
  destino     text NOT NULL REFERENCES ocupaciones(id) ON DELETE CASCADE,
  tiene       integer NOT NULL,             -- competencias del destino cubiertas
  total       integer NOT NULL,             -- competencias que pide el destino
  compartidas jsonb NOT NULL,               -- [{destino, origen, similitud, metodo}]
  faltantes   jsonb NOT NULL,               -- [codigo_destino]
  PRIMARY KEY (origen, destino)
);

-- Perfil de una persona (privado). No se guardan nombre, DNI ni contacto.
CREATE TABLE IF NOT EXISTS perfiles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ocupacion_id  text NOT NULL REFERENCES ocupaciones(id),
  descripcion   text,                       -- lo que escribió la persona
  region        text,
  token_publico text UNIQUE,                -- se crea solo si la persona decide compartir
  creado_en     timestamptz NOT NULL DEFAULT now()
);

-- Respuestas de la persona sobre cada competencia. La IA solo propone; la persona decide (D-004, D-012).
CREATE TABLE IF NOT EXISTS perfil_competencia (
  perfil_id      uuid NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  competencia_id text NOT NULL REFERENCES competencias(id) ON DELETE CASCADE,
  respuesta      text CHECK (respuesta IN ('si', 'a_veces', 'no', 'no_seguro')),
  propuesta_por  text CHECK (propuesta_por IN ('ia', 'reglas')),
  cita           text,                      -- frase exacta de la persona que respalda la propuesta
  PRIMARY KEY (perfil_id, competencia_id)
);

-- Vacantes reales cargadas a mano desde Empleos Perú (D-050). Siempre con enlace y fecha.
CREATE TABLE IF NOT EXISTS vacantes (
  id                serial PRIMARY KEY,
  ocupacion_id      text NOT NULL REFERENCES ocupaciones(id) ON DELETE CASCADE,
  region            text NOT NULL,
  titulo            text NOT NULL,
  empresa           text,
  url               text NOT NULL,
  fecha_publicacion date,
  es_simulada       boolean NOT NULL DEFAULT false
);

-- Primer paso formativo: cursos o certificación para una competencia que falta.
CREATE TABLE IF NOT EXISTS cursos (
  id             serial PRIMARY KEY,
  competencia_id text NOT NULL REFERENCES competencias(id) ON DELETE CASCADE,
  nombre         text NOT NULL,
  tipo           text NOT NULL CHECK (tipo IN ('curso', 'certificacion')),
  url            text NOT NULL,
  horas          integer,
  modalidad      text,
  gratuito       boolean,
  fuente         text NOT NULL
);

-- Lado de la empresa (D-071, por confirmar con Santiago). Nada se carga de antemano: solo empresas reales que se
-- registran (D-059). Los avisos van en su propia tabla porque `vacantes` se recarga entera desde vacantes.csv.
CREATE TABLE IF NOT EXISTS empresas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruc          text NOT NULL UNIQUE,         -- 11 dígitos con dígito verificador válido
  razon_social text NOT NULL,
  region       text NOT NULL,
  correo       text NOT NULL,                -- para avisarle de postulaciones
  verificada   boolean NOT NULL DEFAULT false, -- true solo tras consultar el padrón de SUNAT (activo y habido, D-068)
  token_panel  text NOT NULL UNIQUE,         -- enlace privado al panel; sin contraseñas
  creado_en    timestamptz NOT NULL DEFAULT now()
);

-- Aviso de una empresa registrada. Sin planilla, sueldo ni seguro social no se publica (D-068).
CREATE TABLE IF NOT EXISTS avisos (
  id            serial PRIMARY KEY,
  empresa_id    uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  ocupacion_id  text NOT NULL REFERENCES ocupaciones(id) ON DELETE CASCADE,
  titulo        text NOT NULL,
  region        text NOT NULL,
  sueldo        integer NOT NULL CHECK (sueldo > 0), -- soles al mes
  en_planilla   boolean NOT NULL CHECK (en_planilla),
  seguro_social boolean NOT NULL CHECK (seguro_social),
  url           text,                        -- el mismo aviso en Empleos Perú, si también lo publicó ahí
  activo        boolean NOT NULL DEFAULT true,
  creado_en     timestamptz NOT NULL DEFAULT now()
);

-- Estándares oficiales que pide el aviso: con ellos la persona ve "Tienes 2 de 3 tareas" frente al aviso.
CREATE TABLE IF NOT EXISTS aviso_competencia (
  aviso_id       integer NOT NULL REFERENCES avisos(id) ON DELETE CASCADE,
  competencia_id text NOT NULL REFERENCES competencias(id) ON DELETE CASCADE,
  PRIMARY KEY (aviso_id, competencia_id)
);

-- La persona decide a quién postular. El contacto lo deja ella, solo para esa empresa.
CREATE TABLE IF NOT EXISTS postulaciones (
  id        serial PRIMARY KEY,
  aviso_id  integer NOT NULL REFERENCES avisos(id) ON DELETE CASCADE,
  perfil_id uuid NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  contacto  text NOT NULL,
  estado    text NOT NULL DEFAULT 'nueva' CHECK (estado IN ('nueva', 'vista')),
  creado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (aviso_id, perfil_id)
);
