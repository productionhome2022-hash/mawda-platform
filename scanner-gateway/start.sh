#!/bin/sh
set -eu
freshclam --stdout
freshclam --daemon --user=clamav
clamd --config-file=/etc/clamav/clamd.conf --foreground &
CLAMD_PID=$!
trap 'kill "$CLAMD_PID" 2>/dev/null || true' EXIT INT TERM
attempt=0
until node -e 'const net=require("node:net");const s=net.connect(3310,"127.0.0.1",()=>{s.end();process.exit(0)});s.on("error",()=>process.exit(1))'; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 90 ]; then echo "ClamAV daemon failed to start" >&2; exit 1; fi
  sleep 1
done
exec gosu node node /app/server.mjs
