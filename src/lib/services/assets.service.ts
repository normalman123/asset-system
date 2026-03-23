import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateAssetInput, UpdateAssetInput } from "@/lib/validations/assets";

async function assertUserInOrg(orgId: string, userId: string): Promise<void> {
  const u = await prisma.user.findFirst({
    where: { id: userId, orgId, isActive: true },
    select: { id: true },
  });
  if (!u) {
    const err = new Error("Manager or worker must belong to the same organization");
    (err as Error & { status: number }).status = 400;
    throw err;
  }
}

export async function listAssets(orgId: string) {
  return prisma.asset.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    include: {
      manager: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getAssetDetailWithLogs(orgId: string, assetId: string) {
  return prisma.asset.findFirst({
    where: { id: assetId, orgId },
    include: {
      manager: { select: { id: true, name: true, email: true, role: true } },
      serviceLogs: {
        orderBy: { occurredDate: "desc" },
        include: {
          worker: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
}

export async function createAsset(orgId: string, input: CreateAssetInput) {
  if (input.manager_user_id) {
    await assertUserInOrg(orgId, input.manager_user_id);
  }
  const data: Prisma.AssetCreateInput = {
    organization: { connect: { id: orgId } },
    assetCode: input.asset_code,
    name: input.name,
    assetType: input.asset_type,
    condition: input.condition,
    description: input.description ?? undefined,
    location: input.location ?? undefined,
    customFields: (input.custom_fields ?? {}) as Prisma.InputJsonValue,
  };
  if (input.manager_user_id) {
    data.manager = { connect: { id: input.manager_user_id } };
  }
  return prisma.asset.create({
    data,
    include: {
      manager: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function updateAsset(
  orgId: string,
  assetId: string,
  input: UpdateAssetInput,
) {
  const existing = await prisma.asset.findFirst({
    where: { id: assetId, orgId },
    select: { id: true },
  });
  if (!existing) return null;

  if (input.manager_user_id) {
    await assertUserInOrg(orgId, input.manager_user_id);
  }

  const data: Prisma.AssetUpdateInput = {};
  if (input.asset_code !== undefined) data.assetCode = input.asset_code;
  if (input.name !== undefined) data.name = input.name;
  if (input.asset_type !== undefined) data.assetType = input.asset_type;
  if (input.condition !== undefined) data.condition = input.condition;
  if (input.description !== undefined) data.description = input.description ?? null;
  if (input.location !== undefined) data.location = input.location ?? null;
  if (input.custom_fields !== undefined) {
    data.customFields = input.custom_fields as Prisma.InputJsonValue;
  }
  if (input.manager_user_id !== undefined) {
    data.manager = input.manager_user_id
      ? { connect: { id: input.manager_user_id } }
      : { disconnect: true };
  }

  return prisma.asset.update({
    where: { id: assetId },
    data,
    include: {
      manager: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function deleteAsset(orgId: string, assetId: string) {
  const existing = await prisma.asset.findFirst({
    where: { id: assetId, orgId },
    select: { id: true },
  });
  if (!existing) return false;
  await prisma.asset.delete({ where: { id: assetId } });
  return true;
}
