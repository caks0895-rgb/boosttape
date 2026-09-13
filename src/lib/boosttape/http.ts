export const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers":
    "Content-Type, Accept, PAYMENT-SIGNATURE, PAYMENT-REQUIRED",
  "access-control-expose-headers": "PAYMENT-RESPONSE, PAYMENT-REQUIRED",
};

export function jsonResponse(
  body: unknown,
  init?: { status?: number; cache?: string; headers?: Record<string, string> },
): Response {
  return Response.json(body, {
    status: init?.status ?? 200,
    headers: {
      ...CORS_HEADERS,
      "cache-control": init?.cache ?? "public, max-age=15",
      ...init?.headers,
    },
  });
}

export function corsPreflight(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS,
      "access-control-max-age": "86400",
    },
  });
}

export function mergeCorsHeaders(headers: Record<string, string>): Record<string, string> {
  return { ...CORS_HEADERS, ...headers };
}
