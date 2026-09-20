import { useState } from 'react';
import {
  IncidentType,
  ReporterSeverity,
  KURLA_LOCATION_PRESETS,
  CreateReportDTO
} from '@vrl/shared';
import { MapPin, Navigation, Send, AlertCircle } from 'lucide-react';
import { LocationPickerMap } from './LocationPickerMap';

interface IntakeFormProps {
  onSubmit: (dto: CreateReportDTO) => Promise<void>;
  isLoading: boolean;
}

export const IntakeForm: React.FC<IntakeFormProps> = ({ onSubmit, isLoading }) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [incidentType, setIncidentType] = useState<IncidentType>(IncidentType.FLOOD);
  const [severity, setSeverity] = useState<ReporterSeverity>(ReporterSeverity.HIGH);
  const [description, setDescription] = useState('');
  const [contactSafe, setContactSafe] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const found = KURLA_LOCATION_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setLocationName(found.name);
      setLatitude(found.latitude);
      setLongitude(found.longitude);
    }
  };

  const handleMapPick = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setSelectedPreset('');
    setLocationName((current) => current.trim() ? current : `Pinned Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
  };

  const handleGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(4)));
          setLongitude(Number(pos.coords.longitude.toFixed(4)));
          setLocationName(`Current GPS (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)})`);
          setSelectedPreset('');
        },
        () => {
          // Fallback to Kurla West coordinates if GPS denied
          setLatitude(19.0657);
          setLongitude(72.8793);
          setLocationName('Kranti Nagar, Kurla West (Fallback)');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!locationName.trim()) {
      setError('Please provide a location name');
      return;
    }
    if (latitude == null || longitude == null) {
      setError('Please set a location: tap the map, pick a hotspot preset, or use GPS.');
      return;
    }
    if (!description.trim() || description.length < 5) {
      setError('Description must be at least 5 characters');
      return;
    }

    try {
      await onSubmit({
        location_name: locationName,
        latitude,
        longitude,
        incident_type: incidentType,
        reporter_severity: severity,
        description,
        contact_safe: contactSafe
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #F87171',
          padding: '12px 16px',
          borderRadius: '8px',
          color: '#991B1B',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Preset Hotspots */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
          📍 Mumbai L-Ward Hotspots (1-Click Presets)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '8px' }}>
          {KURLA_LOCATION_PRESETS.map((p) => {
            const isSelected = selectedPreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetSelect(p.id)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: isSelected ? '2px solid #2563EB' : '1px solid #CBD5E1',
                  background: isSelected ? '#EFF6FF' : '#F8FAFC',
                  color: isSelected ? '#1E40AF' : '#475569',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div>{p.name.split('(')[0]}</div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>
                  {p.latitude}, {p.longitude}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Location Details & Coordinates */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
            Location Name / Landmark *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={locationName}
              onChange={(e) => {
                setLocationName(e.target.value);
                setSelectedPreset('');
              }}
              required
              placeholder="e.g. Kranti Nagar, Kurla West"
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748B' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
            Pin the Location on the Map
          </label>
          <LocationPickerMap latitude={latitude} longitude={longitude} onPick={handleMapPick} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={latitude ?? ''}
              placeholder="Tap map ↑"
              onChange={(e) => {
                const parsed = parseFloat(e.target.value);
                setLatitude(Number.isNaN(parsed) ? null : parsed);
                setSelectedPreset('');
              }}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={longitude ?? ''}
              placeholder="Tap map ↑"
              onChange={(e) => {
                const parsed = parseFloat(e.target.value);
                setLongitude(Number.isNaN(parsed) ? null : parsed);
                setSelectedPreset('');
              }}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleGeolocation}
            title="Detect GPS Location"
            style={{
              padding: '8px 12px',
              height: '37px',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              background: '#F1F5F9',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Navigation size={14} />
            <span>GPS</span>
          </button>
        </div>
      </div>

      {/* Incident Type & Severity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Incident Category *
          </label>
          <select
            value={incidentType}
            onChange={(e) => setIncidentType(e.target.value as IncidentType)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontSize: '14px',
              background: '#FFFFFF'
            }}
          >
            <option value={IncidentType.FLOOD}>🌊 Monsoon Flood</option>
            <option value={IncidentType.STRUCTURAL_DAMAGE}>🏚️ Structural Damage</option>
            <option value={IncidentType.MEDICAL_EMERGENCY}>🚑 Medical Emergency</option>
            <option value={IncidentType.ROAD_BLOCKAGE}>🚧 Road Blockage</option>
            <option value={IncidentType.SUPPLY_SHORTAGE}>📦 Supply Shortage</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Observed Severity *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
            {(
              [
                { val: ReporterSeverity.LOW, label: 'Low', color: '#10B981', bg: '#ECFDF5' },
                { val: ReporterSeverity.MEDIUM, label: 'Med', color: '#3B82F6', bg: '#EFF6FF' },
                { val: ReporterSeverity.HIGH, label: 'High', color: '#F59E0B', bg: '#FFFBEB' },
                { val: ReporterSeverity.CRITICAL, label: 'Crit', color: '#EF4444', bg: '#FEF2F2' }
              ] as const
            ).map((s) => {
              const active = severity === s.val;
              return (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => setSeverity(s.val)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '6px',
                    border: active ? `2px solid ${s.color}` : '1px solid #CBD5E1',
                    background: active ? s.bg : '#F8FAFC',
                    color: active ? s.color : '#64748B',
                    fontWeight: active ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
            Situation Description *
          </label>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>
            {description.length}/1000
          </span>
        </div>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          required
          placeholder="Describe water depth, trapped individuals, immediate hazards..."
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Safe Contact */}
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
          Safe Contact (Optional / Pseudonymous)
        </label>
        <input
          type="text"
          value={contactSafe}
          onChange={(e) => setContactSafe(e.target.value)}
          placeholder="e.g. Aarav (Nearby Grocery / 9820011223)"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            fontSize: '13px',
            boxSizing: 'border-box'
          }}
        />
        <span style={{ fontSize: '11px', color: '#64748B' }}>
          Protected: Only BMC coordinators can view contact details for response verification.
        </span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        style={{
          marginTop: '6px',
          padding: '12px 20px',
          borderRadius: '8px',
          background: isLoading ? '#94A3B8' : '#1E40AF',
          color: '#FFFFFF',
          fontWeight: 600,
          fontSize: '15px',
          border: 'none',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'background 0.15s'
        }}
      >
        <Send size={16} />
        <span>{isLoading ? 'Transmitting Report to Ledger...' : 'Submit Emergency Incident Report'}</span>
      </button>
    </form>
  );
};
