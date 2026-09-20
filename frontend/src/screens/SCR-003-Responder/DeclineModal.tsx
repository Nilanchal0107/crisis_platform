import { useEffect, useId, useRef, useState } from 'react';
import { XCircle, AlertTriangle, X } from 'lucide-react';
import { useOperational } from '../../context/OperationalContext';

interface DeclineModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
  restoreFocusTo?: HTMLElement | null;
  onDeclined?: (message: string) => void;
}

export const DeclineModal = ({ isOpen, onClose, taskId, restoreFocusTo, onDeclined }: DeclineModalProps) => {
  const { acknowledgeTask, isLoading } = useOperational();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const headingId = useId();
  const reasonId = useId();
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError(null);
      reasonRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isReasonProvided = reason.trim().length > 0;

  const handleClose = () => {
    onClose();
    restoreFocusTo?.focus();
  };

  const handleConfirmDecline = async () => {
    setError(null);
    if (!isReasonProvided) {
      setError('A reason is required before declining a mission offer.');
      return;
    }
    try {
      await acknowledgeTask(taskId, 'DECLINE', reason.trim());
      onDeclined?.(`Mission #${taskId} declined.`);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to decline mission');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          background: '#991B1B',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <XCircle size={20} />
            <h3 id={headingId} style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
              Decline Mission Offer
            </h3>
          </div>
          <button
            onClick={handleClose}
            style={{ background: 'transparent', border: 'none', color: '#FECACA', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div style={{
              background: '#FEE2E2',
              border: '1px solid #F87171',
              padding: '10px',
              borderRadius: '6px',
              color: '#991B1B',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.4' }}>
            Declining this offer notifies the BMC Coordinator. Reserved kits will remain safely staged at BKC Depot for re-allocation to another volunteer unit.
          </p>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label htmlFor={reasonId} style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Reason for Declining (Required)
              </label>
              <span style={{ fontSize: '11px', color: isReasonProvided ? '#059669' : '#DC2626', fontWeight: 600 }}>
                {isReasonProvided ? '✓ Provided' : '✕ Required'}
              </span>
            </div>
            <textarea
              id={reasonId}
              ref={reasonRef}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Access road flooded / Vehicle failure / Reassigned to Bail Bazar"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                border: `1px solid ${!isReasonProvided ? '#FCA5A5' : '#CBD5E1'}`,
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDecline}
              disabled={isLoading || !isReasonProvided}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: isReasonProvided ? '#DC2626' : '#CBD5E1',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isReasonProvided ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <AlertTriangle size={15} />
              <span>Confirm Decline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
