export declare enum UserRole {
    REPORTER = "REPORTER",
    COORDINATOR = "COORDINATOR",
    RESPONDER = "RESPONDER"
}
export declare enum IncidentType {
    FLOOD = "FLOOD",
    STRUCTURAL_DAMAGE = "STRUCTURAL_DAMAGE",
    MEDICAL_EMERGENCY = "MEDICAL_EMERGENCY",
    ROAD_BLOCKAGE = "ROAD_BLOCKAGE",
    SUPPLY_SHORTAGE = "SUPPLY_SHORTAGE"
}
export declare enum ReporterSeverity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare enum ReportStatus {
    SUBMITTED = "SUBMITTED",
    LINKED_TO_INCIDENT = "LINKED_TO_INCIDENT",
    REJECTED = "REJECTED"
}
export declare enum IncidentPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare enum IncidentStatus {
    VERIFIED = "VERIFIED",
    RESPONSE_ACTIVE = "RESPONSE_ACTIVE",
    PARTIALLY_RESOLVED = "PARTIALLY_RESOLVED",
    RESOLVED = "RESOLVED",
    CANCELLED = "CANCELLED"
}
export declare enum CommitmentStatus {
    RESERVED = "RESERVED",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
    EXCEPTION_RETURNED = "EXCEPTION_RETURNED",
    RELEASED = "RELEASED"
}
export declare enum TaskStatus {
    OFFERED = "OFFERED",
    ACCEPTED = "ACCEPTED",
    DECLINED = "DECLINED",
    IN_PROGRESS = "IN_PROGRESS",
    PARTIALLY_COMPLETED = "PARTIALLY_COMPLETED",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
export declare enum CoordinationUpdateType {
    CLARIFICATION = "CLARIFICATION",
    INSTRUCTION = "INSTRUCTION",
    PROGRESS = "PROGRESS",
    EXCEPTION = "EXCEPTION",
    OUTCOME_NOTE = "OUTCOME_NOTE"
}
export declare enum AuditAction {
    REPORT_SUBMITTED = "REPORT_SUBMITTED",
    REPORT_VERIFIED = "REPORT_VERIFIED",
    REPORT_REJECTED = "REPORT_REJECTED",
    REPORT_CLARIFIED = "REPORT_CLARIFIED",
    RESOURCE_RESERVED = "RESOURCE_RESERVED",
    TASK_OFFERED = "TASK_OFFERED",
    TASK_ACCEPTED = "TASK_ACCEPTED",
    TASK_DECLINED = "TASK_DECLINED",
    TASK_DISPATCHED = "TASK_DISPATCHED",
    OUTCOME_SUBMITTED = "OUTCOME_SUBMITTED",
    OUTCOME_RECONCILED = "OUTCOME_RECONCILED",
    DEMO_RESET = "DEMO_RESET"
}
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
export interface ConservationCheck {
    total: number;
    available: number;
    reserved: number;
    in_transit: number;
    delivered: number;
    is_conserved: boolean;
    delta: number;
}
export declare const MUMBAI_SCENARIO: {
    readonly ward: "L Ward (Kurla West)";
    readonly city: "Mumbai, Maharashtra";
    readonly centerCoordinates: {
        readonly lat: 19.0657;
        readonly lng: 72.8793;
    };
    readonly defaultZoom: 14;
    readonly depot: {
        readonly id: 1;
        readonly name: "BKC Relief Base (Depot 1)";
        readonly resource_name: "Monsoon Flood Relief Kits (20 Pack)";
        readonly unit: "KITS";
        readonly lat: 19.06;
        readonly lng: 72.868;
        readonly initialQuantity: 20;
    };
    readonly personas: {
        readonly aarav: {
            readonly id: "aarav";
            readonly display_name: "Aarav (Community Reporter)";
            readonly role: UserRole.REPORTER;
            readonly contact_safe: "Aarav Demo Contact (9820011223)";
            readonly location: "Kranti Nagar, Kurla West";
        };
        readonly rajesh: {
            readonly id: "rajesh";
            readonly display_name: "Rajesh (BMC Disaster Coordinator)";
            readonly role: UserRole.COORDINATOR;
            readonly contact_safe: "BMC Disaster Control Room (022-22694725)";
            readonly location: "BMC Disaster Management HQ";
        };
        readonly chetan: {
            readonly id: "chetan";
            readonly display_name: "Chetan (Mumbai QRT Volunteer)";
            readonly role: UserRole.RESPONDER;
            readonly contact_safe: "Chetan Field Mobile (9833445566)";
            readonly location: "Kurla Quick Response Post";
        };
    };
};
