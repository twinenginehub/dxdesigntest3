#!/bin/sh
# Restart the local dev server on :4200 and report the status code of every blog template route.
cd "$(dirname "$0")/.." || exit 1
lsof -ti tcp:4200 | xargs kill 2>/dev/null
sleep 1
nohup node dev-server.js > /tmp/dev4200.log 2>&1 &
sleep 3
for u in blog/sample-whitepaper-5 blog/sample-press-6 blog/sample-podcast-4 blog/sample-post franchise-blog "franchise-blog?audience=franchisees" franchise-blog/sample-franchise-1 resources/sample-guide blog "blog?type=press" blog/nope; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "localhost:4200/$u")
  echo "$code $u"
done
tail -5 /tmp/dev4200.log
