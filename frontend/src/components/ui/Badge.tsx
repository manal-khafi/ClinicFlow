import { AppointmentStatus, UserRole, statusColor, statusLabel } from '../../data';

interface StatusBadgeProps {
  status: AppointmentStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const c = statusColor(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 font-semibold rounded-full"
      style={{
        background: c.bg,
        color: c.text,
        fontSize: size === 'sm' ? 10 : 11,
        padding: size === 'sm' ? '2px 8px' : '3px 10px',
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.border }} />
      {statusLabel(status)}
    </span>
  );
}

interface RoleBadgeProps { role: UserRole }

export function RoleBadge({ role }: RoleBadgeProps) {
  const isAdmin = role === 'admin';
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{
        background: isAdmin ? '#14532D' : '#ECFDF5',
        color: isAdmin ? '#fff' : '#16A34A',
      }}
    >
      {isAdmin ? 'Admin' : 'Staff'}
    </span>
  );
}
