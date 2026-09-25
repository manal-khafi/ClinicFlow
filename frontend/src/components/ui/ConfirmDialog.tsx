import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmDialog({
  title, message, confirmLabel = 'Confirm', onConfirm, onCancel, danger = false,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-[#E7F0EA] w-full max-w-sm p-6 z-10"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.12)' }}
      >
        <button onClick={onCancel} className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F6FBF7] transition-colors">
          <X size={15} />
        </button>

        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: danger ? '#FEF2F2' : '#ECFDF5' }}>
            <AlertTriangle size={20} color={danger ? '#DC2626' : '#D97706'} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#14532D] mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{title}</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#E7F0EA] text-[#6B7280] hover:bg-[#F6FBF7] transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: danger ? '#DC2626' : 'linear-gradient(135deg,#16A34A,#10B981)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
