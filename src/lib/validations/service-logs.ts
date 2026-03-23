import { z } from "zod";
import {
  InspectionResult,
  ServiceLogStatus,
  ServiceLogType,
} from "@prisma/client";

export const createServiceLogSchema = z.object({
  asset_id: z.string().uuid(),
  worker_user_id: z.string().uuid(),
  inspection_title: z.string().min(1),
  inspection_detail: z.string().optional().nullable(),
  inspection_result: z.nativeEnum(InspectionResult).optional().nullable(),
  log_type: z.nativeEnum(ServiceLogType),
  occurred_date: z.coerce.date(),
  received_date: z.coerce.date().optional().nullable(),
  status: z.nativeEnum(ServiceLogStatus),
  before_photos: z.array(z.string()).optional(),
  after_photos: z.array(z.string()).optional(),
  custom_fields: z.record(z.string(), z.unknown()).optional(),
});

export const updateServiceLogSchema = createServiceLogSchema
  .omit({ asset_id: true, worker_user_id: true })
  .partial()
  .extend({
    asset_id: z.string().uuid().optional(),
    worker_user_id: z.string().uuid().optional(),
  });

export type CreateServiceLogInput = z.infer<typeof createServiceLogSchema>;
export type UpdateServiceLogInput = z.infer<typeof updateServiceLogSchema>;
