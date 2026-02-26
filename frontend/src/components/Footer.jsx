import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(226,232,240,0.7)',
      padding: '24px 24px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26,
            background: 'linear-gradient(135deg, #0891b2, #0e7490)',
            borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 900,
          }}>S</div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, color: '#0c4a6e', letterSpacing: '-0.3px' }}>
            SkillConnect
          </span>
        </div>

        {/* Copyright */}
        <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>
          © 2026 SkillConnect — Sri Lanka's #1 Skilled Worker Platform
        </p>

        {/* Links */}
        <div style={{ display: 'flex', gap: 20 }}>
          {['About', 'Privacy', 'Terms', 'Contact'].map(label => (
            <Link
              key={label}
              to="/"
              style={{
                color: '#94a3b8', fontSize: 12, textDecoration: 'none',
                fontWeight: 500, transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#0891b2'}
              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
