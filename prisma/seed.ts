import {
  AssetCondition,
  AssetType,
  CustomFieldEntityType,
  PrismaClient,
  ServiceLogStatus,
  ServiceLogType,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const platformOrg = await prisma.organization.upsert({
    where: { orgCode: "PLATFORM" },
    update: {},
    create: {
      name: "Platform",
      orgCode: "PLATFORM",
      isActive: true,
      settings: {
        create: {
          homepageTitle: "Platform",
          contactEmail: "platform@example.com",
        },
      },
    },
  });

  const acme = await prisma.organization.upsert({
    where: { orgCode: "ACME" },
    update: {},
    create: {
      name: "ACME Corp",
      orgCode: "ACME",
      isActive: true,
      settings: {
        create: {
          primaryColor: "#0f172a",
          secondaryColor: "#38bdf8",
          homepageTitle: "ACME Assets",
          contactEmail: "ops@acme.example",
        },
      },
    },
  });

  const superAdmin = await prisma.user.upsert({
    where: {
      orgId_email: { orgId: platformOrg.id, email: "super@example.com" },
    },
    update: {},
    create: {
      orgId: platformOrg.id,
      name: "Super Admin",
      email: "super@example.com",
      role: UserRole.super_admin,
    },
  });

  const orgAdmin = await prisma.user.upsert({
    where: { orgId_email: { orgId: acme.id, email: "admin@acme.example" } },
    update: {},
    create: {
      orgId: acme.id,
      name: "Org Admin",
      email: "admin@acme.example",
      role: UserRole.org_admin,
    },
  });

  const manager = await prisma.user.upsert({
    where: { orgId_email: { orgId: acme.id, email: "manager@acme.example" } },
    update: {},
    create: {
      orgId: acme.id,
      name: "Facility Manager",
      email: "manager@acme.example",
      role: UserRole.manager,
    },
  });

  const staff = await prisma.user.upsert({
    where: { orgId_email: { orgId: acme.id, email: "staff@acme.example" } },
    update: {},
    create: {
      orgId: acme.id,
      name: "Field Staff",
      email: "staff@acme.example",
      role: UserRole.staff,
    },
  });

  const asset = await prisma.asset.upsert({
    where: {
      orgId_assetCode: { orgId: acme.id, assetCode: "HV-001" },
    },
    update: {},
    create: {
      orgId: acme.id,
      assetCode: "HV-001",
      name: "Lobby HVAC Unit",
      assetType: AssetType.air_conditioner,
      condition: AssetCondition.active,
      location: "HQ / Lobby",
      managerUserId: manager.id,
      customFields: { install_year: 2022 },
    },
  });

  await prisma.serviceLog.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      orgId: acme.id,
      assetId: asset.id,
      workerUserId: staff.id,
      inspectionTitle: "Quarterly inspection",
      inspectionDetail: "Filter check",
      logType: ServiceLogType.inspection,
      occurredDate: new Date(),
      status: ServiceLogStatus.completed,
      beforePhotos: [],
      afterPhotos: [],
      customFields: { checklist_version: "v1" },
    },
  });

  await prisma.orgCustomFieldDefinition.upsert({
    where: {
      orgId_entityType_fieldKey: {
        orgId: acme.id,
        entityType: CustomFieldEntityType.asset,
        fieldKey: "warranty_expires",
      },
    },
    update: {},
    create: {
      orgId: acme.id,
      entityType: CustomFieldEntityType.asset,
      fieldKey: "warranty_expires",
      fieldLabel: "Warranty expiry",
      fieldType: "date",
      isRequired: false,
      sortOrder: 10,
    },
  });

  // eslint-disable-next-line no-console
  console.log("Seed OK. Example header for ACME org_admin:");
  // eslint-disable-next-line no-console
  console.log(`  x-user-id: ${orgAdmin.id}`);
  // eslint-disable-next-line no-console
  console.log(`  ACME org id: ${acme.id}`);
  // eslint-disable-next-line no-console
  console.log(`Super admin x-user-id: ${superAdmin.id}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
