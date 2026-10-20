#!/bin/bash
# Puts the latest code from GitHub (main) live on the VPS at https://my-agent.glamofashion.com, without breaking anything:
#   1. Pulls github.com/ramkesh-bairwa/Portfolio-app (main) into /var/www/Portfolio-app_build and builds it there,
#      while the live app in /var/www/Portfolio-app keeps serving.
#   2. Updates the database (scripts/setup.mjs only adds missing tables/columns) and test-runs the new build on a
#      spare port. If it does not answer correctly -> stops, nothing is switched.
#   3. Backs up the live app, copies the new build in and restarts it under PM2 on port 3301 (Nginx needs no change).
#      If the health check fails it puts the backup back.
# .env.local and uploads/ in /var/www/Portfolio-app are never overwritten or deleted.
#
# Push your code to GitHub first, then run from your Mac:   bash deploy/server-update.sh   (asks for the root password)
set -euo pipefail
HOST="${HOST:-root@187.126.117.103}"
DOMAIN="${DOMAIN:-my-agent.glamofashion.com}"
SSH="ssh -o StrictHostKeyChecking=accept-new"

# The server builds what is on GitHub, so send local commits there first
cd "$(dirname "$0")/.."
[ "$(git branch --show-current)" = main ] || { echo "!!! Switch to the main branch first (git checkout main)"; exit 1; }
if [ -n "$(git status --porcelain)" ]; then
  echo "Note: you have changes that are not committed. They will NOT be deployed:"
  git status --short
fi
git push -q origin main
echo "Deploying commit $(git log --oneline -1)"

$SSH "$HOST" "DOMAIN=$DOMAIN bash -s" <<'REMOTE'
set -euo pipefail
APP=/var/www/Portfolio-app
SRC=/var/www/Portfolio-app_build
PREV=/var/www/Portfolio-app_prev
REPO=https://github.com/ramkesh-bairwa/Portfolio-app.git
NAME=my-agent
PORT=3301
TEST_PORT=3399
say() { printf '\n\033[1;32m▶ %s\033[0m\n' "$*"; }
fail() { echo "!!! $*" >&2; exit 1; }

# An unknown email must get 401 from the login API: proves the app is up and MySQL answers
health() {
  [ "$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' \
    -d '{"email":"check@example.invalid","password":"x"}' "$1/api/auth/login")" = 401 ] &&
  curl -fs -o /dev/null "$1/api/plans"
}

say "Checking the current setup"
[ -f "$APP/.env.local" ] || fail "$APP/.env.local not found"
command -v pm2 >/dev/null || fail "pm2 is not installed"
if [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then fail "Node 20 or newer is needed (found $(node -v))"; fi
echo "node $(node -v)"
# Folders were owned by the old Jenkins user; root runs everything now
chown -R root:root "$APP" "$SRC" 2>/dev/null || true
git config --global --get-all safe.directory | grep -qx "$SRC" || git config --global --add safe.directory "$SRC"

say "Getting the code"
if [ -d "$SRC/.git" ]; then
  git -C "$SRC" fetch -q origin main && git -C "$SRC" reset -q --hard origin/main && git -C "$SRC" clean -qfd -e node_modules -e .next
else
  rm -rf "$SRC"
  git clone -q --branch main "$REPO" "$SRC"
fi
echo "commit $(git -C "$SRC" log --oneline -1)"

say "Installing and building (the live app keeps serving)"
cd "$SRC"
cp "$APP/.env.local" .env.local
export NEXT_TELEMETRY_DISABLED=1
npm ci --no-audit --no-fund
NODE_OPTIONS=--max-old-space-size=1536 npm run build

say "Database (only adds what is missing)"
npm run db:setup

say "Test run on port $TEST_PORT"
mkdir -p uploads
PORT=$TEST_PORT NODE_ENV=production nohup node_modules/.bin/next start -p $TEST_PORT > /tmp/portfolio-test.log 2>&1 &
TEST_PID=$!
trap 'kill $TEST_PID 2>/dev/null || true' EXIT
ok=0
for i in $(seq 1 60); do health "http://127.0.0.1:$TEST_PORT" && { ok=1; break; }; sleep 1; done
kill $TEST_PID 2>/dev/null || true; trap - EXIT
[ $ok = 1 ] || { tail -20 /tmp/portfolio-test.log; fail "New build did not pass the test run — nothing was switched. The live app is still running."; }
echo "  new build answers correctly"

say "Backing up the live app to $PREV"
rsync -a --delete --exclude '.env.local' --exclude 'uploads/' "$APP/" "$PREV/"

say "Switching (a few seconds of downtime)"
rsync -a --delete --exclude '.git/' --exclude '.env.local' --exclude 'uploads/' "$SRC/" "$APP/"
mkdir -p "$APP/uploads"
cd "$APP"
# Exactly one PM2 process named $NAME, running from $APP (older setups had duplicates)
count=$(pm2 jlist | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).filter(p=>p.name==='$NAME').length))")
if [ "$count" = 1 ] && [ "$(pm2 jlist | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).find(p=>p.name==='$NAME').pm2_env.pm_cwd))")" = "$APP" ]; then
  PORT=$PORT pm2 reload "$NAME" --update-env >/dev/null
else
  [ "$count" = 0 ] || pm2 delete "$NAME" >/dev/null
  PORT=$PORT pm2 start npm --name "$NAME" --cwd "$APP" -- start >/dev/null
fi
pm2 save >/dev/null

rollback() {
  echo "!!! New version did not come up — putting the previous version back" >&2
  pm2 logs "$NAME" --err --lines 30 --nostream || true
  rsync -a --delete --exclude '.env.local' --exclude 'uploads/' "$PREV/" "$APP/"
  PORT=$PORT pm2 reload "$NAME" --update-env >/dev/null
  exit 1
}
ok=0
for i in $(seq 1 60); do health "http://127.0.0.1:$PORT" && { ok=1; break; }; sleep 1; done
[ $ok = 1 ] || rollback
health "https://$DOMAIN" || rollback
rm -f "$SRC/.env.local"

say "Live"
echo "  https://$DOMAIN -> HTTP $(curl -s -o /dev/null -w '%{http_code}' https://$DOMAIN/)"
echo "  commit $(git -C "$SRC" log --oneline -1)"
echo
echo "  Logs:      pm2 logs $NAME"
echo "  Go back:   rsync -a --delete --exclude .env.local --exclude uploads/ $PREV/ $APP/ && pm2 reload $NAME"
REMOTE
