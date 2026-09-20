import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserRole,
  SourceReport,
  CanonicalIncident,
  AuditEvent,
  PublicReportView,
  CreateReportDTO,
  VerifyReportDTO,
  RejectReportDTO,
  CoordinationUpdate,
  ResourcePool,
  ResourceCommitment,
  TaskDetailView,
  SubmitOutcomeDTO,
  PostTaskUpdateDTO,
  AuthAccountSummary,
  MUMBAI_SCENARIO,
  GUEST_REPORTER_ID
} from '@vrl/shared';

export type AuthStage = 'LANDING' | 'LOGIN' | 'APP';

// Single source of truth for which URL each active role's workspace lives at —
// shared between the navigation-wiring below and App.tsx's route guards.
export function pathForRole(role: UserRole): string {
  switch (role) {
    case UserRole.COORDINATOR:
      return '/coordinator';
    case UserRole.RESPONDER:
      return '/responder';
    case UserRole.REPORTER:
    default:
      return '/report';
  }
}

interface OperationalContextType {
  // Auth / Session State
  authStage: AuthStage;
  activeRole: UserRole;
  session: AuthAccountSummary | null;
  enterFromLanding: () => void;
  continueAsReporter: () => void;
  backToLanding: () => void;
  loginAs: (account: AuthAccountSummary) => void;
  logout: () => void;

  // Reporter State
  currentReportRef: string | null;
  setCurrentReportRef: (ref: string | null) => void;
  publicReport: PublicReportView | null;
  submitReport: (dto: CreateReportDTO) => Promise<SourceReport>;
  addClarification: (ref: string, message: string) => Promise<CoordinationUpdate>;
  lookupReport: (ref: string) => Promise<boolean>;
  myReports: (SourceReport & {
    canonical_id?: number | null;
    canonical_status?: string | null;
    clarifications_count: number;
    latest_task_status?: string | null;
    latest_task_assignee?: string | null;
  })[];

  // Coordinator State
  coordinatorReports: (SourceReport & {
    canonical_id?: number | null;
    reporter_display_name?: string | null;
    reporter_phone?: string | null;
    clarifications_count: number;
    clarifications: CoordinationUpdate[];
  })[];
  canonicalIncidents: CanonicalIncident[];
  verifyReport: (id: number, dto: VerifyReportDTO) => Promise<void>;
  rejectReport: (id: number, dto: RejectReportDTO) => Promise<void>;

  // Ledger & Resource State
  resourcePool: ResourcePool | null;
  commitments: ResourceCommitment[];
  reserveResources: (incidentId: number, quantity: number, poolId?: number) => Promise<any>;
  adjustStock: (poolId: number, quantityDelta: number, reason: string) => Promise<any>;

  // Task & Handover State (Phase 4)
  tasks: TaskDetailView[];
  createTask: (incidentId: number, commitmentId: number, assignedTo: string, instructions: string, quantity: number) => Promise<any>;
  acknowledgeTask: (taskId: number, action: 'ACCEPT' | 'DECLINE', declineReason?: string) => Promise<any>;
  dispatchTask: (taskId: number, notes?: string, quantity?: number) => Promise<any>;
  postTaskUpdate: (taskId: number, dto: PostTaskUpdateDTO) => Promise<any>;

  // Outcome & Reconciliation State (Phase 5)
  submitOutcome: (taskId: number, dto: SubmitOutcomeDTO) => Promise<any>;
  confirmReconciliation: (incidentId: number, closureNotes?: string) => Promise<any>;

  // System & Health State
  auditEvents: AuditEvent[];
  conservation: {
    is_conserved: boolean;
    available: number;
    total: number;
    reserved: number;
    in_transit: number;
    delivered: number;
  };
  isLoading: boolean;
  isSyncing: boolean;
  lastUpdated: Date;
  refetch: () => Promise<void>;
  resetDemo: () => Promise<void>;
  runDemoSequence: () => Promise<void>;
}

const OperationalContext = createContext<OperationalContextType | null>(null);

const STORAGE_KEY_REF = 'vrl_latest_report_ref';
const STORAGE_KEY_SESSION = 'vrl_session_state';

interface PersistedSession {
  authStage: AuthStage;
  activeRole: UserRole;
  session: AuthAccountSummary | null;
}

function loadPersistedSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedSession;
    // Only ever restore straight into a completed login/reporter session, never a
    // half-finished LOGIN step — re-enter from LANDING for that edge case.
    if (parsed.authStage !== 'APP') return null;
    return parsed;
  } catch {
    return null;
  }
}

export const OperationalProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [authStage, setAuthStage] = useState<AuthStage>(() => loadPersistedSession()?.authStage ?? 'LANDING');
  const [activeRole, setActiveRoleState] = useState<UserRole>(() => loadPersistedSession()?.activeRole ?? UserRole.REPORTER);
  const [session, setSession] = useState<AuthAccountSummary | null>(() => loadPersistedSession()?.session ?? null);
  const [currentReportRef, setCurrentReportRefState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_REF);
  });
  const [publicReport, setPublicReport] = useState<PublicReportView | null>(null);
  const [myReports, setMyReports] = useState<any[]>([]);
  const [coordinatorReports, setCoordinatorReports] = useState<any[]>([]);
  const [canonicalIncidents, setCanonicalIncidents] = useState<CanonicalIncident[]>([]);
  const [resourcePool, setResourcePool] = useState<ResourcePool | null>(null);
  const [commitments, setCommitments] = useState<ResourceCommitment[]>([]);
  const [tasks, setTasks] = useState<TaskDetailView[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [conservation, setConservation] = useState({
    is_conserved: true,
    available: 20,
    total: 20,
    reserved: 0,
    in_transit: 0,
    delivered: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Persist auth/session state so a page reload doesn't replay the landing/login flow
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({ authStage, activeRole, session }));
    } catch {
      // ignore storage failures (private browsing, quota, etc.)
    }
  }, [authStage, activeRole, session]);

  const setCurrentReportRef = (ref: string | null) => {
    setCurrentReportRefState(ref);
    if (ref) {
      localStorage.setItem(STORAGE_KEY_REF, ref);
    } else {
      localStorage.removeItem(STORAGE_KEY_REF);
    }
  };

  // Auth actions: every login-selectable account (Reporter, Coordinator, Responder)
  // authenticates via /api/auth/login against a bcrypt hash; Reporter alone also has a
  // password-free "Quick Report" path. Each action here navigates its matching route —
  // route guards in App.tsx (ProtectedRoute) are what actually enforce state on
  // direct navigation/refresh; server-side role authorization (authMiddleware/requireRole)
  // remains the real enforcement boundary regardless.
  const enterFromLanding = () => {
    setAuthStage('LOGIN');
    navigate('/login');
  };

  const backToLanding = () => {
    setAuthStage('LANDING');
    navigate('/');
  };

  const continueAsReporter = () => {
    setSession(null);
    setActiveRoleState(UserRole.REPORTER);
    setAuthStage('APP');
    navigate('/report');
  };

  const loginAs = (account: AuthAccountSummary) => {
    setSession(account);
    setActiveRoleState(account.role);
    setAuthStage('APP');
    navigate(pathForRole(account.role));
  };

  const logout = () => {
    setSession(null);
    setActiveRoleState(UserRole.REPORTER);
    setAuthStage('LOGIN');
    navigate('/login');
  };

  // Headers helper for RBAC
  const getAuthHeaders = useCallback(() => {
    if (activeRole === UserRole.REPORTER) {
      return {
        'Content-Type': 'application/json',
        'x-actor-id': session?.id || GUEST_REPORTER_ID,
        'x-actor-role': UserRole.REPORTER
      };
    }
    return {
      'Content-Type': 'application/json',
      'x-actor-id': session?.id || MUMBAI_SCENARIO.personas.rajesh.id,
      'x-actor-role': session?.role || activeRole
    };
  }, [activeRole, session]);

  // Unified Refetch Function
  const refetch = useCallback(async () => {
    setIsSyncing(true);
    try {
      // 1. Health & Invariant Check
      const healthRes = await fetch('/api/health');
      if (healthRes.ok) {
        const data = await healthRes.json();
        if (data.conservation_check) {
          setConservation({
            is_conserved: data.conservation_check.is_conserved,
            available: data.conservation_check.available,
            total: data.conservation_check.total,
            reserved: data.conservation_check.reserved,
            in_transit: data.conservation_check.in_transit,
            delivered: data.conservation_check.delivered
          });
        }
      }

      // 2. Fetch Public Report if ref is active
      if (currentReportRef) {
        const pubRes = await fetch(`/api/reports/${currentReportRef}`);
        if (pubRes.ok) {
          const report = await pubRes.json();
          setPublicReport(report);
        } else if (pubRes.status === 404) {
          setPublicReport(null);
        }
      } else {
        setPublicReport(null);
      }

      // 3. Always fetch canonical incidents for Tactical Map & Lists
      const canonicalRes = await fetch('/api/reports/canonical');
      if (canonicalRes.ok) {
        const cData = await canonicalRes.json();
        setCanonicalIncidents(cData.incidents || []);
      }

      // 4. If Coordinator, fetch triage queue
      if (activeRole === UserRole.COORDINATOR) {
        const queueRes = await fetch('/api/reports', {
          headers: getAuthHeaders()
        });
        if (queueRes.ok) {
          const queueData = await queueRes.json();
          setCoordinatorReports(queueData.reports || []);
        }
      }

      // 4b. If a signed-in Reporter (not anonymous Quick Report guest), fetch their
      // own submission history — the backend refuses this for the shared 'guest' actor.
      if (activeRole === UserRole.REPORTER && session) {
        const mineRes = await fetch('/api/reports/mine', {
          headers: getAuthHeaders()
        });
        if (mineRes.ok) {
          const mineData = await mineRes.json();
          setMyReports(mineData.reports || []);
        }
      } else {
        setMyReports([]);
      }

      // 5. Fetch Resource Pool & Commitments
      const poolRes = await fetch('/api/resources/1');
      if (poolRes.ok) {
        const pData = await poolRes.json();
        setResourcePool(pData);
      }
      const ledgerRes = await fetch('/api/resources/ledger');
      if (ledgerRes.ok) {
        const lData = await ledgerRes.json();
        setCommitments(lData.ledger || []);
      }

      // 6. Fetch Tasks for actor
      const tasksRes = await fetch('/api/tasks', {
        headers: getAuthHeaders()
      });
      if (tasksRes.ok) {
        const tData = await tasksRes.json();
        setTasks(tData.tasks || []);
      }

      // 7. Fetch Audit Events for visibility
      const auditRes = await fetch('/api/audit');
      if (auditRes.ok) {
        const aData = await auditRes.json();
        setAuditEvents(aData.events || []);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('[OperationalContext] Refetch error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [currentReportRef, activeRole, session, getAuthHeaders]);

  // 3000ms Polling Loop with visibility detection & window focus.
  // Only runs once the user has entered the app (post landing/login) — no need to
  // hit the API while the story/login screens are showing.
  useEffect(() => {
    if (authStage !== 'APP') return;

    refetch();

    const interval = setInterval(() => {
      if (!document.hidden) {
        refetch();
      }
    }, 3000);

    const onVisibility = () => {
      if (!document.hidden) {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onVisibility);
    };
  }, [refetch, authStage]);

  // Reporter Actions
  const submitReport = async (dto: CreateReportDTO): Promise<SourceReport> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dto)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to submit report');
      }
      const data = await res.json();
      setCurrentReportRef(data.report.reference_code);
      await refetch();
      return data.report;
    } finally {
      setIsLoading(false);
    }
  };

  const addClarification = async (ref: string, message: string): Promise<CoordinationUpdate> => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports/${ref}/clarify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to add clarification');
      }
      const data = await res.json();
      await refetch();
      return data.update;
    } finally {
      setIsLoading(false);
    }
  };

  const lookupReport = async (ref: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/reports/${ref}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentReportRef(ref);
        setPublicReport(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Coordinator Actions
  const verifyReport = async (id: number, dto: VerifyReportDTO): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports/${id}/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dto)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to verify report');
      }
      await refetch();
    } finally {
      setIsLoading(false);
    }
  };

  const rejectReport = async (id: number, dto: RejectReportDTO): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports/${id}/reject`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dto)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to reject report');
      }
      await refetch();
    } finally {
      setIsLoading(false);
    }
  };

  // Resource Reservation Action
  const reserveResources = async (incidentId: number, quantity: number, poolId = 1): Promise<any> => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/reserve`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity, pool_id: poolId })
      });
      const data = await res.json();
      if (!res.ok) {
        throw data;
      }
      await refetch();
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const adjustStock = async (poolId: number, quantityDelta: number, reason: string): Promise<any> => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/resources/${poolId}/adjust`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity_delta: quantityDelta, reason })
      });
      const data = await res.json();
      if (!res.ok) {
        throw data;
      }
      await refetch();
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  // Task Coordination Actions (Phase 4)
  const createTask = async (
    incidentId: number,
    commitmentId: number,
    assignedTo: string,
    instructions: string,
    quantity: number
  ): Promise<any> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          incident_id: incidentId,
          commitment_id: commitmentId,
          assigned_to: assignedTo,
          instructions,
          assigned_quantity: quantity
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw data;
      }
      await refetch();
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const acknowledgeTask = async (
    taskId: number,
    action: 'ACCEPT' | 'DECLINE',
    declineReason?: string
  ): Promise<any> => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/acknowledge`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action, decline_reason: declineReason })
      });
      const data = await res.json();
      if (!res.ok) {
        throw data;
      }
      await refetch();
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const dispatchTask = async (taskId: number, notes?: string, quantity?: number): Promise<any> => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/dispatch`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes, quantity })
      });
      const data = await res.json();
      if (!res.ok) {
        throw data;
      }
      await refetch();
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const postTaskUpdate = async (taskId: number, dto: PostTaskUpdateDTO): Promise<any> => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/updates`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dto)
      });
      const data = await res.json();
      if (!res.ok) {
        throw data;
      }
      await refetch();
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  // Outcome Submission (Phase 5)
  const submitOutcome = async (taskId: number, dto: SubmitOutcomeDTO): Promise<any> => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/outcome`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dto)
      });
      const data = await res.json();
      if (!res.ok) {
        throw data;
      }
      await refetch();
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  // Coordinator Reconciliation Confirmation (Phase 5)
  const confirmReconciliation = async (incidentId: number, closureNotes?: string): Promise<any> => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/confirm`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ closure_notes: closureNotes })
      });
      const data = await res.json();
      if (!res.ok) {
        throw data;
      }
      await refetch();
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Reset
  const resetDemo = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
      setCurrentReportRef(null);
      setPublicReport(null);
      await refetch();
    } finally {
      setIsLoading(false);
    }
  };

  const runDemoSequence = async () => {
    setIsLoading(true);
    try {
      // 1. Reset database to clean 20-kit baseline
      const resetRes = await fetch('/api/demo/reset', { method: 'POST' });
      if (!resetRes.ok) throw new Error('Reset failed');

      // 2. Aarav submits report for Kranti Nagar flood
      const reportRes = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-id': 'aarav',
          'x-actor-role': UserRole.REPORTER
        },
        body: JSON.stringify({
          location_name: 'Kranti Nagar, Kurla West',
          latitude: 19.0688,
          longitude: 72.8812,
          incident_type: 'FLOOD',
          reporter_severity: 'CRITICAL',
          description: 'Mithi river overflow entering residential chawls. 15 families stranded on roofs, immediate relief supplies needed.',
          contact_safe: '+91-98200-XXXXX'
        })
      });
      if (!reportRes.ok) throw new Error('Failed to submit demo report');
      const reportData = await reportRes.json();
      const reportRef = reportData.report.reference_code;
      const reportId = reportData.report.id;
      setCurrentReportRef(reportRef);

      // 3. Aarav adds clarification note
      await fetch(`/api/reports/${reportRef}/clarify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-id': 'aarav',
          'x-actor-role': UserRole.REPORTER
        },
        body: JSON.stringify({
          message: 'Water level risen by 2.5 feet in 20 minutes. Ground floor completely inundated.'
        })
      });

      // 4. Rajesh verifies report as URGENT Canonical Incident
      const verifyRes = await fetch(`/api/reports/${reportId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-id': 'rajesh',
          'x-actor-role': UserRole.COORDINATOR
        },
        body: JSON.stringify({
          priority: 'URGENT'
        })
      });
      if (!verifyRes.ok) throw new Error('Failed to verify demo report');
      const verifyData = await verifyRes.json();
      const incidentId = verifyData.incident.id;

      // 5. Rajesh commits 20 relief kits from BKC Depot
      const commitRes = await fetch(`/api/incidents/${incidentId}/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-id': 'rajesh',
          'x-actor-role': UserRole.COORDINATOR
        },
        body: JSON.stringify({
          quantity: 20,
          pool_id: 1
        })
      });
      if (!commitRes.ok) throw new Error('Failed to reserve demo resources');
      const commitData = await commitRes.json();
      const commitmentId = commitData.commitment.id;

      // 6. Rajesh assigns mission task to Chetan
      const taskRes = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-id': 'rajesh',
          'x-actor-role': UserRole.COORDINATOR
        },
        body: JSON.stringify({
          incident_id: incidentId,
          commitment_id: commitmentId,
          assigned_to: 'chetan',
          instructions: 'Deliver 20 emergency relief kits to Kranti Nagar evacuation outpost.',
          assigned_quantity: 20
        })
      });
      if (!taskRes.ok) throw new Error('Failed to create demo task');
      const taskData = await taskRes.json();
      const taskId = taskData.id;

      // 7. Chetan accepts mission
      await fetch(`/api/tasks/${taskId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-id': 'chetan',
          'x-actor-role': UserRole.RESPONDER
        },
        body: JSON.stringify({ action: 'ACCEPT' })
      });

      // 8. Chetan dispatches vehicle with 20 kits
      await fetch(`/api/tasks/${taskId}/dispatch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-id': 'chetan',
          'x-actor-role': UserRole.RESPONDER
        },
        body: JSON.stringify({ notes: 'QRT Van 1 loaded with 20 kits departed BKC Depot.' })
      });

      // 9. Chetan submits partial delivery outcome (12 delivered, 8 remaining in vehicle)
      await fetch(`/api/tasks/${taskId}/outcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-id': 'chetan',
          'x-actor-role': UserRole.RESPONDER
        },
        body: JSON.stringify({
          outcome_type: 'PARTIAL',
          delivered_quantity: 12,
          remainder_quantity: 8,
          exception_reason: 'Waterlogged footbridge blocked van access to remaining 8 tenements.'
        })
      });

      // 10. Rajesh confirms reconciliation & restocks remainder to depot
      await fetch(`/api/incidents/${incidentId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-actor-id': 'rajesh',
          'x-actor-role': UserRole.COORDINATOR
        },
        body: JSON.stringify({
          closure_notes: '12 kits confirmed delivered at Kranti Nagar shelter; 8 remainder kits safely returned to BKC stock.'
        })
      });

      // Switch to Coordinator role to immediately inspect verified & reconciled state
      loginAs(MUMBAI_SCENARIO.personas.rajesh);
      await refetch();
    } catch (err) {
      console.error('[OperationalContext] Demo sequence failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OperationalContext.Provider
      value={{
        authStage,
        activeRole,
        session,
        enterFromLanding,
        continueAsReporter,
        backToLanding,
        loginAs,
        logout,
        currentReportRef,
        setCurrentReportRef,
        publicReport,
        submitReport,
        addClarification,
        lookupReport,
        myReports,
        coordinatorReports,
        canonicalIncidents,
        verifyReport,
        rejectReport,
        resourcePool,
        commitments,
        reserveResources,
        adjustStock,
        tasks,
        createTask,
        acknowledgeTask,
        dispatchTask,
        postTaskUpdate,
        submitOutcome,
        confirmReconciliation,
        auditEvents,
        conservation,
        isLoading,
        isSyncing,
        lastUpdated,
        refetch,
        resetDemo,
        runDemoSequence
      }}
    >
      {children}
    </OperationalContext.Provider>
  );
};

export function useOperational(): OperationalContextType {
  const ctx = useContext(OperationalContext);
  if (!ctx) {
    throw new Error('useOperational must be used within an OperationalProvider');
  }
  return ctx;
}
