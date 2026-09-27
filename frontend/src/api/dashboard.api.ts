import axiosInstance from './axiosInstance';

export interface DashboardStats {
  totalPatients: number;
  todaysAppointments: number;
  pending: number;
  confirmed: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await axiosInstance.get('/dashboard/stats');
  return data;
}
