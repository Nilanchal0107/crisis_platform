import { useState } from 'react';
import { UserRole, MUMBAI_SCENARIO } from '@vrl/shared';

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.COORDINATOR);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Demo Bar */}
      <header style={{
        background: '#1E293B',
        color: '#FFFFFF',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.01em' }}>
            VERIFIED RESPONSE LEDGER
          </span>
          <span style={{
            fontSize: '11px',
            background: '#0F172A',
            color: '#94A3B8',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid #334155'
          }}>
            📍 {MUMBAI_SCENARIO.ward}
          </span>
        </div>

        {/* Live Invariant Pill & Persona Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: '#064E3B',
            color: '#A7F3D0',
            border: '1px solid #059669',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>✓ Mass Conserved: 20/20 Kits</span>
          </div>

          <div style={{ display: 'flex', gap: '4px', background: '#0F172A', padding: '2px', borderRadius: '6px' }}>
            <button
              onClick={() => setActiveRole(UserRole.REPORTER)}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                borderRadius: '4px',
                background: activeRole === UserRole.REPORTER ? '#1D4ED8' : 'transparent',
                color: '#FFFFFF',
                fontWeight: activeRole === UserRole.REPORTER ? 600 : 400
              }}
            >
              Aarav (Reporter)
            </button>
            <button
              onClick={() => setActiveRole(UserRole.COORDINATOR)}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                borderRadius: '4px',
                background: activeRole === UserRole.COORDINATOR ? '#1D4ED8' : 'transparent',
                color: '#FFFFFF',
                fontWeight: activeRole === UserRole.COORDINATOR ? 600 : 400
              }}
            >
              Rajesh (Coordinator)
            </button>
            <button
              onClick={() => setActiveRole(UserRole.RESPONDER)}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                borderRadius: '4px',
                background: activeRole === UserRole.RESPONDER ? '#1D4ED8' : 'transparent',
                color: '#FFFFFF',
                fontWeight: activeRole === UserRole.RESPONDER ? 600 : 400
              }}
            >
              Chetan (Responder)
            </button>
          </div>

          <button
            onClick={() => {
              fetch('/api/demo/reset', { method: 'POST' })
                .then(res => res.json())
                .then(data => alert(`Demo Reset: ${JSON.stringify(data.status)}`))
                .catch(err => alert(`Reset error: ${err.message}`));
            }}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              background: '#374151',
              color: '#F9FAFB',
              borderRadius: '4px',
              fontWeight: 500
            }}
          >
            Reset Demo ↺
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: '#FFFFFF', padding: '24px', borderRadius: '10px', border: '1px solid #D8DEE8' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
            Active Persona: {MUMBAI_SCENARIO.personas[activeRole.toLowerCase() as keyof typeof MUMBAI_SCENARIO.personas]?.display_name || activeRole}
          </h2>
          <p style={{ color: '#52606D', fontSize: '14px' }}>
            Phase 1 Foundation operational. Backend API running on port 3000; Frontend Vite server on port 5173.
          </p>
        </div>
      </main>
    </div>
  );
}
