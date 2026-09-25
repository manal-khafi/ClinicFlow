import { useState, type ReactNode } from 'react';
import { Monitor, Smartphone, UserCog } from 'lucide-react';

import { ToastProvider } from './context/ToastContext';
import Shell, { ViewMode } from './components/Shell';
import LoginPage from './screens/LoginPage';
import DashboardPage from './screens/DashboardPage';
import PatientsListPage from './screens/PatientsListPage';
import PatientDetailsPage from './screens/PatientDetailsPage';
import AppointmentsPage from './screens/AppointmentsPage';
import UsersPage, { AccessDeniedPage } from './screens/UsersPage';
import { PATIENTS, UserRole } from './data';

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
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
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

  const isMobile = viewMode === 'mobile';
  const patient = selectedPatientId ? PATIENTS.find(p => p.id === selectedPatientId) ?? null : null;

  // Login is outside the shell
  if (screen === 'login') {
    return (
      <>
        {/* View switcher */}
        <ViewSwitcher viewMode={viewMode} onChange={setViewMode} />
        {isMobile ? (
          <div className="flex items-start justify-center py-8 px-4 min-h-[calc(100vh-49px)]" style={{ background: '#E5EDE8' }}>
            <div className="relative">
              <div className="absolute inset-0 rounded-[36px] pointer-events-none z-20" style={{ boxShadow: '0 0 0 8px #1a2e22, 0 32px 80px rgba(0,0,0,0.3)' }} />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-[#1a2e22] rounded-full pointer-events-none" style={{ width: 120, height: 34 }} />
              <div className="relative overflow-hidden" style={{ width: 390, height: 844, borderRadius: 32, background: '#F3F7F5' }}>
                <div className="overflow-y-auto scrollable h-full">
                  <LoginPage onLogin={handleLogin} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
      </>
    );
  }

  // Render the shell-wrapped page content
  const meta = SCREEN_META[screen];

  function renderContent() {
    if (screen === 'dashboard') return <DashboardPage isMobile={isMobile} />;
    if (screen === 'patients') return <PatientsListPage isMobile={isMobile} userRole={userRole} onViewPatient={handleViewPatient} />;
    if (screen === 'patient-details' && patient) {
      return (
        <PatientDetailsPage
          patient={patient}
          isMobile={isMobile}
          userRole={userRole}
          onBack={handleBackToPatients}
          onNewAppointment={() => { setActiveNav('appointments'); setScreen('appointments'); }}
        />
      );
    }
    if (screen === 'appointments') return <AppointmentsPage isMobile={isMobile} userRole={userRole} onGoToDashboard={() => handleNav('dashboard')} />;
    if (screen === 'users') {
      if (userRole !== 'admin') return <AccessDeniedPage onBack={() => handleNav('dashboard')} />;
      return <UsersPage isMobile={isMobile} userRole={userRole} />;
    }
    return null;
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <ViewSwitcher viewMode={viewMode} onChange={setViewMode} extraContent={
        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-[#E7F0EA]">
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
      } />
      <Shell
        viewMode={viewMode}
        activeNav={activeNav}
        onNav={handleNav}
        userRole={userRole}
        title={meta.title}
        subtitle={meta.subtitle}
        onFab={isMobile && screen !== 'patient-details' ? () => {} : undefined}
      >
        {renderContent()}
      </Shell>
    </div>
  );
}

// ── View switcher bar ─────────────────────────────────────────────────────────
function ViewSwitcher({ viewMode, onChange, extraContent }: {
  viewMode: ViewMode;
  onChange: (v: ViewMode) => void;
  extraContent?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-center gap-2 py-3 border-b border-[#E7F0EA] bg-white sticky top-0 z-40">
      <span className="text-xs font-semibold text-[#9CA3AF] mr-1">Preview:</span>
      {([
        { id: 'desktop' as ViewMode, label: 'Desktop', Icon: Monitor },
        { id: 'mobile' as ViewMode, label: 'Mobile 390px', Icon: Smartphone },
      ]).map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border"
          style={{
            background: viewMode === id ? '#16A34A' : '#fff',
            color: viewMode === id ? '#fff' : '#6B7280',
            borderColor: viewMode === id ? '#16A34A' : '#E7F0EA',
          }}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}
      {extraContent}
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
