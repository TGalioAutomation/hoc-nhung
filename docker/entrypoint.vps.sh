#!/bin/bash
set -e

# Auto-generate SECRET_KEY if not provided so the app boots out-of-the-box
if [ -z "$SECRET_KEY" ]; then
    SECRET_FILE="${DATA_DIR:-/app/data}/.secret_key"
    mkdir -p "$(dirname "$SECRET_FILE")"
    if [ ! -f "$SECRET_FILE" ]; then
        echo "🔑 Generating persistent SECRET_KEY (saved to $SECRET_FILE)"
        head -c 48 /dev/urandom | base64 | tr -d '\n' > "$SECRET_FILE"
    fi
    export SECRET_KEY="$(cat "$SECRET_FILE")"
fi

# Ensure arduino-cli config is initialized without blocking container startup
if [ ! -f /root/.arduino15/arduino-cli.yaml ]; then
    echo "📦 Initializing arduino-cli config..."
    arduino-cli config init 2>/dev/null || true
    arduino-cli config add board_manager.additional_urls \
        https://github.com/earlephilhower/arduino-pico/releases/download/global/package_rp2040_index.json 2>/dev/null || true
    arduino-cli config add board_manager.additional_urls \
        https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json 2>/dev/null || true
    arduino-cli config add board_manager.additional_urls \
        http://drazzy.com/package_drazzy.com_index.json 2>/dev/null || true
fi

if [ -d /opt/arduino15-seed ]; then
    for seed in /opt/arduino15-seed/package_*.json; do
        [ -f "$seed" ] || continue
        dest="/root/.arduino15/$(basename "$seed")"
        if [ ! -f "$dest" ]; then
            cp "$seed" "$dest"
        fi
    done
fi

if [ -f /opt/esp-idf/export.sh ]; then
    echo "🔧 Sourcing ESP-IDF environment..."
    . /opt/esp-idf/export.sh || true
    echo "✅ ESP-IDF $(cat /opt/esp-idf/version.txt 2>/dev/null || echo 'ready')"
fi

echo "🚀 Starting Velxio Community Backend on 127.0.0.1:8001..."
uvicorn app.main:app --host 127.0.0.1 --port 8001 &
UVICORN_PID=$!

sleep 2

echo "🌐 Starting Nginx Web Server on port 80..."
nginx -g "daemon off;" &
NGINX_PID=$!

wait -n $UVICORN_PID $NGINX_PID
EXIT_CODE=$?

echo "⚠️  A process exited (code $EXIT_CODE) — shutting down container"
kill $UVICORN_PID $NGINX_PID 2>/dev/null || true
wait $UVICORN_PID $NGINX_PID 2>/dev/null || true
exit $EXIT_CODE
