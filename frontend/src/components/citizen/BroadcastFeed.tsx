import React from 'react';
import { useBroadcasts } from '../../context/BroadcastContext';
import { Broadcast, BroadcastCategory } from '../../types';

const categoryConfig: Record<BroadcastCategory, { label: string; icon: string; color: string; light: string; border: string; }> = {
  info:    { label: 'Info',     icon: 'ℹ️', color: '#0077B6', light: '#e0f7fa', border: '#90cdf4' },
  warning: { label: 'Attention', icon: '⚠️', color: '#b45309', light: '#fef3c7', border: '#fde68a' },
  danger:  { label: 'Alerte',    icon: '🚨', color: '#c53030', light: '#fed7d7', border: '#feb2b2' },
};

const serviceLabel: Record<string, string> = {
  police: 'Police Nationale',
  hospital: 'Service Hospitalier',
  fire: 'Sapeurs-Pompiers',
  admin: 'Administration',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.round(diff / 1000);
  if (s < 60) return 'à l\'instant';
  const m = Math.round(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  return `il y a ${d} j`;
}

interface Props {
  /** Limit the number of items displayed (e.g. for dashboard summary). */
  limit?: number;
  /** Title shown above the list. */
  title?: string;
}

export default function BroadcastFeed({ limit, title = 'Annonces officielles' }: Props) {
  const { broadcasts } = useBroadcasts();

  const items = (limit ? broadcasts.slice(0, limit) : broadcasts);

  if (items.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>📢 {title}</h3>
        <span style={{ fontSize: 11, color: '#64748b' }}>{broadcasts.length} annonce(s)</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((b: Broadcast) => {
          const cfg = categoryConfig[b.category];
          const origin = (b.authorService && serviceLabel[b.authorService]) || 'Administration';
          return (
            <div key={b.id}
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: cfg.light,
                border: `1px solid ${cfg.border}`,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}>
              <div style={{
                width: 34, height: 34,
                borderRadius: 10,
                background: cfg.color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, flexShrink: 0,
              }}>{cfg.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
                    color: cfg.color, textTransform: 'uppercase',
                    background: '#fff', padding: '2px 8px', borderRadius: 999,
                  }}>{cfg.label}</span>
                  <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>
                    {origin} · {timeAgo(b.createdAt)}
                  </span>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>{b.title}</div>
                <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.6, marginTop: 4, whiteSpace: 'pre-wrap' }}>
                  {b.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
