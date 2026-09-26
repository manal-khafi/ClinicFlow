import { useState } from 'react';
import { LogOut } from 'lucide-react';

import { ToastProvider } from './context/ToastContext';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './router/ProtectedRoute';
import Shell from './components/Shell';
import LoginPage from './screens/LoginPage';
import DashboardPage from './screens/DashboardPage';
import PatientsListPage from './screens/PatientsListPage';
import PatientDetailsPage from './screens/PatientDetailsPage';
import AppointmentsPage from './screens/AppointmentsPage';
import UsersPage, { AccessDeniedPage } from './screens/UsersPage';
import { UserRole } from './data';

type Screen = 'dashboard' | 'patients' | 'patient-details' | 'appointments' | 'users';

// Map nav ids to Screen
const NAV_SCREEN: Record<string, Screen> = {
  dashboard: 'dashboard',
  patients: 'patients',
  appointments: 'appointments',
  users: 'users',
};

// Screen display info
const SCREEN_META: Record<Screen, { title: string; subtitle?: string }> = {
  dashboard:       { title: 'Dashboard', subtitle: 'Thursday, September 24, 2026' },
  patients:        { title: 'Patients' },
  'patient-details': { title: 'Patient Details' },
  appointments:    { title: 'Appointments' },
  users:           { title: 'Users' },
};

function AppContent() {
  const { user, logout } = useAuth();
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  function handleNav(nav: string) {
    setActiveNav(nav);
    const target = NAV_SCREEN[nav];
    if (target) setScreen(target);
  }

  function handleViewPatient(id: string) {
    setSelectedPatientId(id);
    setScreen('patient-details');
  }

  function handleBackToPatients() {
    setScreen('patients');
    setActiveNav('patients');
  }

  function renderContent(userRole: UserRole) {
    if (screen === 'dashboard') return <DashboardPage />;
    if (screen === 'patients') return <PatientsListPage userRole={userRole} onViewPatient={handleViewPatient} />;
    if (screen === 'patient-details' && selectedPatientId) {
      return (
        <PatientDetailsPage
          patientId={selectedPatientId}
          userRole={userRole}
          onBack={handleBackToPatients}
          onNewAppointment={() => { setActiveNav('appointments'); setScreen('appointments'); }}
        />
      );
    }
    if (screen === 'appointments') return <AppointmentsPage userRole={userRole} onGoToDashboard={() => handleNav('dashboard')} />;
    if (screen === 'users') {
      if (userRole !== 'admin') return <AccessDeniedPage onBack={() => handleNav('dashboard')} />;
      return <UsersPage userRole={userRole} />;
    }
    return null;
  }

  return (
    <ProtectedRoute fallback={<LoginPage />}>
      {user && (
        <div style={{ fontFamily: "'Inter', sans-serif" }}>
          <Shell
            activeNav={activeNav}
            onNav={handleNav}
            userRole={user.role}
            title={SCREEN_META[screen].title}
            subtitle={SCREEN_META[screen].subtitle}
            onFab={screen !== 'patient-details' ? () => {} : undefined}
            actions={
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#E7F0EA] text-[#6B7280] transition-all hover:bg-[#FEF2F2] hover:text-[#DC2626] hover:border-[#FCA5A5]"
              >
                <LogOut size={12} />
                Sign out
              </button>
            }
          >
            {renderContent(user.role)}
          </Shell>
        </div>
      )}
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
