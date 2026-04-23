import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import PageLayout from '../../components/layout/PageLayout';
import { StatusBadge, PriorityBadge, TypeBadge } from '../../components/common/StatusBadge';
import { timeAgo, formatDate } from '../../utils/helpers';
import Modal from '../../components/common/Modal';
import { Alert } from '../../types';

export default function AlertHistoryPage() {
  const { user } = useAuth();
  const { getMyAlerts } = useAlerts();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Alert | null>(null);

  const allAlerts = user ? getMyAlerts(user.id) : [];
  const filtered = filter === 'all' ? allAlerts : allAlerts.filter(a => a.status === filter);

  const filters = [
    { value: 'all', label: 'Toutes' },
    { value: 'pending', label: 'En attente' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'resolved', label: 'Résolues' },
  ];

  return (
    <PageLayout>
      <div className="page-enter">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a202c' }}>Historique des alertes</h1>
            <p style={{ color: '#718096', fontSize: 14, marginTop: 4 }}>{allAlerts.length} alerte(s) au total</p>
          </div>
          <button
            onClick={() => navigate('/citizen/alert')}
            style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0096C7, #0077B6)', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            + Nouvelle alerte
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{ padding: '7px 16px', borderRadius: 8, border: `1.5px solid ${filter === f.value ? '#0096C7' : '#e2e8f0'}`, background: filter === f.value ? '#e0f7fa' : '#fff', color: filter === f.value ? '#0096C7' : '#718096', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
            >
              {f.label} {f.value !== 'all' && `(${allAlerts.filter(a => a.status === f.value).length})`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#a0aec0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>Aucune alerte trouvée</p>
            <p style={{ fontSize: 14, marginTop: 4 }}>Vous n'avez pas encore créé d'alerte dans cette catégorie</p>
            <button onClick={() => navigate('/citizen/alert')} style={{ marginTop: 20, padding: '10px 24px', background: '#0096C7', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
              Créer une alerte
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(alert => (
              <div
                key={alert.id}
                className="card"
                style={{ padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => setSelected(alert)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderLeft = '4px solid #0096C7'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderLeft = ''; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e0f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {alert.type === 'medical' ? '🏥' : alert.type === 'fire' ? '🔥' : alert.type === 'accident' ? '🚗' : alert.type === 'flood' ? '🌊' : '🆘'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1a202c', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {alert.title}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#718096' }}>📍 {alert.location.address}</span>
                      <span style={{ fontSize: 12, color: '#a0aec0' }}>•</span>
                      <span style={{ fontSize: 12, color: '#718096' }}>{timeAgo(alert.createdAt)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <StatusBadge status={alert.status} />
                    <PriorityBadge priority={alert.priority} />
                  </div>
                </div>
                {alert.responder && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: '#f7fafc', borderRadius: 8, fontSize: 12, color: '#718096', display: 'flex', alignItems: 'center', gap: 6 }}>
                    🚑 Secouriste assigné: <strong style={{ color: '#2d3748' }}>{alert.responder.firstName} {alert.responder.lastName}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Détails de l'alerte" size="md">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <TypeBadge type={selected.type} />
              <StatusBadge status={selected.status} />
              <PriorityBadge priority={selected.priority} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a202c', marginBottom: 4 }}>{selected.title}</h3>
              <p style={{ fontSize: 14, color: '#4a5568', lineHeight: 1.6 }}>{selected.description}</p>
            </div>
            {[
              ['📍 Localisation', `${selected.location.address}, ${selected.location.city}`],
              ['🕐 Créée', formatDate(selected.createdAt)],
              ['🔄 Mise à jour', formatDate(selected.updatedAt)],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>
                <span style={{ color: '#718096' }}>{label}</span>
                <span style={{ fontWeight: 600, color: '#2d3748', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
              </div>
            ))}
            {selected.responder && (
              <div style={{ padding: '12px 16px', background: '#f0fff4', borderRadius: 12, border: '1px solid #c6f6d5' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#2f855a', marginBottom: 6 }}>SECOURISTE ASSIGNÉ</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a202c' }}>{selected.responder.firstName} {selected.responder.lastName}</div>
                <div style={{ fontSize: 12, color: '#718096' }}>{selected.responder.phone}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}
