import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { workerAPI, jobAPI, bookingAPI, equipmentAPI } from '../api';

const CATEGORIES = [
    { icon: '⚡', label: 'Electrical', color: '#fef3c7', text: '#92400e' },
    { icon: '🔩', label: 'Plumbing', color: '#dbeafe', text: '#1e40af' },
    { icon: '🏗️', label: 'Construction', color: '#f3e8ff', text: '#5b21b6' },
    { icon: '🎨', label: 'Painting', color: '#fce7f3', text: '#9d174d' },
    { icon: '🪵', label: 'Carpentry', color: '#ffedd5', text: '#9a3412' },
    { icon: '🌿', label: 'Landscaping', color: '#d1fae5', text: '#065f46' },
    { icon: '❄️', label: 'HVAC', color: '#e0f2fe', text: '#0369a1' },
    { icon: '🧹', label: 'Cleaning', color: '#f1f5f9', text: '#475569' },
];

const ROUTE_MAP = {
    workers: '/workers', jobs: '/jobs', bookings: '/bookings',
    equipment: '/equipment', reviews: '/reviews', messages: '/messages',
    'admin-users': '/admin/users',
};

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const go = (key) => navigate(ROUTE_MAP[key] || `/${key}`);
    const [stats, setStats] = useState([]);
    const [searchQ, setSearchQ] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const results = await Promise.allSettled([
                    workerAPI.getAll(),
                    jobAPI.getAll({}),
                    bookingAPI.getMine(user?.role === 'worker' ? 'worker' : 'customer'),
                    equipmentAPI.getAvailable(),
                ]);
                const get = (i) => results[i]?.status === 'fulfilled' ? (results[i].value?.data?.data?.length ?? 0) : 0;
                setStats([
                    { label: 'Workers', value: get(0), icon: '👷', color: '#e0f2fe', text: '#0e7490' },
                    { label: 'Active Jobs', value: get(1), icon: '📋', color: '#ffedd5', text: '#9a3412' },
                    { label: 'My Bookings', value: get(2), icon: '📅', color: '#d1fae5', text: '#065f46' },
                    { label: 'Equipment', value: get(3), icon: '🔧', color: '#ede9fe', text: '#5b21b6' },
                ]);
            } catch { /* stats are non-critical */ }
        };
        fetchStats();
    }, []);

    const name = user?.email?.split('@')[0] || 'there';

    return (
        <div className="fade-in">
            {/* ── Hero ── */}
            <div style={{
                background: 'linear-gradient(135deg,#0891b2 0%,#0e7490 60%,#164e63 100%)',
                borderRadius: 20, padding: '40px 36px', marginBottom: 28,
                color: '#fff', position: 'relative', overflow: 'hidden'
            }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ position: 'absolute', right: 60, bottom: -60, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.75, marginBottom: 6 }}>
                    Welcome back
                </p>
                <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 6, letterSpacing: '-0.5px' }}>
                    Hello, {name} 👋
                </h1>
                <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 28, textTransform: 'capitalize' }}>
                    Logged in as: <strong style={{ opacity: 1 }}>{user?.role}</strong>
                </p>

                {/* Search bar */}
                <div style={{ display: 'flex', gap: 10, maxWidth: 520, position: 'relative', zIndex: 1 }}>
                    <input
                        value={searchQ} onChange={e => setSearchQ(e.target.value)}
                        placeholder="Search for a skill, job or equipment..."
                        style={{
                            flex: 1, padding: '12px 18px', borderRadius: 12, border: 'none',
                            fontSize: 14, background: 'rgba(255,255,255,0.95)',
                            color: '#0c4a6e', outline: 'none', fontFamily: 'Inter,sans-serif'
                        }}
                    />
                    <button onClick={() => go('workers')}
                        style={{
                            background: '#f97316', border: 'none', borderRadius: 12,
                            padding: '12px 22px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer'
                        }}>
                        Search
                    </button>
                </div>
            </div>

            {/* ── Stats Row ── */}
            {stats.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 28 }}>
                    {stats.map(s => (
                        <div key={s.label} className="hm-card" style={{ padding: '18px 20px' }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: 12,
                                background: s.color, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: 20, marginBottom: 10
                            }}>{s.icon}</div>
                            <div style={{ fontSize: 26, fontWeight: 900, color: '#0c4a6e' }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Categories ── */}
            <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0c4a6e', marginBottom: 4 }}>Browse by Category</h2>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Find the right professional for your needs</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 12 }}>
                    {CATEGORIES.map(c => (
                        <button key={c.label} className="cat-card" onClick={() => go('workers')}>
                            <div className="cat-icon" style={{ background: c.color }}>
                                {c.icon}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: c.text }}>{c.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Quick Access ── */}
            <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0c4a6e', marginBottom: 16 }}>Quick Access</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
                    {[
                        { key: 'workers', icon: '👷', label: 'Find Workers', desc: 'Browse skilled professionals', color: '#e0f2fe' },
                        { key: 'jobs', icon: '📋', label: 'Post a Job', desc: 'Create job listings', color: '#ffedd5' },
                        { key: 'bookings', icon: '📅', label: 'My Bookings', desc: 'Track your bookings', color: '#d1fae5' },
                        { key: 'equipment', icon: '🔧', label: 'Rent Equipment', desc: 'Browse tools & equipment', color: '#ede9fe' },
                        { key: 'reviews', icon: '⭐', label: 'Reviews', desc: 'Rate workers & complaints', color: '#fef3c7' },
                        { key: 'messages', icon: '💬', label: 'Messages', desc: 'Chat with users', color: '#e0f2fe' },
                        ...(user?.role === 'admin' ? [{ key: 'admin-users', icon: '🛡', label: 'Manage Users', desc: 'View, suspend & activate users', color: '#fee2e2' }] : []),
                    ].map(m => (
                        <button key={m.key} onClick={() => go(m.key)}
                            className="hm-card"
                            style={{ border: 'none', cursor: 'pointer', padding: '20px', textAlign: 'left', width: '100%' }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12, background: m.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 22, marginBottom: 12
                            }}>{m.icon}</div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#0c4a6e', marginBottom: 3 }}>{m.label}</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{m.desc}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
