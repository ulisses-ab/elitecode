#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROBLEMS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROBLEMSET_DIR="$PROBLEMS_DIR/problemset"
TOKEN_FILE="$PROBLEMS_DIR/data/token.txt"
API_BASE="http://localhost:3030/api"

if [[ ! -f "$TOKEN_FILE" ]]; then
  echo "ERROR: token.txt not found at $TOKEN_FILE"
  exit 1
fi

TOKEN=$(<"$TOKEN_FILE")

language_info() {
  local lang="$1"
  case "$lang" in
    C++) echo "Compilation info: All .cpp files in the workspace will be compiled together using g++." ;;
    C) echo "Compilation info: All .c files in the workspace will be compiled together using gcc." ;;
    Python) echo "All .py files in the workspace are available. Implement your solution in the provided file." ;;
    *) echo "" ;;
  esac
}

for PROBLEM_DIR in "$PROBLEMSET_DIR"/*/; do
  PROBLEM_NAME="$(basename "$PROBLEM_DIR")"

  if [[ ! -f "$PROBLEM_DIR/info.json" ]]; then
    echo "SKIP $PROBLEM_NAME — no info.json"
    continue
  fi

  TITLE=$(jq -r '.title' "$PROBLEM_DIR/info.json")
  DIFFICULTY=$(jq -r '.difficulty' "$PROBLEM_DIR/info.json")
  STATEMENT=""
  if [[ -f "$PROBLEM_DIR/statement.md" ]]; then
    STATEMENT=$(<"$PROBLEM_DIR/statement.md")
  fi

  echo ""
  echo "=== Creating problem: $TITLE ($DIFFICULTY) ==="

  PROBLEM_RESPONSE=$(curl -sf -X POST "$API_BASE/problems" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$(jq -n \
          --arg title "$TITLE" \
          --arg statement "$STATEMENT" \
          --arg difficulty "$DIFFICULTY" \
          '{title: $title, statement: $statement, difficulty: $difficulty}')")

  PROBLEM_ID=$(echo "$PROBLEM_RESPONSE" | jq -r '.problem.id')
  echo "  Problem ID: $PROBLEM_ID"

  for LANG_DIR in "$PROBLEM_DIR"*/; do
    [[ -d "$LANG_DIR" ]] || continue
    LANG="$(basename "$LANG_DIR")"
    INFO="$(language_info "$LANG")"

    echo "  --- Setup: $LANG ---"

    SETUP_RESPONSE=$(curl -sf -X POST "$API_BASE/problems/$PROBLEM_ID/setups" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "$(jq -n \
            --arg language "$LANG" \
            --arg info "$INFO" \
            '{language: $language, info: $info}')")

    SETUP_ID=$(echo "$SETUP_RESPONSE" | jq -r '.setup.id')
    echo "    Setup ID: $SETUP_ID"

    # Runner
    RUNNER_ZIP=""
    if [[ -f "$LANG_DIR/runner/runner.zip" ]]; then
      RUNNER_ZIP="$LANG_DIR/runner/runner.zip"
    elif [[ -d "$LANG_DIR/runner" ]]; then
      RUNNER_ZIP="/tmp/runner_${PROBLEM_NAME}_${LANG}.zip"
      (cd "$LANG_DIR/runner" && zip -qr "$RUNNER_ZIP" .)
      echo "    Zipped runner -> $RUNNER_ZIP"
    fi

    if [[ -n "$RUNNER_ZIP" ]]; then
      curl -sf -X POST "$API_BASE/problems/$PROBLEM_ID/setups/$SETUP_ID/runner" \
        -H "Authorization: Bearer $TOKEN" \
        -F "file=@$RUNNER_ZIP" > /dev/null
      echo "    Runner uploaded"
    else
      echo "    WARN: no runner found for $LANG"
    fi

    # Tests
    if [[ -f "$PROBLEM_DIR/tests.json" ]]; then
      curl -sf -X POST "$API_BASE/problems/$PROBLEM_ID/setups/$SETUP_ID/tests" \
        -H "Authorization: Bearer $TOKEN" \
        -F "file=@$PROBLEM_DIR/tests.json" > /dev/null
      echo "    Tests uploaded"
    else
      echo "    WARN: no tests.json found"
    fi

    # Template
    TEMPLATE_ZIP=""
    if [[ -f "$LANG_DIR/template/template.zip" ]]; then
      TEMPLATE_ZIP="$LANG_DIR/template/template.zip"
    elif [[ -d "$LANG_DIR/template" ]]; then
      TEMPLATE_ZIP="/tmp/template_${PROBLEM_NAME}_${LANG}.zip"
      (cd "$LANG_DIR/template" && zip -qr "$TEMPLATE_ZIP" .)
      echo "    Zipped template -> $TEMPLATE_ZIP"
    fi

    if [[ -n "$TEMPLATE_ZIP" ]]; then
      curl -sf -X POST "$API_BASE/problems/$PROBLEM_ID/setups/$SETUP_ID/template" \
        -H "Authorization: Bearer $TOKEN" \
        -F "file=@$TEMPLATE_ZIP" > /dev/null
      echo "    Template uploaded"
    else
      echo "    WARN: no template found for $LANG"
    fi
  done

  echo "  Done: $TITLE"
done

echo ""
echo "=== Seeding complete ==="
