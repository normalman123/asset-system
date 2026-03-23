-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('super_admin', 'org_admin', 'manager', 'staff');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('air_conditioner', 'refrigerator', 'cctv', 'server', 'printer');

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('active', 'inactive', 'repair', 'retired');

-- CreateEnum
CREATE TYPE "InspectionResult" AS ENUM ('normal', 'warning', 'issue', 'completed');

-- CreateEnum
CREATE TYPE "ServiceLogType" AS ENUM ('inspection', 'repair', 'maintenance', 'replacement');

-- CreateEnum
CREATE TYPE "ServiceLogStatus" AS ENUM ('received', 'in_progress', 'completed', 'closed');

-- CreateEnum
CREATE TYPE "CustomFieldEntityType" AS ENUM ('asset', 'service_log');

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "org_code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_settings" (
    "id" UUID NOT NULL,
    "org_id" UUID NOT NULL,
    "logo_url" TEXT,
    "primary_color" TEXT,
    "secondary_color" TEXT,
    "homepage_title" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "org_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" UUID NOT NULL,
    "org_id" UUID NOT NULL,
    "asset_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "asset_type" "AssetType" NOT NULL,
    "condition" "AssetCondition" NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "manager_user_id" UUID,
    "custom_fields" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_logs" (
    "id" UUID NOT NULL,
    "org_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "worker_user_id" UUID NOT NULL,
    "inspection_title" TEXT NOT NULL,
    "inspection_detail" TEXT,
    "inspection_result" "InspectionResult",
    "log_type" "ServiceLogType" NOT NULL,
    "occurred_date" TIMESTAMP(3) NOT NULL,
    "received_date" TIMESTAMP(3),
    "status" "ServiceLogStatus" NOT NULL,
    "before_photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "after_photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "custom_fields" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_custom_field_definitions" (
    "id" UUID NOT NULL,
    "org_id" UUID NOT NULL,
    "entity_type" "CustomFieldEntityType" NOT NULL,
    "field_key" TEXT NOT NULL,
    "field_label" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_custom_field_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_org_code_key" ON "organizations"("org_code");

-- CreateIndex
CREATE INDEX "organizations_org_code_idx" ON "organizations"("org_code");

-- CreateIndex
CREATE UNIQUE INDEX "org_settings_org_id_key" ON "org_settings"("org_id");

-- CreateIndex
CREATE INDEX "users_org_id_idx" ON "users"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_org_id_email_key" ON "users"("org_id", "email");

-- CreateIndex
CREATE INDEX "assets_org_id_idx" ON "assets"("org_id");

-- CreateIndex
CREATE INDEX "assets_manager_user_id_idx" ON "assets"("manager_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "assets_org_id_asset_code_key" ON "assets"("org_id", "asset_code");

-- CreateIndex
CREATE INDEX "service_logs_org_id_idx" ON "service_logs"("org_id");

-- CreateIndex
CREATE INDEX "service_logs_asset_id_idx" ON "service_logs"("asset_id");

-- CreateIndex
CREATE INDEX "service_logs_worker_user_id_idx" ON "service_logs"("worker_user_id");

-- CreateIndex
CREATE INDEX "service_logs_org_id_asset_id_idx" ON "service_logs"("org_id", "asset_id");

-- CreateIndex
CREATE INDEX "org_custom_field_definitions_org_id_entity_type_idx" ON "org_custom_field_definitions"("org_id", "entity_type");

-- CreateIndex
CREATE UNIQUE INDEX "org_custom_field_definitions_org_id_entity_type_field_key_key" ON "org_custom_field_definitions"("org_id", "entity_type", "field_key");

-- AddForeignKey
ALTER TABLE "org_settings" ADD CONSTRAINT "org_settings_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_manager_user_id_fkey" FOREIGN KEY ("manager_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_logs" ADD CONSTRAINT "service_logs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_logs" ADD CONSTRAINT "service_logs_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_logs" ADD CONSTRAINT "service_logs_worker_user_id_fkey" FOREIGN KEY ("worker_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_custom_field_definitions" ADD CONSTRAINT "org_custom_field_definitions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
