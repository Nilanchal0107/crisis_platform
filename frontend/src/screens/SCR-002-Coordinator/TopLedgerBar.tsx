import { useState } from 'react';
import { useOperational } from '../../context/OperationalContext';
import { Package, ShieldCheck, Database, Layers, Boxes } from 'lucide-react';
import { AdjustStockModal } from './AdjustStockModal';

export const TopLedgerBar = () => {
  const { resourcePool, conservation, isSyncing, lastUpdated } = useOperational();
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  const available = resourcePool ? resourcePool.available_quantity : conservation.available;
  const reserved = resourcePool ? resourcePool.reserved_quantity : conservation.reserved;
  const inTransit = resourcePool ? resourcePool.in_transit_quantity : conservation.in_transit;
  const delivered = resourcePool ? resourcePool.delivered_quantity : conservation.delivered;
  const total = resourcePool ? resourcePool.total_quantity : conservation.total;

  return (
    <div style={{
      background: '#0F172A',
      color: '#FFFFFF',
      padding: '12px 20px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Depot Identification & Provenance */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: '#1E293B',
          padding: '8px',
          borderRadius: '6px',
          display: 'flex',
          border: '1px solid #334155'
        }}>
          <Package size={20} color="#60A5FA" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#F8FAFC' }}>
              BKC Relief Base (Depot 1)
            </span>
            <span style={{
              fontSize: '10px',
              background: '#1E293B',
              color: '#94A3B8',
              padding: '2px 6px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              border: '1px solid #334155'
            }}>
              SYNTHETIC_FIXTURE
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Database size={11} />
            <span>Monsoon Flood Emergency Relief Kits (20 Pack Pool)</span>
          </div>
        </div>
        <button
          onClick={() => setIsAdjustOpen(true)}
          title="Add a new shipment or write off damaged/expired stock"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#1E293B',
            border: '1px solid #334155',
            color: '#E2E8F0',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Boxes size={13} />
          <span>Adjust Stock</span>
        </button>
      </div>

      {/* 4 Conservation Counters & System Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Available Counter */}
        <div style={{
          background: available > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: available > 0 ? '1px solid #059669' : '1px solid #DC2626',
          borderRadius: '6px',
          padding: '6px 12px',
          minWidth: '85px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: available > 0 ? '#34D399' : '#F87171', textTransform: 'uppercase' }}>
            Available
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: available > 0 ? '#10B981' : '#EF4444' }}>
            {available} <span style={{ fontSize: '10px', fontWeight: 500 }}>KITS</span>
          </div>
        </div>

        {/* Reserved Counter */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid #2563EB',
          borderRadius: '6px',
          padding: '6px 12px',
          minWidth: '85px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#93C5FD', textTransform: 'uppercase' }}>
            Reserved
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#60A5FA' }}>
            {reserved} <span style={{ fontSize: '10px', fontWeight: 500 }}>KITS</span>
          </div>
        </div>

        {/* In-Transit Counter */}
        <div style={{
          background: 'rgba(168, 85, 247, 0.15)',
          border: '1px solid #9333EA',
          borderRadius: '6px',
          padding: '6px 12px',
          minWidth: '85px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#D8B4FE', textTransform: 'uppercase' }}>
            In-Transit
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#C084FC' }}>
            {inTransit} <span style={{ fontSize: '10px', fontWeight: 500 }}>KITS</span>
          </div>
        </div>

        {/* Delivered Counter */}
        <div style={{
          background: 'rgba(100, 116, 139, 0.2)',
          border: '1px solid #475569',
          borderRadius: '6px',
          padding: '6px 12px',
          minWidth: '85px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#CBD5E1', textTransform: 'uppercase' }}>
            Delivered
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#F1F5F9' }}>
            {delivered} <span style={{ fontSize: '10px', fontWeight: 500 }}>KITS</span>
          </div>
        </div>

        {/* Conservation Invariant Badge */}
        <div style={{
          marginLeft: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          borderLeft: '1px solid #334155',
          paddingLeft: '14px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#10B981',
            fontSize: '12px',
            fontWeight: 700
          }}>
            <ShieldCheck size={14} />
            <span>Mass Conserved</span>
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={11} />
            <span>Sum: {available + reserved + inTransit + delivered}/{total}</span>
          </div>
        </div>

        {/* Live Sync 3s Badge */}
        <div style={{
          marginLeft: '4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          borderLeft: '1px solid #334155',
          paddingLeft: '14px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 600,
            color: isSyncing ? '#60A5FA' : '#94A3B8'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: isSyncing ? '#3B82F6' : '#10B981',
              boxShadow: isSyncing ? '0 0 8px #3B82F6' : '0 0 4px #10B981',
              display: 'inline-block'
            }} />
            <span>{isSyncing ? 'Syncing...' : 'Live Sync 3s'}</span>
          </div>
          <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px', fontFamily: 'monospace' }}>
            {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      <AdjustStockModal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        poolId={resourcePool?.id ?? 1}
        depotName={resourcePool?.depot_name ?? 'BKC Relief Base (Depot 1)'}
        availableQuantity={available}
      />
    </div>
  );
};
