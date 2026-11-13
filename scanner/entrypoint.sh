#!/bin/sh
set -eu

mkdir -p /run/clamav /var/log/clamav /var/lib/clamav
chown -R clamav:clamav /run/clamav /var/log/clamav /var/lib/clamav

# Do not start accepting files with an empty or stale signature database.
freshclam --config-file=/etc/clamav/freshclam.conf
freshclam --daemon --config-file=/etc/clamav/freshclam.conf --checks=12

clamd --config-file=/etc/clamav/clamd.conf &
CLAMD_PID=$!
cleanup() {
  kill "$CLAMD_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

READY=0
for attempt in $(seq 1 60); do
  if printf 'zPING\\0' | nc -w 2 127.0.0.1 3310 2>/dev/null | grep -q PONG; then
    READY=1
    break
  fi
  sleep 1
done
if [ "$READY" -ne 1 ]; then
  echo "ClamAV daemon did not become ready" >&2
  exit 1
fi

exec su -s /bin/sh node -c "node /app/server.mjs"
