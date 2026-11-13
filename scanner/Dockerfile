FROM node:20-bookworm-slim

RUN apt-get update \\
    && apt-get install -y --no-install-recommends clamav-daemon clamav-freshclam netcat-openbsd ca-certificates \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY scanner/server.mjs /app/server.mjs
COPY scanner/clamd.conf /etc/clamav/clamd.conf
COPY scanner/freshclam.conf /etc/clamav/freshclam.conf
COPY scanner/entrypoint.sh /app/entrypoint.sh
RUN chmod 0755 /app/entrypoint.sh

ENV PORT=8080 \\
    CLAMD_HOST=127.0.0.1 \\
    CLAMD_PORT=3310 \\
    MAWDA_MEDIA_SCANNER_MAX_BYTES=104857600

EXPOSE 8080
CMD ["/app/entrypoint.sh"]
