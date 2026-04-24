import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { broadcastService } from '../../services/broadcastService';
import { Broadcast, BroadcastCategory } from '../../types';

const categoryConfig: Record<BroadcastCategory, { label: string; icon: string; color: string; light: string; }> = {
  info:    { label: 'Information',     icon: 'ℹ️', color: '#0077B6', light: '#e0f7fa' },
  warning: { label: 'Avertissement',   icon: '⚠️', color: '#b45309', light: '#fef3c7' },
  danger:  { label: 'Alerte critique', icon: '🚨', color: '#c53030', light: '#fed7d7' },
};

const EXPIRY_PRESETS = [
  { label: 'Aucune expiration', hours: 0 },
  { label: 'Dans 1 heure', hours: 1 },
  { label: 'Dans 6 heures', hours: 6 },
  { label: 'Dans 24 heures', hours: 24 },
  { label: 'Dans 3 jours', hours: 72 },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export default function BroadcastCenter() {
  const [items, setItems] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    category: 'info' as BroadcastCategory,
    expiryHours: 24,
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await broadcastService.listMine();
      setItems(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Titre et message requis');
      return;
    }
    setSubmitting(true);
    try {
      const expiresAt = form.expiryHours > 0
        ? new Date(Date.now() + form.expiryHours * 3_600_000).toISOString()
        : null;
      await broadcastService.create({
        title: form.title.trim(),
        message: form.message.trim(),
        category: form.category,
        expiresAt,
      });
      toast.success('Annonce publiée');
      setForm({ title: '', message: '', category: 'info', expiryHours: 24 });
      refresh();
    } catch (err: any) {
      toast.error(err?.message || 'Publication impossible');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette annonce ?')) return;
    try {
      await broadcastService.remove(id);
      setItems(prev => prev.filter(b => b.id !== id));
      toast.success('Annonce supprimée');
    } catch (err: any) {
      toast.error(err?.message || 'Suppression impossible');
    }
  };

  const active = items.filter(b =>
    b.isActive && (!b.expiresAt || new Date(b.expiresAt).getTime() > Date.now())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Composer */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e0f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📢</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Annoncer aux citoyens</div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>
              Message diffusé à tous les citoyens (route bloquée, zone à éviter, info publique…)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 6, letterSpacing: 0.4, textTransform: 'uppercase' }}>Type</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(['info', 'warning', 'danger'] as BroadcastCategory[]).map(c => {
                const cfg = categoryConfig[c];
                const active = form.category === c;
                return (
                  <button key={c} type="button" onClick={() => setForm(p => ({ ...p, category: c }))}
                    style={{
                      flex: 1, minWidth: 130,
                      padding: '10px 12px',
                      border: `2px solid ${active ? cfg.color : '#e2e8f0'}`,
                      borderRadius: 10,
                      background: active ? cfg.light : '#fff',
                      cursor: 'pointer',
                      fontSize: 12.5, fontWeight: 700,
                      color: active ? cfg.color : '#4a5568',
                      display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                    }}>
                    <span>{cfg.icon}</span>{cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 6, letterSpacing: 0.4, textTransform: 'uppercase' }}>Titre *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Ex. Route nationale 2 coupée"
              maxLength={120}
              style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 6, letterSpacing: 0.4, textTransform: 'uppercase' }}>Message *</label>
            <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder="Décrivez l'information destinée aux citoyens…"
              rows={4}
              maxLength={2000}
              style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            <div style={{ fontSize: 10.5, color: '#a0aec0', textAlign: 'right', marginTop: 4 }}>
              {form.message.length}/2000
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 6, letterSpacing: 0.4, textTransform: 'uppercase' }}>Expiration</label>
            <select value={form.expiryHours} onChange={e => setForm(p => ({ ...p, expiryHours: Number(e.target.value) }))}
              style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
              {EXPIRY_PRESETS.map(p => (
                <option key={p.hours} value={p.hours}>{p.label}</option>
              ))}
            </select>
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            style={{
              padding: '12px',
              background: submitting ? '#cbd5e0' : 'linear-gradient(135deg,#0096C7,#0077B6)',
              border: 'none', borderRadius: 10,
              color: 'white', fontSize: 13.5, fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(0,150,199,0.35)',
            }}>
            {submitting ? 'Publication…' : '📢 Publier l\'annonce'}
          </button>
        </div>
      </div>

      {/* Existing broadcasts */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
            Mes annonces {items.length > 0 && <span style={{ color: '#64748b', fontWeight: 600 }}>· {active.length} active(s) / {items.length}</span>}
          </div>
          <button onClick={refresh}
            style={{ fontSize: 11, fontWeight: 700, color: '#0077B6', background: '#e0f7fa', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>
            ↻ Actualiser
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Chargement…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            Aucune annonce publiée pour l'instant.
          </div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(b => {
              const cfg = categoryConfig[b.category];
              const expired = b.expiresAt && new Date(b.expiresAt).getTime() <= Date.now();
              const muted = !b.isActive || expired;
              return (
                <li key={b.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 11,
                    border: `1px solid ${muted ? '#e2e8f0' : `${cfg.color}33`}`,
                    background: muted ? '#f8fafc' : cfg.light,
                    opacity: muted ? 0.7 : 1,
                  }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ fontSize: 18, lineHeight: 1 }}>{cfg.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>{b.title}</div>
                      <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.55, marginTop: 3, whiteSpace: 'pre-wrap' }}>
                        {b.message}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 10.5, color: '#64748b', marginTop: 8 }}>
                        <span>📅 Publié {formatDate(b.createdAt)}</span>
                        {b.expiresAt && (
                          <span style={{ color: expired ? '#c53030' : '#64748b' }}>
                            {expired ? '⏱ Expirée' : `⏱ Expire ${formatDate(b.expiresAt)}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(b.id)}
                      title="Supprimer"
                      style={{ background: 'transparent', border: 'none', color: '#c53030', fontSize: 16, cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                      🗑
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
