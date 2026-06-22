# Patterns directory

Hand-written reusable code recipes for this project. The brew agent
loads the *index* of this directory (title + one-line summary per
file) into every iteration's cached prefix; the agent reads any
specific pattern via `read_file('.brewing/patterns/<name>.md')` when
relevant.

Patterns are about **how this codebase does X** — stuff that's
non-obvious from reading any single file but that recurs across the
project. Examples worth capturing:

- "How cursor pagination works in our handlers"
- "The shape of a tier-1 test against mockSupabase"
- "How RLS is enforced on writes"
- "Migration patterns: when to use ALTER TABLE vs DO blocks"

Patterns are NOT for:

- Per-feature documentation (use spec.yaml).
- Architectural decisions / ADRs (use docs/).
- Per-story brew context (use `.brewing/context.md`).

## File convention

Each pattern is a Markdown file named `<slug>.md`. Required structure:

```markdown
# <Title>

> <One-line summary, used as the index entry.>

## When to use
...

## Example
```ts
// concrete code
```
```

The first `# Title` line and the first `> Summary` line are what
brew indexes. Anything else is for the agent's eyes when it loads the
full pattern.

## Adding a pattern

1. Write the markdown file in this directory.
2. Commit it. The next brew iteration sees the new pattern in its
   index and can read it on-demand.

No registry, no metadata, no slowcook-side change required.
