import { useState } from 'react';
import { useOperational } from '../../context/OperationalContext';
import { IntakeForm } from './IntakeForm';
import { ReceiptCard } from './ReceiptCard';
import { ReportHistory } from './ReportHistory';
import { Search, Plus, ShieldCheck, AlertCircle } from 'lucide-react';

export const ReporterScreen: React.FC = () => {
  const {
    session,
    currentReportRef,
    setCurrentReportRef,
    publicReport,
    submitReport,
    addClarification,
    lookupReport,
    myReports,
    isLoading
  } = useOperational();

  const [lookupInput, setLookupInput] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupInput.trim()) return;
    setLookupError(null);

    const formatted = lookupInput.trim().toUpperCase();
    const found = await lookupReport(formatted);
    if (!found) {
      setLookupError(`No report found matching "${formatted}". Check your reference code.`);
    } else {
      setLookupInput('');
    }
  };

  const handleResetToNew = () => {
    setCurrentReportRef(null);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Lookup Bar */}
      <div style={{
        background: '#FFFFFF',
        padding: '16px 20px',
        borderRadius: '10px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Community Emergency Intake
            </h2>
            <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <ShieldCheck size={14} color="#059669" />
              <span>Direct immutable submission to BMC Disaster Operations (L-Ward)</span>
            </div>
          </div>

          {currentReportRef && (
            <button
              onClick={handleResetToNew}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #BFDBFE',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Plus size={14} />
              <span>Report New Incident</span>
            </button>
          )}
        </div>

        {/* Reference Lookup Form */}
        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Track existing report (e.g. REF-8921-A)..."
              value={lookupInput}
              onChange={(e) => {
                setLookupInput(e.target.value);
                setLookupError(null);
              }}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94A3B8' }} />
          </div>
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Track Status
          </button>
        </form>

        {lookupError && (
          <div style={{ marginTop: '8px', color: '#DC2626', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={13} />
            <span>{lookupError}</span>
          </div>
        )}
      </div>

      {/* Report History — only for a signed-in identity (Sign In / Log In). Quick Report
          submits as the shared anonymous 'guest' actor, so there's no personal history
          to show; the backend refuses that request too. */}
      {session && (
        <ReportHistory
          reports={myReports}
          activeRef={currentReportRef}
          onSelect={async (ref) => {
            const found = await lookupReport(ref);
            if (!found) setLookupError(`Could not load report "${ref}". Try again.`);
          }}
        />
      )}

      {/* Main View: State A (Form) or State B (Receipt) */}
      <div style={{
        background: '#FFFFFF',
        padding: '24px',
        borderRadius: '10px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        {currentReportRef && publicReport ? (
          <ReceiptCard
            report={publicReport}
            onAddClarification={async (ref, msg) => {
              await addClarification(ref, msg);
            }}
            onResetToNewReport={handleResetToNew}
            isLoading={isLoading}
          />
        ) : (
          <IntakeForm
            onSubmit={async (dto) => {
              await submitReport(dto);
            }}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};
