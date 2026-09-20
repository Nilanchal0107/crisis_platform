import { useState, useEffect } from 'react';
import { SourceReport, IncidentPriority, mapSeverityToPriority, VerifyReportDTO } from '@vrl/shared';
import { ShieldCheck, X } from 'lucide-react';

interface VerificationModalProps {
  report: SourceReport;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reportId: number, dto: VerifyReportDTO) => Promise<void>;
  isLoading: boolean;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  report,
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  const [priority, setPriority] = useState<IncidentPriority>(() =>
    mapSeverityToPriority(report.reporter_severity)
  );
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPriority(mapSeverityToPriority(report.reporter_severity));
    setNotes('');
    setError(null);
  }, [report]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onConfirm(report.id, {
        priority,
        closure_notes: notes.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Verification failed');
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
          background: '#0F172A',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#10B981" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              Verify Incident & Promote to Canonical
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
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

          {/* Context Summary */}
          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#64748B' }}>Source Reference:</span>
              <strong style={{ fontFamily: 'monospace' }}>{report.reference_code}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#64748B' }}>Location:</span>
              <strong>{report.location_name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Reporter Severity:</span>
              <span style={{ fontWeight: 600, color: '#D97706' }}>{report.reporter_severity}</span>
            </div>
          </div>

          {/* Priority Assignment */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Operational Priority (Auto-Mapped with Override)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {(
                [
                  { val: IncidentPriority.LOW, label: 'Low', color: '#10B981' },
                  { val: IncidentPriority.MEDIUM, label: 'Medium', color: '#3B82F6' },
                  { val: IncidentPriority.HIGH, label: 'High', color: '#F59E0B' },
                  { val: IncidentPriority.URGENT, label: 'Urgent', color: '#EF4444' }
                ] as const
              ).map((p) => {
                const isSelected = priority === p.val;
                return (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setPriority(p.val)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '6px',
                      border: isSelected ? `2px solid ${p.color}` : '1px solid #CBD5E1',
                      background: isSelected ? '#EFF6FF' : '#FFFFFF',
                      color: isSelected ? p.color : '#475569',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coordinator Verification Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Verification Notes / Cross-Check Authority
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cross-checked with Mithi River level gauges & Ward L patrol officer..."
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

          {/* Consequence Disclosure */}
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#166534',
            lineHeight: '1.4'
          }}>
            <strong>Audit Consequence:</strong> Promotes report to a canonical incident, unlocks scarce resource allocation, and logs an immutable <code>REPORT_VERIFIED</code> audit record signed by your coordinator account.
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
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
              disabled={isLoading}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                background: '#059669',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Verifying...' : '✓ Confirm & Verify Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
