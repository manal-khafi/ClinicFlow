import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Appointment } from '../data';
import { getAppointments } from '../api/appointments.api';
import AppointmentChip from './AppointmentChip';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarProps {
  onNewAppointment: (date?: string) => void;
  onSelectAppointment: (a: Appointment) => void;
  // Bumped by the parent whenever an appointment is created elsewhere (e.g. the "New
  // appointment" modal), so this refetches instead of showing stale data.
  refreshTrigger?: number;
}

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function padDate(n: number) { return String(n).padStart(2, '0'); }

export default function Calendar({ onNewAppointment, onSelectAppointment, refreshTrigger }: CalendarProps) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(8); // 0-indexed: 8 = September
  const [view] = useState<'month' | 'week' | 'day'>('month');
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const today = '2026-09-24';
  const todayDate = new Date(today);

  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const calDays = getCalendarDays(year, month);

  // The backend only supports filtering appointments by a single day or by status, not a
  // month range — so this fetches a generous batch and groups it by day client-side.
  // Appointments far outside this batch (e.g. months with heavy history) won't show here;
  // adding a real date-range endpoint would need a backend change, which is out of scope.
  useEffect(() => {
    let cancelled = false;
    getAppointments({ limit: 200 })
      .then(res => { if (!cancelled) setAppointments(res.data); })
      .catch(() => { if (!cancelled) setAppointments([]); });
    return () => { cancelled = true; };
  }, [refreshTrigger]);

  function getAppointmentsForDay(ds: string): Appointment[] {
    return appointments.filter(a => a.date === ds);
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }
  function goToday() { setYear(2026); setMonth(8); }

  const isToday = (day: number) => {
    return year === todayDate.getFullYear() && month === todayDate.getMonth() && day === todayDate.getDate();
  };

  const dateStr = (day: number) => `${year}-${padDate(month + 1)}-${padDate(day)}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E7F0EA] flex flex-col overflow-hidden" style={{ minHeight: 540 }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7F0EA]">
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl border border-[#E7F0EA] overflow-hidden text-xs font-semibold">
            {(['month', 'week', 'day'] as const).map(v => (
              <button
                key={v}
                className="px-3 py-1.5 transition-colors capitalize"
                style={{
                  background: view === v ? '#16A34A' : '#fff',
                  color: view === v ? '#fff' : '#6B7280',
                }}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <button onClick={prevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F6FBF7] transition-colors text-[#6B7280]">
            <ChevronLeft size={16} />
          </button>
          <button onClick={nextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F6FBF7] transition-colors text-[#6B7280]">
            <ChevronRight size={16} />
          </button>

          <h2 className="text-sm font-semibold text-[#14532D] ml-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {monthName}
          </h2>

          <button
            onClick={goToday}
            className="ml-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#E7F0EA] text-[#4B5563] hover:bg-[#F6FBF7] transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px] font-medium">
            {[
              { label: 'Confirmed', bg: '#DCFCE7', border: '#16A34A', text: '#15803D' },
              { label: 'Pending', bg: '#FEF3C7', border: '#D97706', text: '#B45309' },
              { label: 'Cancelled', bg: '#F3F4F6', border: '#9CA3AF', text: '#6B7280' },
            ].map(({ label, bg, border, text }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: border }} />
                <span style={{ color: text }}>{label}</span>
              </span>
            ))}
          </div>

          <button
            onClick={() => onNewAppointment()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #16A34A, #10B981)' }}
          >
            <Plus size={15} />
            New appointment
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-[#E7F0EA]">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="py-2.5 text-center text-[11px] font-semibold text-[#9CA3AF] tracking-wide uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1" style={{ gridAutoRows: '1fr' }}>
        {calDays.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`null-${idx}`}
                className="border-b border-r border-[#F0F5F2] p-1.5 min-h-[90px]"
                style={{ background: '#FAFCFB' }}
              />
            );
          }
          const ds = dateStr(day);
          const dayAppts = getAppointmentsForDay(ds);
          const MAX_VISIBLE = 3;
          const visible = dayAppts.slice(0, MAX_VISIBLE);
          const overflow = dayAppts.length - MAX_VISIBLE;

          return (
            <div
              key={ds}
              className="cal-cell border-b border-r border-[#F0F5F2] p-1.5 min-h-[90px] flex flex-col transition-colors"
              onClick={() => onNewAppointment(ds)}
            >
              <div className="flex items-center justify-center mb-1 self-start">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={isToday(day)
                    ? { background: '#16A34A', color: '#fff' }
                    : { color: '#374151' }
                  }
                >
                  {day}
                </span>
              </div>
              <div className="flex-1 flex flex-col">
                {visible.map(a => (
                  <AppointmentChip
                    key={a.id}
                    appointment={a}
                    onClick={onSelectAppointment}
                  />
                ))}
                {overflow > 0 && (
                  <button
                    className="text-[10px] font-semibold text-[#16A34A] hover:text-[#14532D] text-left px-2 mt-0.5"
                    onClick={e => { e.stopPropagation(); }}
                  >
                    +{overflow} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
