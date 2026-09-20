import { type CSSProperties, type ReactNode } from 'react';
import {
  ShieldCheck,
  Waves,
  ArrowRight,
  ArrowDown,
  Github,
  PlayCircle,
  Users,
  MapPinned,
  Boxes,
  GitBranch,
  Lock,
  Scale,
  Ban,
  Server,
  CheckCircle2,
  Radio,
  Send,
  Truck,
  PackageCheck,
  FileCheck2,
  ClipboardCheck,
  Compass
} from 'lucide-react';
import { MUMBAI_SCENARIO } from '@vrl/shared';
import { useOperational } from '../../context/OperationalContext';

const GITHUB_REPO_URL = 'https://github.com/Nilanchal0107/crisis_platform';

// Palette lifted directly from the live app (App.tsx top bar, ReceiptCard, TaskCard)
// so the pitch page previews the real product instead of a separate marketing theme.
const NAVY = {
  bar: '#1E293B',
  barBorder: '#334155',
  panel: '#0F172A',
  panelBorder: '#1E293B',
  accentText: '#60A5FA',
  mutedText: '#94A3B8',
};

const PAGE = {
  bg: '#F8FAFC',
  bgAlt: '#F6F8FA',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  borderStrong: '#D8DEE8',
  textPrimary: '#172033',
  textSecondary: '#52606D',
  textMuted: '#64748B',
  primary: '#2563EB',
  primaryDark: '#1E40AF',
};

// Exact status-badge hues reused from TaskCard.tsx / ReceiptCard.tsx
const STATUS = {
  green: { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', icon: '#059669' },
  blue: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', icon: '#2563EB' },
  amber: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', icon: '#D97706' },
  amberDeep: { bg: '#FEF3C7', border: '#FCD34D', text: '#92400E', icon: '#B45309' },
  purple: { bg: '#FAF5FF', border: '#E9D5FF', text: '#6B21A8', icon: '#7E22CE' },
  red: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', icon: '#DC2626' },
};

const NAV_LINKS = [
  { id: 'problem', label: 'Problem' },
  { id: 'root-cause', label: 'Root Cause' },
  { id: 'invariants', label: 'Invariants' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'video', label: 'Video' },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---- shared layout primitives ----

const sectionOuter = (bg: string): CSSProperties => ({
  background: bg,
  borderTop: `1px solid ${PAGE.border}`,
  padding: '72px 24px',
});

const sectionInner: CSSProperties = {
  maxWidth: '1080px',
  margin: '0 auto',
};

const eyebrowStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: PAGE.primary,
  marginBottom: '12px',
};

const headingStyle: CSSProperties = {
  fontSize: '30px',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: PAGE.textPrimary,
  margin: '0 0 14px 0',
  lineHeight: 1.2,
};

const leadStyle: CSSProperties = {
  fontSize: '15px',
  lineHeight: 1.7,
  color: PAGE.textSecondary,
  maxWidth: '760px',
  margin: '0 0 36px 0',
};

const cardBase: CSSProperties = {
  background: PAGE.surface,
  border: `1px solid ${PAGE.border}`,
  borderRadius: '12px',
  padding: '22px',
  boxShadow: '0 1px 2px 0 rgba(16, 24, 40, 0.05)',
};

function statusCard(s: typeof STATUS.green): CSSProperties {
  return {
    background: s.bg,
    border: `1px solid ${s.border}`,
    borderRadius: '12px',
    padding: '22px',
  };
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <div style={eyebrowStyle}>{children}</div>;
}

function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 style={headingStyle}>{children}</h2>;
}

function PrimaryButton({ onClick, href, children, icon }: { onClick?: () => void; href?: string; children: ReactNode; icon: ReactNode }) {
  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 22px',
    borderRadius: '10px',
    border: 'none',
    background: PAGE.primary,
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    textDecoration: 'none',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.25)',
  };
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" style={style}>
        {children}
        {icon}
      </a>
    );
  }
  return (
    <button onClick={onClick} style={style}>
      {children}
      {icon}
    </button>
  );
}

function SecondaryButton({ href, children, icon }: { href: string; children: ReactNode; icon: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px 22px',
        borderRadius: '10px',
        border: `1px solid ${PAGE.borderStrong}`,
        background: PAGE.surface,
        color: PAGE.textPrimary,
        fontSize: '14px',
        fontWeight: 700,
        cursor: 'pointer',
        textDecoration: 'none',
      }}
    >
      {icon}
      {children}
    </a>
  );
}

export const LandingScreen = () => {
  const { enterFromLanding } = useOperational();

  return (
    <div style={{ minHeight: '100vh', background: PAGE.bg, color: PAGE.textPrimary }}>
      {/* Sticky nav — matches the in-app top command bar (App.tsx) */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: NAVY.bar,
          borderBottom: `1px solid ${NAVY.barBorder}`,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '-0.01em', color: '#F8FAFC' }}>
            VERIFIED RESPONSE LEDGER
          </span>
          <span
            style={{
              fontSize: '11px',
              background: NAVY.panel,
              color: NAVY.mutedText,
              padding: '3px 8px',
              borderRadius: '4px',
              border: `1px solid ${NAVY.barBorder}`,
              fontWeight: 500,
            }}
          >
            📍 {MUMBAI_SCENARIO.ward}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              style={{
                background: 'none',
                border: 'none',
                color: NAVY.mutedText,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={enterFromLanding}
            style={{
              background: PAGE.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '7px',
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Enter Live Demo
          </button>
        </div>
      </div>

      {/* HERO */}
      <div style={{ padding: '64px 24px 72px 24px', background: PAGE.bg }}>
        <div style={{ ...sectionInner, maxWidth: '820px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: STATUS.blue.bg,
              border: `1px solid ${STATUS.blue.border}`,
              padding: '5px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 600,
              color: STATUS.blue.text,
              marginBottom: '20px',
            }}
          >
            <Waves size={13} />
            <span>{MUMBAI_SCENARIO.ward}, {MUMBAI_SCENARIO.city} &mdash; Crisis Response Platform</span>
          </div>

          <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: PAGE.textMuted, marginBottom: '10px', textTransform: 'uppercase' }}>
            Full-Stack GIS &middot; Hackathon Prototype
          </div>

          <h1 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 14px 0', lineHeight: 1.1, color: PAGE.textPrimary }}>
            Verified Response Ledger
          </h1>
          <p style={{ fontSize: '16px', color: PAGE.textSecondary, margin: '0 0 28px 0', fontWeight: 500, lineHeight: 1.6, maxWidth: '640px' }}>
            A disaster-response coordination platform that turns fragmented incident reports into one
            accountable record &mdash; from first report to confirmed delivery, with nothing lost or
            double-counted in between.
          </p>

          {/* Dark accent panel — same treatment as the app's "Public Receipt Identifier" card */}
          <div
            style={{
              background: NAVY.panel,
              border: `1px solid ${NAVY.panelBorder}`,
              borderRadius: '10px',
              padding: '22px',
              fontSize: '14px',
              lineHeight: 1.7,
              color: NAVY.mutedText,
              marginBottom: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <p style={{ margin: '0 0 12px 0' }}>
              It's monsoon season in Mumbai's L-Ward, <strong style={{ color: NAVY.accentText }}>Kurla West</strong>.
              The Mithi River has broken its banks after three days of continuous rain &mdash; reports are
              arriving faster than anyone can verify them by phone, and relief-kit stock is being promised
              from a spreadsheet no one can trust.
            </p>
            <p style={{ margin: 0, color: '#F8FAFC', fontWeight: 700 }}>
              No report goes into action until it's verified. No kit is promised twice. No task is "sent"
              until someone has actually accepted it.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
            <PrimaryButton onClick={enterFromLanding} icon={<ArrowRight size={16} />}>
              Enter Live Demo
            </PrimaryButton>
            <SecondaryButton href={GITHUB_REPO_URL} icon={<Github size={16} />}>
              View Source on GitHub
            </SecondaryButton>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: PAGE.textMuted, marginBottom: '24px' }}>
            <ShieldCheck size={14} color={STATUS.green.icon} />
            <span>Every action below is real and auditable &mdash; only the crisis scenario itself is simulated.</span>
          </div>

          {/* Demo Credentials — Reporter needs no account; Coordinator/Responder are real,
              password-checked logins (bcrypt-hashed server-side) with fixed demo passwords. */}
          <div
            style={{
              ...cardBase,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', color: PAGE.textMuted, textTransform: 'uppercase' }}>
              Demo Credentials
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ background: STATUS.blue.bg, color: STATUS.blue.icon, padding: '6px', borderRadius: '8px', flexShrink: 0 }}>
                  <Users size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: PAGE.textPrimary }}>Community Reporter</div>
                  <div style={{ fontSize: '12px', color: PAGE.textMuted }}>Quick Report needs no login, or</div>
                  <div style={{ fontSize: '12px', color: PAGE.textMuted, fontFamily: 'monospace' }}>aarav / aarav123</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ background: STATUS.green.bg, color: STATUS.green.icon, padding: '6px', borderRadius: '8px', flexShrink: 0 }}>
                  <ShieldCheck size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: PAGE.textPrimary }}>Agency Coordinator</div>
                  <div style={{ fontSize: '12px', color: PAGE.textMuted, fontFamily: 'monospace' }}>rajesh / rajesh123</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ background: STATUS.purple.bg, color: STATUS.purple.icon, padding: '6px', borderRadius: '8px', flexShrink: 0 }}>
                  <Truck size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: PAGE.textPrimary }}>Volunteer / Responder</div>
                  <div style={{ fontSize: '12px', color: PAGE.textMuted, fontFamily: 'monospace' }}>chetan / chetan123</div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: PAGE.textMuted, borderTop: `1px solid ${PAGE.border}`, paddingTop: '10px' }}>
              A few additional seeded accounts (neha, priya, meera, imran) follow the same &lsquo;&lt;username&gt;123&rsquo; pattern &mdash;
              pick any account on the login screen after selecting a role.
            </div>
          </div>
        </div>
      </div>

      {/* PROBLEM STATEMENT */}
      <section id="problem" style={sectionOuter(PAGE.bgAlt)}>
        <div style={sectionInner}>
          <Eyebrow>
            <Compass size={13} /> The Problem
          </Eyebrow>
          <SectionHeading>One shared workflow &mdash; not five disconnected tools</SectionHeading>
          <p style={leadStyle}>
            The problem statement asks for a centralized web platform connecting communities, volunteers,
            and agencies: real-time incident reporting with location, type, and severity; tracking of
            emergency-resource availability and distribution; communication and task coordination; and an
            interactive map for shared situational awareness.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              marginBottom: '32px',
            }}
          >
            {[
              { icon: <Users size={18} />, title: 'Centralized platform', desc: 'One shared operational record, not five disconnected tools linked by a homepage.' },
              { icon: <MapPinned size={18} />, title: 'Located, typed, severity-rated reports', desc: 'Every incident carries a coordinate, a category, and a severity from intake onward.' },
              { icon: <Boxes size={18} />, title: 'Resource availability & distribution', desc: 'Stock isn’t just a number — it moves through controlled states, end to end.' },
              { icon: <Radio size={18} />, title: 'Communication & task coordination', desc: 'Assignment is a tracked handoff, not a message that might be missed.' },
            ].map((item) => (
              <div key={item.title} style={cardBase}>
                <div style={{ color: PAGE.primary, marginBottom: '10px' }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: PAGE.textPrimary, marginBottom: '6px' }}>{item.title}</div>
                <div style={{ fontSize: '13px', color: PAGE.textMuted, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <blockquote
            style={{
              margin: 0,
              padding: '20px 24px',
              borderLeft: `4px solid ${PAGE.primary}`,
              background: PAGE.surface,
              border: `1px solid ${PAGE.border}`,
              borderLeftWidth: '4px',
              borderRadius: '0 10px 10px 0',
              fontSize: '15px',
              fontStyle: 'italic',
              color: PAGE.textPrimary,
              lineHeight: 1.6,
            }}
          >
            "Emergency response actors lack one trusted, current, and accountable workflow that converts
            uncertain incident reports into verified needs, reserved resources, accepted assignments, and
            confirmed outcomes."
            <div style={{ marginTop: '10px', fontSize: '12px', fontStyle: 'normal', color: PAGE.textMuted }}>
              &mdash; Root-cause analysis, Problem Statement Deep Analysis
            </div>
          </blockquote>
        </div>
      </section>

      {/* ROOT CAUSE */}
      <section id="root-cause" style={sectionOuter(PAGE.bg)}>
        <div style={sectionInner}>
          <Eyebrow>
            <GitBranch size={13} /> Why Existing Tools Don't Solve It
          </Eyebrow>
          <SectionHeading>Fragmentation, not missing features</SectionHeading>
          <p style={leadStyle}>
            Disaster-mapping and crowdsourcing tools already exist. The unresolved gap isn't "no map" &mdash;
            it's a governed report-to-outcome chain that keeps resource state and task ownership accountable
            when things move fast.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {[
              { title: 'Fragmented reporting', chain: 'Disconnected intake → duplicated records → slow verification → delayed assistance' },
              { title: 'Ungoverned resource state', chain: 'Separate stock lists, no reservation → stock double-promised → failed dispatch → lost trust' },
              { title: 'Informal assignment', chain: 'Message sent ≠ task accepted → ownership assumed, not transferred → gaps or duplication' },
              { title: 'Map without provenance', chain: 'Mixed fresh/stale, verified/unverified markers → false common picture → resources sent to the wrong need' },
            ].map((item) => (
              <div key={item.title} style={statusCard(STATUS.red)}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: STATUS.red.text, marginBottom: '8px' }}>{item.title}</div>
                <div style={{ fontSize: '13px', color: '#7F1D1D', lineHeight: 1.7 }}>{item.chain}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FIVE INVARIANTS — color-coded with the app's real status-badge hues */}
      <section id="invariants" style={sectionOuter(PAGE.bgAlt)}>
        <div style={sectionInner}>
          <Eyebrow>
            <Scale size={13} /> The Core Differentiator
          </Eyebrow>
          <SectionHeading>Five invariants, enforced everywhere</SectionHeading>
          <p style={leadStyle}>
            These aren't UI copy &mdash; every one is enforced server-side, transactionally, on every state
            change in the system. The colors match the exact status badges you'll see live in the app.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {[
              { eq: 'Reported ≠ Verified', desc: 'A citizen report never becomes an actionable incident until a coordinator verifies it.', icon: <FileCheck2 size={18} />, s: STATUS.green },
              { eq: 'Displayed ≠ Uncommitted', desc: '"Available" stock excludes anything already reserved — no phantom inventory.', icon: <Boxes size={18} />, s: STATUS.blue },
              { eq: 'Sent ≠ Accepted', desc: 'A task isn’t owned until the responder explicitly accepts it — no assumed coverage.', icon: <Send size={18} />, s: STATUS.amber },
              { eq: 'Dispatched ≠ Delivered', desc: 'Stock leaving the depot isn’t "done" until delivery is confirmed at the other end.', icon: <Truck size={18} />, s: STATUS.purple },
              { eq: 'Partial ≠ Complete', desc: 'Delivered + remainder always equals what was assigned — quantities are never lost.', icon: <ClipboardCheck size={18} />, s: STATUS.amberDeep },
            ].map((item) => (
              <div key={item.eq} style={statusCard(item.s)}>
                <div style={{ color: item.s.icon, marginBottom: '12px' }}>{item.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '15px', color: item.s.text, marginBottom: '8px', fontFamily: 'monospace' }}>
                  {item.eq}
                </div>
                <div style={{ fontSize: '13px', color: item.s.text, opacity: 0.85, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW — timeline dots colored by the matching live status badge */}
      <section id="workflow" style={sectionOuter(PAGE.bg)}>
        <div style={sectionInner}>
          <Eyebrow>
            <ArrowDown size={13} /> The Lifecycle
          </Eyebrow>
          <SectionHeading>One incident, eight accountable state changes</SectionHeading>
          <p style={leadStyle}>
            Every demo run walks the same critical path across all three personas &mdash;
            Aarav (Reporter), Rajesh (Coordinator), and Chetan (Responder).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { actor: 'Aarav', title: 'Submit', desc: 'Report submitted with location, type, and severity — a reference code is issued.', s: STATUS.amber },
              { actor: 'Rajesh', title: 'Verify', desc: 'Coordinator promotes the submitted report into a verified canonical incident.', s: STATUS.green },
              { actor: 'Rajesh', title: 'Reserve', desc: 'A single atomic conditional update reserves kits; a concurrent over-allocation gets HTTP 409.', s: STATUS.blue },
              { actor: 'Rajesh → Chetan', title: 'Assign', desc: 'A task is offered with structured instructions — status starts at OFFERED, not owned.', s: STATUS.amber },
              { actor: 'Chetan', title: 'Accept', desc: 'Explicit accept or decline — ownership only transfers on an affirmative response.', s: STATUS.blue },
              { actor: 'Chetan', title: 'Dispatch', desc: 'Only the responder who accepted can dispatch; stock moves reserved → in-transit.', s: STATUS.purple },
              { actor: 'Chetan', title: 'Outcome', desc: 'Delivered and remainder quantities are reported and math-checked against what was assigned.', s: STATUS.amberDeep },
              { actor: 'Rajesh', title: 'Reconcile', desc: 'Coordinator confirms the outcome; the incident closes with a complete audit trail.', s: STATUS.green },
            ].map((step, i, arr) => (
              <div key={step.title} style={{ display: 'flex', gap: '18px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '36px', flexShrink: 0 }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: step.s.bg,
                      border: `2px solid ${step.s.icon}`,
                      color: step.s.text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  {i < arr.length - 1 && <div style={{ width: '2px', flex: 1, background: PAGE.border, minHeight: '24px' }} />}
                </div>
                <div style={{ paddingBottom: i < arr.length - 1 ? '20px' : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: PAGE.textPrimary }}>{step.title}</span>
                    <span style={{ fontSize: '11px', color: PAGE.textMuted, fontWeight: 600 }}>{step.actor}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: PAGE.textMuted, lineHeight: 1.6, maxWidth: '560px' }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '32px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {[
              'Race-condition reservation: two coordinators, exactly one winner',
              'Map goes down → operational list view fallback',
              'Partial delivery: quantities reconcile, nothing vanishes',
              'Role enforcement: a reporter can’t allocate, a responder can’t verify',
            ].map((chip) => (
              <div
                key={chip}
                style={{
                  fontSize: '12px',
                  color: PAGE.textSecondary,
                  background: PAGE.surface,
                  border: `1px solid ${PAGE.border}`,
                  borderRadius: '9999px',
                  padding: '6px 14px',
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARCHITECTURE / ZERO-AI */}
      <section id="architecture" style={sectionOuter(PAGE.bgAlt)}>
        <div style={sectionInner}>
          <Eyebrow>
            <Server size={13} /> How It's Built
          </Eyebrow>
          <SectionHeading>Deterministic by design &mdash; zero AI, zero external services</SectionHeading>
          <p style={leadStyle}>
            Node.js + Express + TypeScript, React + Leaflet, and SQLite via <code>node:sqlite</code> in WAL
            mode. Runs entirely on localhost &mdash; no cloud credentials, no external services.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {[
              { icon: <Scale size={18} />, title: 'Conservation of mass', desc: 'available + reserved + in_transit + delivered = total — a SQLite CHECK constraint, re-verified live.' },
              { icon: <Lock size={18} />, title: 'Atomic reservation', desc: 'A single conditional UPDATE inside BEGIN IMMEDIATE — no read-then-write race window.' },
              { icon: <CheckCircle2 size={18} />, title: 'Two-phase task handover', desc: 'Offer → explicit accept/decline → dispatch, guarded so only the accepting responder can dispatch.' },
              { icon: <FileCheck2 size={18} />, title: 'Append-only audit trail', desc: 'Every mutation writes an audit_events row in the same transaction; the table permits no UPDATE or DELETE.' },
              { icon: <Ban size={18} />, title: 'Zero AI / ML', desc: 'No LLM calls, embeddings, or "smart" matching — verification and allocation stay human-authorized.' },
              { icon: <PackageCheck size={18} />, title: 'Zero external services', desc: 'No Postgres, Redis, WebSockets, or cloud APIs — just Express, SQLite, and a 3s poll.' },
            ].map((item) => (
              <div key={item.title} style={cardBase}>
                <div style={{ color: PAGE.primaryDark, marginBottom: '10px' }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: PAGE.textPrimary, marginBottom: '6px' }}>{item.title}</div>
                <div style={{ fontSize: '13px', color: PAGE.textMuted, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section id="video" style={sectionOuter(PAGE.bg)}>
        <div style={{ ...sectionInner, maxWidth: '820px' }}>
          <Eyebrow>
            <PlayCircle size={13} /> Watch It Work
          </Eyebrow>
          <SectionHeading>Presentation walkthrough</SectionHeading>
          <p style={leadStyle}>The 8-step lifecycle above, walked end to end on the live system.</p>

          <div
            style={{
              aspectRatio: '16 / 9',
              width: '100%',
              borderRadius: '12px',
              border: `2px dashed ${PAGE.borderStrong}`,
              background: PAGE.surface,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              color: PAGE.textMuted,
            }}
          >
            <PlayCircle size={40} color={PAGE.textMuted} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Demo video coming soon</span>
            <span style={{ fontSize: '11px' }}>Swap this block for an embed once the walkthrough is recorded.</span>
          </div>
        </div>
      </section>

      {/* CLOSING CTA — bookends the page with the same navy chrome as the top bar */}
      <div style={{ background: NAVY.panel, padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{ ...headingStyle, fontSize: '26px', color: '#F8FAFC' }}>See the ledger enforce it live</h2>
          <p style={{ fontSize: '14px', color: NAVY.mutedText, margin: '0 0 28px 0', lineHeight: 1.6 }}>
            Switch between Reporter, Coordinator, and Responder and watch every invariant hold under a real
            race condition, a real partial delivery, and a real role boundary.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
            <PrimaryButton onClick={enterFromLanding} icon={<ArrowRight size={16} />}>
              Enter Live Demo
            </PrimaryButton>
            <SecondaryButton href={GITHUB_REPO_URL} icon={<Github size={16} />}>
              View on GitHub
            </SecondaryButton>
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            Fictional Mumbai flood scenario &mdash; all identities and stock below are demo fixtures.
          </div>
        </div>
      </div>
    </div>
  );
};
