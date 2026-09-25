import { useState, useMemo } from 'react';
import {
  Plus, Search, RotateCcw, CalendarDays,
  CheckCircle2, XCircle, MoreVertical, Filter
} from 'lucide-react';
import {
  Appointment, AppointmentStatus, UserRole,
  statusColor, statusLabel, formatDate, initials, avatarGradient
} from '../data';
import { StatusBadge } from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import BottomSheet from '../components/ui/BottomSheet';
import NewAppointmentModal from '../components/NewAppointmentModal';
import AppointmentDetailsPopover from '../components/AppointmentDetailsPopover';
import { useToast } from '../context/ToastContext';
import { useIsMobile } from '../hooks/useIsMobile';

interface AppointmentsPageProps {
  userRole: UserRole;
  onGoToDashboard?: () => void;
}

// TODO: replace with real API call
const APPOINTMENTS: Appointment[] = [];

export default function AppointmentsPage({ userRole, onGoToDashboard }: AppointmentsPageProps) {
  const isMobile = useIsMobile();
  const { addToast } = useToast();

  const [appointments, setAppointments] = useState(APPOINTMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading] = useState(false);
  const [showNewAppt, setShowNewAppt] = useState(false);
  const [newApptDate, setNewApptDate] = useState<string | undefined>();
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const matchSearch = search === '' ||
        a.patientName.toLowerCase().includes(search.toLowerCase()) ||
        a.patientCin.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchDate = dateFilter === '' || a.date === dateFilter;
      return matchSearch && matchStatus && matchDate;
    }).sort((a, b) => b.date.localeCompare(a.date) || a.timeStart.localeCompare(b.timeStart));
  }, [appointments, search, statusFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  function updateStatus(id: string, status: AppointmentStatus) {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    setOpenMenu(null);
    addToast('success', `Appointment marked as ${statusLabel(status)}.`);
  }

  function handleNewAppt(date?: string) {
    setNewApptDate(date);
    setShowNewAppt(true);
  }

  function resetFilters() {
    setSearch(''); setStatusFilter('all'); setDateFilter(''); setPage(1);
  }

  const hasFilters = search || statusFilter !== 'all' || dateFilter;

  const STATUS_OPTS: { value: AppointmentStatus | 'all'; label: string }[] = [
    { value: 'all',       label: 'All statuses' },
    { value: 'pending',   label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // ── Desktop ──────────────────────────────────────────────────────────────────
  const desktopList = (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#14532D]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Appointments
          </h2>
          <p className="text-sm text-[#9CA3AF] mt-0.5">{appointments.length} total appointments</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onGoToDashboard}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-[#E7F0EA] bg-white text-[#6B7280] hover:bg-[#F6FBF7] hover:text-[#16A34A] transition-all shadow-sm"
          >
            <CalendarDays size={15} />
            View calendar
          </button>
          <button
            onClick={() => handleNewAppt()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#16A34A,#10B981)' }}
          >
            <Plus size={16} /> New appointment
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex items-center gap-2.5 bg-white border border-[#E7F0EA] rounded-xl px-4 py-2.5 shadow-sm" style={{ width: 240 }}>
          <Search size={15} className="text-[#9CA3AF] flex-shrink-0" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search patient…"
            className="bg-transparent outline-none text-sm text-[#374151] placeholder:text-[#9CA3AF] w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as AppointmentStatus | 'all'); setPage(1); }}
          className="border border-[#E7F0EA] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#374151] bg-white outline-none shadow-sm"
        >
          {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={e => { setDateFilter(e.target.value); setPage(1); }}
          className="border border-[#E7F0EA] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#374151] bg-white outline-none shadow-sm"
        />
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#6B7280] border border-[#E7F0EA] hover:bg-[#F6FBF7] transition-colors"
          >
            <RotateCcw size={14} /> Reset
          </button>
        )}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#E7F0EA] shadow-sm overflow-visible">
        {/* Header row */}
        <div
          className="grid text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide px-6 py-3.5 border-b border-[#F0F5F2]"
          style={{ gridTemplateColumns: '1.4fr 1.6fr 1.6fr 140px 1fr 56px' }}
        >
          <span>Date & Time</span>
          <span>Patient</span>
          <span>Reason</span>
          <span>Status</span>
          <span>Created by</span>
          <span />
        </div>

        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : paginated.length === 0 ? (
          <EmptyState
            title="No appointments found"
            description={hasFilters ? 'Try adjusting your filters.' : 'No appointments scheduled yet.'}
          />
        ) : (
          paginated.map(a => (
            <div
              key={a.id}
              className="grid items-center px-6 py-3.5 border-b border-[#F0F5F2] last:border-0 hover:bg-[#FAFCFB] transition-colors"
              style={{ gridTemplateColumns: '1.4fr 1.6fr 1.6fr 140px 1fr 56px' }}
            >
              {/* Date & time */}
              <div>
                <p className="text-sm font-semibold text-[#14532D]">{formatDate(a.date)}</p>
                <p className="text-xs text-[#9CA3AF]">{a.timeStart}–{a.timeEnd}</p>
              </div>

              {/* Patient */}
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ background: avatarGradient(a.patientId) }}
                >
                  {initials(a.patientName)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#14532D] truncate">{a.patientName}</p>
                  <p className="text-[11px] text-[#9CA3AF]">{a.patientCin}</p>
                </div>
              </div>

              {/* Reason */}
              <span className="text-sm text-[#374151] truncate pr-3">{a.reason}</span>

              {/* Status — inline, pill-width only */}
              <div>
                <StatusBadge status={a.status} size="sm" />
              </div>

              {/* Created by */}
              <span className="text-sm text-[#9CA3AF] truncate">{a.createdBy}</span>

              {/* Actions */}
              <div className="relative flex items-center justify-end">
                <button
                  onClick={() => setOpenMenu(openMenu === a.id ? null : a.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#ECFDF5] hover:text-[#16A34A] transition-colors"
                >
                  <MoreVertical size={14} />
                </button>
                {openMenu === a.id && (
                  <div
                    className="absolute top-8 right-0 bg-white border border-[#E7F0EA] rounded-xl shadow-xl z-30 overflow-hidden"
                    style={{ minWidth: 160 }}
                  >
                    <button
                      onClick={() => { setSelectedAppt(a); setOpenMenu(null); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#374151] hover:bg-[#ECFDF5] flex items-center gap-2"
                    >
                      <Filter size={12} color="#16A34A" /> View details
                    </button>
                    {a.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(a.id, 'confirmed')}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#15803D] hover:bg-[#ECFDF5] flex items-center gap-2"
                      >
                        <CheckCircle2 size={12} /> Confirm
                      </button>
                    )}
                    {a.status !== 'cancelled' && (
                      <button
                        onClick={() => updateStatus(a.id, 'cancelled')}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2"
                      >
                        <XCircle size={12} /> Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Pagination — always rendered when there are rows */}
        <div className="px-6 py-4 border-t border-[#F0F5F2]">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPage={setPage}
            rowsPerPage={rowsPerPage}
            onRowsPerPage={n => { setRowsPerPage(n); setPage(1); }}
            totalItems={filtered.length}
          />
        </div>
      </div>
    </div>
  );

  // ── Mobile ────────────────────────────────────────────────────────────────────
  const mobileContent = (
    <div className="flex flex-col gap-4 pt-2">
      {/* "View calendar" link */}
      <button
        onClick={onGoToDashboard}
        className="self-start flex items-center gap-1.5 text-xs font-semibold"
        style={{ color: '#16A34A' }}
      >
        <CalendarDays size={13} /> View calendar on Dashboard
      </button>

      {/* Status filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_OPTS.map(o => (
          <button
            key={o.value}
            onClick={() => setStatusFilter(o.value)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
            style={{
              background: statusFilter === o.value ? '#16A34A' : '#fff',
              color: statusFilter === o.value ? '#fff' : '#6B7280',
              borderColor: statusFilter === o.value ? '#16A34A' : '#E7F0EA',
            }}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2.5 bg-white border border-[#E7F0EA] rounded-xl px-4 py-2.5">
        <Search size={15} className="text-[#9CA3AF] flex-shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search patient…"
          className="bg-transparent outline-none text-sm text-[#374151] placeholder:text-[#9CA3AF] w-full"
        />
      </div>

      {loading ? (
        <CardSkeleton count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No appointments found" description="Try adjusting your filters." />
      ) : (
        filtered.map(a => {
          const c = statusColor(a.status);
          return (
            <button
              key={a.id}
              onClick={() => setSelectedAppt(a)}
              className="bg-white rounded-2xl border text-left w-full transition-all hover:shadow-md active:scale-[0.98]"
              style={{
                borderLeft: `4px solid ${c.border}`,
                borderTop: '1px solid #E7F0EA',
                borderRight: '1px solid #E7F0EA',
                borderBottom: '1px solid #E7F0EA',
              }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-1.5">
                  <p className="text-sm font-semibold text-[#14532D]">{a.patientName}</p>
                  {/* pill-width badge */}
                  <StatusBadge status={a.status} size="sm" />
                </div>
                <p className="text-xs text-[#6B7280] mb-1">{formatDate(a.date)} · {a.timeStart}–{a.timeEnd}</p>
                <p className="text-xs text-[#9CA3AF]">{a.reason}</p>
              </div>
            </button>
          );
        })
      )}
    </div>
  );

  return (
    <>
      {isMobile ? mobileContent : desktopList}

      {showNewAppt && !isMobile && (
        <NewAppointmentModal onClose={() => setShowNewAppt(false)} defaultDate={newApptDate} />
      )}
      {showNewAppt && isMobile && (
        <BottomSheet onClose={() => setShowNewAppt(false)}>
          <NewAppointmentModal onClose={() => setShowNewAppt(false)} defaultDate={newApptDate} isMobile />
        </BottomSheet>
      )}
      {selectedAppt && (
        <AppointmentDetailsPopover
          appointment={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          onConfirm={id => { updateStatus(id, 'confirmed'); setSelectedAppt(null); }}
          onCancel={id => { updateStatus(id, 'cancelled'); setSelectedAppt(null); }}
        />
      )}
    </>
  );
}
