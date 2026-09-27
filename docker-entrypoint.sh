#!/bin/sh
# TEMPORARY DIAGNOSTIC entrypoint v2: the diagnostic HTTP server starts FIRST
# (in the background) so /tmp/boot.log is always reachable at the public URL,
# even if `db push` hangs. Revert once the root cause is found.
LOG=/tmp/boot.log
: > "$LOG"

start_diag() {
  node -e '
const http=require("http"),fs=require("fs");
http.createServer((req,res)=>{
  let b; try{ b=fs.readFileSync("/tmp/boot.log","utf8"); }catch(e){ b="(log unavailable) "+e.message; }
  res.writeHead(200,{"Content-Type":"text/plain; charset=utf-8"}); res.end(b);
}).listen(process.env.PORT||3000);
' >>"$LOG" 2>&1 &
  DIAG_PID=$!
  echo "diag server pid $DIAG_PID on port ${PORT:-3000}" >> "$LOG"
}

echo "=== container boot $(date -u) ===" >> "$LOG"
start_diag
sleep 1

{
  echo "user=$(whoami) PORT=${PORT:-unset}"
  ls -la ./node_modules/prisma/build/index.js ./server.js 2>&1
  echo "--- engine cache ---"
  find /app/.cache -maxdepth 4 2>&1 | head -20
  echo "--- db target ---"
  node -e 'try{const u=new URL(process.env.DATABASE_URL);console.log(u.protocol+"//"+u.hostname+":"+(u.port||"5432")+u.pathname)}catch(e){console.log("DATABASE_URL unparseable")}'
  echo "--- db push (60s timeout) ---"
  timeout 60 node ./node_modules/prisma/build/index.js db push --accept-data-loss --skip-generate
  PUSH_EXIT=$?
  echo "DB_PUSH_EXIT=$PUSH_EXIT"
} >>"$LOG" 2>&1

if [ "$PUSH_EXIT" = "0" ]; then
  echo "db push OK, launching app" >> "$LOG"
  kill $DIAG_PID 2>/dev/null
  sleep 1
  node server.js >>"$LOG" 2>&1 &
  APP_PID=$!
  sleep 10
  node -e '
const http=require("http");
const req=http.get("http://127.0.0.1:"+(process.env.PORT||3000)+"/",res=>{console.log("localhost probe -> "+res.statusCode);process.exit(0);});
req.on("error",e=>{console.log("localhost probe FAILED: "+e.message);process.exit(0);});
req.setTimeout(8000,()=>{console.log("localhost probe TIMEOUT");req.destroy();});
' >>"$LOG" 2>&1
  if grep -q "localhost probe -> [0-9]" "$LOG"; then
    echo "app is serving, waiting on app pid $APP_PID" >> "$LOG"
    wait $APP_PID
    echo "APP_EXIT=$?" >> "$LOG"
  else
    echo "app not serving, restarting diag server" >> "$LOG"
    kill $APP_PID 2>/dev/null
    start_diag
  fi
else
  echo "db push failed or timed out, diag server keeps serving the log" >> "$LOG"
fi

wait
