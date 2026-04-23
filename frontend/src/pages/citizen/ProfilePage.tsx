import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/layout/PageLayout';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' });

  if (!user) return null;

  const roleColors: Record<string, string> = { citizen: '#0077B6', responder: '#48bb78', admin: '#0096C7', police: '#2b4694', hospital: '#2f855a', fire: '#c05621' };
  const roleLabels: Record<string, string> = { citizen: 'Citoyen', responder: 'Secouriste', admin: 'Administrateur', police: 'Police Nationale', hospital: 'Hôpital / Clinique', fire: 'Sapeurs-Pompiers' };
  const color = roleColors[user.role] || '#718096';

  return (
    <PageLayout>
      <div style={{ maxWidth: 640, margin: '0 auto' }} className="page-enter">
        {/* Profile card */}
        <div style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, borderRadius: 20, padding: '40px', color: 'white', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700 }}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{user.firstName} {user.lastName}</h2>
              <div style={{ fontSize: 13, opacity: 0.85 }}>{user.email}</div>
              <div style={{ marginTop: 8, display: 'inline-block', padding: '3px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                {roleLabels[user.role]}
              </div>
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="card" style={{ padding: '24px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a202c' }}>Informations personnelles</h3>
            <button
              onClick={() => { if (editing) { toast.success('Profil mis à jour !'); } setEditing(!editing); }}
              style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${editing ? color : '#e2e8f0'}`, background: editing ? `${color}10` : '#f7fafc', color: editing ? color : '#4a5568', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              {editing ? '💾 Sauvegarder' : '✏️ Modifier'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Prénom', field: 'firstName', value: form.firstName },
              { label: 'Nom', field: 'lastName', value: form.lastName },
              { label: 'Téléphone', field: 'phone', value: form.phone },
            ].map(item => (
              <div key={item.field}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#a0aec0', display: 'block', marginBottom: 4 }}>{item.label}</label>
                {editing ? (
                  <input value={item.value} onChange={e => setForm(p => ({ ...p, [item.field]: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${color}50`, borderRadius: 8, fontSize: 14, outline: 'none' }} />
                ) : (
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#2d3748' }}>{item.value || '—'}</div>
                )}
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#a0aec0', display: 'block', marginBottom: 4 }}>Email</label>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#2d3748' }}>{user.email}</div>
            </div>
            {user.region && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#a0aec0', display: 'block', marginBottom: 4 }}>Région</label>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#2d3748' }}>{user.region}</div>
              </div>
            )}
          </div>
        </div>

        {/* Account info */}
        <div className="card" style={{ padding: '24px', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a202c', marginBottom: 16 }}>Compte</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['ID', `#${user.id}`],
              ['Statut', user.isActive ? '✅ Actif' : '❌ Inactif'],
              ['Membre depuis', new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid #f7fafc' }}>
                <span style={{ color: '#718096' }}>{k}</span>
                <span style={{ fontWeight: 600, color: '#2d3748' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div style={{ padding: '20px 24px', border: '1px solid #a5f3fc', borderRadius: 12, background: '#e0f7fa' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0077B6', marginBottom: 12 }}>Zone de danger</h3>
          <button
            onClick={logout}
            style={{ width: '100%', padding: '12px', border: '1px solid #0096C7', borderRadius: 10, background: '#fff', color: '#0096C7', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            🚪 Se déconnecter
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
