import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import PageLayout from '../../components/layout/PageLayout';
import { AlertType, AlertPriority, Facility } from '../../types';
import { facilityService } from '../../services/facilityService';
import GoogleMap, { MapMarker } from '../../components/common/GoogleMap';
import { getCurrentPosition } from '../../hooks/useGoogleMaps';
import toast from 'react-hot-toast';

const CONAKRY = { lat: 9.5370, lng: -13.6773 };

const kmDist = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const dy = (lat2 - lat1) * 111;
  const dx = (lng2 - lng1) * 111 * Math.cos(lat1 * Math.PI / 180);
  return Math.sqrt(dx * dx + dy * dy);
};

type FacType = 'hospital' | 'police' | 'fire';
type FacilityWithDist = Facility & { distance: number };

const typeToFac: Record<string, FacType> = {
  medical: 'hospital', fire: 'fire', flood: 'fire', accident: 'police', violence: 'police',
};
const facConfig: Record<FacType, { icon: string; color: string; light: string; label: string }> = {
  hospital: { icon: '🏥', color: '#2f855a', light: '#f0fff4', label: 'Cliniques & Hôpitaux' },
  police:   { icon: '🚔', color: '#2b4694', light: '#ebf0ff', label: 'Postes de police' },
  fire:     { icon: '🚒', color: '#c05621', light: '#fffaf0', label: 'Garnisons de sapeurs-pompiers' },
};
const typeConfig: Record<string, { icon: string; color: string; label: string }> = {
  medical:  { icon: '🏥', color: '#0096C7', label: 'Urgence médicale' },
  fire:     { icon: '🔥', color: '#dd6b20', label: 'Incendie' },
  flood:    { icon: '🌊', color: '#2b6cb0', label: 'Inondation' },
  accident: { icon: '🚗', color: '#d69e2e', label: 'Accident' },
  violence: { icon: '⚠️', color: '#805ad5', label: 'Violence' },
  other:    { icon: '🆘', color: '#718096', label: 'Autre urgence' },
};

export default function NearbyFacilitiesPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { createAlert } = useAlerts();

  const alertType = (params.get('type') || 'medical') as AlertType;
  const facType: FacType = typeToFac[alertType] || 'hospital';
  const fac = facConfig[facType];
  const tConf = typeConfig[alertType] || typeConfig.other;

  const [allFacilities, setAllFacilities] = useState<Facility[]>([]);
  const [facLoading, setFacLoading] = useState(true);

  const [userPos, setUserPos] = useState(CONAKRY);
  const [gpsReady, setGpsReady] = useState(false);

  useEffect(() => {
    facilityService.getAll()
      .then(setAllFacilities)
      .catch(() => {})
      .finally(() => setFacLoading(false));
  }, []);

  useEffect(() => {
    getCurrentPosition(CONAKRY).then(p => {
      setUserPos({ lat: p.lat, lng: p.lng });
      setGpsReady(p.fromGPS);
    });
  }, []);

  const facilities = useMemo<FacilityWithDist[]>(() =>
    allFacilities
      .filter(f => f.type === facType)
      .map(f => ({ ...f, distance: kmDist(userPos.lat, userPos.lng, f.lat, f.lng) }))
      .sort((a, b) => a.distance - b.distance),
    [allFacilities, facType, userPos]
  );

  const [selected, setSelected] = useState<FacilityWithDist | null>(null);
  const [step, setStep] = useState<'map' | 'form'>('map');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ description: '', priority: 'high' as AlertPriority, note: '' });

  const handleSelectFacility = (f: FacilityWithDist) => {
    setSelected(f);
    setSidebarOpen(false);
  };

  const markers = useMemo<MapMarker[]>(() => facilities.map((f, i) => ({
    id: f.id,
    lat: f.lat,
    lng: f.lng,
    icon: fac.icon,
    color: fac.color,
    title: f.name,
    size: selected?.id === f.id ? 'lg' : 'md',
    popup: (
      <div style={{ minWidth: 180, maxWidth: 240, padding: '2px 4px 4px' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
          {i === 0 ? '⭐ ' : ''}{f.name}
        </div>
        <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>📍 {f.address}</div>
        <div style={{ fontSize: 11, color: fac.color, fontWeight: 700 }}>📏 {f.distance.toFixed(1)} km · {f.phone}</div>
      </div>
    ),
  })), [facilities, fac.color, fac.icon, selected]);

  const mapCenter = selected ? { lat: selected.lat, lng: selected.lng } : userPos;

  const handleSubmit = async () => {
    if (!form.description.trim()) return toast.error('Décrivez la situation');
    if (!selected) return toast.error('Sélectionnez un établissement');
    if (!user) return;
    setLoading(true);
    try {
      await createAlert({
        type: alertType,
        title: `${tConf.label} — ${selected.name}`,
        description: form.description,
        priority: form.priority,
        address: `${selected.address}${form.note ? ` (${form.note})` : ''}`,
        city: 'Conakry',
        citizenId: user.id,
        citizenFirstName: user.firstName,
        citizenLastName: user.lastName,
        citizenPhone: user.phone,
        citizenEmail: user.email,
        facilityId: selected.id,
      });
      toast.success(`Alerte envoyée à ${selected.name} !`);
      setTimeout(() => navigate('/citizen/history'), 2000);
    } catch {
      toast.error('Erreur lors de l\'envoi. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout noPadding>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }} className="page-enter">

        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, zIndex: 10 }}>
          <button onClick={() => step === 'form' ? setStep('map') : navigate('/citizen/dashboard')}
            style={{ background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer', color: '#4a5568', display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Retour
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>{tConf.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a202c' }}>{tConf.label}</div>
              <div style={{ fontSize: 11, color: '#718096' }}>
                {step === 'map' ? `Sélectionnez un établissement sur la carte` : `Remplissez le formulaire d'alerte`}
              </div>
            </div>
          </div>
          {/* Step indicator */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            {[{ n: 1, label: 'Choisir' }, { n: 2, label: 'Alerter' }].map(s => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: (step === 'map' ? 1 : 2) >= s.n ? fac.color : '#e2e8f0', color: (step === 'map' ? 1 : 2) >= s.n ? 'white' : '#a0aec0', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.n}</div>
                <span style={{ fontSize: 11, color: (step === 'map' ? 1 : 2) >= s.n ? fac.color : '#a0aec0', fontWeight: 600 }}>{s.label}</span>
                {s.n < 2 && <span style={{ color: '#e2e8f0', fontSize: 12 }}>›</span>}
              </div>
            ))}
          </div>
        </div>

        {step === 'map' ? (
          /* ── MAP STEP ── */
          <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>

            {/* Mobile toggle */}
            <button className="map-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ position: 'absolute', top: 12, left: 12, zIndex: 60, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700, color: '#1a202c', cursor: 'pointer', alignItems: 'center', gap: 6, boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}>
              {fac.icon} {facLoading ? '...' : `${facilities.length} établissements`}
            </button>

            {/* Sidebar backdrop */}
            {sidebarOpen && (
              <div onClick={() => setSidebarOpen(false)}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 49 }}
                className="show-mobile" />
            )}

            {/* Sidebar */}
            <div className={`map-sidebar${sidebarOpen ? ' open' : ''}`}
              style={{ width: 320, background: '#fff', borderRight: '1px solid #e2e8f0', overflow: 'auto', flexShrink: 0, zIndex: 50 }}>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>{fac.icon}</span>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#1a202c' }}>{fac.label}</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, padding: '7px 10px', background: gpsReady ? '#f0fff4' : '#fffaf0', border: `1px solid ${gpsReady ? '#c6f6d5' : '#feebc8'}`, borderRadius: 8 }}>
                  <span style={{ fontSize: 12 }}>📍</span>
                  <span style={{ fontSize: 11, color: gpsReady ? '#2f855a' : '#c05621', fontWeight: 600 }}>
                    {gpsReady ? 'Position GPS détectée' : 'Position par défaut — Conakry'}
                  </span>
                </div>

                <p style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>
                  Cliquez sur un établissement pour l'alerter
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {facLoading && (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#a0aec0' }}>
                      <div style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: fac.color, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: 12 }}>Chargement des établissements...</p>
                    </div>
                  )}
                  {!facLoading && facilities.length === 0 && (
                    <p style={{ fontSize: 12, color: '#a0aec0', textAlign: 'center', padding: '20px 0' }}>Aucun établissement disponible</p>
                  )}
                  {facilities.map((f, i) => {
                    const isSel = selected?.id === f.id;
                    return (
                      <div key={f.id} onClick={() => handleSelectFacility(f)}
                        style={{ padding: '12px', border: `1.5px solid ${isSel ? fac.color : '#e2e8f0'}`, borderRadius: 10, cursor: 'pointer', background: isSel ? fac.light : '#fafafa', transition: 'all 0.15s' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: isSel ? fac.color : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                            {i === 0 ? '⭐' : fac.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a202c', marginBottom: 2 }}>{f.name}</div>
                            <div style={{ fontSize: 11, color: '#718096', marginBottom: 4 }}>📍 {f.address}</div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? '#48bb78' : fac.color, background: i === 0 ? '#f0fff4' : fac.light, padding: '2px 7px', borderRadius: 6 }}>
                                {i === 0 ? '🏆 Le plus proche' : `📏 ${f.distance.toFixed(1)} km`}
                              </span>
                              {isSel && <span style={{ fontSize: 10, fontWeight: 700, color: fac.color }}>✓ Sélectionné</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Map area */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              <GoogleMap
                center={mapCenter}
                zoom={selected ? 15 : 13}
                markers={markers}
                selectedId={selected?.id || null}
                userLocation={userPos}
                drawRouteToSelected
                onMarkerClick={id => {
                  const f = facilities.find(x => x.id === id);
                  if (f) handleSelectFacility(f);
                }}
                style={{ borderRadius: 0, height: '100%' }}
              />

              {/* Map title */}
              <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: '8px 14px', boxShadow: '0 4px 16px rgba(15,23,42,0.12)', border: '1px solid rgba(15,23,42,0.06)', zIndex: 5 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>Conakry, Guinée</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Sélectionnez un établissement</div>
              </div>

              {/* Legend */}
              <div style={{ position: 'absolute', bottom: 24, right: 14, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 16px rgba(15,23,42,0.12)', border: '1px solid rgba(15,23,42,0.06)', zIndex: 5 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', letterSpacing: 1, marginBottom: 6 }}>LÉGENDE</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, marginBottom: 4 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#0077B6', border: '2px solid white', boxShadow: '0 1px 4px rgba(66,153,225,0.5)' }} />
                  Votre position
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: fac.color, border: '2px solid white' }} />
                  {fac.label.split(' ')[0]}
                </div>
              </div>

              {/* CTA when facility selected */}
              {selected && (
                <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: 14, padding: '14px 20px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', border: `2px solid ${fac.color}`, display: 'flex', alignItems: 'center', gap: 16, maxWidth: '90vw', zIndex: 5, animation: 'scaleIn 0.2s ease' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a202c' }}>{selected.name}</div>
                    <div style={{ fontSize: 11, color: '#718096' }}>📏 {selected.distance.toFixed(1)} km · {selected.phone}</div>
                  </div>
                  <button onClick={() => setStep('form')}
                    style={{ padding: '10px 18px', background: fac.color, border: 'none', borderRadius: 10, color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Alerter →
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── FORM STEP ── */
          <div style={{ flex: 1, overflow: 'auto', padding: 'clamp(16px,3vw,28px)', background: '#f7fafc' }}>
            <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Selected facility banner */}
              <div style={{ background: '#fff', border: `2px solid ${fac.color}`, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: fac.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{fac.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a202c' }}>{selected!.name}</div>
                  <div style={{ fontSize: 12, color: '#718096' }}>📍 {selected!.address}</div>
                  <div style={{ fontSize: 11, color: fac.color, fontWeight: 600, marginTop: 2 }}>📏 {selected!.distance.toFixed(1)} km de vous · {selected!.phone}</div>
                </div>
                <button onClick={() => setStep('map')} style={{ fontSize: 11, color: fac.color, background: fac.light, border: 'none', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}>Changer</button>
              </div>

              {/* Priority */}
              <div style={{ background: '#fff', borderRadius: 14, padding: 'clamp(16px,3vw,20px)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a202c', marginBottom: 12 }}>Niveau d'urgence *</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { value: 'medium', label: 'Modérée', color: '#d69e2e', icon: '🟡' },
                    { value: 'high', label: 'Élevée', color: '#ed8936', icon: '🟠' },
                    { value: 'critical', label: 'Critique', color: '#0096C7', icon: '⚡' },
                  ].map(p => (
                    <button key={p.value} onClick={() => setForm(f => ({ ...f, priority: p.value as AlertPriority }))}
                      style={{ flex: 1, minWidth: 80, padding: '11px 8px', border: `2px solid ${form.priority === p.value ? p.color : '#e2e8f0'}`, borderRadius: 10, background: form.priority === p.value ? `${p.color}10` : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: form.priority === p.value ? p.color : '#4a5568', transition: 'all 0.15s' }}>
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div style={{ background: '#fff', borderRadius: 14, padding: 'clamp(16px,3vw,20px)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a202c', marginBottom: 12 }}>Description de la situation *</h3>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder={
                    facType === 'hospital' ? "Décrivez les symptômes, nombre de victimes, état du patient..." :
                    facType === 'fire' ? "Décrivez le sinistre : localisation, propagation, personnes en danger..." :
                    "Décrivez l'incident : nature des faits, nombre de personnes impliquées..."
                  }
                  rows={4}
                  style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#2d3748', resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
                  onFocus={e => e.target.style.borderColor = fac.color}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 4, textAlign: 'right' }}>{form.description.length}/500</div>
              </div>

              {/* Address precision */}
              <div style={{ background: '#fff', borderRadius: 14, padding: 'clamp(16px,3vw,20px)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a202c', marginBottom: 4 }}>Précision de localisation <span style={{ fontWeight: 400, color: '#a0aec0' }}>(optionnel)</span></h3>
                <p style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>Aidez les secours à vous trouver plus vite</p>
                <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Ex : devant la pharmacie, 2ème étage, bâtiment rouge..."
                  style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = fac.color}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              {/* Info banner */}
              <div style={{ padding: '12px 16px', background: fac.light, border: `1px solid ${fac.color}30`, borderRadius: 12, fontSize: 12, color: fac.color, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{fac.icon}</span>
                <span>L'alerte sera transmise directement à <strong>{selected!.name}</strong>. Une équipe vous contactera au <strong>{user?.phone}</strong>.</span>
              </div>

              {/* Submit */}
              <button onClick={handleSubmit} disabled={loading || !form.description.trim()}
                style={{ padding: 'clamp(14px,3vw,16px)', border: 'none', borderRadius: 13, background: loading || !form.description.trim() ? '#cbd5e0' : fac.color, color: 'white', fontSize: 'clamp(13px,2vw,15px)', fontWeight: 700, cursor: loading || !form.description.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: loading || !form.description.trim() ? 'none' : `0 6px 22px ${fac.color}50` }}>
                {loading
                  ? <><span className="animate-spin" style={{ width: 20, height: 20, border: '3px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} /> Envoi en cours...</>
                  : `🆘 ENVOYER L'ALERTE À ${selected!.name.toUpperCase()}`
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
