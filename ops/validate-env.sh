#!/usr/bin/env sh
set -eu

ENV_FILE="${ENV_FILE:-.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing env file: $ENV_FILE. Copy .env.example to .env and fill real values." >&2
  exit 1
fi

get_env() {
  (grep -E "^$1=" "$ENV_FILE" || true) | tail -n 1 | cut -d= -f2- | sed "s/^['\"]//;s/['\"]$//"
}

REQUIRED="MYSQL_ROOT_PASSWORD MYSQL_DATABASE MYSQL_USER MYSQL_PASSWORD SPRING_DATASOURCE_URL SPRING_DATASOURCE_USERNAME SPRING_DATASOURCE_PASSWORD SPRING_JPA_HIBERNATE_DDL_AUTO JWT_SECRET_KEY FRONTEND_BASE_URL SPRING_MAIL_HOST SPRING_MAIL_PORT SPRING_MAIL_USERNAME SPRING_MAIL_PASSWORD GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET VNPAY_TMN_CODE VNPAY_HASH_SECRET VNPAY_RETURN_URL VNPAY_IPN_URL"
ERRORS=0

for KEY in $REQUIRED; do
  VALUE="$(get_env "$KEY")"
  if [ -z "$VALUE" ] || printf '%s' "$VALUE" | grep -q '^change-me'; then
    echo "Missing or placeholder value: $KEY" >&2
    ERRORS=1
  fi
done

MYSQL_DATABASE="$(get_env MYSQL_DATABASE)"
MYSQL_USER="$(get_env MYSQL_USER)"
MYSQL_PASSWORD="$(get_env MYSQL_PASSWORD)"
SPRING_DATASOURCE_URL="$(get_env SPRING_DATASOURCE_URL)"
SPRING_DATASOURCE_USERNAME="$(get_env SPRING_DATASOURCE_USERNAME)"
SPRING_DATASOURCE_PASSWORD="$(get_env SPRING_DATASOURCE_PASSWORD)"
SPRING_JPA_HIBERNATE_DDL_AUTO="$(get_env SPRING_JPA_HIBERNATE_DDL_AUTO)"
JWT_SECRET_KEY="$(get_env JWT_SECRET_KEY)"

JDBC_DATABASE="$(printf '%s' "$SPRING_DATASOURCE_URL" | sed -n 's#.*3306/\([^?]*\).*#\1#p')"
if [ "$JDBC_DATABASE" != "" ] && [ "$MYSQL_DATABASE" != "$JDBC_DATABASE" ]; then
  echo "MYSQL_DATABASE '$MYSQL_DATABASE' does not match SPRING_DATASOURCE_URL database '$JDBC_DATABASE'." >&2
  ERRORS=1
fi

if [ "$SPRING_DATASOURCE_USERNAME" != "$MYSQL_USER" ]; then
  echo "SPRING_DATASOURCE_USERNAME must match MYSQL_USER." >&2
  ERRORS=1
fi

if [ "$SPRING_DATASOURCE_PASSWORD" != "$MYSQL_PASSWORD" ]; then
  echo "SPRING_DATASOURCE_PASSWORD must match MYSQL_PASSWORD." >&2
  ERRORS=1
fi

case "$SPRING_JPA_HIBERNATE_DDL_AUTO" in
  validate|none|update) ;;
  *)
    echo "SPRING_JPA_HIBERNATE_DDL_AUTO should be validate/none in production, update only for local demo." >&2
    ERRORS=1
    ;;
esac

if [ "${#JWT_SECRET_KEY}" -lt 64 ]; then
  echo "JWT_SECRET_KEY should be at least 64 characters." >&2
  ERRORS=1
fi

if [ "$ERRORS" -ne 0 ]; then
  exit 1
fi

echo "Environment validation passed: $ENV_FILE"
