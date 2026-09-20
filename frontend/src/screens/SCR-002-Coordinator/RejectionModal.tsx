import { useState } from 'react';
import { SourceReport, RejectReportDTO } from '@vrl/shared';
import { AlertOctagon, X } from 'lucide-react';

interface RejectionModalProps {
  report: SourceReport;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reportId: number, dto: RejectReportDTO) => Promise<void>;
  isLoading: boolean;
}

const REJECTION_PRESETS = [
  'Duplicate report of existing verified incident in this sector',
  'Outside Kurla L-Ward disaster response operational jurisdiction',
  'Insufficient landmark or coordinate details to safely dispatch responders',
  'Non-emergency civic inquiry / resolved prior to deployment'
];

export const RejectionModal: React.FC<RejectionModalProps> = ({
  report,
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError('A substantive rejection reason is mandatory (minimum 5 characters)');
      return;
    }
    setError(null);

    try {
      await onConfirm(report.id, { rejection_reason: reason.trim() });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Rejection failed');
    }
  };

  return (
    <div style={{
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
        maxWidth: '520px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: '#7F1D1D',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertOctagon size={20} color="#FCA5A5" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              Reject Emergency Report
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#FCA5A5', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{
              background: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #F87171',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          <div style={{ fontSize: '13px', color: '#475569' }}>
            Rejecting report <strong style={{ fontFamily: 'monospace' }}>{report.reference_code}</strong> ({report.location_name}).
            State regulations require an attributable rationale.
          </div>

          {/* Preset Reasons */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
              Select Standard Presets:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {REJECTION_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReason(p)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: reason === p ? '1px solid #DC2626' : '1px solid #E2E8F0',
                    background: reason === p ? '#FEF2F2' : '#F8FAFC',
                    color: reason === p ? '#991B1B' : '#334155',
                    fontSize: '12px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Textarea */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Mandatory Rejection Explanation *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder="Provide clear reason why this report cannot be promoted to a verified crisis mission..."
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Warning */}
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#991B1B'
          }}>
            <strong>Public Visibility:</strong> This explanation will be displayed to the reporter on their public tracking receipt.
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason.trim()}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                background: '#DC2626',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isLoading || !reason.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Processing...' : '✕ Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
