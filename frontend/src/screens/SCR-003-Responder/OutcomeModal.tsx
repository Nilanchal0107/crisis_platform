import { useEffect, useId, useRef, useState } from 'react';
import { TaskDetailView, SubmitOutcomeDTO } from '@vrl/shared';
import { useOperational } from '../../context/OperationalContext';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  PackageCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface OutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskDetailView;
  restoreFocusTo?: HTMLElement | null;
  onSubmitted?: (message: string) => void;
}

const DEFAULT_EXCEPTION_REASON = 'Waterlogging near Kranti Nagar footbridge blocked vehicle transit to remaining households';

// Demo-scenario partial split, scaled to whatever quantity was actually dispatched
// (not necessarily the full assigned_quantity — see partial-dispatch support).
function computePartialSplit(dispatched: number): { delivered: number; remainder: number } {
  if (dispatched <= 1) return { delivered: dispatched, remainder: 0 };
  const remainder = Math.max(1, Math.round(dispatched * 0.4));
  return { delivered: dispatched - remainder, remainder };
}

export const OutcomeModal = ({ isOpen, onClose, task, restoreFocusTo, onSubmitted }: OutcomeModalProps) => {
  const { submitOutcome, isLoading } = useOperational();

  const [outcomeType, setOutcomeType] = useState<'FULL' | 'PARTIAL' | 'FAILED'>('PARTIAL');
  const [deliveredQty, setDeliveredQty] = useState<number>(0);
  const [remainderQty, setRemainderQty] = useState<number>(0);
  const [exceptionReason, setExceptionReason] = useState<string>(DEFAULT_EXCEPTION_REASON);
  const [error, setError] = useState<string | null>(null);

  const headingId = useId();
  const fullRadioId = useId();
  const partialRadioId = useId();
  const failedRadioId = useId();
  const deliveredInputId = useId();
  const remainderInputId = useId();
  const exceptionTextareaId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const exceptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      const split = computePartialSplit(task.dispatched_quantity);
      setOutcomeType('PARTIAL');
      setDeliveredQty(split.delivered);
      setRemainderQty(split.remainder);
      setExceptionReason(DEFAULT_EXCEPTION_REASON);
      setError(null);
      dialogRef.current?.focus();
    }
  }, [isOpen, task.dispatched_quantity]);

  if (!isOpen) return null;

  const totalAccounted = (Number(deliveredQty) || 0) + (Number(remainderQty) || 0);
  const isMathValid = totalAccounted === task.dispatched_quantity;
  const isReasonRequired = outcomeType !== 'FULL';
  const isReasonProvided = exceptionReason.trim().length > 0;
  const canSubmit = isMathValid && (!isReasonRequired || isReasonProvided) && !isLoading;

  const handleClose = () => {
    onClose();
    restoreFocusTo?.focus();
  };

  const handleSelectOutcomeType = (type: 'FULL' | 'PARTIAL' | 'FAILED') => {
    setOutcomeType(type);
    setError(null);
    if (type === 'FULL') {
      setDeliveredQty(task.dispatched_quantity);
      setRemainderQty(0);
    } else if (type === 'PARTIAL') {
      const split = computePartialSplit(task.dispatched_quantity);
      setDeliveredQty(split.delivered);
      setRemainderQty(split.remainder);
      if (!exceptionReason) {
        setExceptionReason(DEFAULT_EXCEPTION_REASON);
      }
      // Field is about to be (re)mounted since isReasonRequired becomes true; focus it
      // once React has rendered it (matches "conditional fields receive focus only
      // when revealed by the user's choice").
      requestAnimationFrame(() => exceptionRef.current?.focus());
    } else if (type === 'FAILED') {
      setDeliveredQty(0);
      setRemainderQty(task.dispatched_quantity);
      requestAnimationFrame(() => exceptionRef.current?.focus());
    }
  };

  const handleApplyScenarioPreset = () => {
    const split = computePartialSplit(task.dispatched_quantity);
    setOutcomeType('PARTIAL');
    setDeliveredQty(split.delivered);
    setRemainderQty(split.remainder);
    setExceptionReason(DEFAULT_EXCEPTION_REASON);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isMathValid) {
      setError(`Custody mismatch: ${totalAccounted} accounted vs ${task.dispatched_quantity} dispatched.`);
      return;
    }

    if (isReasonRequired && !isReasonProvided) {
      setError('A mandatory exception reason must be provided when outcome is not 100% full delivery.');
      return;
    }

    try {
      const dto: SubmitOutcomeDTO = {
        outcome_type: outcomeType,
        delivered_quantity: Number(deliveredQty),
        remainder_quantity: Number(remainderQty),
        exception_reason: isReasonProvided ? exceptionReason.trim() : undefined
      };
      await submitOutcome(task.id, dto);
      onSubmitted?.(`Outcome submitted for Mission #${task.id}: ${reviewLine}`);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit execution outcome.');
    }
  };

  const reviewLine = outcomeType === 'FULL'
    ? `${deliveredQty} of ${task.dispatched_quantity} delivered; mission fully completed.`
    : outcomeType === 'FAILED'
      ? `0 of ${task.dispatched_quantity} delivered; all ${remainderQty} will remain unresolved with this reason.`
      : `${deliveredQty} of ${task.dispatched_quantity} delivered; ${remainderQty} will remain unresolved with this reason.`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          outline: 'none'
        }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              background: '#F3E8FF',
              color: '#7E22CE',
              padding: '10px',
              borderRadius: '8px',
              display: 'flex'
            }}>
              <ClipboardCheck size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 id={headingId} style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                  Submit Execution Outcome
                </h3>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  background: '#E0E7FF',
                  color: '#3730A3',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  CMP-024
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
                Mission #{task.id} &bull; {task.incident_location} &bull; Dispatched: {task.dispatched_quantity} of {task.assigned_quantity} Kits
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              color: '#94A3B8',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            &times;
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Scenario Preset Button */}
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#15803D" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>
                  Mumbai Flood Demo Scenario
                </div>
                <div style={{ fontSize: '11px', color: '#15803D' }}>
                  Partial Handover: {computePartialSplit(task.dispatched_quantity).delivered} Kits Delivered / {computePartialSplit(task.dispatched_quantity).remainder} Kits Held (Kranti Nagar Floodwaters)
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleApplyScenarioPreset}
              style={{
                background: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Apply Preset
            </button>
          </div>

          {/* Outcome Type Radios */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Execution Outcome Classification
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { id: 'FULL', label: 'Full Delivery', desc: `100% completed (${task.dispatched_quantity}/${task.dispatched_quantity})`, radioId: fullRadioId },
                { id: 'PARTIAL', label: 'Partial Delivery', desc: 'Sub-quota delivered', radioId: partialRadioId },
                { id: 'FAILED', label: 'Mission Aborted', desc: `Zero kits handed over (0/${task.dispatched_quantity})`, radioId: failedRadioId }
              ].map((opt) => {
                const isSelected = outcomeType === opt.id;
                return (
                  <label
                    key={opt.id}
                    htmlFor={opt.radioId}
                    onClick={() => handleSelectOutcomeType(opt.id as any)}
                    style={{
                      border: isSelected ? '2px solid #7E22CE' : '1px solid #CBD5E1',
                      background: isSelected ? '#FAF5FF' : '#FFFFFF',
                      borderRadius: '8px',
                      padding: '10px 8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <input
                      type="radio"
                      id={opt.radioId}
                      name="outcomeType"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => handleSelectOutcomeType(opt.id as any)}
                      style={{ display: 'none' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#6B21A8' : '#1E293B' }}>
                      {opt.label}
                    </span>
                    <span style={{ fontSize: '10px', color: isSelected ? '#7E22CE' : '#64748B' }}>
                      {opt.desc}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Quantity Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <label
                htmlFor={deliveredInputId}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#059669',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '6px'
                }}
              >
                <PackageCheck size={14} />
                Delivered to Scene
              </label>
              <input
                id={deliveredInputId}
                type="number"
                inputMode="numeric"
                min="0"
                max={task.dispatched_quantity}
                value={deliveredQty}
                onChange={(e) => setDeliveredQty(parseInt(e.target.value, 10) || 0)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#0F172A',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Handed over to community
              </div>
            </div>

            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <label
                htmlFor={remainderInputId}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#D97706',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '6px'
                }}
              >
                <Truck size={14} />
                Remainder in Vehicle
              </label>
              <input
                id={remainderInputId}
                type="number"
                inputMode="numeric"
                min="0"
                max={task.dispatched_quantity}
                value={remainderQty}
                onChange={(e) => setRemainderQty(parseInt(e.target.value, 10) || 0)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#0F172A',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Held in Chetan's vehicle
              </div>
            </div>
          </div>

          {/* Reactive Math Pill */}
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: isMathValid ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${isMathValid ? '#A7F3D0' : '#FECACA'}`,
            color: isMathValid ? '#065F46' : '#991B1B',
            fontSize: '12px'
          }}>
            {isMathValid ? (
              <>
                <CheckCircle2 size={18} color="#059669" />
                <div>
                  <strong>✓ Math Verified:</strong> {deliveredQty} delivered + {remainderQty} remainder = {task.dispatched_quantity} dispatched. Conservation of mass holds.
                </div>
              </>
            ) : (
              <>
                <XCircle size={18} color="#DC2626" />
                <div>
                  <strong>✕ Custody Mismatch:</strong> {deliveredQty} + {remainderQty} = {totalAccounted} (Must equal {task.dispatched_quantity} dispatched). No units can be lost or created.
                </div>
              </>
            )}
          </div>

          {/* Mandatory Exception Reason (for Partial or Failed) — only mounted when
              actually required, so it receives focus only when the user's own choice
              of outcome type reveals it. */}
          {isReasonRequired && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label
                  htmlFor={exceptionTextareaId}
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#DC2626',
                    textTransform: 'uppercase'
                  }}
                >
                  Field Exception Reason (Mandatory)
                </label>
                <span style={{ fontSize: '11px', color: isReasonProvided ? '#059669' : '#DC2626', fontWeight: 600 }}>
                  {isReasonProvided ? '✓ Provided' : '✕ Required'}
                </span>
              </div>
              <textarea
                id={exceptionTextareaId}
                ref={exceptionRef}
                rows={3}
                value={exceptionReason}
                onChange={(e) => setExceptionReason(e.target.value)}
                placeholder="Explain why full assignment could not be completed (flood surge, road impassable, unsafe conditions)..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${!isReasonProvided ? '#FCA5A5' : '#CBD5E1'}`,
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  lineHeight: '1.4'
                }}
              />
            </div>
          )}

          {/* Review line (spec-format concise confirmation, not a generic "Are you
              sure?") + Two-Step Custody Handover Invariant Note */}
          <div style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '11px',
            color: '#1E40AF',
            lineHeight: '1.4',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700 }}>{reviewLine}</div>
            <div>
              <strong>⚖️ Step 1 Physical Handover:</strong> Submitting will record {deliveredQty} kits as delivered. The {remainderQty} remainder kits will stay assigned in your vehicle custody (<code>in_transit</code>) until Coordinator Rajesh verifies their physical return to BKC Depot in Step 2.
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            paddingTop: '10px',
            borderTop: '1px solid #E2E8F0'
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                padding: '10px 18px',
                borderRadius: '6px',
                background: canSubmit ? '#7E22CE' : '#CBD5E1',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: canSubmit ? '0 2px 4px rgba(126, 34, 206, 0.25)' : 'none'
              }}
            >
              {isLoading ? (
                <span>Recording Outcome...</span>
              ) : (
                <>
                  <RotateCcw size={15} />
                  <span>Submit Outcome & Record Handover</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
