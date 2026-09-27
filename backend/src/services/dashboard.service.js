const prisma = require('../config/prisma');

async function getDashboardStats() {
  // "Today" here is the server's local date (per spec), unlike
  // appointments.service.js's date filter which is anchored to UTC — worth knowing if
  // the server's timezone ever differs from where staff actually are.
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(now);
  dayEnd.setHours(23, 59, 59, 999);

  const [totalPatients, todaysAppointments, pending, confirmed] = await Promise.all([
    prisma.patient.count({ where: { deletedAt: null } }),

    prisma.appointment.count({
      where: {
        appointmentDate: { gte: dayStart, lte: dayEnd },
        patient: { deletedAt: null },
      },
    }),

    prisma.appointment.count({
      where: {
        status: 'pending',
        patient: { deletedAt: null },
      },
    }),

    // "Confirmed" card's subtext is "For today", so this counts confirmed appointments
    // happening today — not the all-time confirmed total.
    prisma.appointment.count({
      where: {
        status: 'confirmed',
        appointmentDate: { gte: dayStart, lte: dayEnd },
        patient: { deletedAt: null },
      },
    }),
  ]);

  return { totalPatients, todaysAppointments, pending, confirmed };
}

module.exports = { getDashboardStats };
