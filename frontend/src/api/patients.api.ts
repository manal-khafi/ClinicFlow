import axiosInstance from './axiosInstance';
import { Patient } from '../data';
import { PatientFormValues } from '../validators/patient.schema';

interface ApiPatient {
  id: string;
  fullName: string;
  cin: string;
  phone: string;
  birthDate: string;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface PaginatedPatients {
  data: Patient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// The backend's patient shape (fullName/birthDate, no createdBy) differs from the
// frontend's existing `Patient` type in data.ts, which was designed for the old mock
// data and is still what every screen's JSX reads. Mapping here means none of that
// JSX has to change. `createdBy` has no backend equivalent for patients, so it's left
// blank rather than invented. Dates come back as full ISO datetimes; data.ts's
// formatDate()/calcAge() expect a plain YYYY-MM-DD string, hence the slice(0, 10).
function mapApiPatient(p: ApiPatient): Patient {
  return {
    id: p.id,
    name: p.fullName,
    cin: p.cin,
    phone: p.phone,
    dob: p.birthDate.slice(0, 10),
    address: p.address ?? '',
    createdAt: p.createdAt.slice(0, 10),
    createdBy: '',
  };
}

export interface GetPatientsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export async function getPatients({ search, page, limit }: GetPatientsParams = {}): Promise<PaginatedPatients> {
  const { data } = await axiosInstance.get('/patients', {
    params: { search: search || undefined, page, limit },
  });

  return {
    data: data.data.map(mapApiPatient),
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages,
  };
}

export async function getPatientById(id: string): Promise<Patient> {
  const { data } = await axiosInstance.get(`/patients/${id}`);
  return mapApiPatient(data);
}

export async function createPatient(payload: PatientFormValues): Promise<Patient> {
  const { data } = await axiosInstance.post('/patients', payload);
  return mapApiPatient(data);
}

export async function updatePatient(id: string, payload: Partial<PatientFormValues>): Promise<Patient> {
  const { data } = await axiosInstance.put(`/patients/${id}`, payload);
  return mapApiPatient(data);
}

export async function deletePatient(id: string): Promise<void> {
  await axiosInstance.delete(`/patients/${id}`);
}
