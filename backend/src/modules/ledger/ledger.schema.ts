import { z } from 'zod';

export const ReserveResourceSchema = z.object({
  quantity: z.number().int().positive('Reservation quantity must be a positive integer').max(10000),
  pool_id: z.number().int().positive().optional().default(1),
  notes: z.string().trim().max(500).optional()
});

export const AdjustStockSchema = z.object({
  quantity_delta: z.number().int().min(-100000).max(100000).refine((v) => v !== 0, 'Quantity delta cannot be zero'),
  reason: z.string().trim().min(3, 'A reason of at least 3 characters is required').max(500)
});

export type ReserveResourceInput = z.infer<typeof ReserveResourceSchema>;
export type AdjustStockInput = z.infer<typeof AdjustStockSchema>;
