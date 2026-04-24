import React, { useState, useEffect } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { User, Role, Facility } from '../../types';
import { userService } from '../../services/userService';
import { facilityService } from '../../services/facilityService';

const roleColors: Record<string, string> = {
  citizen: '#0077B6', responder: '#48bb78', admin: '#0096C7',
  admin_police: '#2b4694', admin_hospital: '#2f855a', admin_fire: '#c05621',
  police: '#2b4694', hospital: '#2f855a', fire: '#c05621',
};
const roleLabels: Record<string, string> = {
  citizen: 'Citoyen', responder: 'Secouriste', admin: 'Super Admin',
  admin_police: 'Admin Police', admin_hospital: 'Admin Hôpital', admin_fire: 'Admin Pompiers',
  police: 'Police', hospital: 'Hôpital', fire: 'Pompiers',
};
const roleIcons: Record<string, string> = {
  citizen: '👤', responder: '🚑', admin: '🛡️',
  admin_police: '🚔', admin_hospital: '🏥', admin_fire: '🚒',
  police: '🚔', hospital: '🏥', fire: '🚒',
};

const ALL_FILTER_ROLES = ['all', 'citizen', 'responder', 'admin', 'admin_police', 'admin_hospital', 'admin_fire', 'police', 'hospital', 'fire'];

const CREATABLE_ROLES: { value: Role; label: string }[] = [
  { value: 'admin_police',   label: '🚔 Admin Police' },
  { value: 'admin_hospital', label: '🏥 Admin Hôpital' },
  { value: 'admin_fire',     label: '🚒 Admin Pompiers' },
  { value: 'responder',      label: '🚑 Secouriste' },
  { value: 'citizen',        label: '👤 Citoyen' },
  { value: 'police',         label: '🚔 Agent Police' },
  { value: 'hospital',       label: '🏥 Personnel Médical' },
  { value: 'fire',           label: '🚒 Sapeur-Pompier' },
];

const ROLE_TO_FACILITY_TYPE: Record<string, string> = {
  admin_police: 'police', admin_hospital: 'hospital', admin_fire: 'fire',
};

const emptyForm = { firstName: '', lastName: '', email: '', phone: '', password: '', role: 'admin_police' as Role, region: '', facilityId: '' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selected, setSelected] = useState<User | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState(emptyForm);
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loadingFac, setLoadingFac] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  // Load facilities when role changes to a service admin type
  useEffect(() => {
    const facType = ROLE_TO_FACILITY_TYPE[newUser.role];
    if (!facType) { setFacilities([]); return; }
    setLoadingFac(true);
    setNewUser(p => ({ ...p, facilityId: '' }));
    facilityService.getAll(facType)
      .then(setFacilities)
      .catch(() => setFacilities([]))
      .finally(() => setLoadingFac(false));
  }, [newUser.role]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err: any) {
      toast.error(err?.message || 'Impossible de charger les utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = users
    .filter(u => filterRole === 'all' || u.role === filterRole)
    .filter(u => !search || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()));

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const updated = await userService.toggleActive(id, !current);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      toast.success(`Compte ${!current ? 'activé' : 'désactivé'}.`);
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const handleAddUser = async () => {
    if (!newUser.firstName || !newUser.email || !newUser.password) {
      return toast.error('Prénom, email et mot de passe sont requis');
    }
    if (ROLE_TO_FACILITY_TYPE[newUser.role] && !newUser.facilityId) {
      return toast.error('Sélectionnez un établissement pour ce compte');
    }
    setSubmitting(true);
    try {
      const created = await userService.create(newUser);
      setUsers(p => [created, ...p]);
      toast.success('Compte créé avec succès !');
      setShowAdd(false);
      setNewUser(emptyForm);
      setShowPwd(false);
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total: users.length,
    serviceAdmins: users.filter(u => ['admin_police', 'admin_hospital', 'admin_fire'].includes(u.role)).length,
    responders: users.filter(u => u.role === 'responder').length,
    citizens: users.filter(u => u.role === 'citizen').length,
    active: users.filter(u => u.isActive).length,
  };

  return (
    <PageLayout>
      <div className="page-enter">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(18px,4vw,24px)', fontWeight: 800, color: '#1a202c', marginBottom: 2 }}>Utilisateurs 👥</h1>
            <p style={{ color: '#718096', fontSize: 13 }}>{users.length} utilisateurs enregistrés</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#0096C7,#0077B6)', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            + Nouveau compte
          </button>
        </div>

        {/* Stats */}
        <div className="grid-5" style={{ marginBottom: 18 }}>
          {[
            { label: 'Total', value: stats.total, icon: '👥', color: '#4a5568' },
            { label: 'Admins Service', value: stats.serviceAdmins, icon: '🛡️', color: '#0096C7' },
            { label: 'Secouristes', value: stats.responders, icon: '🚑', color: '#48bb78' },
            { label: 'Citoyens', value: stats.citizens, icon: '👤', color: '#0077B6' },
            { label: 'Actifs', value: stats.active, icon: '✅', color: '#2f855a' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 11, padding: 'clamp(10px,2vw,14px)', textAlign: 'center' }}>
              <div style={{ fontSize: 18 }}>{s.icon}</div>
              <div style={{ fontSize: 'clamp(18px,3vw,22px)', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#a0aec0', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {ALL_FILTER_ROLES.map(r => (
              <button key={r} onClick={() => setFilterRole(r)}
                style={{ padding: '6px 12px', border: `1.5px solid ${filterRole === r ? '#0096C7' : '#e2e8f0'}`, borderRadius: 7, background: filterRole === r ? '#e0f7fa' : '#fff', color: filterRole === r ? '#0096C7' : '#718096', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {r === 'all' ? 'Tous' : roleLabels[r]}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card responsive-table" style={{ overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
              <p style={{ fontSize: 14 }}>Chargement...</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f7fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Utilisateur', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#a0aec0', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f7fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'}>
                    <td data-label="Utilisateur" style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${roleColors[user.role] || '#718096'}20`, border: `2px solid ${roleColors[user.role] || '#718096'}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: roleColors[user.role] || '#718096', flexShrink: 0 }}>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1a202c', whiteSpace: 'nowrap' }}>{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td data-label="Email" style={{ padding: '11px 14px', fontSize: 12, color: '#4a5568' }}>{user.email}</td>
                    <td data-label="Téléphone" style={{ padding: '11px 14px', fontSize: 12, color: '#4a5568', whiteSpace: 'nowrap' }}>{user.phone || '—'}</td>
                    <td data-label="Rôle" style={{ padding: '11px 14px' }}>
                      <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${roleColors[user.role] || '#718096'}15`, color: roleColors[user.role] || '#718096', whiteSpace: 'nowrap' }}>
                        {roleIcons[user.role]} {roleLabels[user.role]}
                      </span>
                    </td>
                    <td data-label="Statut" style={{ padding: '11px 14px' }}>
                      <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: user.isActive ? '#f0fff4' : '#e0f7fa', color: user.isActive ? '#2f855a' : '#0077B6', whiteSpace: 'nowrap' }}>
                        {user.isActive ? '● Actif' : '○ Inactif'}
                      </span>
                    </td>
                    <td data-label="Actions" style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <button onClick={() => setSelected(user)} style={{ padding: '5px 9px', background: '#e0f7fa', border: 'none', borderRadius: 6, color: '#0077B6', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Voir</button>
                        <button onClick={() => toggleActive(user.id, user.isActive)} style={{ padding: '5px 9px', background: user.isActive ? '#e0f7fa' : '#f0fff4', border: 'none', borderRadius: 6, color: user.isActive ? '#0096C7' : '#48bb78', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          {user.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!isLoading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
              <p style={{ fontSize: 14 }}>Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* User detail modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Profil utilisateur">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${roleColors[selected.role] || '#718096'}20`, border: `3px solid ${roleColors[selected.role] || '#718096'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: roleColors[selected.role] || '#718096', margin: '0 auto 10px' }}>
                {selected.firstName?.[0]}{selected.lastName?.[0]}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a202c' }}>{selected.firstName} {selected.lastName}</h3>
              <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${roleColors[selected.role] || '#718096'}15`, color: roleColors[selected.role] || '#718096' }}>
                {roleIcons[selected.role]} {roleLabels[selected.role]}
              </span>
            </div>
            {[['Email', selected.email], ['Téléphone', selected.phone || '—'], ['Statut', selected.isActive ? '✅ Actif' : '❌ Inactif']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f0f0f0', fontSize: 13, flexWrap: 'wrap', gap: 4 }}>
                <span style={{ color: '#718096' }}>{k}</span>
                <span style={{ fontWeight: 600, color: '#2d3748' }}>{v}</span>
              </div>
            ))}
            <button onClick={() => { toggleActive(selected.id, selected.isActive); setSelected(null); }}
              style={{ padding: '11px', border: 'none', borderRadius: 10, background: selected.isActive ? '#e0f7fa' : '#f0fff4', color: selected.isActive ? '#0096C7' : '#2f855a', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {selected.isActive ? '🚫 Désactiver le compte' : '✅ Activer le compte'}
            </button>
          </div>
        )}
      </Modal>

      {/* Add user modal */}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setNewUser(emptyForm); setShowPwd(false); }} title="Créer un compte">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Role selector first — determines context */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 4 }}>Rôle *</label>
            <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value as Role }))}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none' }}>
              {CREATABLE_ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="grid-2" style={{ gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 4 }}>Prénom *</label>
              <input value={newUser.firstName} onChange={e => setNewUser(p => ({ ...p, firstName: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 4 }}>Nom</label>
              <input value={newUser.lastName} onChange={e => setNewUser(p => ({ ...p, lastName: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 4 }}>Email *</label>
            <input type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 4 }}>Téléphone</label>
            <input value={newUser.phone} onChange={e => setNewUser(p => ({ ...p, phone: e.target.value }))} placeholder="+224 6xx xx xx xx"
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 4 }}>Mot de passe *</label>
            <div style={{ position: 'relative' }}>
              <input type={showPwd ? 'text' : 'password'} value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
                style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#718096', padding: 4 }}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Facility selector — only for service admin roles */}
          {ROLE_TO_FACILITY_TYPE[newUser.role] && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 4 }}>
                Établissement *
              </label>
              {loadingFac ? (
                <div style={{ padding: '10px', fontSize: 12, color: '#a0aec0' }}>Chargement...</div>
              ) : (
                <select value={newUser.facilityId} onChange={e => setNewUser(p => ({ ...p, facilityId: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${!newUser.facilityId ? '#0096C7' : '#e2e8f0'}`, borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none' }}>
                  <option value="">— Sélectionner un établissement —</option>
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.address})</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button onClick={handleAddUser} disabled={submitting}
              style={{ flex: 1, padding: '11px', background: submitting ? '#c5e490' : 'linear-gradient(135deg,#0096C7,#0077B6)', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? 'Création...' : 'Créer le compte'}
            </button>
            <button onClick={() => { setShowAdd(false); setNewUser(emptyForm); setShowPwd(false); }}
              style={{ padding: '11px 18px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#4a5568', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Annuler
            </button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
