import { useState } from 'react';
import { useOperational } from '../../context/OperationalContext';
import { ReportStatus, TaskStatus, IncidentStatus } from '@vrl/shared';
import { TopLedgerBar } from './TopLedgerBar';
import { VerificationModal } from './VerificationModal';
import { RejectionModal } from './RejectionModal';
import { ReservationModal } from './ReservationModal';
import { ConflictModal } from './ConflictModal';
import { OfferTaskModal } from './OfferTaskModal';
import { ReconciliationPanel } from './ReconciliationPanel';
import { AuditTimeline } from './AuditTimeline';
import { OperationalMap } from './OperationalMap';
import { OperationalListView } from './OperationalListView';
import {
  ShieldAlert,
  ShieldCheck,
  XCircle,
  MapPin,
  MessageSquare,
  Filter,
  FileCheck,
  Package,
  Truck,
  ScrollText,
  Clock,
  Map as MapIcon,
  FileText,
  Table
} from 'lucide-react';

export const CoordinatorScreen = () => {
  const {
    coordinatorReports,
    canonicalIncidents,
    verifyReport,
    rejectReport,
    reserveResources,
    confirmReconciliation,
    resourcePool,
    commitments,
    tasks,
    auditEvents,
    refetch,
    isLoading
  } = useOperational();

  const [selectedReportId, setSelectedReportId] = useState<number | null>(() => {
    return coordinatorReports.length > 0 ? coordinatorReports[0].id : null;
  });
  const [filter, setFilter] = useState<'ALL' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [centerMode, setCenterMode] = useState<'MAP' | 'DETAIL' | 'LIST'>('MAP');
  const [drawerTab, setDrawerTab] = useState<'CONTROLS' | 'AUDIT'>('CONTROLS');
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const [isOfferTaskOpen, setIsOfferTaskOpen] = useState(false);
  const [conflictState, setConflictState] = useState<{
    isOpen: boolean;
    requested: number;
    available: number;
  }>({
    isOpen: false,
    requested: 20,
    available: 0
  });

  // Filter reports
  const filteredReports = coordinatorReports.filter((r) => {
    if (filter === 'SUBMITTED') return r.status === ReportStatus.SUBMITTED;
    if (filter === 'VERIFIED') return r.status === ReportStatus.LINKED_TO_INCIDENT;
    if (filter === 'REJECTED') return r.status === ReportStatus.REJECTED;
    return true;
  });

  // Selected report (fall back to first if current selection is invalid)
  const activeReport =
    coordinatorReports.find((r) => r.id === selectedReportId) ||
    (filteredReports.length > 0 ? filteredReports[0] : null);

  // Check if active incident has an active commitment
  const activeCommitment = activeReport?.canonical_id
    ? commitments.find((c) => c.incident_id === activeReport.canonical_id)
    : null;

  // Check if active commitment has a task
  const activeTask = activeCommitment
    ? tasks.find((t) => t.commitment_id === activeCommitment.id)
    : null;

  // Active canonical incident
  const activeIncident = activeReport?.canonical_id
    ? canonicalIncidents.find((i) => i.id === activeReport.canonical_id)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 120px)' }}>
      {/* Workspace Sub-header */}
      <div style={{
        background: '#FFFFFF',
        padding: '12px 20px',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: '#1E40AF',
            color: '#FFFFFF',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex'
          }}>
            <ShieldAlert size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
              BMC Disaster Operations — Coordination Workspace
            </h2>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              Kurla West L-Ward Emergency Response Dispatch Desk
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
          {(
            [
              { id: 'ALL', label: `All (${coordinatorReports.length})` },
              { id: 'SUBMITTED', label: `Under Review (${coordinatorReports.filter((r) => r.status === ReportStatus.SUBMITTED).length})` },
              { id: 'VERIFIED', label: `Verified (${coordinatorReports.filter((r) => r.status === ReportStatus.LINKED_TO_INCIDENT).length})` },
              { id: 'REJECTED', label: `Rejected (${coordinatorReports.filter((r) => r.status === ReportStatus.REJECTED).length})` }
            ] as const
          ).map((t) => {
            const isActive = filter === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? '#0F172A' : '#64748B',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Inventory Ledger Bar (CMP-017) */}
      <TopLedgerBar />

      {/* 3-Pane Split View */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr 340px',
        gap: '16px',
        flex: 1,
        minHeight: 0
      }}>
        {/* Left Pane: Review Queue */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>
              INCOMING QUEUE ({filteredReports.length})
            </span>
            <Filter size={14} color="#94A3B8" />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {filteredReports.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                No reports matching filter
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredReports.map((report) => {
                  const isSelected = activeReport?.id === report.id;
                  const isSubmitted = report.status === ReportStatus.SUBMITTED;
                  const isVerified = report.status === ReportStatus.LINKED_TO_INCIDENT;

                  return (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReportId(report.id)}
                      style={{
                        padding: '12px',
                        borderRadius: '6px',
                        border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                        background: isSelected ? '#EFF6FF' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: '#1E40AF' }}>
                          {report.reference_code}
                        </span>

                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: isSubmitted
                            ? '#FEF3C7'
                            : isVerified
                            ? '#D1FAE5'
                            : '#FEE2E2',
                          color: isSubmitted
                            ? '#92400E'
                            : isVerified
                            ? '#065F46'
                            : '#991B1B'
                        }}>
                          {isSubmitted ? 'REVIEW' : isVerified ? 'VERIFIED' : 'REJECTED'}
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '4px' }}>
                        {report.location_name}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748B' }}>
                        <span>{report.incident_type.replace('_', ' ')}</span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {report.clarifications_count > 0 && (
                            <span style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              background: '#E0E7FF',
                              color: '#3730A3',
                              padding: '1px 4px',
                              borderRadius: '4px',
                              fontWeight: 600
                            }}>
                              <MessageSquare size={10} />
                              {report.clarifications_count}
                            </span>
                          )}
                          <span style={{
                            fontWeight: 700,
                            color: report.reporter_severity === 'CRITICAL' ? '#DC2626' : '#D97706'
                          }}>
                            {report.reporter_severity}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center Pane: Tactical GIS Map, Incident Inspection & Operational List */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Mode Switcher */}
          <div style={{
            padding: '8px 14px',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', gap: '4px', background: '#E2E8F0', padding: '2px', borderRadius: '6px' }}>
              <button
                type="button"
                onClick={() => setCenterMode('MAP')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '5px',
                  border: 'none',
                  background: centerMode === 'MAP' ? '#FFFFFF' : 'transparent',
                  color: centerMode === 'MAP' ? '#0F172A' : '#64748B',
                  fontWeight: centerMode === 'MAP' ? 700 : 500,
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: centerMode === 'MAP' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                <MapIcon size={13} />
                <span>GIS Tactical Map</span>
              </button>

              <button
                type="button"
                onClick={() => setCenterMode('DETAIL')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '5px',
                  border: 'none',
                  background: centerMode === 'DETAIL' ? '#FFFFFF' : 'transparent',
                  color: centerMode === 'DETAIL' ? '#0F172A' : '#64748B',
                  fontWeight: centerMode === 'DETAIL' ? 700 : 500,
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: centerMode === 'DETAIL' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                <FileText size={13} />
                <span>Incident Inspection</span>
              </button>

              <button
                type="button"
                onClick={() => setCenterMode('LIST')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '5px',
                  border: 'none',
                  background: centerMode === 'LIST' ? '#FFFFFF' : 'transparent',
                  color: centerMode === 'LIST' ? '#0F172A' : '#64748B',
                  fontWeight: centerMode === 'LIST' ? 700 : 500,
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: centerMode === 'LIST' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                <Table size={13} />
                <span>Operational List (FR-024)</span>
              </button>
            </div>

            <span style={{ fontSize: '11px', color: '#64748B' }}>
              {centerMode === 'MAP'
                ? 'Kurla West Basin [19.0657, 72.8793]'
                : centerMode === 'LIST'
                ? `${coordinatorReports.length} Records In Grid`
                : activeReport ? activeReport.reference_code : 'No selection'}
            </span>
          </div>

          {/* Center Pane Body */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {centerMode === 'MAP' ? (
              <OperationalMap
                reports={coordinatorReports}
                resourcePool={resourcePool}
                selectedReportId={selectedReportId}
                onSelectReport={(id) => setSelectedReportId(id)}
                canonicalIncidents={canonicalIncidents}
              />
            ) : centerMode === 'LIST' ? (
              <OperationalListView
                reports={coordinatorReports}
                selectedReportId={selectedReportId}
                onSelectReport={(id) => setSelectedReportId(id)}
                commitments={commitments}
                tasks={tasks}
              />
            ) : activeReport ? (
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Incident Header */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      background: '#F1F5F9',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      color: '#334155'
                    }}>
                      {activeReport.reference_code}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      background: activeReport.status === ReportStatus.SUBMITTED
                        ? '#FFFBEB'
                        : activeReport.status === ReportStatus.LINKED_TO_INCIDENT
                        ? '#ECFDF5'
                        : '#FEF2F2',
                      color: activeReport.status === ReportStatus.SUBMITTED
                        ? '#B45309'
                        : activeReport.status === ReportStatus.LINKED_TO_INCIDENT
                        ? '#047857'
                        : '#B91C1C',
                      border: '1px solid currentColor'
                    }}>
                      {activeReport.status}
                    </span>
                  </div>

                  <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '4px 0 8px 0' }}>
                    {activeReport.location_name}
                  </h1>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#64748B' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} />
                      {activeReport.latitude.toFixed(4)}, {activeReport.longitude.toFixed(4)}
                    </span>
                    <span>•</span>
                    <span>
                      Submitted by: <strong>{activeReport.reporter_display_name || activeReport.reporter_id}</strong>
                      {activeReport.reporter_phone && <span style={{ color: '#94A3B8' }}> ({activeReport.reporter_phone})</span>}
                    </span>
                    <span>•</span>
                    <span>{new Date(activeReport.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Status Specific Banner */}
                {activeReport.status === ReportStatus.LINKED_TO_INCIDENT && (
                  <div style={{
                    background: '#ECFDF5',
                    border: '1px solid #10B981',
                    borderRadius: '8px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <ShieldCheck size={24} color="#059669" />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#065F46' }}>
                        Verified Canonical Incident #{activeReport.canonical_id}
                      </div>
                      <div style={{ fontSize: '12px', color: '#047857', marginTop: '2px' }}>
                        Operational priority confirmed. Physical relief inventory committed to scene.
                      </div>
                    </div>
                  </div>
                )}

                {activeReport.status === ReportStatus.SUBMITTED && (
                  <div style={{
                    background: '#FFFBEB',
                    border: '1px solid #F59E0B',
                    borderRadius: '8px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <Clock size={24} color="#D97706" />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400E' }}>
                        Submitted Report Awaiting Human Verification
                      </div>
                      <div style={{ fontSize: '12px', color: '#B45309', marginTop: '2px' }}>
                        Uncommitted community report. Review details and use the Verification Gateway to resource.
                      </div>
                    </div>
                  </div>
                )}

                {activeReport.status === ReportStatus.REJECTED && (
                  <div style={{
                    background: '#FEF2F2',
                    border: '1px solid #EF4444',
                    borderRadius: '8px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <XCircle size={24} color="#DC2626" />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#991B1B' }}>
                        Report Rejected by Coordinator
                      </div>
                      <div style={{ fontSize: '12px', color: '#B91C1C', marginTop: '2px' }}>
                        Reason: {activeReport.rejection_reason || 'Out of operational scope'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Description Card */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Reporter Situation Narrative
                  </div>
                  <div style={{ fontSize: '14px', color: '#1E293B', lineHeight: '1.5' }}>
                    {activeReport.description}
                  </div>
                </div>

                {/* Clarification Notes Stream */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <MessageSquare size={16} color="#3B82F6" />
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Clarification Feed ({activeReport.clarifications_count})
                    </h3>
                  </div>

                  {activeReport.clarifications.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic', padding: '12px 0' }}>
                      No follow-up clarifications posted yet by reporter or field responders.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activeReport.clarifications.map((c) => (
                        <div
                          key={c.id}
                          style={{
                            background: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            padding: '10px 12px',
                            fontSize: '13px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, color: '#1E40AF', fontSize: '11px' }}>
                              {c.author_id}
                            </span>
                            <span style={{ color: '#64748B', fontSize: '11px' }}>
                              {new Date(c.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <div style={{ color: '#1E293B' }}>{c.message}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                Select a report from the queue
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Decision Gateway & Audit Ledger */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto'
        }}>
          {/* Drawer Tab Switcher */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '12px',
            gap: '8px'
          }}>
            <button
              type="button"
              onClick={() => setDrawerTab('CONTROLS')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: drawerTab === 'CONTROLS' ? '#1E40AF' : '#F1F5F9',
                color: drawerTab === 'CONTROLS' ? '#FFFFFF' : '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <FileCheck size={15} />
              <span>Operational Controls</span>
            </button>

            <button
              type="button"
              onClick={() => setDrawerTab('AUDIT')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: drawerTab === 'AUDIT' ? '#0F172A' : '#F1F5F9',
                color: drawerTab === 'AUDIT' ? '#FFFFFF' : '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <ScrollText size={15} />
              <span>Audit Ledger ({auditEvents.length})</span>
            </button>
          </div>

          {drawerTab === 'AUDIT' ? (
            <AuditTimeline auditEvents={auditEvents} />
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
                <FileCheck size={18} color="#1E40AF" />
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                  Verification Gateway (LOGIC-001)
                </h3>
              </div>

              {activeReport?.status === ReportStatus.SUBMITTED && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#92400E',
                    lineHeight: '1.4'
                  }}>
                    <strong>Core System Differentiator:</strong> Community reports are never automatically resourced. A human coordinator must verify accuracy and assign operational priority.
                  </div>

                  <button
                    onClick={() => setIsVerifyOpen(true)}
                    disabled={isLoading}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: '#059669',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '14px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
                    }}
                  >
                    <ShieldCheck size={18} />
                    <span>Verify Report & Promote</span>
                  </button>

                  <button
                    onClick={() => setIsRejectOpen(true)}
                    disabled={isLoading}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      background: '#FFFFFF',
                      color: '#DC2626',
                      fontWeight: 600,
                      fontSize: '13px',
                      border: '1px solid #FCA5A5',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <XCircle size={16} />
                    <span>Reject with Mandatory Reason</span>
                  </button>
                </div>
              )}

              {activeReport?.status === ReportStatus.LINKED_TO_INCIDENT && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {activeIncident?.status === IncidentStatus.PARTIALLY_RESOLVED ? (
                    <div style={{
                      background: '#ECFDF5',
                      border: '1px solid #10B981',
                      padding: '12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#065F46',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <ShieldCheck size={18} color="#059669" />
                      <div>
                        <strong>Incident Partially Resolved:</strong> Execution reconciled.{' '}
                        {activeTask
                          ? `${activeTask.delivered_quantity} kits delivered, ${activeTask.remainder_quantity} remainder kits restocked.`
                          : 'Delivered and remainder quantities restocked.'}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      padding: '12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#065F46'
                    }}>
                      ✓ <strong>Incident Verified:</strong> Promoted to canonical status.
                    </div>
                  )}

                  {/* Check if already has active commitment */}
                  {activeCommitment ? (
                    <div style={{
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      padding: '16px',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>
                          Active Resource Commitment
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          background: '#DBEAFE',
                          color: '#1D4ED8',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          RESERVED
                        </span>
                      </div>

                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#1E3A8A' }}>
                          📦 {activeCommitment?.quantity || 20} Relief Kits
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          Staged at: <strong>BKC Relief Base (Depot 1)</strong>
                        </div>
                      </div>

                      <div style={{
                        borderTop: '1px solid #DBEAFE',
                        paddingTop: '10px',
                        fontSize: '11px',
                        color: '#475569'
                      }}>
                        Committed by: <strong>{activeCommitment?.committed_by || 'Coordinator on duty'}</strong>
                      </div>

                      {/* Task Assignment Card or Offer Action */}
                      {activeTask && activeTask.status !== TaskStatus.DECLINED ? (
                        <div style={{
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          padding: '12px',
                          marginTop: '4px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                              Mission Deployment #{activeTask.id}
                            </span>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: activeTask.status === TaskStatus.OFFERED
                                ? '#FEF3C7'
                                : activeTask.status === TaskStatus.ACCEPTED
                                ? '#DBEAFE'
                                : activeTask.status === TaskStatus.IN_PROGRESS
                                ? '#F3E8FF'
                                : activeTask.status === TaskStatus.PARTIALLY_COMPLETED
                                ? '#FFFBEB'
                                : '#F1F5F9',
                              color: activeTask.status === TaskStatus.OFFERED
                                ? '#92400E'
                                : activeTask.status === TaskStatus.ACCEPTED
                                ? '#1E40AF'
                                : activeTask.status === TaskStatus.IN_PROGRESS
                                ? '#6B21A8'
                                : activeTask.status === TaskStatus.PARTIALLY_COMPLETED
                                ? '#B45309'
                                : '#475569'
                            }}>
                              {activeTask.status === TaskStatus.OFFERED
                                ? 'OFFERED / PENDING VOLUNTEER'
                                : activeTask.status === TaskStatus.ACCEPTED
                                ? 'ACCEPTED / STAGED AT DEPOT'
                                : activeTask.status === TaskStatus.IN_PROGRESS
                                ? 'IN TRANSIT / EN ROUTE'
                                : activeTask.status === TaskStatus.PARTIALLY_COMPLETED
                                ? `PARTIAL OUTCOME LOGGED (${activeTask.delivered_quantity}/${activeTask.assigned_quantity})`
                                : activeTask.status}
                            </span>
                          </div>

                          <div style={{ fontSize: '12px', color: '#1E293B' }}>
                            Assigned to: <strong>{activeTask.assigned_to_name || 'Assigned Volunteer'}</strong>
                          </div>

                          <div style={{
                            fontSize: '11px',
                            color: '#64748B',
                            background: '#F8FAFC',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            lineHeight: '1.3'
                          }}>
                            "{activeTask.instructions}"
                          </div>

                          {/* Two-Phase Handover Invariant Callout */}
                          <div style={{
                            fontSize: '11px',
                            background: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            color: '#1E40AF',
                            lineHeight: '1.3'
                          }}>
                            🔒 <strong>Two-Phase Handover Guard Active:</strong> Sent ≠ Accepted. Only {activeTask.assigned_to_name || 'the assigned volunteer'} can accept mission ownership and mark depot departure. Coordinator dispatch is locked by design.
                          </div>

                          {/* Execution Outcome & Quantity Reconciliation (CMP-025) */}
                          {(activeTask.status === TaskStatus.PARTIALLY_COMPLETED ||
                            activeIncident?.status === IncidentStatus.PARTIALLY_RESOLVED ||
                            activeIncident?.status === IncidentStatus.RESOLVED) && (
                            <div style={{ marginTop: '6px' }}>
                              <ReconciliationPanel
                                incident={activeIncident || ({ id: activeReport.canonical_id!, status: IncidentStatus.RESPONSE_ACTIVE } as any)}
                                task={activeTask}
                                onReconcile={async (notes) => {
                                  if (activeReport.canonical_id) {
                                    await confirmReconciliation(activeReport.canonical_id, notes);
                                  }
                                }}
                                isLoading={isLoading}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ marginTop: '4px' }}>
                          <button
                            onClick={() => setIsOfferTaskOpen(true)}
                            disabled={isLoading}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '6px',
                              background: '#2563EB',
                              color: '#FFFFFF',
                              border: 'none',
                              fontSize: '13px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                            }}
                          >
                            <Truck size={16} />
                            <span>Deploy Mission / Offer Task to Volunteer (CMP-020)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Un-resourced Verified Incident */
                    <div style={{
                      border: '1px solid #E2E8F0',
                      padding: '16px',
                      borderRadius: '8px',
                      background: '#F8FAFC',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                          Resource Commitment (LOGIC-002)
                        </span>
                        <p style={{ fontSize: '13px', color: '#334155', margin: '6px 0 0 0', lineHeight: '1.4' }}>
                          Incident is verified. Allocate physical relief kits from BKC Depot stock before dispatching field responders.
                        </p>
                      </div>

                      <button
                        onClick={() => setIsReserveOpen(true)}
                        disabled={Boolean(isLoading || (resourcePool && resourcePool.available_quantity <= 0))}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          background: resourcePool && resourcePool.available_quantity <= 0 ? '#94A3B8' : '#2563EB',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: resourcePool && resourcePool.available_quantity <= 0 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                        }}
                      >
                        <Package size={18} />
                        <span>
                          {resourcePool && resourcePool.available_quantity <= 0
                            ? 'Depot Stock Depleted (0 Available)'
                            : `Reserve Relief Kits (${resourcePool ? resourcePool.available_quantity : 20} Avail)`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeReport?.status === ReportStatus.REJECTED && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#991B1B'
                }}>
                  <strong>Status Closed:</strong> Report was rejected. Reason logged in immutable audit trail.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {activeReport && (
        <>
          <VerificationModal
            report={activeReport}
            isOpen={isVerifyOpen}
            onClose={() => setIsVerifyOpen(false)}
            onConfirm={async (id, dto) => {
              await verifyReport(id, dto);
            }}
            isLoading={isLoading}
          />
          <RejectionModal
            report={activeReport}
            isOpen={isRejectOpen}
            onClose={() => setIsRejectOpen(false)}
            onConfirm={async (id, dto) => {
              await rejectReport(id, dto);
            }}
            isLoading={isLoading}
          />
          {activeReport.canonical_id && (
            <ReservationModal
              incidentId={activeReport.canonical_id}
              locationName={activeReport.location_name}
              availableStock={resourcePool ? resourcePool.available_quantity : 20}
              isOpen={isReserveOpen}
              onClose={() => setIsReserveOpen(false)}
              onConfirm={async (qty) => {
                await reserveResources(activeReport.canonical_id!, qty);
              }}
              onConflict={(requested, available) => {
                setConflictState({
                  isOpen: true,
                  requested,
                  available
                });
              }}
              isLoading={isLoading}
            />
          )}
          <ConflictModal
            isOpen={conflictState.isOpen}
            onClose={() => setConflictState((prev) => ({ ...prev, isOpen: false }))}
            onRefresh={async () => {
              await refetch();
            }}
            requestedQuantity={conflictState.requested}
            availableQuantity={conflictState.available}
          />
          {activeReport.canonical_id && activeCommitment && (
            <OfferTaskModal
              isOpen={isOfferTaskOpen}
              onClose={() => setIsOfferTaskOpen(false)}
              incidentId={activeReport.canonical_id}
              commitmentId={activeCommitment.id}
              locationName={activeReport.location_name}
              quantity={activeCommitment.quantity}
            />
          )}
        </>
      )}
    </div>
  );
};
