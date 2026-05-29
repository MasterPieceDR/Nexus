#!/usr/bin/env bash
set -e
APP_BUCKET="$1"
if [ -z "$APP_BUCKET" ]; then
  echo "Uso: ./scripts/deploy_front.sh nombre-bucket-app"
  exit 1
fi
aws s3 sync front "s3://$APP_BUCKET" --delete
