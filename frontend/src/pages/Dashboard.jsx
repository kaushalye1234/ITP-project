import { useAuth } from '../AuthContext';

const stats = [
    { label: 'Workers Available', value: '200+', icon: '👷', color: 'indigo' },
    { label: 'Jobs Posted', value: '500+', icon: '📋', color: 'orange' },
    { label: 'Bookings Done', value: '1.2K+', icon: '📅', color: 'green' },
    { label: 'Equipment Items', value: '100+', icon: '🔧', color: 'purple' },
];

const MODULES = [
    { key: 'workers', label: 'Find Workers', desc: 'Browse skilled professionals in your area', icon: '👷', color: 'bg-indigo-500', roles: ['customer', 'admin'] },
    { key: 'jobs', label: 'Post a Job', desc: 'Create and manage your job listings', icon: '📋', color: 'bg-orange-500', roles: ['customer', 'admin'] },
    { key: 'bookings', label: 'My Bookings', desc: 'Track and manage your service bookings', icon: '📅', color: 'bg-green-500', roles: ['customer', 'worker', 'supplier', 'admin'] },
    { key: 'reviews', label: 'Reviews & Disputes', desc: 'Rate workers and submit complaints', icon: '⭐', color: 'bg-yellow-500', roles: ['customer', 'worker', 'admin'] },
    { key: 'equipment', label: 'Rent Equipment', desc: 'Browse and rent tools & equipment', icon: '🔧', color: 'bg-purple-500', roles: ['customer', 'supplier', 'admin'] },
];

export default function Dashboard({ setPage }) {
    const { user } = useAuth();

    return (
        <div>
            {/* Hero */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-8 mb-8 text-white shadow-xl">
                <p className="text-indigo-200 text-sm font-medium mb-1 uppercase tracking-wider">Welcome back</p>
                <h1 className="text-3xl font-extrabold mb-2">Hello, {user?.email?.split('@')[0]} 👋</h1>
                <p className="text-indigo-200 capitalize">Logged in as: <span className="font-semibold text-white">{user?.role}</span></p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="text-3xl mb-2">{s.icon}</div>
                        <div className="text-2xl font-extrabold text-slate-800">{s.value}</div>
                        <div className="text-sm text-slate-500 mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Module Cards */}
            <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Access</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MODULES.filter(m => !m.roles || m.roles.includes(user?.role)).map((m) => (
                    <button
                        key={m.key}
                        onClick={() => setPage(m.key)}
                        className="text-left bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                    >
                        <div className={`${m.color} text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                            {m.icon}
                        </div>
                        <h3 className="font-bold text-slate-800 text-base mb-1">{m.label}</h3>
                        <p className="text-sm text-slate-500">{m.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
