#!/bin/bash
# Prende o apaga la demo en una Mac (la de Santiago): Postgres en Docker con Colima, la API con QVAC (que sirve la
# web) y el túnel para abrirla desde los celulares. Es el equivalente del demo.ps1 de César en Windows.
#
#   bash app/demo.sh            prende todo y muestra los enlaces
#   bash app/demo.sh --apagar   apaga el túnel, la API y la base de datos
#
# El túnel usa ngrok si tiene una cuenta configurada (ngrok config add-authtoken) y, si no, cloudflared, que no pide
# cuenta. Con SIN_TUNEL=1 no se abre ningún túnel. Colima no se apaga: otros proyectos de la Mac usan sus contenedores.
set -u
export PATH="$HOME/.local/bin:$PATH"
APP="$(cd "$(dirname "$0")" && pwd)"
API="$APP/api"
ESTADO="$APP/.demo"
CONTENEDOR=pasaporte-db
mkdir -p "$ESTADO"
PUERTO=$(grep -E '^PUERTO=' "$API/.env" 2>/dev/null | cut -d= -f2-)
PUERTO=${PUERTO:-3000}
CLAVE=$(grep -E '^ACCESO_CLAVE=' "$API/.env" 2>/dev/null | cut -d= -f2-)

aviso() { printf '%s\n' "$*"; }
vivo() { [ -f "$ESTADO/$1.pid" ] && kill -0 "$(cat "$ESTADO/$1.pid")" 2>/dev/null; }
salud() {
  if [ -n "$CLAVE" ]; then
    curl -s -m 3 -o /dev/null -w '%{http_code}' -u "demo:$CLAVE" "http://127.0.0.1:$PUERTO/api/salud"
  else
    curl -s -m 3 -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PUERTO/api/salud"
  fi
}
primero() { for c in "$@"; do [ -n "$c" ] && [ -x "$c" ] && { echo "$c"; return; }; done; }
enlace_tunel() {
  if [ "$(cat "$ESTADO/tunel.tipo" 2>/dev/null)" = ngrok ]; then
    curl -s -m 3 http://127.0.0.1:4040/api/tunnels | grep -o -E '"public_url":"https://[^"]+' | head -1 | cut -d'"' -f4
  else
    grep -o -E 'https://[a-z0-9-]+\.trycloudflare\.com' "$ESTADO/tunel.log" 2>/dev/null | head -1
  fi
}

apagar() {
  for nombre in tunel api cafeina; do
    if vivo "$nombre"; then kill "$(cat "$ESTADO/$nombre.pid")" 2>/dev/null && aviso "✓ $nombre: apagado"; fi
    rm -f "$ESTADO/$nombre.pid"
  done
  # También lo que se haya prendido a mano.
  pkill -f "cloudflared tunnel" 2>/dev/null
  pkill -f "ngrok http" 2>/dev/null
  pkill -f "node --env-file-if-exists=.env src/server.js" 2>/dev/null
  docker stop "$CONTENEDOR" >/dev/null 2>&1 && aviso "✓ base de datos: apagada"
  aviso "Listo: todo apagado."
}

prender() {
  # 1. Docker (Colima) y Postgres
  if ! docker info >/dev/null 2>&1; then
    aviso "… prendiendo Colima (Docker)"
    colima start >/dev/null 2>&1 || { aviso "✗ Colima no arrancó"; exit 1; }
  fi
  if ! docker ps --format '{{.Names}}' | grep -qx "$CONTENEDOR"; then
    if docker ps -a --format '{{.Names}}' | grep -qx "$CONTENEDOR"; then
      docker start "$CONTENEDOR" >/dev/null
    else
      docker run -d --name "$CONTENEDOR" -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=pasaporte \
        -p 127.0.0.1:5432:5432 -v pasaporte-pgdata:/var/lib/postgresql/data pgvector/pgvector:pg16 >/dev/null
    fi
  fi
  for _ in $(seq 1 30); do docker exec "$CONTENEDOR" pg_isready -U postgres -d pasaporte >/dev/null 2>&1 && break; sleep 1; done
  aviso "✓ base de datos lista"

  # 2. Dependencias y datos (solo si faltan)
  [ -d "$API/node_modules" ] || (cd "$API" && npm install --no-audit --no-fund >/dev/null)
  [ -d "$APP/web/node_modules" ] || (cd "$APP/web" && npm install --no-audit --no-fund >/dev/null)
  ocupaciones=$(docker exec "$CONTENEDOR" psql -U postgres -d pasaporte -Atc 'SELECT count(*) FROM ocupaciones' 2>/dev/null)
  if [ "${ocupaciones:-0}" = "0" ]; then
    aviso "… cargando los datos (npm run preparar)"
    (cd "$API" && npm run preparar >"$ESTADO/preparar.log" 2>&1) || { aviso "✗ falló la carga: mira $ESTADO/preparar.log"; exit 1; }
  fi

  # 3. La app con QVAC
  if [ "$(salud)" != "200" ]; then
    aviso "… prendiendo la app con QVAC (los modelos cargan en 10 a 80 s)"
    (cd "$API" && nohup npm run demo >"$ESTADO/api.log" 2>&1 & echo $! >"$ESTADO/api.pid")
    for _ in $(seq 1 120); do [ "$(salud)" = "200" ] && break; sleep 2; done
    [ "$(salud)" = "200" ] || { aviso "✗ la app no respondió: mira $ESTADO/api.log"; exit 1; }
  fi
  aviso "✓ app lista en esta Mac: http://127.0.0.1:$PUERTO"

  # 4. Que la Mac no se duerma mientras está prendida
  vivo cafeina || { caffeinate -dims >/dev/null 2>&1 & echo $! >"$ESTADO/cafeina.pid"; }

  # 5. Túnel para los celulares
  if [ "${SIN_TUNEL:-}" = "1" ]; then
    aviso "· sin túnel (SIN_TUNEL=1): la app solo se abre en esta Mac"
  elif vivo tunel; then
    aviso "✓ enlace para celulares: $(enlace_tunel)"
  elif pgrep -f "cloudflared tunnel|ngrok http" >/dev/null; then
    aviso "· ya hay un túnel abierto a mano; para que este archivo lo maneje, apágalo con --apagar y vuelve a prender"
  else
    NGROK=$(primero "$(command -v ngrok)" "$HOME/Downloads/ngrok" "$HOME/.local/bin/ngrok")
    CLOUD=$(primero "$(command -v cloudflared)" "$HOME/.local/bin/cloudflared" "$HOME/Downloads/cloudflared")
    if [ -n "$NGROK" ] && "$NGROK" config check >/dev/null 2>&1; then
      echo ngrok >"$ESTADO/tunel.tipo"
      nohup "$NGROK" http "127.0.0.1:$PUERTO" --log stdout >"$ESTADO/tunel.log" 2>&1 & echo $! >"$ESTADO/tunel.pid"
    elif [ -n "$CLOUD" ]; then
      echo cloudflared >"$ESTADO/tunel.tipo"
      nohup "$CLOUD" tunnel --no-autoupdate --url "http://127.0.0.1:$PUERTO" >"$ESTADO/tunel.log" 2>&1 & echo $! >"$ESTADO/tunel.pid"
    else
      aviso "! no hay ngrok con cuenta ni cloudflared: la app solo se abre en esta Mac"
    fi
    if vivo tunel; then
      for _ in $(seq 1 30); do [ -n "$(enlace_tunel)" ] && break; sleep 1; done
      aviso "✓ enlace para celulares: $(enlace_tunel)"
    fi
  fi
  aviso "Clave de acceso: la línea ACCESO_CLAVE de app/api/.env (el usuario puede ser cualquiera)."
  aviso "Para apagar todo: bash $APP/demo.sh --apagar"
}

case "${1:-}" in
  --apagar|-apagar|apagar) apagar ;;
  "") prender ;;
  *) aviso "Uso: bash app/demo.sh [--apagar]"; exit 1 ;;
esac
