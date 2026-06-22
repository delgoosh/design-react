// @slowcook-one-time-scaffold UI tier-1 helper (0.7.5)
//
// Stand-in for the global `fetch` that tier-1 UI tests need. Mirrors
// the mockSupabase / realShapedCreateClient pattern: tests pass intent
// ("these routes, these responses"), and `realShapedFetch` wraps the
// mock to assert invocation shape — catching the class of bug where
// handler code calls fetch with the wrong args shape and tests pass
// because the mock ignores everything.

import { vi } from "vitest";

export interface MockFetchRoute {
  /** URL match — either literal substring or a regex. */
  url: string | RegExp;
  /** HTTP method to match (default: any). */
  method?: string;
  /** Response body to return. JSON objects are serialized automatically. */
  body?: unknown;
  /** HTTP status (default: 200). */
  status?: number;
  /** Extra response headers. */
  headers?: Record<string, string>;
}

export interface MockFetchConfig {
  routes?: MockFetchRoute[];
  /** Default response when no route matches. Omit to throw on unmatched. */
  fallback?: { status: number; body?: unknown };
}

export interface MockFetchClient {
  fn: ReturnType<typeof vi.fn>;
  /** Every recorded call. Handy for assertion. */
  calls: Array<{ url: string; method: string; body: unknown }>;
}

export function mockFetch(config: MockFetchConfig = {}): MockFetchClient {
  const calls: MockFetchClient["calls"] = [];
  const routes = config.routes ?? [];

  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const method = (init?.method ?? "GET").toUpperCase();
    const body = init?.body ? safeParseBody(init.body) : undefined;
    calls.push({ url, method, body });

    for (const route of routes) {
      if (route.method && route.method.toUpperCase() !== method) continue;
      const urlMatches =
        route.url instanceof RegExp ? route.url.test(url) : url.includes(route.url);
      if (!urlMatches) continue;
      return buildResponse(route);
    }

    if (config.fallback) {
      return new Response(
        typeof config.fallback.body === "string"
          ? config.fallback.body
          : JSON.stringify(config.fallback.body ?? {}),
        { status: config.fallback.status, headers: { "Content-Type": "application/json" } }
      );
    }

    throw new Error(
      `mockFetch: no route matched ${method} ${url}. Routes configured: ${routes.length}. Pass a \`fallback\` in MockFetchConfig to suppress this error.`
    );
  });

  return { fn, calls };
}

/**
 * Signature-asserting wrapper. Prefer this over passing `client.fn`
 * directly to `vi.stubGlobal("fetch", ...)` — catches handler code
 * that calls fetch with a wrong-shaped first argument (e.g. forgetting
 * to stringify a URL object, or passing an options bag by mistake).
 * Tests would pass without this (mock ignores unknown args) but
 * production would crash.
 */
export function realShapedFetch(
  client: MockFetchClient
): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    if (
      typeof input !== "string" &&
      !(input instanceof URL) &&
      !(typeof input === "object" && input !== null && "url" in input)
    ) {
      throw new Error(
        `realShapedFetch: first arg must be a string, URL, or Request; got ${typeof input}. This likely means the handler called fetch() without a URL or passed the options as the first arg.`
      );
    }
    return client.fn(input, init);
  }) as typeof fetch;
}

function buildResponse(route: MockFetchRoute): Response {
  const status = route.status ?? 200;
  const headers = {
    "Content-Type": "application/json",
    ...(route.headers ?? {}),
  };
  const body =
    typeof route.body === "string"
      ? route.body
      : JSON.stringify(route.body ?? {});
  return new Response(body, { status, headers });
}

function safeParseBody(body: BodyInit | null): unknown {
  if (typeof body !== "string") return body;
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}
