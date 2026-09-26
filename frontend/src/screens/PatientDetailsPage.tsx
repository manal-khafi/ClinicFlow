import { useState, useEffect } from 'react';
import {
  ArrowLeft, Pencil, Trash2, Plus, Phone, MapPin, Calendar, Clock,
  ChevronRight, User, Loader2
} from 'lucide-react';
import {
  Patient, Appointment, calcAge, formatDate, initials, avatarGradient,
  statusColor, UserRole, TODAY
} from '../data';
import { StatusBadge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useIsMobile } from '../hooks/useIsMobile';
import { getPatientById } from '../api/patients.api';
import { getAppointmentsForPatient } from '../api/appointments.api';

interface PatientDetailsPageProps {
  patientId: string;
  userRole: UserRole;
  onBack: () => void;
  onNewAppointment: (patientId: string) => void;
}

export default function PatientDetailsPage({ patientId, userRole, onBack, onNewAppointment }: PatientDetailsPageProps) {
  const isMobile = useIsMobile();
  const { addToast } = useToast();
  const isAdmin = userRole === 'admin';
  const [tab, setTab] = useState<'all' | 'upcoming' | 'past'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    getPatientById(patientId)
      .then(p => { if (!cancelled) setPatient(p); })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          addToast('error', 'Failed to load patient.');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [patientId, addToast]);

  useEffect(() => {
    let cancelled = false;
    getAppointmentsForPatient(patientId)
      .then(appts => { if (!cancelled) setAppointments(appts); })
      .catch(() => { if (!cancelled) addToast('error', 'Failed to load appointments.'); });
    return () => { cancelled = true; };
  }, [patientId, addToast]);

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
        <p className="text-sm text-[#6B7280]">Patient not found.</p>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg,#16A34A,#10B981)' }}
        >
          <ArrowLeft size={14} /> Back to patients
        </button>
      </div>
    );
  }

  const allAppts = appointments;
  const filteredAppts = allAppts.filter(a => {
    if (tab === 'upcoming') return a.date >= TODAY && a.status !== 'cancelled';
    if (tab === 'past') return a.date < TODAY || a.status === 'cancelled';
    return true;
  });

  const age = calcAge(patient.dob);
  const grad = avatarGradient(patient.id);
  const init = initials(patient.name);

  // ── Info Card ───────────────────────────────────────────────────────────────
  const InfoCard = () => (
    <div className="bg-white rounded-2xl border border-[#E7F0EA] shadow-sm overflow-hidden flex-shrink-0" style={isMobile ? {} : { width: 300 }}>
      {/* Green band */}
      <div className="h-16 w-full" style={{ background: 'linear-gradient(135deg,#16A34A,#10B981)' }} />

      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="flex items-end justify-between -mt-8 mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white border-4 border-white shadow-md" style={{ background: grad }}>
            {init}
          </div>
          <div className="flex gap-1.5 mb-1">
            <button className="w-8 h-8 rounded-xl flex items-center justify-center border border-[#E7F0EA] text-[#9CA3AF] hover:bg-[#ECFDF5] hover:text-[#16A34A] transition-colors">
              <Pencil size={13} />
            </button>
            {isAdmin && (
              <button onClick={() => setShowDeleteConfirm(true)} className="w-8 h-8 rounded-xl flex items-center justify-center border border-[#E7F0EA] text-[#9CA3AF] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors">
                <Trash2 size={13} />
              </button>
            )}
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

  // ── Appointments section ─────────────────────────────────────────────────────
  const AppointmentsSection = () => (
    <div className="bg-white rounded-2xl border border-[#E7F0EA] shadow-sm flex-1 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7F0EA]">
        <h3 className="text-sm font-semibold text-[#14532D]" style={{ fontFamily: "'Poppins', sans-serif" }}>Appointments</h3>
        <button
          onClick={() => onNewAppointment(patient.id)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg,#16A34A,#10B981)' }}
        >
          <Plus size={13} /> New appointment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E7F0EA] px-6">
        {(['all', 'upcoming', 'past'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="mr-6 py-3 text-xs font-semibold capitalize border-b-2 transition-colors"
            style={{
              borderColor: tab === t ? '#16A34A' : 'transparent',
              color: tab === t ? '#16A34A' : '#9CA3AF',
            }}
          >
            {t} {t === 'all' && `(${allAppts.length})`}
          </button>
        ))}
      </div>

      {/* Appointment rows */}
      <div className="overflow-y-auto scroll-visible" style={{ maxHeight: 500 }}>
        {filteredAppts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[#9CA3AF]">No {tab === 'all' ? '' : tab} appointments.</p>
          </div>
        ) : (
          filteredAppts.map(a => {
            const c = statusColor(a.status);
            return (
              <div
                key={a.id}
                className="flex items-center gap-4 px-6 py-4 border-b border-[#F0F5F2] last:border-0 hover:bg-[#FAFCFB] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: '#ECFDF5' }}>
                  <span className="text-[10px] font-bold text-[#16A34A] leading-none">{new Date(a.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-sm font-bold text-[#16A34A] leading-none">{new Date(a.date + 'T12:00:00').getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#14532D] truncate">{a.reason}</p>
                  <p className="text-xs text-[#9CA3AF]">{a.timeStart}–{a.timeEnd} · by {a.createdBy}</p>
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
      <button onClick={onBack} className="text-[#9CA3AF] hover:text-[#16A34A] transition-colors">Patients</button>
      <ChevronRight size={13} color="#9CA3AF" />
      <span className="text-[#14532D]">{patient.name}</span>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4 pt-2">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] w-fit">
          <ArrowLeft size={14} /> Back to patients
        </button>
        <InfoCard />
        <AppointmentsSection />
        {showDeleteConfirm && (
          <ConfirmDialog title={`Delete ${patient.name}?`} message="All appointment records will be permanently removed." confirmLabel="Delete" onConfirm={() => { addToast('success', 'Patient deleted.'); onBack(); }} onCancel={() => setShowDeleteConfirm(false)} danger />
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center border border-[#E7F0EA] text-[#6B7280] hover:bg-[#F6FBF7] transition-colors bg-white shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <Breadcrumb />
      </div>

      <div className="flex gap-6 items-start">
        <InfoCard />
        <AppointmentsSection />
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog title={`Delete ${patient.name}?`} message="All appointment records for this patient will be permanently removed. This action cannot be undone." confirmLabel="Yes, delete patient" onConfirm={() => { addToast('success', `${patient.name} has been deleted.`); onBack(); }} onCancel={() => setShowDeleteConfirm(false)} danger />
      )}
    </div>
  );
}
