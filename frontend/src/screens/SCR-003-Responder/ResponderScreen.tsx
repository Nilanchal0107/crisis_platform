import { useState } from 'react';
import { Truck, ShieldCheck, Inbox } from 'lucide-react';
import { useOperational } from '../../context/OperationalContext';
import { TaskCard } from './TaskCard';

export const ResponderScreen = () => {
  const { tasks, session } = useOperational();
  const [announcement, setAnnouncement] = useState('');

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* ActionFeedbackRegion: announces action results to assistive tech without a toast */}
      <div
        aria-live="polite"
        role="status"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      >
        {announcement}
      </div>

      {/* Screen Title & Volunteer Identity Bar */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '10px',
        border: '1px solid #E2E8F0',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: '#2563EB',
            color: '#FFFFFF',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Truck size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
              SCR-003 Field Responder Task Workspace
            </h2>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Volunteer: <strong>{session?.display_name ?? 'Responder'}</strong> (Kurla Quick Response Team)
            </div>
          </div>
        </div>

        <div style={{
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '6px',
          padding: '4px 10px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#1E40AF',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <ShieldCheck size={14} />
          <span>Sent ≠ Accepted</span>
        </div>
      </div>

      {/* Task List or Standby Empty State */}
      {tasks.length === 0 ? (
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '48px 24px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: '#94A3B8'
          }}>
            <Inbox size={28} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
            No Active Missions Assigned
          </h3>
          <p style={{ color: '#64748B', fontSize: '13px', maxWidth: '420px', margin: '0 auto 16px auto', lineHeight: '1.5' }}>
            Chetan is on standby for deployment orders. When BMC Agency Coordinator (Rajesh) reserves kits and deploys a mission, it will appear here for explicit acceptance.
          </p>
          <div style={{
            display: 'inline-block',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#475569'
          }}>
            💡 Tip: Switch to <strong>Rajesh (Coordinator)</strong> in the top command bar to reserve kits and offer a mission.
          </div>
        </div>
      ) : (
        <div>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onAnnounce={setAnnouncement} />
          ))}
        </div>
      )}
    </div>
  );
};
