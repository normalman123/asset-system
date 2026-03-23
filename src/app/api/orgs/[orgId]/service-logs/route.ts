import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api-errors";
import { resolveOrgRequest } from "@/lib/api-org-context";
import * as serviceLogsService from "@/lib/services/service-logs.service";
import { createServiceLogSchema } from "@/lib/validations/service-logs";

type RouteParams = { params: Promise<{ orgId: string }> };

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { orgId } = await params;
  const ctx = await resolveOrgRequest(req, orgId);
  if (!ctx.ok) return ctx.response;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }
  const parsed = createServiceLogSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "Validation failed", parsed.error.flatten());
  }
  try {
    const created = await serviceLogsService.createServiceLog(orgId, parsed.data);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (e) {
    return handleRouteError(e);
  }
}
