#!/usr/bin/env bash
# Smoke test for the survey API against a running dev server (npm run dev, default http://localhost:4200).
# Usage: scripts/api-smoke-test.sh [base-url] [dashboard-password]
BASE="${1:-http://localhost:4200}"
PASS="${2:-local-test-password}"
B="$BASE/api/survey"; JAR="$(mktemp)"
SID=$(node -e "console.log(crypto.randomUUID())")
ok=0; bad=0
check() { if [ "$2" = "$3" ]; then ok=$((ok+1)); echo "  ok    $1"; else bad=$((bad+1)); echo "  FAIL  $1 (got: $2, want: $3)"; fi; }
# post <path> [extra curl args...]  (JSON body on stdin) -> prints the HTTP status
post() { local p="$1"; shift; curl -s -o /dev/null -w "%{http_code}" -X POST "$B/$p" -H 'Content-Type: application/json' "$@" --data-binary @-; }
get() { curl -s -o /dev/null -w "%{http_code}" "$@"; }

check "progress ping accepted" "$(printf '{"sid":"%s","step":3}' "$SID" | post progress)" 200
check "progress rejects a bad session id" "$(echo '{"sid":"x","step":3}' | post progress)" 400

FULL=$(cat <<EOF
{"sid":"$SID","duration_seconds":140,"answers":{
 "company_name":"  Smoke Test Co  ","industry":"Accounting or CPA firm","employees":"25-49","revenue":"\$5-10M",
 "role":"COO or operations leader","decision_others":["No one else","Finance"],
 "triggers":["A role stayed open too long","Other (please specify)","NOT A REAL OPTION"],"trigger_other":"Merger","main_trigger":"A role stayed open too long",
 "alternatives":["Hiring in the U.S."],
 "why_ranked":["30-day cancellation","Security and compliance (SOC 2)","The quality of the candidates we were shown","A referral or recommendation from someone we trust"],
 "outcome":"We save 20 hours a week","team_today":"3-5","team_12mo":"1-2 more",
 "readiness":["None of these","Our team was already partly or fully remote"],"nps":9,
 "referral_followup":"=cmd|' /C calc'!A0 peers"}}
EOF
)
check "submit accepts a valid response" "$(echo "$FULL" | post submit)" 200
check "submit is idempotent per session" "$(printf '{"sid":"%s","answers":{"company_name":"Duplicate"}}' "$SID" | post submit)" 200
check "submit needs a company name" "$(echo '{"answers":{"industry":"Law firm"}}' | post submit)" 400
check "submit rejects non-JSON" "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/submit -H 'Content-Type: text/plain' -d x)" 415
check "submit rejects cross-origin posts" "$(echo '{}' | post submit -H 'Origin: https://evil.example')" 403
check "results are closed without a session" "$(get $B/results)" 401
check "export is closed without a session" "$(get $B/export)" 401
check "forged session cookie is refused" "$(get -b 'dx_survey_session=eyJleHAiOjk5OTk5OTk5OTl9.abc' $B/results)" 401
check "wrong password is refused" "$(echo '{"password":"nope"}' | post login)" 401
check "right password signs in" "$(printf '{"password":"%s"}' "$PASS" | post login -c "$JAR")" 200
check "results open with a session" "$(get -b "$JAR" $B/results)" 200
check "export opens with a session" "$(get -b "$JAR" $B/export)" 200

echo "  --- stored row for this run (as the dashboard receives it):"
curl -s -b "$JAR" $B/results | node -e "
let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{
  const j=JSON.parse(s);const r=j.responses.find(x=>x.company_name==='Smoke Test Co');
  if(!r){console.log('  NOT FOUND');process.exit(1)}
  console.log('  company trimmed:',JSON.stringify(r.company_name));
  console.log('  decision_others (exclusive rule):',JSON.stringify(r.decision_others));
  console.log('  triggers (bad option dropped):',JSON.stringify(r.triggers));
  console.log('  why_ranked kept to 3:',r.why_ranked.length);
  console.log('  readiness (exclusive rule):',JSON.stringify(r.readiness));
  console.log('  ip_hash exposed:',('ip_hash' in r),'| user_agent exposed:',('user_agent' in r));
  console.log('  funnel:',JSON.stringify(j.funnel));
})"
echo "  --- CSV row (formula neutralised with a leading apostrophe):"
curl -s -b "$JAR" $B/export | grep "Smoke Test Co" | head -1 | cut -c1-330
echo; echo "passed $ok, failed $bad"
[ $bad -eq 0 ]
