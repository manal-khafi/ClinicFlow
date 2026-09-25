import { useState } from 'react';
import { Appointment, statusColor, statusLabel, getAppointmentsForDate, TODAY } from '../data';

interface MobileDashboardProps {
  onNewAppointment: (date?: string) => void;
  onSelectAppointment: (a: Appointment) => void;
}

const DAYS_OF_WEEK_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

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

const STATS = [
  { label: 'Total Patients', value: '0', color: '#16A34A', bg: '#ECFDF5' }, // TODO: replace with real API call to /api/dashboard/stats
  { label: "Today's Appts",  value: '0', color: '#2563EB', bg: '#DBEAFE' }, // TODO: replace with real API call to /api/dashboard/stats
  { label: 'Pending',        value: '0', color: '#D97706', bg: '#FEF3C7' }, // TODO: replace with real API call to /api/dashboard/stats
  { label: 'Confirmed',      value: '0', color: '#16A34A', bg: '#DCFCE7' }, // TODO: replace with real API call to /api/dashboard/stats
];

export default function MobileDashboard({ onNewAppointment, onSelectAppointment }: MobileDashboardProps) {
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const year = 2026, month = 8;
  const calDays = getCalendarDays(year, month);
  const dateStr = (day: number) => `${year}-${padDate(month + 1)}-${padDate(day)}`;
  const isToday  = (day: number) => dateStr(day) === TODAY;
  const isSelected = (day: number) => dateStr(day) === selectedDate;

  const hasAppts = (day: number) => {
    const appts = getAppointmentsForDate(dateStr(day));
    return {
      confirmed: appts.some(a => a.status === 'confirmed'),
      pending:   appts.some(a => a.status === 'pending'),
      cancelled: appts.some(a => a.status === 'cancelled'),
    };
  };

  const selectedAppts = getAppointmentsForDate(selectedDate);
  const selectedDateLabel = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col gap-4 pt-2">
      {/* Stat cards 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        {STATS.map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-[#E7F0EA]">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5" style={{ background: bg }}>
              <span className="text-sm font-bold" style={{ color }}>+</span>
            </div>
            <p className="text-2xl font-bold leading-none mb-1" style={{ color, fontFamily: "'Poppins', sans-serif" }}>{value}</p>
            <p className="text-[11px] text-[#6B7280] font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Compact calendar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E7F0EA]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#14532D]" style={{ fontFamily: "'Poppins', sans-serif" }}>{monthLabel}</h3>
        </div>
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS_OF_WEEK_SHORT.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-[#9CA3AF] py-1">{d}</div>
          ))}
        </div>
        {/* Days */}
        <div className="grid grid-cols-7 gap-y-1">
          {calDays.map((day, idx) => {
            if (day === null) return <div key={`n${idx}`} />;
            const dots = hasAppts(day);
            const today = isToday(day);
            const sel = isSelected(day);
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr(day))}
                className="flex flex-col items-center py-1 rounded-xl transition-colors"
                style={{ background: sel && !today ? '#ECFDF5' : 'transparent' }}
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold mb-0.5"
                  style={today ? { background: '#16A34A', color: '#fff' } : sel ? { color: '#16A34A' } : { color: '#374151' }}
                >
                  {day}
                </span>
                <div className="flex gap-0.5 h-1.5">
                  {dots.confirmed && <span className="w-1 h-1 rounded-full" style={{ background: '#16A34A' }} />}
                  {dots.pending   && <span className="w-1 h-1 rounded-full" style={{ background: '#D97706' }} />}
                  {dots.cancelled && <span className="w-1 h-1 rounded-full" style={{ background: '#9CA3AF' }} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#14532D]" style={{ fontFamily: "'Poppins', sans-serif" }}>{selectedDateLabel}</h3>
          <span className="text-xs text-[#9CA3AF]">{selectedAppts.length} appts</span>
        </div>
        {selectedAppts.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-[#E7F0EA]">
            <p className="text-sm text-[#9CA3AF]">No appointments this day</p>
            <button onClick={() => onNewAppointment(selectedDate)} className="mt-3 text-xs font-semibold" style={{ color: '#16A34A' }}>
              + Add appointment
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {selectedAppts.map(a => {
              const c = statusColor(a.status);
              return (
                <button
                  key={a.id}
                  onClick={() => onSelectAppointment(a)}
                  className="bg-white rounded-2xl p-4 shadow-sm text-left w-full transition-all hover:shadow-md active:scale-[0.98]"
                  style={{ borderLeft: `4px solid ${c.border}`, borderTop: '1px solid #E7F0EA', borderRight: '1px solid #E7F0EA', borderBottom: '1px solid #E7F0EA' }}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-sm font-semibold text-[#14532D]">{a.patientName}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>
                      {statusLabel(a.status)}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280]">{a.timeStart}–{a.timeEnd} · {a.reason}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
