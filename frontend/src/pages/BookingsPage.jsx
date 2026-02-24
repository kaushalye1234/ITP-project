import { useState, useEffect } from 'react';
import { bookingAPI, jobAPI, workerAPI } from '../api';
import { useAuth } from '../AuthContext';

const STATUS_COLORS = {
    requested: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    rejected: 'bg-gray-100 text-gray-600',
};

const TRANSITIONS = {
    requested: ['accepted', 'rejected', 'cancelled'],
    accepted: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
    rejected: [],
};

export default function BookingsPage() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewAs, setViewAs] = useState('customer');
    const [showForm, setShowForm] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [form, setForm] = useState({ jobId: '', workerId: '', scheduledDate: '', scheduledTime: '', notes: '' });
    const [history, setHistory] = useState([]);
    const [historyBookingId, setHistoryBookingId] = useState(null);
    const [editBooking, setEditBooking] = useState(null);
    const [editForm, setEditForm] = useState({ notes: '', scheduledDate: '', scheduledTime: '' });
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const res = await bookingAPI.getMine(viewAs);
            setBookings(res.data.data || []);
        } catch {
            setError('Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    };

    const loadFormData = async () => {
        try {
            const [jobsRes, workersRes] = await Promise.all([jobAPI.getAll({}), workerAPI.getAll()]);
            setJobs(jobsRes.data.data || []);
            setWorkers(workersRes.data.data || []);
        } catch { }
    };

    useEffect(() => { load(); }, [viewAs]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await bookingAPI.create(form);
            alert('Booking request sent!');
            setShowForm(false);
            load();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed'));
        }
    };

    const handleStatusChange = async (bookingId, status) => {
        const reason = status === 'cancelled' || status === 'rejected'
            ? prompt('Enter a reason (optional):') || ''
            : '';
        try {
            await bookingAPI.updateStatus(bookingId, status, reason);
            alert(`Booking ${status}!`);
            load();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed'));
        }
    };

    const viewHistory = async (bookingId) => {
        try {
            const res = await bookingAPI.getHistory(bookingId);
            setHistory(res.data.data || []);
            setHistoryBookingId(bookingId);
        } catch {
            alert('Failed to load history');
        }
    };

    const handleDelete = async (bookingId) => {
        if (!confirm('Delete this booking? This cannot be undone.')) return;
        try {
            await bookingAPI.delete(bookingId);
            load();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed'));
        }
    };

    const openEdit = (booking) => {
        setEditBooking(booking);
        setEditForm({
            notes: booking.notes || '',
            scheduledDate: booking.scheduledDate || '',
            scheduledTime: booking.scheduledTime || '',
        });
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            await bookingAPI.update(editBooking.bookingId, editForm);
            alert('Booking updated!');
            setEditBooking(null);
            load();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed'));
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">📅 Bookings</h1>
                    <p className="text-slate-500 text-sm">Manage and track your service bookings</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                        {['customer', 'worker'].map(role => (
                            <button key={role} onClick={() => setViewAs(role)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewAs === role ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                As {role}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => { loadFormData(); setShowForm(true); }}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow"
                    >
                        + New Booking
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>}

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : bookings.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                    <div className="text-5xl mb-3">📅</div>
                    <p className="text-slate-500">No bookings yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map(b => (
                        <div key={b.bookingId} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-bold text-slate-800">Booking #{b.bookingId}</span>
                                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[b.bookingStatus] || 'bg-gray-100 text-gray-600'}`}>
                                            {b.bookingStatus?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-500 space-y-1">
                                        <p>📋 Job: <span className="font-medium text-slate-700">{b.job?.jobTitle}</span></p>
                                        <p>👷 Worker: {b.worker?.firstName} {b.worker?.lastName}</p>
                                        <p>📅 Scheduled: {b.scheduledDate} at {b.scheduledTime}</p>
                                        {b.notes && <p>📝 {b.notes}</p>}
                                        {b.cancellationReason && <p className="text-red-500">❌ Reason: {b.cancellationReason}</p>}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 ml-4 min-w-[140px]">
                                    {TRANSITIONS[b.bookingStatus]?.map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(b.bookingId, status)}
                                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${status === 'accepted' || status === 'in_progress' || status === 'completed'
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                }`}
                                        >
                                            → {status.replace('_', ' ')}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => viewHistory(b.bookingId)}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                                    >
                                        📜 History
                                    </button>
                                    {b.bookingStatus === 'requested' && (
                                        <button onClick={() => openEdit(b)}
                                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors">
                                            ✏️ Edit
                                        </button>
                                    )}
                                    {(b.bookingStatus === 'requested' || b.bookingStatus === 'completed' || b.bookingStatus === 'cancelled' || b.bookingStatus === 'rejected') && (
                                        <button onClick={() => handleDelete(b.bookingId)}
                                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                            🗑 Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Booking Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-5">Create New Booking</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Job</label>
                                <select required value={form.jobId} onChange={e => setForm({ ...form, jobId: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select a job</option>
                                    {jobs.map(j => <option key={j.jobId} value={j.jobId}>{j.jobTitle}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Worker</label>
                                <select required value={form.workerId} onChange={e => setForm({ ...form, workerId: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select a worker</option>
                                    {workers.map(w => <option key={w.workerId} value={w.workerId}>{w.firstName} {w.lastName}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                                    <input type="date" required value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Time</label>
                                    <input type="time" required value={form.scheduledTime} onChange={e => setForm({ ...form, scheduledTime: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Notes (optional)</label>
                                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-700 transition-colors">
                                    Send Request
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-slate-100 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-200 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {historyBookingId && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-5">📜 Booking #{historyBookingId} History</h2>
                        {history.length === 0 ? (
                            <p className="text-slate-500 text-sm">No history yet.</p>
                        ) : (
                            <ol className="relative border-l border-slate-200 ml-3 space-y-4">
                                {history.map(h => (
                                    <li key={h.historyId} className="pl-6 relative">
                                        <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white"></div>
                                        <div className="text-sm font-semibold text-slate-800">
                                            {h.oldStatus ? `${h.oldStatus} → ${h.newStatus}` : `Created (${h.newStatus})`}
                                        </div>
                                        {h.changeReason && <div className="text-xs text-slate-500 mt-0.5">{h.changeReason}</div>}
                                        <div className="text-xs text-slate-400 mt-0.5">{new Date(h.changedAt).toLocaleString()}</div>
                                    </li>
                                ))}
                            </ol>
                        )}
                        <button onClick={() => setHistoryBookingId(null)} className="mt-6 w-full bg-slate-100 rounded-xl py-2 text-sm font-semibold hover:bg-slate-200 transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            )}
            {/* Edit Booking Modal */}
            {editBooking && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                        <h2 className="text-xl font-bold text-slate-800 mb-5">✏️ Edit Booking #{editBooking.bookingId}</h2>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                                    <input type="date" value={editForm.scheduledDate} onChange={e => setEditForm({ ...editForm, scheduledDate: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Time</label>
                                    <input type="time" value={editForm.scheduledTime} onChange={e => setEditForm({ ...editForm, scheduledTime: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Notes</label>
                                <textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} rows={3}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-700 transition-colors">Save</button>
                                <button type="button" onClick={() => setEditBooking(null)} className="flex-1 bg-slate-100 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
