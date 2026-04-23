import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/common/Logo';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [form, setForm] = useState({ email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const identifier = loginMethod === 'phone' ? form.phone : form.email;
    if (!identifier) return setError(loginMethod === 'phone' ? 'Entrez votre numéro de téléphone' : 'Entrez votre email');
    try {
      await login(identifier, form.password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#020d1a', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
        .login-left { flex:1; display:flex; align-items:center; justify-content:center; padding:40px; }
        .login-right { width:440px; display:flex; align-items:center; justify-content:center; padding:40px 32px; background:#fff; }
        .input-field:focus { border-color:#0096C7 !important; }
        @media(max-width:768px){
          .login-left { display:none !important; }
          .login-right { width:100% !important; padding:28px 20px !important; background:#fff; }
          .show-mobile { display:flex !important; }
        }
        .show-mobile { display:none; }
      `}</style>

      {/* ── Left panel ── */}
      <div className="login-left" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #020d1a 0%, #03254c 50%, #023e8a 100%)' }}>
        {/* Glows */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,150,199,0.2) 0%, transparent 65%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '0%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(72,202,228,0.12) 0%, transparent 65%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,150,199,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,150,199,0.04) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

        <div style={{ position: 'relative', textAlign: 'center', color: 'white', animation: 'slideInLeft 0.6s ease', padding: '0 40px', maxWidth: 420 }}>
          {/* Logo ring */}
          <div style={{ width: 110, height: 110, borderRadius: '50%', margin: '0 auto 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', boxShadow: '0 0 0 20px rgba(0,150,199,0.12), 0 0 0 40px rgba(0,150,199,0.06)', animation: 'float 4s ease-in-out infinite' }}>
            <Logo size={96} shadow />
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2, marginBottom: 12 }}>
            SOS
            <br />
            <span style={{ background: 'linear-gradient(135deg, #48CAE4, #0096C7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VIE</span>
          </h1>
          <p style={{ color: '#90a4b8', fontSize: 15, lineHeight: 1.7, marginBottom: 36, maxWidth: 300, margin: '0 auto 36px' }}>
            Système national de gestion des urgences — Guinée
          </p>

          <div style={{ display: 'inline-block', padding: '18px 32px', background: 'rgba(0,150,199,0.12)', border: '1px solid rgba(0,180,216,0.25)', borderRadius: 16 }}>
            <div style={{ fontSize: 11, color: '#48CAE4', fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>NUMÉRO D'URGENCE</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#0096C7', letterSpacing: 3, lineHeight: 1 }}>18</div>
          </div>

          {/* Service badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
            {[{ icon: '🚔', label: 'Police' }, { icon: '🏥', label: 'Hôpital' }, { icon: '🚒', label: 'Pompiers' }].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(0,150,199,0.1)', border: '1px solid rgba(0,180,216,0.2)', fontSize: 12, color: '#90e0ef', fontWeight: 600 }}>
                {s.icon} {s.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="login-right">
        <div style={{ width: '100%', maxWidth: 360, animation: 'slideInRight 0.6s ease' }}>

          {/* Mobile logo */}
          <div className="show-mobile" style={{ justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ margin: '0 auto 10px', display: 'inline-flex' }}><Logo size={56} /></div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#1a202c' }}>SOS VIE</div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#1a202c', marginBottom: 5, letterSpacing: -0.5 }}>Bienvenue 👋</h2>
            <p style={{ color: '#6b8fa8', fontSize: 14 }}>Connectez-vous à votre espace sécurisé</p>
          </div>

          {error && (
            <div style={{ padding: '11px 14px', background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 10, marginBottom: 18, fontSize: 13, color: '#c53030', display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Toggle */}
          <div style={{ display: 'flex', gap: 5, marginBottom: 18, background: '#f0f9ff', padding: 4, borderRadius: 12, border: '1px solid #d1e8f0' }}>
            {[{ v: 'email', icon: '📧', label: 'Email' }, { v: 'phone', icon: '📱', label: 'Téléphone' }].map(m => (
              <button key={m.v} type="button" onClick={() => setLoginMethod(m.v as 'email' | 'phone')}
                style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', background: loginMethod === m.v ? '#0096C7' : 'transparent', color: loginMethod === m.v ? '#fff' : '#6b8fa8', fontSize: 13, fontWeight: loginMethod === m.v ? 700 : 500, cursor: 'pointer', boxShadow: loginMethod === m.v ? '0 2px 8px rgba(0,150,199,0.35)' : 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {loginMethod === 'email' ? (
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 6 }}>Adresse email</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>📧</span>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="votre@email.com"
                    className="input-field"
                    style={{ width: '100%', padding: '12px 14px 12px 42px', border: '1.5px solid #d1e8f0', borderRadius: 10, fontSize: 14, color: '#1a202c', outline: 'none', background: '#f0f9ff', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#0096C7'} onBlur={e => e.target.style.borderColor = '#d1e8f0'} />
                </div>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 6 }}>Numéro de téléphone</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>📱</span>
                  <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+224 628 00 00 00"
                    className="input-field"
                    style={{ width: '100%', padding: '12px 14px 12px 42px', border: '1.5px solid #d1e8f0', borderRadius: 10, fontSize: 14, color: '#1a202c', outline: 'none', background: '#f0f9ff', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#0096C7'} onBlur={e => e.target.style.borderColor = '#d1e8f0'} />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: 6 }}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>🔒</span>
                <input type={showPwd ? 'text' : 'password'} required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••"
                  className="input-field"
                  style={{ width: '100%', padding: '12px 44px 12px 42px', border: '1.5px solid #d1e8f0', borderRadius: 10, fontSize: 14, color: '#1a202c', outline: 'none', background: '#f0f9ff', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#0096C7'} onBlur={e => e.target.style.borderColor = '#d1e8f0'} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: 15, cursor: 'pointer', color: '#6b8fa8' }}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              style={{ marginTop: 4, padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #0096C7, #0077B6)', color: 'white', fontSize: 15, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.75 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 20px rgba(0,150,199,0.4)', transition: 'all 0.2s' }}>
              {isLoading
                ? <><span style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Connexion...</>
                : '🔓 Se connecter'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#6b8fa8', marginTop: 20 }}>
            Pas encore de compte ?{' '}
            <button onClick={() => navigate('/register')} style={{ background: 'none', border: 'none', color: '#0096C7', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>S'inscrire</button>
          </p>
          <p style={{ textAlign: 'center', marginTop: 6 }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#a0aec0', cursor: 'pointer', fontSize: 12 }}>← Retour à l'accueil</button>
          </p>
        </div>
      </div>
    </div>
  );
}
