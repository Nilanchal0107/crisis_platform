import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SourceReport, ReportStatus, IncidentStatus } from '@vrl/shared';
import { VectorSchematicMap } from './VectorSchematicMap';
import { Crosshair } from 'lucide-react';

interface OperationalMapProps {
  reports: (SourceReport & {
    canonical_id?: number | null;
  })[];
  resourcePool: any;
  selectedReportId: number | null;
  onSelectReport: (id: number) => void;
  canonicalIncidents?: any[];
}

export const OperationalMap = ({
  reports,
  resourcePool,
  selectedReportId,
  onSelectReport,
  canonicalIncidents = []
}: OperationalMapProps) => {
  const [mapMode, setMapMode] = useState<'TILES' | 'VECTOR'>('TILES');
  const [tileError, setTileError] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize and update Leaflet map
  useEffect(() => {
    if (mapMode !== 'TILES' || !mapContainerRef.current) return;

    // Center coordinates: Kurla West & Mithi River Basin
    const centerLat = 19.0657;
    const centerLng = 72.8793;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: false
      });

      // Add zoom control at top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Tile Layer with Error Listener
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      });

      tileLayer.on('tileerror', () => {
        console.warn('[OperationalMap] Leaflet tile loading error detected.');
        setTileError(true);
      });

      tileLayer.addTo(map);

      // Mithi River Hazard Channel Polyline
      const riverCoords: [number, number][] = [
        [19.0540, 72.8550],
        [19.0595, 72.8630],
        [19.0620, 72.8680],
        [19.0645, 72.8750],
        [19.0657, 72.8793], // Kranti Nagar
        [19.0712, 72.8834], // Bail Bazar
        [19.0760, 72.8880]
      ];

      // Buffer flood zone ribbon
      L.polyline(riverCoords, {
        color: '#0284C7',
        weight: 24,
        opacity: 0.25,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Core river polyline
      const riverLine = L.polyline(riverCoords, {
        color: '#0284C7',
        weight: 6,
        opacity: 0.9,
        dashArray: '8, 6'
      }).addTo(map);

      riverLine.bindTooltip('🌊 Mithi River Monsoon Flood Channel (High Surge Risk)', {
        permanent: false,
        direction: 'top'
      });

      // Layer group for dynamic markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // 1. Render BKC Relief Base Depot (Navy Triangle)
    const depotLat = 19.0600;
    const depotLng = 72.8680;

    const depotHtml = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="
          width: 0;
          height: 0;
          border-left: 14px solid transparent;
          border-right: 14px solid transparent;
          border-bottom: 24px solid #1E40AF;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        "></div>
        <div style="
          background: #1E3A8A;
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
          margin-top: 2px;
          border: 1px solid #93C5FD;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          BKC DEPOT (${resourcePool?.available_quantity ?? 8} Avail)
        </div>
      </div>
    `;

    const depotIcon = L.divIcon({
      html: depotHtml,
      className: 'vrl-depot-marker',
      iconSize: [80, 48],
      iconAnchor: [40, 24]
    });

    const depotMarker = L.marker([depotLat, depotLng], { icon: depotIcon });
    depotMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; min-width: 180px;">
        <div style="font-weight: 800; color: #1E3A8A; font-size: 13px;">${resourcePool?.depot_name || 'BKC Relief Base (Depot 1)'}</div>
        <div style="color: #64748B; font-size: 11px; margin-bottom: 6px;">Primary Physical Inventory Warehouse</div>
        <div style="background: #EFF6FF; padding: 6px 8px; border-radius: 4px; border: 1px solid #BFDBFE;">
          <div>Available: <strong>${resourcePool?.available_quantity ?? 8} Kits</strong></div>
          <div>In Transit: <strong>${resourcePool?.in_transit_quantity ?? 0} Kits</strong></div>
          <div>Delivered: <strong>${resourcePool?.delivered_quantity ?? 12} Kits</strong></div>
          <div>Total Stock: <strong>${resourcePool?.total_quantity ?? 20} Kits (Conserved)</strong></div>
        </div>
      </div>
    `);
    markersLayer.addLayer(depotMarker);

    // 2. Render Incident Markers
    reports.forEach((r) => {
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
        ? '#10B981' // Emerald Green
        : isRejected
        ? '#EF4444' // Red
        : '#FBBF24'; // Yellow (Submitted)

      const incidentHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          ${isSelected ? `
            <div style="
              position: absolute;
              top: -6px;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 2.5px dashed #2563EB;
              animation: spin 6s linear infinite;
            "></div>
          ` : ''}
          <div style="
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${markerColor};
            border: 2.5px solid #FFFFFF;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: #FFFFFF;"></div>
          </div>
          <div style="
            background: #0F172A;
            color: ${isSelected ? '#60A5FA' : '#FFFFFF'};
            font-size: 9px;
            font-weight: 700;
            font-family: monospace;
            padding: 1px 5px;
            border-radius: 3px;
            white-space: nowrap;
            margin-top: 2px;
            border: 1px solid ${isSelected ? '#60A5FA' : '#334155'};
          ">
            ${r.reference_code}
          </div>
        </div>
      `;

      const incidentIcon = L.divIcon({
        html: incidentHtml,
        className: 'vrl-incident-marker',
        iconSize: [60, 36],
        iconAnchor: [30, 10]
      });

      const marker = L.marker([r.latitude, r.longitude], { icon: incidentIcon });
      marker.on('click', () => {
        onSelectReport(r.id);
      });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; min-width: 200px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-family: monospace; font-weight: 800; color: #1E40AF;">${r.reference_code}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${markerColor}20; color: ${markerColor};">
              ${isPartiallyResolved ? 'PARTIALLY RESOLVED' : r.status}
            </span>
          </div>
          <div style="font-weight: 700; color: #0F172A; font-size: 13px;">${r.location_name}</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 2px;">${r.incident_type.replace('_', ' ')} • Severity: <strong>${r.reporter_severity}</strong></div>
          <div style="margin-top: 6px; font-size: 11px; color: #334155; font-style: italic; background: #F8FAFC; padding: 4px 6px; border-radius: 4px;">
            "${r.description}"
          </div>
        </div>
      `);

      markersLayer.addLayer(marker);
    });

    return () => {
      // Keep map instance during hot re-renders
    };
  }, [mapMode, reports, selectedReportId, resourcePool, canonicalIncidents]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([19.0657, 72.8793], 14, { animate: true });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top Map HUD Controls Strip */}
      <div style={{
        padding: '10px 16px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
            GIS Tactical View:
          </span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Kurla West L-Ward & Mithi River Basin
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '2px', borderRadius: '6px' }}>
            <button
              onClick={() => setMapMode('TILES')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                background: mapMode === 'TILES' ? '#FFFFFF' : 'transparent',
                color: mapMode === 'TILES' ? '#0F172A' : '#64748B',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: mapMode === 'TILES' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              🛰️ Map Tiles (OSM)
            </button>
            <button
              onClick={() => setMapMode('VECTOR')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                background: mapMode === 'VECTOR' ? '#FFFFFF' : 'transparent',
                color: mapMode === 'VECTOR' ? '#0F172A' : '#64748B',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: mapMode === 'VECTOR' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              📐 Vector Schematic (Fallback)
            </button>
          </div>

          {mapMode === 'TILES' && (
            <button
              onClick={handleRecenter}
              title="Recenter on Kurla West"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              <Crosshair size={13} />
              <span>Center</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map View Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {mapMode === 'VECTOR' || tileError ? (
          <VectorSchematicMap
            reports={reports}
            resourcePool={resourcePool}
            selectedReportId={selectedReportId}
            onSelectReport={onSelectReport}
            canonicalIncidents={canonicalIncidents}
          />
        ) : (
          <div
            ref={mapContainerRef}
            style={{ width: '100%', height: '100%', background: '#F1F5F9' }}
          />
        )}
      </div>
    </div>
  );
};
