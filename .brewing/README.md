# `.brewing/`

Consumer-side configuration for [slowcook](https://github.com/aminazar/slowcook), a TDD-first agentic development harness.

## Contents

| Path | Purpose |
|---|---|
| `frozen-paths.json` | What's immutable during brewing (tests, configs, manifests) |
| `stack.json` | How slowcook invokes tests / coverage / lint for this project |
| `manifests/` | Per-story test manifests; populated by `slowcook manifest record` |

## One-time setup per clone

After `git clone`, activate the slowcook pre-commit hook so the code map stays in lockstep with `src/` on every commit:

```bash
git config core.hooksPath .githooks
```

Without this, commits touching `src/**/*.{ts,tsx}` land with a stale `.brewing/code-map.*` and `slowcook map check` fails the PR. Bypass with `git commit --no-verify` if ever needed.

## Running slowcook locally

```bash
npx --yes @slowcook-ai/cli@latest guard --base origin/main --head HEAD
npx --yes @slowcook-ai/cli@latest manifest record
npx --yes @slowcook-ai/cli@latest manifest verify
npx --yes @slowcook-ai/cli@latest map generate    # refresh .brewing/code-map.*
```

## When you legitimately need to modify a frozen path

1. Open a PR with the change.
2. Add the `override-freeze` label to the PR.
3. Guard runs in advisory mode (surfaces violations but doesn't fail).
4. CODEOWNERS still requires explicit approval.
5. Merge audit trail: PR number + `override-freeze` label + approval.

Deliberately slightly inconvenient. Frozen-path changes are rare events that deserve a reviewer's eyes.
