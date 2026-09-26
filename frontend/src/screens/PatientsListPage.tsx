import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus, Search, Eye, Pencil, Trash2, ChevronDown,
  SortAsc, AlertCircle, X
} from 'lucide-react';
import { Patient, UserRole, calcAge, formatDate, initials, avatarGradient } from '../data';
import { patientSchema, PatientFormValues } from '../validators/patient.schema';
import { getPatients, createPatient, updatePatient, deletePatient } from '../api/patients.api';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { TableSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import BottomSheet from '../components/ui/BottomSheet';
import { useToast } from '../context/ToastContext';
import { useIsMobile } from '../hooks/useIsMobile';

interface PatientsListPageProps {
  userRole: UserRole;
  onViewPatient: (id: string) => void;
}

type SortKey = 'name' | 'createdAt' | 'dob';

// ─── Patient Modal ────────────────────────────────────────────────────────────
interface PatientFormProps {
  patient?: Patient;
  onSave: (data: PatientFormValues) => void;
  onClose: () => void;
  submitError?: string;
}

function PatientForm({ patient, onSave, onClose, submitError }: PatientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: patient?.name ?? '',
      cin: patient?.cin ?? '',
      phone: patient?.phone ?? '',
      birthDate: patient?.dob ?? '',
      address: patient?.address ?? '',
    },
  });

  const inputClass = "w-full border border-[#E7F0EA] rounded-xl px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all bg-white";
  const errBorder = "border-red-300 ring-2 ring-red-100";

  return (
    <div className="px-6 pb-6">
      <div className="flex items-center justify-between py-5 border-b border-[#E7F0EA] mb-5">
        <div>
          <h2 className="text-base font-semibold text-[#14532D]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {patient ? 'Edit Patient' : 'Add Patient'}
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Fill in the patient's details</p>
        </div>
        <button type="button" onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9CA3AF] hover:bg-[#F6FBF7] transition-colors">
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
        {/* CIN conflict / server error */}
        {submitError && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl border" style={{ background: '#FEF2F2', borderColor: '#FCA5A5' }}>
            <AlertCircle size={14} color="#DC2626" />
            <p className="text-xs font-medium text-[#DC2626]">{submitError}</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">Full Name <span className="text-red-400">*</span></label>
          <input {...register('fullName')} placeholder="e.g. Maria Garcia" className={`${inputClass} ${errors.fullName ? errBorder : ''}`} />
          {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">CIN <span className="text-red-400">*</span></label>
            <input {...register('cin')} placeholder="AB123456" className={`${inputClass} ${errors.cin ? errBorder : ''}`} />
            {errors.cin && <p className="text-xs text-red-500 mt-1">{errors.cin.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">Phone <span className="text-red-400">*</span></label>
            <input {...register('phone')} placeholder="+1 (555) 000-0000" className={`${inputClass} ${errors.phone ? errBorder : ''}`} />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">Date of Birth <span className="text-red-400">*</span></label>
          <input type="date" {...register('birthDate')} className={`${inputClass} ${errors.birthDate ? errBorder : ''}`} />
          {errors.birthDate && <p className="text-xs text-red-500 mt-1">{errors.birthDate.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">Address <span className="text-[#9CA3AF] font-normal">(optional)</span></label>
          <input {...register('address')} placeholder="Street, City" className={inputClass} />
        </div>

        <div className="flex gap-3 pt-1 border-t border-[#E7F0EA] mt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#E7F0EA] text-[#6B7280] hover:bg-[#F6FBF7] transition-all active:scale-95">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#16A34A,#10B981)' }}>
            {isSubmitting ? 'Saving…' : patient ? 'Save changes' : 'Add patient'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PatientsListPage({ userRole, onViewPatient }: PatientsListPageProps) {
  const isMobile = useIsMobile();
  const { addToast } = useToast();
  const isAdmin = userRole === 'admin';

  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [formError, setFormError] = useState('');

  // Debounce the search box by ~300ms so it doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPatients({ search: debouncedSearch, page, limit: rowsPerPage });
      setPatients(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      addToast('error', 'Failed to load patients.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, rowsPerPage, addToast]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Sorting only applies within the current page — the API doesn't support server-side
  // sorting, so this mirrors the previous behavior as closely as possible.
  const sortedPatients = useMemo(() => {
    return [...patients].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'dob') return a.dob.localeCompare(b.dob);
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [patients, sortKey]);

  async function handleSave(data: PatientFormValues) {
    setFormError('');
    try {
      if (editPatient) {
        await updatePatient(editPatient.id, data);
        addToast('success', 'Patient updated successfully.');
      } else {
        await createPatient(data);
        addToast('success', 'Patient added successfully.');
      }
      setShowModal(false);
      setEditPatient(undefined);
      fetchPatients();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setFormError(err.response.data?.error ?? 'This CIN already exists.');
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deletePatient(deleteTarget.id);
      addToast('success', `${deleteTarget.name} removed from patient records.`);
      fetchPatients();
    } catch {
      addToast('error', 'Failed to delete patient.');
    } finally {
      setDeleteTarget(null);
    }
  }

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'createdAt', label: 'Recently added' },
    { key: 'name', label: 'Name (A–Z)' },
    { key: 'dob', label: 'Date of birth' },
  ];

  // ── Desktop table ───────────────────────────────────────────────────────────
  const desktopContent = (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#14532D]" style={{ fontFamily: "'Poppins', sans-serif" }}>Patients</h2>
          <p className="text-sm text-[#9CA3AF] mt-0.5">{total} patients registered</p>
        </div>
        <button
          onClick={() => { setEditPatient(undefined); setFormError(''); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg,#16A34A,#10B981)' }}
        >
          <Plus size={16} />
          Add patient
        </button>
      </div>

      {/* Search + Sort */}
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
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E7F0EA] rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F6FBF7] transition-colors shadow-sm"
          >
            <SortAsc size={15} color="#9CA3AF" />
            {SORT_OPTIONS.find(s => s.key === sortKey)?.label}
            <ChevronDown size={14} color="#9CA3AF" />
          </button>
          {showSortDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#E7F0EA] rounded-xl shadow-lg z-20 overflow-hidden min-w-[160px]">
              {SORT_OPTIONS.map(o => (
                <button
                  key={o.key}
                  onClick={() => { setSortKey(o.key); setShowSortDropdown(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#ECFDF5] transition-colors font-medium"
                  style={{ color: sortKey === o.key ? '#16A34A' : '#374151' }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#E7F0EA] shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide px-6 py-3.5 border-b border-[#F0F5F2]" style={{ gridTemplateColumns: '2fr 1fr 1.2fr 1fr 1fr 100px' }}>
          <span>Patient</span><span>CIN</span><span>Phone</span><span>Date of birth</span><span>Registered</span><span className="text-right">Actions</span>
        </div>

        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : sortedPatients.length === 0 ? (
          <EmptyState
            title="No patients found"
            description={search ? `No results for "${search}". Try a different name or CIN.` : 'Start by adding your first patient.'}
            action={
              <button onClick={() => { setEditPatient(undefined); setFormError(''); setShowModal(true); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#16A34A,#10B981)' }}>
                <Plus size={15} /> Add patient
              </button>
            }
          />
        ) : (
          sortedPatients.map(p => (
            <div
              key={p.id}
              className="grid items-center px-6 py-3.5 border-b border-[#F0F5F2] last:border-0 hover:bg-[#FAFCFB] transition-colors group"
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
              <span className="text-sm text-[#374151]">{formatDate(p.createdAt)}</span>
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => onViewPatient(p.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#ECFDF5] hover:text-[#16A34A] transition-colors" title="View">
                  <Eye size={14} />
                </button>
                <button onClick={() => { setEditPatient(p); setFormError(''); setShowModal(true); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#ECFDF5] hover:text-[#16A34A] transition-colors" title="Edit">
                  <Pencil size={14} />
                </button>
                {isAdmin && (
                  <button onClick={() => setDeleteTarget(p)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors" title="Delete">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {sortedPatients.length > 0 && (
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
      {/* Search */}
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
      ) : sortedPatients.length === 0 ? (
        <EmptyState title="No patients found" description={search ? `No results for "${search}".` : 'Start by adding a patient.'} />
      ) : (
        sortedPatients.map(p => (
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
            <p className="text-xs text-[#6B7280] mb-3">{p.phone}</p>
            <div className="flex gap-2">
              <button onClick={() => onViewPatient(p.id)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-[#E7F0EA] text-[#374151] hover:bg-[#F6FBF7] transition-colors flex items-center justify-center gap-1">
                <Eye size={12} /> View
              </button>
              <button onClick={() => { setEditPatient(p); setFormError(''); setShowModal(true); }} className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-[#E7F0EA] text-[#374151] hover:bg-[#F6FBF7] transition-colors flex items-center justify-center gap-1">
                <Pencil size={12} /> Edit
              </button>
              {isAdmin && (
                <button onClick={() => setDeleteTarget(p)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-red-100 text-[#DC2626] hover:bg-[#FEF2F2] transition-colors flex items-center justify-center gap-1">
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <>
      {isMobile ? mobileContent : desktopContent}

      {/* Desktop modal */}
      {showModal && !isMobile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-[#E7F0EA] w-full max-w-md" onClick={e => e.stopPropagation()}>
            <PatientForm patient={editPatient} onSave={handleSave} onClose={() => setShowModal(false)} submitError={formError} />
          </div>
        </div>
      )}

      {/* Mobile bottom sheet */}
      {showModal && isMobile && (
        <BottomSheet onClose={() => setShowModal(false)}>
          <PatientForm patient={editPatient} onSave={handleSave} onClose={() => setShowModal(false)} submitError={formError} />
        </BottomSheet>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDialog
          title={`Delete ${deleteTarget.name}?`}
          message="This patient and all their appointment records will be permanently removed. This action cannot be undone."
          confirmLabel="Yes, delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          danger
        />
      )}
    </>
  );
}
