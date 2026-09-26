import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, AlertCircle, ChevronDown, Search } from 'lucide-react';
import { Patient } from '../data';
import { appointmentSchema, AppointmentFormValues } from '../validators/appointment.schema';
import { getPatients } from '../api/patients.api';
import { createAppointment } from '../api/appointments.api';

interface NewAppointmentModalProps {
  onClose: () => void;
  defaultDate?: string;
  isMobile?: boolean;
  onSuccess?: () => void;
}

export default function NewAppointmentModal({ onClose, defaultDate, isMobile, onSuccess }: NewAppointmentModalProps) {
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: '',
      appointmentDate: '',
      reason: '',
      notes: '',
      status: 'pending',
    },
  });

  const [patientSearch, setPatientSearch] = useState('');
  const [debouncedPatientSearch, setDebouncedPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [selectedPatientObj, setSelectedPatientObj] = useState<Patient | null>(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const [date, setDate] = useState(defaultDate ?? '');
  const [time, setTime] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [saved, setSaved] = useState(false);

  const status = watch('status');

  // Search-as-you-type against the real patients API, debounced ~300ms.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedPatientSearch(patientSearch), 300);
    return () => clearTimeout(t);
  }, [patientSearch]);

  useEffect(() => {
    let cancelled = false;
    getPatients({ search: debouncedPatientSearch, limit: 10 })
      .then(res => { if (!cancelled) setPatientResults(res.data); })
      .catch(() => { if (!cancelled) setPatientResults([]); });
    return () => { cancelled = true; };
  }, [debouncedPatientSearch]);

  // The UI keeps separate Date/Time inputs (unchanged), but the schema — matching the
  // backend — validates a single combined appointmentDate. Keep RHF's hidden field in sync.
  useEffect(() => {
    setValue('appointmentDate', date && time ? `${date}T${time}` : '', { shouldValidate: false });
  }, [date, time, setValue]);

  async function onSubmit(data: AppointmentFormValues) {
    setSubmitError('');
    try {
      await createAppointment(data);
      setSaved(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 800);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setSubmitError(err.response.data?.error ?? 'This patient already has a confirmed appointment within 30 minutes of this time.');
      } else {
        setSubmitError('Something went wrong. Please try again.');
      }
    }
  }

  const inputClass = "w-full border border-[#E7F0EA] rounded-xl px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all bg-white";

  const content = (
    <div className={isMobile ? '' : 'bg-white rounded-2xl shadow-2xl border border-[#E7F0EA] w-full max-w-md'} style={!isMobile ? { boxShadow: '0 24px 64px rgba(22,163,74,0.12), 0 4px 20px rgba(0,0,0,0.08)' } : {}}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#E7F0EA]">
        <div>
          <h2 className="text-base font-semibold text-[#14532D]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            New Appointment
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Fill in patient details and schedule</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-[#F6FBF7] text-[#9CA3AF] hover:text-[#4B5563]"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={e => { setSubmitted(true); handleSubmit(onSubmit)(e); }}>
        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Conflict error / server error */}
          {submitError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl border" style={{ background: '#FEF2F2', borderColor: '#FCA5A5' }}>
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" color="#DC2626" />
              <p className="text-xs font-medium" style={{ color: '#DC2626' }}>
                {submitError}
              </p>
            </div>
          )}

          {/* Patient */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Patient <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div
                className={`${inputClass} flex items-center gap-2 cursor-pointer ${submitted && errors.patientId ? 'border-red-300 ring-2 ring-red-100' : ''}`}
                onClick={() => setShowPatientDropdown(v => !v)}
              >
                <Search size={14} className="text-[#9CA3AF] flex-shrink-0" />
                <input
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#9CA3AF]"
                  placeholder="Search by name or CIN..."
                  value={selectedPatientObj ? selectedPatientObj.name : patientSearch}
                  onChange={e => {
                    setPatientSearch(e.target.value);
                    setSelectedPatientObj(null);
                    setValue('patientId', '');
                    setShowPatientDropdown(true);
                  }}
                  onFocus={() => setShowPatientDropdown(true)}
                />
                <ChevronDown size={14} className="text-[#9CA3AF] flex-shrink-0" />
              </div>
              {showPatientDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E7F0EA] rounded-xl shadow-lg z-20 max-h-44 overflow-y-auto">
                  {patientResults.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-[#9CA3AF]">No patients found</p>
                  ) : patientResults.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className="w-full text-left px-4 py-2.5 hover:bg-[#ECFDF5] transition-colors flex items-center justify-between"
                      onClick={() => {
                        setValue('patientId', p.id, { shouldValidate: submitted });
                        setSelectedPatientObj(p);
                        setPatientSearch('');
                        setShowPatientDropdown(false);
                      }}
                    >
                      <span className="text-sm font-medium text-[#1F2937]">{p.name}</span>
                      <span className="text-xs text-[#9CA3AF]">{p.cin}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {submitted && errors.patientId && <p className="text-xs text-red-500 mt-1">{errors.patientId.message}</p>}
          </div>

          {/* Date & Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={`${inputClass} ${submitted && errors.appointmentDate && !date ? 'border-red-300 ring-2 ring-red-100' : ''}`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Time <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className={`${inputClass} ${submitted && errors.appointmentDate ? 'border-red-300 ring-2 ring-red-100' : ''}`}
              />
            </div>
          </div>
          {submitted && errors.appointmentDate && <p className="text-xs text-red-500 -mt-2">{errors.appointmentDate.message}</p>}

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Reason <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Annual checkup, Follow-up..."
              {...register('reason')}
              className={`${inputClass} ${submitted && errors.reason ? 'border-red-300 ring-2 ring-red-100' : ''}`}
            />
            {submitted && errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason.message}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Notes <span className="text-[#9CA3AF] font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Additional notes or instructions..."
              {...register('notes')}
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">Status</label>
            <div className="flex gap-2">
              {(['pending', 'confirmed'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue('status', s)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all"
                  style={{
                    borderColor: status === s ? (s === 'confirmed' ? '#16A34A' : '#D97706') : '#E7F0EA',
                    background: status === s ? (s === 'confirmed' ? '#ECFDF5' : '#FEF3C7') : '#fff',
                    color: status === s ? (s === 'confirmed' ? '#16A34A' : '#B45309') : '#9CA3AF',
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5 border-t border-[#E7F0EA]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#E7F0EA] text-[#6B7280] transition-all hover:bg-[#F6FBF7] active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            style={{ background: saved ? '#10B981' : 'linear-gradient(135deg, #16A34A, #10B981)' }}
          >
            {saved ? '✓ Saved!' : isSubmitting ? 'Saving…' : 'Save Appointment'}
          </button>
        </div>
      </form>
    </div>
  );

  if (isMobile) return content;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md" onClick={e => e.stopPropagation()}>
        {content}
      </div>
    </div>
  );
}
