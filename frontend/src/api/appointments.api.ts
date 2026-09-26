import axiosInstance from './axiosInstance';
import { Appointment, AppointmentStatus } from '../data';
import { AppointmentFormValues } from '../validators/appointment.schema';

interface ApiAppointment {
  id: string;
  patientId: string;
  createdById: string;
  appointmentDate: string;
  endsAt: string;
  status: AppointmentStatus;
  reason: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: { fullName: string; cin: string };
  createdBy?: { fullName: string };
}

interface PaginatedAppointments {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toLocalTimeStr(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// The backend stores appointmentDate/endsAt as UTC timestamps and nests patient/createdBy
// objects; the frontend's existing `Appointment` type (data.ts) expects a plain date +
// separate start/end time strings and flat patientName/patientCin/createdBy strings, all
// implicitly in the viewer's local time (that's what every screen's JSX already reads, and
// none of it changes here). This maps one shape into the other.
function mapApiAppointment(a: ApiAppointment): Appointment {
  const start = new Date(a.appointmentDate);
  const end = new Date(a.endsAt);
  return {
    id: a.id,
    patientId: a.patientId,
    patientName: a.patient?.fullName ?? '',
    patientCin: a.patient?.cin ?? '',
    date: toLocalDateStr(start),
    timeStart: toLocalTimeStr(start),
    timeEnd: toLocalTimeStr(end),
    reason: a.reason,
    notes: a.notes ?? undefined,
    status: a.status,
    createdBy: a.createdBy?.fullName ?? '',
  };
}

export interface GetAppointmentsParams {
  date?: string;
  status?: AppointmentStatus;
  page?: number;
  limit?: number;
}

export async function getAppointments({ date, status, page, limit }: GetAppointmentsParams = {}): Promise<PaginatedAppointments> {
  const { data } = await axiosInstance.get('/appointments', {
    params: { date: date || undefined, status: status || undefined, page, limit },
  });

  return {
    data: data.data.map(mapApiAppointment),
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages,
  };
}

export async function getAppointmentById(id: string): Promise<Appointment> {
  const { data } = await axiosInstance.get(`/appointments/${id}`);
  return mapApiAppointment(data);
}

export async function createAppointment(payload: AppointmentFormValues): Promise<Appointment> {
  const { data } = await axiosInstance.post('/appointments', payload);
  return mapApiAppointment(data);
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
  const { data } = await axiosInstance.patch(`/appointments/${id}/status`, { status });
  return mapApiAppointment(data);
}

export async function getAppointmentsForPatient(patientId: string): Promise<Appointment[]> {
  const { data } = await axiosInstance.get(`/patients/${patientId}/appointments`);
  return data.map(mapApiAppointment);
}
