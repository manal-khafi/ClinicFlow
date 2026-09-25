import { Users, CalendarCheck, Clock, CheckCircle2 } from 'lucide-react';

const STATS = [
  {
    label: 'Total Patients',
    value: '1,284',
    change: '+12 this month',
    icon: Users,
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
  },
  {
    label: "Today's Appointments",
    value: '14',
    change: '3 remaining',
    icon: CalendarCheck,
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
  },
  {
    label: 'Pending',
    value: '6',
    change: 'Needs confirmation',
    icon: Clock,
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    label: 'Confirmed',
    value: '8',
    change: 'For today',
    icon: CheckCircle2,
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
  },
];

export default function StatCards() {
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
            <p className="text-3xl font-bold text-[#14532D] leading-none mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {value}
            </p>
            <p className="text-sm font-medium text-[#6B7280]">{label}</p>
          </div>
          <p className="text-xs text-[#10B981] font-medium">{change}</p>
        </div>
      ))}
    </div>
  );
}
