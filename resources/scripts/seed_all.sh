#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESOURCES_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TOKEN_FILE="$RESOURCES_DIR/data/token.txt"
API_BASE="http://localhost:3030/api"

if [[ ! -f "$TOKEN_FILE" ]]; then
  echo "ERROR: token.txt not found at $TOKEN_FILE"
  exit 1
fi

TOKEN=$(<"$TOKEN_FILE")

ORDER=0
for MD_FILE in "$RESOURCES_DIR"/*.md; do
  [[ -f "$MD_FILE" ]] || continue

  TITLE=$(grep -m1 '^# ' "$MD_FILE" | sed 's/^# //')
  if [[ -z "$TITLE" ]]; then
    TITLE="$(basename "$MD_FILE" .md)"
  fi

  CONTENT=$(sed '1{/^# /d}' "$MD_FILE")

  echo ""
  echo "=== Creating resource: $TITLE ==="

  RESPONSE=$(curl -sf -X POST "$API_BASE/resources" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$(jq -n \
          --arg title "$TITLE" \
          --arg content "$CONTENT" \
          --argjson order "$ORDER" \
          '{title: $title, content: $content, order: $order}')")

  RESOURCE_ID=$(echo "$RESPONSE" | jq -r '.resource.id')
  echo "  Resource ID: $RESOURCE_ID"

  ORDER=$((ORDER + 1))
done

echo ""
echo "=== Seeding complete ==="
