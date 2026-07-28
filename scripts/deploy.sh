#!/usr/bin/env bash
#
# Deploy dist/ to Hostinger shared hosting over SSH.
#
#   pnpm deploy          # verify (typecheck + tests + build + checks) then upload
#   bash scripts/deploy.sh --dry-run
#
# Reads credentials from .env (gitignored). Never hardcode them here.

set -euo pipefail

cd "$(dirname "$0")/.."

DRY_RUN=""
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN="--dry-run"

if [[ ! -f .env ]]; then
  echo "✗ .env not found. Copy .env.example to .env and fill in the HOSTINGER_SSH_* values." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source ./.env
set +a

missing=()
for var in HOSTINGER_SSH_HOST HOSTINGER_SSH_USER HOSTINGER_REMOTE_PATH; do
  [[ -z "${!var:-}" ]] && missing+=("$var")
done

if (( ${#missing[@]} > 0 )); then
  echo "✗ Missing in .env: ${missing[*]}" >&2
  echo "  Find them in hPanel → Websites → forestaindia.com → Advanced → SSH Access." >&2
  exit 1
fi

PORT="${HOSTINGER_SSH_PORT:-65002}"
TARGET="${HOSTINGER_SSH_USER}@${HOSTINGER_SSH_HOST}"

if [[ ! -d dist ]]; then
  echo "✗ dist/ not found. Run 'pnpm build' first." >&2
  exit 1
fi

# Refuse to ship credentials even if someone put them in public/.
if [[ -f dist/secrets.php ]]; then
  echo "✗ dist/secrets.php exists. Credentials must live on the server only. Aborting." >&2
  exit 1
fi

# Key auth is preferred. Password auth falls back to sshpass.
SSH_CMD=(ssh -p "$PORT" -o StrictHostKeyChecking=accept-new)
RSYNC_PREFIX=()

if [[ -n "${HOSTINGER_SSH_KEY:-}" ]]; then
  KEY_PATH="${HOSTINGER_SSH_KEY/#\~/$HOME}"
  if [[ ! -f "$KEY_PATH" ]]; then
    echo "✗ HOSTINGER_SSH_KEY points at $KEY_PATH, which does not exist." >&2
    exit 1
  fi
  SSH_CMD+=(-i "$KEY_PATH" -o IdentitiesOnly=yes)
elif [[ -n "${HOSTINGER_SSH_PASS:-}" ]]; then
  if ! command -v sshpass >/dev/null 2>&1; then
    echo "✗ HOSTINGER_SSH_PASS is set but sshpass is not installed (brew install sshpass)." >&2
    exit 1
  fi
  RSYNC_PREFIX=(sshpass -p "$HOSTINGER_SSH_PASS")
else
  echo "✗ Set either HOSTINGER_SSH_KEY or HOSTINGER_SSH_PASS in .env." >&2
  exit 1
fi

echo "→ Deploying dist/ to ${TARGET}:${HOSTINGER_REMOTE_PATH} (port ${PORT})"
[[ -n "$DRY_RUN" ]] && echo "  DRY RUN — nothing will be written."

# --delete keeps the remote a mirror of dist/, with three exceptions that must
# survive a deploy: the credentials include, any PHPMailer vendor dir installed
# on the server, and cPanel's own directories.
${RSYNC_PREFIX[@]+"${RSYNC_PREFIX[@]}"} rsync \
  --archive --compress --human-readable --delete $DRY_RUN \
  --exclude 'secrets.php' \
  --exclude 'vendor/' \
  --exclude '.well-known/' \
  --exclude 'cgi-bin/' \
  --exclude '.htpasswd' \
  -e "${SSH_CMD[*]}" \
  dist/ "${TARGET}:${HOSTINGER_REMOTE_PATH}/"

if [[ -n "$DRY_RUN" ]]; then
  echo "✓ Dry run complete."
  exit 0
fi

# macOS ships openrsync, which has no --chmod. Normalise permissions on the
# server instead, so this works regardless of which rsync is local.
echo "→ Normalising permissions"
"${SSH_CMD[@]}" "$TARGET" "
  cd '$HOSTINGER_REMOTE_PATH' || exit 1
  find . -type d -exec chmod 755 {} +
  find . -type f -exec chmod 644 {} +
  [ -f secrets.php ] && chmod 600 secrets.php
  exit 0
"

echo "→ Verifying live site"
DOMAIN="${SITE_DOMAIN:-https://forestaindia.com}"
fails=0
for path in / /product /about /contact /insights; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "${DOMAIN}${path}" || echo "000")
  if [[ "$code" == "200" ]]; then
    printf '  %-12s %s\n' "$path" "$code"
  else
    printf '  %-12s %s  ✗\n' "$path" "$code"
    fails=$((fails + 1))
  fi
done

if (( fails > 0 )); then
  echo "⚠  ${fails} route(s) did not return 200. If DNS was just pointed at Hostinger, allow for propagation." >&2
  exit 1
fi

echo "✓ Deployed to ${DOMAIN}"
echo
echo "  If this is the first deploy, create the credentials file on the server:"
echo "    ssh -p ${PORT} ${TARGET}"
echo "    cp ${HOSTINGER_REMOTE_PATH}/secrets.example.php ${HOSTINGER_REMOTE_PATH}/secrets.php"
echo "    # then edit secrets.php and set smtp_pass"
