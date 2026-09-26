import { useState, useEffect } from 'react';
import {
  ArrowLeft, Phone, MapPin, Calendar, Clock, Archive,
  ChevronRight, User, Loader2, ArchiveRestore, ShieldOff
} from 'lucide-react';
import { calcAge, formatDate, initials, avatarGradient, statusColor, UserRole } from '../data';
import { StatusBadge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useIsMobile } from '../hooks/useIsMobile';
import { getArchivedPatientById, restorePatient, ArchivedPatientDetail } from '../api/patients.api';

interface ArchivedPatientDetailsPageProps {
  patientId: string;
  userRole: UserRole;
  onBack: () => void;
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

export default function ArchivedPatientDetailsPage({ patientId, userRole, onBack }: ArchivedPatientDetailsPageProps) {
  const isMobile = useIsMobile();
  const { addToast } = useToast();
  const isAdmin = userRole === 'admin';

  // Defensive re-check, same redundant pattern UsersPage.tsx already uses — App.tsx
  // already blocks non-admins from reaching this screen at all.
  if (!isAdmin) return <AccessDeniedPage />;

  const [patient, setPatient] = useState<ArchivedPatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    getArchivedPatientById(patientId)
      .then(p => { if (!cancelled) setPatient(p); })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          addToast('error', 'Failed to load archived patient.');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [patientId, addToast]);

  async function handleRestore() {
    if (!patient) return;
    try {
      await restorePatient(patient.id);
      addToast('success', `${patient.name} has been restored.`);
      onBack();
    } catch {
      addToast('error', 'Failed to restore patient.');
    } finally {
      setShowRestoreConfirm(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20">
        <Loader2 size={18} className="animate-spin" color="#16A34A" />
        <span className="text-sm text-[#9CA3AF]">Loading…</span>
      </div>
    );
  }

  if (notFound || !patient) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 px-8 text-center">
        <p className="text-sm text-[#6B7280]">Archived patient not found.</p>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg,#16A34A,#10B981)' }}
        >
          <ArrowLeft size={14} /> Back to archived patients
        </button>
      </div>
    );
  }

  const age = calcAge(patient.dob);
  const grad = avatarGradient(patient.id);
  const init = initials(patient.name);
  const allAppts = patient.appointments;

  // ── Info Card (read-only — no Edit/Delete) ──────────────────────────────────
  const InfoCard = () => (
    <div className="bg-white rounded-2xl border border-[#E7F0EA] shadow-sm overflow-hidden flex-shrink-0" style={isMobile ? {} : { width: 300 }}>
      {/* Gray band, instead of the active-patient green — visually flags this as archived */}
      <div className="h-16 w-full" style={{ background: '#9CA3AF' }} />

      <div className="px-6 pb-6">
        <div className="flex items-end justify-between -mt-8 mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white border-4 border-white shadow-md" style={{ background: grad, opacity: 0.7 }}>
            {init}
          </div>
        </div>

        <h3 className="text-base font-semibold text-[#14532D] mb-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>{patient.name}</h3>
        <p className="text-xs text-[#9CA3AF] mb-5">Patient ID: {patient.id.toUpperCase()}</p>

        <div className="flex flex-col gap-4">
          {[
            { icon: User, label: 'CIN', value: patient.cin },
            { icon: Phone, label: 'Phone', value: patient.phone },
            { icon: Calendar, label: 'Date of birth', value: `${formatDate(patient.dob)} (${age} yrs)` },
            { icon: MapPin, label: 'Address', value: patient.address || '—' },
            { icon: Clock, label: 'Registered', value: `${formatDate(patient.createdAt)} by ${patient.createdBy}` },
            { icon: Archive, label: 'Archived', value: patient.deletedAt ? formatDate(patient.deletedAt) : '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#ECFDF5' }}>
                <Icon size={13} color="#16A34A" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-[#374151] leading-snug">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Appointments section (full history, read-only) ─────────────────────────
  const AppointmentsSection = () => (
    <div className="bg-white rounded-2xl border border-[#E7F0EA] shadow-sm flex-1 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7F0EA]">
        <h3 className="text-sm font-semibold text-[#14532D]" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Appointment history ({allAppts.length})
        </h3>
      </div>

      <div className="overflow-y-auto scroll-visible" style={{ maxHeight: 500 }}>
        {allAppts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[#9CA3AF]">No appointments.</p>
          </div>
        ) : (
          allAppts.map(a => {
            const c = statusColor(a.status);
            return (
              <div
                key={a.id}
                className="flex items-center gap-4 px-6 py-4 border-b border-[#F0F5F2] last:border-0"
              >
                <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: '#ECFDF5' }}>
                  <span className="text-[10px] font-bold text-[#16A34A] leading-none">{new Date(a.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-sm font-bold text-[#16A34A] leading-none">{new Date(a.date + 'T12:00:00').getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#14532D] truncate">{a.reason}</p>
                  <p className="text-xs text-[#9CA3AF]">{a.timeStart}–{a.timeEnd}</p>
                </div>
                <StatusBadge status={a.status} size="sm" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // ── Breadcrumb (desktop only) ────────────────────────────────────────────────
  const Breadcrumb = () => (
    <div className="flex items-center gap-1.5 text-xs font-medium mb-6">
      <button onClick={onBack} className="text-[#9CA3AF] hover:text-[#16A34A] transition-colors">Archived Patients</button>
      <ChevronRight size={13} color="#9CA3AF" />
      <span className="text-[#14532D]">{patient.name}</span>
    </div>
  );

  const RestoreButton = () => (
    <button
      onClick={() => setShowRestoreConfirm(true)}
      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
      style={{ background: 'linear-gradient(135deg,#16A34A,#10B981)' }}
    >
      <ArchiveRestore size={13} /> Restore this patient
    </button>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4 pt-2">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] w-fit">
            <ArrowLeft size={14} /> Back
          </button>
          <RestoreButton />
        </div>
        <InfoCard />
        <AppointmentsSection />
        {showRestoreConfirm && (
          <ConfirmDialog
            title={`Restore ${patient.name}?`}
            message="This will reactivate the patient and adjust their appointment statuses — appointments scheduled while archived will be cancelled, and future appointments will be reset to pending."
            confirmLabel="Yes, restore"
            onConfirm={handleRestore}
            onCancel={() => setShowRestoreConfirm(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center border border-[#E7F0EA] text-[#6B7280] hover:bg-[#F6FBF7] transition-colors bg-white shadow-sm">
            <ArrowLeft size={16} />
          </button>
          <Breadcrumb />
        </div>
        <RestoreButton />
      </div>

      <div className="flex gap-6 items-start">
        <InfoCard />
        <AppointmentsSection />
      </div>

      {showRestoreConfirm && (
        <ConfirmDialog
          title={`Restore ${patient.name}?`}
          message="This will reactivate the patient and adjust their appointment statuses — appointments scheduled while archived will be cancelled, and future appointments will be reset to pending."
          confirmLabel="Yes, restore"
          onConfirm={handleRestore}
          onCancel={() => setShowRestoreConfirm(false)}
        />
      )}
    </div>
  );
}
