import axiosInstance from './axiosInstance';
import { UserRole } from '../data';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>('/auth/login', { email, password });
  return data;
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await axiosInstance.get<AuthUser>('/auth/me');
  return data;
}
