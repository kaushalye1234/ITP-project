import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const FEATURES = [
    { icon: '👷', text: 'Hire verified skilled workers' },
    { icon: '📅', text: 'Easy online booking & scheduling' },
    { icon: '⭐', text: 'Trusted reviews & ratings' },
    { icon: '🔧', text: 'Rent tools & equipment' },
];

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, googleLogin } = useAuth();
    const googleBtnRef = useRef(null);
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [forgotMode, setForgotMode] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotMsg, setForgotMsg] = useState('');

    const handleGoogleResponse = async (response) => {
        setError(''); setLoading(true);
        try { await googleLogin(response.credential); }
        catch (err) { setError(err.response?.data?.message || 'Google login failed.'); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID || !window.google?.accounts) return;
        window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleResponse });
        if (googleBtnRef.current) {
            window.google.accounts.id.renderButton(googleBtnRef.current, { theme: 'outline', size: 'large', shape: 'pill', width: '100%' });
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try { await login(form.email, form.password); }
        catch (err) { setError(err.response?.data?.message || 'Login failed. Check your credentials.'); }
        finally { setLoading(false); }
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        try {
            const { authAPI } = await import('../api');
            const res = await authAPI.forgotPassword(forgotEmail);
            setForgotMsg(res.data.data || res.data.message);
        } catch (err) { setForgotMsg('Error: ' + (err.response?.data?.message || 'Something went wrong')); }
    };

    /* ── Forgot password overlay ── */
    if (forgotMode) return (
        <div className="auth-shell">
            {/* Left panel */}
            <div className="auth-panel-left">
                <div style={{ fontSize: 56, marginBottom: 16 }}>🔑</div>
                <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Forgot Password?</h2>
                <p style={{ opacity: 0.85, fontSize: 14, textAlign: 'center', maxWidth: 280 }}>
                    No worries! We'll send you a reset link to your email address.
                </p>
            </div>
            {/* Right panel */}
            <div className="auth-panel-right">
                <div style={{ width: '100%', maxWidth: 400 }}>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0c4a6e', marginBottom: 6 }}>Reset Password</h3>
                    <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Enter your email to receive a reset link.</p>
                    <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label className="hm-label">Email Address</label>
                            <input className="hm-input" type="email" placeholder="you@example.com"
                                value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            Send Reset Link
                        </button>
                        {forgotMsg && <div className="alert-info">{forgotMsg}</div>}
                        <button type="button" onClick={() => setForgotMode(false)}
                            style={{ background: 'none', border: 'none', color: '#0891b2', fontSize: 13, fontWeight: 600, cursor: 'pointer', paddingTop: 4 }}>
                            ← Back to Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

    /* ── Main login ── */
    return (
        <div className="auth-shell">
            {/* Left panel — branding */}
            <div className="auth-panel-left">
                <div style={{
                    width: 68, height: 68,
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: 20, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 32, fontWeight: 900,
                    marginBottom: 20, backdropFilter: 'blur(4px)'
                }}>S</div>
                <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 6, letterSpacing: '-0.5px' }}>SkillConnect</h1>
                <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 36, textAlign: 'center' }}>
                    Sri Lanka's #1 On-Demand Skilled Worker Platform
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 280 }}>
                    {FEATURES.map(f => (
                        <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                            <span style={{ fontSize: 13, opacity: 0.9 }}>{f.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right panel — form */}
            <div className="auth-panel-right">
                <div style={{ width: '100%', maxWidth: 400 }} className="fade-in">
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0c4a6e', marginBottom: 4 }}>Welcome back!</h2>
                    <p style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}>Sign in to your SkillConnect account.</p>

                    {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label className="hm-label">Email Address</label>
                            <input className="hm-input" type="email" placeholder="you@example.com"
                                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div>
                            <label className="hm-label">Password</label>
                            <input className="hm-input" type="password" placeholder="········"
                                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <button type="button" onClick={() => setForgotMode(true)}
                                style={{ background: 'none', border: 'none', color: '#0891b2', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                Forgot password?
                            </button>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
                            {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in...</> : 'Sign In →'}
                        </button>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ flex: 1, height: 1, background: '#e0f2fe' }} />
                            <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>or</span>
                            <div style={{ flex: 1, height: 1, background: '#e0f2fe' }} />
                        </div>

                        {GOOGLE_CLIENT_ID ? (
                            <div ref={googleBtnRef} style={{ display: 'flex', justifyContent: 'center' }} />
                        ) : (
                            <button type="button"
                                onClick={() => alert('Set VITE_GOOGLE_CLIENT_ID in .env to enable Google login.')}
                                style={{
                                    width: '100%', padding: '11px', borderRadius: 10,
                                    border: '1.5px solid #e0f2fe', background: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: 10, fontSize: 14, fontWeight: 600, color: '#0c4a6e', cursor: 'pointer'
                                }}>
                                <span style={{ fontSize: 18 }}>G</span> Continue with Google
                            </button>
                        )}
                    </form>

                    <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 24 }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: '#0891b2', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                            Create one →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
