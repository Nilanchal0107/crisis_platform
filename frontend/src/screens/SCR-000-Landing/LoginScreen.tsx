import { useEffect, useState, type ReactNode } from 'react';
import { AuthAccountSummary, UserRole } from '@vrl/shared';
import {
  ArrowLeft,
  MessageSquareText,
  ShieldCheck,
  Truck,
  LogIn,
  UserPlus,
  Zap,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useOperational } from '../../context/OperationalContext';

type LoginRole = UserRole.REPORTER | UserRole.COORDINATOR | UserRole.RESPONDER;
type View = 'ROOT' | 'REPORTER_CHOICE' | 'REPORTER_SIGNIN' | 'ACCOUNT_LOGIN';

const ROLE_META: Record<LoginRole, { label: string; blurb: string; accent: string; icon: ReactNode }> = {
  [UserRole.REPORTER]: {
    label: 'Community Reporter',
    blurb: 'Submit and track incidents under your own reporter identity.',
    accent: '#2563EB',
    icon: <MessageSquareText size={22} />
  },
  [UserRole.COORDINATOR]: {
    label: 'Agency Coordinator',
    blurb: 'Verify reports, reserve stock, offer missions, and reconcile outcomes.',
    accent: '#4338CA',
    icon: <ShieldCheck size={22} />
  },
  [UserRole.RESPONDER]: {
    label: 'Volunteer / Responder',
    blurb: 'Accept offered missions, mark dispatch, and report delivery outcomes.',
    accent: '#7E22CE',
    icon: <Truck size={22} />
  }
};

export const LoginScreen = () => {
  const { continueAsReporter, loginAs, backToLanding } = useOperational();
  const [view, setView] = useState<View>('ROOT');
  const [selectedRole, setSelectedRole] = useState<LoginRole | null>(null);
  const [accounts, setAccounts] = useState<AuthAccountSummary[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [signInName, setSignInName] = useState('');
  const [signInPhone, setSignInPhone] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (view !== 'ACCOUNT_LOGIN' || !selectedRole) return;
    setIsLoadingAccounts(true);
    setError(null);
    fetch(`/api/auth/accounts?role=${selectedRole}`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load accounts for this role');
        return res.json();
      })
      .then((data) => {
        const list: AuthAccountSummary[] = data.accounts || [];
        setAccounts(list);
        setSelectedAccountId(list[0]?.id || '');
      })
      .catch(() => setError('Could not load accounts for this role. Try again.'))
      .finally(() => setIsLoadingAccounts(false));
  }, [view, selectedRole]);

  const openAccountLogin = (role: LoginRole) => {
    setSelectedRole(role);
    setPassword('');
    setError(null);
    setView('ACCOUNT_LOGIN');
  };

  const goBack = () => {
    if (view === 'ACCOUNT_LOGIN') {
      setSelectedRole(null);
      setPassword('');
      setError(null);
      setView(selectedRole === UserRole.REPORTER ? 'REPORTER_CHOICE' : 'ROOT');
      return;
    }
    if (view === 'REPORTER_SIGNIN') {
      setSignInName('');
      setSignInPhone('');
      setError(null);
      setView('REPORTER_CHOICE');
      return;
    }
    if (view === 'REPORTER_CHOICE') {
      setView('ROOT');
      return;
    }
    backToLanding();
  };

  const handleLogin = async () => {
    if (!selectedAccountId || !password) return;
    setIsLoggingIn(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedAccountId, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      loginAs(data.account);
    } catch (err: any) {
      setError(err.message || 'Login failed. Try a different account.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignIn = async () => {
    if (!signInName.trim() || !signInPhone.trim()) return;
    setIsSigningIn(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: signInName.trim(), phone: signInPhone.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Sign in failed');
      }
      loginAs(data.account);
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Check your name and phone number and try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const heading =
    view === 'ACCOUNT_LOGIN' && selectedRole
      ? `Sign in as ${ROLE_META[selectedRole].label}`
      : view === 'REPORTER_SIGNIN'
        ? 'New Community Reporter'
        : view === 'REPORTER_CHOICE'
          ? 'Community Reporter'
          : 'Who are you responding as?';

  const subheading =
    view === 'ACCOUNT_LOGIN'
      ? 'Select a demo account and enter its password. Credentials are checked server-side against a bcrypt hash.'
      : view === 'REPORTER_SIGNIN'
        ? "We'll remember you by phone number next time — no password needed."
        : view === 'REPORTER_CHOICE'
          ? 'New here, returning with an account, or just submitting once — pick how you want to participate.'
          : 'Every identity below is a real, password-checked account — pick how you want to participate.';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F8FAFC',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '520px', width: '100%' }}>
        <button
          onClick={goBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '18px',
            padding: 0
          }}
        >
          <ArrowLeft size={15} />
          <span>
            {view === 'ACCOUNT_LOGIN'
              ? selectedRole === UserRole.REPORTER
                ? 'Back to reporter options'
                : 'Choose a different role'
              : view === 'REPORTER_SIGNIN'
                ? 'Back to reporter options'
                : view === 'REPORTER_CHOICE'
                  ? 'Choose a different role'
                  : 'Back to scenario briefing'}
          </span>
        </button>

        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>{heading}</h2>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 24px 0' }}>{subheading}</p>

        {view === 'ROOT' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(Object.keys(ROLE_META) as LoginRole[]).map((role) => (
              <button
                key={role}
                onClick={() => (role === UserRole.REPORTER ? setView('REPORTER_CHOICE') : openAccountLogin(role))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ background: ROLE_META[role].accent, color: '#FFF', padding: '10px', borderRadius: '10px' }}>
                  {ROLE_META[role].icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>{ROLE_META[role].label}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{ROLE_META[role].blurb}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {view === 'REPORTER_CHOICE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => { setError(null); setView('REPORTER_SIGNIN'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '18px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ background: ROLE_META[UserRole.REPORTER].accent, color: '#FFF', padding: '10px', borderRadius: '10px' }}>
                <UserPlus size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>Sign In</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  New here? Give us your name and phone number — no password needed.
                </div>
              </div>
            </button>

            <button
              onClick={() => openAccountLogin(UserRole.REPORTER)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '18px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ background: ROLE_META[UserRole.REPORTER].accent, color: '#FFF', padding: '10px', borderRadius: '10px' }}>
                <LogIn size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>Log In</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Returning with a password-protected reporter account.
                </div>
              </div>
            </button>

            <button
              onClick={continueAsReporter}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '18px',
                borderRadius: '12px',
                border: '1px solid #BFDBFE',
                background: '#EFF6FF',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ background: '#2563EB', color: '#FFF', padding: '10px', borderRadius: '10px' }}>
                <Zap size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#1E3A8A' }}>Quick Report</div>
                <div style={{ fontSize: '12px', color: '#3B82F6' }}>
                  Submit an incident and track it by reference — no details needed.
                </div>
              </div>
            </button>
          </div>
        )}

        {view === 'REPORTER_SIGNIN' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px'
              }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Name
              </label>
              <input
                type="text"
                value={signInName}
                onChange={(e) => setSignInName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '13px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={signInPhone}
                onChange={(e) => setSignInPhone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && signInName.trim() && signInPhone.trim() && !isSigningIn) handleSignIn();
                }}
                placeholder="e.g. +91 98200 11223"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '13px'
                }}
              />
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                We'll recognize this number next time — no password to remember.
              </span>
            </div>

            <button
              onClick={handleSignIn}
              disabled={!signInName.trim() || !signInPhone.trim() || isSigningIn}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '13px',
                borderRadius: '10px',
                border: 'none',
                background: !signInName.trim() || !signInPhone.trim() || isSigningIn ? '#CBD5E1' : ROLE_META[UserRole.REPORTER].accent,
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '14px',
                cursor: !signInName.trim() || !signInPhone.trim() || isSigningIn ? 'not-allowed' : 'pointer'
              }}
            >
              <UserPlus size={16} />
              <span>{isSigningIn ? 'Signing in…' : 'Continue'}</span>
            </button>
          </div>
        )}

        {view === 'ACCOUNT_LOGIN' && selectedRole && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px'
              }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {isLoadingAccounts ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px', padding: '20px 0' }}>
                <Loader2 size={16} />
                <span>Loading accounts…</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {accounts.map((account) => {
                  const isSelected = account.id === selectedAccountId;
                  return (
                    <label
                      key={account.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: isSelected ? `2px solid ${ROLE_META[selectedRole].accent}` : '1px solid #E2E8F0',
                        background: isSelected ? '#F8FAFC' : '#FFFFFF',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="radio"
                        name="account"
                        checked={isSelected}
                        onChange={() => { setSelectedAccountId(account.id); setError(null); }}
                      />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{account.display_name}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>{account.contact_safe}</div>
                      </div>
                    </label>
                  );
                })}
                {accounts.length === 0 && (
                  <div style={{ fontSize: '13px', color: '#94A3B8' }}>No accounts found for this role.</div>
                )}
              </div>
            )}

            {!isLoadingAccounts && accounts.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && selectedAccountId && password && !isLoggingIn) handleLogin();
                  }}
                  placeholder="Enter demo password"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '13px'
                  }}
                />
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={!selectedAccountId || !password || isLoggingIn}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '13px',
                borderRadius: '10px',
                border: 'none',
                background: !selectedAccountId || !password || isLoggingIn ? '#CBD5E1' : ROLE_META[selectedRole].accent,
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '14px',
                cursor: !selectedAccountId || !password || isLoggingIn ? 'not-allowed' : 'pointer'
              }}
            >
              <LogIn size={16} />
              <span>{isLoggingIn ? 'Signing in…' : 'Log In'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
