import { useState, useId } from 'react';
import { CanonicalIncident, TaskDetailView, IncidentStatus } from '@vrl/shared';
import {
  Scale,
  CheckCircle,
  AlertTriangle,
  PackageCheck,
  RotateCcw,
  Warehouse,
  FileCheck2,
  Clock
} from 'lucide-react';

interface ReconciliationPanelProps {
  incident: CanonicalIncident;
  task: TaskDetailView;
  onReconcile: (closureNotes?: string) => Promise<void>;
  isLoading: boolean;
}

export const ReconciliationPanel = ({
  incident,
  task,
  onReconcile,
  isLoading
}: ReconciliationPanelProps) => {
  const defaultNotes =
    'Confirmed 12 kits distributed to Kranti Nagar flood victims. 8 kits safely checked back into BKC Relief Base warehouse stock due to impassable waterlogging.';
  const [closureNotes, setClosureNotes] = useState<string>(defaultNotes);
  const [error, setError] = useState<string | null>(null);
  const closureNotesId = useId();

  const isResolved =
    incident.status === IncidentStatus.PARTIALLY_RESOLVED ||
    incident.status === IncidentStatus.RESOLVED;

  const handleConfirm = async () => {
    setError(null);
    try {
      await onReconcile(closureNotes.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to confirm reconciliation');
    }
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: isResolved ? '1px solid #A7F3D0' : '1px solid #FCD34D',
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: isResolved ? '#ECFDF5' : '#FEF3C7',
            color: isResolved ? '#059669' : '#D97706',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex'
          }}>
            {isResolved ? <CheckCircle size={18} /> : <Scale size={18} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                {isResolved ? 'Reconciliation Complete' : 'Execution Outcome & Reconciliation'}
              </h4>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                background: '#F1F5F9',
                color: '#475569'
              }}>
                CMP-025
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              {isResolved
                ? 'Physical inventory accounted and restocked to BKC Depot'
                : 'Step 2: Verify volunteer report and restock remainder inventory'}
            </span>
          </div>
        </div>

        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '4px',
          background: isResolved ? '#D1FAE5' : '#FEF3C7',
          color: isResolved ? '#065F46' : '#92400E',
          border: `1px solid ${isResolved ? '#A7F3D0' : '#FDE68A'}`
        }}>
          {isResolved ? incident.status : 'PENDING RECONCILIATION'}
        </span>
      </div>

      {error && (
        <div style={{
          background: '#FEE2E2',
          border: '1px solid #F87171',
          padding: '8px 12px',
          borderRadius: '6px',
          color: '#991B1B',
          fontSize: '12px',
          display: 'flex',
          gap: '6px',
          alignItems: 'center'
        }}>
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Outcome Breakdown Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '6px',
          padding: '10px 12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#065F46', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
            <PackageCheck size={14} />
            Delivered to Scene
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#065F46', marginTop: '4px' }}>
            {task.delivered_quantity} Kits
          </div>
          <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
            Handed to Kranti Nagar families
          </div>
        </div>

        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '6px',
          padding: '10px 12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#92400E', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
            <Warehouse size={14} />
            Restock Remainder
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#92400E', marginTop: '4px' }}>
            {task.remainder_quantity} Kits
          </div>
          <div style={{ fontSize: '11px', color: '#B45309', marginTop: '2px' }}>
            {isResolved ? 'Returned to BKC Depot stock' : 'Pending warehouse check-in'}
          </div>
        </div>
      </div>

      {/* Responder Exception & Timestamp */}
      <div style={{
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '6px',
        padding: '10px 12px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', marginBottom: '4px' }}>
          <span>Reported by: <strong>{task.assigned_to_name || 'Chetan (Field Volunteer)'}</strong></span>
          {task.completed_at && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748B' }}>
              <Clock size={12} />
              {new Date(task.completed_at).toLocaleTimeString()}
            </span>
          )}
        </div>
        <div style={{ color: '#1E293B', fontStyle: 'italic', background: '#FFFFFF', padding: '6px 10px', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
          "{task.exception_reason || 'No exception note recorded.'}"
        </div>
      </div>

      {/* If already resolved, show resolution summary */}
      {isResolved ? (
        <div style={{
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '6px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 700, fontSize: '12px' }}>
            <FileCheck2 size={16} />
            <span>Reconciliation Audit Record Finalized</span>
          </div>
          <div style={{ fontSize: '12px', color: '#15803D' }}>
            {incident.closure_notes || 'Confirmed 12 kits distributed. 8 kits safely checked back into BKC Relief Base warehouse stock.'}
          </div>
          {incident.resolved_at && (
            <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>
              Resolved at: {new Date(incident.resolved_at).toLocaleTimeString()}
            </div>
          )}
        </div>
      ) : (
        /* Action Form for Coordinator Reconciliation (Step 2) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label
              htmlFor={closureNotesId}
              style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}
            >
              Coordinator Closure & Restock Notes
            </label>
            <textarea
              id={closureNotesId}
              rows={2}
              value={closureNotes}
              onChange={(e) => setClosureNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '12px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '6px',
            padding: '8px 10px',
            fontSize: '11px',
            color: '#1E40AF',
            lineHeight: '1.4'
          }}>
            🔒 <strong>LOGIC-004 Two-Step Invariant:</strong> Confirming this restocks {task.remainder_quantity} physical units from <code>in_transit</code> back to BKC Depot <code>available</code> stock. Incident status transitions to <code>PARTIALLY_RESOLVED</code>.
          </div>

          <button
            onClick={handleConfirm}
            disabled={isLoading}
            style={{
              padding: '12px 16px',
              borderRadius: '6px',
              background: '#059669',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
            }}
          >
            <RotateCcw size={16} />
            <span>
              {isLoading
                ? 'Reconciling Ledger...'
                : `✓ Confirm Partial Outcome & Reconcile (${task.remainder_quantity} Kits Restocked)`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
