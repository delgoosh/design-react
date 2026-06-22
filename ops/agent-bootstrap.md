# Agent bootstrap — per-agent provisioning (PM-facing)

> **Audience: PM.** This doc is for whoever runs the project; agents
> should not consult it. Agents read `AGENTS.md` and run
> `scripts/agent-preflight.sh` instead. (See the slowcook managed
> block in AGENTS.md for the audience convention.)

When you onboard a new agent (Claude Code session, Codex, Cursor,
etc.) into this repo, you need to provision a few things out-of-band
so its first `scripts/agent-preflight.sh` passes:

## 1. `gh` CLI authentication

Agents need `gh` to open PRs (slowcook's branch-discipline rule
depends on it). Pre-install the binary in the agent's container/image
and authenticate one of these ways:

- **PAT** (simplest): `gh auth login --with-token < ~/.pat`. Scopes:
  `repo, read:org, workflow`. Per-agent token so revocation is
  surgical.
- **GitHub App installation token**: cleaner for org-policy reasons;
  more setup.
- **OAuth web flow**: only if the agent's environment can pop a
  browser, which most managed contexts can't.

## 2. SSH keys for remote services (if you have a dev box)

If your project has a remote dev/staging box that agents need to SSH
into (e.g., delgoosh-box for the rotating-URL dev-server pattern):

- Generate a per-agent SSH keypair locally (not on the box).
- **Public half** → install in the box's `/home/<agent-user>/.ssh/authorized_keys`.
  See server-side setup runbook (e.g., `ops/box/<agent>-agent-setup.md`).
- **Private half** → install in the agent's environment at
  `~/.ssh/<agent-name>-key` with `chmod 600`. ALSO upload to GitHub
  Secrets as `<PROJECT>_<AGENT>_SSH_KEY` for any workflow agents.

**Why two places**: GitHub secrets are workflow-mounted only — they
cannot be read by agents running outside Actions (long-lived Claude
Code, Managed Agents, etc.). For those, the private key must already
be on disk before the agent's first action.

## 3. SSH config + known_hosts

For convenience, add a stanza in the agent's `~/.ssh/config`:

```
Host <project>-box
  HostName <ip-or-hostname>
  Port 22
  User <agent-user>
  IdentityFile ~/.ssh/<agent-name>-key
  IdentitiesOnly yes
  ServerAliveInterval 30
```

Pre-populate `~/.ssh/known_hosts` so the first SSH doesn't prompt:

```bash
ssh-keyscan -t ed25519 <ip-or-hostname> >> ~/.ssh/known_hosts
ssh-keyscan -t ed25519 github.com      >> ~/.ssh/known_hosts
```

## 4. Project-specific preflight (`agent-preflight.local.sh`)

The generic `scripts/agent-preflight.sh` shipped by slowcook init
sources `scripts/agent-preflight.local.sh` if present. Put your
project's per-agent checks there. Example:

```bash
# scripts/agent-preflight.local.sh — gitignored
[ -f ~/.ssh/<agent-name>-key ] \
  && ok "ssh key present" \
  || fail "ssh key present" "PM must install per ops/agent-bootstrap.md §2"

[ "$(stat -c %a ~/.ssh/<agent-name>-key 2>/dev/null)" = 600 ] \
  && ok "ssh key chmod 600" \
  || fail "ssh key chmod 600" "chmod 600 ~/.ssh/<agent-name>-key"

ssh -o BatchMode=yes -o ConnectTimeout=5 <project>-box 'whoami' 2>/dev/null | grep -qx "<agent-user>" \
  && ok "ssh to <project>-box as <agent-user>" \
  || fail "ssh to <project>-box as <agent-user>" "key or known_hosts misconfigured"
```

The `.local.sh` form is gitignored — add it to `.gitignore` so
per-agent quirks don't leak into the repo.

## Tear-down

When you retire an agent:

1. Revoke the GH PAT (or GitHub App installation token).
2. Revoke the SSH key on the dev box (remove from
   `~/<agent-user>/.ssh/authorized_keys`).
3. Delete the GitHub secret (`gh secret delete <PROJECT>_<AGENT>_SSH_KEY`).
4. Optionally delete the OS user on the dev box (`userdel -r <agent-user>`).

Per-agent scoping is the point — each step is independent of every
other agent.
