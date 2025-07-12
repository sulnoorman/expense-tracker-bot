#!/bin/sh

# Absolute path to your project directory
cd /DATA/Storage/MyProject/expense_tracker_bot || exit 1
LOGFILE="/DATA/Storage/MyProject/expense_tracker_bot/deploy.log"

echo "===================" >> "$LOGFILE"
echo "[INFO] $(date)" >> "$LOGFILE"

echo "[INFO] Pulling latest code..." | tee -a "$LOGFILE"
git pull origin main >> "$LOGFILE" 2>&1

echo "[INFO] Building Docker image..." | tee -a "$LOGFILE"
docker build -t duit-tracker . >> "$LOGFILE" 2>&1

echo "[INFO] Stopping old container..." | tee -a "$LOGFILE"
docker stop duit-tracker >> "$LOGFILE" 2>&1
docker rm duit-tracker >> "$LOGFILE" 2>&1

echo "[INFO] Running new container..." | tee -a "$LOGFILE"
docker run -d --name duit-tracker \
  --env-file .env \
  -p 5000:5000 \
  duit-tracker >> "$LOGFILE" 2>&1

echo "[INFO] Waiting for container to be ready..."

# Wait until the app responds on localhost:5000
until curl -s --head http://localhost:5000/health | grep "200 OK" > /dev/null; do
  echo "[INFO] Waiting for app to start..."
  sleep 2
done

echo "[INFO] Container is ready. Setting webhook..."

curl --location 'https://tele-bot.noerlab.my.id/webhook/telegram/set-webhook' \
--header 'Content-Type: application/json' \
--data '{
    "url": "https://tele-bot.noerlab.my.id/webhook/telegram"
}'

echo "[INFO] Webhook set successfully."
