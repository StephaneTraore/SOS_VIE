import React, { useState } from 'react';
import { useAlerts } from '../../context/AlertContext';
import PageLayout from '../../components/layout/PageLayout';
import { alertTypeLabels, alertTypeColors, alertTypeIcons, priorityColors, priorityLabels } from '../../utils/helpers';
import { AlertType, AlertPriority } from '../../types';

export default function AdminStatsPage() {
  const { alerts } = useAlerts();
  const [period, setPeriod] = useState('week');

  const total = alerts.length;
  const resolved = alerts.filter(a => a.status === 'resolved').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const byType = alerts.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {} as Record<string, number>);
  const byPriority = alerts.reduce((acc, a) => { acc[a.priority] = (acc[a.priority] || 0) + 1; return acc; }, {} as Record<string, number>);
  const byStatus = alerts.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  const dailyData = [
    { day: 'Lun', count: 4, resolved: 3 }, { day: 'Mar', count: 7, resolved: 6 },
    { day: 'Mer', count: 3, resolved: 3 }, { day: 'Jeu', count: 9, resolved: 7 },
    { day: 'Ven', count: 6, resolved: 5 }, { day: 'Sam', count: 11, resolved: 8 },
    { day: 'Dim', count: 5, resolved: 5 },
  ];
  const maxDaily = Math.max(...dailyData.map(d => d.count));

  return (
    <PageLayout>
      <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(18px,4vw,24px)', fontWeight: 800, color: '#1a202c', marginBottom: 2 }}>Statistiques 📈</h1>
            <p style={{ color: '#718096', fontSize: 13 }}>Analyse des performances du système</p>
          </div>
          <div style={{ display: 'flex', gap: 4, background: '#f7fafc', padding: 4, borderRadius: 10 }}>
            {[{ v: 'week', l: 'Semaine' }, { v: 'month', l: 'Mois' }, { v: 'year', l: 'Année' }].map(p => (
              <button key={p.v} onClick={() => setPeriod(p.v)}
                style={{ padding: '7px 12px', borderRadius: 7, border: 'none', background: period === p.v ? '#fff' : 'transparent', color: period === p.v ? '#1a202c' : '#718096', fontSize: 12, fontWeight: period === p.v ? 700 : 500, cursor: 'pointer', boxShadow: period === p.v ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', whiteSpace: 'nowrap' }}>
                {p.l}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid-4" style={{ gap: 14 }}>
          {[
            { label: 'Total alertes', value: total, icon: '📊', color: '#0077B6', sub: `+${Math.round(total * 0.12)}% ce mois` },
            { label: 'Taux résolution', value: `${resolutionRate}%`, icon: '✅', color: '#48bb78', sub: '↑ 3% vs mois dernier' },
            { label: 'Temps réponse moy.', value: '8 min', icon: '⏱️', color: '#d69e2e', sub: '↓ 1.2 min amélioration' },
            { label: 'Alertes critiques', value: alerts.filter(a => a.priority === 'critical').length, icon: '⚡', color: '#0096C7', sub: `${Math.round(alerts.filter(a => a.priority === 'critical').length / Math.max(total, 1) * 100)}% du total` },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 'clamp(14px,2vw,20px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ fontSize: 'clamp(20px,3vw,24px)' }}>{s.icon}</div>
                <span style={{ fontSize: 10, color: '#48bb78', fontWeight: 600, background: '#f0fff4', padding: '2px 6px', borderRadius: 6, textAlign: 'right', maxWidth: 100 }}>{s.sub}</span>
              </div>
              <div style={{ fontSize: 'clamp(24px,4vw,30px)', fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 3 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#718096' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="card" style={{ padding: 'clamp(16px,3vw,24px)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a202c', marginBottom: 4 }}>Activité quotidienne</h3>
          <p style={{ fontSize: 11, color: '#a0aec0', marginBottom: 18 }}>Alertes créées vs résolues par jour</p>
          <div className="stats-bar-container" style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, overflowX: 'auto', paddingBottom: 4 }}>
            {dailyData.map(d => (
              <div key={d.day} style={{ flex: '1 0 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end', minWidth: 30 }}>
                <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
                  <div style={{ width: '42%', height: `${(d.count / maxDaily) * 120}px`, background: 'linear-gradient(180deg,#0096C7,#fc8181)', borderRadius: '3px 3px 0 0', transition: 'height 0.5s ease', minHeight: 3 }} />
                  <div style={{ width: '42%', height: `${(d.resolved / maxDaily) * 120}px`, background: 'linear-gradient(180deg,#48bb78,#9ae6b4)', borderRadius: '3px 3px 0 0', transition: 'height 0.5s ease', minHeight: 3 }} />
                </div>
                <span style={{ fontSize: 10, color: '#a0aec0', fontWeight: 600 }}>{d.day}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[{ color: '#0096C7', label: 'Créées' }, { color: '#48bb78', label: 'Résolues' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#718096' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />{l.label}
              </div>
            ))}
          </div>
        </div>

        <div className="grid-2-col">
          {/* By type */}
          <div className="card" style={{ padding: 'clamp(16px,3vw,24px)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a202c', marginBottom: 18 }}>Répartition par type</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
                const pct = Math.round((count / total) * 100);
                const color = alertTypeColors[type as AlertType];
                return (
                  <div key={type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                      <span style={{ fontWeight: 600, color: '#2d3748' }}>{alertTypeIcons[type as AlertType]} {alertTypeLabels[type as AlertType]}</span>
                      <span style={{ color, fontWeight: 700 }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 9, background: '#f0f0f0', borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}aa)`, borderRadius: 5, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By priority + status */}
          <div className="card" style={{ padding: 'clamp(16px,3vw,24px)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a202c', marginBottom: 18 }}>Répartition par priorité</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {['critical', 'high', 'medium', 'low'].map(priority => {
                const count = byPriority[priority] || 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const color = priorityColors[priority as AlertPriority];
                return (
                  <div key={priority}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                      <span style={{ fontWeight: 600, color: '#2d3748' }}>{priorityLabels[priority as AlertPriority]}</span>
                      <span style={{ color, fontWeight: 700 }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 9, background: '#f0f0f0', borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}99)`, borderRadius: 5, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #f0f0f0' }}>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: '#a0aec0', marginBottom: 10, letterSpacing: 0.5 }}>PAR STATUT</h4>
              <div className="grid-2" style={{ gap: 7 }}>
                {Object.entries(byStatus).map(([status, count]) => (
                  <div key={status} style={{ padding: '7px 10px', background: '#f7fafc', borderRadius: 7, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: '#718096', fontWeight: 500, textTransform: 'capitalize' }}>{status.replace('_', ' ')}</span>
                    <span style={{ fontWeight: 700, color: '#1a202c' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="card" style={{ padding: 'clamp(16px,3vw,24px)', background: 'linear-gradient(135deg,#1a202c,#2d3748)', color: 'white' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>🏆 Indicateurs de performance</h3>
          <div className="grid-4" style={{ gap: 16 }}>
            {[
              { label: 'SLA Respecté', value: '94%', icon: '🎯', good: true },
              { label: 'Alertes / Jour', value: `${Math.round(total / 7)}`, icon: '📅', good: null },
              { label: 'Secouristes actifs', value: '3/7', icon: '🚑', good: true },
              { label: 'Satisfaction', value: '4.7/5', icon: '⭐', good: true },
            ].map(m => (
              <div key={m.label} style={{ textAlign: 'center', padding: 'clamp(12px,2vw,16px)', background: 'rgba(255,255,255,0.06)', borderRadius: 11 }}>
                <div style={{ fontSize: 'clamp(20px,3vw,24px)', marginBottom: 6 }}>{m.icon}</div>
                <div style={{ fontSize: 'clamp(18px,3vw,22px)', fontWeight: 800, color: m.good === true ? '#68d391' : m.good === false ? '#fc8181' : 'white', marginBottom: 3 }}>{m.value}</div>
                <div style={{ fontSize: 10, color: '#a0aec0' }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
