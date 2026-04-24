import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import PageLayout from '../../components/layout/PageLayout';
import Modal from '../../components/common/Modal';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { User, Alert } from '../../types';
import { userService } from '../../services/userService';
import { timeAgo, alertTypeIcons, priorityColors } from '../../utils/helpers';
import BroadcastCenter from '../../components/admin/BroadcastCenter';
import toast from 'react-hot-toast';

const CONFIG: Record<string, { color: string; light: string; icon: string; label: string; roleLabel: string; role: string }> = {
  admin_police:  { color: '#2b4694', light: '#ebf0ff', icon: '🚔', label: 'Administration Police',    roleLabel: 'Agent de Police',    role: 'police' },
  admin_hospital:{ color: '#2f855a', light: '#f0fff4', icon: '🏥', label: 'Administration Hôpital',   roleLabel: 'Personnel Médical',   role: 'hospital' },
  admin_fire:    { color: '#c05621', light: '#fffaf0', icon: '🚒', label: 'Administration Pompiers',  roleLabel: 'Sapeur-Pompier',      role: 'fire' },
};

const emptyForm = { firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' };

export default function ServiceAdminPage() {
  const { user } = useAuth();
  const { alerts, assignAlert } = useAlerts();
  const cfg = CONFIG[user?.role || ''] || CONFIG.admin_police;

  const [tab, setTab]              = useState<'alerts' | 'agents' | 'broadcasts'>('alerts');
  const [agents, setAgents]        = useState<User[]>([]);
  const [loading, setLoading]      = useState(true);
  const [search, setSearch]        = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected]    = useState<User | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]            = useState(emptyForm);
  const [showPwd, setShowPwd]      = useState(false);
  const [saving, setSaving]        = useState(false);

  // Alert assignment
  const [assignTarget, setAssignTarget] = useState<Alert | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const serviceAlerts = alerts.filter(a => a.service === cfg.role);
  const pendingAlerts  = serviceAlerts.filter(a => a.status === 'pending');
  const activeAlerts   = serviceAlerts.filter(a => a.status !== 'resolved' && a.status !== 'cancelled');

  const filteredAlerts = filterStatus === 'all' ? serviceAlerts
    : filterStatus === 'active' ? activeAlerts
    : serviceAlerts.filter(a => a.status === filterStatus);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setAgents(data);
    } catch (err: any) { toast.error(err?.message || 'Erreur de chargement'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAgents(); }, [loadAgents]);

  const activeAgents = agents.filter(u => u.isActive);
  const filteredAgents = agents.filter(u =>
    !search || `${u.firstName} ${u.lastName} ${u.email} ${u.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = async (u: User) => {
    try {
      const updated = await userService.toggleActive(u.id, !u.isActive);
      setAgents(prev => prev.map(x => x.id === updated.id ? updated : x));
      toast.success(`Compte ${updated.isActive ? 'activé' : 'désactivé'}`);
      if (selected?.id === updated.id) setSelected(updated);
    } catch (err: any) { toast.error(err?.message || 'Erreur de mise à jour'); }
  };

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName) return toast.error('Prénom et nom requis');
    if (!form.email && !form.phone) return toast.error('Email ou téléphone requis');
    if (form.password.length < 6) return toast.error('Mot de passe : 6 caractères minimum');
    if (form.password !== form.confirmPassword) return toast.error('Les mots de passe ne correspondent pas');
    setSaving(true);
    try {
      const created = await userService.create({
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email || undefined,
        phone:     form.phone || undefined,
        password:  form.password,
        role:      cfg.role,
      });
      setAgents(prev => [created, ...prev]);
      toast.success(`Compte ${cfg.roleLabel} créé !`);
      setShowCreate(false);
      setForm(emptyForm);
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la création');
    } finally { setSaving(false); }
  };

  const handleAssign = async () => {
    if (!assignTarget || !selectedAgentId) return toast.error('Sélectionnez un agent');
    const agent = agents.find(u => u.id === selectedAgentId);
    setAssigning(true);
    try {
      assignAlert(assignTarget.id, selectedAgentId, agent);
      toast.success(`Alerte assignée à ${agent?.firstName} ${agent?.lastName}`);
      setAssignTarget(null);
      setSelectedAgentId('');
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l'assignation");
    } finally { setAssigning(false); }
  };

  const alertTabs = [
    { value: 'all', label: 'Toutes', count: serviceAlerts.length },
    { value: 'active', label: 'Actives', count: activeAlerts.length },
    { value: 'pending', label: 'En attente', count: pendingAlerts.length },
    { value: 'assigned', label: 'Assignées', count: serviceAlerts.filter(a => a.status === 'assigned').length },
    { value: 'resolved', label: 'Clôturées', count: serviceAlerts.filter(a => a.status === 'resolved').length },
  ];

  return (
    <PageLayout>
      <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`, borderRadius: 16, padding: 'clamp(20px,3vw,28px)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{cfg.icon}</div>
            <div>
              <h1 style={{ fontSize: 'clamp(16px,3vw,22px)', fontWeight: 800, marginBottom: 2 }}>{user?.facilityName || cfg.label}</h1>
              <p style={{ fontSize: 12, opacity: 0.8 }}>{user?.firstName} {user?.lastName} · {cfg.label}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{pendingAlerts.length}</div>
              <div style={{ opacity: 0.8 }}>En attente</div>
            </div>
            <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{activeAgents.length}</div>
              <div style={{ opacity: 0.8 }}>Agents actifs</div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: 4, background: '#f7fafc', padding: 4, borderRadius: 12, width: 'fit-content' }}>
          <button onClick={() => setTab('alerts')}
            style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: tab === 'alerts' ? '#fff' : 'transparent', color: tab === 'alerts' ? '#1a202c' : '#718096', fontSize: 13, fontWeight: tab === 'alerts' ? 700 : 500, cursor: 'pointer', boxShadow: tab === 'alerts' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
            🚨 Alertes
            {pendingAlerts.length > 0 && <span style={{ background: '#0096C7', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{pendingAlerts.length}</span>}
          </button>
          <button onClick={() => setTab('agents')}
            style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: tab === 'agents' ? '#fff' : 'transparent', color: tab === 'agents' ? '#1a202c' : '#718096', fontSize: 13, fontWeight: tab === 'agents' ? 700 : 500, cursor: 'pointer', boxShadow: tab === 'agents' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
            👥 Agents
            <span style={{ background: tab === 'agents' ? cfg.color : '#e2e8f0', color: tab === 'agents' ? 'white' : '#718096', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{agents.length}</span>
          </button>
          <button onClick={() => setTab('broadcasts')}
            style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: tab === 'broadcasts' ? '#fff' : 'transparent', color: tab === 'broadcasts' ? '#1a202c' : '#718096', fontSize: 13, fontWeight: tab === 'broadcasts' ? 700 : 500, cursor: 'pointer', boxShadow: tab === 'broadcasts' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
            📢 Annonces
          </button>
        </div>

        {tab === 'broadcasts' && <BroadcastCenter />}

        {/* ── ALERTS TAB ── */}
        {tab === 'alerts' && (
          <>
            {/* Alert status filters */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {alertTabs.map(t => (
                <button key={t.value} onClick={() => setFilterStatus(t.value)}
                  style={{ padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${filterStatus === t.value ? cfg.color : '#e2e8f0'}`, background: filterStatus === t.value ? cfg.light : '#fff', color: filterStatus === t.value ? cfg.color : '#718096', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {t.label}
                  {t.count > 0 && <span style={{ background: filterStatus === t.value ? cfg.color : '#e2e8f0', color: filterStatus === t.value ? 'white' : '#718096', borderRadius: 10, padding: '1px 6px', fontSize: 11 }}>{t.count}</span>}
                </button>
              ))}
            </div>

            {filteredAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#a0aec0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <p style={{ fontWeight: 600, fontSize: 15 }}>Aucune alerte dans cette catégorie</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredAlerts.map(alert => (
                  <div key={alert.id} className="card" style={{ padding: '16px 18px', borderLeft: `4px solid ${priorityColors[alert.priority]}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 46, height: 46, borderRadius: 12, background: cfg.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                        {alertTypeIcons[alert.type]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a202c', marginBottom: 3 }}>{alert.title}</div>
                        <div style={{ fontSize: 12, color: '#718096', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.description}</div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#a0aec0', flexWrap: 'wrap' }}>
                          <span>📍 {alert.location.address}</span>
                          <span>👤 {alert.citizen.firstName} {alert.citizen.lastName}</span>
                          <span>🕐 {timeAgo(alert.createdAt)}</span>
                          {alert.responder && (
                            <span style={{ color: cfg.color, fontWeight: 600 }}>
                              {cfg.icon} Assigné à {alert.responder.firstName} {alert.responder.lastName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <PriorityBadge priority={alert.priority} />
                          <StatusBadge status={alert.status} />
                        </div>
                        {alert.status === 'pending' && (
                          <button onClick={() => { setAssignTarget(alert); setSelectedAgentId(''); }}
                            style={{ padding: '6px 14px', background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`, border: 'none', borderRadius: 8, color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Assigner {cfg.icon}
                          </button>
                        )}
                        {alert.status === 'assigned' && (
                          <button onClick={() => { setAssignTarget(alert); setSelectedAgentId(alert.responder?.id || ''); }}
                            style={{ padding: '6px 14px', background: '#f7fafc', border: `1.5px solid ${cfg.color}40`, borderRadius: 8, color: cfg.color, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Réassigner
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── AGENTS TAB ── */}
        {tab === 'agents' && (
          <>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un agent..."
                  style={{ width: '100%', padding: '10px 14px 10px 38px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, outline: 'none' }} />
              </div>
              <button onClick={() => setShowCreate(true)}
                style={{ padding: '10px 20px', background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`, border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                + Créer un compte {cfg.roleLabel}
              </button>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#a0aec0' }}>
                  <div style={{ width: 32, height: 32, border: `3px solid #e2e8f0`, borderTopColor: cfg.color, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                  Chargement...
                </div>
              ) : filteredAgents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#a0aec0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{cfg.icon}</div>
                  <p style={{ fontWeight: 600 }}>Aucun agent trouvé</p>
                  <p style={{ fontSize: 13, marginTop: 4 }}>Créez le premier compte {cfg.roleLabel}</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f7fafc', borderBottom: '1px solid #e2e8f0' }}>
                        {['Agent', 'Contact', 'Statut', 'Créé le', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#a0aec0', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAgents.map((u, i) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f7fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${cfg.color}20`, border: `2px solid ${cfg.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: cfg.color, flexShrink: 0 }}>
                                {u.firstName[0]}{u.lastName[0]}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a202c' }}>{u.firstName} {u.lastName}</div>
                                <div style={{ fontSize: 11, color: '#a0aec0' }}>{cfg.icon} {cfg.roleLabel}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#4a5568' }}>
                            <div>{u.email || '—'}</div>
                            <div style={{ color: '#a0aec0' }}>{u.phone || '—'}</div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: u.isActive ? '#f0fff4' : '#e0f7fa', color: u.isActive ? '#2f855a' : '#0077B6' }}>
                              {u.isActive ? '● Actif' : '○ Inactif'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 11, color: '#a0aec0', whiteSpace: 'nowrap' }}>
                            {timeAgo(u.createdAt)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => setSelected(u)} style={{ padding: '5px 10px', background: '#e0f7fa', border: 'none', borderRadius: 6, color: '#0077B6', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Voir</button>
                              <button onClick={() => handleToggle(u)} style={{ padding: '5px 10px', background: u.isActive ? '#e0f7fa' : '#f0fff4', border: 'none', borderRadius: 6, color: u.isActive ? '#0096C7' : '#48bb78', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                {u.isActive ? 'Désactiver' : 'Activer'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Assign alert modal */}
      <Modal isOpen={!!assignTarget} onClose={() => { setAssignTarget(null); setSelectedAgentId(''); }} title="Assigner l'alerte à un agent">
        {assignTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Alert summary */}
            <div style={{ padding: '12px 16px', background: cfg.light, border: `1px solid ${cfg.color}30`, borderRadius: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a202c', marginBottom: 4 }}>{assignTarget.title}</div>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 6 }}>{assignTarget.description}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <StatusBadge status={assignTarget.status} />
                <PriorityBadge priority={assignTarget.priority} />
              </div>
              <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 8 }}>📍 {assignTarget.location.address} · 👤 {assignTarget.citizen.firstName} {assignTarget.citizen.lastName}</div>
            </div>

            {/* Agent selector */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 8 }}>Choisir un agent *</label>
              {activeAgents.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#a0aec0', fontSize: 13, background: '#f7fafc', borderRadius: 10 }}>
                  Aucun agent actif disponible
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
                  {activeAgents.map(agent => (
                    <button key={agent.id} onClick={() => setSelectedAgentId(agent.id)}
                      style={{ padding: '10px 14px', border: `2px solid ${selectedAgentId === agent.id ? cfg.color : '#e2e8f0'}`, borderRadius: 10, background: selectedAgentId === agent.id ? cfg.light : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', transition: 'all 0.15s' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${cfg.color}20`, border: `2px solid ${cfg.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: cfg.color, flexShrink: 0 }}>
                        {agent.firstName[0]}{agent.lastName[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a202c' }}>{agent.firstName} {agent.lastName}</div>
                        <div style={{ fontSize: 11, color: '#a0aec0' }}>{agent.email || agent.phone || '—'}</div>
                      </div>
                      {selectedAgentId === agent.id && <span style={{ marginLeft: 'auto', color: cfg.color, fontWeight: 700, fontSize: 16 }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <button onClick={handleAssign} disabled={!selectedAgentId || assigning}
                style={{ flex: 1, padding: '12px', background: !selectedAgentId ? '#e2e8f0' : `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`, border: 'none', borderRadius: 10, color: !selectedAgentId ? '#a0aec0' : 'white', fontSize: 13, fontWeight: 700, cursor: !selectedAgentId ? 'not-allowed' : 'pointer' }}>
                {assigning ? 'Assignation...' : `Confirmer l'assignation`}
              </button>
              <button onClick={() => { setAssignTarget(null); setSelectedAgentId(''); }}
                style={{ padding: '12px 18px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#4a5568', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Annuler
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Agent detail modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Détails du compte">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ textAlign: 'center', padding: '10px 0 16px' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: `${cfg.color}20`, border: `3px solid ${cfg.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: cfg.color, margin: '0 auto 10px' }}>
                {selected.firstName[0]}{selected.lastName[0]}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{selected.firstName} {selected.lastName}</h3>
              <span style={{ fontSize: 12, color: cfg.color, fontWeight: 600 }}>{cfg.icon} {cfg.roleLabel}</span>
            </div>
            {[['Email', selected.email || '—'], ['Téléphone', selected.phone || '—'], ['Créé le', timeAgo(selected.createdAt)], ['Statut', selected.isActive ? '✅ Actif' : '❌ Inactif']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f0f0f0', fontSize: 13, flexWrap: 'wrap', gap: 4 }}>
                <span style={{ color: '#718096' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <button onClick={() => handleToggle(selected)}
              style={{ padding: '11px', border: 'none', borderRadius: 10, background: selected.isActive ? '#e0f7fa' : '#f0fff4', color: selected.isActive ? '#0096C7' : '#2f855a', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {selected.isActive ? '🚫 Désactiver le compte' : '✅ Activer le compte'}
            </button>
          </div>
        )}
      </Modal>

      {/* Create agent modal */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); setForm(emptyForm); }} title={`Créer un compte ${cfg.roleLabel}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div style={{ padding: '10px 14px', background: cfg.light, border: `1px solid ${cfg.color}30`, borderRadius: 10, fontSize: 12, color: cfg.color, fontWeight: 600 }}>
            {cfg.icon} Ce compte aura accès aux alertes assignées — {cfg.label}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 4 }}>Prénom *</label>
              <input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 4 }}>Nom *</label>
              <input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 4 }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 4 }}>Téléphone</label>
            <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 4 }}>Mot de passe *</label>
            <div style={{ position: 'relative' }}>
              <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Minimum 6 caractères"
                style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#a0aec0' }}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 4 }}>Confirmer le mot de passe *</label>
            <input type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${form.confirmPassword && form.confirmPassword !== form.password ? '#0096C7' : '#e2e8f0'}`, borderRadius: 8, fontSize: 13, outline: 'none' }} />
            {form.confirmPassword && form.password === form.confirmPassword && <p style={{ fontSize: 11, color: '#48bb78', marginTop: 3 }}>✓ Mots de passe identiques</p>}
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button onClick={handleCreate} disabled={saving}
              style={{ flex: 1, padding: '12px', background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`, border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Création...' : `✓ Créer le compte`}
            </button>
            <button onClick={() => { setShowCreate(false); setForm(emptyForm); }} style={{ padding: '12px 18px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#4a5568', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
