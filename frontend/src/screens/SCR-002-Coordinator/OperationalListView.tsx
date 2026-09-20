import { useState } from 'react';
import { SourceReport, ReportStatus } from '@vrl/shared';
import {
  Search,
  MapPin,
  Package,
  Truck,
  Clock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface OperationalListViewProps {
  reports: (SourceReport & {
    canonical_id?: number | null;
    clarifications_count: number;
  })[];
  selectedReportId: number | null;
  onSelectReport: (id: number) => void;
  commitments: any[];
  tasks: any[];
}

export const OperationalListView = ({
  reports,
  selectedReportId,
  onSelectReport,
  commitments,
  tasks
}: OperationalListViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const filtered = reports.filter((r) => {
    if (statusFilter === 'SUBMITTED' && r.status !== ReportStatus.SUBMITTED) return false;
    if (statusFilter === 'VERIFIED' && r.status !== ReportStatus.LINKED_TO_INCIDENT) return false;
    if (statusFilter === 'REJECTED' && r.status !== ReportStatus.REJECTED) return false;

    if (severityFilter !== 'ALL' && r.reporter_severity !== severityFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        r.reference_code.toLowerCase().includes(q) ||
        r.location_name.toLowerCase().includes(q) ||
        r.incident_type.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Controls Strip */}
      <div style={{
        padding: '12px 16px',
        background: '#F8FAFC',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{
          flex: 1,
          minWidth: '200px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '6px',
          padding: '6px 10px'
        }}>
          <Search size={14} color="#64748B" />
          <input
            type="text"
            placeholder="Search code, location, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '12px',
              width: '100%',
              background: 'transparent'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              fontSize: '12px',
              background: '#FFFFFF',
              color: '#334155'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Under Review</option>
            <option value="VERIFIED">Verified / Promoted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              fontSize: '12px',
              background: '#FFFFFF',
              color: '#334155'
            }}
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', color: '#475569', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>
              <th style={{ padding: '10px 14px' }}>Reference</th>
              <th style={{ padding: '10px 14px' }}>Location & Type</th>
              <th style={{ padding: '10px 14px' }}>Severity</th>
              <th style={{ padding: '10px 14px' }}>Status</th>
              <th style={{ padding: '10px 14px' }}>Resource Custody</th>
              <th style={{ padding: '10px 14px' }}>Assigned Volunteer</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>
                  No operational records found matching filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const isSelected = r.id === selectedReportId;
                const commitment = r.canonical_id
                  ? commitments.find((c: any) => c.incident_id === r.canonical_id)
                  : null;
                const task = commitment
                  ? tasks.find((t: any) => t.commitment_id === commitment.id)
                  : null;

                const isSubmitted = r.status === ReportStatus.SUBMITTED;
                const isVerified = r.status === ReportStatus.LINKED_TO_INCIDENT;

                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelectReport(r.id)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      background: isSelected ? '#EFF6FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                  >
                    {/* Reference */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: '#1E40AF',
                        background: '#DBEAFE',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {r.reference_code}
                      </span>
                    </td>

                    {/* Location & Type */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{r.location_name}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <MapPin size={11} />
                        <span>{r.incident_type.replace('_', ' ')}</span>
                      </div>
                    </td>

                    {/* Severity */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: r.reporter_severity === 'CRITICAL' ? '#FEE2E2' : '#FEF3C7',
                        color: r.reporter_severity === 'CRITICAL' ? '#DC2626' : '#92400E'
                      }}>
                        {r.reporter_severity}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: isSubmitted
                          ? '#FEF3C7'
                          : isVerified
                          ? '#ECFDF5'
                          : '#FEF2F2',
                        color: isSubmitted
                          ? '#92400E'
                          : isVerified
                          ? '#065F46'
                          : '#991B1B',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {isSubmitted && <Clock size={12} />}
                        {isVerified && <ShieldCheck size={12} />}
                        <span>{isSubmitted ? 'UNDER REVIEW' : isVerified ? 'VERIFIED' : 'REJECTED'}</span>
                      </span>
                    </td>

                    {/* Resource Custody */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      {commitment ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Package size={14} color="#1E40AF" />
                          <span style={{ fontWeight: 700, color: '#1E40AF' }}>
                            {commitment.quantity} Relief Kits
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Unallocated</span>
                      )}
                    </td>

                    {/* Assigned Volunteer */}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      {task ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Truck size={14} color="#7E22CE" />
                          <span style={{ color: '#475569', fontWeight: 600 }}>
                            {task.assigned_to_name || 'Chetan (Volunteer)'}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReport(r.id);
                        }}
                        style={{
                          background: isSelected ? '#1E40AF' : '#F1F5F9',
                          color: isSelected ? '#FFFFFF' : '#334155',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>Inspect</span>
                        <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info Strip */}
      <div style={{
        padding: '8px 16px',
        background: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11px',
        color: '#64748B'
      }}>
        <span>Showing {filtered.length} of {reports.length} total operational records</span>
        <span style={{ fontFamily: 'monospace' }}>FR-024 Tabular Operational Grid &bull; 100% Deterministic State</span>
      </div>
    </div>
  );
};
