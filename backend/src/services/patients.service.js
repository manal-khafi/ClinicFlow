const prisma = require('../config/prisma');
const { AppError } = require('../middlewares/error.middleware');

async function createPatient(data) {
  const existing = await prisma.patient.findFirst({
    where: { cin: data.cin, deletedAt: null },
  });

  if (existing) {
    throw new AppError(409, 'A patient with this CIN already exists');
  }

  return prisma.patient.create({ data });
}

async function getPatients({ search, page = 1, limit = 10 } = {}) {
  const where = {
    deletedAt: null,
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' } },
        { cin: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.patient.findMany({ where, skip, take: limit }),
    prisma.patient.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async function getPatientById(id) {
  const patient = await prisma.patient.findFirst({ where: { id, deletedAt: null } });

  if (!patient) {
    throw new AppError(404, 'Patient not found');
  }

  return patient;
}

async function updatePatient(id, data) {
  const patient = await getPatientById(id);

  if (data.cin && data.cin !== patient.cin) {
    const cinTaken = await prisma.patient.findFirst({
      where: { cin: data.cin, deletedAt: null, NOT: { id } },
    });

    if (cinTaken) {
      throw new AppError(409, 'A patient with this CIN already exists');
    }
  }

  return prisma.patient.update({ where: { id }, data });
}

async function getArchivedPatients({ search, page = 1, limit = 10 } = {}) {
  const where = {
    deletedAt: { not: null },
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' } },
        { cin: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.patient.findMany({ where, skip, take: limit }),
    prisma.patient.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async function getArchivedPatientById(id) {
  const patient = await prisma.patient.findFirst({
    where: { id, deletedAt: { not: null } },
    include: {
      appointments: { orderBy: { appointmentDate: 'desc' } },
    },
  });

  if (!patient) {
    throw new AppError(404, 'Archived patient not found');
  }

  return patient;
}

async function deletePatient(id) {
  return prisma.$transaction(async (tx) => {
    // Step 1: confirm the patient exists and isn't already archived (404 otherwise).
    const patient = await tx.patient.findFirst({ where: { id, deletedAt: null } });

    if (!patient) {
      throw new AppError(404, 'Patient not found');
    }

    // Step 2: archive (soft-delete) the patient.
    const updatedPatient = await tx.patient.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Step 3: cancel only their FUTURE non-cancelled appointments. Past appointments are
    // left completely untouched, regardless of status — archiving a patient shouldn't
    // rewrite history.
    const now = new Date();
    const { count } = await tx.appointment.updateMany({
      where: {
        patientId: id,
        appointmentDate: { gt: now },
        status: { not: 'cancelled' },
      },
      data: { status: 'cancelled' },
    });

    console.log(`Cancelled ${count} future appointments for archived patient ${id}`);

    return updatedPatient;
  });
}

async function restorePatient(id) {
  const patient = await prisma.patient.findUnique({ where: { id } });

  if (!patient || !patient.deletedAt) {
    throw new AppError(404, 'Archived patient not found');
  }

  // Captured before any changes — this is the moment the patient was archived.
  const archivedAt = patient.deletedAt;

  return prisma.$transaction(async (tx) => {
    // a. Unarchive the patient.
    const restoredPatient = await tx.patient.update({
      where: { id },
      data: { deletedAt: null },
    });

    const now = new Date();

    // b. Anything scheduled *while* they were archived is invalid — cancel it outright,
    // regardless of whatever status it's currently sitting at.
    const { count: cancelledCount } = await tx.appointment.updateMany({
      where: {
        patientId: id,
        appointmentDate: { gte: archivedAt, lte: now },
      },
      data: { status: 'cancelled' },
    });

    // c. Anything still in the future gets reset to pending so staff can reconfirm it.
    const { count: pendingCount } = await tx.appointment.updateMany({
      where: {
        patientId: id,
        appointmentDate: { gt: now },
      },
      data: { status: 'pending' },
    });

    // d. Appointments before archivedAt fall into neither window above, so they're
    // untouched by design — nothing further needed for that case.

    console.log(`Restored patient ${id}: ${cancelledCount} appointments set to cancelled, ${pendingCount} set to pending`);

    return restoredPatient;
  });
}

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getArchivedPatients,
  getArchivedPatientById,
  restorePatient,
};
