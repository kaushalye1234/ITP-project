import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../api';
import { useAuth } from '../AuthContext';

const URGENCY_STYLE = {
    emergency: { bg: '#fee2e2', color: '#991b1b' },
    urgent: { bg: '#ffedd5', color: '#9a3412' },
    standard: { bg: '#dbeafe', color: '#1e40af' },
    scheduled: { bg: '#d1fae5', color: '#065f46' },
};

const MODAL_STYLE = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16,
    paddingTop: 80
};
const CARD_MODAL = {
    background: '#fff', borderRadius: 20, padding: 32, width: '100%',
    maxWidth: 540, maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)'
};

export default function JobsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [form, setForm] = useState({
        categoryId: '', jobTitle: '', jobDescription: '', city: '', district: '',
        urgencyLevel: 'standard', budgetMin: '', budgetMax: '', preferredStartDate: ''
    });
    const [filter, setFilter] = useState({ district: '', categoryId: '' });
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true); setError('');
        try {
            const params = {};
            if (filter.district?.trim()) params.district = filter.district.trim();
            if (filter.categoryId) params.categoryId = filter.categoryId;
            const [jobsRes, catRes] = await Promise.all([jobAPI.getAll(params), jobAPI.getCategories()]);
            setJobs(jobsRes.data.data || []);
            setCategories(catRes.data.data || []);
        } catch { setError('Failed to load jobs. Check your connection or login status.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const resetForm = () => {
        setForm({ categoryId: '', jobTitle: '', jobDescription: '', city: '', district: '', urgencyLevel: 'standard', budgetMin: '', budgetMax: '', preferredStartDate: '' });
        setEditingJob(null); setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, categoryId: parseInt(form.categoryId), budgetMin: form.budgetMin ? parseFloat(form.budgetMin) : null, budgetMax: form.budgetMax ? parseFloat(form.budgetMax) : null, preferredStartDate: form.preferredStartDate || null, city: form.city || null, district: form.district || null };
            if (editingJob) { await jobAPI.update(editingJob.jobId, payload); }
            else { await jobAPI.create(payload); }
            resetForm(); load();
        } catch (err) { setError(err.response?.data?.message || 'Failed to save job'); }
    };

    const handleDelete = async (jobId) => {
        if (!confirm('Delete this job?')) return;
        try { await jobAPI.delete(jobId); load(); }
        catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const startEdit = (job) => {
        setForm({ categoryId: job.category?.categoryId || '', jobTitle: job.jobTitle, jobDescription: job.jobDescription, city: job.city || '', district: job.district || '', urgencyLevel: job.urgencyLevel || 'standard', budgetMin: job.budgetMin || '', budgetMax: job.budgetMax || '', preferredStartDate: job.preferredStartDate || '' });
        setEditingJob(job); setShowForm(true);
    };

    const urgStyle = (level) => URGENCY_STYLE[level] || { bg: '#f1f5f9', color: '#475569' };

    return (
        <div className="fade-in">
            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0c4a6e', marginBottom: 2 }}>📋 Jobs</h1>
                    <p style={{ fontSize: 13, color: '#64748b' }}>Browse and post job opportunities</p>
                </div>
                <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>+ Post Job</button>
            </div>

            {categories.length === 0 && !loading && (
                <div style={{ background: '#fff7ed', color: '#c2410c', padding: '10px 16px', borderRadius: 12, border: '1px solid #ffedd5', fontSize: 13, marginBottom: 16 }}>
                    ⚠️ No job categories found. Please contact admin to seed data.
                </div>
            )}

            {/* ── Filters ── */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <input className="hm-input" style={{ width: 180 }} placeholder="District..." value={filter.district}
                    onChange={e => setFilter({ ...filter, district: e.target.value })} />
                <select className="hm-input" style={{ width: 200 }} value={filter.categoryId}
                    onChange={e => setFilter({ ...filter, categoryId: e.target.value })}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                </select>
                <button className="btn-primary" onClick={load}>Filter</button>
            </div>

            {error && (
                <div className="alert-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <span>❌ {error}</span>
                    <button className="btn-secondary" style={{ padding: '5px 14px', fontSize: 12, flexShrink: 0 }} onClick={load}>Retry</button>
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#0891b2' }}>
                    <span className="spinner" /> Loading jobs...
                </div>
            ) : jobs.length === 0 ? (
                <div className="hm-card" style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                    <p style={{ color: '#64748b', marginBottom: 16 }}>No active jobs found.</p>
                    <button className="btn-primary" onClick={() => setShowForm(true)}>Post the First Job</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {jobs.map(job => {
                        const u = urgStyle(job.urgencyLevel);
                        return (
                            <div key={job.jobId} className="hm-card" style={{ padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                {/* Category icon */}
                                <div style={{ width: 46, height: 46, borderRadius: 12, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                                    📋
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <h3 style={{ fontWeight: 800, fontSize: 15, color: '#0c4a6e' }}>{job.jobTitle}</h3>
                                        <span className="badge" style={{ background: u.bg, color: u.color }}>{job.urgencyLevel}</span>
                                        <span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{job.jobStatus}</span>
                                    </div>
                                    <p style={{
                                        fontSize: 13, color: '#475569', marginBottom: 10, lineHeight: 1.5,
                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                    }}>
                                        {job.jobDescription}
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {job.district && <span className="badge badge-teal">📍 {job.city ? `${job.city}, ` : ''}{job.district}</span>}
                                        {job.category && <span className="badge badge-blue">🏷 {job.category.categoryName}</span>}
                                        {job.budgetMin && <span className="badge badge-green">💰 LKR {job.budgetMin}–{job.budgetMax}</span>}
                                        {job.preferredStartDate && <span className="badge badge-purple">📆 {job.preferredStartDate}</span>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                                    <button className="btn-primary" style={{ padding: '6px 16px', fontSize: 12, justifyContent: 'center' }} onClick={() => navigate(`/jobs/${job.jobId}`)}>View</button>
                                    {job.customer?.userId === user?.userId && (
                                        <>
                                            <button className="btn-secondary" style={{ padding: '6px 16px', fontSize: 12 }} onClick={() => startEdit(job)}>Edit</button>
                                            <button className="btn-danger" style={{ padding: '6px 16px', fontSize: 12 }} onClick={() => handleDelete(job.jobId)}>Delete</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Create/Edit Modal ── */}
            {showForm && (
                <div style={MODAL_STYLE} onClick={resetForm}>
                    <div style={CARD_MODAL} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0c4a6e', marginBottom: 18 }}>
                            {editingJob ? 'Edit Job' : '📋 Post a New Job'}
                        </h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label className="hm-label">Category</label>
                                <select className="hm-input" required value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                                    <option value="">Select category</option>
                                    {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="hm-label">Job Title</label>
                                <input className="hm-input" required placeholder="e.g. Fix plumbing in bathroom" value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} />
                            </div>
                            <div>
                                <label className="hm-label">Description</label>
                                <textarea className="hm-input" required rows={3} style={{ resize: 'vertical' }} placeholder="Describe the work needed..." value={form.jobDescription} onChange={e => setForm({ ...form, jobDescription: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><label className="hm-label">City</label><input className="hm-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                                <div><label className="hm-label">District</label><input className="hm-input" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} /></div>
                            </div>
                            <div>
                                <label className="hm-label">Urgency Level</label>
                                <select className="hm-input" value={form.urgencyLevel} onChange={e => setForm({ ...form, urgencyLevel: e.target.value })}>
                                    {['emergency', 'urgent', 'standard', 'scheduled'].map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><label className="hm-label">Budget Min (LKR)</label><input className="hm-input" type="number" value={form.budgetMin} onChange={e => setForm({ ...form, budgetMin: e.target.value })} /></div>
                                <div><label className="hm-label">Budget Max (LKR)</label><input className="hm-input" type="number" value={form.budgetMax} onChange={e => setForm({ ...form, budgetMax: e.target.value })} /></div>
                            </div>
                            <div>
                                <label className="hm-label">Preferred Start Date</label>
                                <input className="hm-input" type="date" value={form.preferredStartDate} onChange={e => setForm({ ...form, preferredStartDate: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                    {editingJob ? 'Update Job' : 'Post Job'}
                                </button>
                                <button type="button" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }} onClick={resetForm}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
