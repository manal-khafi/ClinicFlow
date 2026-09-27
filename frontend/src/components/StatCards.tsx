import { Users, CalendarCheck, Clock, CheckCircle2 } from 'lucide-react';
import { Skeleton } from './ui/Skeleton';
import { DashboardStats } from '../api/dashboard.api';

interface StatCardsProps {
  stats: DashboardStats | null;
  loading?: boolean;
}

export default function StatCards({ stats, loading }: StatCardsProps) {
  const STATS = [
    {
      label: 'Total Patients',
      value: stats?.totalPatients,
      change: '+12 this month',
      icon: Users,
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
    },
    {
      label: "Today's Appointments",
      value: stats?.todaysAppointments,
      change: '3 remaining',
      icon: CalendarCheck,
      iconBg: '#DBEAFE',
      iconColor: '#2563EB',
    },
    {
      label: 'Pending',
      value: stats?.pending,
      change: 'Needs confirmation',
      icon: Clock,
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
    },
    {
      label: 'Confirmed',
      value: stats?.confirmed,
      change: 'For today',
      icon: CheckCircle2,
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {STATS.map(({ label, value, change, icon: Icon, iconBg, iconColor }) => (
        <div
          key={label}
          className="bg-white rounded-2xl p-5 shadow-sm border border-[#E7F0EA] flex flex-col gap-3 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: iconBg }}
            >
              <Icon size={20} color={iconColor} strokeWidth={2} />
            </div>
          </div>
          <div>
            {loading || value === undefined ? (
              <Skeleton className="mb-1" style={{ width: 48, height: 30 }} />
            ) : (
              <p className="text-3xl font-bold text-[#14532D] leading-none mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {value}
              </p>
            )}
            <p className="text-sm font-medium text-[#6B7280]">{label}</p>
          </div>
          <p className="text-xs text-[#10B981] font-medium">{change}</p>
        </div>
      ))}
    </div>
  );
}
