#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-https://elitecode-production.up.railway.app/api}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROBLEMS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROBLEMSET_DIR="$PROBLEMS_DIR/problemset"
TOKEN=$(<"$PROBLEMS_DIR/data/token.txt")

INFO="Compilation info: All .c files in the workspace will be compiled together using gcc."

# Map slug → problem ID (fetched from API by matching title)
declare -A SLUG_TO_ID
while IFS=$'\t' read -r id title; do
  case "$title" in
    "Expression Evaluator")  SLUG_TO_ID["expression-evaluator"]="$id" ;;
    "Mini Redis")            SLUG_TO_ID["mini-redis"]="$id" ;;
    "Virtual File System")   SLUG_TO_ID["virtual-filesystem"]="$id" ;;
    "URL Router")            SLUG_TO_ID["url-router"]="$id" ;;
    "TTL Cache")             SLUG_TO_ID["ttl-cache"]="$id" ;;
    "Tiny Interpreter")      SLUG_TO_ID["tiny-interpreter"]="$id" ;;
    "Rate Limiter")          SLUG_TO_ID["rate-limiter"]="$id" ;;
    "Chess Engine")          SLUG_TO_ID["chess-engine"]="$id" ;;
  esac
done < <(curl -sf "$API_BASE/problems" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -c "
import json,sys
data=json.load(sys.stdin)
for p in data.get('problems',[]):
    print(p['id'] + '\t' + p['title'])
")

for SLUG in "${!SLUG_TO_ID[@]}"; do
  PROBLEM_ID="${SLUG_TO_ID[$SLUG]}"
  LANG_DIR="$PROBLEMSET_DIR/$SLUG/C"

  if [[ ! -d "$LANG_DIR" ]]; then
    echo "SKIP $SLUG — no C directory"
    continue
  fi

  echo ""
  echo "=== $SLUG ($PROBLEM_ID) ==="

  SETUP_RESPONSE=$(curl -sf -X POST "$API_BASE/problems/$PROBLEM_ID/setups" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$(python3 -c "import json; print(json.dumps({'language':'C','info':'$INFO'}))")")

  SETUP_ID=$(echo "$SETUP_RESPONSE" | python3 -c "import json,sys; print(json.load(sys.stdin)['setup']['id'])")
  echo "  Setup ID: $SETUP_ID"

  # Runner
  RUNNER_ZIP="/tmp/runner_${SLUG}_C.zip"
  (cd "$LANG_DIR/runner" && zip -qr "$RUNNER_ZIP" .)
  curl -sf -X POST "$API_BASE/problems/$PROBLEM_ID/setups/$SETUP_ID/runner" \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@$RUNNER_ZIP" > /dev/null
  echo "  Runner uploaded"

  # Tests
  curl -sf -X POST "$API_BASE/problems/$PROBLEM_ID/setups/$SETUP_ID/tests" \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@$PROBLEMSET_DIR/$SLUG/tests.json" > /dev/null
  echo "  Tests uploaded"

  # Template
  TEMPLATE_ZIP="/tmp/template_${SLUG}_C.zip"
  (cd "$LANG_DIR/template" && zip -qr "$TEMPLATE_ZIP" .)
  curl -sf -X POST "$API_BASE/problems/$PROBLEM_ID/setups/$SETUP_ID/template" \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@$TEMPLATE_ZIP" > /dev/null
  echo "  Template uploaded"
done

echo ""
echo "=== Done ==="
