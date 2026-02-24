import { useState } from 'react';
import { useAuth } from './AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import JobsPage from './pages/JobsPage';
import BookingsPage from './pages/BookingsPage';
import ReviewsPage from './pages/ReviewsPage';
import EquipmentPage from './pages/EquipmentPage';
import WorkersPage from './pages/WorkersPage';
import Navbar from './components/Navbar';

function App() {
  const { user } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login');

  if (!user) {
    return authMode === 'login'
      ? <LoginPage onSwitchToRegister={() => setAuthMode('register')} />
      : <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />;
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard setPage={setPage} />;
      case 'jobs': return <JobsPage />;
      case 'bookings': return <BookingsPage />;
      case 'reviews': return <ReviewsPage />;
      case 'equipment': return <EquipmentPage />;
      case 'workers': return <WorkersPage />;
      default: return <Dashboard setPage={setPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar currentPage={page} setPage={setPage} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
