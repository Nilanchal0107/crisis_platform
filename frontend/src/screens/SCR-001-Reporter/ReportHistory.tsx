import { History, ChevronRight } from 'lucide-react';

interface ReportHistoryItem {
  id: number;
  reference_code: string;
  location_name: string;
  incident_type: string;
  reporter_severity: string;
  status: string;
  canonical_status?: string | null;
  clarifications_count: number;
  created_at: string;
  latest_task_status?: string | null;
  latest_task_assignee?: string | null;
}

interface ReportHistoryProps {
  reports: ReportHistoryItem[];
  activeRef: string | null;
  onSelect: (ref: string) => void;
}

function statusBadge(report: ReportHistoryItem): { label: string; bg: string; border: string; text: string } {
  if (report.status === 'REJECTED') {
    return { label: 'Rejected', bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' };
  }
  if (report.status === 'SUBMITTED') {
    return { label: 'Under Review', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' };
  }
  // LINKED_TO_INCIDENT — defer to the canonical incident's own status
  switch (report.canonical_status) {
    case 'RESOLVED':
      return { label: 'Resolved', bg: '#F0FDF4', border: '#BBF7D0', text: '#166534' };
    case 'PARTIALLY_RESOLVED':
      return { label: 'Partially Resolved', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' };
    case 'CANCELLED':
      return { label: 'Cancelled', bg: '#F1F5F9', border: '#CBD5E1', text: '#475569' };
    default:
      // Not yet reconciled — surface the assigned task's own stage when one exists,
      // so "Verified / Active" doesn't sit unchanged through assignment/dispatch/delivery.
      switch (report.latest_task_status) {
        case 'OFFERED':
          return { label: 'Responder Offered', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' };
        case 'ACCEPTED':
          return { label: 'Responder Assigned', bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' };
        case 'DECLINED':
          return { label: 'Responder Declined', bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' };
        case 'IN_PROGRESS':
          return { label: 'Responder En Route', bg: '#F5F3FF', border: '#DDD6FE', text: '#5B21B6' };
        case 'COMPLETED':
        case 'PARTIALLY_COMPLETED':
          return { label: 'Delivered — Reconciling', bg: '#F0FDF4', border: '#BBF7D0', text: '#166534' };
        case 'FAILED':
          return { label: 'Delivery Failed', bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' };
        default:
          return { label: 'Verified / Active', bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46' };
      }
  }
}

export const ReportHistory: React.FC<ReportHistoryProps> = ({ reports, activeRef, onSelect }) => {
  return (
    <div style={{
      background: '#FFFFFF',
      padding: '16px 20px',
      borderRadius: '10px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <History size={16} color="#2563EB" />
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
          Your Report History
        </h3>
        <span style={{ fontSize: '12px', color: '#94A3B8' }}>({reports.length})</span>
      </div>

      {reports.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
          You haven't submitted any reports yet — they'll show up here once you do.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {reports.map((report) => {
            const badge = statusBadge(report);
            const isActive = report.reference_code === activeRef;
            return (
              <button
                key={report.id}
                onClick={() => onSelect(report.reference_code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: isActive ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  background: isActive ? '#EFF6FF' : '#F8FAFC',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#1E40AF' }}>
                      {report.reference_code}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      background: badge.bg,
                      border: `1px solid ${badge.border}`,
                      color: badge.text
                    }}>
                      {badge.label}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#475569',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {report.incident_type.replace('_', ' ')} · {report.location_name}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                    {new Date(report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <ChevronRight size={14} color="#94A3B8" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
