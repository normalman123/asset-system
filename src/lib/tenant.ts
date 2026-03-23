import type { User, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type TenantUser = Pick<User, "id" | "orgId" | "role" | "isActive">;

export async function getUserFromRequestHeaders(
  userIdHeader: string | null,
): Promise<TenantUser | null> {
  if (!userIdHeader?.trim()) return null;
  const user = await prisma.user.findUnique({
    where: { id: userIdHeader.trim() },
    select: { id: true, orgId: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) return null;
  return user;
}

export function assertOrgAccess(user: TenantUser, pathOrgId: string): void {
  if (user.role === "super_admin") return;
  if (user.orgId !== pathOrgId) {
    const err = new Error("FORBIDDEN_ORG");
    (err as Error & { code: string }).code = "FORBIDDEN_ORG";
    throw err;
  }
}

export function tenantWhereOrg(orgId: string) {
  return { orgId } as const;
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === "super_admin";
}
