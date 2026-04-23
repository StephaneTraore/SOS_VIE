import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import PageLayout from '../../components/layout/PageLayout';
import Modal from '../../components/common/Modal';
import GoogleMap, { MapMarker } from '../../components/common/GoogleMap';
import { Facility } from '../../types';
import { facilityService, FacilityInput } from '../../services/facilityService';
import { getCurrentPosition } from '../../hooks/useGoogleMaps';

type FacType = 'hospital' | 'police' | 'fire';

const CONAKRY = { lat: 9.5370, lng: -13.6773 };

const typeConfig: Record<FacType, { icon: string; color: string; light: string; label: string; plural: string }> = {
  hospital: { icon: '🏥', color: '#2f855a', light: '#f0fff4', label: 'Hôpital', plural: 'Hôpitaux & cliniques' },
  police:   { icon: '🚔', color: '#2b4694', light: '#ebf0ff', label: 'Police',  plural: 'Postes de police' },
  fire:     { icon: '🚒', color: '#c05621', light: '#fffaf0', label: 'Pompiers', plural: 'Garnisons de pompiers' },
};

type FormState = {
  id?: string;
  name: string;
  type: FacType;
  address: string;
  city: string;
  phone: string;
  lat: number;
  lng: number;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: '', type: 'hospital', address: '', city: 'Conakry', phone: '',
  lat: CONAKRY.lat, lng: CONAKRY.lng, isActive: true,
};

export default function AdminFacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | FacType>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<Facility | null>(null);
  const [mapCenter, setMapCenter] = useState(CONAKRY);

  const loadAll = async () => {
    setLoading(true);
    try {
      const data = await facilityService.getAll();
      setFacilities(data);
    } catch {
      toast.error('Impossible de charger les établissements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const filtered = useMemo(() => facilities
    .filter(f => filterType === 'all' || f.type === filterType)
    .filter(f => !search || `${f.name} ${f.address} ${f.city}`.toLowerCase().includes(search.toLowerCase())),
    [facilities, filterType, search]
  );

  const stats = {
    total: facilities.length,
    hospital: facilities.filter(f => f.type === 'hospital').length,
    police: facilities.filter(f => f.type === 'police').length,
    fire: facilities.filter(f => f.type === 'fire').length,
  };

  const openCreate = () => {
    setForm({ ...emptyForm, lat: CONAKRY.lat, lng: CONAKRY.lng });
    setMapCenter(CONAKRY);
    setShowForm(true);
  };

  const openEdit = (f: Facility) => {
    setForm({
      id: f.id, name: f.name, type: f.type, address: f.address,
      city: f.city || 'Conakry', phone: f.phone || '',
      lat: f.lat, lng: f.lng, isActive: f.isActive,
    });
    setMapCenter({ lat: f.lat, lng: f.lng });
    setShowForm(true);
  };

  const useMyPosition = async () => {
    const pos = await getCurrentPosition(CONAKRY);
    if (!pos.fromGPS) {
      toast.error('Position GPS indisponible — utilisez la carte pour placer le marqueur');
      return;
    }
    setForm(p => ({ ...p, lat: pos.lat, lng: pos.lng }));
    setMapCenter({ lat: pos.lat, lng: pos.lng });
    toast.success('Position GPS récupérée');
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Nom de l\'établissement requis');
    if (!form.address.trim()) return toast.error('Adresse requise');
    if (!isFinite(form.lat) || !isFinite(form.lng)) return toast.error('Coordonnées GPS invalides');
    const payload: FacilityInput = {
      name: form.name.trim(), type: form.type, address: form.address.trim(),
      city: form.city.trim() || 'Conakry',
      phone: form.phone.trim() || undefined,
      lat: Number(form.lat), lng: Number(form.lng),
      isActive: form.isActive,
    };
    setSubmitting(true);
    try {
      if (form.id) {
        const updated = await facilityService.update(form.id, payload);
        setFacilities(p => p.map(f => f.id === updated.id ? updated : f));
        toast.success('Établissement mis à jour');
      } else {
        const created = await facilityService.create(payload);
        setFacilities(p => [created, ...p]);
        toast.success('Établissement ajouté');
      }
      setShowForm(false);
      setForm(emptyForm);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await facilityService.remove(deleting.id);
      setFacilities(p => p.filter(f => f.id !== deleting.id));
      toast.success('Établissement supprimé');
      setDeleting(null);
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const previewMarkers: MapMarker[] = useMemo(() => ([
    {
      id: 'new-pin',
      lat: form.lat, lng: form.lng,
      icon: typeConfig[form.type].icon,
      color: typeConfig[form.type].color,
      title: form.name || 'Nouvel établissement',
      size: 'lg',
    },
  ]), [form.lat, form.lng, form.type, form.name]);

  const overviewMarkers: MapMarker[] = useMemo(() => filtered.map(f => ({
    id: f.id,
    lat: f.lat, lng: f.lng,
    icon: typeConfig[f.type].icon,
    color: typeConfig[f.type].color,
    title: f.name,
    popup: (
      <div style={{ minWidth: 180, maxWidth: 240, padding: '2px 4px 4px' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{f.name}</div>
        <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>📍 {f.address}</div>
        {f.phone && <div style={{ fontSize: 11, color: typeConfig[f.type].color, fontWeight: 700 }}>📞 {f.phone}</div>}
      </div>
    ),
  })), [filtered]);

  return (
    <PageLayout>
      <div className="page-enter">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(18px,4vw,24px)', fontWeight: 800, color: '#1a202c', marginBottom: 2 }}>Établissements 🏢</h1>
            <p style={{ color: '#718096', fontSize: 13 }}>
              {facilities.length} établissement(s) sur la carte
            </p>
          </div>
          <button onClick={openCreate}
            style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#0096C7,#0077B6)', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            + Nouvel établissement
          </button>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 18 }}>
          {[
            { label: 'Total', value: stats.total, icon: '🏢', color: '#4a5568' },
            { label: 'Hôpitaux', value: stats.hospital, icon: '🏥', color: typeConfig.hospital.color },
            { label: 'Police', value: stats.police, icon: '🚔', color: typeConfig.police.color },
            { label: 'Pompiers', value: stats.fire, icon: '🚒', color: typeConfig.fire.color },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 11, padding: 'clamp(10px,2vw,14px)', textAlign: 'center' }}>
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontSize: 'clamp(18px,3vw,22px)', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#a0aec0', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Overview map */}
        <div className="card" style={{ padding: 0, marginBottom: 18, overflow: 'hidden', height: 'clamp(260px, 40vh, 420px)' }}>
          <GoogleMap
            center={mapCenter}
            zoom={12}
            markers={overviewMarkers}
            style={{ borderRadius: 0, height: '100%' }}
          />
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un établissement..."
              style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {(['all', 'hospital', 'police', 'fire'] as const).map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                style={{ padding: '6px 12px', border: `1.5px solid ${filterType === t ? '#0096C7' : '#e2e8f0'}`, borderRadius: 7, background: filterType === t ? '#e0f7fa' : '#fff', color: filterType === t ? '#0096C7' : '#718096', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {t === 'all' ? 'Tous' : `${typeConfig[t].icon} ${typeConfig[t].label}`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card responsive-table" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
              <p style={{ fontSize: 14 }}>Chargement...</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f7fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Nom', 'Type', 'Adresse', 'Téléphone', 'Coordonnées', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#a0aec0', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, i) => {
                  const cfg = typeConfig[f.type];
                  return (
                    <tr key={f.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td data-label="Nom" style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 9, background: cfg.light, border: `1.5px solid ${cfg.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{cfg.icon}</div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#1a202c' }}>{f.name}</span>
                        </div>
                      </td>
                      <td data-label="Type" style={{ padding: '11px 14px' }}>
                        <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: cfg.light, color: cfg.color, whiteSpace: 'nowrap' }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td data-label="Adresse" style={{ padding: '11px 14px', fontSize: 12, color: '#4a5568' }}>{f.address}</td>
                      <td data-label="Téléphone" style={{ padding: '11px 14px', fontSize: 12, color: '#4a5568', whiteSpace: 'nowrap' }}>{f.phone || '—'}</td>
                      <td data-label="Coordonnées" style={{ padding: '11px 14px', fontSize: 11, color: '#718096', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        {f.lat.toFixed(5)}, {f.lng.toFixed(5)}
                      </td>
                      <td data-label="Statut" style={{ padding: '11px 14px' }}>
                        <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: f.isActive ? '#f0fff4' : '#f7fafc', color: f.isActive ? '#2f855a' : '#a0aec0', whiteSpace: 'nowrap' }}>
                          {f.isActive ? '● Actif' : '○ Inactif'}
                        </span>
                      </td>
                      <td data-label="Actions" style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          <button onClick={() => openEdit(f)} style={{ padding: '5px 9px', background: '#e0f7fa', border: 'none', borderRadius: 6, color: '#0077B6', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Modifier</button>
                          <button onClick={() => setDeleting(f)} style={{ padding: '5px 9px', background: '#fff5f5', border: 'none', borderRadius: 6, color: '#c53030', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
              <p style={{ fontSize: 14 }}>Aucun établissement trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setForm(emptyForm); }}
        title={form.id ? `Modifier — ${form.name || 'Établissement'}` : 'Nouvel établissement'}
        size="xl"
        footer={(
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={handleSubmit} disabled={submitting}
              style={{ flex: 1, minWidth: 180, padding: '12px', background: submitting ? '#cbd5e0' : 'linear-gradient(135deg,#0096C7,#0077B6)', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? 'Enregistrement...' : form.id ? 'Enregistrer les modifications' : 'Créer l\'établissement'}
            </button>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); }}
              style={{ padding: '12px 18px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#4a5568', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Annuler
            </button>
          </div>
        )}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Type selector */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 6 }}>Type d'établissement *</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(['hospital', 'police', 'fire'] as FacType[]).map(t => {
                const cfg = typeConfig[t];
                const active = form.type === t;
                return (
                  <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                    style={{ flex: 1, minWidth: 120, padding: '11px 12px', border: `2px solid ${active ? cfg.color : '#e2e8f0'}`, borderRadius: 10, background: active ? cfg.light : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: active ? cfg.color : '#4a5568', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <span style={{ fontSize: 18 }}>{cfg.icon}</span> {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid-2" style={{ gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 4 }}>Nom *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Hôpital National Donka"
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 4 }}>Téléphone</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+224 6xx xx xx xx"
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div className="grid-2" style={{ gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 4 }}>Adresse *</label>
              <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                placeholder="Commune de Dixinn, Conakry"
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 4 }}>Ville</label>
              <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* GPS map picker */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4a5568' }}>
                Coordonnées GPS * <span style={{ fontWeight: 400, color: '#a0aec0' }}>— cliquez sur la carte</span>
              </label>
              <button type="button" onClick={useMyPosition}
                style={{ fontSize: 11, fontWeight: 700, color: '#0077B6', background: '#e0f7fa', border: 'none', borderRadius: 7, padding: '5px 10px', cursor: 'pointer' }}>
                📍 Utiliser ma position
              </button>
            </div>
            <div style={{ height: 'clamp(180px, 32vh, 320px)', borderRadius: 10, overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
              <GoogleMap
                center={mapCenter}
                zoom={14}
                markers={previewMarkers}
                onMapClick={(lat, lng) => setForm(p => ({ ...p, lat, lng }))}
                style={{ borderRadius: 0, height: '100%' }}
              />
            </div>
            <div className="grid-2" style={{ gap: 10, marginTop: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 3 }}>Latitude</label>
                <input type="number" step="0.00001" value={form.lat}
                  onChange={e => setForm(p => ({ ...p, lat: parseFloat(e.target.value) }))}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 7, fontSize: 12, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 3 }}>Longitude</label>
                <input type="number" step="0.00001" value={form.lng}
                  onChange={e => setForm(p => ({ ...p, lng: parseFloat(e.target.value) }))}
                  style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 7, fontSize: 12, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#f7fafc', borderRadius: 9, border: '1px solid #e2e8f0' }}>
            <input type="checkbox" id="isActive" checked={form.isActive}
              onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
              style={{ width: 16, height: 16, cursor: 'pointer' }} />
            <label htmlFor="isActive" style={{ fontSize: 13, color: '#2d3748', cursor: 'pointer', fontWeight: 600 }}>
              Établissement actif (visible sur la carte citoyen)
            </label>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Supprimer l'établissement" size="sm">
        {deleting && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 14, color: '#2d3748', lineHeight: 1.6 }}>
              Voulez-vous vraiment supprimer <strong>{deleting.name}</strong> ?
              Cet établissement ne sera plus visible sur la carte des citoyens.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleDelete}
                style={{ flex: 1, padding: '11px', background: '#c53030', border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Supprimer
              </button>
              <button onClick={() => setDeleting(null)}
                style={{ padding: '11px 18px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#4a5568', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Annuler
              </button>
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}
