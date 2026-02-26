import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewAPI, complaintAPI } from '../api';
import { useAuth } from '../AuthContext';

const STARS = [1, 2, 3, 4, 5];

const COMPLAINT_STATUS_STYLE = {
    pending: { bg: '#fef3c7', color: '#92400e' },
    investigating: { bg: '#dbeafe', color: '#1e40af' },
    resolved: { bg: '#d1fae5', color: '#065f46' },
    dismissed: { bg: '#fee2e2', color: '#991b1b' },
};

const MODAL = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
};
const CARD_MODAL = {
    background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    padding: 32, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto'
};

function StarDisplay({ rating }) {
    return (
        <span style={{ fontSize: 18, letterSpacing: 1 }}>
            {STARS.map(s => <span key={s} style={{ color: s <= rating ? '#f59e0b' : '#e2e8f0' }}>★</span>)}
        </span>
    );
}

function StarInput({ rating, onChange }) {
    return (
        <div style={{ display: 'flex', gap: 4 }}>
            {STARS.map(s => (
                <button key={s} type="button" onClick={() => onChange(s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, color: s <= rating ? '#f59e0b' : '#e2e8f0', transition: 'color 0.1s, transform 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                    ★
                </button>
            ))}
        </div>
    );
}

export default function ReviewsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tab, setTab] = useState('reviews');
    const [reviews, setReviews] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showComplaintForm, setShowComplaintForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({ bookingId: '', revieweeId: '', rating: 5, reviewText: '', reviewerType: 'customer' });
    const [editingReview, setEditingReview] = useState(null);
    const [complaintForm, setComplaintForm] = useState({ complaintCategory: 'other', complaintTitle: '', complaintDescription: '', bookingId: '' });

    const loadReviews = async () => {
        setLoading(true);
        setError('');
        try {
            const r = await reviewAPI.getAll();
            setReviews(r.data.data || []);
        } catch {
            setError('Failed to load reviews. Check your connection or login status.');
        } finally {
            setLoading(false);
        }
    };

    const loadComplaints = async () => {
        setLoading(true);
        setError('');
        try {
            const r = await complaintAPI.getAll();
            setComplaints(r.data.data || []);
        } catch {
            setError('Failed to load complaints. Check your connection or login status.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setError('');
        tab === 'reviews' ? loadReviews() : loadComplaints();
    }, [tab]);

    const submitReview = async (e) => {
        e.preventDefault();
        try { await reviewAPI.submit({ ...reviewForm, bookingId: parseInt(reviewForm.bookingId), revieweeId: parseInt(reviewForm.revieweeId) }); setShowReviewForm(false); loadReviews(); }
        catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const submitComplaint = async (e) => {
        e.preventDefault();
        try { await complaintAPI.submit({ ...complaintForm, bookingId: complaintForm.bookingId ? parseInt(complaintForm.bookingId) : null }); setShowComplaintForm(false); loadComplaints(); }
        catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const updateComplaintStatus = async (id, status) => {
        try { await complaintAPI.updateStatus(id, status); loadComplaints(); }
        catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed')); }
    };

    const startEditReview = (r) => {
        setEditingReview(r);
        setReviewForm({ bookingId: r.booking?.bookingId || '', revieweeId: r.reviewee?.userId || '', rating: r.overallRating || 5, reviewText: r.reviewText || '', reviewerType: r.reviewerType || 'customer' });
        setShowReviewForm(true);
    };

    const submitEditReview = async (e) => {
        e.preventDefault();
        try {
            await reviewAPI.update(editingReview.reviewId, { rating: reviewForm.rating, reviewText: reviewForm.reviewText });
            setShowReviewForm(false);
            setEditingReview(null);
            loadReviews();
        } catch (err) { alert('Error: ' + (err.response?.data?.message || 'Failed to update')); }
    };

    const deleteReview = async (id) => { if (!confirm('Delete this review?')) return; try { await reviewAPI.delete(id); loadReviews(); } catch (err) { alert('Failed'); } };
    const deleteComplaint = async (id) => { if (!confirm('Delete this complaint?')) return; try { await complaintAPI.delete(id); loadComplaints(); } catch (err) { alert('Failed'); } };

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0c4a6e', marginBottom: 2 }}>⭐ Reviews & Complaints</h1>
                    <p style={{ fontSize: 13, color: '#64748b' }}>Rate services and report issues</p>
                </div>
                <div>
                    {tab === 'reviews' && (
                        <button className="btn-primary" onClick={() => setShowReviewForm(true)}>+ Write Review</button>
                    )}
                    {tab === 'complaints' && (
                        <button className="btn-primary" style={{ background: 'linear-gradient(135deg,#f97316,#9a3412)' }}
                            onClick={() => setShowComplaintForm(true)}>+ Submit Complaint</button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[['reviews', '⭐ Reviews'], ['complaints', '📢 Complaints']].map(([t, label]) => (
                    <button key={t} onClick={() => setTab(t)}
                        style={{
                            padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            fontSize: 13, fontWeight: 700,
                            background: tab === t ? 'linear-gradient(135deg,#0891b2,#0e7490)' : '#fff',
                            color: tab === t ? '#fff' : '#64748b',
                            border: tab === t ? 'none' : '1.5px solid #e0f2fe',
                            boxShadow: tab === t ? '0 2px 8px rgba(8,145,178,0.25)' : 'none',
                        }}>
                        {label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="alert-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <span>❌ {error}</span>
                    <button className="btn-secondary" style={{ padding: '5px 14px', fontSize: 12, flexShrink: 0 }}
                        onClick={() => tab === 'reviews' ? loadReviews() : loadComplaints()}>Retry</button>
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: '#0891b2' }}>
                    <span className="spinner" /> Loading...
                </div>
            ) : tab === 'reviews' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {reviews.length === 0 ? (
                        <div className="hm-card" style={{ padding: 48, textAlign: 'center' }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
                            <p style={{ color: '#64748b' }}>No reviews yet. Be the first to leave one!</p>
                        </div>
                    ) : reviews.map(r => (
                        <div key={r.reviewId} className="hm-card" style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                                        <StarDisplay rating={r.overallRating} />
                                        <span style={{ fontWeight: 800, fontSize: 14, color: '#0c4a6e' }}>{r.overallRating}/5</span>
                                        <span className={`badge ${r.reviewerType === 'customer' ? 'badge-blue' : 'badge-green'}`}>
                                            By {r.reviewerType}
                                        </span>
                                        <span className="badge badge-gray">Booking #{r.booking?.bookingId}</span>
                                    </div>
                                    {r.reviewText && (
                                        <p style={{ fontSize: 13, color: '#475569', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 8 }}>
                                            "{r.reviewText}"
                                        </p>
                                    )}
                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                        {r.reviewer?.email} → {r.reviewee?.email}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginLeft: 12, flexShrink: 0 }}>
                                    {user?.userId === r.reviewer?.userId && (
                                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11 }}
                                            onClick={() => startEditReview(r)}>✏ Edit</button>
                                    )}
                                    {(user?.role === 'admin' || user?.userId === r.reviewer?.userId) && (
                                        <button className="btn-danger" style={{ padding: '6px 12px', fontSize: 11 }}
                                            onClick={() => deleteReview(r.reviewId)}>🗑</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {complaints.length === 0 ? (
                        <div className="hm-card" style={{ padding: 48, textAlign: 'center' }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>📢</div>
                            <p style={{ color: '#64748b' }}>No complaints found.</p>
                        </div>
                    ) : complaints.map(c => {
                        const s = COMPLAINT_STATUS_STYLE[c.complaintStatus] || { bg: '#f1f5f9', color: '#475569' };
                        return (
                            <div key={c.complaintId} className="hm-card" style={{ padding: '20px 24px' }}>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                                            <h3 style={{ fontWeight: 800, fontSize: 14, color: '#0c4a6e' }}>{c.complaintTitle}</h3>
                                            <span className="badge" style={{ background: s.bg, color: s.color, textTransform: 'capitalize' }}>{c.complaintStatus}</span>
                                            <span className="badge badge-orange" style={{ textTransform: 'capitalize' }}>{c.complaintCategory?.replace(/_/g, ' ')}</span>
                                        </div>
                                        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{c.complaintDescription}</p>
                                    </div>
                                    {user?.role === 'admin' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                                            {c.complaintStatus === 'pending' && (
                                                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11 }}
                                                    onClick={() => updateComplaintStatus(c.complaintId, 'investigating')}>Investigate</button>
                                            )}
                                            {['pending', 'investigating'].includes(c.complaintStatus) && (
                                                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 11, justifyContent: 'center' }}
                                                    onClick={() => updateComplaintStatus(c.complaintId, 'resolved')}>Resolve</button>
                                            )}
                                            <button className="btn-danger" style={{ padding: '6px 12px', fontSize: 11 }}
                                                onClick={() => deleteComplaint(c.complaintId)}>🗑</button>
                                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11 }}
                                                onClick={() => navigate('/admin/users')}>🛡 User Mgmt</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Review Modal */}
            {showReviewForm && (
                <div style={MODAL} onClick={() => { setShowReviewForm(false); setEditingReview(null); }}>
                    <div style={CARD_MODAL} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0c4a6e', marginBottom: 18 }}>
                            {editingReview ? '✏ Edit Review' : '⭐ Submit Review'}
                        </h2>
                        <form onSubmit={editingReview ? submitEditReview : submitReview} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {!editingReview && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div><label className="hm-label">Booking ID</label><input className="hm-input" required type="number" value={reviewForm.bookingId} onChange={e => setReviewForm({ ...reviewForm, bookingId: e.target.value })} /></div>
                                    <div><label className="hm-label">Reviewee User ID</label><input className="hm-input" required type="number" value={reviewForm.revieweeId} onChange={e => setReviewForm({ ...reviewForm, revieweeId: e.target.value })} /></div>
                                </div>
                            )}
                            <div>
                                <label className="hm-label">Rating</label>
                                <StarInput rating={reviewForm.rating} onChange={r => setReviewForm({ ...reviewForm, rating: r })} />
                            </div>
                            {!editingReview && (
                                <div>
                                    <label className="hm-label">I am a</label>
                                    <select className="hm-input" value={reviewForm.reviewerType} onChange={e => setReviewForm({ ...reviewForm, reviewerType: e.target.value })}>
                                        <option value="customer">Customer</option>
                                        <option value="worker">Worker</option>
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="hm-label">Review Text</label>
                                <textarea className="hm-input" rows={3} style={{ resize: 'vertical' }} placeholder="Share your experience..." value={reviewForm.reviewText} onChange={e => setReviewForm({ ...reviewForm, reviewText: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                    {editingReview ? 'Update Review' : 'Submit Review'}
                                </button>
                                <button type="button" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }} onClick={() => { setShowReviewForm(false); setEditingReview(null); }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Complaint Modal */}
            {showComplaintForm && (
                <div style={MODAL} onClick={() => setShowComplaintForm(false)}>
                    <div style={CARD_MODAL} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0c4a6e', marginBottom: 18 }}>📢 Submit Complaint</h2>
                        <form onSubmit={submitComplaint} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label className="hm-label">Category</label>
                                <select className="hm-input" value={complaintForm.complaintCategory} onChange={e => setComplaintForm({ ...complaintForm, complaintCategory: e.target.value })}>
                                    {['service_quality', 'inappropriate_behavior', 'fraud', 'payment_issue', 'other'].map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                                </select>
                            </div>
                            <div><label className="hm-label">Title</label><input className="hm-input" required value={complaintForm.complaintTitle} onChange={e => setComplaintForm({ ...complaintForm, complaintTitle: e.target.value })} /></div>
                            <div>
                                <label className="hm-label">Description</label>
                                <textarea className="hm-input" required rows={3} style={{ resize: 'vertical' }} value={complaintForm.complaintDescription} onChange={e => setComplaintForm({ ...complaintForm, complaintDescription: e.target.value })} />
                            </div>
                            <div><label className="hm-label">Related Booking ID (optional)</label><input className="hm-input" type="number" value={complaintForm.bookingId} onChange={e => setComplaintForm({ ...complaintForm, bookingId: e.target.value })} /></div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg,#f97316,#9a3412)' }}>Submit</button>
                                <button type="button" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }} onClick={() => setShowComplaintForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
