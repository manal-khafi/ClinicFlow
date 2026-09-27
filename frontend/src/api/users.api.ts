import axiosInstance from './axiosInstance';
import { User } from '../data';
import { CreateUserFormValues, UpdateUserFormValues } from '../validators/user.schema';

interface ApiUser {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'staff';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// The backend's user shape (fullName, no `name`) differs from the frontend's existing
// `User` type in data.ts, which every screen's JSX already reads — same translation-layer
// pattern as mapApiPatient/mapApiAppointment.
function mapApiUser(u: ApiUser): User {
  return {
    id: u.id,
    name: u.fullName,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.slice(0, 10),
    isActive: u.isActive,
  };
}

export interface GetUsersParams {
  search?: string;
  page?: number;
  limit?: number;
}

export async function getUsers({ search, page, limit }: GetUsersParams = {}): Promise<PaginatedUsers> {
  const { data } = await axiosInstance.get('/users', {
    params: { search: search || undefined, page, limit },
  });

  return {
    data: data.data.map(mapApiUser),
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages,
  };
}

export async function getUserById(id: string): Promise<User> {
  const { data } = await axiosInstance.get(`/users/${id}`);
  return mapApiUser(data);
}

export async function createUser(payload: CreateUserFormValues): Promise<User> {
  const { data } = await axiosInstance.post('/users', payload);
  return mapApiUser(data);
}

export async function updateUser(id: string, payload: UpdateUserFormValues): Promise<User> {
  const { data } = await axiosInstance.put(`/users/${id}`, payload);
  return mapApiUser(data);
}

export async function deactivateUser(id: string): Promise<User> {
  const { data } = await axiosInstance.patch(`/users/${id}/deactivate`);
  return mapApiUser(data);
}

export async function reactivateUser(id: string): Promise<User> {
  const { data } = await axiosInstance.patch(`/users/${id}/reactivate`);
  return mapApiUser(data);
}
