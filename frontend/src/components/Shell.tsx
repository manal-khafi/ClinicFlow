import { ReactNode } from 'react';
import {
  Bell, Search, ChevronDown, Menu, LayoutDashboard, Users,
  CalendarDays, UserCog, Plus
} from 'lucide-react';
import Sidebar from './Sidebar';
import { UserRole } from '../data';

export type ViewMode = 'desktop' | 'mobile';

interface ShellProps {
  viewMode: ViewMode;
  activeNav: string;
  onNav: (nav: string) => void;
  userRole: UserRole;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  mobileChildren?: ReactNode;
  onFab?: () => void;
}

const MOBILE_TABS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'patients',     label: 'Patients',     icon: Users },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'users',        label: 'Users',        icon: UserCog },
];

export default function Shell({
  viewMode, activeNav, onNav, userRole,
  title, subtitle, actions, children, mobileChildren, onFab,
}: ShellProps) {
  const isAdmin = userRole === 'admin';

  if (viewMode === 'desktop') {
    return (
      <div className="flex" style={{ minHeight: 'calc(100vh - 49px)', fontFamily: "'Inter', sans-serif" }}>
        <Sidebar activeNav={activeNav} onNav={onNav} userRole={userRole} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Top bar */}
          <header className="bg-white border-b border-[#E7F0EA] flex items-center justify-between px-8 py-4 flex-shrink-0">
            <div>
              <h1 className="text-xl font-semibold text-[#14532D]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {title}
              </h1>
              {subtitle && <p className="text-xs text-[#9CA3AF] mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 bg-[#F6FBF7] border border-[#E7F0EA] rounded-xl px-4 py-2.5 w-64">
                <Search size={15} className="text-[#9CA3AF] flex-shrink-0" />
                <input className="bg-transparent outline-none text-sm text-[#374151] placeholder:text-[#9CA3AF] w-full" placeholder="Search..." />
              </div>
              <button className="relative w-10 h-10 bg-white border border-[#E7F0EA] rounded-xl flex items-center justify-center hover:bg-[#F6FBF7] transition-colors shadow-sm">
                <Bell size={17} color="#374151" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ background: '#16A34A' }}>3</span>
              </button>
              <button className="flex items-center gap-2.5 bg-white border border-[#E7F0EA] rounded-xl px-3 py-2 hover:bg-[#F6FBF7] transition-colors shadow-sm">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg,#16A34A,#10B981)' }}>DR</div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-[#14532D] leading-tight">Dr. Rachel Kim</p>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: '#DCFCE7', color: '#15803D' }}>
                    {isAdmin ? 'Admin' : 'Staff'}
                  </span>
                </div>
                <ChevronDown size={13} color="#9CA3AF" />
              </button>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          </header>
          <main className="flex-1 overflow-y-auto scroll-visible p-8">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Mobile phone frame
  const tabs = isAdmin ? MOBILE_TABS : MOBILE_TABS.filter(t => t.id !== 'users');
  return (
    <div className="flex items-start justify-center py-8 px-4 min-h-[calc(100vh-49px)]" style={{ background: '#E5EDE8' }}>
      <div className="relative" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="absolute inset-0 rounded-[36px] pointer-events-none z-20" style={{ boxShadow: '0 0 0 8px #1a2e22, 0 32px 80px rgba(0,0,0,0.3)' }} />
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-[#1a2e22] rounded-full pointer-events-none" style={{ width: 120, height: 34 }} />

        <div className="relative flex flex-col bg-[#F3F7F5] overflow-hidden" style={{ width: 390, height: 844, borderRadius: 32 }}>
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-4 pb-1 flex-shrink-0">
            <span className="text-xs font-semibold text-[#374151]">9:41</span>
            <div className="w-4 h-2 rounded-sm border border-[#374151] relative">
              <div className="absolute left-0.5 top-0.5 bottom-0.5 w-2/3 rounded-sm" style={{ background: '#16A34A' }} />
            </div>
          </div>

          {/* Mobile top bar */}
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
            <button className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#E7F0EA]">
              <Menu size={18} color="#374151" />
            </button>
            <h1 className="text-base font-semibold text-[#14532D]" style={{ fontFamily: "'Poppins', sans-serif" }}>{title}</h1>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#E7F0EA] relative">
                <Bell size={16} color="#374151" />
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ background: '#16A34A' }}>3</span>
              </button>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#16A34A,#10B981)' }}>DR</div>
            </div>
          </div>

          {/* Page content */}
          <div className="flex-1 overflow-y-auto scrollable pb-24 px-4">
            {mobileChildren ?? children}
          </div>

          {/* FAB */}
          {onFab && (
            <button onClick={onFab} className="absolute bottom-20 right-5 w-14 h-14 rounded-full flex items-center justify-center z-10 transition-transform hover:scale-105 active:scale-95" style={{ background: 'linear-gradient(135deg,#16A34A,#10B981)', boxShadow: '0 8px 24px rgba(22,163,74,0.4)' }}>
              <Plus size={24} color="#fff" strokeWidth={2.5} />
            </button>
          )}

          {/* Bottom tab bar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center bg-white border-t border-[#E7F0EA]" style={{ height: 72 }}>
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = activeNav === id;
              return (
                <button key={id} onClick={() => onNav(id)} className="flex-1 flex flex-col items-center justify-center gap-0.5 pt-2">
                  <Icon size={20} color={active ? '#16A34A' : '#9CA3AF'} strokeWidth={active ? 2.5 : 2} />
                  <span className="text-[10px] font-semibold" style={{ color: active ? '#16A34A' : '#9CA3AF' }}>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
