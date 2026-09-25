import type { CSSProperties } from 'react';

interface SkeletonProps { className?: string; style?: CSSProperties }

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`rounded-xl animate-pulse ${className}`}
      style={{ background: 'linear-gradient(90deg, #E7F0EA 25%, #F0F5F2 50%, #E7F0EA 75%)', backgroundSize: '200% 100%', ...style }}
    />
  );
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="flex flex-col gap-0">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-6 py-4 border-b border-[#F0F5F2]">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} style={{ height: 14, flex: c === 0 ? 2 : 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 border border-[#E7F0EA] flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Skeleton style={{ width: 40, height: 40, borderRadius: 20 }} />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton style={{ height: 13, width: '60%' }} />
              <Skeleton style={{ height: 11, width: '40%' }} />
            </div>
          </div>
          <Skeleton style={{ height: 11 }} />
          <Skeleton style={{ height: 11, width: '75%' }} />
        </div>
      ))}
    </div>
  );
}
