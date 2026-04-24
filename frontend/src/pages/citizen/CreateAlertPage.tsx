import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import PageLayout from '../../components/layout/PageLayout';
import { AlertType, AlertPriority, Facility } from '../../types';
import { alertTypeLabels } from '../../utils/helpers';
import { facilityService } from '../../services/facilityService';
import toast from 'react-hot-toast';

const alertTypes: { value: AlertType; icon: string; color: string; facilityType: string }[] = [
  { value: 'medical',  icon: '🏥', color: '#0096C7', facilityType: 'hospital' },
  { value: 'fire',     icon: '🔥', color: '#dd6b20', facilityType: 'fire' },
  { value: 'accident', icon: '🚗', color: '#d69e2e', facilityType: 'police' },
  { value: 'violence', icon: '⚠️', color: '#805ad5', facilityType: 'police' },
  { value: 'flood',    icon: '🌊', color: '#2b6cb0', facilityType: 'fire' },
  { value: 'other',    icon: '🆘', color: '#718096', facilityType: '' },
];

const facilityTypeLabel: Record<string, string> = {
  hospital: 'Hôpital / Clinique',
  police:   'Commissariat de Police',
  fire:     'Caserne de Pompiers',
};

export default function CreateAlertPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { createAlert } = useAlerts();

  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loadingFac, setLoadingFac] = useState(false);

  const [form, setForm] = useState({
    type:       (params.get('type') || '') as AlertType | '',
    facilityId: '',
    title:      '',
    description: '',
    priority:   'high' as AlertPriority,
    address:    '',
    city:       'Conakry',
    useGPS:     true,
  });

  const update = (field: string, val: any) => setForm(p => ({ ...p, [field]: val }));

  const selectedTypeCfg = alertTypes.find(t => t.value === form.type);

  // Fetch facilities whenever type changes
  useEffect(() => {
    if (!form.type) { setFacilities([]); return; }
    const fType = alertTypes.find(t => t.value === form.type)?.facilityType;
    if (!fType) { setFacilities([]); return; }
    setLoadingFac(true);
    setForm(p => ({ ...p, facilityId: '' }));
    facilityService.getAll(fType)
      .then(data => setFacilities(data))
      .catch(() => setFacilities([]))
      .finally(() => setLoadingFac(false));
  }, [form.type]);

  const handleSubmit = async () => {
    if (!form.type) return toast.error('Sélectionnez un type d\'urgence');
    if (selectedTypeCfg?.facilityType && !form.facilityId) return toast.error('Sélectionnez un établissement');
    if (!form.description) return toast.error('Décrivez la situation');
    if (!form.address && !form.useGPS) return toast.error('Indiquez l\'adresse');
    if (!user) return;

    setLoading(true);
    try {
      await createAlert({
        type:        form.type as AlertType,
        title:       form.title || alertTypeLabels[form.type as AlertType],
        description: form.description,
        priority:    form.priority,
        address:     form.useGPS ? 'Position GPS détectée' : form.address,
        city:        form.city,
        citizenId:   user.id,
        facilityId:  form.facilityId || undefined,
      });
      setSuccess(true);
      toast.success('Alerte envoyée ! Les secours sont prévenus.');
      setTimeout(() => navigate('/citizen/history'), 2500);
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de l\'envoi. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center', padding: '20px' }} className="page-enter">
          <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, #48bb78, #2f855a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 20px', boxShadow: '0 0 0 18px rgba(72,187,120,0.1)' }}>✓</div>
          <h2 style={{ fontSize: 'clamp(20px,4vw,26px)', fontWeight: 800, color: '#1a202c', marginBottom: 8 }}>Alerte envoyée !</h2>
          <p style={{ color: '#718096', fontSize: 14, maxWidth: 340, lineHeight: 1.7, marginBottom: 20 }}>
            Votre demande de secours a été transmise. Les équipes arrivent dans les plus brefs délais.
          </p>
          <div style={{ padding: '12px 18px', background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: 10, fontSize: 13, color: '#2f855a', fontWeight: 600 }}>
            🚑 Restez à votre position et gardez votre téléphone accessible
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div style={{ maxWidth: 680, margin: '0 auto' }} className="page-enter">
        <div style={{ marginBottom: 22 }}>
          <button onClick={() => navigate('/citizen/dashboard')} style={{ background: 'none', border: 'none', color: '#718096', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>← Retour</button>
          <h1 style={{ fontSize: 'clamp(20px,4vw,26px)', fontWeight: 800, color: '#1a202c', marginBottom: 4 }}>🆘 Lancer une alerte</h1>
          <p style={{ color: '#718096', fontSize: 13 }}>Remplissez le formulaire rapidement. Chaque seconde compte.</p>
        </div>

        {/* SOS banner */}
        <div style={{ background: 'linear-gradient(135deg, #0096C7, #0077B6)', borderRadius: 14, padding: '14px 18px', color: 'white', display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>🚨</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Urgence immédiate ? Appelez le 18</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>Ce formulaire est pour les urgences non-immédiates.</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Step 1 — Type */}
          <div className="card" style={{ padding: 'clamp(16px,3vw,22px)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a202c', marginBottom: 14 }}>1. Type d'urgence *</h3>
            <div className="type-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {alertTypes.map(t => (
                <button key={t.value} onClick={() => update('type', t.value)}
                  style={{ padding: 'clamp(10px,2vw,14px) 8px', border: `2px solid ${form.type === t.value ? t.color : '#e2e8f0'}`, borderRadius: 10, background: form.type === t.value ? `${t.color}10` : '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 'clamp(20px,4vw,24px)' }}>{t.icon}</span>
                  <span style={{ fontSize: 'clamp(9px,1.5vw,11px)', fontWeight: 600, color: form.type === t.value ? t.color : '#4a5568', textAlign: 'center', lineHeight: 1.2 }}>
                    {alertTypeLabels[t.value]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 — Facility (shown once type with a facilityType is selected) */}
          {form.type && selectedTypeCfg?.facilityType && (
            <div className="card" style={{ padding: 'clamp(16px,3vw,22px)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a202c', marginBottom: 4 }}>
                2. {facilityTypeLabel[selectedTypeCfg.facilityType]} le plus proche *
              </h3>
              <p style={{ fontSize: 12, color: '#718096', marginBottom: 14 }}>Choisissez l'établissement qui doit recevoir votre alerte</p>

              {loadingFac ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#a0aec0', fontSize: 13 }}>Chargement des établissements...</div>
              ) : facilities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px', color: '#a0aec0', fontSize: 13, background: '#f7fafc', borderRadius: 10 }}>Aucun établissement disponible</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {facilities.map(fac => (
                    <button key={fac.id} onClick={() => update('facilityId', fac.id)}
                      style={{ padding: '12px 16px', border: `2px solid ${form.facilityId === fac.id ? selectedTypeCfg.color : '#e2e8f0'}`, borderRadius: 12, background: form.facilityId === fac.id ? `${selectedTypeCfg.color}08` : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', transition: 'all 0.15s' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: form.facilityId === fac.id ? `${selectedTypeCfg.color}15` : '#f7fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                        {selectedTypeCfg.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a202c' }}>{fac.name}</div>
                        <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>📍 {fac.address}</div>
                        {fac.phone && <div style={{ fontSize: 11, color: '#a0aec0' }}>📞 {fac.phone}</div>}
                      </div>
                      {form.facilityId === fac.id && (
                        <span style={{ color: selectedTypeCfg.color, fontWeight: 700, fontSize: 18 }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Priority */}
          <div className="card" style={{ padding: 'clamp(16px,3vw,22px)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a202c', marginBottom: 14 }}>
              {form.type && selectedTypeCfg?.facilityType ? '3' : '2'}. Niveau d'urgence *
            </h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { value: 'medium',   label: 'Modérée',  color: '#d69e2e', icon: '🟡' },
                { value: 'high',     label: 'Élevée',   color: '#ed8936', icon: '🟠' },
                { value: 'critical', label: 'Critique', color: '#0096C7', icon: '⚡' },
              ].map(p => (
                <button key={p.value} onClick={() => update('priority', p.value)}
                  style={{ flex: 1, minWidth: 80, padding: '11px 8px', border: `2px solid ${form.priority === p.value ? p.color : '#e2e8f0'}`, borderRadius: 10, background: form.priority === p.value ? `${p.color}10` : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: form.priority === p.value ? p.color : '#4a5568', transition: 'all 0.15s' }}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4 — Description */}
          <div className="card" style={{ padding: 'clamp(16px,3vw,22px)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a202c', marginBottom: 14 }}>
              {form.type && selectedTypeCfg?.facilityType ? '4' : '3'}. Description *
            </h3>
            <textarea value={form.description} onChange={e => update('description', e.target.value)}
              placeholder="Décrivez la situation : nombre de victimes, état, détails importants..."
              rows={4} style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 14, color: '#2d3748', resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = '#0077B6'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 4, textAlign: 'right' }}>{form.description.length}/500</div>
          </div>

          {/* Step 5 — Location */}
          <div className="card" style={{ padding: 'clamp(16px,3vw,22px)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a202c', marginBottom: 14 }}>
              {form.type && selectedTypeCfg?.facilityType ? '5' : '4'}. Localisation *
            </h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {[
                { val: true,  icon: '📍', label: 'Ma position GPS',  color: '#48bb78' },
                { val: false, icon: '✍️', label: 'Saisie manuelle', color: '#0077B6' },
              ].map(opt => (
                <button key={String(opt.val)} onClick={() => update('useGPS', opt.val)}
                  style={{ flex: 1, minWidth: 120, padding: '11px 8px', border: `2px solid ${form.useGPS === opt.val ? opt.color : '#e2e8f0'}`, borderRadius: 9, background: form.useGPS === opt.val ? `${opt.color}08` : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: form.useGPS === opt.val ? opt.color : '#4a5568', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
            {form.useGPS ? (
              <div style={{ padding: '11px 14px', background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: 9, fontSize: 13, color: '#2f855a', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span>📍</span> <span>Position GPS détectée (Conakry)</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                <input value={form.address} onChange={e => update('address', e.target.value)} placeholder="Adresse ou description du lieu"
                  style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 14, outline: 'none' }} />
                <input value={form.city} onChange={e => update('city', e.target.value)} placeholder="Ville"
                  style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 14, outline: 'none' }} />
              </div>
            )}
            {form.useGPS && (
              <input value={form.address} onChange={e => update('address', e.target.value)} placeholder="Précision : ex. devant la pharmacie centrale"
                style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, outline: 'none' }} />
            )}
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading}
            style={{ padding: 'clamp(14px,3vw,16px)', border: 'none', borderRadius: 13, background: loading ? '#cbd5e0' : 'linear-gradient(135deg, #0096C7, #0077B6)', color: 'white', fontSize: 'clamp(13px,2vw,16px)', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: loading ? 'none' : '0 6px 22px rgba(229,62,62,0.4)' }}>
            {loading ? (
              <><span style={{ width: 20, height: 20, border: '3px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Envoi en cours...</>
            ) : '🆘 ENVOYER L\'ALERTE DE SECOURS'}
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
