import { useState } from 'react';
import StatCards from '../components/StatCards';
import Calendar from '../components/Calendar';
import AppointmentDetailsPopover from '../components/AppointmentDetailsPopover';
import NewAppointmentModal from '../components/NewAppointmentModal';
import BottomSheet from '../components/ui/BottomSheet';
import MobileDashboard from '../components/MobileDashboard';
import { Appointment } from '../data';
import { useIsMobile } from '../hooks/useIsMobile';

export default function DashboardPage() {
  const isMobile = useIsMobile();
  const [showNewAppt, setShowNewAppt] = useState(false);
  const [newApptDate, setNewApptDate] = useState<string | undefined>();
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  // Bumped whenever the modal (a sibling of Calendar/MobileDashboard) creates an
  // appointment, so those components know to refetch instead of showing stale data.
  const [refreshKey, setRefreshKey] = useState(0);

  function handleNewAppt(date?: string) {
    setNewApptDate(date);
    setShowNewAppt(true);
  }

  function handleAppointmentCreated() {
    setRefreshKey(k => k + 1);
  }

  if (isMobile) {
    return (
      <>
        <MobileDashboard onNewAppointment={handleNewAppt} onSelectAppointment={setSelectedAppt} refreshTrigger={refreshKey} />
        {showNewAppt && (
          <BottomSheet onClose={() => setShowNewAppt(false)}>
            <NewAppointmentModal onClose={() => setShowNewAppt(false)} defaultDate={newApptDate} isMobile onSuccess={handleAppointmentCreated} />
          </BottomSheet>
        )}
        {selectedAppt && (
          <AppointmentDetailsPopover
            appointment={selectedAppt}
            onClose={() => setSelectedAppt(null)}
            onConfirm={() => setSelectedAppt(null)}
            onCancel={() => setSelectedAppt(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <StatCards />
        <Calendar onNewAppointment={handleNewAppt} onSelectAppointment={setSelectedAppt} refreshTrigger={refreshKey} />
      </div>
      {showNewAppt && <NewAppointmentModal onClose={() => setShowNewAppt(false)} defaultDate={newApptDate} onSuccess={handleAppointmentCreated} />}
      {selectedAppt && (
        <AppointmentDetailsPopover
          appointment={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          onConfirm={() => setSelectedAppt(null)}
          onCancel={() => setSelectedAppt(null)}
        />
      )}
    </>
  );
}
