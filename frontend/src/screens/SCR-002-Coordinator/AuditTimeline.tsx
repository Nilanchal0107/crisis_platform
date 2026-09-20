import { useState } from 'react';
import { AuditEvent } from '@vrl/shared';
import {
  ShieldCheck,
  ArrowUpDown,
  Search,
  CheckCircle,
  FileCheck,
  Package,
  Truck,
  ClipboardCheck,
  AlertCircle
} from 'lucide-react';

interface AuditTimelineProps {
  auditEvents: AuditEvent[];
}

export const AuditTimeline = ({ auditEvents }: AuditTimelineProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isReverseOrder, setIsReverseOrder] = useState(false); // Default: newest first (since backend returns DESC or array)

  // Filter events by search term
  const filteredEvents = auditEvents.filter((e) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      e.action.toLowerCase().includes(term) ||
      e.actor_id.toLowerCase().includes(term) ||
      e.actor_role.toLowerCase().includes(term) ||
      e.entity_type.toLowerCase().includes(term) ||
      e.entity_id.toLowerCase().includes(term) ||
      (e.reason && e.reason.toLowerCase().includes(term))
    );
  });

  const sortedEvents = isReverseOrder
    ? [...filteredEvents].reverse()
    : [...filteredEvents];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'REPORT_CREATED':
        return { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' };
      case 'INCIDENT_VERIFIED':
        return { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46' };
      case 'REPORT_REJECTED':
      case 'TASK_DECLINED':
        return { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' };
      case 'RESOURCES_COMMITTED':
        return { bg: '#FEF3C7', border: '#FDE68A', text: '#92400E' };
      case 'TASK_OFFERED':
        return { bg: '#FFF7ED', border: '#FFEDD5', text: '#C2410C' };
      case 'TASK_ACCEPTED':
        return { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' };
      case 'TASK_DISPATCHED':
        return { bg: '#FAF5FF', border: '#E9D5FF', text: '#6B21A8' };
      case 'OUTCOME_SUBMITTED':
        return { bg: '#F0FDFA', border: '#99F6E4', text: '#0F766E' };
      case 'OUTCOME_RECONCILED':
        return { bg: '#ECFDF5', border: '#6EE7B7', text: '#047857' };
      case 'DEMO_RESET':
        return { bg: '#F1F5F9', border: '#CBD5E1', text: '#475569' };
      default:
        return { bg: '#F8FAFC', border: '#E2E8F0', text: '#334155' };
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'REPORT_CREATED':
      case 'INCIDENT_VERIFIED':
        return <FileCheck size={14} />;
      case 'RESOURCES_COMMITTED':
        return <Package size={14} />;
      case 'TASK_OFFERED':
      case 'TASK_ACCEPTED':
      case 'TASK_DISPATCHED':
        return <Truck size={14} />;
      case 'OUTCOME_SUBMITTED':
      case 'OUTCOME_RECONCILED':
        return <ClipboardCheck size={14} />;
      case 'REPORT_REJECTED':
      case 'TASK_DECLINED':
        return <AlertCircle size={14} />;
      default:
        return <CheckCircle size={14} />;
    }
  };

  const getActorBadge = (actorId: string, role: string) => {
    // Colored by ROLE (there can be several accounts per role now), labelled by the
    // actual actor id from the audit record — never a guessed/hardcoded name, since
    // that would misattribute an action to the wrong person in the accountability trail.
    let bg = '#F1F5F9';
    let text = '#475569';
    const displayName = actorId.charAt(0).toUpperCase() + actorId.slice(1);
    let label = displayName;

    if (role === 'REPORTER') {
      bg = '#DBEAFE';
      text = '#1E40AF';
      label = `${displayName} (Reporter)`;
    } else if (role === 'COORDINATOR') {
      bg = '#E0E7FF';
      text = '#3730A3';
      label = `${displayName} (Coordinator)`;
    } else if (role === 'RESPONDER') {
      bg = '#F3E8FF';
      text = '#6B21A8';
      label = `${displayName} (Responder)`;
    } else if (actorId.toUpperCase() === 'SYSTEM') {
      bg = '#E2E8F0';
      text = '#334155';
      label = 'SYSTEM';
    }

    return (
      <span style={{
        fontSize: '10px',
        fontWeight: 700,
        background: bg,
        color: text,
        padding: '2px 6px',
        borderRadius: '4px'
      }}>
        {label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Tamper-Evident Header Badge */}
      <div style={{
        background: '#0F172A',
        color: '#FFFFFF',
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid #1E293B'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#10B981" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.03em', color: '#10B981' }}>
              🔒 IMMUTABLE APPEND-ONLY AUDIT LEDGER
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              Zero UPDATE &bull; Zero DELETE &bull; 100% Deterministic Trail
            </div>
          </div>
        </div>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          background: '#1E293B',
          color: '#60A5FA',
          padding: '4px 8px',
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          {auditEvents.length} EVENTS
        </span>
      </div>

      {/* Filter and Order Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '6px',
          padding: '6px 10px'
        }}>
          <Search size={14} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search action, actor, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '12px',
              width: '100%',
              background: 'transparent'
            }}
          />
        </div>

        <button
          onClick={() => setIsReverseOrder(!isReverseOrder)}
          title="Toggle chronological order"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #CBD5E1',
            background: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 600,
            color: '#475569',
            cursor: 'pointer'
          }}
        >
          <ArrowUpDown size={13} />
          <span>{isReverseOrder ? 'Oldest First' : 'Newest First'}</span>
        </button>
      </div>

      {/* Events List */}
      {sortedEvents.length === 0 ? (
        <div style={{
          background: '#F8FAFC',
          border: '1px dashed #CBD5E1',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
          color: '#64748B',
          fontSize: '12px'
        }}>
          No audit records found matching query.
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxHeight: 'calc(100vh - 300px)',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {sortedEvents.map((event) => {
            const colors = getActionColor(event.action);
            return (
              <div
                key={event.id}
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${colors.border}`,
                  borderLeft: `4px solid ${colors.text}`,
                  borderRadius: '6px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                }}
              >
                {/* Event Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: colors.bg,
                      color: colors.text,
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {getActionIcon(event.action)}
                      <span>{event.action}</span>
                    </span>
                    {getActorBadge(event.actor_id, event.actor_role)}
                  </div>

                  <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                {/* Entity & Delta Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155' }}>
                  <span style={{ fontFamily: 'monospace', color: '#64748B', fontSize: '11px' }}>
                    #{event.id} &bull; {event.entity_type}:{event.entity_id}
                  </span>

                  {event.quantity_delta !== 0 && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: event.quantity_delta > 0 ? '#ECFDF5' : '#FEF2F2',
                      color: event.quantity_delta > 0 ? '#065F46' : '#991B1B'
                    }}>
                      Δ Qty: {event.quantity_delta > 0 ? `+${event.quantity_delta}` : event.quantity_delta}
                    </span>
                  )}
                </div>

                {/* State Transition */}
                {(event.before_state || event.after_state) && (
                  <div style={{
                    fontSize: '11px',
                    color: '#475569',
                    background: '#F8FAFC',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ color: '#64748B' }}>Transition:</span>
                    <code>{event.before_state || 'INITIAL'}</code>
                    <span>➔</span>
                    <strong style={{ color: '#0F172A' }}><code>{event.after_state || 'FINAL'}</code></strong>
                  </div>
                )}

                {/* Reason / Notes */}
                {event.reason && (
                  <div style={{
                    fontSize: '11px',
                    color: '#1E293B',
                    background: '#F1F5F9',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    lineHeight: '1.4'
                  }}>
                    <span style={{ fontWeight: 600, color: '#475569' }}>Reason: </span>
                    <span>"{event.reason}"</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
