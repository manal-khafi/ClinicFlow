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

  function handleNewAppt(date?: string) {
    setNewApptDate(date);
    setShowNewAppt(true);
  }

  if (isMobile) {
    return (
      <>
        <MobileDashboard onNewAppointment={handleNewAppt} onSelectAppointment={setSelectedAppt} />
        {showNewAppt && (
          <BottomSheet onClose={() => setShowNewAppt(false)}>
            <NewAppointmentModal onClose={() => setShowNewAppt(false)} defaultDate={newApptDate} isMobile />
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
        <Calendar onNewAppointment={handleNewAppt} onSelectAppointment={setSelectedAppt} />
      </div>
      {showNewAppt && <NewAppointmentModal onClose={() => setShowNewAppt(false)} defaultDate={newApptDate} />}
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
