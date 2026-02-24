import { useState } from 'react';
import { useAuth } from '../AuthContext';

export default function LoginPage({ onSwitchToRegister }) {
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [forgotMode, setForgotMode] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotMsg, setForgotMsg] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form.email, form.password);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        try {
            const { authAPI } = await import('../api');
            const res = await authAPI.forgotPassword(forgotEmail);
            setForgotMsg(res.data.data || res.data.message);
        } catch (err) {
            setForgotMsg('Error: ' + (err.response?.data?.message || 'Something went wrong'));
        }
    };

    if (forgotMode) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Reset Password</h2>
                    <p className="text-slate-500 mb-6 text-sm">Enter your email and we'll send a reset link.</p>
                    <form onSubmit={handleForgot} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email address"
                            value={forgotEmail}
                            onChange={e => setForgotEmail(e.target.value)}
                            required
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Send Reset Link
                        </button>
                        {forgotMsg && (
                            <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl p-3 text-sm break-all">
                                {forgotMsg}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => setForgotMode(false)}
                            className="w-full text-slate-500 hover:text-slate-700 text-sm"
                        >
                            ← Back to Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Branding */}
                <div className="text-center mb-8">
                    <div className="bg-indigo-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg">S</div>
                    <h1 className="text-3xl font-extrabold text-slate-800">SkillConnect</h1>
                    <p className="text-slate-500 mt-1">On-Demand Skilled Worker Platform</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Welcome back</h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                                placeholder="you@example.com"
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                                placeholder="········"
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button type="button" onClick={() => setForgotMode(true)} className="text-indigo-600 text-sm hover:underline">
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-md"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                        <div className="flex items-center my-2">
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="px-2 text-xs text-slate-400 uppercase">or</span>
                            <div className="flex-1 h-px bg-slate-200" />
                        </div>
                        <button
                            type="button"
                            onClick={() => alert('Google login is not yet configured in this demo.')}
                            className="w-full border border-slate-200 bg-white text-slate-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="text-lg">G</span>
                            <span>Continue with Google</span>
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Don't have an account?{' '}
                        <button onClick={onSwitchToRegister} className="text-indigo-600 font-semibold hover:underline">
                            Create one
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
