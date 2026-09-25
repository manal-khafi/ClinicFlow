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

async function deletePatient(id) {
  // Confirms the patient exists and isn't already deleted (throws 404 otherwise).
  await getPatientById(id);

  return prisma.patient.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

module.exports = { createPatient, getPatients, getPatientById, updatePatient, deletePatient };
