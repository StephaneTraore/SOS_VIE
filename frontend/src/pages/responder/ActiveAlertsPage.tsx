import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import PageLayout from '../../components/layout/PageLayout';
import { StatusBadge, PriorityBadge, TypeBadge } from '../../components/common/StatusBadge';
import { timeAgo, alertTypeIcons, priorityColors, alertTypeColors } from '../../utils/helpers';
import Modal from '../../components/common/Modal';
import LocationMapModal from '../../components/common/LocationMapModal';
import { Alert } from '../../types';
import toast from 'react-hot-toast';

export default function ActiveAlertsPage() {
  const { user } = useAuth();
  const { alerts, updateAlertStatus, assignAlert } = useAlerts();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Alert | null>(null);
  const [notes, setNotes] = useState('');
  const [mapOpen, setMapOpen] = useState(false);

  const active = alerts.filter(a => a.status !== 'resolved' && a.status !== 'cancelled');
  const filtered = filter === 'all' ? active : filter === 'mine' ? active.filter(a => a.responder?.id === user?.id) : active.filter(a => a.status === filter);

  const handleAccept = (alert: Alert) => {
    if (!user) return;
    assignAlert(alert.id, user.id, user);
    updateAlertStatus(alert.id, 'in_progress');
    toast.success('Intervention prise en charge !');
    setSelected(null);
  };

  const handleResolve = (alert: Alert) => {
    updateAlertStatus(alert.id, 'resolved', notes);
    toast.success('Alerte résolue avec succès !');
    setSelected(null);
    setNotes('');
  };

  const tabs = [
    { value: 'all', label: 'Toutes', count: active.length },
    { value: 'pending', label: 'En attente', count: active.filter(a => a.status === 'pending').length },
    { value: 'in_progress', label: 'En cours', count: active.filter(a => a.status === 'in_progress').length },
    { value: 'mine', label: 'Mes alertes', count: active.filter(a => a.responder?.id === user?.id).length },
  ];

  return (
    <PageLayout>
      <div className="page-enter">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a202c', marginBottom: 4 }}>Alertes actives 🚨</h1>
          <p style={{ color: '#718096', fontSize: 14 }}>{active.length} alerte(s) nécessitent une intervention</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f7fafc', padding: 4, borderRadius: 12, width: 'fit-content' }}>
          {tabs.map(t => (
            <button key={t.value} onClick={() => setFilter(t.value)}
              style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: filter === t.value ? '#fff' : 'transparent', color: filter === t.value ? '#1a202c' : '#718096', fontSize: 13, fontWeight: filter === t.value ? 700 : 500, cursor: 'pointer', boxShadow: filter === t.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {t.label}
              {t.count > 0 && <span style={{ background: filter === t.value ? '#0096C7' : '#e2e8f0', color: filter === t.value ? 'white' : '#718096', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{t.count}</span>}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#a0aec0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>Aucune alerte dans cette catégorie</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(alert => (
              <div key={alert.id} className="card" style={{ padding: '18px 20px', cursor: 'pointer', borderLeft: `4px solid ${priorityColors[alert.priority]}`, transition: 'all 0.2s' }}
                onClick={() => setSelected(alert)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f7fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    {alertTypeIcons[alert.type]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a202c', marginBottom: 4 }}>{alert.title}</div>
                    <div style={{ fontSize: 12, color: '#718096', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.description}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#a0aec0', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span>📍 {alert.location.address}, {alert.location.city}</span>
                      <span>👤 {alert.citizen.firstName} {alert.citizen.lastName}</span>
                      <span>🕐 {timeAgo(alert.createdAt)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <PriorityBadge priority={alert.priority} />
                    <StatusBadge status={alert.status} />
                    {alert.responder ? (
                      <span style={{ fontSize: 11, color: '#48bb78', fontWeight: 600 }}>🚑 {alert.responder.firstName}</span>
                    ) : (
                      <span style={{ fontSize: 11, color: '#0096C7', fontWeight: 600 }}>⚡ Non assigné</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setNotes(''); }} title="Détail de l'alerte" size="lg">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <TypeBadge type={selected.type} />
              <StatusBadge status={selected.status} />
              <PriorityBadge priority={selected.priority} />
            </div>

            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a202c', marginBottom: 8 }}>{selected.title}</h3>
              <p style={{ fontSize: 14, color: '#4a5568', lineHeight: 1.7, background: '#f7fafc', padding: '12px 16px', borderRadius: 10 }}>{selected.description}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setMapOpen(true)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setMapOpen(true); }}
                style={{ padding: '14px', background: '#f7fafc', borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s', border: '1px solid transparent', position: 'relative' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e0f7fa'; e.currentTarget.style.borderColor = '#0096C7'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f7fafc'; e.currentTarget.style.borderColor = 'transparent'; }}
                title="Cliquer pour voir la position sur la carte"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#a0aec0' }}>LOCALISATION</div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#0096C7', background: '#e0f7fa', padding: '2px 7px', borderRadius: 6 }}>🗺️ Voir sur la carte</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a202c' }}>{selected.location.address}</div>
                <div style={{ fontSize: 12, color: '#718096' }}>{selected.location.city}</div>
                <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 4 }}>
                  {selected.location.lat.toFixed(4)}, {selected.location.lng.toFixed(4)}
                </div>
              </div>
              <div style={{ padding: '14px', background: '#f7fafc', borderRadius: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#a0aec0', marginBottom: 6 }}>CITOYEN</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a202c' }}>{selected.citizen.firstName} {selected.citizen.lastName}</div>
                <div style={{ fontSize: 12, color: '#718096' }}>{selected.citizen.phone}</div>
                <div style={{ fontSize: 11, color: '#718096', marginTop: 4 }}>Signalé {timeAgo(selected.createdAt)}</div>
              </div>
            </div>

            {selected.responder && (
              <div style={{ padding: '14px 16px', background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#2f855a', marginBottom: 6 }}>SECOURISTE ASSIGNÉ</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a202c' }}>{selected.responder.firstName} {selected.responder.lastName}</div>
                <div style={{ fontSize: 12, color: '#718096' }}>{selected.responder.phone}</div>
              </div>
            )}

            {(selected.status === 'in_progress' && selected.responder?.id === user?.id) && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 6 }}>Notes d'intervention (optionnel)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Décrivez les actions effectuées..." rows={3}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, outline: 'none', resize: 'vertical' }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, paddingTop: 4, flexWrap: 'wrap' }}>
              {selected.status === 'pending' && !selected.responder && (
                <button onClick={() => handleAccept(selected)} style={{ flex: 1, padding: '12px', background: '#48bb78', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  🚑 Prendre en charge
                </button>
              )}
              {selected.status === 'in_progress' && selected.responder?.id === user?.id && (
                <button onClick={() => handleResolve(selected)} style={{ flex: 1, padding: '12px', background: '#0077B6', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  ✓ Marquer comme résolue
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
          accentColor={alertTypeColors[selected.type]}
          accentIcon={alertTypeIcons[selected.type]}
          title={`Localisation — ${selected.title}`}
        />
      )}
    </PageLayout>
  );
}
