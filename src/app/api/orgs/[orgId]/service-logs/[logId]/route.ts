import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api-errors";
import { resolveOrgRequest } from "@/lib/api-org-context";
import * as serviceLogsService from "@/lib/services/service-logs.service";
import { updateServiceLogSchema } from "@/lib/validations/service-logs";

type RouteParams = { params: Promise<{ orgId: string; logId: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { orgId, logId } = await params;
  const ctx = await resolveOrgRequest(req, orgId);
  if (!ctx.ok) return ctx.response;
  try {
    const log = await serviceLogsService.getServiceLogDetail(orgId, logId);
    if (!log) return jsonError(404, "Service log not found");
    return NextResponse.json({ data: log });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { orgId, logId } = await params;
  const ctx = await resolveOrgRequest(req, orgId);
  if (!ctx.ok) return ctx.response;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }
  const parsed = updateServiceLogSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "Validation failed", parsed.error.flatten());
  }
  try {
    const updated = await serviceLogsService.updateServiceLog(orgId, logId, parsed.data);
    if (!updated) return jsonError(404, "Service log not found");
    return NextResponse.json({ data: updated });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { orgId, logId } = await params;
  const ctx = await resolveOrgRequest(req, orgId);
  if (!ctx.ok) return ctx.response;
  try {
    const ok = await serviceLogsService.deleteServiceLog(orgId, logId);
    if (!ok) return jsonError(404, "Service log not found");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
