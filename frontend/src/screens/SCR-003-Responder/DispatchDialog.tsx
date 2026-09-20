import { useEffect, useId, useRef, useState } from 'react';
import { Truck, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { useOperational } from '../../context/OperationalContext';

interface DispatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
  locationName: string;
  quantity: number;
  depotName: string;
  restoreFocusTo?: HTMLElement | null;
  onDispatched?: (message: string) => void;
}

export const DispatchDialog = ({
  isOpen,
  onClose,
  taskId,
  locationName,
  quantity,
  depotName,
  restoreFocusTo,
  onDispatched
}: DispatchDialogProps) => {
  const { dispatchTask, isLoading } = useOperational();
  const [notes, setNotes] = useState('');
  const [dispatchQty, setDispatchQty] = useState<number>(quantity);
  const [error, setError] = useState<string | null>(null);
  const headingId = useId();
  const quantityInputId = useId();
  const quantityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDispatchQty(quantity);
      setError(null);
      // Focus the primary editable field when the dialog opens
      quantityInputRef.current?.focus();
    }
  }, [isOpen, quantity]);

  if (!isOpen) return null;

  const heldBack = Math.max(0, quantity - dispatchQty);
  const isQtyValid = dispatchQty >= 1 && dispatchQty <= quantity;

  const handleClose = () => {
    onClose();
    restoreFocusTo?.focus();
  };

  const handleConfirmDispatch = async () => {
    setError(null);
    if (!isQtyValid) {
      setError(`Dispatch quantity must be between 1 and ${quantity}.`);
      return;
    }
    try {
      await dispatchTask(taskId, notes.trim() || undefined, dispatchQty);
      onDispatched?.(
        heldBack > 0
          ? `Dispatch confirmed: ${dispatchQty} of ${quantity} kits en route; ${heldBack} held back at depot.`
          : `Dispatch confirmed: ${dispatchQty} of ${quantity} kits en route.`
      );
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to confirm dispatch departure');
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
        maxWidth: '520px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: '#1E3A8A',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#3B82F6', padding: '6px', borderRadius: '6px' }}>
              <Truck size={20} color="#FFFFFF" />
            </div>
            <div>
              <h3 id={headingId} style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                Departure & Custody Transfer (CMP-022)
              </h3>
              <div style={{ fontSize: '11px', color: '#BFDBFE' }}>
                Handover Phase 2: Shift physical inventory into transit
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{ background: 'transparent', border: 'none', color: '#BFDBFE', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

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
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Transfer Summary */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Custody Item:</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                📦 {quantity} Emergency Relief Kits
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Origin Depot:</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                🏢 {depotName || 'BKC Relief Base (Depot 1)'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Delivery Destination:</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                📍 {locationName}
              </span>
            </div>
          </div>

          {/* Dispatch Quantity */}
          <div>
            <label
              htmlFor={quantityInputId}
              style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}
            >
              Dispatch Quantity (of {quantity} reserved)
            </label>
            <input
              id={quantityInputId}
              ref={quantityInputRef}
              type="number"
              inputMode="numeric"
              min={1}
              max={quantity}
              value={dispatchQty}
              onChange={(e) => setDispatchQty(parseInt(e.target.value, 10) || 0)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                border: `1px solid ${isQtyValid ? '#CBD5E1' : '#FCA5A5'}`,
                fontSize: '16px',
                fontWeight: 700,
                boxSizing: 'border-box'
              }}
            />
            {heldBack > 0 && (
              <div style={{ fontSize: '11px', color: '#B45309', marginTop: '4px' }}>
                {heldBack} kit{heldBack === 1 ? '' : 's'} will stay reserved at BKC Depot for this mission (vehicle capacity).
              </div>
            )}
          </div>

          {/* Consequence Warning Notice */}
          <div style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start'
          }}>
            <ShieldAlert size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '12px', color: '#92400E', lineHeight: '1.4' }}>
              <strong>Operational Consequence:</strong>
              <div style={{ marginTop: '2px' }}>
                Confirming departure assumes personal custody of {dispatchQty} of these {quantity} kits. The Central Resource Ledger will immediately update from <strong>RESERVED</strong> to <strong>IN-TRANSIT</strong>, visible across BMC coordination boards.
              </div>
            </div>
          </div>

          {/* Optional Departure Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Departure Notes / Vehicle ID (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Departed in QRT Van #3 via BKC-Kurla link road"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={handleClose}
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
              type="button"
              onClick={handleConfirmDispatch}
              disabled={isLoading || !isQtyValid}
              style={{
                padding: '9px 18px',
                borderRadius: '6px',
                border: 'none',
                background: isQtyValid ? '#2563EB' : '#94A3B8',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isQtyValid ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isQtyValid ? '0 2px 4px rgba(37, 99, 235, 0.25)' : 'none'
              }}
            >
              <Truck size={15} />
              <span>{isLoading ? 'Confirming...' : `🚚 Mark ${dispatchQty} Kits Dispatched`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
