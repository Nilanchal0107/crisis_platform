import { z } from 'zod';
import { IncidentType, ReporterSeverity, IncidentPriority } from '@vrl/shared';

export const CreateReportSchema = z.object({
  location_name: z.string().trim().min(3, 'Location name must be at least 3 characters').max(100),
  latitude: z.number().min(-90.0, 'Latitude must be >= -90').max(90.0, 'Latitude must be <= 90'),
  longitude: z.number().min(-180.0, 'Longitude must be >= -180').max(180.0, 'Longitude must be <= 180'),
  incident_type: z.nativeEnum(IncidentType, {
    errorMap: () => ({ message: 'Invalid incident type' })
  }),
  reporter_severity: z.nativeEnum(ReporterSeverity, {
    errorMap: () => ({ message: 'Invalid reporter severity' })
  }),
  description: z.string().trim().min(5, 'Description must be at least 5 characters').max(1000),
  contact_safe: z.string().trim().max(100).optional()
});

export const AddClarificationSchema = z.object({
  message: z.string().trim().min(3, 'Clarification note must be at least 3 characters').max(2000)
});

export const VerifyReportSchema = z.object({
  priority: z.nativeEnum(IncidentPriority).optional(),
  closure_notes: z.string().trim().max(1000).optional()
});

export const RejectReportSchema = z.object({
  rejection_reason: z.string().trim().min(3, 'Rejection reason must be at least 3 characters').max(500)
});

export const ConfirmReconciliationSchema = z.object({
  closure_notes: z.string().trim().max(1000).optional()
});

export type CreateReportInput = z.infer<typeof CreateReportSchema>;
export type AddClarificationInput = z.infer<typeof AddClarificationSchema>;
export type VerifyReportInput = z.infer<typeof VerifyReportSchema>;
export type RejectReportInput = z.infer<typeof RejectReportSchema>;
export type ConfirmReconciliationInput = z.infer<typeof ConfirmReconciliationSchema>;
