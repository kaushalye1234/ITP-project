import { useState, useEffect } from 'react';
import { reviewAPI, complaintAPI } from '../api';
import { useAuth } from '../AuthContext';

const STARS = [1, 2, 3, 4, 5];

export default function ReviewsPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState('reviews');
    const [reviews, setReviews] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showComplaintForm, setShowComplaintForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({ bookingId: '', revieweeId: '', rating: 5, reviewText: '', reviewerType: 'customer' });
    const [complaintForm, setComplaintForm] = useState({ complaintCategory: 'other', complaintTitle: '', complaintDescription: '', bookingId: '' });

    const loadReviews = async () => {
        setLoading(true);
        try {
            const res = await reviewAPI.getAll();
            setReviews(res.data.data || []);
        } catch { }
        setLoading(false);
    };

    const loadComplaints = async () => {
        setLoading(true);
        try {
            const res = await complaintAPI.getAll();
            setComplaints(res.data.data || []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => {
        if (tab === 'reviews') loadReviews();
        else loadComplaints();
    }, [tab]);

    const submitReview = async (e) => {
        e.preventDefault();
        try {
            await reviewAPI.submit({ ...reviewForm, bookingId: parseInt(reviewForm.bookingId), revieweeId: parseInt(reviewForm.revieweeId) });
            alert('Review submitted!');
            setShowReviewForm(false);
            loadReviews();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed'));
        }
    };

    const submitComplaint = async (e) => {
        e.preventDefault();
        try {
            await complaintAPI.submit({ ...complaintForm, bookingId: complaintForm.bookingId ? parseInt(complaintForm.bookingId) : null });
            alert('Complaint submitted!');
            setShowComplaintForm(false);
            loadComplaints();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed'));
        }
    };

    const updateComplaintStatus = async (id, status) => {
        try {
            await complaintAPI.updateStatus(id, status);
            loadComplaints();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed'));
        }
    };

    const deleteReview = async (id) => {
        if (!confirm('Delete this review?')) return;
        try {
            await reviewAPI.delete(id);
            loadReviews();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed'));
        }
    };

    const deleteComplaint = async (id) => {
        if (!confirm('Delete this complaint?')) return;
        try {
            await complaintAPI.delete(id);
            loadComplaints();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed'));
        }
    };

    const renderStars = (rating) => STARS.map(s =>
        <span key={s} className={s <= rating ? 'text-yellow-400' : 'text-slate-200'}>★</span>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">⭐ Reviews & Complaints</h1>
                    <p className="text-slate-500 text-sm">Rate services and report issues</p>
                </div>
                <div className="flex gap-2">
                    {tab === 'reviews' && (
                        <button onClick={() => setShowReviewForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                            + Review
                        </button>
                    )}
                    {tab === 'complaints' && (
                        <button onClick={() => setShowComplaintForm(true)} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors">
                            + Complaint
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {['reviews', 'complaints'].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${tab === t ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                        {t === 'reviews' ? '⭐ Reviews' : '📢 Complaints'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : tab === 'reviews' ? (
                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                            <div className="text-5xl mb-3">⭐</div>
                            <p className="text-slate-500">No reviews yet.</p>
                        </div>
                    ) : reviews.map(r => (
                        <div key={r.reviewId} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="text-xl">{renderStars(r.overallRating)}</div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${r.reviewerType === 'customer' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                        By {r.reviewerType}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-400">Booking #{r.booking?.bookingId}</span>
                            </div>
                            {r.reviewText && <p className="text-sm text-slate-600 mt-2 italic">"{r.reviewText}"</p>}
                            <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                                <span>Reviewer: {r.reviewer?.email} → Reviewee: {r.reviewee?.email}</span>
                                <button onClick={() => deleteReview(r.reviewId)}
                                    className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg hover:bg-red-100 transition-colors ml-3">
                                    🗑 Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {complaints.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                            <div className="text-5xl mb-3">📢</div>
                            <p className="text-slate-500">No complaints found.</p>
                        </div>
                    ) : complaints.map(c => (
                        <div key={c.complaintId} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-800">{c.complaintTitle}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.complaintStatus === 'resolved' ? 'bg-green-100 text-green-700' :
                                            c.complaintStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                c.complaintStatus === 'investigating' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {c.complaintStatus}
                                        </span>
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{c.complaintCategory?.replace('_', ' ')}</span>
                                    </div>
                                    <p className="text-sm text-slate-500">{c.complaintDescription}</p>
                                </div>
                                <div className="ml-4 flex flex-col gap-1">
                                    {user?.role === 'admin' && (
                                        <>
                                            {c.complaintStatus === 'pending' && (
                                                <button onClick={() => updateComplaintStatus(c.complaintId, 'investigating')}
                                                    className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                                                    Investigate
                                                </button>
                                            )}
                                            {(c.complaintStatus === 'pending' || c.complaintStatus === 'investigating') && (
                                                <button onClick={() => updateComplaintStatus(c.complaintId, 'resolved')}
                                                    className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
                                                    Resolve
                                                </button>
                                            )}
                                            <button onClick={() => deleteComplaint(c.complaintId)}
                                                className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                                                🗑 Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Review Form Modal */}
            {showReviewForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                        <h2 className="text-xl font-bold text-slate-800 mb-5">Submit Review</h2>
                        <form onSubmit={submitReview} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Booking ID</label>
                                <input required type="number" value={reviewForm.bookingId} onChange={e => setReviewForm({ ...reviewForm, bookingId: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Reviewee User ID</label>
                                <input required type="number" value={reviewForm.revieweeId} onChange={e => setReviewForm({ ...reviewForm, revieweeId: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Rating</label>
                                <div className="flex gap-2">
                                    {STARS.map(s => (
                                        <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                                            className={`text-2xl transition-transform hover:scale-110 ${s <= reviewForm.rating ? 'text-yellow-400' : 'text-slate-200'}`}>
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">I am a</label>
                                <select value={reviewForm.reviewerType} onChange={e => setReviewForm({ ...reviewForm, reviewerType: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="customer">Customer</option>
                                    <option value="worker">Worker</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Review Text</label>
                                <textarea value={reviewForm.reviewText} onChange={e => setReviewForm({ ...reviewForm, reviewText: e.target.value })} rows={3}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-700 transition-colors">Submit</button>
                                <button type="button" onClick={() => setShowReviewForm(false)} className="flex-1 bg-slate-100 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Complaint Form Modal */}
            {showComplaintForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                        <h2 className="text-xl font-bold text-slate-800 mb-5">Submit Complaint</h2>
                        <form onSubmit={submitComplaint} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                                <select value={complaintForm.complaintCategory} onChange={e => setComplaintForm({ ...complaintForm, complaintCategory: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    {['service_quality', 'inappropriate_behavior', 'fraud', 'payment_issue', 'other'].map(c =>
                                        <option key={c} value={c}>{c.replace('_', ' ')}</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
                                <input required value={complaintForm.complaintTitle} onChange={e => setComplaintForm({ ...complaintForm, complaintTitle: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                                <textarea required value={complaintForm.complaintDescription} onChange={e => setComplaintForm({ ...complaintForm, complaintDescription: e.target.value })} rows={3}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Related Booking ID (optional)</label>
                                <input type="number" value={complaintForm.bookingId} onChange={e => setComplaintForm({ ...complaintForm, bookingId: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="flex-1 bg-orange-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-orange-600 transition-colors">Submit</button>
                                <button type="button" onClick={() => setShowComplaintForm(false)} className="flex-1 bg-slate-100 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
