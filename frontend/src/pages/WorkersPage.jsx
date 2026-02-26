import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workerAPI } from '../api';
import { useAuth } from '../AuthContext';

const MODAL_STYLE = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16
};
const CARD_MODAL = {
    background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    padding: 32, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto'
};

function Stars({ rating = 0 }) {
    return (
        <span style={{ display: 'inline-flex', gap: 2, fontSize: 14 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} style={{ color: i <= Math.round(rating) ? '#f59e0b' : '#e2e8f0' }}>★</span>
            ))}
        </span>
    );
}

export default function WorkersPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [district, setDistrict] = useState('');
    const [selected, setSelected] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({});

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await workerAPI.getAll(district || undefined);
            setWorkers(res.data.data || []);
        } catch { setError('Failed to load workers. Check your connection or login status.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            await workerAPI.updateMe({
                ...editForm,
                hourlyRateMin: editForm.hourlyRateMin ? parseFloat(editForm.hourlyRateMin) : null,
                hourlyRateMax: editForm.hourlyRateMax ? parseFloat(editForm.hourlyRateMax) : null,
            });
            setEditMode(false);
            load();
        } catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const startEdit = (w) => {
        setEditForm({ firstName: w.firstName, lastName: w.lastName, bio: w.bio, city: w.city, district: w.district, hourlyRateMin: w.hourlyRateMin, hourlyRateMax: w.hourlyRateMax });
        setEditMode(true);
    };

    return (
        <div className="fade-in">
            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0c4a6e', marginBottom: 2 }}>👷 Find Workers</h1>
                    <p style={{ fontSize: 13, color: '#64748b' }}>Browse verified skilled professionals near you</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input className="hm-input" style={{ width: 200 }}
                        placeholder="Filter by district..."
                        value={district} onChange={e => setDistrict(e.target.value)} />
                    <button className="btn-primary" onClick={load}>Search</button>
                </div>
            </div>

            {error && (
                <div className="alert-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <span>❌ {error}</span>
                    <button className="btn-secondary" style={{ padding: '5px 14px', fontSize: 12, flexShrink: 0 }} onClick={load}>Retry</button>
                </div>
            )}

            {/* ── Loading ── */}
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#0891b2' }}>
                    <span className="spinner" /> Loading workers...
                </div>
            ) : workers.length === 0 ? (
                <div className="hm-card" style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: 52, marginBottom: 12 }}>👷</div>
                    <p style={{ color: '#64748b' }}>No workers found. Try a different district.</p>
                </div>
            ) : (
                <div className="grid-cards">
                    {workers.map(w => (
                        <div key={w.workerId} className="hm-card" style={{ padding: 22 }}>
                            {/* Avatar + Name */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                                <div className="avatar" style={{ width: 52, height: 52, fontSize: 18 }}>
                                    {w.firstName?.[0]}{w.lastName?.[0]}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 800, fontSize: 15, color: '#0c4a6e', marginBottom: 2 }}>
                                        {w.firstName} {w.lastName}
                                    </div>
                                    <span className={`badge ${w.isVerified ? 'badge-green' : 'badge-yellow'}`}>
                                        {w.isVerified ? '✓ Verified' : '⏳ Pending'}
                                    </span>
                                </div>
                            </div>

                            {/* Stats row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <Stars rating={w.averageRating} />
                                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                                    {w.averageRating || '0'} · {w.totalJobs || 0} jobs
                                </span>
                            </div>

                            {w.bio && <p style={{
                                fontSize: 13, color: '#475569', marginBottom: 10, lineHeight: 1.5,
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                            }}>
                                {w.bio}
                            </p>}

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                                {w.district && <span className="badge badge-teal">📍 {w.city ? `${w.city}, ` : ''}{w.district}</span>}
                                {w.hourlyRateMin && <span className="badge badge-green">💰 LKR {w.hourlyRateMin}–{w.hourlyRateMax}/hr</span>}
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '8px' }}
                                    onClick={() => navigate(`/workers/${w.workerId}`)}>
                                    View Profile
                                </button>
                                {w.user?.userId === user?.userId && (
                                    <button className="btn-secondary" style={{ flex: 1, padding: '8px', textAlign: 'center' }}
                                        onClick={() => startEdit(w)}>
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── View Modal ── */}
            {selected && (
                <div style={MODAL_STYLE} onClick={() => setSelected(null)}>
                    <div style={CARD_MODAL} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center' }}>
                            <div className="avatar" style={{ width: 64, height: 64, fontSize: 24 }}>
                                {selected.firstName?.[0]}{selected.lastName?.[0]}
                            </div>
                            <div>
                                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0c4a6e' }}>{selected.firstName} {selected.lastName}</h2>
                                <span className={`badge ${selected.isVerified ? 'badge-green' : 'badge-yellow'}`} style={{ marginTop: 4 }}>
                                    {selected.isVerified ? '✓ Verified Worker' : '⏳ Pending Verification'}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <Stars rating={selected.averageRating} />
                            <span style={{ fontSize: 13, color: '#64748b' }}>{selected.averageRating || 0} rating · {selected.totalJobs || 0} jobs completed</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#334155' }}>
                            {selected.bio && <div><strong>Bio:</strong> {selected.bio}</div>}
                            <div><strong>Location:</strong> {selected.city}{selected.city && selected.district ? ', ' : ''}{selected.district}</div>
                            {selected.hourlyRateMin && <div><strong>Rate:</strong> LKR {selected.hourlyRateMin} – {selected.hourlyRateMax}/hr</div>}
                        </div>
                        <button className="btn-secondary" style={{ width: '100%', marginTop: 20, textAlign: 'center' }}
                            onClick={() => setSelected(null)}>Close</button>
                    </div>
                </div>
            )}

            {/* ── Edit Modal ── */}
            {editMode && (
                <div style={MODAL_STYLE} onClick={() => setEditMode(false)}>
                    <div style={CARD_MODAL} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0c4a6e', marginBottom: 18 }}>Edit Profile</h2>
                        <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {['firstName', 'lastName'].map(f => (
                                    <div key={f}>
                                        <label className="hm-label" style={{ textTransform: 'capitalize' }}>{f.replace(/([A-Z])/g, ' $1')}</label>
                                        <input className="hm-input" value={editForm[f] || ''} onChange={e => setEditForm({ ...editForm, [f]: e.target.value })} />
                                    </div>
                                ))}
                            </div>
                            {['city', 'district', 'bio'].map(f => (
                                <div key={f}>
                                    <label className="hm-label" style={{ textTransform: 'capitalize' }}>{f}</label>
                                    <input className="hm-input" value={editForm[f] || ''} onChange={e => setEditForm({ ...editForm, [f]: e.target.value })} />
                                </div>
                            ))}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label className="hm-label">Rate Min (LKR)</label>
                                    <input className="hm-input" type="number" value={editForm.hourlyRateMin || ''} onChange={e => setEditForm({ ...editForm, hourlyRateMin: e.target.value })} />
                                </div>
                                <div>
                                    <label className="hm-label">Rate Max (LKR)</label>
                                    <input className="hm-input" type="number" value={editForm.hourlyRateMax || ''} onChange={e => setEditForm({ ...editForm, hourlyRateMax: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Changes</button>
                                <button type="button" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }} onClick={() => setEditMode(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
