import { z } from 'zod';

export const CreateTaskSchema = z.object({
  incident_id: z.number().int().positive('incident_id must be a positive integer'),
  commitment_id: z.number().int().positive('commitment_id must be a positive integer'),
  assigned_to: z.string().trim().min(1, 'assigned_to is required').max(50),
  instructions: z.string().trim().min(5, 'Instructions must be at least 5 characters').max(2000),
  assigned_quantity: z.number().int().positive('assigned_quantity must be a positive integer').max(10000)
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export const AcknowledgeTaskSchema = z.object({
  action: z.enum(['ACCEPT', 'DECLINE'], {
    errorMap: () => ({ message: "Action must be either 'ACCEPT' or 'DECLINE'" })
  }),
  decline_reason: z.string().trim().max(1000).optional()
});

export type AcknowledgeTaskInput = z.infer<typeof AcknowledgeTaskSchema>;

export const DispatchTaskSchema = z.object({
  notes: z.string().trim().max(1000).optional(),
  quantity: z.number().int().positive('quantity must be a positive integer').optional()
});

export type DispatchTaskInput = z.infer<typeof DispatchTaskSchema>;

export const PostTaskUpdateSchema = z.object({
  message: z.string().trim().min(1, 'message is required').max(2000),
  update_type: z.enum(['PROGRESS', 'EXCEPTION'], {
    errorMap: () => ({ message: "update_type must be 'PROGRESS' or 'EXCEPTION'" })
  }).optional()
});

export type PostTaskUpdateInput = z.infer<typeof PostTaskUpdateSchema>;

export const SubmitOutcomeSchema = z.object({
  outcome_type: z.enum(['FULL', 'PARTIAL', 'FAILED'], {
    errorMap: () => ({ message: "Outcome type must be 'FULL', 'PARTIAL', or 'FAILED'" })
  }),
  delivered_quantity: z.number().int().min(0, 'Delivered quantity cannot be negative'),
  remainder_quantity: z.number().int().min(0, 'Remainder quantity cannot be negative'),
  exception_reason: z.string().trim().max(1000).optional()
});

export type SubmitOutcomeInput = z.infer<typeof SubmitOutcomeSchema>;
