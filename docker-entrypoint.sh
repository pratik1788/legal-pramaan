#!/bin/sh
# Apply the Prisma schema to the database, then start the app.
# `prisma db push` is used for the MVP (no migration history yet).
# Switch to `prisma migrate deploy` once you adopt migrations.
set -e
echo "Applying database schema..."
node ./node_modules/prisma/build/index.js db push --accept-data-loss --skip-generate
exec "$@"
