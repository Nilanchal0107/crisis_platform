import { AlertTriangle, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  requestedQuantity: number;
  availableQuantity: number;
}

export const ConflictModal = ({
  isOpen,
  onClose,
  onRefresh,
  requestedQuantity,
  availableQuantity
}: ConflictModalProps) => {
  if (!isOpen) return null;

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
      zIndex: 1100,
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
            <AlertTriangle size={20} color="#FCA5A5" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
              Concurrency Conflict (HTTP 409)
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#FCA5A5', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            padding: '14px',
            borderRadius: '8px',
            color: '#991B1B',
            fontSize: '13px',
            lineHeight: '1.5'
          }}>
            <strong>Stock changed during transaction:</strong> You requested <strong>{requestedQuantity} kits</strong>, but only <strong>{availableQuantity} kits</strong> are currently available in BKC Relief Base Depot.
          </div>

          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Why did this happen?
            </div>
            <p style={{ margin: 0, color: '#64748B', lineHeight: '1.4' }}>
              Another emergency coordinator or automated dispatch committed the stock immediately before your transaction committed. The ledger rejected this write with a single-query conditional lock (LOGIC-002) to prevent phantom over-allocation.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#166534',
            background: '#F0FDF4',
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid #BBF7D0'
          }}>
            <ShieldCheck size={16} color="#16a34a" />
            <span>Conservation of Mass Invariant preserved: Zero inventory leakage.</span>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
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
              Dismiss
            </button>
            <button
              onClick={() => {
                onRefresh();
                onClose();
              }}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                background: '#1E40AF',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} />
              <span>Refresh Ledger ↺</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
