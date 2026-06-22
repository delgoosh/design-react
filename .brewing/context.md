# Project context for slowcook agents

Agents (refinement, test-gen, brewing) read this file every run to anchor their vocabulary and invariants — so the PM doesn't have to re-explain core domain terms on every issue.

Keep it:
- **Distilled**, not a full PRD. ~1 page, ~1–2k tokens.
- **Grounded**, with actual code-path references where helpful.
- **Updated** alongside significant product pivots (commit changes with the code that changes).

This file is consumed as-is by the refinement agent. Contents below are a template — replace with your project's real context.

---

## Domain vocabulary

Define the key nouns and verbs your product uses. Agents should prefer these terms over generic software vocabulary.

- **Example**: an *entity-name* is a short definition. What's special about it in this product?
- **Example**: a *verb* (action) means... and results in...

## Product-level invariants

Rules that apply across stories — the things the product always does, regardless of which capability a story touches.

- **Example**: all write actions require authentication.
- **Example**: feed ordering is reverse-chronological; no algorithmic re-ranking.

## Architectural must-knows

- **Stack**: (e.g., Next.js 14 App Router, TypeScript, Supabase, Tailwind)
- **Where the API lives**: (e.g., `src/app/api/*/route.ts`)
- **Auth model**: (e.g., Supabase Auth sessions, cookie-based for web, JWT-in-header for native)
- **DB access**: (e.g., Supabase client SDK, RLS is the primary access-control layer)
- **Testing conventions**: (e.g., Vitest for unit + integration, Playwright for e2e)

## Known constraints / non-goals at project level

Things the product explicitly does NOT do — so agents don't propose them.

- **Example**: no algorithmic feed ranking.
- **Example**: no organizations / multi-tenancy.

## Pointers to deeper docs

If you maintain separate product / architecture docs, list paths here so reviewers can dig deeper. Agents do NOT auto-read these; include only what they directly need above.

- **PRD**: `docs/PRD.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **User stories**: `docs/USER_STORIES.md`
