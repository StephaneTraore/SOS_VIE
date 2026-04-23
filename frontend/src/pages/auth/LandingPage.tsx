import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/common/Logo';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    { icon: '🚨', title: 'Alerte instantanée', desc: 'Signalez une urgence en quelques secondes, 24h/24, 7j/7', color: '#0096C7' },
    { icon: '📍', title: 'Géolocalisation précise', desc: 'Votre position est automatiquement transmise aux secours', color: '#0077B6' },
    { icon: '⚡', title: 'Réponse rapide', desc: 'Les équipes de secours sont alertées immédiatement', color: '#00B4D8' },
    { icon: '📊', title: 'Suivi en temps réel', desc: "Suivez l'avancement de votre demande de secours", color: '#48CAE4' },
  ];

  const stats = [
    { value: '< 8 min', label: 'Temps de réponse moyen' },
    { value: '15 000+', label: 'Vies sauvées' },
    { value: '98%', label: 'Taux de satisfaction' },
    { value: '24/7', label: 'Disponibilité' },
  ];

  const services = [
    { icon: '🚔', label: 'Police', color: '#0077B6' },
    { icon: '🏥', label: 'Hôpital', color: '#00B4D8' },
    { icon: '🚒', label: 'Pompiers', color: '#0096C7' },
    { icon: '🚑', label: 'SAMU', color: '#48CAE4' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#020d1a', color: 'white', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-12px); } }
        @keyframes pulse-ring { 0% { transform:scale(0.85); opacity:0.8; } 70% { transform:scale(1.2); opacity:0; } 100% { transform:scale(1.2); opacity:0; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes spin { to { transform:rotate(360deg); } }
        .fade-up { animation: fadeUp 0.7s ease both; }
        .fade-up-2 { animation: fadeUp 0.7s 0.15s ease both; }
        .fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }
        .floating { animation: float 4s ease-in-out infinite; }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-6px); }
        .btn-primary { transition: all 0.25s ease; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,150,199,0.55) !important; }
        .btn-secondary { transition: all 0.25s ease; }
        .btn-secondary:hover { background: rgba(255,255,255,0.12) !important; transform: translateY(-2px); }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 64, padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(2,13,26,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,150,199,0.15)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <Logo size={40} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: -0.5 }}>SOS VIE</div>
            <div style={{ fontSize: 9, color: '#48CAE4', letterSpacing: 3, fontWeight: 700 }}>GUINÉE</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} className="btn-secondary"
            style={{ padding: '8px 20px', borderRadius: 10, border: '1px solid rgba(0,180,216,0.3)', background: 'rgba(0,150,199,0.08)', color: '#90e0ef', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Connexion
          </button>
          <button onClick={() => navigate('/register')} className="btn-primary"
            style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0096C7, #0077B6)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,150,199,0.4)' }}>
            S'inscrire
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 80px', position: 'relative' }}>

        {/* Background glows */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '8%', left: '-5%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,119,182,0.18) 0%, transparent 65%)', filter: 'blur(30px)' }} />
          <div style={{ position: 'absolute', bottom: '-5%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(72,202,228,0.14) 0%, transparent 65%)', filter: 'blur(30px)' }} />
          <div style={{ position: 'absolute', top: '40%', left: '45%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,150,199,0.1) 0%, transparent 65%)', filter: 'blur(40px)' }} />
          {/* Grid */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,150,199,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,150,199,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div style={{ textAlign: 'center', maxWidth: 860, position: 'relative', zIndex: 1 }}>

          {/* Badge */}
          <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 20, border: '1px solid rgba(0,180,216,0.4)', background: 'rgba(0,150,199,0.1)', marginBottom: 30, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#48CAE4' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#48CAE4', display: 'inline-block', boxShadow: '0 0 0 4px rgba(72,202,228,0.25)' }} />
            SYSTÈME D'URGENCE NATIONAL — ACTIF 24/7
          </div>

          {/* Title */}
          <h1 className="fade-up-2" style={{ fontSize: 'clamp(36px, 7.5vw, 82px)', fontWeight: 900, lineHeight: 1.04, letterSpacing: -2.5, marginBottom: 22 }}>
            En cas d'urgence,<br />
            <span style={{
              background: 'linear-gradient(120deg, #48CAE4 0%, #0096C7 40%, #0077B6 70%, #023E8A 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'shimmer 4s linear infinite',
            }}>
              chaque seconde compte
            </span>
          </h1>

          {/* Subtitle */}
          <p className="fade-up-3" style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: '#90a4b8', lineHeight: 1.75, maxWidth: 620, margin: '0 auto 40px' }}>
            Plateforme nationale de gestion des urgences en Guinée. Signalez, suivez et coordonnez les interventions de secours en temps réel.
          </p>

          {/* CTA buttons */}
          <div className="fade-up-3" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            <button onClick={() => navigate('/register')} className="btn-primary"
              style={{ padding: '16px 34px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #0096C7 0%, #0077B6 100%)', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 28px rgba(0,150,199,0.45)', display: 'flex', alignItems: 'center', gap: 9 }}>
              🆘 Créer un compte citoyen
            </button>
            <button onClick={() => navigate('/login')} className="btn-secondary"
              style={{ padding: '16px 34px', borderRadius: 14, border: '1px solid rgba(0,180,216,0.3)', background: 'rgba(0,150,199,0.08)', color: '#90e0ef', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Se connecter →
            </button>
          </div>

          {/* Services strip */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            {services.map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 30, border: `1px solid ${s.color}40`, background: `${s.color}12`, fontSize: 13, fontWeight: 600, color: '#cce9f5' }}>
                <span style={{ fontSize: 16 }}>{s.icon}</span>{s.label}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: '60px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 0%, rgba(0,96,150,0.08) 50%, transparent 100%)' }} />
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, textAlign: 'center', position: 'relative' }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900, background: 'linear-gradient(135deg, #48CAE4, #0096C7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#6b8fa8', fontWeight: 600, letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,150,199,0.3), transparent)', margin: '0 48px' }} />

      {/* ── Features ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, color: '#0096C7', letterSpacing: 2.5, background: 'rgba(0,150,199,0.1)', border: '1px solid rgba(0,150,199,0.25)', padding: '5px 14px', borderRadius: 20, marginBottom: 16 }}>
              FONCTIONNALITÉS
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, letterSpacing: -1, marginBottom: 12 }}>
              Technologie au service de la{' '}
              <span style={{ background: 'linear-gradient(135deg, #48CAE4, #0077B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>vie</span>
            </h2>
            <p style={{ color: '#6b8fa8', fontSize: 15, maxWidth: 520, margin: '0 auto' }}>
              Une plateforme complète pour une meilleure coordination des services d'urgence
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 22 }}>
            {features.map((f, i) => (
              <div key={i} className="card-hover"
                style={{ background: 'rgba(0,150,199,0.05)', border: '1px solid rgba(0,180,216,0.1)', borderRadius: 20, padding: '30px 26px', cursor: 'default' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${f.color}12`;
                  e.currentTarget.style.borderColor = `${f.color}40`;
                  e.currentTarget.style.boxShadow = `0 16px 40px ${f.color}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(0,150,199,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(0,180,216,0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 18 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 9, color: '#e0f4ff' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#6b8fa8', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '72px 24px', background: 'rgba(0,100,160,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, color: '#48CAE4', letterSpacing: 2.5, background: 'rgba(72,202,228,0.1)', border: '1px solid rgba(72,202,228,0.25)', padding: '5px 14px', borderRadius: 20, marginBottom: 16 }}>
            COMMENT ÇA MARCHE
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, marginBottom: 48, letterSpacing: -1 }}>
            3 étapes pour obtenir de l'aide
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
            {[
              { step: '01', icon: '📱', title: 'Signalez', desc: "Décrivez l'urgence depuis votre téléphone en quelques secondes" },
              { step: '02', icon: '🔗', title: 'Transmis', desc: 'Votre alerte est envoyée au service compétent avec votre localisation' },
              { step: '03', icon: '🚀', title: 'Intervention', desc: 'Les secours sont dépêchés immédiatement sur les lieux' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'relative', padding: '28px 22px', background: 'rgba(0,150,199,0.07)', border: '1px solid rgba(0,180,216,0.12)', borderRadius: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#0096C7', letterSpacing: 2, marginBottom: 14, opacity: 0.7 }}>{s.step}</div>
                <div style={{ fontSize: 38, marginBottom: 14 }}>{s.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: '#cce9f5' }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#6b8fa8', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', padding: '52px 40px', borderRadius: 24, background: 'linear-gradient(135deg, rgba(0,119,182,0.25) 0%, rgba(0,150,199,0.18) 50%, rgba(72,202,228,0.12) 100%)', border: '1px solid rgba(0,180,216,0.2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,150,199,0.15) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🆘</div>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, marginBottom: 12, letterSpacing: -0.5 }}>
              Prêt à rejoindre SOS VIE ?
            </h2>
            <p style={{ color: '#90a4b8', fontSize: 15, marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
              Inscrivez-vous gratuitement et contribuez à sauver des vies en Guinée.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/register')} className="btn-primary"
                style={{ padding: '14px 30px', borderRadius: 13, border: 'none', background: 'linear-gradient(135deg, #0096C7, #0077B6)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 28px rgba(0,150,199,0.45)' }}>
                Créer mon compte gratuit
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary"
                style={{ padding: '14px 30px', borderRadius: 13, border: '1px solid rgba(0,180,216,0.3)', background: 'transparent', color: '#90e0ef', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                J'ai déjà un compte
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(0,150,199,0.12)', padding: '24px', textAlign: 'center', color: '#3d5a6e', fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <Logo size={22} shadow={false} />
          <span style={{ fontWeight: 700, color: '#6b8fa8' }}>SOS VIE Guinée</span>
        </div>
        <div>© 2025 — Tous droits réservés | Numéro d'urgence : <strong style={{ color: '#0096C7', fontSize: 14 }}>18</strong></div>
      </footer>
    </div>
  );
}
