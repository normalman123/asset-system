import { NextResponse } from "next/server";

export function jsonError(
  status: number,
  message: string,
  details?: unknown,
): NextResponse {
  return NextResponse.json(
    { error: message, ...(details !== undefined ? { details } : {}) },
    { status },
  );
}

export function handleRouteError(error: unknown): NextResponse {
  if (
    error instanceof Error &&
    "status" in error &&
    typeof (error as { status: number }).status === "number"
  ) {
    const status = (error as { status: number }).status;
    return jsonError(status, error.message);
  }
  if (error instanceof Error && (error as Error & { code?: string }).code === "FORBIDDEN_ORG") {
    return jsonError(403, "Forbidden: organization scope mismatch");
  }
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code: string }).code === "P2025"
  ) {
    return jsonError(404, "Not found");
  }
  console.error(error);
  return jsonError(500, "Internal server error");
}
