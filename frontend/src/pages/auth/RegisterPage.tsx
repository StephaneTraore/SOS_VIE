import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import Logo from '../../components/common/Logo';

const steps = ['Identité', 'Sécurité', 'Confirmation'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [form, setForm] = useState({
    role: 'citizen' as Role, firstName: '', lastName: '', email: '',
    phone: '', password: '', confirmPassword: '', acceptTerms: false,
  });

  const update = (field: string, value: any) => setForm(p => ({ ...p, [field]: value }));
  const isCitizen = form.role === 'citizen';

  const handleSubmit = async () => {
    setError('');
    if (!form.firstName || !form.lastName) return setError('Veuillez renseigner votre nom complet');
    if (loginMethod === 'phone' && isCitizen) {
      if (!form.phone) return setError('Numéro de téléphone requis');
    } else {
      if (!form.email) return setError('Email requis');
      if (!form.phone) return setError('Téléphone requis');
    }
    if (form.password.length < 8) return setError('Mot de passe : 8 caractères minimum');
    if (form.password !== form.confirmPassword) return setError('Les mots de passe ne correspondent pas');
    if (!form.acceptTerms) return setError("Acceptez les conditions d'utilisation");
    const emailToUse = form.email || `${form.phone.replace(/\s/g, '')}@sos-phone.gn`;
    try {
      await register({ role: form.role, firstName: form.firstName, lastName: form.lastName, email: emailToUse, phone: form.phone, password: form.password, loginMethod: loginMethod === 'phone' && isCitizen ? 'phone' : 'email' });
    } catch (err: any) { setError(err.message); }
  };

  const nextStep = () => {
    setError('');
    if (step === 0) {
      if (!form.firstName || !form.lastName) return setError('Prénom et nom requis');
      if (loginMethod === 'phone' && isCitizen) {
        if (!form.phone) return setError('Numéro de téléphone requis');
      } else {
        if (!form.email) return setError('Email requis');
      }
    }
    setStep(s => s + 1);
  };

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '11px 13px',
    border: '1.5px solid #d1e8f0', borderRadius: 9,
    fontSize: 14, outline: 'none', background: '#f0f9ff',
    color: '#1a202c', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #020d1a 0%, #03254c 50%, #023e8a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pageEnter { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .page-enter { animation: pageEnter 0.3s ease; }
        @media(max-width:480px){
          .register-steps { display:none !important; }
          .show-mobile { display:flex !important; }
          .grid-2 { grid-template-columns:1fr !important; }
        }
        .show-mobile { display:none; }
      `}</style>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, cursor: 'pointer' }} onClick={() => navigate('/')}>
        <Logo size={40} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>SOS VIE</div>
          <div style={{ fontSize: 9, color: '#48CAE4', letterSpacing: 2, fontWeight: 700 }}>CRÉER UN COMPTE</div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 22, boxShadow: '0 20px 60px rgba(0,0,0,0.35)', width: '100%', maxWidth: 500, overflow: 'hidden', animation: 'scaleIn 0.3s ease' }}>

        {/* Progress bar */}
        <div style={{ height: 4, background: '#e0f0f8' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, #0096C7, #48CAE4)', width: `${((step + 1) / steps.length) * 100}%`, transition: 'width 0.4s ease' }} />
        </div>

        <div style={{ padding: '28px 26px' }}>

          {/* Step indicators — desktop */}
          <div className="register-steps" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
            {steps.map((s, i) => (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: i <= step ? '#0096C7' : '#e0f0f8', color: i <= step ? 'white' : '#90a4b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, transition: 'all 0.3s', boxShadow: i === step ? '0 0 0 4px rgba(0,150,199,0.2)' : 'none' }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 10, color: i === step ? '#0096C7' : '#a0aec0', fontWeight: i === step ? 700 : 400 }}>{s}</span>
              </div>
            ))}
          </div>

          {/* Mobile step indicator */}
          <div className="show-mobile" style={{ marginBottom: 20, alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#0096C7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{step + 1}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a202c' }}>Étape {step + 1} / {steps.length}</div>
              <div style={{ fontSize: 12, color: '#6b8fa8' }}>{steps[step]}</div>
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 10, marginBottom: 18, fontSize: 13, color: '#c53030' }}>⚠️ {error}</div>
          )}

          {/* ── Step 0: Identity ── */}
          {step === 0 && (
            <div className="page-enter">
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1a202c', marginBottom: 4 }}>Vos informations</h3>
              <p style={{ color: '#6b8fa8', fontSize: 13, marginBottom: 18 }}>Renseignez vos coordonnées</p>

              {isCitizen && (
                <div style={{ display: 'flex', gap: 5, marginBottom: 18, background: '#f0f9ff', padding: 4, borderRadius: 11, border: '1px solid #d1e8f0' }}>
                  {[{ v: 'email', icon: '📧', label: 'Par email' }, { v: 'phone', icon: '📱', label: 'Par téléphone' }].map(m => (
                    <button key={m.v} type="button" onClick={() => setLoginMethod(m.v as 'email' | 'phone')}
                      style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: 'none', background: loginMethod === m.v ? '#0096C7' : 'transparent', color: loginMethod === m.v ? '#fff' : '#6b8fa8', fontSize: 13, fontWeight: loginMethod === m.v ? 700 : 500, cursor: 'pointer', boxShadow: loginMethod === m.v ? '0 2px 8px rgba(0,150,199,0.35)' : 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 5 }}>Prénom *</label>
                    <input value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="Mamadou" style={inputBase}
                      onFocus={e => e.target.style.borderColor = '#0096C7'} onBlur={e => e.target.style.borderColor = '#d1e8f0'} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 5 }}>Nom *</label>
                    <input value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Diallo" style={inputBase}
                      onFocus={e => e.target.style.borderColor = '#0096C7'} onBlur={e => e.target.style.borderColor = '#d1e8f0'} />
                  </div>
                </div>

                {loginMethod === 'phone' && isCitizen ? (
                  <>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 5 }}>
                        Téléphone * <span style={{ fontSize: 11, color: '#0096C7', fontWeight: 500 }}>(identifiant de connexion)</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>📱</span>
                        <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+224 628 00 00 00"
                          style={{ ...inputBase, paddingLeft: 40, borderColor: '#0096C7' }}
                          onFocus={e => e.target.style.borderColor = '#0077B6'} onBlur={e => e.target.style.borderColor = '#0096C7'} />
                      </div>
                      <div style={{ fontSize: 11, color: '#6b8fa8', marginTop: 4 }}>Vous utiliserez ce numéro pour vous connecter</div>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 5 }}>Email <span style={{ color: '#a0aec0', fontWeight: 400 }}>(optionnel)</span></label>
                      <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="votre@email.com" style={inputBase}
                        onFocus={e => e.target.style.borderColor = '#0096C7'} onBlur={e => e.target.style.borderColor = '#d1e8f0'} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 5 }}>
                        Email * {isCitizen && <span style={{ fontSize: 11, color: '#0096C7', fontWeight: 500 }}>(identifiant de connexion)</span>}
                      </label>
                      <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="votre@email.com" style={inputBase}
                        onFocus={e => e.target.style.borderColor = '#0096C7'} onBlur={e => e.target.style.borderColor = '#d1e8f0'} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 5 }}>Téléphone *</label>
                      <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+224 628 00 00 00" style={inputBase}
                        onFocus={e => e.target.style.borderColor = '#0096C7'} onBlur={e => e.target.style.borderColor = '#d1e8f0'} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Step 1: Security ── */}
          {step === 1 && (
            <div className="page-enter">
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1a202c', marginBottom: 4 }}>Sécurité du compte</h3>
              <p style={{ color: '#6b8fa8', fontSize: 13, marginBottom: 20 }}>Créez un mot de passe sécurisé</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 5 }}>Mot de passe *</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="Minimum 8 caractères"
                      style={{ ...inputBase, paddingRight: 42 }}
                      onFocus={e => e.target.style.borderColor = '#0096C7'} onBlur={e => e.target.style.borderColor = '#d1e8f0'} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b8fa8', padding: 0 }}>
                      {showPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {form.password && (
                    <div style={{ marginTop: 7 }}>
                      <div style={{ height: 4, background: '#e0f0f8', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 2, transition: 'all 0.3s', width: `${Math.min(100, (form.password.length / 12) * 100)}%`, background: form.password.length < 6 ? '#e53e3e' : form.password.length < 10 ? '#ecc94b' : '#0096C7' }} />
                      </div>
                      <div style={{ fontSize: 11, color: form.password.length < 6 ? '#e53e3e' : form.password.length < 10 ? '#b7791f' : '#0096C7', marginTop: 4, fontWeight: 600 }}>
                        {form.password.length < 6 ? 'Trop court' : form.password.length < 10 ? 'Moyen' : 'Fort ✓'}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 5 }}>Confirmer *</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showConfirmPwd ? 'text' : 'password'} value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="Répétez le mot de passe"
                      style={{ ...inputBase, paddingRight: 42, borderColor: form.confirmPassword && form.confirmPassword !== form.password ? '#e53e3e' : '#d1e8f0' }}
                      onFocus={e => e.target.style.borderColor = '#0096C7'} onBlur={e => e.target.style.borderColor = '#d1e8f0'} />
                    <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b8fa8', padding: 0 }}>
                      {showConfirmPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {form.confirmPassword && form.password === form.confirmPassword && (
                    <div style={{ fontSize: 12, color: '#0096C7', marginTop: 4, fontWeight: 600 }}>✓ Mots de passe identiques</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Confirm ── */}
          {step === 2 && (
            <div className="page-enter">
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1a202c', marginBottom: 4 }}>Récapitulatif</h3>
              <p style={{ color: '#6b8fa8', fontSize: 13, marginBottom: 18 }}>Vérifiez vos informations avant de créer le compte</p>
              <div style={{ background: '#f0f9ff', border: '1px solid #d1e8f0', borderRadius: 13, padding: '16px', marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {([
                  ['Nom', `${form.firstName} ${form.lastName}`],
                  ...(loginMethod === 'phone' && isCitizen
                    ? [['📱 Connexion par', form.phone], ...(form.email ? [['Email', form.email]] : [])]
                    : [['Email', form.email], ['Téléphone', form.phone]]
                  ),
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, flexWrap: 'wrap', gap: 4 }}>
                    <span style={{ color: '#6b8fa8' }}>{k}</span>
                    <span style={{ fontWeight: 700, color: '#1a202c', textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>
              {loginMethod === 'phone' && isCitizen && (
                <div style={{ padding: '10px 14px', background: '#e0f4ff', border: '1px solid #90cdf4', borderRadius: 10, marginBottom: 14, fontSize: 12, color: '#2b6cb0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  📱 Vous vous connecterez avec <strong>{form.phone}</strong>
                </div>
              )}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.acceptTerms} onChange={e => update('acceptTerms', e.target.checked)} style={{ marginTop: 3, accentColor: '#0096C7', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#4a5568', lineHeight: 1.6 }}>
                  J'accepte les <span style={{ color: '#0096C7', fontWeight: 700 }}>conditions d'utilisation</span> et la <span style={{ color: '#0096C7', fontWeight: 700 }}>politique de confidentialité</span>
                </span>
              </label>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                style={{ flex: 1, padding: '13px', border: '1.5px solid #d1e8f0', borderRadius: 12, background: '#fff', color: '#4a5568', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                ← Retour
              </button>
            )}
            {step < steps.length - 1 ? (
              <button onClick={nextStep}
                style={{ flex: 1, padding: '13px', border: 'none', borderRadius: 12, background: 'linear-gradient(135deg, #0096C7, #0077B6)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,150,199,0.4)', transition: 'all 0.2s' }}>
                Continuer →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isLoading}
                style={{ flex: 1, padding: '13px', border: 'none', borderRadius: 12, background: 'linear-gradient(135deg, #0096C7, #0077B6)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(0,150,199,0.4)' }}>
                {isLoading
                  ? <><span style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Création...</>
                  : '✓ Créer mon compte'}
              </button>
            )}
          </div>
        </div>
      </div>

      <p style={{ marginTop: 20, fontSize: 13, color: '#6b8fa8' }}>
        Déjà inscrit ?{' '}
        <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#48CAE4', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Se connecter</button>
      </p>
    </div>
  );
}
