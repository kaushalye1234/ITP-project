import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workerAPI } from '../api';

const CATEGORIES = [
    { name: 'Electrical', icon: '⚡' }, { name: 'Plumbing', icon: '🔩' },
    { name: 'Construction', icon: '🏗️' }, { name: 'Painting', icon: '🎨' },
    { name: 'Carpentry', icon: '🪵' }, { name: 'Landscaping', icon: '🌿' },
    { name: 'HVAC', icon: '❄️' }, { name: 'Cleaning', icon: '🧹' },
];

function Stars({ rating = 0 }) {
    return (
        <span style={{ display: 'inline-flex', gap: 2, fontSize: 14 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} style={{ color: i <= Math.round(rating) ? '#f59e0b' : '#e2e8f0' }}>★</span>
            ))}
        </span>
    );
}

export default function LandingPage() {
    const [workers, setWorkers] = useState([]);
    const [loadingW, setLoadingW] = useState(true);

    useEffect(() => {
        workerAPI.getAll()
            .then(res => setWorkers((res.data?.data || []).slice(0, 3)))
            .catch(() => {})
            .finally(() => setLoadingW(false));
    }, []);

    return (
        <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#f0f9ff' }}>
            {/* Navbar */}
            <header style={{ background: '#fff', borderBottom: '1.5px solid #e0f2fe', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 12px rgba(8,145,178,0.09)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#0891b2,#0e7490)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 17, fontWeight: 900 }}>S</div>
                    <span style={{ fontWeight: 900, fontSize: 16, color: '#0c4a6e' }}>SkillConnect</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link to="/login" style={{ padding: '8px 20px', borderRadius: 10, border: '1.5px solid #bae6fd', background: '#f0f9ff', color: '#0891b2', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>Sign In</Link>
                    <Link to="/register" style={{ padding: '8px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#0891b2,#0e7490)', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', boxShadow: '0 2px 8px rgba(8,145,178,0.25)' }}>Register Free</Link>
                </div>
            </header>

            {/* Hero */}
            <section style={{ background: 'linear-gradient(135deg,#0e7490,#0891b2)', color: '#fff', padding: '80px 24px', textAlign: 'center' }}>
                <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, marginBottom: 16, letterSpacing: '-0.5px', lineHeight: 1.15 }}>
                    Find Trusted Skilled Workers<br />Near You
                </h1>
                <p style={{ fontSize: 'clamp(14px,2vw,18px)', opacity: 0.92, maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.6 }}>
                    Sri Lanka's premier platform for connecting customers with verified skilled professionals
                </p>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/login" style={{ background: '#fff', color: '#0c4a6e', padding: '13px 30px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>Find a Worker</Link>
                    <Link to="/register" style={{ background: 'transparent', color: '#fff', padding: '13px 30px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none', border: '2px solid rgba(255,255,255,0.7)' }}>Register Free</Link>
                </div>
            </section>

            {/* How It Works */}
            <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>
                <h2 className="section-title" style={{ textAlign: 'center', fontSize: 24 }}>How It Works</h2>
                <p className="section-sub" style={{ textAlign: 'center' }}>Get your job done in three simple steps</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24 }}>
                    {[{ icon: '📋', title: 'Post a Job', desc: 'Describe what you need and when' }, { icon: '🤝', title: 'Connect', desc: 'Browse workers or receive applications' }, { icon: '✅', title: 'Get It Done', desc: 'Book, pay, and leave a review' }].map((s, i) => (
                        <div key={i} className="hm-card" style={{ padding: 28, textAlign: 'center' }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>{s.icon}</div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0c4a6e', marginBottom: 8 }}>{s.title}</h3>
                            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Categories */}
            <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 64px' }}>
                <h2 className="section-title" style={{ textAlign: 'center', fontSize: 24 }}>Browse Categories</h2>
                <p className="section-sub" style={{ textAlign: 'center' }}>Find skilled professionals for any task</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 16 }}>
                    {CATEGORIES.map(c => (
                        <Link key={c.name} to="/register" className="cat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="cat-icon" style={{ background: '#f0f9ff' }}>{c.icon}</div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e' }}>{c.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Stats */}
            <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 64px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20 }}>
                    {[{ v: '500+', l: 'Workers' }, { v: '2,000+', l: 'Jobs Posted' }, { v: '10,000+', l: 'Happy Customers' }, { v: '300+', l: 'Equipment Items' }].map(s => (
                        <div key={s.l} className="stat-card" style={{ padding: 28, textAlign: 'center' }}>
                            <div style={{ fontSize: 32, fontWeight: 900, color: '#0891b2', marginBottom: 4 }}>{s.v}</div>
                            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{s.l}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Workers */}
            <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 64px' }}>
                <h2 className="section-title" style={{ textAlign: 'center', fontSize: 24 }}>Featured Workers</h2>
                <p className="section-sub" style={{ textAlign: 'center' }}>Top-rated professionals ready to help</p>
                {loadingW ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, gap: 12, color: '#0891b2' }}><span className="spinner" /> Loading...</div>
                ) : workers.length === 0 ? (
                    <div className="hm-card" style={{ padding: 48, textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>👷</div>
                        <p style={{ color: '#64748b' }}>Workers will appear here once available.</p>
                    </div>
                ) : (
                    <div className="grid-cards">
                        {workers.map(w => (
                            <div key={w.workerId} className="hm-card" style={{ padding: 22 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                                    <div className="avatar" style={{ width: 52, height: 52, fontSize: 18 }}>{w.firstName?.[0]}{w.lastName?.[0]}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: 15, color: '#0c4a6e', marginBottom: 2 }}>{w.firstName} {w.lastName}</div>
                                        {w.district && <span style={{ fontSize: 12, color: '#64748b' }}>📍 {w.district}</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                    <Stars rating={w.averageRating} />
                                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{w.averageRating || '0'}</span>
                                </div>
                                <Link to="/register" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', textAlign: 'center' }}>View Profile</Link>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* CTA */}
            <section style={{ background: 'linear-gradient(135deg,#0e7490,#0891b2)', color: '#fff', padding: '64px 24px', textAlign: 'center' }}>
                <h2 style={{ fontSize: 'clamp(22px,4vw,28px)', fontWeight: 800, marginBottom: 12 }}>Ready to get started?</h2>
                <p style={{ fontSize: 16, opacity: 0.92, marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>Join thousands of customers and workers on SkillConnect</p>
                <Link to="/register" style={{ display: 'inline-block', background: '#fff', color: '#0c4a6e', padding: '13px 32px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>Register Now</Link>
            </section>

            {/* Footer */}
            <footer style={{ background: '#fff', borderTop: '1px solid #e0f2fe', padding: '24px', textAlign: 'center' }}>
                <p style={{ fontWeight: 800, color: '#0c4a6e', fontSize: 14, marginBottom: 8 }}>SkillConnect</p>
                <p style={{ color: '#64748b', fontSize: 12 }}>© 2026 SkillConnect. All rights reserved.</p>
            </footer>
        </div>
    );
}
