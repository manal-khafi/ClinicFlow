import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#ECFDF5' }}>
          {icon}
        </div>
      )}
      {!icon && (
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#ECFDF5' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="8" width="24" height="18" rx="3" stroke="#16A34A" strokeWidth="2" fill="#DCFCE7"/>
            <path d="M4 13h24" stroke="#16A34A" strokeWidth="2"/>
            <circle cx="10" cy="21" r="2" fill="#16A34A" opacity="0.4"/>
            <rect x="14" y="20" width="10" height="2" rx="1" fill="#16A34A" opacity="0.4"/>
          </svg>
        </div>
      )}
      <p className="text-sm font-semibold text-[#374151] mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{title}</p>
      {description && <p className="text-xs text-[#9CA3AF] max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
