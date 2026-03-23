import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { assertOrgAccess, getUserFromRequestHeaders, type TenantUser } from "@/lib/tenant";

export async function resolveOrgRequest(
  req: NextRequest,
  orgId: string,
): Promise<{ ok: true; user: TenantUser } | { ok: false; response: NextResponse }> {
  const userId = req.headers.get("x-user-id");
  const user = await getUserFromRequestHeaders(userId);
  if (!user) {
    return { ok: false, response: jsonError(401, "Unauthorized: missing or invalid x-user-id") };
  }
  try {
    assertOrgAccess(user, orgId);
  } catch {
    return {
      ok: false,
      response: jsonError(403, "Forbidden: organization scope mismatch"),
    };
  }
  return { ok: true, user };
}
