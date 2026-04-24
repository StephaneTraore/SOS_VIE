import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import PageLayout from '../../components/layout/PageLayout';
import { StatusBadge } from '../../components/common/StatusBadge';
import { timeAgo, alertTypeIcons } from '../../utils/helpers';
import BroadcastFeed from '../../components/citizen/BroadcastFeed';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const { getMyAlerts } = useAlerts();
  const navigate = useNavigate();
  const myAlerts = user ? getMyAlerts(user.id) : [];
  const activeAlerts = myAlerts.filter(a => a.status !== 'resolved' && a.status !== 'cancelled');

  const nearbyTypes = ['medical', 'fire', 'accident', 'violence', 'flood'];
  const getAlertPath = (type: string) =>
    nearbyTypes.includes(type) ? `/citizen/nearby?type=${type}` : `/citizen/alert?type=${type}`;

  const quickActions = [
    { icon: '🏥', label: 'Urgence médicale', type: 'medical', color: '#ef4444', gradient: 'linear-gradient(135deg, #fee2e2, #fef2f2)' },
    { icon: '🔥', label: 'Incendie', type: 'fire', color: '#ea580c', gradient: 'linear-gradient(135deg, #ffedd5, #fff7ed)' },
    { icon: '🚗', label: 'Accident', type: 'accident', color: '#d97706', gradient: 'linear-gradient(135deg, #fef3c7, #fffbeb)' },
    { icon: '⚠️', label: 'Violence', type: 'violence', color: '#7c3aed', gradient: 'linear-gradient(135deg, #ede9fe, #f5f3ff)' },
  ];

  return (
    <PageLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* ── Hero Welcome Card ── */}
        <div
          className="animate-fadeInUp"
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 24,
            padding: 'clamp(26px, 4vw, 40px)',
            background: 'linear-gradient(135deg, #020d1a 0%, #03254c 50%, #023e8a 100%)',
            color: 'white',
            boxShadow: '0 20px 60px -15px rgba(2,13,26,0.35)',
            border: '1px solid rgba(0,150,199,0.25)',
          }}
        >
          {/* Ambient effects */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: -100,
              right: -80,
              width: 380,
              height: 380,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,180,216,0.25) 0%, transparent 65%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              bottom: -100,
              left: -80,
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(72,202,228,0.18) 0%, transparent 65%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(0,150,199,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,150,199,0.05) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div style={{ flex: '1 1 320px', minWidth: 260 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 14px',
                  borderRadius: 999,
                  background: 'rgba(72,202,228,0.12)',
                  border: '1px solid rgba(72,202,228,0.3)',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 2,
                  color: '#48CAE4',
                  marginBottom: 18,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#48CAE4',
                    boxShadow: '0 0 0 4px rgba(72,202,228,0.25)',
                    animation: 'pulseSoft 2s ease-in-out infinite',
                  }}
                />
                PROTECTION ACTIVE
              </div>
              <h1
                style={{
                  fontSize: 'clamp(22px, 4vw, 34px)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  marginBottom: 10,
                  letterSpacing: -1,
                }}
              >
                Bonjour, {user?.firstName}
                <span style={{ color: '#48CAE4' }}> 👋</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.65, maxWidth: 480, marginBottom: 24 }}>
                Vous êtes protégé par SOS Vie. Signalez n'importe quelle urgence en un tap — nous coordonnons les secours pour vous.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/citizen/nearby?type=medical')}
                  className="animate-emergency"
                  style={{
                    padding: 'clamp(12px,2vw,15px) clamp(22px,3vw,30px)',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none',
                    borderRadius: 14,
                    color: 'white',
                    fontSize: 'clamp(13px,2vw,15px)',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    letterSpacing: 0.3,
                    transition: 'transform 0.2s var(--ease-spring)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
                >
                  🆘 LANCER UNE ALERTE SOS
                </button>
                <button
                  onClick={() => navigate('/citizen/history')}
                  style={{
                    padding: 'clamp(12px,2vw,15px) clamp(20px,3vw,26px)',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 14,
                    color: '#cbd5e1',
                    fontSize: 'clamp(12px,2vw,14px)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = '#cbd5e1';
                  }}
                >
                  📋 Voir mon historique
                </button>
              </div>
            </div>

            {/* Emergency number */}
            <div
              className="hide-tablet"
              style={{
                padding: '18px 26px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(72,202,228,0.25)',
                borderRadius: 18,
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
                minWidth: 140,
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 800, color: '#48CAE4', letterSpacing: 2, marginBottom: 4 }}>
                URGENCES
              </div>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 900,
                  color: '#fff',
                  letterSpacing: 2,
                  lineHeight: 1,
                  background: 'linear-gradient(135deg, #48CAE4, #0096C7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                18
              </div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 5 }}>Appel gratuit</div>
            </div>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="stats-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[
            { label: 'Alertes totales', value: myAlerts.length, icon: '📋', color: '#0096C7', bg: 'linear-gradient(135deg, #e0f7fa, #f0fdff)' },
            { label: 'En cours', value: activeAlerts.length, icon: '🚨', color: '#ef4444', bg: 'linear-gradient(135deg, #fee2e2, #fef2f2)' },
            { label: 'Résolues', value: myAlerts.filter(a => a.status === 'resolved').length, icon: '✅', color: '#10b981', bg: 'linear-gradient(135deg, #d1fae5, #ecfdf5)' },
          ].map((s, i) => (
            <div
              key={s.label}
              className="card animate-fadeInUp"
              style={{
                padding: 'clamp(16px,3vw,22px)',
                animationDelay: `${0.08 + i * 0.05}s`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: s.bg,
                  opacity: 0.6,
                  pointerEvents: 'none',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', flexWrap: 'wrap' }}>
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
                      fontSize: 'clamp(24px,4vw,30px)',
                      fontWeight: 800,
                      color: s.color,
                      lineHeight: 1,
                      fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
                      letterSpacing: -1,
                    }}
                  >
                    {s.value}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, marginTop: 5 }}>{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Official broadcasts ── */}
        <div className="animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
          <BroadcastFeed title="Annonces officielles" />
        </div>

        {/* ── Quick Alert Buttons ── */}
        <div className="card animate-fadeInUp" style={{ padding: 'clamp(20px,3vw,28px)', animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: -0.3 }}>Signalement rapide</h2>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>Sélectionnez le type d'urgence pour alerter les secours</p>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: '#0096C7',
                background: 'rgba(0,180,216,0.08)',
                padding: '4px 10px',
                borderRadius: 999,
                letterSpacing: 1,
                border: '1px solid rgba(0,180,216,0.2)',
              }}
            >
              ⚡ TEMPS DE RÉPONSE &lt; 8 MIN
            </span>
          </div>
          <div className="type-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {quickActions.map(action => (
              <button
                key={action.type}
                onClick={() => navigate(getAlertPath(action.type))}
                style={{
                  padding: 'clamp(16px,2vw,22px) 12px',
                  border: `1.5px solid ${action.color}20`,
                  borderRadius: 16,
                  background: action.gradient,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'all 0.25s var(--ease-spring)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 12px 28px ${action.color}25`;
                  e.currentTarget.style.borderColor = `${action.color}55`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = `${action.color}20`;
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: 'white',
                    border: `1px solid ${action.color}25`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(22px,4vw,26px)',
                    boxShadow: `0 6px 18px ${action.color}15`,
                  }}
                >
                  {action.icon}
                </div>
                <span
                  style={{
                    fontSize: 'clamp(11px,1.5vw,12.5px)',
                    fontWeight: 700,
                    color: action.color,
                    textAlign: 'center',
                    lineHeight: 1.3,
                  }}
                >
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Active alerts ── */}
        {activeAlerts.length > 0 && (
          <div className="card animate-fadeInUp" style={{ padding: 'clamp(20px,3vw,28px)', animationDelay: '0.28s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#ef4444',
                    boxShadow: '0 0 0 4px rgba(239,68,68,0.2)',
                    animation: 'pulseSoft 1.6s ease-in-out infinite',
                  }}
                />
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: -0.3 }}>
                  Alertes actives
                </h2>
              </div>
              <button
                onClick={() => navigate('/citizen/history')}
                style={{
                  fontSize: 12,
                  color: '#0096C7',
                  background: 'rgba(0,180,216,0.08)',
                  border: '1px solid rgba(0,180,216,0.2)',
                  padding: '6px 14px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Tout voir →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeAlerts.slice(0, 3).map(alert => (
                <div
                  key={alert.id}
                  style={{
                    padding: '14px 16px',
                    border: '1px solid #e6edf3',
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
                    flexWrap: 'wrap',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e6edf3';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: '#fff',
                      border: '1px solid #e6edf3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(15,23,42,0.04)',
                    }}
                  >
                    {alertTypeIcons[alert.type]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#0f172a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {alert.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 3, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span>📍 {alert.location.address}</span>
                      <span style={{ color: '#cbd5e1' }}>•</span>
                      <span>{timeAgo(alert.createdAt)}</span>
                    </div>
                  </div>
                  <StatusBadge status={alert.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Safety Tips ── */}
        <div
          className="animate-fadeInUp"
          style={{
            animationDelay: '0.36s',
            padding: 'clamp(20px,3vw,28px)',
            borderRadius: 20,
            background: 'linear-gradient(135deg, #ecfeff 0%, #f0fdfa 100%)',
            border: '1px solid rgba(0,180,216,0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,180,216,0.12), transparent 65%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, position: 'relative' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                boxShadow: '0 6px 16px rgba(0,150,199,0.35)',
              }}
            >
              💡
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Conseils de sécurité</h3>
          </div>
          <div
            className="grid-2"
            style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}
          >
            {[
              { icon: '📱', title: 'Téléphone chargé', text: 'Maintenez votre batterie au-dessus de 30%' },
              { icon: '📍', title: 'Géolocalisation', text: 'Activez la localisation pour intervention rapide' },
              { icon: '🏠', title: 'Adresse à jour', text: 'Vérifiez votre adresse dans votre profil' },
              { icon: '🔢', title: 'Numéro 18', text: 'Appelable 24/7 depuis tout le territoire' },
            ].map(tip => (
              <div
                key={tip.title}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: 12,
                  background: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(0,180,216,0.12)',
                  borderRadius: 12,
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{tip.icon}</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{tip.title}</div>
                  <div style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.4 }}>{tip.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
