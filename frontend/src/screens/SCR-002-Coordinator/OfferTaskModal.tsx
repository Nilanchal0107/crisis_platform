import { useEffect, useState } from 'react';
import { Truck, AlertTriangle, ShieldCheck, X, Send } from 'lucide-react';
import { AuthAccountSummary, UserRole } from '@vrl/shared';
import { useOperational } from '../../context/OperationalContext';

interface OfferTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId: number;
  commitmentId: number;
  locationName: string;
  quantity: number;
}

const INSTRUCTION_TEMPLATES = [
  'Priority 1: Immediate relief delivery to flood-affected families. Verify recipient counts and coordinate with community lead Aarav.',
  'Deliver emergency food and medical kits. Report waterlogging obstacles on LBS Marg before proceeding to depot departure.',
  'Urgent medical & dry ration pack delivery. Maintain radio check-in with BMC L-Ward base every 30 minutes.'
];

export const OfferTaskModal = ({
  isOpen,
  onClose,
  incidentId,
  commitmentId,
  locationName,
  quantity
}: OfferTaskModalProps) => {
  const { createTask, isLoading } = useOperational();
  const [responders, setResponders] = useState<AuthAccountSummary[]>([]);
  const [assignedTo, setAssignedTo] = useState('');
  const [instructions, setInstructions] = useState(INSTRUCTION_TEMPLATES[0]);
  const [error, setError] = useState<string | null>(null);

  // Load the live roster of Responder accounts whenever the modal opens, so any
  // seeded/logged-in-capable responder (not just a hardcoded name) can be assigned.
  useEffect(() => {
    if (!isOpen) return;
    fetch(`/api/auth/accounts?role=${UserRole.RESPONDER}`)
      .then((res) => (res.ok ? res.json() : { accounts: [] }))
      .then((data) => {
        const accounts: AuthAccountSummary[] = data.accounts || [];
        setResponders(accounts);
        setAssignedTo((current) => current || accounts[0]?.id || '');
      })
      .catch(() => setResponders([]));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createTask(incidentId, commitmentId, assignedTo, instructions, quantity);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to offer mission to volunteer');
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
        maxWidth: '560px',
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
              <Truck size={20} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                Deploy Field Mission & Offer Task (CMP-020)
              </h3>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                Handover Phase 1: Assign to volunteer without prematurely claiming transit
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

          {/* Target Mission Summary */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '14px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                Target Destination
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                📍 {locationName}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                Committed Stock (Reserved)
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E40AF', marginTop: '2px' }}>
                📦 {quantity} Relief Kits (BKC Depot 1)
              </div>
            </div>
          </div>

          {/* Volunteer Assignment Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Designated Volunteer / Field Responder
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                color: '#0F172A',
                background: '#FFFFFF'
              }}
            >
              {responders.length === 0 && <option value="">Loading responders…</option>}
              {responders.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.display_name}
                </option>
              ))}
            </select>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
              Only this volunteer's own logged-in session can accept the task and confirm depot pickup.
            </div>
          </div>

          {/* Operational Instructions */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Field Deployment Instructions
              </label>
              <span style={{ fontSize: '11px', color: '#64748B' }}>Quick Templates:</span>
            </div>

            {/* Quick Templates */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setInstructions(INSTRUCTION_TEMPLATES[0])}
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
                1. Standard Delivery
              </button>
              <button
                type="button"
                onClick={() => setInstructions(INSTRUCTION_TEMPLATES[1])}
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
                2. Flood Obstacle Check
              </button>
              <button
                type="button"
                onClick={() => setInstructions(INSTRUCTION_TEMPLATES[2])}
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
                3. High Urgency + Radio
              </button>
            </div>

            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter specific instructions, access route notes, or safety warnings..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                color: '#0F172A',
                boxSizing: 'border-box',
                lineHeight: '1.4'
              }}
            />
          </div>

          {/* Differentiator Explanatory Callout */}
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
              <strong>Two-Phase Handover Invariant (Sent ≠ Accepted):</strong>
              <div style={{ marginTop: '2px', color: '#1E3A8A' }}>
                This creates the mission in <strong>OFFERED</strong> status. Stock remains safely in <strong>RESERVED</strong> staging at BKC Depot. Stock will only shift to <strong>IN-TRANSIT</strong> when the assigned volunteer explicitly accepts and confirms physical departure.
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
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
              disabled={isLoading || instructions.trim().length < 5 || !assignedTo}
              style={{
                padding: '9px 18px',
                borderRadius: '6px',
                border: 'none',
                background: '#2563EB',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)'
              }}
            >
              <Send size={15} />
              <span>{isLoading ? 'Deploying...' : 'Send Mission Offer (OFFERED)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
