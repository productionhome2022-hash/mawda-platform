#!/bin/sh
set -eu

# Do not serve requests with stale/missing signatures.
freshclam --stdout
freshclam --daemon --checks=12 --quiet
clamd --foreground --config-file=/etc/clamav/clamd.conf &
CLAMD_PID=$!

attempt=0
until python3 -c 'import socket; s=socket.create_connection(("127.0.0.1",3310),1); s.sendall(b"PING\n"); assert s.recv(16).strip()==b"PONG"; s.close()' 2>/dev/null; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 60 ]; then
    kill "$CLAMD_PID" 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

exec python3 /app/app.py
