// @slowcook-one-time-scaffold UI tier-1 helper (0.7.5, cleanup wiring 0.7.16)
//
// Wraps @testing-library/react's render with the providers tier-1 UI
// tests need: mocked Next.js router, optional query client, optional
// auth state. Tests stay terse — one call covers the common setup.
// Override per test via the options object; add new provider slots
// here as the project grows (keep the options shape extensible).

import type { ReactElement } from "react";
import {
  render,
  cleanup,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react";
import { afterEach } from "vitest";

// Auto-unmount rendered components between tests. Registered at module
// load so any test file importing renderWithProviders gets cleanup
// automatically; prevents DOM state from a prior test leaking into the
// next `getByRole(...)` query. Without this, multiple tests in the
// same file that render the same component see each other's DOM —
// e.g., a warning banner from one test lingers into a later test that
// expects it to NOT be present. Identified by the brew agent as the
// root cause of "warning shouldn't render when X=true" style paralysis
// (slowcook 0.7.x dogfood, 2026-04-23).
afterEach(() => {
  cleanup();
});

export interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  /** Caller's Next.js router overrides, merged with sensible defaults. */
  router?: Partial<MockRouter>;
  /** Extra wrapping if needed (e.g., a test-only theme provider). */
  wrapper?: RenderOptions["wrapper"];
}

export interface MockRouter {
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
  prefetch: (href: string) => Promise<void>;
  pathname: string;
  searchParams: URLSearchParams;
}

/**
 * Default router — no-op functions, empty search params. Tests that
 * want to observe router calls pass their own `router: { push: vi.fn() }`.
 */
export function mockRouter(overrides: Partial<MockRouter> = {}): MockRouter {
  return {
    push: () => undefined,
    replace: () => undefined,
    back: () => undefined,
    forward: () => undefined,
    refresh: () => undefined,
    prefetch: async () => undefined,
    pathname: "/",
    searchParams: new URLSearchParams(),
    ...overrides,
  };
}

/**
 * Render a component with the standard set of providers. Returns the
 * usual @testing-library/react result plus the router instance so
 * tests can assert on navigation calls without having to re-construct
 * it.
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {}
): RenderResult & { router: MockRouter } {
  const { router: routerOverrides, wrapper, ...rest } = options;
  const router = mockRouter(routerOverrides);

  // `next/navigation` mocking happens in tests/setup.ts (global). This
  // helper's job is to make the router instance observable per-test.
  // If tests/setup.ts hasn't been wired yet, see context.md for the
  // required setup file pattern.

  const result = render(ui, { ...rest, wrapper });
  return { ...result, router };
}
