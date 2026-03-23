import { z } from "zod";
import { AssetCondition, AssetType } from "@prisma/client";

export const createAssetSchema = z.object({
  asset_code: z.string().min(1),
  name: z.string().min(1),
  asset_type: z.nativeEnum(AssetType),
  condition: z.nativeEnum(AssetCondition),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  manager_user_id: z.string().uuid().optional().nullable(),
  custom_fields: z.record(z.string(), z.unknown()).optional(),
});

export const updateAssetSchema = createAssetSchema.partial();

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
