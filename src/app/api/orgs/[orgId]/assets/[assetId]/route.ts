import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/api-errors";
import { resolveOrgRequest } from "@/lib/api-org-context";
import * as assetsService from "@/lib/services/assets.service";
import { updateAssetSchema } from "@/lib/validations/assets";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ orgId: string; assetId: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { orgId, assetId } = await params;
  const ctx = await resolveOrgRequest(req, orgId);
  if (!ctx.ok) return ctx.response;
  try {
    const asset = await assetsService.getAssetDetailWithLogs(orgId, assetId);
    if (!asset) return jsonError(404, "Asset not found");
    return NextResponse.json({ data: asset });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { orgId, assetId } = await params;
  const ctx = await resolveOrgRequest(req, orgId);
  if (!ctx.ok) return ctx.response;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body");
  }
  const parsed = updateAssetSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "Validation failed", parsed.error.flatten());
  }
  try {
    const updated = await assetsService.updateAsset(orgId, assetId, parsed.data);
    if (!updated) return jsonError(404, "Asset not found");
    return NextResponse.json({ data: updated });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { orgId, assetId } = await params;
  const ctx = await resolveOrgRequest(req, orgId);
  if (!ctx.ok) return ctx.response;
  try {
    const ok = await assetsService.deleteAsset(orgId, assetId);
    if (!ok) return jsonError(404, "Asset not found");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}