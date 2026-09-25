import { Appointment, statusColor } from '../data';

interface AppointmentChipProps {
  appointment: Appointment;
  onClick: (a: Appointment) => void;
  compact?: boolean;
}

export default function AppointmentChip({ appointment, onClick, compact }: AppointmentChipProps) {
  const colors = statusColor(appointment.status);
  const isCancelled = appointment.status === 'cancelled';

  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(appointment); }}
      className="w-full text-left rounded-lg px-2 py-1 text-xs font-medium mb-0.5 flex items-center gap-1.5 transition-opacity hover:opacity-80"
      style={{
        background: colors.bg,
        borderLeft: `3px solid ${colors.border}`,
        color: colors.text,
      }}
    >
      <span
        className="whitespace-nowrap flex-shrink-0"
        style={{ textDecoration: isCancelled ? 'line-through' : 'none', opacity: isCancelled ? 0.6 : 1 }}
      >
        {appointment.timeStart}
      </span>
      {!compact && (
        <span className="truncate" style={{ textDecoration: isCancelled ? 'line-through' : 'none', opacity: isCancelled ? 0.6 : 1 }}>
          {appointment.patientName.split(' ')[0]}
        </span>
      )}
    </button>
  );
}
