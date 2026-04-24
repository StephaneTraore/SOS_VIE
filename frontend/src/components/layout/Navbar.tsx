import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';
import NotificationBell from './NotificationBell';

const navItemsByRole: Record<string, { path: string; label: string; icon: string }[]> = {
  citizen: [
    { path: '/citizen/dashboard', label: 'Accueil', icon: '🏠' },
    { path: '/citizen/alert', label: 'SOS Alert', icon: '🆘' },
    { path: '/citizen/history', label: 'Historique', icon: '📋' },
    { path: '/citizen/profile', label: 'Profil', icon: '👤' },
  ],
  responder: [
    { path: '/responder/dashboard', label: 'Tableau de bord', icon: '📊' },
    { path: '/responder/alerts', label: 'Alertes actives', icon: '🚨' },
    { path: '/responder/map', label: 'Carte', icon: '🗺️' },
    { path: '/responder/profile', label: 'Profil', icon: '👤' },
  ],
  admin: [
    { path: '/admin/dashboard', label: 'Tableau de bord', icon: '📊' },
    { path: '/admin/alerts', label: 'Alertes', icon: '🚨' },
    { path: '/admin/users', label: 'Utilisateurs', icon: '👥' },
    { path: '/admin/facilities', label: 'Établissements', icon: '🏢' },
    { path: '/admin/stats', label: 'Statistiques', icon: '📈' },
  ],
  admin_police: [
    { path: '/admin-police/dashboard', label: 'Tableau de bord', icon: '📊' },
    { path: '/admin-police/profile', label: 'Profil', icon: '👤' },
  ],
  admin_hospital: [
    { path: '/admin-hospital/dashboard', label: 'Tableau de bord', icon: '📊' },
    { path: '/admin-hospital/profile', label: 'Profil', icon: '👤' },
  ],
  admin_fire: [
    { path: '/admin-fire/dashboard', label: 'Tableau de bord', icon: '📊' },
    { path: '/admin-fire/profile', label: 'Profil', icon: '👤' },
  ],
  police: [
    { path: '/police/dashboard', label: 'Tableau de bord', icon: '📊' },
    { path: '/police/incidents', label: 'Incidents', icon: '🚔' },
    { path: '/police/profile', label: 'Profil', icon: '👤' },
  ],
  hospital: [
    { path: '/hospital/dashboard', label: 'Tableau de bord', icon: '📊' },
    { path: '/hospital/urgences', label: 'Urgences médicales', icon: '🏥' },
    { path: '/hospital/profile', label: 'Profil', icon: '👤' },
  ],
  fire: [
    { path: '/fire/dashboard', label: 'Tableau de bord', icon: '📊' },
    { path: '/fire/interventions', label: 'Interventions', icon: '🚒' },
    { path: '/fire/profile', label: 'Profil', icon: '👤' },
  ],
};

const roleColors: Record<string, string> = {
  citizen: '#0096C7',
  responder: '#10b981',
  admin: '#0077B6',
  admin_police: '#2b4694',
  admin_hospital: '#059669',
  admin_fire: '#ea580c',
  police: '#2b4694',
  hospital: '#059669',
  fire: '#ea580c',
};
const roleLabels: Record<string, string> = {
  citizen: 'Citoyen',
  responder: 'Secouriste',
  admin: 'Super Admin',
  admin_police: 'Admin Police',
  admin_hospital: 'Admin Hôpital',
  admin_fire: 'Admin Pompiers',
  police: 'Police Nationale',
  hospital: 'Hôpital / Clinique',
  fire: 'Sapeurs-Pompiers',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!user) return null;

  const navItems = navItemsByRole[user.role] || [];
  const color = roleColors[user.role] || '#0096C7';

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
    setMenuOpen(false);
  };

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: scrolled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: `1px solid ${scrolled ? 'rgba(0,150,199,0.12)' : 'rgba(0,150,199,0.06)'}`,
          boxShadow: scrolled ? '0 4px 24px rgba(2,13,26,0.06)' : 'none',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.25s var(--ease)',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            width: '100%',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {/* Logo */}
          <div
            onClick={() => handleNav(navItems[0]?.path || '/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              cursor: 'pointer',
              marginRight: 28,
              flexShrink: 0,
            }}
          >
            <Logo size={38} />
            <div className="hide-mobile">
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 900,
                  color: '#0f172a',
                  lineHeight: 1,
                  letterSpacing: -0.5,
                }}
              >
                SOS VIE
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: '#0096C7',
                  letterSpacing: 2,
                  marginTop: 3,
                }}
              >
                GUINÉE
              </div>
            </div>
          </div>

          {/* Desktop Nav links */}
          <div className="nav-links">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    background: isActive ? 'rgba(0,150,199,0.1)' : 'transparent',
                    color: isActive ? '#0077B6' : '#475569',
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s var(--ease)',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(0,150,199,0.06)';
                      e.currentTarget.style.color = '#0077B6';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#475569';
                    }
                  }}
                >
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  {item.label}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: -11,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: '#0096C7',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            {/* Role badge */}
            <span
              className="hide-mobile"
              style={{
                padding: '5px 12px',
                borderRadius: 999,
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: 0.3,
                background: `${color}14`,
                color,
                border: `1px solid ${color}28`,
                textTransform: 'uppercase',
              }}
            >
              {roleLabels[user.role]}
            </span>

            {/* Notification bell */}
            <NotificationBell />

            {/* User avatar / menu — desktop */}
            <div style={{ position: 'relative' }} className="hide-mobile">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(0,150,199,0.14)',
                  padding: '5px 12px 5px 5px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(0,180,216,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(0,150,199,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
                  e.currentTarget.style.borderColor = 'rgba(0,150,199,0.14)';
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 800,
                    flexShrink: 0,
                    boxShadow: `0 4px 10px ${color}35`,
                  }}
                >
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                  {user.firstName}
                </span>
                <span style={{ fontSize: 9, color: '#94a3b8' }}>▼</span>
              </button>
              <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 10px)',
                    background: '#fff',
                    border: '1px solid rgba(0,150,199,0.12)',
                    borderRadius: 14,
                    boxShadow: '0 20px 50px rgba(2,13,26,0.15)',
                    minWidth: 220,
                    overflow: 'hidden',
                    zIndex: 200,
                    transformOrigin: 'top right',
                  }}
                >
                  <div
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      background: 'linear-gradient(180deg, #f6f9fc, transparent)',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                      {user.firstName} {user.lastName}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#94a3b8',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: 2,
                      }}
                    >
                      {user.email}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleNav(`/${user.role}/profile`);
                      setMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: 13,
                      color: '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    👤 Mon profil
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                      setMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: 13,
                      color: '#dc2626',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontWeight: 600,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    🚪 Déconnexion
                  </button>
                </motion.div>
              )}
              </AnimatePresence>
            </div>

            {/* Hamburger — mobile only */}
            <button
              className="nav-hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(0,150,199,0.14)',
                width: 38,
                height: 38,
                borderRadius: 11,
                fontSize: 18,
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#0077B6',
              }}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </nav>

      {/* Mobile slide-in menu */}
      <AnimatePresence>
      {mobileOpen && (
        <motion.div
          className="nav-mobile-menu"
          onClick={() => setMobileOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ display: 'block' }}
        >
          <motion.div
            className="nav-mobile-panel"
            onClick={e => e.stopPropagation()}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* User info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                background: `linear-gradient(135deg, ${color}10, ${color}05)`,
                border: `1px solid ${color}20`,
                borderRadius: 14,
                marginBottom: 22,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 800,
                  flexShrink: 0,
                  boxShadow: `0 6px 14px ${color}40`,
                }}
              >
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                  {user.firstName} {user.lastName}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color,
                    background: `${color}18`,
                    padding: '3px 9px',
                    borderRadius: 10,
                    letterSpacing: 0.3,
                    textTransform: 'uppercase',
                  }}
                >
                  {roleLabels[user.role]}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 11,
                      border: 'none',
                      background: isActive ? `${color}12` : 'transparent',
                      color: isActive ? color : '#334155',
                      fontSize: 14,
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div style={{ height: 1, background: '#e6edf3', marginBottom: 16 }} />

            <button
              onClick={() => {
                logout();
                navigate('/');
                setMobileOpen(false);
              }}
              style={{
                width: '100%',
                padding: '13px 16px',
                borderRadius: 11,
                border: '1px solid #fecaca',
                background: '#fef2f2',
                color: '#dc2626',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              🚪 Déconnexion
            </button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
