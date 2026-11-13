FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

RUN apt-get update \
    && apt-get install -y --no-install-recommends clamav clamav-daemon clamav-freshclam \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /var/lib/clamav /run/clamav /var/log/clamav \
    && chown -R clamav:clamav /var/lib/clamav /run/clamav /var/log/clamav

WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --requirement /app/requirements.txt
COPY clamd.conf /etc/clamav/clamd.conf
COPY clamdscan.conf /etc/clamav/clamdscan.conf
COPY entrypoint.sh /app/entrypoint.sh
COPY app.py /app/app.py
RUN chmod 0555 /app/entrypoint.sh && chown -R clamav:clamav /app /etc/clamav/clamd.conf

USER clamav
EXPOSE 8080
CMD ["/app/entrypoint.sh"]
