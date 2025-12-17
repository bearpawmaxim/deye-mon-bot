#!/bin/bash

export $(grep -v '^#' .env | xargs)

DUMP_DIR="./mongo_dump"
mkdir -p "$DUMP_DIR"

TIMESTAMP=$(date +%F_%H-%M-%S)
ARCHIVE_NAME="deye-mon-bot-$TIMESTAMP.gz"

docker compose exec deye-mon-bot-mongo mkdir -p /dump

docker compose exec deye-mon-bot-mongo \
  mongodump \
  --username "$MONGO_INITDB_ROOT_USERNAME" \
  --password "$MONGO_INITDB_ROOT_PASSWORD" \
  --authenticationDatabase "admin" \
  --db "$MONGO_DB" \
  --archive="/dump/$ARCHIVE_NAME" \
  --gzip

docker cp deye-mon-bot-mongo:/dump/$ARCHIVE_NAME $DUMP_DIR/

docker compose exec deye-mon-bot-mongo rm /dump/$ARCHIVE_NAME

echo "MongoDB dump completed: $DUMP_DIR/$ARCHIVE_NAME"
