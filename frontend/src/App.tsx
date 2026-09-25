import { useState } from 'react';
import { UserCog } from 'lucide-react';

import { ToastProvider } from './context/ToastContext';
import Shell from './components/Shell';
import LoginPage from './screens/LoginPage';
import DashboardPage from './screens/DashboardPage';
import PatientsListPage from './screens/PatientsListPage';
import PatientDetailsPage from './screens/PatientDetailsPage';
import AppointmentsPage from './screens/AppointmentsPage';
import UsersPage, { AccessDeniedPage } from './screens/UsersPage';
import { Patient, UserRole } from './data';

type Screen = 'login' | 'dashboard' | 'patients' | 'patient-details' | 'appointments' | 'users';

// Map nav ids to Screen
const NAV_SCREEN: Record<string, Screen> = {
  dashboard: 'dashboard',
  patients: 'patients',
  appointments: 'appointments',
  users: 'users',
};

// Screen display info
const SCREEN_META: Record<Screen, { title: string; subtitle?: string }> = {
  login:           { title: 'ClinicFlow' },
  dashboard:       { title: 'Dashboard', subtitle: 'Thursday, September 24, 2026' },
  patients:        { title: 'Patients' },
  'patient-details': { title: 'Patient Details' },
  appointments:    { title: 'Appointments' },
  users:           { title: 'Users' },
};

function AppContent() {
  const [screen, setScreen] = useState<Screen>('login');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  function handleNav(nav: string) {
    setActiveNav(nav);
    const target = NAV_SCREEN[nav];
    if (target) setScreen(target);
  }

  function handleLogin(role: UserRole) {
    setUserRole(role);
    setScreen('dashboard');
    setActiveNav('dashboard');
  }

  function handleViewPatient(id: string) {
    setSelectedPatientId(id);
    setScreen('patient-details');
  }

  function handleBackToPatients() {
    setScreen('patients');
    setActiveNav('patients');
  }

  // TODO: replace with real API call
  const PATIENTS: Patient[] = [];
  const patient = selectedPatientId ? PATIENTS.find(p => p.id === selectedPatientId) ?? null : null;

  // Login is outside the shell
  if (screen === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Render the shell-wrapped page content
  const meta = SCREEN_META[screen];

  function renderContent() {
    if (screen === 'dashboard') return <DashboardPage />;
    if (screen === 'patients') return <PatientsListPage userRole={userRole} onViewPatient={handleViewPatient} />;
    if (screen === 'patient-details' && patient) {
      return (
        <PatientDetailsPage
          patient={patient}
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
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Shell
        activeNav={activeNav}
        onNav={handleNav}
        userRole={userRole}
        title={meta.title}
        subtitle={meta.subtitle}
        onFab={screen !== 'patient-details' ? () => {} : undefined}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9CA3AF]">Role:</span>
            <button
              onClick={() => setUserRole(r => r === 'admin' ? 'staff' : 'admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
              style={{
                background: userRole === 'admin' ? '#14532D' : '#ECFDF5',
                color: userRole === 'admin' ? '#fff' : '#16A34A',
                borderColor: userRole === 'admin' ? '#14532D' : '#D1FAE5',
              }}
            >
              <UserCog size={12} />
              {userRole === 'admin' ? 'Admin' : 'Staff'} (click to toggle)
            </button>
          </div>
        }
      >
        {renderContent()}
      </Shell>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
