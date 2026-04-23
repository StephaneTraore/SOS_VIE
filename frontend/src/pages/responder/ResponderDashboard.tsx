import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import PageLayout from '../../components/layout/PageLayout';
import { PriorityBadge } from '../../components/common/StatusBadge';
import { timeAgo, alertTypeIcons, priorityColors } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ResponderDashboard() {
  const { user } = useAuth();
  const { alerts, updateAlertStatus, assignAlert } = useAlerts();
  const navigate = useNavigate();
  const [accepting, setAccepting] = useState<string | null>(null);

  const activeAlerts = alerts.filter(a => a.status !== 'resolved' && a.status !== 'cancelled');
  const myAlerts = alerts.filter(a => a.responder?.id === user?.id);
  const pendingAlerts = alerts.filter(a => a.status === 'pending');
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;

  const handleAccept = async (alertId: string) => {
    if (!user) return;
    setAccepting(alertId);
    await new Promise(r => setTimeout(r, 600));
    assignAlert(alertId, user.id, user);
    updateAlertStatus(alertId, 'in_progress');
    toast.success('Alerte acceptée !');
    setAccepting(null);
  };

  const handleResolve = (alertId: string) => {
    updateAlertStatus(alertId, 'resolved');
    toast.success('Alerte résolue !');
  };

  return (
    <PageLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }} className="page-enter">

        {/* ── Header ── */}
        <div
          className="animate-fadeInUp"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 14,
            padding: '20px 24px',
            borderRadius: 18,
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
            border: '1px solid rgba(16,185,129,0.18)',
            boxShadow: '0 4px 16px rgba(15,23,42,0.04)',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '3px 11px',
                borderRadius: 999,
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)',
                fontSize: 10,
                fontWeight: 800,
                color: '#059669',
                letterSpacing: 1.5,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#10b981',
                  animation: 'pulseSoft 1.8s infinite',
                }}
              />
              EN SERVICE
            </div>
            <h1
              style={{
                fontSize: 'clamp(20px,4vw,28px)',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: -0.8,
                lineHeight: 1.2,
              }}
            >
              Bonjour, {user?.firstName} 🚑
            </h1>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
              Tableau de bord d'intervention — Mise à jour en temps réel
            </p>
          </div>
          <button
            onClick={() => navigate('/responder/map')}
            style={{
              padding: '11px 20px',
              background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
              border: 'none',
              borderRadius: 12,
              color: 'white',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 22px rgba(0,150,199,0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            🗺️ Voir la carte
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid-4" style={{ gap: 14 }}>
          {[
            { label: 'Alertes actives', value: activeAlerts.length, icon: '🚨', color: '#ef4444', bg: 'linear-gradient(135deg, #fee2e2, #fef2f2)' },
            { label: 'En attente', value: pendingAlerts.length, icon: '⏳', color: '#d97706', bg: 'linear-gradient(135deg, #fef3c7, #fffbeb)' },
            { label: 'Mes interventions', value: myAlerts.filter(a => a.status === 'in_progress').length, icon: '🚑', color: '#10b981', bg: 'linear-gradient(135deg, #d1fae5, #ecfdf5)' },
            { label: 'Résolus', value: resolvedCount, icon: '✅', color: '#0096C7', bg: 'linear-gradient(135deg, #e0f7fa, #f0fdff)' },
          ].map((s, i) => (
            <div
              key={s.label}
              className="card animate-fadeInUp"
              style={{
                padding: 'clamp(16px,2vw,22px)',
                position: 'relative',
                overflow: 'hidden',
                animationDelay: `${0.05 + i * 0.05}s`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 110,
                  height: 110,
                  borderRadius: '50%',
                  background: s.bg,
                  opacity: 0.55,
                  pointerEvents: 'none',
                }}
              />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    background: s.bg,
                    border: `1px solid ${s.color}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 'clamp(24px,3vw,28px)',
                      fontWeight: 800,
                      color: s.color,
                      lineHeight: 1,
                      fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
                      letterSpacing: -1,
                    }}
                  >
                    {s.value}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 5 }}>{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Pending alerts ── */}
        {pendingAlerts.length > 0 && (
          <div
            className="card animate-fadeInUp"
            style={{
              padding: 'clamp(20px,3vw,26px)',
              border: '2px solid #fecaca',
              background: 'linear-gradient(135deg, #fff 0%, #fef2f2 100%)',
              animationDelay: '0.22s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  background: '#ef4444',
                  boxShadow: '0 0 0 4px rgba(239,68,68,0.22)',
                  animation: 'pulseSoft 1.6s infinite',
                }}
              />
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#dc2626', letterSpacing: -0.3 }}>
                Alertes en attente ({pendingAlerts.length})
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingAlerts.map(alert => (
                <div
                  key={alert.id}
                  style={{
                    padding: '14px 16px',
                    border: '1px solid #fde2e4',
                    borderRadius: 14,
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                    boxShadow: '0 2px 6px rgba(239,68,68,0.04)',
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: priorityColors[alert.priority],
                      flexShrink: 0,
                      boxShadow: `0 0 0 3px ${priorityColors[alert.priority]}20`,
                    }}
                  />
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{alertTypeIcons[alert.type]}</span>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{alert.title}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>
                      📍 {alert.location.address} • {timeAgo(alert.createdAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <PriorityBadge priority={alert.priority} />
                    <button
                      onClick={() => handleAccept(alert.id)}
                      disabled={accepting === alert.id}
                      style={{
                        padding: '8px 15px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        borderRadius: 10,
                        color: 'white',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        opacity: accepting === alert.id ? 0.7 : 1,
                        whiteSpace: 'nowrap',
                        boxShadow: '0 6px 16px rgba(16,185,129,0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {accepting === alert.id ? '⏳' : '✓'} Prendre en charge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── My active interventions ── */}
        <div className="card animate-fadeInUp" style={{ padding: 'clamp(20px,3vw,26px)', animationDelay: '0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: -0.3 }}>
              Mes interventions actives
            </h2>
            <button
              onClick={() => navigate('/responder/alerts')}
              style={{
                fontSize: 12,
                color: '#0096C7',
                background: 'rgba(0,180,216,0.08)',
                border: '1px solid rgba(0,180,216,0.2)',
                padding: '6px 13px',
                borderRadius: 999,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Voir toutes →
            </button>
          </div>
          {myAlerts.filter(a => a.status === 'in_progress').length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: 42, marginBottom: 10 }}>🟢</div>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: '#64748b' }}>
                Aucune intervention en cours
              </p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                Les nouvelles alertes apparaîtront automatiquement
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myAlerts.filter(a => a.status === 'in_progress').map(alert => (
                <div
                  key={alert.id}
                  style={{
                    padding: '14px 16px',
                    border: '1px solid #a7f3d0',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #ecfdf5, #f0fdfa)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{alertTypeIcons[alert.type]}</span>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{alert.title}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>
                      📍 {alert.location.address} • {timeAgo(alert.createdAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => navigate('/responder/alerts')}
                      style={{
                        padding: '7px 13px',
                        border: '1px solid #cbd5e1',
                        borderRadius: 10,
                        background: '#fff',
                        color: '#475569',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Détails
                    </button>
                    <button
                      onClick={() => handleResolve(alert.id)}
                      style={{
                        padding: '7px 14px',
                        border: 'none',
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                      }}
                    >
                      ✓ Résoudre
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Map shortcut ── */}
        <div
          className="card animate-fadeInUp"
          style={{
            padding: 'clamp(20px,3vw,26px)',
            cursor: 'pointer',
            animationDelay: '0.38s',
            transition: 'all 0.25s',
          }}
          onClick={() => navigate('/responder/map')}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: -0.3 }}>
              🗺️ Carte des interventions
            </h2>
            <span style={{ fontSize: 12, color: '#0096C7', fontWeight: 700 }}>Ouvrir →</span>
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, #020d1a, #03254c)',
              borderRadius: 14,
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(0,180,216,0.15)',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'radial-gradient(circle, rgba(72,202,228,0.08) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,180,216,0.2), transparent 65%)',
                filter: 'blur(30px)',
              }}
            />
            {activeAlerts.slice(0, 5).map((a, i) => (
              <div
                key={a.id}
                style={{
                  position: 'absolute',
                  left: `${12 + i * 17}%`,
                  top: `${22 + (i % 2) * 40}%`,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#ef4444',
                  border: '2px solid white',
                  boxShadow: '0 0 0 4px rgba(239,68,68,0.35), 0 0 12px rgba(239,68,68,0.5)',
                  animation: 'pulseSoft 2s infinite',
                }}
              />
            ))}
            <div
              style={{
                color: 'white',
                fontSize: 14,
                fontWeight: 700,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 20 }}>📍</span>
              {activeAlerts.length} alertes actives sur la carte
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
