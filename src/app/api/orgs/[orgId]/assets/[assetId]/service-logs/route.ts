import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api-errors";
import { resolveOrgRequest } from "@/lib/api-org-context";
import * as serviceLogsService from "@/lib/services/service-logs.service";

type RouteParams = { params: Promise<{ orgId: string; assetId: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { orgId, assetId } = await params;
  const ctx = await resolveOrgRequest(req, orgId);
  if (!ctx.ok) return ctx.response;
  try {
    const items = await serviceLogsService.listServiceLogsForAsset(orgId, assetId);
    return NextResponse.json({ data: items });
  } catch (e) {
    return handleRouteError(e);
  }
}
