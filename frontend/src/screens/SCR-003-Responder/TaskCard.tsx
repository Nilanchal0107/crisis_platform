import { useRef, useState } from 'react';
import { TaskDetailView, TaskStatus } from '@vrl/shared';
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ShieldAlert,
  PackageCheck,
  ClipboardCheck,
  MessageSquarePlus,
  History
} from 'lucide-react';
import { useOperational } from '../../context/OperationalContext';
import { DispatchDialog } from './DispatchDialog';
import { DeclineModal } from './DeclineModal';
import { OutcomeModal } from './OutcomeModal';

interface TaskCardProps {
  task: TaskDetailView;
  onAnnounce?: (message: string) => void;
}

export const TaskCard = ({ task, onAnnounce }: TaskCardProps) => {
  const { acknowledgeTask, postTaskUpdate, isLoading } = useOperational();
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateType, setUpdateType] = useState<'PROGRESS' | 'EXCEPTION'>('PROGRESS');
  const [isPostingUpdate, setIsPostingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const declineButtonRef = useRef<HTMLButtonElement>(null);
  const dispatchButtonRef = useRef<HTMLButtonElement>(null);
  const outcomeButtonRef = useRef<HTMLButtonElement>(null);

  const isOffered = task.status === TaskStatus.OFFERED;
  const isAccepted = task.status === TaskStatus.ACCEPTED;
  const isInProgress = task.status === TaskStatus.IN_PROGRESS;
  const isDeclined = task.status === TaskStatus.DECLINED;
  const isPartiallyCompleted = task.status === TaskStatus.PARTIALLY_COMPLETED;
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isFailed = task.status === TaskStatus.FAILED;
  const heldBackQty = task.dispatched_quantity > 0 ? task.assigned_quantity - task.dispatched_quantity : 0;

  const handleAccept = async () => {
    setError(null);
    try {
      await acknowledgeTask(task.id, 'ACCEPT');
      onAnnounce?.(`Mission #${task.id} accepted.`);
    } catch (err: any) {
      setError(err.message || 'Failed to accept mission ownership');
    }
  };

  const handlePostUpdate = async () => {
    setUpdateError(null);
    if (!updateMessage.trim()) {
      setUpdateError('Enter a non-empty update before submitting.');
      return;
    }
    setIsPostingUpdate(true);
    try {
      await postTaskUpdate(task.id, { message: updateMessage.trim(), update_type: updateType });
      onAnnounce?.(`Update posted for Mission #${task.id}.`);
      setUpdateMessage('');
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to post update');
    } finally {
      setIsPostingUpdate(false);
    }
  };

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      overflow: 'hidden',
      marginBottom: '20px'
    }}>
      {/* Top Status Header */}
      <div style={{
        padding: '14px 20px',
        background: isOffered
          ? '#FFFBEB'
          : isAccepted
          ? '#EFF6FF'
          : isInProgress
          ? '#FAF5FF'
          : isPartiallyCompleted
          ? '#FEF3C7'
          : isCompleted
          ? '#ECFDF5'
          : isFailed
          ? '#FEF2F2'
          : '#F1F5F9',
        borderBottom: `1px solid ${
          isOffered
            ? '#FDE68A'
            : isAccepted
            ? '#BFDBFE'
            : isInProgress
            ? '#E9D5FF'
            : isPartiallyCompleted
            ? '#FCD34D'
            : isCompleted
            ? '#A7F3D0'
            : isFailed
            ? '#FECACA'
            : '#E2E8F0'
        }`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '12px',
            fontFamily: 'monospace',
            fontWeight: 700,
            color: '#1E40AF',
            background: '#DBEAFE',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            {task.reference_code}
          </span>
          <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#334155' }}>
            Mission #{task.id}
          </h3>
        </div>

        {/* State Badge — aria-live so a status transition (e.g. OFFERED -> ACCEPTED) is
            announced without relying on a toast. */}
        <span
          role="status"
          aria-live="polite"
          style={{
          fontSize: '12px',
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: isOffered
            ? '#FEF3C7'
            : isAccepted
            ? '#DBEAFE'
            : isInProgress
            ? '#F3E8FF'
            : isPartiallyCompleted
            ? '#FFFBEB'
            : isCompleted
            ? '#D1FAE5'
            : isFailed
            ? '#FEE2E2'
            : '#E2E8F0',
          color: isOffered
            ? '#92400E'
            : isAccepted
            ? '#1E40AF'
            : isInProgress
            ? '#6B21A8'
            : isPartiallyCompleted
            ? '#B45309'
            : isCompleted
            ? '#065F46'
            : isFailed
            ? '#991B1B'
            : '#475569'
        }}>
          {isOffered && <Clock size={13} />}
          {isAccepted && <CheckCircle size={13} />}
          {isInProgress && <Truck size={13} />}
          {isPartiallyCompleted && <PackageCheck size={13} />}
          {isCompleted && <CheckCircle size={13} />}
          {isFailed && <XCircle size={13} />}
          {isDeclined && <XCircle size={13} />}
          <span>
            {isOffered
              ? 'OFFERED / PENDING ACCEPTANCE'
              : isAccepted
              ? 'ACCEPTED / READY FOR DISPATCH'
              : isInProgress
              ? 'IN PROGRESS / EN ROUTE'
              : isPartiallyCompleted
              ? `PARTIALLY COMPLETED (${task.delivered_quantity} DELIVERED / ${task.remainder_quantity} REMAINDER)`
              : isCompleted
              ? 'COMPLETED (100% DELIVERED)'
              : isFailed
              ? 'FAILED / ABORTED'
              : task.status}
          </span>
        </span>
      </div>

      {/* Main Mission Content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {error && (
          <div style={{
            background: '#FEE2E2',
            border: '1px solid #F87171',
            padding: '10px 14px',
            borderRadius: '6px',
            color: '#991B1B',
            fontSize: '13px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Location & Kit Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          background: '#F8FAFC',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #E2E8F0'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Target Delivery Site
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <MapPin size={16} color="#DC2626" />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                {task.incident_location}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
              Coordinates: [{task.latitude.toFixed(4)}, {task.longitude.toFixed(4)}]
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Physical Inventory Custody
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#1E3A8A' }}>
                📦 {task.assigned_quantity} Emergency Relief Kits
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
              Depot: <strong>{task.depot_name || 'BKC Relief Base (Depot 1)'}</strong>
            </div>
          </div>
        </div>

        {/* Reporter Contact Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          background: '#F1F5F9',
          borderRadius: '6px',
          fontSize: '13px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
            <Phone size={14} color="#2563EB" />
            <span>On-Scene Reporter: <strong>{task.reporter_name || 'Aarav (Lead Citizen Reporter)'}</strong></span>
          </div>
          <span style={{ fontFamily: 'monospace', color: '#1E40AF', fontWeight: 600 }}>
            {task.reporter_contact_safe || '+91-98200-XXXXX'}
          </span>
        </div>

        {/* Coordinator Instructions */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Coordinator Instructions from {task.assigned_by_name || 'Rajesh (BMC Coordinator)'}:
          </div>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderLeft: '4px solid #2563EB',
            padding: '12px 14px',
            borderRadius: '0 6px 6px 0',
            fontSize: '13px',
            color: '#1E293B',
            lineHeight: '1.5'
          }}>
            {task.instructions}
          </div>
        </div>

        {/* Two-Phase Action Bar (CMP-021) */}
        {isOffered && (
          <div style={{
            marginTop: '8px',
            paddingTop: '16px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#92400E',
              background: '#FEF3C7',
              padding: '8px 12px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <ShieldAlert size={15} />
              <span>Two-Phase Handover: Accept mission ownership before kits can be marked as departing the depot.</span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleAccept}
                disabled={isLoading}
                style={{
                  flex: 2,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: '#059669',
                  color: '#FFFFFF',
                  fontWeight: 700,
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
                <CheckCircle size={18} />
                <span>✓ Accept Mission Ownership</span>
              </button>

              <button
                ref={declineButtonRef}
                onClick={() => setIsDeclineOpen(true)}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
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
                <span>✕ Decline</span>
              </button>
            </div>
          </div>
        )}

        {/* Accepted State: Ready to Dispatch */}
        {isAccepted && (
          <div style={{
            marginTop: '8px',
            paddingTop: '16px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#1E40AF',
              background: '#EFF6FF',
              padding: '10px 14px',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} color="#059669" />
                <span>Mission accepted at {task.accepted_at ? new Date(task.accepted_at).toLocaleTimeString() : 'now'}. Proceed to BKC depot loading bay.</span>
              </div>
            </div>

            <button
              ref={dispatchButtonRef}
              onClick={() => setIsDispatchOpen(true)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '13px 18px',
                borderRadius: '8px',
                background: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)'
              }}
            >
              <Truck size={18} />
              <span>🚚 Mark {task.assigned_quantity} Kits Dispatched</span>
            </button>
          </div>
        )}

        {/* In-Progress State: En Route */}
        {isInProgress && (
          <div style={{
            marginTop: '8px',
            paddingTop: '16px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              background: '#FAF5FF',
              border: '1px solid #E9D5FF',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#6B21A8' }}>
                  🚚 Kits En Route to {task.incident_location}
                </div>
                <div style={{ fontSize: '12px', color: '#7E22CE', marginTop: '2px' }}>
                  Dispatched at: {task.dispatched_at ? new Date(task.dispatched_at).toLocaleTimeString() : 'now'}
                </div>
              </div>
              <span style={{
                background: '#9333EA',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px'
              }}>
                IN TRANSIT ({task.dispatched_quantity} KITS)
              </span>
            </div>

            {heldBackQty > 0 && (
              <div style={{
                fontSize: '12px',
                color: '#B45309',
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                padding: '8px 12px',
                borderRadius: '6px'
              }}>
                {heldBackQty} of {task.assigned_quantity} reserved kits stayed at BKC Depot (vehicle capacity) — only {task.dispatched_quantity} are in transit.
              </div>
            )}

            {/* Progress / Exception Composer — free-text field updates while en route,
                distinct from the final outcome submission below */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                <MessageSquarePlus size={15} />
                <span>Post a Field Update</span>
              </div>
              {updateError && (
                <div style={{ fontSize: '12px', color: '#991B1B' }}>{updateError}</div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['PROGRESS', 'EXCEPTION'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setUpdateType(t)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: updateType === t ? '1px solid #7E22CE' : '1px solid #CBD5E1',
                      background: updateType === t ? '#F3E8FF' : '#FFFFFF',
                      color: updateType === t ? '#6B21A8' : '#64748B',
                      cursor: 'pointer'
                    }}
                  >
                    {t === 'PROGRESS' ? 'Progress' : 'Exception'}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                placeholder="e.g. Crossed Mithi Bridge, 10 minutes from site."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={handlePostUpdate}
                disabled={isPostingUpdate || !updateMessage.trim()}
                style={{
                  alignSelf: 'flex-end',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: updateMessage.trim() ? '#334155' : '#CBD5E1',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: updateMessage.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                {isPostingUpdate ? 'Posting...' : 'Post Update'}
              </button>
            </div>

            {/* Outcome Reporting CTA (CMP-024) */}
            <button
              ref={outcomeButtonRef}
              onClick={() => setIsOutcomeOpen(true)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                background: '#7E22CE',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(126, 34, 206, 0.25)'
              }}
            >
              <ClipboardCheck size={18} />
              <span>📋 Submit Execution Outcome (CMP-024)</span>
            </button>
          </div>
        )}

        {/* Partially Completed State */}
        {isPartiallyCompleted && (
          <div style={{
            marginTop: '8px',
            paddingTop: '16px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>
                  Execution Outcome Logged (Step 1 Complete)
                </span>
                <span style={{
                  background: '#FEF3C7',
                  color: '#92400E',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid #FCD34D'
                }}>
                  PARTIALLY COMPLETED
                </span>
              </div>

              {/* Custody Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>
                    ✓ Delivered to Scene
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#065F46', marginTop: '2px' }}>
                    {task.delivered_quantity} Kits
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Distributed to Kranti Nagar families
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                  <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 700, textTransform: 'uppercase' }}>
                    🚚 Remainder in Vehicle
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#B45309', marginTop: '2px' }}>
                    {task.remainder_quantity} Kits
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    In transit back to BKC Depot
                  </div>
                </div>
              </div>

              {/* Field Exception Note */}
              <div style={{ fontSize: '12px', color: '#475569', background: '#FFFFFF', padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>Field Access Exception: </span>
                <span>"{task.exception_reason || 'No details recorded.'}"</span>
              </div>

              {/* Pending Step 2 Callout */}
              <div style={{
                fontSize: '11px',
                color: '#1E40AF',
                background: '#EFF6FF',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #BFDBFE'
              }}>
                ⏳ <strong>Pending Step 2 (Coordinator Reconciliation):</strong> Remainder {task.remainder_quantity} kits remain in your custody until BMC Coordinator Rajesh confirms physical warehouse check-in at BKC Depot.
              </div>
            </div>
          </div>
        )}

        {/* Fully Completed State */}
        {isCompleted && (
          <div style={{
            marginTop: '8px',
            paddingTop: '16px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '8px',
              padding: '14px 16px',
              color: '#065F46'
            }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>
                ✓ Mission 100% Completed
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                All {task.dispatched_quantity} relief kits delivered successfully to scene beneficiaries.
              </div>
            </div>
          </div>
        )}

        {/* Declined State */}
        {isDeclined && (
          <div style={{
            marginTop: '8px',
            padding: '12px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#64748B'
          }}>
            <strong>Mission Declined:</strong> {task.exception_reason || 'No reason specified'}
          </div>
        )}

        {/* Own Task History — the responder's own progress/exception/outcome updates */}
        {task.updates.length > 0 && (
          <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
              <History size={13} />
              <span>Your Update History</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {task.updates.map((update) => (
                <div
                  key={update.id}
                  style={{
                    fontSize: '12px',
                    color: '#334155',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <span>
                    <span style={{ fontWeight: 700, color: '#475569' }}>[{update.update_type}]</span> {update.message}
                  </span>
                  <span style={{ color: '#94A3B8', whiteSpace: 'nowrap' }}>
                    {new Date(update.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <DispatchDialog
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
        onDispatched={onAnnounce}
        restoreFocusTo={dispatchButtonRef.current}
        taskId={task.id}
        locationName={task.incident_location}
        quantity={task.assigned_quantity}
        depotName={task.depot_name}
      />

      <DeclineModal
        isOpen={isDeclineOpen}
        onClose={() => setIsDeclineOpen(false)}
        onDeclined={onAnnounce}
        restoreFocusTo={declineButtonRef.current}
        taskId={task.id}
      />

      <OutcomeModal
        isOpen={isOutcomeOpen}
        onClose={() => setIsOutcomeOpen(false)}
        onSubmitted={onAnnounce}
        restoreFocusTo={outcomeButtonRef.current}
        task={task}
      />
    </div>
  );
};
