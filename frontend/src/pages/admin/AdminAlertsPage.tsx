import React, { useState } from 'react';
import { useAlerts } from '../../context/AlertContext';
import PageLayout from '../../components/layout/PageLayout';
import { StatusBadge, PriorityBadge, TypeBadge } from '../../components/common/StatusBadge';
import { timeAgo, alertTypeIcons, statusLabels, alertTypeLabels } from '../../utils/helpers';
import { AlertType, AlertStatus, ServiceType } from '../../types';
import Modal from '../../components/common/Modal';
import { Alert } from '../../types';
import toast from 'react-hot-toast';

export default function AdminAlertsPage() {
  const { alerts, updateAlertStatus } = useAlerts();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [selected, setSelected] = useState<Alert | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');

  const serviceLabels: Record<string, string> = { police: '🚔 Police', hospital: '🏥 Hôpital', fire: '🚒 Pompiers', admin: '🛡️ Admin' };

  const filtered = alerts
    .filter(a => filterStatus === 'all' || a.status === filterStatus)
    .filter(a => filterType === 'all' || a.type === filterType)
    .filter(a => filterService === 'all' || a.service === filterService)
    .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()) || a.location.address.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const statusOptions = ['all', 'pending', 'assigned', 'in_progress', 'resolved', 'cancelled'];
  const typeOptions = ['all', 'medical', 'fire', 'accident', 'violence', 'flood', 'other'];

  return (
    <PageLayout>
      <div className="page-enter">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a202c', marginBottom: 4 }}>Toutes les alertes</h1>
            <p style={{ color: '#718096', fontSize: 14 }}>{filtered.length} résultat(s)</p>
          </div>
        </div>

        {/* Filters bar */}
        <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une alerte..."
                style={{ width: '100%', padding: '9px 14px 9px 38px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, outline: 'none' }}
              />
            </div>

            {/* Status filter */}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '9px 14px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, background: '#fff', cursor: 'pointer', outline: 'none' }}>
              <option value="all">Tous statuts</option>
              {statusOptions.slice(1).map(s => <option key={s} value={s}>{statusLabels[s as AlertStatus]}</option>)}
            </select>

            {/* Type filter */}
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              style={{ padding: '9px 14px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, background: '#fff', cursor: 'pointer', outline: 'none' }}>
              <option value="all">Tous types</option>
              {typeOptions.slice(1).map(t => <option key={t} value={t}>{alertTypeIcons[t as AlertType]} {alertTypeLabels[t as AlertType]}</option>)}
            </select>

            {/* Service filter */}
            <select value={filterService} onChange={e => setFilterService(e.target.value)}
              style={{ padding: '9px 14px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, background: '#fff', cursor: 'pointer', outline: 'none' }}>
              <option value="all">Tous services</option>
              {(['police', 'hospital', 'fire', 'admin'] as ServiceType[]).map(s => <option key={s} value={s}>{serviceLabels[s]}</option>)}
            </select>

            {/* Sort */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[{ v: 'date', l: '🕐 Date' }, { v: 'priority', l: '⚡ Priorité' }].map(s => (
                <button key={s.v} onClick={() => setSortBy(s.v as any)}
                  style={{ padding: '7px 12px', border: `1px solid ${sortBy === s.v ? '#0077B6' : '#e2e8f0'}`, borderRadius: 8, background: sortBy === s.v ? '#e0f7fa' : '#fff', color: sortBy === s.v ? '#0077B6' : '#718096', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {s.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f7fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Type', 'Titre', 'Service', 'Localisation', 'Citoyen', 'Priorité', 'Statut', 'Date', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#a0aec0', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((alert, i) => (
                  <tr key={alert.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f7fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 20 }}>{alertTypeIcons[alert.type]}</span>
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: 200 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a202c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.title}</div>
                      <div style={{ fontSize: 11, color: '#a0aec0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.description}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: alert.service === 'police' ? '#ebf0ff' : alert.service === 'hospital' ? '#f0fff4' : alert.service === 'fire' ? '#fffaf0' : '#f7fafc', color: alert.service === 'police' ? '#2b4694' : alert.service === 'hospital' ? '#2f855a' : alert.service === 'fire' ? '#c05621' : '#718096', whiteSpace: 'nowrap' }}>
                        {serviceLabels[alert.service]}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#4a5568', whiteSpace: 'nowrap' }}>
                      {alert.location.address.substring(0, 22)}...
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#4a5568', whiteSpace: 'nowrap' }}>
                      {alert.citizen.firstName} {alert.citizen.lastName}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <PriorityBadge priority={alert.priority} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={alert.status} />
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 11, color: '#a0aec0', whiteSpace: 'nowrap' }}>
                      {timeAgo(alert.createdAt)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setSelected(alert)}
                          style={{ padding: '5px 10px', background: '#e0f7fa', border: 'none', borderRadius: 6, color: '#0077B6', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                          Voir
                        </button>
                        {alert.status !== 'resolved' && (
                          <button onClick={() => { updateAlertStatus(alert.id, 'resolved'); toast.success('Alerte résolue.'); }}
                            style={{ padding: '5px 10px', background: '#f0fff4', border: 'none', borderRadius: 6, color: '#48bb78', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            ✓
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#a0aec0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <p>Aucune alerte ne correspond aux filtres sélectionnés</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Détails de l'alerte" size="lg">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <TypeBadge type={selected.type} />
              <StatusBadge status={selected.status} />
              <PriorityBadge priority={selected.priority} />
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: selected.service === 'police' ? '#ebf0ff' : selected.service === 'hospital' ? '#f0fff4' : selected.service === 'fire' ? '#fffaf0' : '#f7fafc', color: selected.service === 'police' ? '#2b4694' : selected.service === 'hospital' ? '#2f855a' : selected.service === 'fire' ? '#c05621' : '#718096' }}>
                {serviceLabels[selected.service]}
              </span>
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a202c', marginBottom: 8 }}>{selected.title}</h3>
              <p style={{ fontSize: 14, color: '#4a5568', lineHeight: 1.7, background: '#f7fafc', padding: '12px', borderRadius: 10 }}>{selected.description}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {[
                ['Localisation', `${selected.location.address}, ${selected.location.city}`],
                ['Citoyen', `${selected.citizen.firstName} ${selected.citizen.lastName} — ${selected.citizen.phone}`],
                ['Secouriste', selected.responder ? `${selected.responder.firstName} ${selected.responder.lastName}` : 'Non assigné'],
                ['Créée le', timeAgo(selected.createdAt)],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '12px', background: '#f7fafc', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#a0aec0', marginBottom: 4 }}>{k.toUpperCase()}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a202c' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, paddingTop: 4, flexWrap: 'wrap' }}>
              {selected.status !== 'resolved' && (
                <button onClick={() => { updateAlertStatus(selected.id, 'resolved'); toast.success('Alerte résolue.'); setSelected(null); }}
                  style={{ flex: 1, minWidth: 180, padding: '12px', background: '#48bb78', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  ✓ Marquer comme résolue
                </button>
              )}
              <button onClick={() => setSelected(null)}
                style={{ padding: '12px 20px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#4a5568', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}
