// @slowcook-one-time-scaffold UI tier-1 helper (0.7.5, jest-dom wiring 0.7.11)
//
// Centralises UI testing matchers so individual tests don't re-wire
// per-file. Importing this file (via the tier-1 UI test's import of
// `axe`) extends vitest's `expect` with:
//
//   - jest-axe's `toHaveNoViolations` — accessibility audits.
//   - @testing-library/jest-dom's full matcher set —
//     toBeInTheDocument, toHaveTextContent, toHaveClass, toBeDisabled,
//     toBeVisible, toHaveAccessibleName, and ~30 others. Without this
//     import, tests that use those matchers fail with a misleading
//     "Invalid Chai property: toBeInTheDocument" error.
//
// 0.7.11 backstory: the jest-dom import was missing in 0.7.5 Phase A.
// First UI brew run during dogfood (~$3.39 spent) halted in agent
// analysis-paralysis because 16 tests failed with the misleading Chai
// error — agent read "alert test fails" as "my code renders an alert
// wrongly" and couldn't reconcile. Adding this import makes all the
// standard DOM matchers work; brew runs can see real signal.

// Side-effect import — auto-extends vitest's `expect` with jest-dom
// matchers + registers TypeScript augmentations so tests type-check
// without per-file /// <reference> directives.
import "@testing-library/jest-dom/vitest";

import { axe as axeCore, toHaveNoViolations } from "jest-axe";
import { expect } from "vitest";

expect.extend(toHaveNoViolations);

/**
 * Thin re-export of `jest-axe`'s axe(). Runs a11y audits against a
 * rendered DOM container and returns a result compatible with
 * `expect(result).toHaveNoViolations()`.
 *
 * Usage:
 *   const { container } = renderWithProviders(<ProfileEditForm .../>);
 *   expect(await axe(container)).toHaveNoViolations();
 */
export const axe = axeCore;

// TypeScript augmentation so .toHaveNoViolations() type-checks without
// per-test `/// <reference>` directives.
declare module "vitest" {
  interface Assertion<T = unknown> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): unknown;
  }
}
