import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  addToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
  const COLORS = {
    success: { bg: '#F0FDF4', border: '#86EFAC', icon: '#16A34A', text: '#15803D' },
    error:   { bg: '#FEF2F2', border: '#FCA5A5', icon: '#DC2626', text: '#DC2626' },
    info:    { bg: '#EFF6FF', border: '#93C5FD', icon: '#2563EB', text: '#1D4ED8' },
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast stack */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2.5" style={{ maxWidth: 360 }}>
        {toasts.map(t => {
          const Icon = ICONS[t.type];
          const c = COLORS[t.type];
          return (
            <div
              key={t.id}
              className="flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-xl text-sm font-medium"
              style={{ background: c.bg, borderColor: c.border, color: c.text, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
            >
              <Icon size={17} color={c.icon} className="flex-shrink-0 mt-0.5" />
              <span className="flex-1 leading-snug">{t.message}</span>
              <button onClick={() => remove(t.id)} className="opacity-50 hover:opacity-100 transition-opacity flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
