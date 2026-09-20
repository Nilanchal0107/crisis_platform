import { useState } from 'react';
import { PackagePlus, PackageMinus, AlertTriangle, ShieldCheck, X, Save } from 'lucide-react';
import { useOperational } from '../../context/OperationalContext';

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  poolId: number;
  depotName: string;
  availableQuantity: number;
}

type Direction = 'ADD' | 'REMOVE';

const REASON_TEMPLATES: Record<Direction, string[]> = {
  ADD: [
    'New shipment received from BMC HQ',
    'Donated relief kits from partner NGO'
  ],
  REMOVE: [
    'Water-damaged kits discarded',
    'Expired/unusable kits written off'
  ]
};

export const AdjustStockModal = ({ isOpen, onClose, poolId, depotName, availableQuantity }: AdjustStockModalProps) => {
  const { adjustStock, isLoading } = useOperational();
  const [direction, setDirection] = useState<Direction>('ADD');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const numericQuantity = typeof quantity === 'number' ? quantity : 0;
  const exceedsAvailable = direction === 'REMOVE' && numericQuantity > availableQuantity;

  const handleDirectionChange = (next: Direction) => {
    setDirection(next);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!numericQuantity || numericQuantity <= 0) {
      setError('Enter a quantity greater than zero.');
      return;
    }
    if (!reason.trim() || reason.trim().length < 3) {
      setError('A reason of at least 3 characters is required.');
      return;
    }
    if (exceedsAvailable) {
      setError(`Cannot remove ${numericQuantity} kits — only ${availableQuantity} are available (reserved/in-transit/delivered stock can't be removed this way).`);
      return;
    }

    try {
      await adjustStock(poolId, direction === 'ADD' ? numericQuantity : -numericQuantity, reason.trim());
      setQuantity('');
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust stock');
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
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: '#0F172A',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#2563EB', padding: '6px', borderRadius: '6px' }}>
              <PackagePlus size={20} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                Adjust Depot Stock
              </h3>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                {depotName}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Direction Toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleDirectionChange('ADD')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px',
                borderRadius: '8px',
                border: direction === 'ADD' ? '2px solid #059669' : '1px solid #CBD5E1',
                background: direction === 'ADD' ? '#ECFDF5' : '#FFFFFF',
                color: direction === 'ADD' ? '#065F46' : '#64748B',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <PackagePlus size={15} />
              <span>Add Stock</span>
            </button>
            <button
              type="button"
              onClick={() => handleDirectionChange('REMOVE')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px',
                borderRadius: '8px',
                border: direction === 'REMOVE' ? '2px solid #DC2626' : '1px solid #CBD5E1',
                background: direction === 'REMOVE' ? '#FEF2F2' : '#FFFFFF',
                color: direction === 'REMOVE' ? '#991B1B' : '#64748B',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <PackageMinus size={15} />
              <span>Remove Stock</span>
            </button>
          </div>

          {direction === 'REMOVE' && (
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '-8px' }}>
              Only currently <strong>available</strong> stock ({availableQuantity} kits) can be removed — reserved, in-transit, and delivered kits are untouched.
            </div>
          )}

          {/* Quantity */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Quantity
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              placeholder="e.g. 10"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                borderRadius: '6px',
                border: exceedsAvailable ? '1px solid #F87171' : '1px solid #CBD5E1',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Reason */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Reason *
              </label>
              <span style={{ fontSize: '11px', color: '#64748B' }}>Quick Templates:</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {REASON_TEMPLATES[direction].map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => setReason(template)}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  {template}
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the adjustment for the audit trail..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                color: '#0F172A',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Audit callout */}
          <div style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#1E40AF',
            lineHeight: '1.4',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start'
          }}>
            <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              This is recorded as an immutable <strong>STOCK_ADJUSTED</strong> audit event with your identity,
              the quantity change, and this reason — visible in the Audit Ledger.
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: '9px 16px',
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
              type="submit"
              disabled={isLoading || !numericQuantity || reason.trim().length < 3}
              style={{
                padding: '9px 18px',
                borderRadius: '6px',
                border: 'none',
                background: direction === 'ADD' ? '#059669' : '#DC2626',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: (isLoading || !numericQuantity || reason.trim().length < 3) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !numericQuantity || reason.trim().length < 3) ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Save size={15} />
              <span>{isLoading ? 'Saving...' : direction === 'ADD' ? 'Add Stock' : 'Remove Stock'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
