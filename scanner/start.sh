#!/bin/sh
set -eu

# Fail closed if the malware signature database cannot be initialized.
freshclam --stdout
freshclam --daemon --stdout &

exec node server.js
