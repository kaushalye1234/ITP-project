import { useState, useEffect } from 'react';
import { jobAPI } from '../api';
import { useAuth } from '../AuthContext';

const URGENCY_COLORS = {
    emergency: 'bg-red-100 text-red-700',
    urgent: 'bg-orange-100 text-orange-700',
    standard: 'bg-blue-100 text-blue-700',
    scheduled: 'bg-green-100 text-green-700',
};

export default function JobsPage() {
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
        setLoading(true);
        try {
            const [jobsRes, catRes] = await Promise.all([
                jobAPI.getAll(filter),
                jobAPI.getCategories()
            ]);
            setJobs(jobsRes.data.data || []);
            setCategories(catRes.data.data || []);
        } catch {
            setError('Failed to load jobs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const resetForm = () => {
        setForm({ categoryId: '', jobTitle: '', jobDescription: '', city: '', district: '', urgencyLevel: 'standard', budgetMin: '', budgetMax: '', preferredStartDate: '' });
        setEditingJob(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingJob) {
                await jobAPI.update(editingJob.jobId, form);
                alert('Job updated!');
            } else {
                await jobAPI.create({ ...form, categoryId: parseInt(form.categoryId) });
                alert('Job posted!');
            }
            resetForm();
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save job');
        }
    };

    const handleDelete = async (jobId) => {
        if (!confirm('Delete this job?')) return;
        try {
            await jobAPI.delete(jobId);
            load();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed'));
        }
    };

    const startEdit = (job) => {
        setForm({
            categoryId: job.category?.categoryId || '',
            jobTitle: job.jobTitle, jobDescription: job.jobDescription,
            city: job.city || '', district: job.district || '',
            urgencyLevel: job.urgencyLevel || 'standard',
            budgetMin: job.budgetMin || '', budgetMax: job.budgetMax || '',
            preferredStartDate: job.preferredStartDate || ''
        });
        setEditingJob(job);
        setShowForm(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">📋 Jobs</h1>
                    <p className="text-slate-500 text-sm">Browse and post job opportunities</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow"
                >
                    + Post Job
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6">
                <input
                    type="text" placeholder="District..." value={filter.district}
                    onChange={e => setFilter({ ...filter, district: e.target.value })}
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                    value={filter.categoryId}
                    onChange={e => setFilter({ ...filter, categoryId: e.target.value })}
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                </select>
                <button onClick={load} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                    Filter
                </button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">{error}</div>}

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : jobs.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                    <div className="text-5xl mb-3">📋</div>
                    <p className="text-slate-500">No active jobs found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {jobs.map(job => (
                        <div key={job.jobId} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-slate-800 text-base">{job.jobTitle}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${URGENCY_COLORS[job.urgencyLevel] || 'bg-gray-100 text-gray-600'}`}>
                                            {job.urgencyLevel}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{job.jobStatus}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{job.jobDescription}</p>
                                    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                                        {job.district && <span>📍 {job.city ? `${job.city}, ` : ''}{job.district}</span>}
                                        {job.category && <span>🏷 {job.category.categoryName}</span>}
                                        {job.budgetMin && <span>💰 LKR {job.budgetMin} – {job.budgetMax}</span>}
                                        {job.preferredStartDate && <span>📆 {job.preferredStartDate}</span>}
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button onClick={() => startEdit(job)} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm transition-colors">Edit</button>
                                    <button onClick={() => handleDelete(job.jobId)} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm transition-colors">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-5">{editingJob ? 'Edit Job' : 'Post a New Job'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                                <select required value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select category</option>
                                    {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Job Title</label>
                                <input required value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })}
                                    placeholder="e.g. Fix plumbing in bathroom"
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                                <textarea required value={form.jobDescription} onChange={e => setForm({ ...form, jobDescription: e.target.value })}
                                    rows={3} placeholder="Describe the work needed..."
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">City</label>
                                    <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">District</label>
                                    <input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Urgency</label>
                                <select value={form.urgencyLevel} onChange={e => setForm({ ...form, urgencyLevel: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    {['emergency', 'urgent', 'standard', 'scheduled'].map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Budget Min (LKR)</label>
                                    <input type="number" value={form.budgetMin} onChange={e => setForm({ ...form, budgetMin: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Budget Max (LKR)</label>
                                    <input type="number" value={form.budgetMax} onChange={e => setForm({ ...form, budgetMax: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Preferred Date</label>
                                <input type="date" value={form.preferredStartDate} onChange={e => setForm({ ...form, preferredStartDate: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex gap-3 mt-2">
                                <button type="submit" className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-700 transition-colors">
                                    {editingJob ? 'Update Job' : 'Post Job'}
                                </button>
                                <button type="button" onClick={resetForm} className="flex-1 bg-slate-100 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-200 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
