import {
  LayoutDashboard, Users, CalendarDays, UserCog, LogOut,
  Activity
} from 'lucide-react';
import { UserRole } from '../data';

interface SidebarProps {
  activeNav: string;
  onNav: (nav: string) => void;
  userRole?: UserRole;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'users', label: 'Users', icon: UserCog, adminOnly: true },
];

export default function Sidebar({ activeNav, onNav, userRole = 'admin' }: SidebarProps) {
  const isAdmin = userRole === 'admin';
  return (
    <aside
      style={{ width: 240, minWidth: 240, background: '#fff', borderRight: '1px solid #E7F0EA' }}
      className="flex flex-col h-screen shadow-sm"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-[#E7F0EA]">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #16A34A 0%, #10B981 100%)' }}
        >
          <Activity size={16} color="#fff" strokeWidth={2.5} />
        </div>
        <span
          className="text-[18px] font-semibold tracking-tight"
          style={{ fontFamily: "'Poppins', sans-serif", color: '#14532D' }}
        >
          ClinicFlow
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.filter(i => !i.adminOnly || isAdmin).map(({ id, label, icon: Icon, adminOnly }) => {
          const isActive = activeNav === id;
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left"
              style={{
                background: isActive ? '#ECFDF5' : 'transparent',
                color: isActive ? '#16A34A' : '#4B5563',
                fontWeight: isActive ? 600 : 500,
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = '#F6FBF7';
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span>{label}</span>
              {adminOnly && (
                <span
                  className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: '#ECFDF5', color: '#16A34A' }}
                >
                  Admin
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-[#E7F0EA]">
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl mb-1" style={{ background: '#F6FBF7' }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #16A34A, #10B981)' }}
          >
            DR
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#14532D] truncate leading-tight">Dr. Rachel Kim</p>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: '#DCFCE7', color: '#15803D' }}
            >
              Admin
            </span>
          </div>
        </div>
        <button
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all"
          style={{ color: '#9CA3AF' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
