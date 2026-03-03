import React, { useEffect, useRef } from 'react';

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>
  </svg>
);

export const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('lp-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.lp-animate').forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const position = el.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: position, behavior: 'smooth' });
    }
  };

  return (
    <div className="lp-root">
      {/* ====== STYLES ====== */}
      <style>{`
        .lp-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #020617;
          color: #f8fafc;
          line-height: 1.6;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        .lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .lp-root h1, .lp-root h2, .lp-root h3, .lp-root h4 { font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; color: #f8fafc; }
        .lp-root h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); }
        .lp-root h2 { font-size: clamp(2rem, 4vw, 3rem); }
        .lp-root h3 { font-size: 1.25rem; }
        .lp-root p { color: #94a3b8; }
        .lp-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #3b82f6; }

        .lp-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .lp-section { padding: 100px 0; }
        .lp-text-center { text-align: center; }
        .lp-text-balance { text-wrap: balance; }

        /* Buttons */
        .lp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 1rem; text-decoration: none; transition: all 0.2s ease; cursor: pointer; border: none; font-family: inherit; }
        .lp-btn-primary { background: #3b82f6; color: #fff; box-shadow: 0 0 24px rgba(59,130,246,0.15); }
        .lp-btn-primary:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 0 40px rgba(59,130,246,0.15); }
        .lp-btn-outline { background: transparent; color: #f8fafc; border: 1px solid #334155; }
        .lp-btn-outline:hover { background: #1e293b; border-color: #64748b; }
        .lp-btn-sm { padding: 10px 20px; font-size: 0.875rem; }
        .lp-btn-lg { padding: 18px 40px; font-size: 1.125rem; }

        /* Nav */
        .lp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(2,6,23,0.8); backdrop-filter: blur(16px); border-bottom: 1px solid #1e293b; }
        .lp-nav-inner { display: flex; align-items: center; justify-content: space-between; height: 72px; }
        .lp-nav-logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.25rem; color: #3b82f6; text-decoration: none; cursor: pointer; background: none; border: none; }
        .lp-nav-logo img { height: 36px; width: 36px; object-fit: contain; }
        .lp-nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .lp-nav-links button { color: #94a3b8; background: none; border: none; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: color 0.2s; font-family: inherit; }
        .lp-nav-links button:hover { color: #f8fafc; }
        .lp-nav-cta { display: flex; align-items: center; gap: 12px; }
        .lp-mobile-btn { display: none; background: none; border: none; color: #f8fafc; cursor: pointer; padding: 8px; }

        /* Hero */
        .lp-hero { position: relative; min-height: 100vh; display: flex; align-items: center; padding-top: 72px; overflow: hidden; }
        .lp-hero-bg { position: absolute; inset: 0; background: url('/images/hero-powerlifter.jpg') center/cover no-repeat; }
        .lp-hero-bg::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to right, rgba(2,6,23,0.95) 0%, rgba(2,6,23,0.7) 50%, rgba(2,6,23,0.4) 100%); }
        .lp-hero-content { position: relative; z-index: 2; display: flex; flex-direction: column; gap: 24px; max-width: 640px; padding: 60px 0; }
        .lp-hero-content h1 span { color: #3b82f6; }
        .lp-hero-content p { font-size: 1.25rem; line-height: 1.7; color: #94a3b8; max-width: 520px; }
        .lp-hero-actions { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 8px; }
        .lp-hero-stats { display: flex; gap: 40px; margin-top: 32px; padding-top: 32px; border-top: 1px solid #1e293b; }
        .lp-hero-stat h4 { font-size: 2rem; font-weight: 800; color: #f8fafc; }
        .lp-hero-stat p { font-size: 0.875rem; color: #64748b; margin-top: 4px; }

        /* Stats Bar */
        .lp-stats-bar { background: #0f172a; border-top: 1px solid #1e293b; border-bottom: 1px solid #1e293b; padding: 0; }
        .lp-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
        .lp-stat-item { padding: 40px 32px; text-align: center; border-right: 1px solid #1e293b; }
        .lp-stat-item:last-child { border-right: none; }
        .lp-stat-item h3 { font-size: 2.5rem; font-weight: 900; color: #3b82f6; margin-bottom: 8px; }
        .lp-stat-item p { font-size: 0.875rem; color: #64748b; }

        /* Features */
        .lp-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 64px; }
        .lp-feature-card { background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 40px 32px; transition: all 0.3s ease; }
        .lp-feature-card:hover { border-color: #3b82f6; box-shadow: 0 0 40px rgba(59,130,246,0.15); transform: translateY(-4px); }
        .lp-feature-icon { width: 56px; height: 56px; border-radius: 12px; background: rgba(59,130,246,0.15); color: #3b82f6; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
        .lp-feature-card h3 { margin-bottom: 12px; }
        .lp-feature-card p { font-size: 0.9375rem; line-height: 1.7; }

        /* Dual Section */
        .lp-dual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .lp-dual-image { border-radius: 24px; overflow: hidden; border: 1px solid #1e293b; aspect-ratio: 4/3; }
        .lp-dual-image img { width: 100%; height: 100%; object-fit: cover; }
        .lp-dual-content { display: flex; flex-direction: column; gap: 24px; }
        .lp-dual-content h2 span { color: #3b82f6; }
        .lp-dual-content p { font-size: 1.0625rem; line-height: 1.7; }
        .lp-feature-list { list-style: none; display: flex; flex-direction: column; gap: 16px; }
        .lp-feature-list li { display: flex; align-items: flex-start; gap: 12px; font-size: 0.9375rem; color: #94a3b8; }
        .lp-feature-list li svg { flex-shrink: 0; color: #22c55e; margin-top: 2px; }

        /* App Preview */
        .lp-app-preview { background: #0f172a; }
        .lp-app-preview-wrapper { margin-top: 48px; border-radius: 24px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,0.5); }
        .lp-app-preview-wrapper img { width: 100%; display: block; }

        /* Steps */
        .lp-steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; margin-top: 64px; position: relative; }
        .lp-steps-grid::before { content: ''; position: absolute; top: 40px; left: 17%; right: 17%; height: 2px; background: #1e293b; }
        .lp-step { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px; position: relative; }
        .lp-step-number { width: 80px; height: 80px; border-radius: 50%; background: #3b82f6; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900; position: relative; z-index: 2; box-shadow: 0 0 32px rgba(59,130,246,0.15); }
        .lp-step h3 { font-size: 1.125rem; }
        .lp-step p { font-size: 0.9375rem; max-width: 280px; }

        /* Testimonials */
        .lp-testimonials { background: #0f172a; }
        .lp-testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 64px; }
        .lp-testimonial-card { background: #020617; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; }
        .lp-testimonial-stars { color: #fbbf24; margin-bottom: 16px; font-size: 1.125rem; }
        .lp-testimonial-card blockquote { font-size: 0.9375rem; line-height: 1.7; color: #94a3b8; margin-bottom: 24px; font-style: italic; }
        .lp-testimonial-author { display: flex; align-items: center; gap: 12px; }
        .lp-testimonial-avatar { width: 44px; height: 44px; border-radius: 50%; background: rgba(59,130,246,0.15); color: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; }
        .lp-testimonial-author-info h4 { font-size: 0.9375rem; font-weight: 600; }
        .lp-testimonial-author-info p { font-size: 0.8125rem; color: #64748b; }

        /* CTA */
        .lp-cta-box { background: #0f172a; border: 1px solid #1e293b; border-radius: 24px; padding: 80px 60px; text-align: center; position: relative; overflow: hidden; }
        .lp-cta-box::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle at center, rgba(59,130,246,0.15) 0%, transparent 50%); pointer-events: none; }
        .lp-cta-box h2 { position: relative; z-index: 1; margin-bottom: 16px; }
        .lp-cta-box p { position: relative; z-index: 1; font-size: 1.125rem; max-width: 500px; margin: 0 auto 32px; }
        .lp-cta-box .lp-btn { position: relative; z-index: 1; }

        /* Footer */
        .lp-footer { padding: 60px 0 32px; border-top: 1px solid #1e293b; }
        .lp-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
        .lp-footer-brand p { margin-top: 16px; font-size: 0.875rem; max-width: 300px; }
        .lp-footer-col h4 { font-size: 0.875rem; font-weight: 700; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.05em; color: #f8fafc; }
        .lp-footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }
        .lp-footer-col a { color: #64748b; text-decoration: none; font-size: 0.875rem; transition: color 0.2s; cursor: pointer; background: none; border: none; font-family: inherit; padding: 0; }
        .lp-footer-col a:hover { color: #f8fafc; }
        .lp-footer-bottom { border-top: 1px solid #1e293b; padding-top: 24px; display: flex; align-items: center; justify-content: space-between; }
        .lp-footer-bottom p { font-size: 0.8125rem; color: #64748b; }
        .lp-footer-socials { display: flex; gap: 16px; }
        .lp-footer-socials a { color: #64748b; transition: color 0.2s; cursor: pointer; }
        .lp-footer-socials a:hover { color: #3b82f6; }

        /* Animations */
        .lp-animate { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .lp-visible { opacity: 1; transform: translateY(0); }

        /* Mobile Nav */
        .lp-mobile-nav { display: none; position: fixed; inset: 0; top: 72px; z-index: 99; background: #020617; padding: 24px; flex-direction: column; gap: 8px; }
        .lp-mobile-nav.lp-open { display: flex; }
        .lp-mobile-nav button { display: block; padding: 16px; color: #94a3b8; text-decoration: none; font-size: 1rem; font-weight: 500; border-radius: 12px; transition: all 0.2s; background: none; border: none; cursor: pointer; font-family: inherit; text-align: left; width: 100%; }
        .lp-mobile-nav button:hover { background: #1e293b; color: #f8fafc; }

        /* Responsive */
        @media (max-width: 1024px) {
          .lp-nav-links { display: none; }
          .lp-nav-cta .lp-btn-outline { display: none; }
          .lp-mobile-btn { display: block; }
          .lp-features-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-dual-grid { grid-template-columns: 1fr; gap: 40px; }
          .lp-dual-image { max-height: 400px; }
          .lp-steps-grid { grid-template-columns: 1fr; gap: 40px; }
          .lp-steps-grid::before { display: none; }
          .lp-testimonials-grid { grid-template-columns: 1fr 1fr; }
          .lp-footer-grid { grid-template-columns: 1fr 1fr; }
          .lp-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-stat-item:nth-child(2) { border-right: none; }
          .lp-stat-item:nth-child(1), .lp-stat-item:nth-child(2) { border-bottom: 1px solid #1e293b; }
        }
        @media (max-width: 768px) {
          .lp-section { padding: 72px 0; }
          .lp-container { padding: 0 16px; }
          .lp-features-grid { grid-template-columns: 1fr; }
          .lp-testimonials-grid { grid-template-columns: 1fr; }
          .lp-hero-stats { flex-direction: column; gap: 20px; }
          .lp-hero-actions { flex-direction: column; }
          .lp-hero-actions .lp-btn { width: 100%; }
          .lp-cta-box { padding: 48px 24px; }
          .lp-footer-grid { grid-template-columns: 1fr; gap: 32px; }
          .lp-footer-bottom { flex-direction: column; gap: 16px; text-align: center; }
          .lp-stats-grid { grid-template-columns: 1fr; }
          .lp-stat-item { border-right: none; border-bottom: 1px solid #1e293b; }
          .lp-stat-item:last-child { border-bottom: none; }
        }
      `}</style>

      {/* ====== NAVIGATION ====== */}
      <nav className="lp-nav" role="navigation" aria-label="Navegacion principal">
        <div className="lp-container lp-nav-inner">
          <button className="lp-nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Total Grind - Inicio">
            <img src="/logo.png" alt="" aria-hidden="true" />
            <span>TotalGrind</span>
          </button>
          <ul className="lp-nav-links" role="list">
            <li><button onClick={() => scrollTo('features')}>Funciones</button></li>
            <li><button onClick={() => scrollTo('athletes')}>Atletas</button></li>
            <li><button onClick={() => scrollTo('coaches')}>Entrenadores</button></li>
            <li><button onClick={() => scrollTo('how-it-works')}>Como funciona</button></li>
            <li><button onClick={() => scrollTo('testimonials')}>Testimonios</button></li>
          </ul>
          <div className="lp-nav-cta">
            <a href="#" className="lp-btn lp-btn-outline lp-btn-sm">Iniciar sesion</a>
            <a href="#" className="lp-btn lp-btn-primary lp-btn-sm">Empezar gratis</a>
          </div>
          <button className="lp-mobile-btn" aria-label="Abrir menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`lp-mobile-nav ${mobileMenuOpen ? 'lp-open' : ''}`} role="navigation" aria-label="Menu movil">
        <button onClick={() => scrollTo('features')}>Funciones</button>
        <button onClick={() => scrollTo('athletes')}>Atletas</button>
        <button onClick={() => scrollTo('coaches')}>Entrenadores</button>
        <button onClick={() => scrollTo('how-it-works')}>Como funciona</button>
        <button onClick={() => scrollTo('testimonials')}>Testimonios</button>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <a href="#" className="lp-btn lp-btn-outline" style={{ justifyContent: 'center' }}>Iniciar sesion</a>
          <a href="#" className="lp-btn lp-btn-primary" style={{ justifyContent: 'center' }}>Empezar gratis</a>
        </div>
      </div>

      {/* ====== HERO ====== */}
      <section className="lp-hero" aria-label="Seccion principal">
        <div className="lp-hero-bg" role="img" aria-label="Powerlifter preparandose para levantar" />
        <div className="lp-container">
          <div className="lp-hero-content">
            <span className="lp-label">{'Tracker de Powerlifting #1'}</span>
            <h1 className="lp-text-balance">{'Entrena con '}<span>{'precision.'}</span>{' Progresa con datos.'}</h1>
            <p>La plataforma definitiva para powerlifters y entrenadores. Registra entrenamientos, controla tu RPE, estima tu 1RM y visualiza tu progreso como nunca antes.</p>
            <div className="lp-hero-actions">
              <a href="#" className="lp-btn lp-btn-primary lp-btn-lg">
                Empezar gratis <ArrowRightIcon />
              </a>
              <button className="lp-btn lp-btn-outline lp-btn-lg" onClick={() => scrollTo('features')}>Descubrir funciones</button>
            </div>
            <div className="lp-hero-stats">
              <div className="lp-hero-stat">
                <h4>e1RM</h4>
                <p>Estimacion automatica</p>
              </div>
              <div className="lp-hero-stat">
                <h4>RPE</h4>
                <p>Control de esfuerzo</p>
              </div>
              <div className="lp-hero-stat">
                <h4>SBD</h4>
                <p>{'Squat, Bench, Deadlift'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== STATS BAR ====== */}
      <section className="lp-stats-bar" aria-label="Estadisticas" style={{ padding: '0' }}>
        <div className="lp-container">
          <div className="lp-stats-grid">
            <div className="lp-stat-item"><h3>100%</h3><p>Gratis para atletas</p></div>
            <div className="lp-stat-item"><h3>SBD</h3><p>Movimientos de competicion</p></div>
            <div className="lp-stat-item"><h3>RPE</h3><p>Sistema basado en esfuerzo</p></div>
            <div className="lp-stat-item"><h3>24/7</h3><p>Acceso desde cualquier lugar</p></div>
          </div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section className="lp-section" id="features" aria-label="Funciones principales">
        <div className="lp-container">
          <div className="lp-text-center">
            <span className="lp-label">Funciones</span>
            <h2 className="lp-text-balance" style={{ marginTop: 16 }}>Todo lo que necesitas para tu entrenamiento</h2>
            <p style={{ maxWidth: 560, margin: '16px auto 0', fontSize: '1.0625rem' }}>{'Diseñado por y para powerlifters. Cada funcion pensada para optimizar tu planificacion y progreso.'}</p>
          </div>
          <div className="lp-features-grid">
            {[
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>, title: 'Bloques de Entrenamiento', desc: 'Crea y gestiona bloques de entrenamiento de varias semanas. Organiza tus mesociclos con dias, ejercicios y series.' },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14,2 14,8 20,8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /></svg>, title: 'Registro de Entrenamientos', desc: 'Registra series, repeticiones, RPE y pesos para cada ejercicio. Prescripcion y datos reales lado a lado.' },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>, title: 'Graficos de Progreso', desc: 'Visualiza tu e1RM estimado y maximos reales en Sentadilla, Banca y Peso Muerto con graficos detallados.' },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>, title: 'Calculo Automatico e1RM', desc: 'Calculo automatico del 1RM estimado basado en el RPE y las repeticiones. Formula precisa para tus levantamientos.' },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>, title: 'Sistema Coach-Atleta', desc: 'Conecta entrenadores con atletas. Asigna programas, monitorea el progreso en tiempo real.' },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>, title: 'Seguro y Privado', desc: 'Tus datos de entrenamiento estan protegidos con autenticacion JWT y conexiones seguras.' },
            ].map((f, i) => (
              <div key={i} className="lp-feature-card lp-animate">
                <div className="lp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FOR ATHLETES ====== */}
      <section className="lp-section" id="athletes" style={{ background: '#0f172a' }} aria-label="Para atletas">
        <div className="lp-container">
          <div className="lp-dual-grid">
            <div className="lp-dual-image lp-animate">
              <img src="/images/app-dashboard.jpg" alt="Dashboard de Total Grind mostrando estadisticas de entrenamiento" />
            </div>
            <div className="lp-dual-content lp-animate">
              <span className="lp-label">Para Atletas</span>
              <h2 className="lp-text-balance">{'Lleva tu entrenamiento al '}<span>siguiente nivel</span></h2>
              <p>Total Grind te da las herramientas que necesitas para entrenar de forma inteligente. Registra cada serie, visualiza tu progreso y toma decisiones basadas en datos.</p>
              <ul className="lp-feature-list">
                {[
                  'Crea bloques de entrenamiento personalizados',
                  'Registra peso, reps y RPE en cada serie',
                  'Visualiza tu e1RM estimado automaticamente',
                  'Graficos de progreso en SQ, BP y DL',
                  'Accede desde movil o escritorio',
                ].map((item, i) => (
                  <li key={i}><CheckIcon />{item}</li>
                ))}
              </ul>
              <div><a href="#" className="lp-btn lp-btn-primary">Registrarme como Atleta</a></div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FOR COACHES ====== */}
      <section className="lp-section" id="coaches" aria-label="Para entrenadores">
        <div className="lp-container">
          <div className="lp-dual-grid">
            <div className="lp-dual-content lp-animate">
              <span className="lp-label">Para Entrenadores</span>
              <h2 className="lp-text-balance">{'Gestiona a tus atletas con '}<span>total control</span></h2>
              <p>Invita atletas a tu equipo, asigna programas de entrenamiento y monitorea su progreso en tiempo real. Todo desde un solo lugar.</p>
              <ul className="lp-feature-list">
                {[
                  'Invita atletas mediante correo electronico',
                  'Crea bloques y asignalos directamente',
                  'Monitorea registros y progreso en tiempo real',
                  'Visualiza graficos de progreso de cada atleta',
                  'Panel de gestion intuitivo',
                ].map((item, i) => (
                  <li key={i}><CheckIcon />{item}</li>
                ))}
              </ul>
              <div><a href="#" className="lp-btn lp-btn-primary">Registrarme como Entrenador</a></div>
            </div>
            <div className="lp-dual-image lp-animate">
              <img src="/images/coach-athlete.jpg" alt="Entrenador guiando a un atleta durante una sentadilla" />
            </div>
          </div>
        </div>
      </section>

      {/* ====== APP PREVIEW ====== */}
      <section className="lp-section lp-app-preview" aria-label="Vista previa de la aplicacion">
        <div className="lp-container lp-text-center">
          <span className="lp-label">La Aplicacion</span>
          <h2 className="lp-text-balance" style={{ marginTop: 16 }}>{'Diseñado para el rendimiento'}</h2>
          <p style={{ maxWidth: 560, margin: '16px auto 0', fontSize: '1.0625rem' }}>{'Interfaz oscura optimizada para el gimnasio. Rapida, intuitiva y enfocada en lo que importa: tu entrenamiento.'}</p>
          <div className="lp-app-preview-wrapper lp-animate">
            <img src="/images/app-dashboard.jpg" alt="Vista previa del dashboard de Total Grind" />
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="lp-section" id="how-it-works" aria-label="Como funciona">
        <div className="lp-container lp-text-center">
          <span className="lp-label">Como funciona</span>
          <h2 className="lp-text-balance" style={{ marginTop: 16 }}>Empieza en 3 simples pasos</h2>
          <p style={{ maxWidth: 480, margin: '16px auto 0', fontSize: '1.0625rem' }}>{'Registrate, crea tu primer bloque y empieza a entrenar con datos.'}</p>
          <div className="lp-steps-grid">
            {[
              { num: '1', title: 'Crea tu cuenta', desc: 'Registrate gratis como atleta o entrenador en menos de un minuto.' },
              { num: '2', title: 'Crea tu bloque', desc: 'Diseña tu plan de entrenamiento con semanas, dias y ejercicios.' },
              { num: '3', title: 'Entrena y progresa', desc: 'Registra tus series en tiempo real y visualiza tu progreso al instante.' },
            ].map((s, i) => (
              <div key={i} className="lp-step lp-animate">
                <div className="lp-step-number">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIALS ====== */}
      <section className="lp-section lp-testimonials" id="testimonials" aria-label="Testimonios">
        <div className="lp-container">
          <div className="lp-text-center">
            <span className="lp-label">Testimonios</span>
            <h2 className="lp-text-balance" style={{ marginTop: 16 }}>Lo que dicen nuestros usuarios</h2>
          </div>
          <div className="lp-testimonials-grid">
            {[
              { stars: 5, quote: 'Total Grind ha cambiado por completo como planifico mis entrenamientos. El calculo automatico del e1RM me ahorra mucho tiempo.', initials: 'MP', name: 'Miguel P.', role: 'Powerlifter - 3 años de experiencia' },
              { stars: 5, quote: 'Como entrenador, poder asignar bloques a mis atletas y ver su progreso en tiempo real es invaluable. La mejor herramienta que he usado.', initials: 'CR', name: 'Carlos R.', role: 'Entrenador de Powerlifting' },
              { stars: 5, quote: 'La interfaz oscura es perfecta para el gimnasio. Registro mis series entre descansos y puedo ver exactamente como estoy progresando.', initials: 'LS', name: 'Laura S.', role: 'Atleta competitiva IPF' },
            ].map((t, i) => (
              <div key={i} className="lp-testimonial-card lp-animate">
                <div className="lp-testimonial-stars" aria-label={`${t.stars} de 5 estrellas`}>{'★'.repeat(t.stars)}</div>
                <blockquote>{`"${t.quote}"`}</blockquote>
                <div className="lp-testimonial-author">
                  <div className="lp-testimonial-avatar" aria-hidden="true">{t.initials}</div>
                  <div className="lp-testimonial-author-info">
                    <h4>{t.name}</h4>
                    <p>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="lp-section" aria-label="Llamada a la accion">
        <div className="lp-container">
          <div className="lp-cta-box">
            <h2 className="lp-text-balance">Empieza a entrenar con datos hoy</h2>
            <p>{'Unete a la comunidad de powerlifters que entrenan de forma inteligente con Total Grind. Gratis para siempre.'}</p>
            <a href="#" className="lp-btn lp-btn-primary lp-btn-lg">
              Crear mi cuenta gratis <ArrowRightIcon />
            </a>
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="lp-footer" role="contentinfo">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <button className="lp-nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Total Grind - Inicio">
                <img src="/logo.png" alt="" aria-hidden="true" />
                <span>TotalGrind</span>
              </button>
              <p>La plataforma definitiva para powerlifters y entrenadores. Registra, analiza y progresa.</p>
            </div>
            <div className="lp-footer-col">
              <h4>Producto</h4>
              <ul role="list">
                <li><a onClick={() => scrollTo('features')}>Funciones</a></li>
                <li><a onClick={() => scrollTo('athletes')}>Para Atletas</a></li>
                <li><a onClick={() => scrollTo('coaches')}>Para Entrenadores</a></li>
                <li><a onClick={() => scrollTo('how-it-works')}>Como funciona</a></li>
              </ul>
            </div>
            <div className="lp-footer-col">
              <h4>Soporte</h4>
              <ul role="list">
                <li><a href="#">Centro de ayuda</a></li>
                <li><a href="#">Contacto</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>
            <div className="lp-footer-col">
              <h4>Legal</h4>
              <ul role="list">
                <li><a href="#">Privacidad</a></li>
                <li><a href="#">Terminos de uso</a></li>
                <li><a href="#">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <p>{'© 2026 TotalGrind. Todos los derechos reservados.'}</p>
            <div className="lp-footer-socials" aria-label="Redes sociales">
              <a href="#" aria-label="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg></a>
              <a href="#" aria-label="Twitter"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg></a>
              <a href="#" aria-label="YouTube"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg></a>
              <a href="#" aria-label="GitHub"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
