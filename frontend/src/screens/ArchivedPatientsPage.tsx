import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, ArchiveRestore, ShieldOff } from 'lucide-react';
import { Patient, UserRole, calcAge, formatDate, initials, avatarGradient } from '../data';
import { getArchivedPatients, restorePatient } from '../api/patients.api';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { TableSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import { useIsMobile } from '../hooks/useIsMobile';

interface ArchivedPatientsPageProps {
  userRole: UserRole;
  onViewPatient: (id: string) => void;
}

// ─── 403 Screen (mirrors UsersPage's AccessDeniedPage) ─────────────────────────
function AccessDeniedPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: '#FEF2F2' }}>
        <ShieldOff size={36} color="#DC2626" />
      </div>
      <h2 className="text-xl font-semibold text-[#14532D] mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>403 — Access Denied</h2>
      <p className="text-sm text-[#6B7280] max-w-sm leading-relaxed">
        You don't have permission to access this page. This area is restricted to clinic administrators.
      </p>
    </div>
  );
}

export default function ArchivedPatientsPage({ userRole, onViewPatient }: ArchivedPatientsPageProps) {
  const isMobile = useIsMobile();
  const { addToast } = useToast();
  const isAdmin = userRole === 'admin';

  // Defensive re-check, same redundant pattern UsersPage.tsx already uses — App.tsx
  // already blocks non-admins from reaching this screen at all.
  if (!isAdmin) return <AccessDeniedPage />;

  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [restoreTarget, setRestoreTarget] = useState<Patient | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchArchivedPatients = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getArchivedPatients({ search: debouncedSearch, page, limit: rowsPerPage });
      setPatients(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      addToast('error', 'Failed to load archived patients.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, rowsPerPage, addToast]);

  useEffect(() => {
    fetchArchivedPatients();
  }, [fetchArchivedPatients]);

  async function handleRestore() {
    if (!restoreTarget) return;
    try {
      await restorePatient(restoreTarget.id);
      addToast('success', `${restoreTarget.name} has been restored.`);
      fetchArchivedPatients();
    } catch {
      addToast('error', 'Failed to restore patient.');
    } finally {
      setRestoreTarget(null);
    }
  }

  // ── Desktop table ───────────────────────────────────────────────────────────
  const desktopContent = (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#14532D]" style={{ fontFamily: "'Poppins', sans-serif" }}>Archived Patients</h2>
          <p className="text-sm text-[#9CA3AF] mt-0.5">{total} archived patients</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2.5 bg-white border border-[#E7F0EA] rounded-xl px-4 py-2.5 flex-1 max-w-xs shadow-sm">
          <Search size={15} className="text-[#9CA3AF] flex-shrink-0" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or CIN…"
            className="bg-transparent outline-none text-sm text-[#374151] placeholder:text-[#9CA3AF] w-full"
          />
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#E7F0EA] shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide px-6 py-3.5 border-b border-[#F0F5F2]" style={{ gridTemplateColumns: '2fr 1fr 1.2fr 1fr 1fr 100px' }}>
          <span>Patient</span><span>CIN</span><span>Phone</span><span>Date of birth</span><span>Archived</span><span className="text-right">Actions</span>
        </div>

        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : patients.length === 0 ? (
          <EmptyState
            title="No archived patients"
            description={search ? `No results for "${search}".` : 'Patients that get archived will show up here.'}
          />
        ) : (
          patients.map(p => (
            <div
              key={p.id}
              className="grid items-center px-6 py-3.5 border-b border-[#F0F5F2] last:border-0 hover:bg-[#FAFCFB] transition-colors"
              style={{ gridTemplateColumns: '2fr 1fr 1.2fr 1fr 1fr 100px' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: avatarGradient(p.id) }}>
                  {initials(p.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#14532D]">{p.name}</p>
                  <p className="text-[11px] text-[#9CA3AF]">{calcAge(p.dob)} yrs</p>
                </div>
              </div>
              <span className="text-sm font-mono text-[#374151]">{p.cin}</span>
              <span className="text-sm text-[#374151]">{p.phone}</span>
              <span className="text-sm text-[#374151]">{formatDate(p.dob)}</span>
              <span className="text-sm text-[#374151]">{p.deletedAt ? formatDate(p.deletedAt) : '—'}</span>
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => onViewPatient(p.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#ECFDF5] hover:text-[#16A34A] transition-colors" title="View">
                  <Eye size={14} />
                </button>
                <button onClick={() => setRestoreTarget(p)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#ECFDF5] hover:text-[#16A34A] transition-colors" title="Restore">
                  <ArchiveRestore size={14} />
                </button>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {patients.length > 0 && (
          <div className="px-6 py-3.5 border-t border-[#F0F5F2]">
            <Pagination page={page} totalPages={totalPages} onPage={setPage} rowsPerPage={rowsPerPage} onRowsPerPage={n => { setRowsPerPage(n); setPage(1); }} totalItems={total} />
          </div>
        )}
      </div>
    </div>
  );

  // ── Mobile cards ─────────────────────────────────────────────────────────────
  const mobileContent = (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex items-center gap-2.5 bg-white border border-[#E7F0EA] rounded-xl px-4 py-2.5">
        <Search size={15} className="text-[#9CA3AF] flex-shrink-0" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search name or CIN…"
          className="bg-transparent outline-none text-sm text-[#374151] placeholder:text-[#9CA3AF] w-full"
        />
      </div>

      {loading ? (
        <CardSkeleton count={5} />
      ) : patients.length === 0 ? (
        <EmptyState title="No archived patients" description={search ? `No results for "${search}".` : 'Patients that get archived will show up here.'} />
      ) : (
        patients.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-[#E7F0EA] p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: avatarGradient(p.id) }}>
                {initials(p.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#14532D] truncate">{p.name}</p>
                <p className="text-xs text-[#9CA3AF]">CIN: {p.cin} · {calcAge(p.dob)} yrs</p>
              </div>
            </div>
            <p className="text-xs text-[#6B7280] mb-1">{p.phone}</p>
            <p className="text-xs text-[#9CA3AF] mb-3">Archived {p.deletedAt ? formatDate(p.deletedAt) : '—'}</p>
            <div className="flex gap-2">
              <button onClick={() => onViewPatient(p.id)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-[#E7F0EA] text-[#374151] hover:bg-[#F6FBF7] transition-colors flex items-center justify-center gap-1">
                <Eye size={12} /> View
              </button>
              <button onClick={() => setRestoreTarget(p)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-[#E7F0EA] text-[#374151] hover:bg-[#F6FBF7] transition-colors flex items-center justify-center gap-1">
                <ArchiveRestore size={12} /> Restore
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <>
      {isMobile ? mobileContent : desktopContent}

      {restoreTarget && (
        <ConfirmDialog
          title={`Restore ${restoreTarget.name}?`}
          message="This will reactivate the patient and adjust their appointment statuses — appointments scheduled while archived will be cancelled, and future appointments will be reset to pending."
          confirmLabel="Yes, restore"
          onConfirm={handleRestore}
          onCancel={() => setRestoreTarget(null)}
        />
      )}
    </>
  );
}
