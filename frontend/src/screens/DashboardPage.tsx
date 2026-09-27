import { useState, useEffect, useCallback } from 'react';
import StatCards from '../components/StatCards';
import Calendar from '../components/Calendar';
import AppointmentDetailsPopover from '../components/AppointmentDetailsPopover';
import NewAppointmentModal from '../components/NewAppointmentModal';
import BottomSheet from '../components/ui/BottomSheet';
import MobileDashboard from '../components/MobileDashboard';
import { Appointment } from '../data';
import { useIsMobile } from '../hooks/useIsMobile';
import { getDashboardStats, DashboardStats } from '../api/dashboard.api';
import { updateAppointmentStatus } from '../api/appointments.api';

export default function DashboardPage() {
  const isMobile = useIsMobile();
  const [showNewAppt, setShowNewAppt] = useState(false);
  const [newApptDate, setNewApptDate] = useState<string | undefined>();
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [popoverError, setPopoverError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  // Bumped whenever the modal (a sibling of Calendar/MobileDashboard) creates an
  // appointment, or a status changes via the popover — Calendar/MobileDashboard and the
  // stats fetch below both key off this to refetch instead of showing stale data.
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      setStats(await getDashboardStats());
    } catch {
      // keep whatever stats we had; cards fall back to a loading skeleton if none yet
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats, refreshKey]);

  function handleNewAppt(date?: string) {
    setNewApptDate(date);
    setShowNewAppt(true);
  }

  function handleAppointmentCreated() {
    setRefreshKey(k => k + 1);
  }

  function handleSelectAppointment(a: Appointment) {
    setPopoverError('');
    setSelectedAppt(a);
  }

  async function handleConfirmAppointment(id: string) {
    setPopoverError('');
    setIsUpdatingStatus(true);
    try {
      await updateAppointmentStatus(id, 'confirmed');
      setSelectedAppt(null);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setPopoverError(err.response.data?.error ?? 'This patient already has a confirmed appointment within 30 minutes of this time.');
      } else {
        setPopoverError('Failed to update appointment status.');
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleCancelAppointment(id: string) {
    setPopoverError('');
    setIsUpdatingStatus(true);
    try {
      await updateAppointmentStatus(id, 'cancelled');
      setSelectedAppt(null);
      setRefreshKey(k => k + 1);
    } catch {
      setPopoverError('Failed to update appointment status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  if (isMobile) {
    return (
      <>
        <MobileDashboard
          onNewAppointment={handleNewAppt}
          onSelectAppointment={handleSelectAppointment}
          refreshTrigger={refreshKey}
          stats={stats}
          statsLoading={statsLoading}
        />
        {showNewAppt && (
          <BottomSheet onClose={() => setShowNewAppt(false)}>
            <NewAppointmentModal onClose={() => setShowNewAppt(false)} defaultDate={newApptDate} isMobile onSuccess={handleAppointmentCreated} />
          </BottomSheet>
        )}
        {selectedAppt && (
          <AppointmentDetailsPopover
            appointment={selectedAppt}
            onClose={() => setSelectedAppt(null)}
            onConfirm={handleConfirmAppointment}
            onCancel={handleCancelAppointment}
            isSubmitting={isUpdatingStatus}
            error={popoverError}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <StatCards stats={stats} loading={statsLoading} />
        <Calendar onNewAppointment={handleNewAppt} onSelectAppointment={handleSelectAppointment} refreshTrigger={refreshKey} />
      </div>
      {showNewAppt && <NewAppointmentModal onClose={() => setShowNewAppt(false)} defaultDate={newApptDate} onSuccess={handleAppointmentCreated} />}
      {selectedAppt && (
        <AppointmentDetailsPopover
          appointment={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          onConfirm={handleConfirmAppointment}
          onCancel={handleCancelAppointment}
          isSubmitting={isUpdatingStatus}
          error={popoverError}
        />
      )}
    </>
  );
}
