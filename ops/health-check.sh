#!/usr/bin/env sh
set -eu

BASE_URL="${BASE_URL:-http://localhost}"
BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"

check_url() {
  NAME="$1"
  URL="$2"
  if curl -fsS --max-time 10 "$URL" >/dev/null; then
    echo "OK $NAME $URL"
  else
    echo "Health check failed for $NAME ($URL)" >&2
    exit 1
  fi
}

check_url "frontend" "$BASE_URL"
check_url "backend-actuator" "$BACKEND_URL/actuator/health"
check_url "swagger" "$BACKEND_URL/swagger-ui/index.html"

check_google_oauth_redirect() {
  URL="$BASE_URL/oauth2/authorization/google"
  HEADERS="$(curl -ksS --max-time 10 --max-redirs 0 -D - -o /dev/null "$URL")"
  STATUS="$(printf '%s\n' "$HEADERS" | sed -n '1s/^[^ ]* \([0-9][0-9][0-9]\).*/\1/p')"
  LOCATION="$(printf '%s\n' "$HEADERS" | sed -n 's/^[Ll]ocation:[[:space:]]*//p' | tr -d '\r' | tail -n 1)"

  if [ "$STATUS" != "302" ]; then
    echo "Google OAuth health check expected HTTP 302 but received '$STATUS' from $URL" >&2
    exit 1
  fi

  case "$LOCATION" in
    https://accounts.google.com/*) ;;
    *)
      echo "Google OAuth health check received an unexpected redirect: $LOCATION" >&2
      exit 1
      ;;
  esac

  case "$LOCATION" in
    *redirect_uri=https://*|*redirect_uri=https%3A%2F%2F*) ;;
    *)
      echo "Google OAuth redirect_uri is not HTTPS: $LOCATION" >&2
      exit 1
      ;;
  esac

  echo "OK google-oauth $URL"
}

check_google_oauth_redirect

docker compose ps
