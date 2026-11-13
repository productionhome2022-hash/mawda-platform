FROM node:20-bookworm-slim

ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends clamav clamav-freshclam ca-certificates ffmpeg poppler-utils python3 python3-img2pdf \
    && sed -i 's/^DatabaseOwner clamav/DatabaseOwner scanner/' /etc/clamav/freshclam.conf \
    && sed -i '/^[[:space:]]*NotifyClamd[[:space:]]/d' /etc/clamav/freshclam.conf \
    && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY security.js server.js start.sh ./
RUN chmod 0555 /app/start.sh \
    && useradd --system --uid 10001 --home-dir /nonexistent --shell /usr/sbin/nologin scanner \
    && mkdir -p /var/lib/clamav /var/log/clamav /tmp \
    && chown -R scanner:scanner /app /var/lib/clamav /var/log/clamav /tmp

USER scanner
EXPOSE 8080
CMD ["/app/start.sh"]
