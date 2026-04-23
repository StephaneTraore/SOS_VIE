import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import PageLayout from '../../components/layout/PageLayout';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { timeAgo, alertTypeIcons, priorityColors } from '../../utils/helpers';
import Modal from '../../components/common/Modal';
import LocationMapModal from '../../components/common/LocationMapModal';
import { Alert } from '../../types';
import toast from 'react-hot-toast';

const HOSP_COLOR = '#2f855a';
const HOSP_LIGHT = '#f0fff4';

export default function HospitalDashboard() {
  const { user } = useAuth();
  const { alerts, updateAlertStatus } = useAlerts();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Alert | null>(null);
  const [notes, setNotes] = useState('');
  const [mapOpen, setMapOpen] = useState(false);

  // Only see alerts assigned to this agent
  const allAlerts = alerts.filter(a => a.service === 'hospital' && a.responder?.id === user?.id);
  const active = allAlerts.filter(a => a.status !== 'resolved' && a.status !== 'cancelled');
  const filtered = filter === 'all' ? allAlerts
    : filter === 'active' ? active
    : allAlerts.filter(a => a.status === filter);

  const handleStart = (alert: Alert) => {
    updateAlertStatus(alert.id, 'in_progress');
    toast.success('Patient pris en charge !');
    setSelected(null);
  };

  const handleResolve = (alert: Alert) => {
    updateAlertStatus(alert.id, 'resolved', notes);
    toast.success('Cas médical clôturé.');
    setSelected(null);
    setNotes('');
  };

  const tabs = [
    { value: 'all', label: 'Tous', count: allAlerts.length },
    { value: 'active', label: 'Actifs', count: active.length },
    { value: 'assigned', label: 'Assignés', count: allAlerts.filter(a => a.status === 'assigned').length },
    { value: 'resolved', label: 'Traités', count: allAlerts.filter(a => a.status === 'resolved').length },
  ];

  return (
    <PageLayout>
      <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${HOSP_COLOR}, #1a5c3a)`, borderRadius: 16, padding: 'clamp(20px,3vw,28px)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🏥</div>
            <div>
              <h1 style={{ fontSize: 'clamp(16px,3vw,22px)', fontWeight: 800, marginBottom: 3 }}>Cliniques & Hôpitaux</h1>
              <p style={{ fontSize: 12, opacity: 0.75 }}>Gestion des urgences médicales</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#68d391', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>En service — {user?.firstName} {user?.lastName}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ gap: 14 }}>
          {[
            { label: 'Total cas', value: allAlerts.length, icon: '📋', color: HOSP_COLOR, bg: HOSP_LIGHT },
            { label: 'En attente', value: allAlerts.filter(a => a.status === 'pending').length, icon: '⏳', color: '#d69e2e', bg: '#fffff0' },
            { label: 'En traitement', value: allAlerts.filter(a => a.status === 'in_progress').length, icon: '🏥', color: '#0096C7', bg: '#e0f7fa' },
            { label: 'Traités', value: allAlerts.filter(a => a.status === 'resolved').length, icon: '✅', color: '#48bb78', bg: '#f0fff4' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: 14, padding: 'clamp(14px,2vw,20px)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 'clamp(22px,3vw,28px)', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 'clamp(22px,3vw,26px)', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#718096', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#f7fafc', padding: 4, borderRadius: 12, width: 'fit-content', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.value} onClick={() => setFilter(t.value)}
              style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: filter === t.value ? '#fff' : 'transparent', color: filter === t.value ? '#1a202c' : '#718096', fontSize: 13, fontWeight: filter === t.value ? 700 : 500, cursor: 'pointer', boxShadow: filter === t.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              {t.label}
              {t.count > 0 && <span style={{ background: filter === t.value ? HOSP_COLOR : '#e2e8f0', color: filter === t.value ? 'white' : '#718096', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Cas médicaux */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#a0aec0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏥</div>
            <p style={{ fontSize: 15, fontWeight: 600 }}>Aucun cas assigné</p>
            <p style={{ fontSize: 13, color: '#a0aec0', marginTop: 4 }}>Les cas vous seront assignés par l'administration</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(alert => (
              <div key={alert.id} className="card" style={{ padding: '16px 18px', cursor: 'pointer', borderLeft: `4px solid ${priorityColors[alert.priority]}`, transition: 'all 0.2s' }}
                onClick={() => setSelected(alert)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: HOSP_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {alertTypeIcons[alert.type]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a202c', marginBottom: 4 }}>{alert.title}</div>
                    <div style={{ fontSize: 12, color: '#718096', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.description}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#a0aec0', flexWrap: 'wrap' }}>
                      <span>📍 {alert.location.address}</span>
                      <span>👤 {alert.citizen.firstName} {alert.citizen.lastName}</span>
                      <span>🕐 {timeAgo(alert.createdAt)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <PriorityBadge priority={alert.priority} />
                    <StatusBadge status={alert.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setNotes(''); }} title="Détail du cas médical" size="lg">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <StatusBadge status={selected.status} />
              <PriorityBadge priority={selected.priority} />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1a202c', marginBottom: 8 }}>{selected.title}</h3>
              <p style={{ fontSize: 14, color: '#4a5568', lineHeight: 1.7, background: '#f7fafc', padding: '12px 16px', borderRadius: 10 }}>{selected.description}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setMapOpen(true)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setMapOpen(true); }}
                style={{ padding: 14, background: HOSP_LIGHT, borderRadius: 12, cursor: 'pointer', border: `1px solid transparent`, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = HOSP_COLOR; e.currentTarget.style.boxShadow = `0 4px 14px ${HOSP_COLOR}25`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
                title="Cliquer pour voir la position sur la carte"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#a0aec0' }}>LOCALISATION</div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: HOSP_COLOR, background: '#fff', padding: '2px 7px', borderRadius: 6 }}>🗺️ Voir sur la carte</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{selected.location.address}</div>
                <div style={{ fontSize: 12, color: '#718096' }}>{selected.location.city}</div>
              </div>
              <div style={{ padding: 14, background: '#f7fafc', borderRadius: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#a0aec0', marginBottom: 6 }}>PATIENT</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{selected.citizen.firstName} {selected.citizen.lastName}</div>
                <div style={{ fontSize: 12, color: '#718096' }}>{selected.citizen.phone}</div>
                <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 4 }}>Signalé {timeAgo(selected.createdAt)}</div>
              </div>
            </div>
            {selected.status === 'in_progress' && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 6 }}>Notes médicales (optionnel)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Diagnostic, traitement effectué..." rows={3}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, outline: 'none', resize: 'vertical' }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {selected.status === 'assigned' && (
                <button onClick={() => handleStart(selected)} style={{ flex: 1, minWidth: 180, padding: 12, background: HOSP_COLOR, border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  🏥 Prendre en charge
                </button>
              )}
              {selected.status === 'in_progress' && (
                <button onClick={() => handleResolve(selected)} style={{ flex: 1, minWidth: 180, padding: 12, background: '#0077B6', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  ✓ Marquer comme traité
                </button>
              )}
              <button onClick={() => { setSelected(null); setNotes(''); }} style={{ padding: '12px 20px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#4a5568', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>

      {selected && (
        <LocationMapModal
          isOpen={mapOpen}
          onClose={() => setMapOpen(false)}
          location={selected.location}
          citizenName={`${selected.citizen.firstName} ${selected.citizen.lastName}`}
          citizenPhone={selected.citizen.phone}
          accentColor={HOSP_COLOR}
          accentIcon="🏥"
          title={`Localisation — ${selected.title}`}
        />
      )}
    </PageLayout>
  );
}
