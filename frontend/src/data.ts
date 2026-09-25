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

export const PATIENTS: Patient[] = [
  { id: 'p1',  name: 'John Smith',       cin: 'AB123456', phone: '+1 (555) 234-5678', dob: '1981-03-12', address: '14 Maple St, Springfield', createdAt: '2025-01-08', createdBy: 'Dr. Rachel Kim' },
  { id: 'p2',  name: 'Maria Garcia',     cin: 'CD789012', phone: '+1 (555) 876-5432', dob: '1988-07-22', address: '87 Oak Avenue, Riverside',   createdAt: '2025-02-14', createdBy: 'Dr. Rachel Kim' },
  { id: 'p3',  name: 'David Chen',       cin: 'EF345678', phone: '+1 (555) 345-6789', dob: '1964-01-05', address: '203 Pine Rd, Lakeview',       createdAt: '2025-03-01', createdBy: 'Nurse James' },
  { id: 'p4',  name: 'Lisa Brown',       cin: 'GH901234', phone: '+1 (555) 654-3210', dob: '1997-11-14', address: '9 Elm Close, Westport',        createdAt: '2025-03-22', createdBy: 'Nurse James' },
  { id: 'p5',  name: 'Robert Wilson',    cin: 'IJ567890', phone: '+1 (555) 789-0123', dob: '1971-06-30', address: '55 Birch Lane, Milltown',      createdAt: '2025-04-05', createdBy: 'Dr. Rachel Kim' },
  { id: 'p6',  name: 'Emma Davis',       cin: 'KL123456', phone: '+1 (555) 456-7890', dob: '1994-09-08', address: '31 Cedar Blvd, Greenfield',    createdAt: '2025-04-18', createdBy: 'Dr. Rachel Kim' },
  { id: 'p7',  name: 'Michael Johnson',  cin: 'MN789012', phone: '+1 (555) 321-0987', dob: '1978-04-17', address: '72 Willow Way, Northgate',     createdAt: '2025-05-02', createdBy: 'Nurse James' },
  { id: 'p8',  name: 'Sarah Lee',        cin: 'OP345678', phone: '+1 (555) 567-8901', dob: '1990-12-03', address: '18 Ash Court, Hillside',        createdAt: '2025-05-29', createdBy: 'Dr. Rachel Kim' },
  { id: 'p9',  name: 'Ana Rodriguez',    cin: 'YZ345678', phone: '+1 (555) 901-2345', dob: '1985-02-28', address: '44 Poplar Crescent, Eastfield', createdAt: '2025-06-11', createdBy: 'Dr. Rachel Kim' },
  { id: 'p10', name: 'Peter Nguyen',     cin: 'AA901234', phone: '+1 (555) 678-9012', dob: '1973-08-19', address: '62 Spruce Row, Lakemoor',       createdAt: '2025-07-07', createdBy: 'Nurse James' },
  { id: 'p11', name: 'Fatima Al-Hassan', cin: 'ST567890', phone: '+1 (555) 432-1098', dob: '1980-05-14', address: '28 Sycamore St, Clearview',     createdAt: '2025-07-20', createdBy: 'Dr. Rachel Kim' },
  { id: 'p12', name: 'Carlos Mendez',    cin: 'UV123456', phone: '+1 (555) 210-9876', dob: '1968-10-23', address: '91 Walnut Ave, Bridgeport',     createdAt: '2025-08-03', createdBy: 'Nurse James' },
  { id: 'p13', name: 'Yuki Tanaka',      cin: 'WX789012', phone: '+1 (555) 109-8765', dob: '2002-03-30', address: '5 Chestnut Place, Edgewater',   createdAt: '2025-08-14', createdBy: 'Dr. Rachel Kim' },
  { id: 'p14', name: 'Omar Hassan',      cin: 'CC123456', phone: '+1 (555) 987-6543', dob: '1960-12-09', address: '37 Magnolia Rd, Fairview',      createdAt: '2025-09-01', createdBy: 'Nurse James' },
  { id: 'p15', name: 'Nina Patel',       cin: 'DD789012', phone: '+1 (555) 876-4321', dob: '1995-07-17', address: '110 Hazel Blvd, Maplewood',     createdAt: '2025-09-18', createdBy: 'Dr. Rachel Kim' },
  { id: 'p16', name: 'Kevin Brown',      cin: 'EE345678', phone: '+1 (555) 765-4321', dob: '1983-04-02', address: '76 Juniper Lane, Stonebridge',   createdAt: '2025-10-05', createdBy: 'Dr. Rachel Kim' },
  { id: 'p17', name: 'Sophie Laurent',   cin: 'FF901234', phone: '+1 (555) 654-3219', dob: '1991-11-28', address: '22 Rosewood Dr, Pinehurst',     createdAt: '2025-11-12', createdBy: 'Nurse James' },
  { id: 'p18', name: 'Ahmed Benali',     cin: 'GG567890', phone: '+1 (555) 543-2198', dob: '1977-08-06', address: '49 Larch Way, Ridgemont',       createdAt: '2025-12-01', createdBy: 'Dr. Rachel Kim' },
  { id: 'p19', name: 'Priya Sharma',     cin: 'HH123456', phone: '+1 (555) 432-1987', dob: '1989-02-19', address: '88 Beech Court, Sunvalley',     createdAt: '2026-01-14', createdBy: 'Dr. Rachel Kim' },
  { id: 'p20', name: 'Clara Thompson',   cin: 'BB567890', phone: '+1 (555) 321-9876', dob: '1976-06-11', address: '15 Cypress Ave, Harborview',    createdAt: '2026-02-28', createdBy: 'Nurse James' },
  { id: 'p21', name: 'James Martinez',   cin: 'QR901234', phone: '+1 (555) 219-8765', dob: '1965-09-25', address: '33 Alder Rd, Westbrook',        createdAt: '2026-03-10', createdBy: 'Dr. Rachel Kim' },
];

// ─── Users ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export const USERS: User[] = [
  { id: 'u1', name: 'Dr. Rachel Kim',  email: 'rachel.kim@clinicflow.app',  role: 'admin', createdAt: '2024-06-01' },
  { id: 'u2', name: 'Nurse James',     email: 'james.carter@clinicflow.app', role: 'staff', createdAt: '2024-06-15' },
  { id: 'u3', name: 'Dr. Laura Reyes', email: 'laura.reyes@clinicflow.app',  role: 'admin', createdAt: '2024-08-03' },
  { id: 'u4', name: 'Admin Aisha',     email: 'aisha.m@clinicflow.app',      role: 'admin', createdAt: '2024-09-20' },
  { id: 'u5', name: 'Nurse Sophie',    email: 'sophie.v@clinicflow.app',     role: 'staff', createdAt: '2025-01-10' },
  { id: 'u6', name: 'Dr. Kevin Park',  email: 'kevin.park@clinicflow.app',   role: 'staff', createdAt: '2025-03-08' },
  { id: 'u7', name: 'Receptionist Ana', email: 'ana.m@clinicflow.app',       role: 'staff', createdAt: '2025-07-22' },
];

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

export const APPOINTMENTS: Appointment[] = [
  { id: 'a1',  patientId: 'p1',  patientName: 'John Smith',       patientCin: 'AB123456', date: '2026-09-03', timeStart: '09:00', timeEnd: '09:30', reason: 'Annual checkup',           status: 'confirmed', createdBy: 'Dr. Rachel Kim' },
  { id: 'a2',  patientId: 'p2',  patientName: 'Maria Garcia',     patientCin: 'CD789012', date: '2026-09-03', timeStart: '14:30', timeEnd: '15:00', reason: 'Blood pressure follow-up',  status: 'pending',   createdBy: 'Nurse James' },
  { id: 'a3',  patientId: 'p3',  patientName: 'David Chen',       patientCin: 'EF345678', date: '2026-09-05', timeStart: '09:00', timeEnd: '09:30', reason: 'Diabetes management',       status: 'confirmed', createdBy: 'Dr. Rachel Kim' },
  { id: 'a4',  patientId: 'p4',  patientName: 'Lisa Brown',       patientCin: 'GH901234', date: '2026-09-05', timeStart: '11:00', timeEnd: '11:30', reason: 'Skin rash consultation',    status: 'pending',   createdBy: 'Nurse James' },
  { id: 'a5',  patientId: 'p5',  patientName: 'Robert Wilson',    patientCin: 'IJ567890', date: '2026-09-05', timeStart: '15:00', timeEnd: '15:30', reason: 'Post-surgery follow-up',    status: 'confirmed', createdBy: 'Dr. Rachel Kim' },
  { id: 'a6',  patientId: 'p6',  patientName: 'Emma Davis',       patientCin: 'KL123456', date: '2026-09-08', timeStart: '10:30', timeEnd: '11:00', reason: 'Prenatal visit',            status: 'confirmed', createdBy: 'Dr. Rachel Kim' },
  { id: 'a7',  patientId: 'p7',  patientName: 'Michael Johnson',  patientCin: 'MN789012', date: '2026-09-10', timeStart: '09:30', timeEnd: '10:00', reason: 'Cholesterol check',         status: 'pending',   createdBy: 'Nurse James' },
  { id: 'a8',  patientId: 'p8',  patientName: 'Sarah Lee',        patientCin: 'OP345678', date: '2026-09-10', timeStart: '13:00', timeEnd: '13:30', reason: 'Migraine consultation',     status: 'confirmed', createdBy: 'Dr. Rachel Kim' },
  { id: 'a9',  patientId: 'p21', patientName: 'James Martinez',   patientCin: 'QR901234', date: '2026-09-10', timeStart: '15:30', timeEnd: '16:00', reason: 'Physical therapy eval',     status: 'pending',   createdBy: 'Nurse James' },
  { id: 'a10', patientId: 'p11', patientName: 'Fatima Al-Hassan', patientCin: 'ST567890', date: '2026-09-15', timeStart: '10:00', timeEnd: '10:30', reason: 'Thyroid follow-up',         status: 'confirmed', createdBy: 'Dr. Rachel Kim' },
  { id: 'a11', patientId: 'p12', patientName: 'Carlos Mendez',    patientCin: 'UV123456', date: '2026-09-17', timeStart: '11:30', timeEnd: '12:00', reason: 'Vaccination',               status: 'confirmed', createdBy: 'Nurse James' },
  { id: 'a12', patientId: 'p13', patientName: 'Yuki Tanaka',      patientCin: 'WX789012', date: '2026-09-19', timeStart: '09:00', timeEnd: '09:30', reason: 'Allergy testing',           status: 'cancelled', createdBy: 'Dr. Rachel Kim' },
  { id: 'a13', patientId: 'p9',  patientName: 'Ana Rodriguez',    patientCin: 'YZ345678', date: '2026-09-24', timeStart: '09:00', timeEnd: '09:30', reason: 'Annual checkup',           status: 'confirmed', createdBy: 'Dr. Rachel Kim' },
  { id: 'a14', patientId: 'p10', patientName: 'Peter Nguyen',     patientCin: 'AA901234', date: '2026-09-24', timeStart: '11:30', timeEnd: '12:00', reason: 'Back pain assessment',      status: 'pending',   createdBy: 'Nurse James' },
  { id: 'a15', patientId: 'p20', patientName: 'Clara Thompson',   patientCin: 'BB567890', date: '2026-09-24', timeStart: '14:00', timeEnd: '14:30', reason: 'Lab results review', notes: 'Bring previous reports', status: 'cancelled', createdBy: 'Dr. Rachel Kim' },
  { id: 'a16', patientId: 'p14', patientName: 'Omar Hassan',      patientCin: 'CC123456', date: '2026-09-25', timeStart: '10:00', timeEnd: '10:30', reason: 'Hypertension follow-up',    status: 'confirmed', createdBy: 'Dr. Rachel Kim' },
  { id: 'a17', patientId: 'p15', patientName: 'Nina Patel',       patientCin: 'DD789012', date: '2026-09-25', timeStart: '16:00', timeEnd: '16:30', reason: 'Vitamin D deficiency',      status: 'pending',   createdBy: 'Nurse James' },
  { id: 'a18', patientId: 'p16', patientName: 'Kevin Brown',      patientCin: 'EE345678', date: '2026-09-26', timeStart: '09:30', timeEnd: '10:00', reason: 'ECG follow-up',             status: 'confirmed', createdBy: 'Dr. Rachel Kim' },
  { id: 'a19', patientId: 'p17', patientName: 'Sophie Laurent',   patientCin: 'FF901234', date: '2026-09-29', timeStart: '14:00', timeEnd: '14:30', reason: 'Asthma management',         status: 'pending',   createdBy: 'Nurse James' },
  { id: 'a20', patientId: 'p18', patientName: 'Ahmed Benali',     patientCin: 'GG567890', date: '2026-09-29', timeStart: '10:30', timeEnd: '11:00', reason: 'Routine blood work',        status: 'confirmed', createdBy: 'Dr. Rachel Kim' },
  { id: 'a21', patientId: 'p19', patientName: 'Priya Sharma',     patientCin: 'HH123456', date: '2026-09-29', timeStart: '15:30', timeEnd: '16:00', reason: 'Mental health check',       status: 'pending',   createdBy: 'Nurse James' },
  { id: 'a22', patientId: 'p1',  patientName: 'John Smith',       patientCin: 'AB123456', date: '2026-10-07', timeStart: '10:00', timeEnd: '10:30', reason: 'Follow-up lab results',     status: 'confirmed', createdBy: 'Dr. Rachel Kim' },
  { id: 'a23', patientId: 'p2',  patientName: 'Maria Garcia',     patientCin: 'CD789012', date: '2026-10-12', timeStart: '11:00', timeEnd: '11:30', reason: 'Medication review',         status: 'pending',   createdBy: 'Nurse James' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const TODAY = '2026-09-24';

export function getAppointmentsForDate(date: string): Appointment[] {
  return APPOINTMENTS.filter(a => a.date === date);
}

export function getAppointmentsForPatient(patientId: string): Appointment[] {
  return APPOINTMENTS.filter(a => a.patientId === patientId);
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
