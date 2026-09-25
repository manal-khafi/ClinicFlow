import { useState } from 'react';
import { X, AlertCircle, ChevronDown, Search } from 'lucide-react';
import { Patient, Appointment } from '../data';

interface NewAppointmentModalProps {
  onClose: () => void;
  defaultDate?: string;
  isMobile?: boolean;
}

// TODO: replace with real API call
const PATIENTS: Patient[] = [];
// TODO: replace with real API call
const APPOINTMENTS: Appointment[] = [];

function checkConflict(patientId: string, date: string, timeStart: string): boolean {
  const patient = PATIENTS.find(p => p.id === patientId);
  if (!patient) return false;
  const [h, m] = timeStart.split(':').map(Number);
  const newMinutes = h * 60 + m;
  return APPOINTMENTS.some(a => {
    if (a.patientCin !== patient.cin) return false;
    if (a.date !== date) return false;
    if (a.status !== 'confirmed') return false;
    const [ah, am] = a.timeStart.split(':').map(Number);
    const existingMinutes = ah * 60 + am;
    return Math.abs(newMinutes - existingMinutes) < 30;
  });
}

export default function NewAppointmentModal({ onClose, defaultDate, isMobile }: NewAppointmentModalProps) {
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [date, setDate] = useState(defaultDate || '2026-09-24');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'pending' | 'confirmed'>('pending');
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const filteredPatients = PATIENTS.filter(p =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.cin.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const hasConflict = selectedPatient && date && time && status === 'confirmed'
    ? checkConflict(selectedPatient, date, time)
    : false;

  const selectedPatientObj = PATIENTS.find(p => p.id === selectedPatient);

  function handleSave() {
    setSubmitted(true);
    if (!selectedPatient || !date || !time || !reason) return;
    setSaved(true);
    setTimeout(() => onClose(), 800);
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
          onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-[#F6FBF7] text-[#9CA3AF] hover:text-[#4B5563]"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 flex flex-col gap-4">
        {/* Conflict error */}
        {hasConflict && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl border" style={{ background: '#FEF2F2', borderColor: '#FCA5A5' }}>
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" color="#DC2626" />
            <p className="text-xs font-medium" style={{ color: '#DC2626' }}>
              This patient already has a confirmed appointment within 30 minutes of this time.
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
              className={`${inputClass} flex items-center gap-2 cursor-pointer ${submitted && !selectedPatient ? 'border-red-300 ring-2 ring-red-100' : ''}`}
              onClick={() => setShowPatientDropdown(v => !v)}
            >
              <Search size={14} className="text-[#9CA3AF] flex-shrink-0" />
              <input
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#9CA3AF]"
                placeholder="Search by name or CIN..."
                value={selectedPatientObj ? selectedPatientObj.name : patientSearch}
                onChange={e => {
                  setPatientSearch(e.target.value);
                  setSelectedPatient('');
                  setShowPatientDropdown(true);
                }}
                onFocus={() => setShowPatientDropdown(true)}
              />
              <ChevronDown size={14} className="text-[#9CA3AF] flex-shrink-0" />
            </div>
            {showPatientDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E7F0EA] rounded-xl shadow-lg z-20 max-h-44 overflow-y-auto">
                {filteredPatients.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-[#9CA3AF]">No patients found</p>
                ) : filteredPatients.map(p => (
                  <button
                    key={p.id}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#ECFDF5] transition-colors flex items-center justify-between"
                    onClick={() => {
                      setSelectedPatient(p.id);
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
          {submitted && !selectedPatient && <p className="text-xs text-red-500 mt-1">Patient is required</p>}
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
              className={`${inputClass} ${submitted && !date ? 'border-red-300 ring-2 ring-red-100' : ''}`}
            />
            {submitted && !date && <p className="text-xs text-red-500 mt-1">Required</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Time <span className="text-red-400">*</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className={`${inputClass} ${submitted && !time ? 'border-red-300 ring-2 ring-red-100' : ''}`}
            />
            {submitted && !time && <p className="text-xs text-red-500 mt-1">Required</p>}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">
            Reason <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Annual checkup, Follow-up..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            className={`${inputClass} ${submitted && !reason ? 'border-red-300 ring-2 ring-red-100' : ''}`}
          />
          {submitted && !reason && <p className="text-xs text-red-500 mt-1">Reason is required</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5">
            Notes <span className="text-[#9CA3AF] font-normal">(optional)</span>
          </label>
          <textarea
            placeholder="Additional notes or instructions..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
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
                onClick={() => setStatus(s)}
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
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#E7F0EA] text-[#6B7280] transition-all hover:bg-[#F6FBF7] active:scale-95"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: saved ? '#10B981' : 'linear-gradient(135deg, #16A34A, #10B981)' }}
        >
          {saved ? '✓ Saved!' : 'Save Appointment'}
        </button>
      </div>
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
