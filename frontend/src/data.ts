export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled';
export type UserRole = 'admin' | 'staff';

// ─── Patients ────────────────────────────────────────────────────────────────

export interface Patient {
  id: string;
  name: string;
  cin: string;
  phone: string;
  dob: string;       // YYYY-MM-DD
  address: string;
  createdAt: string; // YYYY-MM-DD
  createdBy: string;
}

// TODO: replace with real API call

// ─── Users ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// TODO: replace with real API call

// ─── Appointments ─────────────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientCin: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  reason: string;
  notes?: string;
  status: AppointmentStatus;
  createdBy: string;
}

// TODO: replace with real API call

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const TODAY = '2026-09-24';

export function getAppointmentsForDate(date: string): Appointment[] {
  // TODO: replace with real API call
  return [];
}

export function getAppointmentsForPatient(patientId: string): Appointment[] {
  // TODO: replace with real API call
  return [];
}

export function statusColor(status: AppointmentStatus) {
  switch (status) {
    case 'confirmed': return { bg: '#DCFCE7', border: '#16A34A', text: '#15803D' };
    case 'pending':   return { bg: '#FEF3C7', border: '#D97706', text: '#B45309' };
    case 'cancelled': return { bg: '#F3F4F6', border: '#9CA3AF', text: '#6B7280' };
  }
}

export function statusLabel(status: AppointmentStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function calcAge(dob: string): number {
  const birth = new Date(dob);
  const now = new Date(TODAY);
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

// Gradient per initials (deterministic colour cycling)
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#16A34A,#10B981)',
  'linear-gradient(135deg,#2563EB,#60A5FA)',
  'linear-gradient(135deg,#7C3AED,#A78BFA)',
  'linear-gradient(135deg,#D97706,#FCD34D)',
  'linear-gradient(135deg,#DC2626,#F87171)',
  'linear-gradient(135deg,#0891B2,#67E8F9)',
];
export function avatarGradient(id: string): string {
  const n = id.charCodeAt(id.length - 1) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[n];
}
