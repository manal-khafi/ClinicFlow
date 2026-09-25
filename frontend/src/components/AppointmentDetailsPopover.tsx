import { X, User, Clock, FileText, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { Appointment, statusColor, statusLabel } from '../data';

interface AppointmentDetailsPopoverProps {
  appointment: Appointment;
  onClose: () => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
}

export default function AppointmentDetailsPopover({ appointment, onClose, onConfirm, onCancel }: AppointmentDetailsPopoverProps) {
  const colors = statusColor(appointment.status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-[#E7F0EA] w-80 p-5 z-10"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: '0 20px 60px rgba(22,163,74,0.12), 0 4px 16px rgba(0,0,0,0.08)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #16A34A, #10B981)' }}
            >
              {appointment.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold text-[#14532D] text-sm leading-tight">{appointment.patientName}</p>
              <p className="text-xs text-[#9CA3AF]">CIN: {appointment.patientCin}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors rounded-lg p-1">
            <X size={16} />
          </button>
        </div>

        {/* Status badge */}
        <div className="mb-4">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: colors.bg, color: colors.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: colors.border }} />
            {statusLabel(appointment.status)}
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#ECFDF5' }}>
              <Clock size={13} color="#16A34A" />
            </div>
            <div>
              <p className="text-[11px] text-[#9CA3AF] font-medium">Date & Time</p>
              <p className="text-sm font-medium text-[#1F2937]">
                {new Date(appointment.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {appointment.timeStart}–{appointment.timeEnd}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#ECFDF5' }}>
              <FileText size={13} color="#16A34A" />
            </div>
            <div>
              <p className="text-[11px] text-[#9CA3AF] font-medium">Reason</p>
              <p className="text-sm font-medium text-[#1F2937]">{appointment.reason}</p>
            </div>
          </div>
          {appointment.notes && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#ECFDF5' }}>
                <User size={13} color="#16A34A" />
              </div>
              <div>
                <p className="text-[11px] text-[#9CA3AF] font-medium">Notes</p>
                <p className="text-sm text-[#4B5563]">{appointment.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {appointment.status === 'pending' && (
            <button
              onClick={() => { onConfirm(appointment.id); onClose(); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
              style={{ background: '#16A34A', color: '#fff' }}
            >
              <CheckCircle2 size={13} />
              Confirm
            </button>
          )}
          {appointment.status !== 'cancelled' && (
            <button
              onClick={() => { onCancel(appointment.id); onClose(); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-red-50 active:scale-95"
              style={{ borderColor: '#FCA5A5', color: '#DC2626' }}
            >
              <XCircle size={13} />
              Cancel
            </button>
          )}
          <button
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border border-[#E7F0EA] text-[#6B7280] transition-all hover:bg-[#F6FBF7] active:scale-95"
          >
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
