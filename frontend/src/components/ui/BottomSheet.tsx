import { ReactNode } from 'react';

interface BottomSheetProps {
  children: ReactNode;
  onClose: () => void;
}

export default function BottomSheet({ children, onClose }: BottomSheetProps) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl overflow-y-auto scroll-visible"
        style={{ maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10">
          <div className="w-10 h-1 rounded-full bg-[#D1D5DB]" />
        </div>
        {children}
      </div>
    </div>
  );
}
