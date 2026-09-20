import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserRole, MUMBAI_SCENARIO } from '@vrl/shared';
import { OperationalProvider, useOperational, pathForRole } from './context/OperationalContext';
import { LandingScreen } from './screens/SCR-000-Landing/LandingScreen';
import { LoginScreen } from './screens/SCR-000-Landing/LoginScreen';
import { ReporterScreen } from './screens/SCR-001-Reporter/ReporterScreen';
import { CoordinatorScreen } from './screens/SCR-002-Coordinator/CoordinatorScreen';
import { ResponderScreen } from './screens/SCR-003-Responder/ResponderScreen';
import { ShieldCheck, AlertCircle, LogOut, UserRound } from 'lucide-react';

const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.REPORTER]: 'Community Reporter',
  [UserRole.COORDINATOR]: 'Agency Coordinator',
  [UserRole.RESPONDER]: 'Volunteer / Responder'
};

function AppShell({ children }: { children: ReactNode }) {
  const {
    activeRole,
    session,
    logout,
    conservation
  } = useOperational();

  const identityLabel = session?.display_name
    || (activeRole === UserRole.REPORTER ? 'Guest Reporter (Anonymous)' : ROLE_LABEL[activeRole]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Top Demo Command Bar */}
      <header style={{
        background: '#1E293B',
        color: '#FFFFFF',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #334155',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.02em', color: '#F8FAFC' }}>
            VERIFIED RESPONSE LEDGER
          </span>
          <span style={{
            fontSize: '11px',
            background: '#0F172A',
            color: '#94A3B8',
            padding: '3px 8px',
            borderRadius: '4px',
            border: '1px solid #334155',
            fontWeight: 500
          }}>
            📍 {MUMBAI_SCENARIO.ward}
          </span>
        </div>

        {/* Invariant Pill, Identity Badge & Demo Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Mass Conserved Invariant Pill */}
          <div style={{
            background: conservation.is_conserved ? '#064E3B' : '#7F1D1D',
            color: conservation.is_conserved ? '#A7F3D0' : '#FECACA',
            border: `1px solid ${conservation.is_conserved ? '#059669' : '#DC2626'}`,
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {conservation.is_conserved ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
            <span>✓ Mass Conserved: {conservation.available}/{conservation.total} Kits</span>
          </div>

          {/* Signed-in Identity Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#0F172A',
            border: '1px solid #334155',
            padding: '4px 6px 4px 10px',
            borderRadius: '8px'
          }}>
            <UserRound size={13} color="#94A3B8" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#F1F5F9' }}>{identityLabel}</span>
            <span style={{ fontSize: '10px', color: '#64748B' }}>{ROLE_LABEL[activeRole]}</span>
            <button
              onClick={logout}
              title="Switch role / log out"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: '#1E293B',
                border: 'none',
                color: '#CBD5E1',
                padding: '4px 8px',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <LogOut size={11} />
              <span>Switch</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '20px' }}>
        {children}
      </main>
    </div>
  );
}

// Guards a role's workspace route: bounces to /login if there's no active session at
// all, or to the caller's own workspace if they're authenticated as a different role
// (e.g. typing /responder into the address bar while signed in as Coordinator).
function ProtectedRoute({ role, children }: { role: UserRole; children: ReactNode }) {
  const { authStage, activeRole } = useOperational();

  if (authStage !== 'APP') {
    return <Navigate to="/login" replace />;
  }
  if (activeRole !== role) {
    return <Navigate to={pathForRole(activeRole)} replace />;
  }
  return <AppShell>{children}</AppShell>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route
        path="/report"
        element={
          <ProtectedRoute role={UserRole.REPORTER}>
            <ReporterScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coordinator"
        element={
          <ProtectedRoute role={UserRole.COORDINATOR}>
            <CoordinatorScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/responder"
        element={
          <ProtectedRoute role={UserRole.RESPONDER}>
            <ResponderScreen />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <OperationalProvider>
      <AppRoutes />
    </OperationalProvider>
  );
}
