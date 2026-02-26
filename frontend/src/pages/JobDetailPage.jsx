import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobAPI } from '../api';
import { useAuth } from '../AuthContext';
import StatusBadge from '../components/StatusBadge';

const URGENCY = { emergency: 'badge-red', urgent: 'badge-yellow', standard: 'badge-green' };

export default function JobDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [applications, setApplications] = useState([]);
    const [appsSupported, setAppsSupported] = useState(true);
    const [applyForm, setApplyForm] = useState({ coverNote: '', proposedPrice: '' });
    const [applied, setApplied] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

    const loadJob = async () => {
        setLoading(true);
        try {
            const res = await jobAPI.getById(id);
            const j = res.data.data;
            setJob(j);
            setEditForm({ title: j.title || '', description: j.description || '', budgetMin: j.budgetMin || '', budgetMax: j.budgetMax || '' });
        } catch { setError('Job not found.'); }
        finally { setLoading(false); }
    };

    const loadApplications = async () => {
        try {
            const res = await jobAPI.getApplications(id);
            setApplications(res.data.data || []);
        } catch { setAppsSupported(false); }
    };

    const checkApplied = async () => {
        try {
            const res = await jobAPI.getApplied();
            const myApps = res.data.data || [];
            setApplied(myApps.some(a => a.job?.jobId === parseInt(id)));
        } catch { /* ignore */ }
    };

    useEffect(() => {
        loadJob();
        if (user?.role === 'worker') checkApplied();
    }, [id]);

    useEffect(() => {
        if (job && job.customer?.userId === user?.userId) loadApplications();
    }, [job?.jobId]);

    const isOwner = job?.customer?.userId === user?.userId;

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            await jobAPI.apply(id, {
                coverNote: applyForm.coverNote,
                proposedPrice: applyForm.proposedPrice ? parseFloat(applyForm.proposedPrice) : null,
            });
            setApplied(true);
            alert('Application submitted!');
        } catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            await jobAPI.update(id, editForm);
            setEditing(false);
            loadJob();
        } catch (err) { alert('Error: ' + (err.response?.data?.message || 'Update failed')); }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this job?')) return;
        try { await jobAPI.delete(id); window.history.back(); }
        catch (err) { alert('Error: ' + (err.response?.data?.message || 'Delete failed')); }
    };

    const handleStatusChange = async (status) => {
        try { await jobAPI.updateStatus(id, status); loadJob(); }
        catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const handleAppAction = async (appId, status) => {
        try { await jobAPI.updateApplication(id, appId, { status }); loadApplications(); }
        catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

    if (loading) return (
        <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: '#0891b2' }}>
            <span className="spinner" /> Loading job...
        </div>
    );
    if (error || !job) return (
        <div className="fade-in empty-state">
            <span className="empty-icon">📋</span>
            <p>{error || 'Job not found.'}</p>
            <Link to="/jobs" className="btn-primary" style={{ textDecoration: 'none' }}>Back to Jobs</Link>
        </div>
    );

    return (
        <div className="fade-in">
            <Link to="/jobs" style={{ color: '#0891b2', fontWeight: 600, fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>
                ← Back to Jobs
            </Link>

            <div className="hm-card" style={{ padding: 28, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0c4a6e', marginBottom: 8 }}>{job.title}</h1>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <StatusBadge status={job.status} />
                            {job.jobCategory && <span className="badge badge-blue">{job.jobCategory.categoryName}</span>}
                            {job.district && <span className="badge badge-teal">📍 {job.district}</span>}
                            {job.urgencyLevel && <span className={`badge ${URGENCY[job.urgencyLevel] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{job.urgencyLevel}</span>}
                        </div>
                    </div>
                    {(job.budgetMin || job.budgetMax) && (
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 12, color: '#64748b' }}>Budget</div>
                            <div style={{ fontSize: 22, fontWeight: 900, color: '#0891b2' }}>
                                LKR {job.budgetMin || '?'} – {job.budgetMax || '?'}
                            </div>
                        </div>
                    )}
                </div>

                <hr className="hm-divider" />
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: 16 }}>{job.description}</p>

                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    Posted by {job.customer?.email || 'Unknown'} · {formatDate(job.createdAt)}
                </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
                <div className="hm-card" style={{ padding: 20, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0c4a6e', marginBottom: 12 }}>Manage Job</h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className="btn-secondary" onClick={() => setEditing(!editing)}>
                            {editing ? 'Cancel Edit' : '✏ Edit'}
                        </button>
                        {job.status === 'open' && <button className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => handleStatusChange('closed')}>Close Job</button>}
                        {job.status === 'closed' && <button className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => handleStatusChange('open')}>Reopen</button>}
                        <button className="btn-danger" onClick={handleDelete}>🗑 Delete</button>
                    </div>

                    {editing && (
                        <form onSubmit={handleEdit} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <label className="hm-label">Title</label>
                                <input className="hm-input" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="hm-label">Description</label>
                                <textarea className="hm-input" rows={4} style={{ resize: 'vertical' }} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label className="hm-label">Budget Min (LKR)</label>
                                    <input className="hm-input" type="number" value={editForm.budgetMin} onChange={e => setEditForm({ ...editForm, budgetMin: e.target.value })} />
                                </div>
                                <div>
                                    <label className="hm-label">Budget Max (LKR)</label>
                                    <input className="hm-input" type="number" value={editForm.budgetMax} onChange={e => setEditForm({ ...editForm, budgetMax: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
                        </form>
                    )}
                </div>
            )}

            {/* Applications (Owner) */}
            {isOwner && appsSupported && (
                <div className="hm-card" style={{ padding: 20, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0c4a6e', marginBottom: 12 }}>Applications ({applications.length})</h3>
                    {applications.length === 0 ? (
                        <p style={{ color: '#64748b', fontSize: 13 }}>No applications yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {applications.map(a => (
                                <div key={a.applicationId} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e0f2fe' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 13, color: '#0c4a6e' }}>{a.worker?.email || `Worker #${a.workerUserId}`}</div>
                                            {a.proposedPrice && <span className="badge badge-green">LKR {a.proposedPrice}</span>}
                                            <StatusBadge status={a.status} />
                                        </div>
                                        {a.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn-primary" style={{ padding: '5px 12px', fontSize: 11 }} onClick={() => handleAppAction(a.applicationId, 'accepted')}>Accept</button>
                                                <button className="btn-danger" style={{ padding: '5px 12px', fontSize: 11 }} onClick={() => handleAppAction(a.applicationId, 'rejected')}>Reject</button>
                                            </div>
                                        )}
                                    </div>
                                    {a.coverNote && <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{a.coverNote}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Worker Apply */}
            {!isOwner && user?.role === 'worker' && (
                <div className="hm-card" style={{ padding: 20 }}>
                    {applied ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="badge badge-blue" style={{ fontSize: 13, padding: '6px 14px' }}>✓ Application Submitted</span>
                        </div>
                    ) : job.status === 'open' ? (
                        <>
                            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0c4a6e', marginBottom: 12 }}>Apply to This Job</h3>
                            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <label className="hm-label">Proposed Price (LKR)</label>
                                    <input className="hm-input" type="number" placeholder="Your proposed price"
                                        value={applyForm.proposedPrice} onChange={e => setApplyForm({ ...applyForm, proposedPrice: e.target.value })} />
                                </div>
                                <div>
                                    <label className="hm-label">Cover Note</label>
                                    <textarea className="hm-input" rows={3} style={{ resize: 'vertical' }} placeholder="Why you're a good fit..."
                                        value={applyForm.coverNote} onChange={e => setApplyForm({ ...applyForm, coverNote: e.target.value })} />
                                </div>
                                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Submit Application</button>
                            </form>
                        </>
                    ) : (
                        <p style={{ color: '#64748b', fontSize: 13 }}>This job is no longer accepting applications.</p>
                    )}
                </div>
            )}
        </div>
    );
}
