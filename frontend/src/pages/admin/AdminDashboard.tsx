import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlerts } from '../../context/AlertContext';
import PageLayout from '../../components/layout/PageLayout';
import { StatusBadge } from '../../components/common/StatusBadge';
import { timeAgo, alertTypeIcons, alertTypeLabels, priorityColors } from '../../utils/helpers';
import { AlertType } from '../../types';
import BroadcastCenter from '../../components/admin/BroadcastCenter';

const MOCK_RESPONDERS = [
  { id: '2', name: 'Ibrahima Baldé', region: 'Conakry', active: 3, resolved: 24, status: 'active' },
  { id: '6', name: 'Fatou Coulibaly', region: 'Kindia', active: 1, resolved: 18, status: 'active' },
  { id: '7', name: 'Boubacar Soumah', region: 'N\'Zérékoré', active: 0, resolved: 11, status: 'idle' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { alerts } = useAlerts();

  const active = alerts.filter(a => a.status !== 'resolved' && a.status !== 'cancelled');
  const resolved = alerts.filter(a => a.status === 'resolved');
  const critical = alerts.filter(a => a.priority === 'critical' && a.status !== 'resolved');
  const pending = alerts.filter(a => a.status === 'pending');

  const byType = alerts.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <PageLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(18px,4vw,24px)', fontWeight: 800, color: '#1a202c', marginBottom: 2 }}>🛡️ Super Admin</h1>
            <p style={{ color: '#718096', fontSize: 13 }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/admin/alerts')} style={{ padding: '8px 16px', background: '#e0f7fa', border: '1px solid #0096C7', borderRadius: 9, color: '#0096C7', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>🚨 Alertes</button>
            <button onClick={() => navigate('/admin/users')} style={{ padding: '8px 16px', background: '#e0f7fa', border: '1px solid #0077B6', borderRadius: 9, color: '#0077B6', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>👥 Utilisateurs</button>
            <button onClick={() => navigate('/admin/facilities')} style={{ padding: '8px 16px', background: '#f0fff4', border: '1px solid #2f855a', borderRadius: 9, color: '#2f855a', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>🏢 Établissements</button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid-4" style={{ gap: 14 }}>
          {[
            { label: 'Alertes actives', value: active.length, icon: '🚨', color: '#0096C7', bg: 'linear-gradient(135deg,#e0f7fa,#ffe0e0)', trend: '+12%' },
            { label: 'Critiques', value: critical.length, icon: '⚡', color: '#0077B6', bg: 'linear-gradient(135deg,#ffe0e0,#ffd0d0)', trend: '-5%' },
            { label: 'En attente', value: pending.length, icon: '⏳', color: '#d69e2e', bg: 'linear-gradient(135deg,#fffff0,#fef3c7)', trend: '+2' },
            { label: 'Résolues', value: resolved.length, icon: '✅', color: '#2f855a', bg: 'linear-gradient(135deg,#f0fff4,#d4edda)', trend: '+8' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: 14, padding: 'clamp(14px,2vw,20px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ fontSize: 'clamp(22px,3vw,26px)' }}>{s.icon}</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: `${s.color}15`, padding: '2px 7px', borderRadius: 6 }}>{s.trend}</span>
              </div>
              <div style={{ fontSize: 'clamp(26px,4vw,32px)', fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 3 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#718096', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Broadcasts to citizens */}
        <BroadcastCenter />

        {/* Charts row */}
        <div className="grid-2-col">
          {/* By type */}
          <div className="card" style={{ padding: 'clamp(16px,3vw,24px)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a202c', marginBottom: 16 }}>Alertes par type</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
                const max = Math.max(...Object.values(byType));
                const pct = (count / max) * 100;
                const colors: Record<string, string> = { medical: '#0096C7', fire: '#dd6b20', accident: '#d69e2e', violence: '#805ad5', flood: '#2b6cb0', other: '#718096' };
                const color = colors[type] || '#718096';
                return (
                  <div key={type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                      <span style={{ fontWeight: 600, color: '#4a5568' }}>{alertTypeIcons[type as AlertType]} {alertTypeLabels[type as AlertType]}</span>
                      <span style={{ fontWeight: 700, color }}>{count}</span>
                    </div>
                    <div style={{ height: 7, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Responders */}
          <div className="card" style={{ padding: 'clamp(16px,3vw,24px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a202c' }}>Secouristes</h3>
              <button onClick={() => navigate('/admin/users')} style={{ fontSize: 12, color: '#0077B6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Gérer →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MOCK_RESPONDERS.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#f7fafc', borderRadius: 9 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: r.status === 'active' ? '#f0fff4' : '#f7fafc', border: `2px solid ${r.status === 'active' ? '#48bb78' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: r.status === 'active' ? '#2f855a' : '#a0aec0', flexShrink: 0 }}>
                    {r.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1a202c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                    <div style={{ fontSize: 10, color: '#718096' }}>📍 {r.region}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: r.active > 0 ? '#0096C7' : '#a0aec0' }}>{r.active} actif(s)</div>
                    <div style={{ fontSize: 10, color: '#718096' }}>{r.resolved} résolus</div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.status === 'active' ? '#48bb78' : '#e2e8f0', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent alerts */}
        <div className="card" style={{ padding: 'clamp(16px,3vw,24px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a202c' }}>⚡ Alertes récentes</h3>
            <button onClick={() => navigate('/admin/alerts')} style={{ fontSize: 12, color: '#0096C7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Voir toutes →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alerts.slice(0, 4).map(alert => (
              <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 9, background: '#fafafa', flexWrap: 'wrap' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: priorityColors[alert.priority], flexShrink: 0 }} />
                <span style={{ fontSize: 18, flexShrink: 0 }}>{alertTypeIcons[alert.type]}</span>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a202c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.title}</div>
                  <div style={{ fontSize: 11, color: '#718096' }}>{alert.citizen.firstName} • {timeAgo(alert.createdAt)}</div>
                </div>
                <StatusBadge status={alert.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
