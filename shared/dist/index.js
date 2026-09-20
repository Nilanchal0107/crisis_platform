// Core Domain Enums
export var UserRole;
(function (UserRole) {
    UserRole["REPORTER"] = "REPORTER";
    UserRole["COORDINATOR"] = "COORDINATOR";
    UserRole["RESPONDER"] = "RESPONDER";
})(UserRole || (UserRole = {}));
export var IncidentType;
(function (IncidentType) {
    IncidentType["FLOOD"] = "FLOOD";
    IncidentType["STRUCTURAL_DAMAGE"] = "STRUCTURAL_DAMAGE";
    IncidentType["MEDICAL_EMERGENCY"] = "MEDICAL_EMERGENCY";
    IncidentType["ROAD_BLOCKAGE"] = "ROAD_BLOCKAGE";
    IncidentType["SUPPLY_SHORTAGE"] = "SUPPLY_SHORTAGE";
})(IncidentType || (IncidentType = {}));
export var ReporterSeverity;
(function (ReporterSeverity) {
    ReporterSeverity["LOW"] = "LOW";
    ReporterSeverity["MEDIUM"] = "MEDIUM";
    ReporterSeverity["HIGH"] = "HIGH";
    ReporterSeverity["CRITICAL"] = "CRITICAL";
})(ReporterSeverity || (ReporterSeverity = {}));
export var ReportStatus;
(function (ReportStatus) {
    ReportStatus["SUBMITTED"] = "SUBMITTED";
    ReportStatus["LINKED_TO_INCIDENT"] = "LINKED_TO_INCIDENT";
    ReportStatus["REJECTED"] = "REJECTED";
})(ReportStatus || (ReportStatus = {}));
export var IncidentPriority;
(function (IncidentPriority) {
    IncidentPriority["LOW"] = "LOW";
    IncidentPriority["MEDIUM"] = "MEDIUM";
    IncidentPriority["HIGH"] = "HIGH";
    IncidentPriority["URGENT"] = "URGENT";
})(IncidentPriority || (IncidentPriority = {}));
export var IncidentStatus;
(function (IncidentStatus) {
    IncidentStatus["VERIFIED"] = "VERIFIED";
    IncidentStatus["RESPONSE_ACTIVE"] = "RESPONSE_ACTIVE";
    IncidentStatus["PARTIALLY_RESOLVED"] = "PARTIALLY_RESOLVED";
    IncidentStatus["RESOLVED"] = "RESOLVED";
    IncidentStatus["CANCELLED"] = "CANCELLED";
})(IncidentStatus || (IncidentStatus = {}));
export var CommitmentStatus;
(function (CommitmentStatus) {
    CommitmentStatus["RESERVED"] = "RESERVED";
    CommitmentStatus["IN_TRANSIT"] = "IN_TRANSIT";
    CommitmentStatus["DELIVERED"] = "DELIVERED";
    CommitmentStatus["EXCEPTION_RETURNED"] = "EXCEPTION_RETURNED";
    CommitmentStatus["RELEASED"] = "RELEASED";
})(CommitmentStatus || (CommitmentStatus = {}));
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["OFFERED"] = "OFFERED";
    TaskStatus["ACCEPTED"] = "ACCEPTED";
    TaskStatus["DECLINED"] = "DECLINED";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["PARTIALLY_COMPLETED"] = "PARTIALLY_COMPLETED";
    TaskStatus["COMPLETED"] = "COMPLETED";
    TaskStatus["FAILED"] = "FAILED";
    TaskStatus["CANCELLED"] = "CANCELLED";
})(TaskStatus || (TaskStatus = {}));
export var CoordinationUpdateType;
(function (CoordinationUpdateType) {
    CoordinationUpdateType["CLARIFICATION"] = "CLARIFICATION";
    CoordinationUpdateType["INSTRUCTION"] = "INSTRUCTION";
    CoordinationUpdateType["PROGRESS"] = "PROGRESS";
    CoordinationUpdateType["EXCEPTION"] = "EXCEPTION";
    CoordinationUpdateType["OUTCOME_NOTE"] = "OUTCOME_NOTE";
})(CoordinationUpdateType || (CoordinationUpdateType = {}));
export var AuditAction;
(function (AuditAction) {
    AuditAction["REPORT_SUBMITTED"] = "REPORT_SUBMITTED";
    AuditAction["REPORT_VERIFIED"] = "REPORT_VERIFIED";
    AuditAction["REPORT_REJECTED"] = "REPORT_REJECTED";
    AuditAction["REPORT_CLARIFIED"] = "REPORT_CLARIFIED";
    AuditAction["RESOURCE_RESERVED"] = "RESOURCE_RESERVED";
    AuditAction["TASK_OFFERED"] = "TASK_OFFERED";
    AuditAction["TASK_ACCEPTED"] = "TASK_ACCEPTED";
    AuditAction["TASK_DECLINED"] = "TASK_DECLINED";
    AuditAction["TASK_DISPATCHED"] = "TASK_DISPATCHED";
    AuditAction["OUTCOME_SUBMITTED"] = "OUTCOME_SUBMITTED";
    AuditAction["OUTCOME_RECONCILED"] = "OUTCOME_RECONCILED";
    AuditAction["DEMO_RESET"] = "DEMO_RESET";
})(AuditAction || (AuditAction = {}));
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
};
