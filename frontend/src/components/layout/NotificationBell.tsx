import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import { useBroadcasts } from '../../context/BroadcastContext';
import { Alert, AlertStatus, BroadcastCategory, Role } from '../../types';

type NotifKind = 'new_alert' | 'status_update' | 'assigned';

interface NotifItem {
  id: string;
  kind: NotifKind;
  title: string;
  subtitle: string;
  eventTime: number;
  alertId: string;
  href: string;
  icon: string;
  accent: string;
}

const serviceForRole = (role: Role): Alert['service'] | null => {
  if (role === 'police' || role === 'admin_police') return 'police';
  if (role === 'hospital' || role === 'admin_hospital') return 'hospital';
  if (role === 'fire' || role === 'admin_fire') return 'fire';
  return null;
};

const alertHrefForRole = (role: Role): string => {
  switch (role) {
    case 'citizen': return '/citizen/history';
    case 'responder': return '/responder/alerts';
    case 'admin': return '/admin/alerts';
    case 'admin_police': return '/admin-police/dashboard';
    case 'admin_hospital': return '/admin-hospital/dashboard';
    case 'admin_fire': return '/admin-fire/dashboard';
    case 'police': return '/police/incidents';
    case 'hospital': return '/hospital/urgences';
    case 'fire': return '/fire/interventions';
    default: return '/';
  }
};

const statusLabel: Record<AlertStatus, string> = {
  pending: 'En attente',
  assigned: 'Assignée',
  in_progress: 'En cours',
  resolved: 'Résolue',
  cancelled: 'Annulée',
};

const statusAccent: Record<AlertStatus, string> = {
  pending: '#f59e0b',
  assigned: '#0096C7',
  in_progress: '#0077B6',
  resolved: '#10b981',
  cancelled: '#64748b',
};

function formatRelative(isoLike: string | number): string {
  const t = typeof isoLike === 'number' ? isoLike : new Date(isoLike).getTime();
  const diffMs = Date.now() - t;
  const s = Math.round(diffMs / 1000);
  if (s < 45) return 'à l’instant';
  const m = Math.round(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  if (d < 7) return `il y a ${d} j`;
  return new Date(t).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

const broadcastAccent: Record<BroadcastCategory, string> = {
  info: '#0077B6',
  warning: '#b45309',
  danger: '#c53030',
};
const broadcastIcon: Record<BroadcastCategory, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  danger: '🚨',
};

export default function NotificationBell() {
  const { user } = useAuth();
  const { alerts, refreshAlerts } = useAlerts();
  const { broadcasts, refresh: refreshBroadcasts } = useBroadcasts();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const storageKey = user ? `sosvie:notifs:${user.id}:lastSeen` : null;
  const [lastSeen, setLastSeen] = useState<number>(() => {
    if (!storageKey) return 0;
    const raw = localStorage.getItem(storageKey);
    return raw ? parseInt(raw, 10) || 0 : 0;
  });

  useEffect(() => {
    if (!storageKey) return;
    const raw = localStorage.getItem(storageKey);
    setLastSeen(raw ? parseInt(raw, 10) || 0 : 0);
  }, [storageKey]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  // Refresh when opening the panel
  useEffect(() => {
    if (open) {
      refreshAlerts().catch(() => {});
      refreshBroadcasts().catch(() => {});
    }
  }, [open, refreshAlerts, refreshBroadcasts]);

  // Background poll (every 60s) while user is signed in
  useEffect(() => {
    if (!user) return;
    const id = window.setInterval(() => {
      refreshAlerts().catch(() => {});
      refreshBroadcasts().catch(() => {});
    }, 60000);
    return () => window.clearInterval(id);
  }, [user, refreshAlerts, refreshBroadcasts]);

  const notifications: NotifItem[] = useMemo(() => {
    if (!user) return [];
    const role = user.role;
    const svc = serviceForRole(role);
    const href = alertHrefForRole(role);
    const items: NotifItem[] = [];

    for (const a of alerts) {
      const tUpdated = new Date(a.updatedAt || a.createdAt).getTime();

      if (role === 'citizen') {
        if (a.citizen.id !== user.id) continue;
        if (a.status === 'pending') continue; // no update yet
        items.push({
          id: `${a.id}:${a.status}`,
          kind: a.status === 'assigned' ? 'assigned' : 'status_update',
          title: `Alerte « ${a.title} »`,
          subtitle: `Statut: ${statusLabel[a.status]}`,
          eventTime: tUpdated,
          alertId: a.id,
          href,
          icon: a.status === 'resolved' ? '✅' : a.status === 'assigned' ? '🚑' : a.status === 'in_progress' ? '🏃' : '📨',
          accent: statusAccent[a.status],
        });
        continue;
      }

      // Services / service admins: only their service
      if (svc && a.service !== svc) continue;

      // Focus on items that require attention
      if (a.status === 'pending') {
        items.push({
          id: `${a.id}:new`,
          kind: 'new_alert',
          title: `Nouvelle alerte: ${a.title}`,
          subtitle: `${a.location.city || a.location.address || 'Localisation inconnue'}`,
          eventTime: new Date(a.createdAt).getTime(),
          alertId: a.id,
          href,
          icon: '🚨',
          accent: '#ef4444',
        });
      } else if (a.status === 'assigned' || a.status === 'in_progress') {
        items.push({
          id: `${a.id}:${a.status}`,
          kind: 'status_update',
          title: `${a.title}`,
          subtitle: `Statut: ${statusLabel[a.status]}`,
          eventTime: tUpdated,
          alertId: a.id,
          href,
          icon: a.status === 'in_progress' ? '🏃' : '🚑',
          accent: statusAccent[a.status],
        });
      }
    }

    // Broadcasts visible to everyone (including citizens)
    for (const b of broadcasts) {
      items.push({
        id: `broadcast:${b.id}`,
        kind: 'status_update',
        title: b.title,
        subtitle: b.message.length > 80 ? `${b.message.slice(0, 80)}…` : b.message,
        eventTime: new Date(b.createdAt).getTime(),
        alertId: b.id,
        href: user.role === 'citizen' ? '/citizen/dashboard' : href,
        icon: broadcastIcon[b.category],
        accent: broadcastAccent[b.category],
      });
    }

    items.sort((x, y) => y.eventTime - x.eventTime);
    return items.slice(0, 30);
  }, [alerts, broadcasts, user]);

  const unreadCount = useMemo(
    () => notifications.filter(n => n.eventTime > lastSeen).length,
    [notifications, lastSeen]
  );

  const markAllRead = () => {
    const now = Date.now();
    if (storageKey) localStorage.setItem(storageKey, String(now));
    setLastSeen(now);
  };

  const onItemClick = (n: NotifItem) => {
    markAllRead();
    setOpen(false);
    navigate(n.href);
  };

  if (!user) return null;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        style={{
          position: 'relative',
          background: open ? 'rgba(0,180,216,0.12)' : 'rgba(255,255,255,0.7)',
          border: `1px solid ${open ? 'rgba(0,150,199,0.35)' : 'rgba(0,150,199,0.12)'}`,
          width: 38,
          height: 38,
          borderRadius: 11,
          fontSize: 16,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          if (!open) {
            e.currentTarget.style.background = 'rgba(0,180,216,0.08)';
            e.currentTarget.style.borderColor = 'rgba(0,150,199,0.25)';
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
            e.currentTarget.style.borderColor = 'rgba(0,150,199,0.12)';
          }
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              minWidth: 18,
              height: 18,
              padding: '0 5px',
              background: '#ef4444',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              boxShadow: '0 0 0 2px rgba(239,68,68,0.25)',
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="notif-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: 360,
            maxWidth: 'calc(100vw - 24px)',
            maxHeight: 'min(70vh, 520px)',
            background: '#fff',
            border: '1px solid rgba(0,150,199,0.12)',
            borderRadius: 14,
            boxShadow: '0 20px 50px rgba(2,13,26,0.18)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 200,
            animation: 'slideDown 0.22s var(--ease-out)',
          }}
        >
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            background: 'linear-gradient(180deg, #f6f9fc, transparent)',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Notifications</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est à jour'}
              </div>
            </div>
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#0077B6',
                  background: '#e0f7fa',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 10px',
                  cursor: 'pointer',
                }}
              >
                Tout marquer lu
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: 13,
              }}>
                <div style={{ fontSize: 34, marginBottom: 8 }}>🔕</div>
                <div style={{ fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Aucune notification
                </div>
                <div style={{ fontSize: 12 }}>
                  Vous serez averti ici dès qu'il y aura du nouveau.
                </div>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {notifications.map(n => {
                  const unread = n.eventTime > lastSeen;
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => onItemClick(n)}
                        style={{
                          display: 'flex',
                          gap: 12,
                          alignItems: 'flex-start',
                          width: '100%',
                          padding: '12px 14px',
                          border: 'none',
                          background: unread ? 'rgba(0,180,216,0.05)' : '#fff',
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f6f9fc')}
                        onMouseLeave={e => (e.currentTarget.style.background = unread ? 'rgba(0,180,216,0.05)' : '#fff')}
                      >
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          background: `${n.accent}14`,
                          color: n.accent,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                          flexShrink: 0,
                        }}>
                          {n.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 13,
                            fontWeight: unread ? 800 : 600,
                            color: '#0f172a',
                            lineHeight: 1.35,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {n.title}
                          </div>
                          <div style={{
                            fontSize: 12,
                            color: '#64748b',
                            marginTop: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {n.subtitle}
                          </div>
                          <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 4, fontWeight: 600 }}>
                            {formatRelative(n.eventTime)}
                          </div>
                        </div>
                        {unread && (
                          <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: n.accent,
                            flexShrink: 0,
                            marginTop: 6,
                          }} />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
