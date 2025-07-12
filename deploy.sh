#!/bin/bash

cd /DATA/Storage/MyProject/expense_tracker_bot || exit 1
LOGFILE="/DATA/Storage/MyProject/expense_tracker_bot/deploy.log"

echo "===================" >> $LOGFILE
echo "📅 $(date)" >> $LOGFILE

echo "🔄 Pulling latest code..." | tee -a $LOGFILE
git pull origin main >> $LOGFILE 2>&1

echo "🐳 Building Docker image..." | tee -a $LOGFILE
docker build -t duit-tracker . >> $LOGFILE 2>&1

echo "🛑 Stopping old container..." | tee -a $LOGFILE
docker stop duit-tracker >> $LOGFILE 2>&1
docker rm duit-tracker >> $LOGFILE 2>&1

echo "▶️ Running new container..." | tee -a $LOGFILE
docker run -d --name duit-tracker \
  --env-file .env \
  -p 5000:5000 \
  duit-tracker >> $LOGFILE 2>&1

echo "✅ Deploy complete!" | tee -a $LOGFILE

echo "Set Webhook URL"

curl --location 'https://tele-bot.noerlab.my.id/webhook/telegram/set-webhook' \
--header 'Content-Type: application/json' \
--data '{
    "url": "https://tele-bot.noerlab.my.id/webhook/telegram"
}'

echo "✅ Set Webhook URL completed!"
