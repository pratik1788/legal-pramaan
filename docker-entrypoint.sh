#!/bin/sh
# DIAGNOSTIC entrypoint (TEMPORARY): capture the full boot sequence to
# /tmp/boot.log. If anything in the boot fails, serve the log over HTTP so
# the real error can be read from the public URL. Will be reverted once the
# root cause is found.
LOG=/tmp/boot.log
{
  echo "=== boot started ==="
  date -u
  echo "user=$(whoami) HOME=$HOME XDG_CACHE_HOME=$XDG_CACHE_HOME PORT=${PORT:-unset}"
  echo "--- prisma cli present? ---"
  ls -la ./node_modules/prisma/build/index.js
  echo "--- engine cache contents ---"
  find /app/.cache -maxdepth 4 2>&1 | head -30
  echo "--- DATABASE_URL shape (no secret) ---"
  node -e '
    try {
      const u = new URL(process.env.DATABASE_URL);
      console.log("scheme=" + u.protocol, "host=" + u.hostname, "port=" + (u.port || "(default)"), "db=" + u.pathname, "user=" + (u.username ? "set" : "MISSING"));
    } catch (e) { console.log("DATABASE_URL unparseable: " + e.message); }
  '
  echo "--- db push ---"
  node ./node_modules/prisma/build/index.js db push --accept-data-loss --skip-generate
  echo "DB_PUSH_EXIT=$?"
  echo "--- node server.js ---"
  node server.js
  echo "APP_EXIT=$?"
} > "$LOG" 2>&1

echo "Boot did not stay up; serving diagnostic log on port ${PORT:-3000}"
node -e '
const http = require("http");
const fs = require("fs");
http.createServer((req, res) => {
  let body;
  try { body = fs.readFileSync("/tmp/boot.log", "utf8"); }
  catch (e) { body = "could not read log: " + e.message; }
  res.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
  res.end(body);
}).listen(process.env.PORT || 3000);
'
