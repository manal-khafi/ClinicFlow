const prisma = require('../config/prisma');
const { AppError } = require('../middlewares/error.middleware');

const CONFLICT_WINDOW_MS = 30 * 60 * 1000;

const APPOINTMENT_INCLUDE = {
  patient: { select: { fullName: true, cin: true } },
  createdBy: { select: { fullName: true } },
};

// Throws 409 if this patient already has a CONFIRMED appointment within 30 minutes
// (before or after) of `appointmentDate`. Runs inside the caller's transaction so the
// check and the write that follows it are atomic. `excludeId` skips the appointment
// being updated, so it doesn't conflict with itself.
async function assertNoConfirmedConflict(tx, patientId, appointmentDate, excludeId) {
  const windowStart = new Date(appointmentDate.getTime() - CONFLICT_WINDOW_MS);
  const windowEnd = new Date(appointmentDate.getTime() + CONFLICT_WINDOW_MS);

  const conflict = await tx.appointment.findFirst({
    where: {
      patientId,
      status: 'confirmed',
      appointmentDate: { gte: windowStart, lte: windowEnd },
      ...(excludeId && { NOT: { id: excludeId } }),
    },
  });

  if (conflict) {
    throw new AppError(409, 'This patient already has a confirmed appointment within 30 minutes of this time.');
  }
}

async function createAppointment(data, createdById) {
  const patient = await prisma.patient.findFirst({ where: { id: data.patientId, deletedAt: null } });

  if (!patient) {
    throw new AppError(404, 'Patient not found');
  }

  const appointmentDate = new Date(data.appointmentDate);
  const endsAt = new Date(appointmentDate.getTime() + CONFLICT_WINDOW_MS);
  const status = data.status || 'pending';

  return prisma.$transaction(async (tx) => {
    if (status === 'confirmed') {
      await assertNoConfirmedConflict(tx, data.patientId, appointmentDate);
    }

    return tx.appointment.create({
      data: {
        patientId: data.patientId,
        createdById,
        appointmentDate,
        endsAt,
        status,
        reason: data.reason,
        notes: data.notes,
      },
      include: APPOINTMENT_INCLUDE,
    });
  });
}

async function getAppointments({ date, status, page = 1, limit = 10 } = {}) {
  const where = {};

  if (status) {
    where.status = status;
  }

  if (date) {
    // Anchored to UTC explicitly, so the day boundary doesn't shift with server timezone.
    where.appointmentDate = {
      gte: new Date(`${date}T00:00:00.000Z`),
      lte: new Date(`${date}T23:59:59.999Z`),
    };
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { appointmentDate: 'desc' },
      include: APPOINTMENT_INCLUDE,
    }),
    prisma.appointment.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async function getAppointmentById(id) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: APPOINTMENT_INCLUDE,
  });

  if (!appointment) {
    throw new AppError(404, 'Appointment not found');
  }

  return appointment;
}

async function updateStatus(id, newStatus) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });

  if (!appointment) {
    throw new AppError(404, 'Appointment not found');
  }

  return prisma.$transaction(async (tx) => {
    if (newStatus === 'confirmed') {
      await assertNoConfirmedConflict(tx, appointment.patientId, appointment.appointmentDate, appointment.id);
    }

    return tx.appointment.update({
      where: { id },
      data: { status: newStatus },
      include: APPOINTMENT_INCLUDE,
    });
  });
}

async function getAppointmentsForPatient(patientId) {
  return prisma.appointment.findMany({
    where: { patientId },
    orderBy: { appointmentDate: 'desc' },
    include: { createdBy: { select: { fullName: true } } },
  });
}

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateStatus,
  getAppointmentsForPatient,
};
