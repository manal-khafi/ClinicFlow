const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
require('dotenv/config');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Clean existing data (order matters because of foreign keys)
  await prisma.auditLog.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  // ─────────────────────────────
  // Users: 1 admin, 2 staff
  // ─────────────────────────────
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      fullName: 'Dr. Rachel Kim',
      email: 'admin@clinicflow.com',
      passwordHash,
      role: 'admin',
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      fullName: 'Nurse James',
      email: 'james@clinicflow.com',
      passwordHash,
      role: 'staff',
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      fullName: 'Nurse Sara',
      email: 'sara@clinicflow.com',
      passwordHash,
      role: 'staff',
    },
  });

  console.log('Users created:', admin.email, staff1.email, staff2.email);

  // ─────────────────────────────
  // Patients: 5
  // ─────────────────────────────
  const patientsData = [
    { fullName: 'John Smith', cin: 'AB123456', phone: '0600000001', birthDate: new Date('1985-03-12') },
    { fullName: 'Maria Garcia', cin: 'CD789012', phone: '0600000002', birthDate: new Date('1990-07-25') },
    { fullName: 'Ahmed Benali', cin: 'GG567890', phone: '0600000003', birthDate: new Date('1978-11-02') },
    { fullName: 'Sophie Laurent', cin: 'FF901234', phone: '0600000004', birthDate: new Date('1995-01-18') },
    { fullName: 'Omar Hassan', cin: 'CC123456', phone: '0600000005', birthDate: new Date('1982-09-30') },
  ];

  const patients = [];
  for (const data of patientsData) {
    const patient = await prisma.patient.create({ data });
    patients.push(patient);
  }

  console.log(`${patients.length} patients created`);

  // ─────────────────────────────
  // Appointments: 10, mixed statuses, no 30-min conflicts
  // ─────────────────────────────
  function apptDateTime(daysFromNow, hour, minute = 0) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hour, minute, 0, 0);
    return date;
  }

  function endsAt(start) {
    return new Date(start.getTime() + 30 * 60 * 1000);
  }

  const appointmentsData = [
    { patient: patients[0], createdBy: admin, daysFromNow: 1, hour: 9, status: 'confirmed', reason: 'Follow-up lab results' },
    { patient: patients[1], createdBy: staff1, daysFromNow: 1, hour: 11, status: 'pending', reason: 'Medication review' },
    { patient: patients[2], createdBy: admin, daysFromNow: 2, hour: 10, status: 'confirmed', reason: 'Routine blood work' },
    { patient: patients[3], createdBy: staff2, daysFromNow: 2, hour: 14, status: 'pending', reason: 'Asthma management' },
    { patient: patients[4], createdBy: admin, daysFromNow: 3, hour: 10, status: 'confirmed', reason: 'Hypertension follow-up' },
    { patient: patients[0], createdBy: staff1, daysFromNow: 4, hour: 9, status: 'cancelled', reason: 'Annual checkup' },
    { patient: patients[1], createdBy: admin, daysFromNow: 5, hour: 15, status: 'confirmed', reason: 'ECG follow-up' },
    { patient: patients[2], createdBy: staff2, daysFromNow: 5, hour: 16, status: 'pending', reason: 'Vitamin D deficiency' },
    { patient: patients[3], createdBy: staff1, daysFromNow: 6, hour: 11, status: 'pending', reason: 'Mental health check' },
    { patient: patients[4], createdBy: admin, daysFromNow: 0, hour: 17, status: 'confirmed', reason: 'Back pain assessment' },
  ];

  for (const item of appointmentsData) {
    const start = apptDateTime(item.daysFromNow, item.hour);
    await prisma.appointment.create({
      data: {
        patientId: item.patient.id,
        createdById: item.createdBy.id,
        appointmentDate: start,
        endsAt: endsAt(start),
        status: item.status,
        reason: item.reason,
      },
    });
  }

  console.log(`${appointmentsData.length} appointments created`);
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });