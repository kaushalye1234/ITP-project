import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { workerAPI, authAPI } from '../api';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [workerProfile, setWorkerProfile] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
    const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user?.role === 'worker') {
            workerAPI.getMe()
                .then(res => {
                    const p = res.data.data;
                    setWorkerProfile(p);
                    setEditForm({
                        firstName: p.firstName || '', lastName: p.lastName || '',
                        bio: p.bio || '', city: p.city || '', district: p.district || '',
                        hourlyRateMin: p.hourlyRateMin || '', hourlyRateMax: p.hourlyRateMax || '',
                    });
                })
                .catch(() => {})
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user?.role]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true); setMsg({ type: '', text: '' });
        try {
            await workerAPI.updateMe({
                ...editForm,
                hourlyRateMin: editForm.hourlyRateMin ? parseFloat(editForm.hourlyRateMin) : null,
                hourlyRateMax: editForm.hourlyRateMax ? parseFloat(editForm.hourlyRateMax) : null,
            });
            setMsg({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
        } finally { setSaving(false); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwMsg({ type: '', text: '' });
        if (pwForm.newPw !== pwForm.confirm) {
            setPwMsg({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        if (pwForm.newPw.length < 6) {
            setPwMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }
        try {
            await authAPI.resetPassword(null, pwForm.newPw);
            setPwMsg({ type: 'success', text: 'Password changed successfully!' });
            setPwForm({ current: '', newPw: '', confirm: '' });
        } catch {
            setPwMsg({ type: 'error', text: 'Failed to change password. Use forgot password if needed.' });
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) return;
        try {
            await workerAPI.deleteMe();
            logout();
            navigate('/');
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed to delete account.'));
        }
    };

    const emailName = user?.email?.split('@')[0] || 'User';

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">👤 My Profile</h1>
                    <p className="page-subtitle">Manage your account and preferences</p>
                </div>
            </div>

            {/* Account Info */}
            <div className="hm-card" style={{ padding: 24, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="avatar" style={{ width: 64, height: 64, fontSize: 22 }}>
                        {emailName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0c4a6e', marginBottom: 4 }}>{user?.email}</h2>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span className="badge badge-teal" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
                            <span className="badge badge-gray">User ID: #{user?.userId}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Worker Profile Edit */}
            {user?.role === 'worker' && (
                <div className="hm-card" style={{ padding: 24, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0c4a6e', marginBottom: 16 }}>Worker Profile</h3>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#0891b2' }}><span className="spinner" /> Loading...</div>
                    ) : (
                        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label className="hm-label">First Name</label>
                                    <input className="hm-input" value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="hm-label">Last Name</label>
                                    <input className="hm-input" value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="hm-label">Bio</label>
                                <textarea className="hm-input" rows={3} style={{ resize: 'vertical' }} value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label className="hm-label">City</label>
                                    <input className="hm-input" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} />
                                </div>
                                <div>
                                    <label className="hm-label">District</label>
                                    <input className="hm-input" value={editForm.district} onChange={e => setEditForm({ ...editForm, district: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label className="hm-label">Hourly Rate Min (LKR)</label>
                                    <input className="hm-input" type="number" value={editForm.hourlyRateMin} onChange={e => setEditForm({ ...editForm, hourlyRateMin: e.target.value })} />
                                </div>
                                <div>
                                    <label className="hm-label">Hourly Rate Max (LKR)</label>
                                    <input className="hm-input" type="number" value={editForm.hourlyRateMax} onChange={e => setEditForm({ ...editForm, hourlyRateMax: e.target.value })} />
                                </div>
                            </div>
                            {msg.text && <div className={msg.type === 'success' ? 'alert-success' : 'alert-error'}>{msg.text}</div>}
                            <button type="submit" className="btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Change Password */}
            <div className="hm-card" style={{ padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0c4a6e', marginBottom: 16 }}>Change Password</h3>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
                    <div>
                        <label className="hm-label">Current Password</label>
                        <input className="hm-input" type="password" value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} />
                    </div>
                    <div>
                        <label className="hm-label">New Password</label>
                        <input className="hm-input" type="password" required minLength={6} value={pwForm.newPw} onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })} />
                    </div>
                    <div>
                        <label className="hm-label">Confirm New Password</label>
                        <input className="hm-input" type="password" required value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
                    </div>
                    {pwMsg.text && <div className={pwMsg.type === 'success' ? 'alert-success' : 'alert-error'}>{pwMsg.text}</div>}
                    <button type="submit" className="btn-secondary" style={{ alignSelf: 'flex-start' }}>Update Password</button>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="hm-card" style={{ padding: 24, border: '1.5px solid #fecaca' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ef4444', marginBottom: 8 }}>Danger Zone</h3>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                    Permanently delete your account. This action cannot be undone.
                </p>
                <button className="btn-danger" onClick={handleDeleteAccount}>Delete My Account</button>
            </div>
        </div>
    );
}
