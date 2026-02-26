import { useState, useEffect } from 'react';
import { complaintAPI } from '../api';
import { useAuth } from '../AuthContext';
import StatusBadge from '../components/StatusBadge';

const CATEGORIES = ['service_quality', 'inappropriate_behavior', 'fraud', 'payment_issue', 'other'];

const MODAL = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16
};
const CARD_MODAL = {
    background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    padding: 32, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto'
};

export default function ComplaintsPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ complaintCategory: 'other', complaintTitle: '', complaintDescription: '', bookingId: '' });
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');

    const load = async () => {
        setLoading(true); setError('');
        try {
            const res = isAdmin ? await complaintAPI.getAll() : await complaintAPI.getMine().catch(() => complaintAPI.getAll());
            setComplaints(res.data.data || []);
        } catch { setError('Failed to load complaints.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await complaintAPI.submit({
                ...form,
                bookingId: form.bookingId ? parseInt(form.bookingId) : null,
            });
            setShowForm(false);
            setForm({ complaintCategory: 'other', complaintTitle: '', complaintDescription: '', bookingId: '' });
            load();
        } catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const handleStatusUpdate = async (id, status) => {
        try { await complaintAPI.updateStatus(id, status); load(); }
        catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this complaint?')) return;
        try { await complaintAPI.delete(id); load(); }
        catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const filtered = complaints.filter(c => {
        const matchStatus = !statusFilter || c.complaintStatus === statusFilter;
        const matchSearch = !search || c.complaintTitle?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📢 Complaints</h1>
                    <p className="page-subtitle">{isAdmin ? 'Manage all platform complaints' : 'Submit and track your complaints'}</p>
                </div>
                {!isAdmin && (
                    <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#f97316,#9a3412)' }}
                        onClick={() => setShowForm(true)}>+ Submit Complaint</button>
                )}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <input className="hm-input" style={{ flex: 1, minWidth: 200 }} placeholder="Search by title..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                <select className="hm-input" style={{ minWidth: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                </select>
            </div>

            {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#0891b2' }}>
                    <span className="spinner" /> Loading complaints...
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">📢</span>
                    <p>No complaints found.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {filtered.map(c => (
                        <div key={c.complaintId} className="hm-card" style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                                        <h3 style={{ fontWeight: 800, fontSize: 14, color: '#0c4a6e' }}>{c.complaintTitle}</h3>
                                        <StatusBadge status={c.complaintStatus} />
                                        <span className="badge badge-orange" style={{ textTransform: 'capitalize' }}>{c.complaintCategory?.replace(/_/g, ' ')}</span>
                                    </div>
                                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 6 }}>{c.complaintDescription}</p>
                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                        {c.complainant?.email || 'Unknown'} · {formatDate(c.createdAt)}
                                        {c.booking && <> · Booking #{c.booking.bookingId}</>}
                                    </div>
                                </div>
                                {isAdmin && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                                        {c.complaintStatus === 'pending' && (
                                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11 }}
                                                onClick={() => handleStatusUpdate(c.complaintId, 'investigating')}>Investigate</button>
                                        )}
                                        {['pending', 'investigating'].includes(c.complaintStatus) && (
                                            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 11, justifyContent: 'center' }}
                                                onClick={() => handleStatusUpdate(c.complaintId, 'resolved')}>Resolve</button>
                                        )}
                                        {c.complaintStatus !== 'dismissed' && (
                                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11 }}
                                                onClick={() => handleStatusUpdate(c.complaintId, 'dismissed')}>Dismiss</button>
                                        )}
                                        <button className="btn-danger" style={{ padding: '6px 12px', fontSize: 11 }}
                                            onClick={() => handleDelete(c.complaintId)}>🗑</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Submit Modal */}
            {showForm && (
                <div style={MODAL} onClick={() => setShowForm(false)}>
                    <div style={CARD_MODAL} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0c4a6e', marginBottom: 18 }}>📢 Submit Complaint</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label className="hm-label">Category</label>
                                <select className="hm-input" value={form.complaintCategory} onChange={e => setForm({ ...form, complaintCategory: e.target.value })}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="hm-label">Title</label>
                                <input className="hm-input" required value={form.complaintTitle} onChange={e => setForm({ ...form, complaintTitle: e.target.value })} />
                            </div>
                            <div>
                                <label className="hm-label">Description</label>
                                <textarea className="hm-input" required rows={3} style={{ resize: 'vertical' }}
                                    value={form.complaintDescription} onChange={e => setForm({ ...form, complaintDescription: e.target.value })} />
                            </div>
                            <div>
                                <label className="hm-label">Related Booking ID (optional)</label>
                                <input className="hm-input" type="number" value={form.bookingId} onChange={e => setForm({ ...form, bookingId: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg,#f97316,#9a3412)' }}>Submit</button>
                                <button type="button" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }} onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
