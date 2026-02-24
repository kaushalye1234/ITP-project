import { useAuth } from '../AuthContext';

const BASE_NAV_ITEMS = [
    { key: 'dashboard', label: '🏠 Dashboard' },
    { key: 'workers', label: '👷 Workers' },
    { key: 'jobs', label: '📋 Jobs' },
    { key: 'bookings', label: '📅 Bookings' },
    { key: 'reviews', label: '⭐ Reviews' },
    { key: 'equipment', label: '🔧 Equipment' },
];

function getNavItemsForRole(role) {
    switch (role) {
        case 'customer':
            return BASE_NAV_ITEMS;
        case 'worker':
            return BASE_NAV_ITEMS.filter(item => item.key !== 'workers'); // workers list less relevant
        case 'supplier':
            return BASE_NAV_ITEMS.filter(item => ['dashboard', 'bookings', 'equipment'].includes(item.key));
        case 'admin':
            return BASE_NAV_ITEMS;
        default:
            return BASE_NAV_ITEMS;
    }
}

export default function Navbar({ currentPage, setPage }) {
    const { user, logout } = useAuth();
    const items = getNavItemsForRole(user?.role);

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg">
                        S
                    </div>
                    <span className="font-bold text-slate-800 text-lg hidden sm:block">SkillConnect</span>
                </div>

                {/* Nav Links */}
                <nav className="flex items-center gap-1">
                    {items.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setPage(item.key)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${currentPage === item.key
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* User info & logout */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-800">{user?.email}</span>
                        <span className="text-xs capitalize text-indigo-600 font-medium">{user?.role}</span>
                    </div>
                    <button
                        onClick={logout}
                        className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
