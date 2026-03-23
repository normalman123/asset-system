import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CreateServiceLogInput,
  UpdateServiceLogInput,
} from "@/lib/validations/service-logs";

async function assertAssetInOrg(orgId: string, assetId: string): Promise<void> {
  const a = await prisma.asset.findFirst({
    where: { id: assetId, orgId },
    select: { id: true },
  });
  if (!a) {
    const err = new Error("asset_id must belong to the organization");
    (err as Error & { status: number }).status = 400;
    throw err;
  }
}

async function assertWorkerInOrg(orgId: string, workerUserId: string): Promise<void> {
  const u = await prisma.user.findFirst({
    where: { id: workerUserId, orgId, isActive: true },
    select: { id: true },
  });
  if (!u) {
    const err = new Error("worker_user_id must be an active user in the organization");
    (err as Error & { status: number }).status = 400;
    throw err;
  }
}

export async function listServiceLogsForAsset(orgId: string, assetId: string) {
  await assertAssetInOrg(orgId, assetId);
  return prisma.serviceLog.findMany({
    where: { orgId, assetId },
    orderBy: { occurredDate: "desc" },
    include: {
      worker: { select: { id: true, name: true, email: true } },
      asset: { select: { id: true, assetCode: true, name: true } },
    },
  });
}

export async function getServiceLogDetail(orgId: string, logId: string) {
  return prisma.serviceLog.findFirst({
    where: { id: logId, orgId },
    include: {
      worker: { select: { id: true, name: true, email: true, role: true } },
      asset: { select: { id: true, assetCode: true, name: true, assetType: true } },
    },
  });
}

export async function createServiceLog(orgId: string, input: CreateServiceLogInput) {
  await assertAssetInOrg(orgId, input.asset_id);
  await assertWorkerInOrg(orgId, input.worker_user_id);

  const data: Prisma.ServiceLogCreateInput = {
    organization: { connect: { id: orgId } },
    asset: { connect: { id: input.asset_id } },
    worker: { connect: { id: input.worker_user_id } },
    inspectionTitle: input.inspection_title,
    inspectionDetail: input.inspection_detail ?? undefined,
    inspectionResult: input.inspection_result ?? undefined,
    logType: input.log_type,
    occurredDate: input.occurred_date,
    receivedDate: input.received_date ?? undefined,
    status: input.status,
    beforePhotos: input.before_photos ?? [],
    afterPhotos: input.after_photos ?? [],
    customFields: (input.custom_fields ?? {}) as Prisma.InputJsonValue,
  };

  return prisma.serviceLog.create({
    data,
    include: {
      worker: { select: { id: true, name: true, email: true } },
      asset: { select: { id: true, assetCode: true, name: true } },
    },
  });
}

export async function updateServiceLog(
  orgId: string,
  logId: string,
  input: UpdateServiceLogInput,
) {
  const existing = await prisma.serviceLog.findFirst({
    where: { id: logId, orgId },
    select: { id: true, assetId: true, workerUserId: true },
  });
  if (!existing) return null;

  const nextAssetId = input.asset_id ?? existing.assetId;
  const nextWorkerId = input.worker_user_id ?? existing.workerUserId;

  if (input.asset_id) await assertAssetInOrg(orgId, input.asset_id);
  if (input.worker_user_id) await assertWorkerInOrg(orgId, input.worker_user_id);

  if (input.asset_id || input.worker_user_id) {
    await assertAssetInOrg(orgId, nextAssetId);
    await assertWorkerInOrg(orgId, nextWorkerId);
  }

  const data: Prisma.ServiceLogUpdateInput = {};
  if (input.inspection_title !== undefined) data.inspectionTitle = input.inspection_title;
  if (input.inspection_detail !== undefined) {
    data.inspectionDetail = input.inspection_detail ?? null;
  }
  if (input.inspection_result !== undefined) {
    data.inspectionResult = input.inspection_result ?? null;
  }
  if (input.log_type !== undefined) data.logType = input.log_type;
  if (input.occurred_date !== undefined) data.occurredDate = input.occurred_date;
  if (input.received_date !== undefined) data.receivedDate = input.received_date ?? null;
  if (input.status !== undefined) data.status = input.status;
  if (input.before_photos !== undefined) data.beforePhotos = input.before_photos;
  if (input.after_photos !== undefined) data.afterPhotos = input.after_photos;
  if (input.custom_fields !== undefined) {
    data.customFields = input.custom_fields as Prisma.InputJsonValue;
  }
  if (input.asset_id !== undefined) data.asset = { connect: { id: input.asset_id } };
  if (input.worker_user_id !== undefined) {
    data.worker = { connect: { id: input.worker_user_id } };
  }

  return prisma.serviceLog.update({
    where: { id: logId },
    data,
    include: {
      worker: { select: { id: true, name: true, email: true } },
      asset: { select: { id: true, assetCode: true, name: true } },
    },
  });
}

export async function deleteServiceLog(orgId: string, logId: string) {
  const existing = await prisma.serviceLog.findFirst({
    where: { id: logId, orgId },
    select: { id: true },
  });
  if (!existing) return false;
  await prisma.serviceLog.delete({ where: { id: logId } });
  return true;
}
