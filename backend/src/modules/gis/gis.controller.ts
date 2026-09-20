import { Request, Response } from 'express';
import { db } from '../../db/connection.js';
import { GeoJSONFeature, GeoJSONFeatureCollection } from '@vrl/shared';

export class GISController {
  /**
   * GET /api/map/features
   * Dynamic GeoJSON FeatureCollection generation
   */
  static getFeatures(req: Request, res: Response): void {
    try {
      const features: GeoJSONFeature[] = [];

      // 1. Mithi River Basin Hazard Zone (Polyline)
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [72.8550, 19.0550],
            [72.8630, 19.0595],
            [72.8680, 19.0620],
            [72.8750, 19.0645],
            [72.8793, 19.0657], // Kranti Nagar Bridge
            [72.8834, 19.0712]  // Bail Bazar Junction
          ]
        },
        properties: {
          id: 'mithi-river-channel',
          category: 'HAZARD_ZONE',
          name: 'Mithi River Monsoon Flood Channel',
          description: 'High-risk monsoon overflow corridor affecting Kurla West settlements.',
          risk_level: 'CRITICAL_HAZARD',
          stroke_color: '#3B82F6',
          stroke_width: 5
        }
      });

      // 2. Resource Pools (BKC Depot 1 Navy Triangle)
      const pools = db.prepare(`
        SELECT id, resource_name, depot_name, unit, latitude, longitude,
               total_quantity, available_quantity, reserved_quantity,
               in_transit_quantity, delivered_quantity, provenance
        FROM resource_pools
      `).all() as any[];

      for (const p of pools) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [p.longitude, p.latitude]
          },
          properties: {
            id: `depot-${p.id}`,
            pool_id: p.id,
            category: 'DEPOT',
            name: p.depot_name,
            resource_name: p.resource_name,
            unit: p.unit,
            available_quantity: p.available_quantity,
            reserved_quantity: p.reserved_quantity,
            in_transit_quantity: p.in_transit_quantity,
            delivered_quantity: p.delivered_quantity,
            total_quantity: p.total_quantity,
            provenance: p.provenance
          }
        });
      }

      // 3. Community Reports & Verified Incidents
      const reports = db.prepare(`
        SELECT r.id, r.reference_code, r.reporter_id, r.location_name,
               r.latitude, r.longitude, r.incident_type, r.reporter_severity,
               r.description, r.status, r.created_at,
               c.id as canonical_id, c.priority, c.status as canonical_status,
               t.id as task_id, t.status as task_status, t.assigned_to,
               u.display_name as assigned_to_name
        FROM source_reports r
        LEFT JOIN canonical_incidents c ON c.primary_report_id = r.id
        LEFT JOIN tasks t ON t.incident_id = c.id
        LEFT JOIN users u ON u.id = t.assigned_to
        ORDER BY r.id ASC
      `).all() as any[];

      for (const r of reports) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [r.longitude, r.latitude]
          },
          properties: {
            id: `report-${r.id}`,
            report_id: r.id,
            reference_code: r.reference_code,
            category: 'INCIDENT',
            location_name: r.location_name,
            incident_type: r.incident_type,
            reporter_severity: r.reporter_severity,
            description: r.description,
            report_status: r.status,
            canonical_id: r.canonical_id || null,
            canonical_status: r.canonical_status || null,
            priority: r.priority || null,
            task_id: r.task_id || null,
            task_status: r.task_status || null,
            assigned_to_name: r.assigned_to_name || null,
            created_at: r.created_at
          }
        });
      }

      const collection: GeoJSONFeatureCollection = {
        type: 'FeatureCollection',
        features
      };

      res.status(200).json(collection);
    } catch (err: any) {
      console.error('[GISController.getFeatures] Error:', err);
      res.status(500).json({ error: 'Internal server error generating map features' });
    }
  }
}
