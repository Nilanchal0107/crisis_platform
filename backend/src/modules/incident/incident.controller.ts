import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { GUEST_REPORTER_ID } from '@vrl/shared';
import { IncidentService } from './incident.service.js';
import {
  CreateReportSchema,
  AddClarificationSchema,
  VerifyReportSchema,
  RejectReportSchema,
  ConfirmReconciliationSchema
} from './incident.schema.js';

export class IncidentController {
  static async createReport(req: Request, res: Response): Promise<void> {
    try {
      const parsed = CreateReportSchema.parse(req.body);
      const actorId = req.actor?.id || 'aarav';
      const actorRole = req.actor?.role || 'REPORTER';

      const report = IncidentService.createReport(parsed, actorId, actorRole);
      res.status(201).json({
        status: 'CREATED',
        report
      });
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'Invalid incident report parameters',
          details: err.errors
        });
        return;
      }
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  static async getReportByRef(req: Request, res: Response): Promise<void> {
    try {
      const ref = req.params.ref;
      const report = IncidentService.getReportByRef(ref);

      if (!report) {
        res.status(404).json({
          error: 'REPORT_NOT_FOUND',
          message: `No public record found for reference code: ${ref}`
        });
        return;
      }

      res.status(200).json(report);
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  static async addClarification(req: Request, res: Response): Promise<void> {
    try {
      const ref = req.params.ref;
      const parsed = AddClarificationSchema.parse(req.body);
      const authorId = req.actor?.id || 'aarav';
      const authorRole = req.actor?.role || 'REPORTER';

      const update = IncidentService.addClarification(ref, parsed.message, authorId, authorRole);
      res.status(201).json({
        status: 'CLARIFICATION_ADDED',
        update
      });
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'Invalid clarification payload',
          details: err.errors
        });
        return;
      }
      if (err.message === 'REPORT_NOT_FOUND') {
        res.status(404).json({
          error: 'REPORT_NOT_FOUND',
          message: `Report reference code not found: ${req.params.ref}`
        });
        return;
      }
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  static async listMyReports(req: Request, res: Response): Promise<void> {
    try {
      const actorId = req.actor?.id;
      if (!actorId) {
        res.status(401).json({ error: 'UNAUTHENTICATED', message: 'An actor identity is required.' });
        return;
      }
      if (actorId === GUEST_REPORTER_ID) {
        res.status(403).json({
          error: 'HISTORY_NOT_AVAILABLE_FOR_GUEST',
          message: 'Report history isn\'t available for anonymous Quick Reports — sign in or log in to track your reports.'
        });
        return;
      }

      const reports = IncidentService.listReportsByReporter(actorId);
      res.status(200).json({ count: reports.length, reports });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  static async listReports(req: Request, res: Response): Promise<void> {
    try {
      const statusFilter = req.query.status as string | undefined;
      const reports = IncidentService.listReports(statusFilter);
      res.status(200).json({
        count: reports.length,
        reports
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  static async getReportById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid report ID' });
        return;
      }

      const report = IncidentService.getReportById(id);
      if (!report) {
        res.status(404).json({ error: 'REPORT_NOT_FOUND', message: `Report ID ${id} not found` });
        return;
      }

      res.status(200).json(report);
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  static async verifyReport(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid report ID' });
        return;
      }

      const parsed = VerifyReportSchema.parse(req.body);
      const coordinatorId = req.actor?.id || 'rajesh';

      const result = IncidentService.verifyReport(id, coordinatorId, parsed);
      res.status(200).json({
        status: 'VERIFIED',
        incident: result.incident,
        report: result.report
      });
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'Invalid verification parameters',
          details: err.errors
        });
        return;
      }
      if (err.message === 'REPORT_NOT_FOUND') {
        res.status(404).json({ error: 'REPORT_NOT_FOUND', message: `Report ID ${req.params.id} not found` });
        return;
      }
      if (err.message?.startsWith('REPORT_ALREADY_PROCESSED')) {
        res.status(409).json({
          error: 'CONFLICT',
          message: err.message
        });
        return;
      }
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  static async rejectReport(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid report ID' });
        return;
      }

      const parsed = RejectReportSchema.parse(req.body);
      const coordinatorId = req.actor?.id || 'rajesh';

      const report = IncidentService.rejectReport(id, coordinatorId, parsed);
      res.status(200).json({
        status: 'REJECTED',
        report
      });
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'Invalid rejection payload: Reason is mandatory',
          details: err.errors
        });
        return;
      }
      if (err.message === 'REPORT_NOT_FOUND') {
        res.status(404).json({ error: 'REPORT_NOT_FOUND', message: `Report ID ${req.params.id} not found` });
        return;
      }
      if (err.message?.startsWith('REPORT_ALREADY_PROCESSED')) {
        res.status(409).json({
          error: 'CONFLICT',
          message: err.message
        });
        return;
      }
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  static async listCanonicalIncidents(req: Request, res: Response): Promise<void> {
    try {
      const incidents = IncidentService.listCanonicalIncidents();
      res.status(200).json({
        count: incidents.length,
        incidents
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  static async confirmReconciliation(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid incident ID' });
        return;
      }

      const parsed = ConfirmReconciliationSchema.parse(req.body || {});
      const coordinatorId = req.actor?.id || 'rajesh';

      const incident = IncidentService.confirmReconciliation(id, coordinatorId, parsed);
      res.status(200).json({
        status: incident.status,
        incident
      });
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(422).json({
          error: 'VALIDATION_ERROR',
          message: 'Invalid reconciliation payload',
          details: err.errors
        });
        return;
      }
      if (err.message === 'INCIDENT_NOT_FOUND') {
        res.status(404).json({ error: 'INCIDENT_NOT_FOUND', message: `Incident #${req.params.id} not found` });
        return;
      }
      if (err.message?.startsWith('TASKS_STILL_ACTIVE') || err.message === 'NO_TASKS_FOR_INCIDENT') {
        res.status(409).json({ error: 'CONFLICT', message: err.message });
        return;
      }
      console.error('[confirmReconciliation error]', err);
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
}
