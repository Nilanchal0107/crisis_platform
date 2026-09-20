// Core Domain Enums
export enum UserRole {
  REPORTER = 'REPORTER',
  COORDINATOR = 'COORDINATOR',
  RESPONDER = 'RESPONDER'
}

export enum IncidentType {
  FLOOD = 'FLOOD',
  STRUCTURAL_DAMAGE = 'STRUCTURAL_DAMAGE',
  MEDICAL_EMERGENCY = 'MEDICAL_EMERGENCY',
  ROAD_BLOCKAGE = 'ROAD_BLOCKAGE',
  SUPPLY_SHORTAGE = 'SUPPLY_SHORTAGE'
}

export enum ReporterSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ReportStatus {
  SUBMITTED = 'SUBMITTED',
  LINKED_TO_INCIDENT = 'LINKED_TO_INCIDENT',
  REJECTED = 'REJECTED'
}

export enum IncidentPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum IncidentStatus {
  VERIFIED = 'VERIFIED',
  RESPONSE_ACTIVE = 'RESPONSE_ACTIVE',
  PARTIALLY_RESOLVED = 'PARTIALLY_RESOLVED',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED'
}

export enum CommitmentStatus {
  RESERVED = 'RESERVED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  EXCEPTION_RETURNED = 'EXCEPTION_RETURNED',
  RELEASED = 'RELEASED'
}

export enum TaskStatus {
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  IN_PROGRESS = 'IN_PROGRESS',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum CoordinationUpdateType {
  CLARIFICATION = 'CLARIFICATION',
  INSTRUCTION = 'INSTRUCTION',
  PROGRESS = 'PROGRESS',
  EXCEPTION = 'EXCEPTION',
  OUTCOME_NOTE = 'OUTCOME_NOTE'
}

export enum AuditAction {
  REPORT_SUBMITTED = 'REPORT_SUBMITTED',
  REPORT_VERIFIED = 'REPORT_VERIFIED',
  REPORT_REJECTED = 'REPORT_REJECTED',
  REPORT_CLARIFIED = 'REPORT_CLARIFIED',
  RESOURCE_RESERVED = 'RESOURCE_RESERVED',
  TASK_OFFERED = 'TASK_OFFERED',
  TASK_ACCEPTED = 'TASK_ACCEPTED',
  TASK_DECLINED = 'TASK_DECLINED',
  TASK_DISPATCHED = 'TASK_DISPATCHED',
  OUTCOME_SUBMITTED = 'OUTCOME_SUBMITTED',
  OUTCOME_RECONCILED = 'OUTCOME_RECONCILED',
  DEMO_RESET = 'DEMO_RESET'
}

// Domain Interfaces
export interface User {
  id: string;
  display_name: string;
  role: UserRole;
  contact_safe: string;
  is_active: number;
  created_at: string;
}

export interface SourceReport {
  id: number;
  reference_code: string;
  reporter_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  incident_type: IncidentType;
  reporter_severity: ReporterSeverity;
  description: string;
  status: ReportStatus;
  rejection_reason?: string | null;
  created_at: string;
}

export interface CanonicalIncident {
  id: number;
  primary_report_id: number;
  verified_by: string;
  location_name: string;
  latitude: number;
  longitude: number;
  incident_type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  verified_at: string;
  resolved_at?: string | null;
  closure_notes?: string | null;
}

export interface ResourcePool {
  id: number;
  resource_name: string;
  depot_name: string;
  unit: string;
  latitude: number;
  longitude: number;
  total_quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  in_transit_quantity: number;
  delivered_quantity: number;
  provenance: string;
  last_confirmed_at: string;
}

export interface ResourceCommitment {
  id: number;
  pool_id: number;
  incident_id: number;
  task_id?: number | null;
  quantity: number;
  status: CommitmentStatus;
  committed_by: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  incident_id: number;
  commitment_id: number;
  assigned_to: string;
  assigned_by: string;
  instructions: string;
  assigned_quantity: number;
  delivered_quantity: number;
  remainder_quantity: number;
  status: TaskStatus;
  exception_reason?: string | null;
  offered_at: string;
  accepted_at?: string | null;
  dispatched_at?: string | null;
  completed_at?: string | null;
}

export interface CoordinationUpdate {
  id: number;
  report_id?: number | null;
  incident_id?: number | null;
  task_id?: number | null;
  author_id: string;
  update_type: CoordinationUpdateType;
  message: string;
  created_at: string;
}

export interface AuditEvent {
  id: number;
  timestamp: string;
  actor_id: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_state?: string | null;
  after_state?: string | null;
  quantity_delta: number;
  reason?: string | null;
}

// Invariant & Health Check Interface
export interface ConservationCheck {
  total: number;
  available: number;
  reserved: number;
  in_transit: number;
  delivered: number;
  is_conserved: boolean;
  delta: number;
}

// Mumbai Scenario Constants
export const MUMBAI_SCENARIO = {
  ward: 'L Ward (Kurla West)',
  city: 'Mumbai, Maharashtra',
  centerCoordinates: {
    lat: 19.0657,
    lng: 72.8793
  },
  defaultZoom: 14,
  depot: {
    id: 1,
    name: 'BKC Relief Base (Depot 1)',
    resource_name: 'Monsoon Flood Relief Kits (20 Pack)',
    unit: 'KITS',
    lat: 19.0600,
    lng: 72.8680,
    initialQuantity: 20
  },
  personas: {
    aarav: {
      id: 'aarav',
      display_name: 'Aarav (Community Reporter)',
      role: UserRole.REPORTER,
      contact_safe: 'Aarav Demo Contact (9820011223)',
      location: 'Kranti Nagar, Kurla West'
    },
    rajesh: {
      id: 'rajesh',
      display_name: 'Rajesh (BMC Disaster Coordinator)',
      role: UserRole.COORDINATOR,
      contact_safe: 'BMC Disaster Control Room (022-22694725)',
      location: 'BMC Disaster Management HQ'
    },
    chetan: {
      id: 'chetan',
      display_name: 'Chetan (Mumbai QRT Volunteer)',
      role: UserRole.RESPONDER,
      contact_safe: 'Chetan Field Mobile (9833445566)',
      location: 'Kurla Quick Response Post'
    }
  }
} as const;
