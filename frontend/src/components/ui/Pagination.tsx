import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
  rowsPerPage?: number;
  onRowsPerPage?: (n: number) => void;
  totalItems?: number;
}

export default function Pagination({ page, totalPages, onPage, rowsPerPage, onRowsPerPage, totalItems }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  // Show max 5 page buttons around current
  let visible = pages;
  if (totalPages > 7) {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    visible = [];
    if (start > 1) { visible.push(1); if (start > 2) visible.push(-1); }
    for (let p = start; p <= end; p++) visible.push(p);
    if (end < totalPages) { if (end < totalPages - 1) visible.push(-2); visible.push(totalPages); }
  }

  return (
    <div className="flex items-center justify-between pt-4">
      {totalItems !== undefined && (
        <p className="text-xs text-[#9CA3AF]">{totalItems} result{totalItems !== 1 ? 's' : ''}</p>
      )}

      <div className="flex items-center gap-1 ml-auto">
        <button
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          className="w-8 h-8 rounded-xl flex items-center justify-center border border-[#E7F0EA] text-[#6B7280] hover:bg-[#F6FBF7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>

        {visible.map((p, i) =>
          p < 0 ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-[#9CA3AF]">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold transition-all border"
              style={{
                background: page === p ? '#16A34A' : '#fff',
                color: page === p ? '#fff' : '#374151',
                borderColor: page === p ? '#16A34A' : '#E7F0EA',
              }}
            >
              {p}
            </button>
          )
        )}

        <button
          disabled={page === totalPages}
          onClick={() => onPage(page + 1)}
          className="w-8 h-8 rounded-xl flex items-center justify-center border border-[#E7F0EA] text-[#6B7280] hover:bg-[#F6FBF7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>

        {onRowsPerPage && (
          <div className="ml-3 flex items-center gap-2 text-xs text-[#6B7280]">
            <span>Rows:</span>
            <select
              value={rowsPerPage}
              onChange={e => onRowsPerPage(Number(e.target.value))}
              className="border border-[#E7F0EA] rounded-lg px-2 py-1 text-xs text-[#374151] bg-white outline-none"
            >
              {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
