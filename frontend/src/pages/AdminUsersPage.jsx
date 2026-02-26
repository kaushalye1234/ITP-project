import { useState, useEffect } from 'react';
import { workerAPI, bookingAPI, reviewAPI, complaintAPI } from '../api';

const STATUS_COLORS = {
  true: 'bg-green-50 text-green-600',
  false: 'bg-red-50 text-red-600',
  pending: 'bg-yellow-50 text-yellow-600',
  investigating: 'bg-blue-50 text-blue-600',
  resolved: 'bg-green-50 text-green-600',
  rejected: 'bg-red-50 text-red-600',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('users');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, complaintsRes, reviewsRes] = await Promise.allSettled([
        workerAPI.getAllUsers(),
        complaintAPI.getAll(),
        reviewAPI.getAll(),
      ]);
      setUsers(usersRes.status === 'fulfilled' ? usersRes.value?.data?.data || [] : []);
      setComplaints(complaintsRes.status === 'fulfilled' ? complaintsRes.value?.data?.data || [] : []);
      setReviews(reviewsRes.status === 'fulfilled' ? reviewsRes.value?.data?.data || [] : []);
    } catch { /* non-critical */ }
    finally { setLoading(false); }
  };

  const handleToggleUser = async (userId) => {
    try {
      await workerAPI.toggleUser(userId);
      loadData();
    } catch { /* ignore */ }
  };

  const handleComplaintStatus = async (id, status) => {
    try {
      await complaintAPI.updateStatus(id, status);
      loadData();
    } catch { /* ignore */ }
  };

  const filteredUsers = roleFilter ? users.filter(u => u.role === roleFilter) : users;
  const totalCustomers = users.filter(u => u.role === 'customer').length;
  const totalWorkers = users.filter(u => u.role === 'worker').length;
  const totalSuppliers = users.filter(u => u.role === 'supplier').length;

  const TABS = [
    { key: 'users', label: 'Users', icon: 'group' },
    { key: 'complaints', label: 'Complaints', icon: 'report' },
    { key: 'reviews', label: 'Reviews', icon: 'star' },
  ];

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Monitor and manage platform activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: 'group', color: 'bg-[#13ecec]/10 text-[#0ea5a5]' },
          { label: 'Customers', value: totalCustomers, icon: 'person', color: 'bg-blue-50 text-blue-600' },
          { label: 'Workers', value: totalWorkers, icon: 'engineering', color: 'bg-orange-50 text-orange-600' },
          { label: 'Open Complaints', value: complaints.filter(c => c.complaintStatus === 'pending').length, icon: 'report', color: 'bg-red-50 text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <span className="material-symbols-outlined text-xl">{s.icon}</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="spinner" /></div>
      ) : (
        <>
          {/* Users Tab */}
          {tab === 'users' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">All Users ({filteredUsers.length})</h3>
                <select
                  value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:border-[#13ecec] outline-none"
                >
                  <option value="">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="worker">Worker</option>
                  <option value="supplier">Supplier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left p-4 font-semibold text-slate-600">User</th>
                      <th className="text-left p-4 font-semibold text-slate-600">Role</th>
                      <th className="text-left p-4 font-semibold text-slate-600">Status</th>
                      <th className="text-left p-4 font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.userId || u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#13ecec] to-[#0ea5a5] flex items-center justify-center text-white text-xs font-bold">
                              {(u.email || '').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-900">{u.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">{u.role}</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.isActive !== false ? STATUS_COLORS.true : STATUS_COLORS.false}`}>
                            {u.isActive !== false ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleUser(u.userId || u.id)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                              u.isActive !== false
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                          >
                            {u.isActive !== false ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Complaints Tab */}
          {tab === 'complaints' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">All Complaints ({complaints.length})</h3>
              </div>
              {complaints.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No complaints</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="text-left p-4 font-semibold text-slate-600">Category</th>
                        <th className="text-left p-4 font-semibold text-slate-600">Description</th>
                        <th className="text-left p-4 font-semibold text-slate-600">Priority</th>
                        <th className="text-left p-4 font-semibold text-slate-600">Status</th>
                        <th className="text-left p-4 font-semibold text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map(c => (
                        <tr key={c.complaintId || c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-medium text-slate-900 capitalize">{(c.complaintCategory || '').replace(/_/g, ' ')}</td>
                          <td className="p-4 text-slate-600 max-w-xs truncate">{c.complaintDescription || c.description}</td>
                          <td className="p-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              c.priority === 'urgent' || c.priority === 'high' ? 'bg-red-50 text-red-600' :
                              c.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-slate-100 text-slate-600'
                            }`}>{c.priority}</span>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[c.complaintStatus] || 'bg-slate-100 text-slate-600'}`}>
                              {c.complaintStatus}
                            </span>
                          </td>
                          <td className="p-4">
                            <select
                              value={c.complaintStatus}
                              onChange={e => handleComplaintStatus(c.complaintId || c.id, e.target.value)}
                              className="h-8 px-2 rounded-lg border border-slate-200 text-xs text-slate-700 focus:border-[#13ecec] outline-none"
                            >
                              <option value="pending">Pending</option>
                              <option value="investigating">Investigating</option>
                              <option value="resolved">Resolved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {tab === 'reviews' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">All Reviews ({reviews.length})</h3>
              </div>
              {reviews.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No reviews yet</div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {reviews.map(r => (
                    <div key={r.reviewId || r.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => (
                              <span key={i} className="material-symbols-outlined text-lg" style={{ color: i <= (r.overallRating || r.rating) ? '#f59e0b' : '#e2e8f0' }}>star</span>
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{r.overallRating || r.rating}/5</span>
                        </div>
                        <span className="text-xs text-slate-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                      <p className="text-sm text-slate-600">{r.reviewText || r.text || 'No comment'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
