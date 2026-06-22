#!/usr/bin/env bash
# Slowcook agent preflight — run this from your first action of any
# new session. Checks that the tools + auth + secrets you need are in
# place. Edit this file to add consumer-specific checks (e.g. SSH key
# at `~/.ssh/<your-name>-key`, env vars, etc.) — keep the generic
# slowcook checks intact.
#
# Exit 0 = all green, agent may proceed.
# Exit 1 = at least one FAIL. Ask the PM to fix; do NOT self-heal.
#
# Convention: each check prints `PASS <name>` or `FAIL <name> — <hint>`
# in two columns so the agent can grep `^FAIL` for the bad list.

set -u

exit_code=0
ok()   { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s — %s\n' "$1" "$2"; exit_code=1; }

# --- Tools ----------------------------------------------------------
command -v ssh >/dev/null  && ok "ssh installed"  || fail "ssh installed"  "apt install -y openssh-client / brew install openssh"
command -v git >/dev/null  && ok "git installed"  || fail "git installed"  "apt install -y git / brew install git"
command -v gh  >/dev/null  && ok "gh installed"   || fail "gh installed"   "https://cli.github.com — slowcook's branch-discipline rule depends on \`gh pr create\`"
command -v jq  >/dev/null  && ok "jq installed"   || fail "jq installed"   "apt install -y jq / brew install jq"
command -v node >/dev/null && ok "node installed" || fail "node installed" "install Node 20 via nvm or system"

# --- Auth -----------------------------------------------------------
if command -v gh >/dev/null; then
  gh auth status >/dev/null 2>&1 \
    && ok "gh authenticated" \
    || fail "gh authenticated" "run \`gh auth login\` with a PAT scoped to repo,read:org,workflow (ask PM if you don't have one)"
fi

# --- Repo write access ---------------------------------------------
if command -v gh >/dev/null && gh auth status >/dev/null 2>&1; then
  REMOTE_URL=$(git config --get remote.origin.url 2>/dev/null || echo "")
  if [ -n "$REMOTE_URL" ]; then
    REPO_NWO=$(printf '%s' "$REMOTE_URL" | sed -E 's#(git@github.com:|https://github.com/)([^/]+/[^/.]+)(\.git)?#\2#')
    if [ -n "$REPO_NWO" ]; then
      PERM=$(gh api "repos/$REPO_NWO" --jq '.permissions.push // false' 2>/dev/null || echo "false")
      if [ "$PERM" = "true" ]; then
        ok "push access to $REPO_NWO"
      else
        fail "push access to $REPO_NWO" "your gh user has no push permission — ask PM to invite you"
      fi
    fi
  fi
fi

# --- Consumer-specific hook ----------------------------------------
# Put your project's per-agent checks (SSH key on disk for a remote
# dev box, env vars, deploy-key bootstrap, etc.) into the .local.sh
# sibling. Gitignore'd by convention so it doesn't leak per-machine
# state into the repo.
LOCAL_HOOK="$(dirname "$0")/agent-preflight.local.sh"
if [ -f "$LOCAL_HOOK" ]; then
  # shellcheck disable=SC1090
  source "$LOCAL_HOOK"
fi

exit "$exit_code"
