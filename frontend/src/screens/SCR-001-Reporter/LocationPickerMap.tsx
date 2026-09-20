import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MUMBAI_SCENARIO } from '@vrl/shared';

interface LocationPickerMapProps {
  latitude: number | null;
  longitude: number | null;
  onPick: (lat: number, lng: number) => void;
}

const PIN_HTML = `
  <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
    <div style="
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #2563EB;
      border: 3px solid #FFFFFF;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    "></div>
    <div style="width: 2px; height: 10px; background: #2563EB; margin-top: -2px;"></div>
  </div>
`;

// Click-to-pin location picker for the Reporter intake form. Kept deliberately simple
// (single draggable pin, no incident/depot layers) — unlike OperationalMap.tsx, this
// isn't a tactical view, just a way to set latitude/longitude without typing numbers.
export const LocationPickerMap = ({ latitude, longitude, onPick }: LocationPickerMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [MUMBAI_SCENARIO.centerCoordinates.lat, MUMBAI_SCENARIO.centerCoordinates.lng],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      onPickRef.current(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Keep the pin in sync with externally-driven changes too (preset buttons, GPS button,
  // or manual lat/lng typing), not just clicks/drags originating on the map itself.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (latitude == null || longitude == null) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    if (!markerRef.current) {
      const icon = L.divIcon({
        html: PIN_HTML,
        className: 'vrl-location-pin',
        iconSize: [24, 30],
        iconAnchor: [12, 26]
      });
      const marker = L.marker([latitude, longitude], { icon, draggable: true });
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onPickRef.current(Number(pos.lat.toFixed(5)), Number(pos.lng.toFixed(5)));
      });
      marker.addTo(map);
      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng([latitude, longitude]);
    }

    map.setView([latitude, longitude], Math.max(map.getZoom(), 15), { animate: true });
  }, [latitude, longitude]);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '220px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1' }}
      />
      {latitude == null && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(248, 250, 252, 0.8)',
          fontSize: '12px',
          fontWeight: 600,
          color: '#475569',
          textAlign: 'center',
          padding: '0 20px',
          pointerEvents: 'none'
        }}>
          Tap the map to drop a pin at the incident location
        </div>
      )}
    </div>
  );
};
