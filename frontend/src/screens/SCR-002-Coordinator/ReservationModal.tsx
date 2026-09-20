import { useState } from 'react';
import { Package, Zap, X, ShieldCheck, AlertCircle } from 'lucide-react';

interface ReservationModalProps {
  incidentId: number;
  locationName: string;
  availableStock: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => Promise<void>;
  onConflict: (requested: number, available: number) => void;
  isLoading: boolean;
}

export const ReservationModal = ({
  incidentId,
  locationName,
  availableStock,
  isOpen,
  onClose,
  onConfirm,
  onConflict,
  isLoading
}: ReservationModalProps) => {
  const [quantity, setQuantity] = useState<number>(availableStock > 0 ? Math.min(20, availableStock) : 20);
  const [isSimulatingRace, setIsSimulatingRace] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStandardReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setError('Please specify a positive quantity');
      return;
    }
    setError(null);

    try {
      await onConfirm(quantity);
      onClose();
    } catch (err: any) {
      if (err.error === 'INSUFFICIENT_STOCK_CONFLICT') {
        onClose();
        onConflict(err.requested_quantity || quantity, err.available_quantity || 0);
      } else {
        setError(err.message || 'Reservation failed');
      }
    }
  };

  const handleSimulateRaceCondition = async () => {
    setIsSimulatingRace(true);
    setError(null);

    try {
      // Fire two concurrent requests competing for the same 20 kits
      const [res1, res2] = await Promise.all([
        fetch(`/api/incidents/${incidentId}/reserve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-actor-id': 'rajesh',
            'x-actor-role': 'COORDINATOR'
          },
          body: JSON.stringify({ quantity: 20 })
        }),
        fetch(`/api/incidents/${incidentId}/reserve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-actor-id': 'rajesh_competing_worker',
            'x-actor-role': 'COORDINATOR'
          },
          body: JSON.stringify({ quantity: 20 })
        })
      ]);

      const data1 = await res1.json();
      const data2 = await res2.json();

      const conflictRes = res1.status === 409 ? data1 : res2.status === 409 ? data2 : null;

      if (conflictRes) {
        onClose();
        onConflict(20, conflictRes.available_quantity || 0);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Race simulation failed');
    } finally {
      setIsSimulatingRace(false);
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
            <Package size={20} color="#60A5FA" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              Reserve Emergency Relief Kits (LOGIC-002)
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleStandardReserve} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{
              background: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #F87171',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Incident & Stock Context */}
          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#64748B' }}>Target Incident:</span>
              <strong>Canonical #{incidentId} — {locationName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#64748B' }}>Depot Source:</span>
              <strong>BKC Relief Base (Depot 1)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748B' }}>Currently Available:</span>
              <span style={{
                fontWeight: 700,
                color: availableStock > 0 ? '#059669' : '#DC2626',
                background: availableStock > 0 ? '#ECFDF5' : '#FEF2F2',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '13px'
              }}>
                {availableStock} Kits
              </span>
            </div>
          </div>

          {/* Quick-Select Presets */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Select Batch Preset:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { qty: 20, label: 'All 20 Kits (Standard Mission)' },
                { qty: 10, label: '10 Kits (Half Depot)' },
                { qty: 5, label: '5 Kits (Recon)' }
              ].map((p) => {
                const isSelected = quantity === p.qty;
                return (
                  <button
                    key={p.qty}
                    type="button"
                    onClick={() => setQuantity(p.qty)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: isSelected ? '2px solid #2563EB' : '1px solid #CBD5E1',
                      background: isSelected ? '#EFF6FF' : '#FFFFFF',
                      color: isSelected ? '#1E40AF' : '#475569',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '12px',
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div>{p.qty} Kits</div>
                    <div style={{ fontSize: '10px', color: '#64748B' }}>{p.label.split('(')[1]?.replace(')', '') || ''}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editable Numeric Field */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Custom Allocation Quantity
            </label>
            <input
              type="number"
              min={1}
              max={availableStock > 0 ? availableStock : 20}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
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
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={16} color="#16a34a" />
            <span>
              Atomic conditional SQL decrement prevents concurrent over-allocation. Balance shifts: Available $\rightarrow$ Reserved.
            </span>
          </div>

          {/* Race Condition Simulator CTA */}
          <div style={{
            background: '#FFFBEB',
            border: '1px dashed #F59E0B',
            padding: '12px',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '12px', color: '#B45309' }}>
                  JUDGE DEMO: Concurrency Race Test
                </div>
                <div style={{ fontSize: '11px', color: '#92400E', marginTop: '2px' }}>
                  Simulate two coordinators reserving the same 20 kits simultaneously.
                </div>
              </div>

              <button
                type="button"
                onClick={handleSimulateRaceCondition}
                disabled={isSimulatingRace || isLoading}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: '#D97706',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: isSimulatingRace ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Zap size={13} />
                <span>{isSimulatingRace ? 'Simulating...' : 'Test Race Condition'}</span>
              </button>
            </div>
          </div>

          {/* Modal Actions */}
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
              disabled={isLoading || quantity <= 0}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                background: '#1E40AF',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isLoading || quantity <= 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Reserving...' : `✓ Reserve ${quantity} Kits`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
