import { useState } from 'react';
import { SourceReport, ReportStatus, IncidentStatus } from '@vrl/shared';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

interface VectorSchematicMapProps {
  reports: (SourceReport & {
    canonical_id?: number | null;
  })[];
  resourcePool: any;
  selectedReportId: number | null;
  onSelectReport: (id: number) => void;
  canonicalIncidents?: any[];
}

export const VectorSchematicMap = ({
  reports,
  resourcePool,
  selectedReportId,
  onSelectReport,
  canonicalIncidents = []
}: VectorSchematicMapProps) => {
  const [zoom, setZoom] = useState(1);
  const [hoveredItem, setHoveredItem] = useState<{
    title: string;
    subtitle: string;
    details: string[];
    x: number;
    y: number;
  } | null>(null);

  // Geographic bounds for Kurla West L-Ward SVG projection
  // Lat: 19.0520 (bottom) to 19.0780 (top) -> dy = 0.026
  // Lng: 72.8520 (left) to 72.8950 (right) -> dx = 0.043
  // SVG Canvas: 800 x 600
  const projectCoords = (lat: number, lng: number) => {
    const minLat = 19.0520;
    const maxLat = 19.0780;
    const minLng = 72.8520;
    const maxLng = 72.8950;

    const x = ((lng - minLng) / (maxLng - minLng)) * 760 + 20;
    const y = 580 - ((lat - minLat) / (maxLat - minLat)) * 540;
    return { x, y };
  };

  const depotCoords = projectCoords(19.0600, 72.8680); // BKC Relief Base

  // Mithi River curve points
  const riverPoints = [
    projectCoords(19.0760, 72.8880),
    projectCoords(19.0712, 72.8834), // Bail Bazar
    projectCoords(19.0657, 72.8793), // Kranti Nagar Bridge
    projectCoords(19.0630, 72.8720), // Mithi Bridge LBS
    projectCoords(19.0595, 72.8630), // BKC edge
    projectCoords(19.0540, 72.8550)  // Mahim Bay discharge
  ];
  const riverPathData = `M ${riverPoints.map((p) => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      background: '#0F172A',
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      {/* Zoom / Reset Floating Controls */}
      <div style={{
        position: 'absolute',
        top: '14px',
        right: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        zIndex: 20
      }}>
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.2, 1.8))}
          title="Zoom In"
          style={{
            background: '#1E293B',
            color: '#FFFFFF',
            border: '1px solid #334155',
            borderRadius: '6px',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.2, 0.8))}
          title="Zoom Out"
          style={{
            background: '#1E293B',
            color: '#FFFFFF',
            border: '1px solid #334155',
            borderRadius: '6px',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={() => setZoom(1)}
          title="Reset View"
          style={{
            background: '#1E293B',
            color: '#FFFFFF',
            border: '1px solid #334155',
            borderRadius: '6px',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* SVG Map Canvas */}
      <svg
        viewBox="0 0 800 600"
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease-out'
        }}
      >
        <defs>
          {/* River Water Gradient */}
          <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0369A1" stopOpacity="0.9" />
          </linearGradient>

          {/* Grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.75" />
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect width="800" height="600" fill="url(#grid)" />

        {/* Kurla Ward Boundary Outline */}
        <path
          d="M 60,60 L 740,40 L 760,540 L 140,560 Z"
          fill="#1E293B"
          fillOpacity="0.25"
          stroke="#334155"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Road Corridors */}
        {/* LBS Marg (Diagonal Arterial Road) */}
        <line x1="80" y1="520" x2="720" y2="100" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
        <line x1="80" y1="520" x2="720" y2="100" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" />
        <text x="640" y="140" fill="#64748B" fontSize="10" fontFamily="monospace" transform="rotate(-30, 640, 140)">
          LBS MARG ARTERIAL
        </text>

        {/* CST Road / SCLR (Cross link) */}
        <line x1="160" y1="200" x2="680" y2="480" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
        <text x="320" y="320" fill="#64748B" fontSize="9" fontFamily="monospace" transform="rotate(28, 320, 320)">
          CST ROAD / SCLR LINK
        </text>

        {/* Mithi River Flood Basin Hazard Zone */}
        {/* Buffered flood zone ribbon */}
        <path
          d={riverPathData}
          fill="none"
          stroke="#0284C7"
          strokeWidth="32"
          strokeOpacity="0.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Main active watercourse */}
        <path
          d={riverPathData}
          fill="none"
          stroke="url(#riverGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Water flow center dash */}
        <path
          d={riverPathData}
          fill="none"
          stroke="#7DD3FC"
          strokeWidth="2"
          strokeDasharray="8 6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
        <text x="280" y="420" fill="#38BDF8" fontSize="11" fontWeight="700" letterSpacing="1px" transform="rotate(-38, 280, 420)">
          🌊 MITHI RIVER MONSOON FLOOD CHANNEL
        </text>

        {/* Landmarks */}
        <text x="100" y="550" fill="#475569" fontSize="10" fontWeight="600">
          BANDRA KURLA COMPLEX (BKC)
        </text>
        <text x="560" y="80" fill="#475569" fontSize="10" fontWeight="600">
          KURLA WEST ARTERIAL SECTOR
        </text>

        {/* BKC Relief Base Depot (Navy Triangle Marker) */}
        <g
          transform={`translate(${depotCoords.x}, ${depotCoords.y})`}
          style={{ cursor: 'pointer' }}
          onMouseEnter={() =>
            setHoveredItem({
              title: resourcePool?.depot_name || 'BKC Relief Base (Depot 1)',
              subtitle: 'Primary Disaster Relief Inventory Depot',
              details: [
                `Available Stock: ${resourcePool?.available_quantity ?? 8} Kits`,
                `In Transit: ${resourcePool?.in_transit_quantity ?? 0} Kits`,
                `Delivered: ${resourcePool?.delivered_quantity ?? 12} Kits`,
                `Total Stock: ${resourcePool?.total_quantity ?? 20} Kits (Conserved)`
              ],
              x: depotCoords.x,
              y: depotCoords.y - 15
            })
          }
          onMouseLeave={() => setHoveredItem(null)}
        >
          {/* Pulsing ring */}
          <polygon
            points="0,-24 20,12 -20,12"
            fill="none"
            stroke="#60A5FA"
            strokeWidth="1.5"
            opacity="0.6"
          />
          {/* Main Triangle Marker */}
          <polygon
            points="0,-18 16,10 -16,10"
            fill="#1E40AF"
            stroke="#93C5FD"
            strokeWidth="2"
          />
          {/* Depot Icon Symbol inside */}
          <circle cx="0" cy="2" r="4" fill="#FFFFFF" />
          <text x="0" y="24" textAnchor="middle" fill="#93C5FD" fontSize="10" fontWeight="800" fontFamily="monospace">
            BKC DEPOT 1
          </text>
          <text x="0" y="36" textAnchor="middle" fill="#60A5FA" fontSize="9" fontWeight="700">
            📦 {resourcePool?.available_quantity ?? 8} Avail
          </text>
        </g>

        {/* Community Reports / Incidents Markers */}
        {reports.map((r) => {
          const pt = projectCoords(r.latitude, r.longitude);
          const isSelected = r.id === selectedReportId;
          const canonical = r.canonical_id
            ? canonicalIncidents.find((i: any) => i.id === r.canonical_id)
            : null;

          const isPartiallyResolved = canonical?.status === IncidentStatus.PARTIALLY_RESOLVED;
          const isVerified = r.status === ReportStatus.LINKED_TO_INCIDENT;
          const isRejected = r.status === ReportStatus.REJECTED;

          const markerColor = isPartiallyResolved
            ? '#F59E0B' // Amber / Orange
            : isVerified
            ? '#10B981' // Green
            : isRejected
            ? '#EF4444' // Red
            : '#FBBF24'; // Yellow (Submitted)

          return (
            <g
              key={r.id}
              transform={`translate(${pt.x}, ${pt.y})`}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectReport(r.id)}
              onMouseEnter={() =>
                setHoveredItem({
                  title: `${r.reference_code}: ${r.location_name}`,
                  subtitle: `${r.incident_type.replace('_', ' ')} • Severity: ${r.reporter_severity}`,
                  details: [
                    `Status: ${isPartiallyResolved ? 'PARTIALLY RESOLVED' : r.status}`,
                    `Coordinates: [${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}]`,
                    `Description: "${r.description.slice(0, 50)}..."`
                  ],
                  x: pt.x,
                  y: pt.y - 15
                })
              }
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Pulsing Selection Halo */}
              {isSelected && (
                <circle
                  r="22"
                  fill="none"
                  stroke="#60A5FA"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  opacity="0.9"
                />
              )}

              {/* Status Glow */}
              <circle
                r="16"
                fill={markerColor}
                fillOpacity="0.25"
              />

              {/* Main Circle Marker */}
              <circle
                r="10"
                fill={markerColor}
                stroke="#FFFFFF"
                strokeWidth={isSelected ? 3 : 2}
              />

              {/* Inner Dot */}
              <circle r="3" fill="#FFFFFF" />

              {/* Label */}
              <rect
                x="-36"
                y="14"
                width="72"
                height="16"
                rx="4"
                fill="#0F172A"
                stroke={isSelected ? '#60A5FA' : '#334155'}
                strokeWidth="1"
              />
              <text
                x="0"
                y="26"
                textAnchor="middle"
                fill={isSelected ? '#60A5FA' : '#E2E8F0'}
                fontSize="9"
                fontWeight="700"
                fontFamily="monospace"
              >
                {r.reference_code}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Telemetry Tooltip */}
      {hoveredItem && (
        <div style={{
          position: 'absolute',
          left: `${Math.min(Math.max(hoveredItem.x, 20), 580)}px`,
          top: `${Math.max(hoveredItem.y - 90, 10)}px`,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(4px)',
          border: '1px solid #38BDF8',
          borderRadius: '8px',
          padding: '10px 14px',
          color: '#FFFFFF',
          fontSize: '11px',
          pointerEvents: 'none',
          zIndex: 30,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
          minWidth: '220px'
        }}>
          <div style={{ fontWeight: 700, fontSize: '12px', color: '#38BDF8' }}>
            {hoveredItem.title}
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '6px' }}>
            {hoveredItem.subtitle}
          </div>
          {hoveredItem.details.map((d, i) => (
            <div key={i} style={{ color: '#E2E8F0', marginTop: '2px' }}>
              &bull; {d}
            </div>
          ))}
        </div>
      )}

      {/* Bottom Map Legend */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(4px)',
        border: '1px solid #334155',
        borderRadius: '6px',
        padding: '8px 12px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        fontSize: '11px',
        color: '#E2E8F0',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderBottom: '10px solid #1E40AF'
          }} />
          <span>BKC Depot 1</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#FBBF24' }} />
          <span>Under Review</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10B981' }} />
          <span>Verified / Active</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#F59E0B' }} />
          <span>Partially Resolved</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '16px', height: '4px', background: '#0284C7', borderRadius: '2px' }} />
          <span>Mithi River Zone</span>
        </div>
      </div>
    </div>
  );
};
