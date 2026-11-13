#!/bin/sh
set -eu

# Fail closed if the malware signature database cannot be initialized.
freshclam --stdout --log=/dev/stdout
freshclam --daemon --stdout --log=/dev/stdout &

exec node server.js
