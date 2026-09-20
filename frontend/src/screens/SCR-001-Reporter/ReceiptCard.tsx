import { useState } from 'react';
import { PublicReportView, ReportStatus, ReporterTaskView } from '@vrl/shared';
import {
  Copy,
  Check,
  Clock,
  CheckCircle,
  XCircle,
  PlusCircle,
  MessageSquare,
  RotateCcw,
  Truck
} from 'lucide-react';

// Qualitative stage only — no assigned/dispatched/delivered/remainder quantities are
// surfaced to the reporter, matching the internal task-vs-public-view boundary
// getReportByRef already enforces server-side.
function taskStage(task: ReporterTaskView): { label: string; detail: string; color: string; bg: string; border: string } {
  switch (task.status) {
    case 'OFFERED':
      return {
        label: 'Responder Offered',
        detail: `Awaiting response from ${task.assigned_to_name}.`,
        color: '#92400E', bg: '#FFFBEB', border: '#FDE68A'
      };
    case 'ACCEPTED':
      return {
        label: 'Responder Assigned',
        detail: `${task.assigned_to_name} has accepted and is preparing to dispatch.`,
        color: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE'
      };
    case 'DECLINED':
      return {
        label: 'Responder Declined',
        detail: `${task.assigned_to_name} declined this assignment. The coordinator will reassign.`,
        color: '#991B1B', bg: '#FEF2F2', border: '#FECACA'
      };
    case 'IN_PROGRESS':
      return {
        label: 'Responder En Route',
        detail: `${task.assigned_to_name} has dispatched and is en route to the scene.`,
        color: '#5B21B6', bg: '#F5F3FF', border: '#DDD6FE'
      };
    case 'COMPLETED':
      return {
        label: 'Delivered',
        detail: `${task.assigned_to_name} completed delivery in full.`,
        color: '#166534', bg: '#F0FDF4', border: '#BBF7D0'
      };
    case 'PARTIALLY_COMPLETED':
      return {
        label: 'Partially Delivered',
        detail: `${task.assigned_to_name} completed a partial delivery; the remainder was returned to depot stock.`,
        color: '#166534', bg: '#F0FDF4', border: '#BBF7D0'
      };
    case 'FAILED':
      return {
        label: 'Delivery Failed',
        detail: `${task.assigned_to_name} was unable to complete this delivery.`,
        color: '#991B1B', bg: '#FEF2F2', border: '#FECACA'
      };
    case 'CANCELLED':
      return {
        label: 'Assignment Cancelled',
        detail: `This assignment to ${task.assigned_to_name} was cancelled.`,
        color: '#475569', bg: '#F1F5F9', border: '#CBD5E1'
      };
    default:
      return { label: task.status, detail: '', color: '#475569', bg: '#F1F5F9', border: '#CBD5E1' };
  }
}

interface ReceiptCardProps {
  report: PublicReportView;
  onAddClarification: (ref: string, message: string) => Promise<void>;
  onResetToNewReport: () => void;
  isLoading: boolean;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({
  report,
  onAddClarification,
  onResetToNewReport,
  isLoading
}) => {
  const [copied, setCopied] = useState(false);
  const [clarificationText, setClarificationText] = useState('');
  const [clarificationError, setClarificationError] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(report.reference_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClarifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarificationText.trim() || clarificationText.length < 3) {
      setClarificationError('Clarification note must be at least 3 characters');
      return;
    }
    setClarificationError(null);
    try {
      await onAddClarification(report.reference_code, clarificationText.trim());
      setClarificationText('');
    } catch (err: any) {
      setClarificationError(err.message || 'Failed to submit clarification');
    }
  };

  const isVerified = report.status === ReportStatus.LINKED_TO_INCIDENT;
  const isRejected = report.status === ReportStatus.REJECTED;
  const isPending = report.status === ReportStatus.SUBMITTED;
  const isPartiallyResolved = report.canonical_incident?.status === 'PARTIALLY_RESOLVED';
  const isFullyResolved = report.canonical_incident?.status === 'RESOLVED';
  const isResolved = isPartiallyResolved || isFullyResolved;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Reference Code Card */}
      <div style={{
        background: '#0F172A',
        color: '#FFFFFF',
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid #1E293B',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.05em' }}>
            PUBLIC RECEIPT IDENTIFIER
          </span>
          <button
            onClick={onResetToNewReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              border: '1px solid #334155',
              color: '#94A3B8',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={12} />
            <span>New Report</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            fontSize: '28px',
            fontFamily: 'monospace',
            fontWeight: 700,
            color: '#60A5FA',
            letterSpacing: '0.05em'
          }}>
            {report.reference_code}
          </div>

          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: copied ? '#059669' : '#1E293B',
              border: '1px solid #334155',
              color: '#FFFFFF',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '10px', lineHeight: '1.4' }}>
          Save this reference code to check real-time updates or add follow-up situation reports without registering.
        </p>
      </div>

      {/* Operational Status Banner */}
      <div style={{
        padding: '16px',
        borderRadius: '8px',
        border: isResolved
          ? '1px solid #059669'
          : isVerified
          ? '1px solid #10B981'
          : isRejected
          ? '1px solid #EF4444'
          : '1px solid #F59E0B',
        background: isResolved
          ? '#F0FDF4'
          : isVerified
          ? '#ECFDF5'
          : isRejected
          ? '#FEF2F2'
          : '#FFFBEB'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          {isResolved && <CheckCircle size={20} color="#059669" />}
          {!isResolved && isVerified && <CheckCircle size={20} color="#059669" />}
          {isRejected && <XCircle size={20} color="#DC2626" />}
          {isPending && <Clock size={20} color="#D97706" />}

          <span style={{
            fontWeight: 700,
            fontSize: '14px',
            color: isResolved
              ? '#166534'
              : isVerified
              ? '#065F46'
              : isRejected
              ? '#991B1B'
              : '#92400E'
          }}>
            {isFullyResolved && 'STATUS: INCIDENT RESOLVED & RECONCILED'}
            {isPartiallyResolved && 'STATUS: INCIDENT PARTIALLY RESOLVED & RECONCILED'}
            {!isResolved && isVerified && 'STATUS: VERIFIED & PROMOTED TO CANONICAL INCIDENT'}
            {isRejected && 'STATUS: REPORT REJECTED BY COORDINATOR'}
            {isPending && 'STATUS: SUBMITTED / UNDER REVIEW BY BMC'}
          </span>
        </div>

        {isResolved && (
          <div style={{ fontSize: '13px', color: '#166534', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>
              {isFullyResolved
                ? 'Operations concluded. All assigned relief kits were delivered to scene beneficiaries.'
                : 'Operations concluded with partial delivery. Remainder kits were returned and checked back into depot stock. See coordinator closure notes below for delivered/remainder counts.'}
            </div>
            {report.canonical_incident?.closure_notes && (
              <div style={{ marginTop: '4px', background: '#DCFCE7', padding: '8px 10px', borderRadius: '4px', color: '#14532D', fontStyle: 'italic', border: '1px solid #BBF7D0' }}>
                Coordinator Closure Notes: "{report.canonical_incident.closure_notes}"
              </div>
            )}
          </div>
        )}

        {!isResolved && isVerified && (
          <div style={{ fontSize: '13px', color: '#047857' }}>
            Promoted to <strong>Canonical Incident #{report.canonical_incident?.id}</strong> with priority{' '}
            <strong style={{ textTransform: 'uppercase' }}>{report.canonical_incident?.priority}</strong>.
            Disaster management response operations initiated.
          </div>
        )}

        {isPending && (
          <div style={{ fontSize: '13px', color: '#B45309' }}>
            Your report is awaiting review by BMC Disaster Management Cell. Resources are not committed until verified.
          </div>
        )}

        {isRejected && (
          <div style={{ fontSize: '13px', color: '#B91C1C' }}>
            <strong>Rejection Reason:</strong> {report.rejection_reason || 'Out of operational scope.'}
          </div>
        )}
      </div>

      {/* Response Progress — task-level assignment/dispatch/delivery status */}
      {report.canonical_incident && report.canonical_incident.tasks.length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Truck size={16} color="#3B82F6" />
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B', margin: 0 }}>
              Response Progress
            </h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {report.canonical_incident.tasks.map((task) => {
              const stage = taskStage(task);
              return (
                <div
                  key={task.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${stage.border}`,
                    background: stage.bg
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '12px', color: stage.color }}>
                      {stage.label}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                      {new Date(task.completed_at || task.dispatched_at || task.accepted_at || task.offered_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: stage.color }}>{stage.detail}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Incident Summary Card */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '12px', textTransform: 'uppercase' }}>
          Report Summary
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
          <div>
            <span style={{ color: '#64748B' }}>Category:</span>{' '}
            <strong>{report.incident_type.replace('_', ' ')}</strong>
          </div>
          <div>
            <span style={{ color: '#64748B' }}>Reported Severity:</span>{' '}
            <span style={{
              fontWeight: 600,
              color: report.reporter_severity === 'CRITICAL' ? '#DC2626' : '#2563EB'
            }}>
              {report.reporter_severity}
            </span>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ color: '#64748B' }}>Location:</span>{' '}
            <strong>{report.location_name}</strong> ({report.latitude.toFixed(4)}, {report.longitude.toFixed(4)})
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ color: '#64748B' }}>Initial Description:</span>
            <div style={{ marginTop: '4px', padding: '8px', background: '#F8FAFC', borderRadius: '4px', color: '#1E293B' }}>
              {report.description}
            </div>
          </div>
        </div>
      </div>

      {/* Clarification Notes & Composer */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <MessageSquare size={16} color="#3B82F6" />
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B', margin: 0 }}>
            Clarifications & Situation Updates ({report.clarifications.length})
          </h4>
        </div>

        {report.clarifications.length === 0 ? (
          <p style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic', marginBottom: '16px' }}>
            No follow-up clarifications posted yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {report.clarifications.map((c) => (
              <div
                key={c.id}
                style={{
                  background: '#F8FAFC',
                  borderLeft: '3px solid #3B82F6',
                  padding: '8px 12px',
                  borderRadius: '0 6px 6px 0',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: '#1E40AF', fontSize: '11px' }}>
                    Author: {c.author_id}
                  </span>
                  <span style={{ color: '#94A3B8', fontSize: '11px' }}>
                    {new Date(c.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ color: '#334155' }}>{c.message}</div>
              </div>
            ))}
          </div>
        )}

        {/* Clarification Composer */}
        <form onSubmit={handleClarifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {clarificationError && (
            <span style={{ color: '#DC2626', fontSize: '12px' }}>{clarificationError}</span>
          )}
          <textarea
            rows={2}
            value={clarificationText}
            onChange={(e) => setClarificationText(e.target.value)}
            placeholder="Add updated water level, road blockage, or landmark clarification..."
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontSize: '13px',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !clarificationText.trim()}
            style={{
              alignSelf: 'flex-end',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: isLoading || !clarificationText.trim() ? '#CBD5E1' : '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isLoading || !clarificationText.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            <PlusCircle size={14} />
            <span>Append Clarification Note</span>
          </button>
        </form>
      </div>
    </div>
  );
};
