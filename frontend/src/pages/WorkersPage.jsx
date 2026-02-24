import { useState, useEffect } from 'react';
import { workerAPI } from '../api';

export default function WorkersPage() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [district, setDistrict] = useState('');
    const [selected, setSelected] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({});

    const load = async () => {
        setLoading(true);
        try {
            const res = await workerAPI.getAll(district || undefined);
            setWorkers(res.data.data || []);
        } catch {
            setError('Failed to load workers.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            await workerAPI.updateMe(editForm);
            setEditMode(false);
            alert('Profile updated!');
            load();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed'));
        }
    };

    const startEdit = (w) => {
        setEditForm({
            firstName: w.firstName, lastName: w.lastName,
            bio: w.bio, city: w.city, district: w.district,
            hourlyRateMin: w.hourlyRateMin, hourlyRateMax: w.hourlyRateMax
        });
        setEditMode(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">👷 Workers</h1>
                    <p className="text-slate-500 text-sm">Browse skilled professionals</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Filter by district..."
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        onClick={load}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        Search
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-50 border text-red-700 border-red-200 rounded-xl p-3 mb-4 text-sm">{error}</div>}

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : workers.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-100">
                    <div className="text-5xl mb-3">👷</div>
                    <p className="text-slate-500">No workers found. Try a different district.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workers.map((w) => (
                        <div key={w.workerId} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-600">
                                    {w.firstName?.[0]}{w.lastName?.[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{w.firstName} {w.lastName}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${w.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {w.isVerified ? '✓ Verified' : 'Pending'}
                                    </span>
                                </div>
                            </div>
                            {w.bio && <p className="text-sm text-slate-500 mb-3 line-clamp-2">{w.bio}</p>}
                            <div className="text-xs text-slate-400 space-y-1">
                                {w.district && <p>📍 {w.city ? `${w.city}, ` : ''}{w.district}</p>}
                                {w.hourlyRateMin && <p>💰 LKR {w.hourlyRateMin} – {w.hourlyRateMax}/hr</p>}
                                <p>⭐ {w.averageRating || 0} rating | {w.totalJobs || 0} jobs</p>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setSelected(w)}
                                    className="flex-1 bg-indigo-50 text-indigo-600 rounded-xl py-2 text-sm font-semibold hover:bg-indigo-100 transition-colors"
                                >
                                    View Profile
                                </button>
                                <button
                                    onClick={() => startEdit(w)}
                                    className="flex-1 bg-slate-50 text-slate-600 rounded-xl py-2 text-sm font-semibold hover:bg-slate-100 transition-colors"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600">
                                {selected.firstName?.[0]}{selected.lastName?.[0]}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{selected.firstName} {selected.lastName}</h2>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${selected.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {selected.isVerified ? '✓ Verified' : 'Pending Verification'}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-slate-600">
                            {selected.bio && <p><strong>Bio:</strong> {selected.bio}</p>}
                            <p><strong>Location:</strong> {selected.city}, {selected.district}</p>
                            {selected.hourlyRateMin && <p><strong>Rate:</strong> LKR {selected.hourlyRateMin} – {selected.hourlyRateMax}/hr</p>}
                            <p><strong>Rating:</strong> ⭐ {selected.averageRating || 0} ({selected.totalJobs || 0} jobs)</p>
                        </div>
                        <button onClick={() => setSelected(null)} className="mt-6 w-full bg-slate-100 rounded-xl py-2 text-sm font-semibold hover:bg-slate-200 transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editMode && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-5">Edit Profile</h2>
                        <form onSubmit={handleEdit} className="space-y-3">
                            {['firstName', 'lastName', 'city', 'district', 'bio'].map(f => (
                                <div key={f}>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1 capitalize">{f}</label>
                                    <input
                                        value={editForm[f] || ''}
                                        onChange={e => setEditForm({ ...editForm, [f]: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            ))}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Rate Min (LKR)</label>
                                    <input type="number" value={editForm.hourlyRateMin || ''} onChange={e => setEditForm({ ...editForm, hourlyRateMin: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Rate Max (LKR)</label>
                                    <input type="number" value={editForm.hourlyRateMax || ''} onChange={e => setEditForm({ ...editForm, hourlyRateMax: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button type="submit" className="flex-1 bg-indigo-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-indigo-700 transition-colors">Save</button>
                                <button type="button" onClick={() => setEditMode(false)} className="flex-1 bg-slate-100 rounded-xl py-2 text-sm font-semibold hover:bg-slate-200 transition-colors">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
