#!/usr/bin/env bash
# ==============================================================================
# Anvaya / JoyVerse — deployment preflight check
#
# Run this BEFORE `docker compose --env-file .env.production up -d --build`.
# It verifies every precondition that, if missing, makes the whole site appear
# "stuck / nothing works". Exits non-zero (and tells you exactly what's wrong)
# if anything is misconfigured.
#
#   chmod +x preflight.sh && ./preflight.sh
# ==============================================================================
set -uo pipefail
cd "$(dirname "$0")"

RED=$'\e[31m'; GRN=$'\e[32m'; YEL=$'\e[33m'; CLR=$'\e[0m'
fail=0
ok()   { echo "${GRN}✓${CLR} $1"; }
bad()  { echo "${RED}✗ $1${CLR}"; fail=1; }
warn() { echo "${YEL}!${CLR} $1"; }

echo "── Anvaya deployment preflight ─────────────────────────────────────"

# 1. env file -----------------------------------------------------------------
ENV_FILE=".env.production"
if [[ -f "$ENV_FILE" ]]; then
  ok "$ENV_FILE present"
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE" 2>/dev/null; set +a

  [[ -n "${MONGO_URI:-}" && "$MONGO_URI" != *YOURUSER* ]] \
    && ok "MONGO_URI set" || bad "MONGO_URI missing or still the placeholder — backend will crash-loop (process.exit) and the frontend will never start (it is health-gated on the backend)."

  if [[ -n "${JWT_SECRET:-}" && "${#JWT_SECRET}" -ge 32 && "$JWT_SECRET" != CHANGE_ME* ]]; then
    ok "JWT_SECRET set (${#JWT_SECRET} chars)"
  else
    bad "JWT_SECRET missing/too short/placeholder (need ≥32 chars) — backend exits on startup."
  fi

  if [[ -n "${CORS_ORIGINS:-}" && "$CORS_ORIGINS" != *yourdomain* ]]; then
    ok "CORS_ORIGINS set ($CORS_ORIGINS)"
  else
    warn "CORS_ORIGINS unset/placeholder — must include your real https origin (e.g. https://joyv.it.com) or cross-origin API calls are rejected."
  fi

  # REACT_APP_API_URL is now OPTIONAL (app falls back to same-origin). Only warn.
  if [[ -z "${REACT_APP_API_URL:-}" ]]; then
    warn "REACT_APP_API_URL unset — app will use SAME-ORIGIN /api requests (fine, since nginx proxies /api on the same domain)."
  elif [[ "$REACT_APP_API_URL" == *yourdomain* || "$REACT_APP_API_URL" == *localhost* ]]; then
    bad "REACT_APP_API_URL is '$REACT_APP_API_URL' — placeholder/localhost will break the browser. Set it to https://joyv.it.com, or leave it EMPTY for same-origin."
  else
    ok "REACT_APP_API_URL=$REACT_APP_API_URL"
  fi
else
  bad "$ENV_FILE not found. Run: cp .env.production.example .env.production  and fill it in."
fi

# 2. TLS certs ----------------------------------------------------------------
# These MUST exist or the nginx reverse proxy container fails to start and the
# ENTIRE site is down. The camera also needs real HTTPS (secure context).
if [[ -f nginx/certs/fullchain.pem && -f nginx/certs/privkey.pem ]]; then
  ok "TLS certs present (nginx/certs/)"
  if command -v openssl >/dev/null; then
    exp=$(openssl x509 -enddate -noout -in nginx/certs/fullchain.pem 2>/dev/null | cut -d= -f2)
    [[ -n "$exp" ]] && echo "    cert expires: $exp"
  fi
else
  bad "nginx/certs/fullchain.pem and/or privkey.pem MISSING — the nginx container will crash-loop and the whole site is down. See the cert instructions printed below."
fi

# 3. docker -------------------------------------------------------------------
if command -v docker >/dev/null && docker compose version >/dev/null 2>&1; then
  ok "docker + compose available"
else
  bad "docker / docker compose not available on PATH."
fi

echo "────────────────────────────────────────────────────────────────────"
if [[ "$fail" -eq 0 ]]; then
  echo "${GRN}Preflight passed — safe to deploy:${CLR}"
  echo "  docker compose --env-file .env.production up -d --build"
else
  echo "${RED}Preflight FAILED — fix the ✗ items above before deploying.${CLR}"
  cat <<'EOF'

To obtain real TLS certs for joyv.it.com (one-time, on the server, port 80 free):
  sudo apt-get install -y certbot
  sudo certbot certonly --standalone -d joyv.it.com -d www.joyv.it.com
  mkdir -p nginx/certs
  sudo cp /etc/letsencrypt/live/joyv.it.com/fullchain.pem nginx/certs/
  sudo cp /etc/letsencrypt/live/joyv.it.com/privkey.pem   nginx/certs/
  sudo chown "$USER" nginx/certs/*.pem

(For LOCAL testing only — browser will warn, but it is still a secure context:
  mkdir -p nginx/certs && openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout nginx/certs/privkey.pem -out nginx/certs/fullchain.pem \
    -days 365 -subj "/CN=localhost" )
EOF
fi
exit "$fail"
