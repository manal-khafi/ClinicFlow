const { z } = require('zod');

const createPatientSchema = z.object({
  fullName: z.string().min(2, 'fullName must be at least 2 characters'),
  cin: z.string().min(1, 'cin is required'),
  phone: z.string().min(6, 'phone must be at least 6 characters'),
  birthDate: z.coerce
    .date('birthDate must be a valid date')
    .max(new Date(), 'birthDate cannot be in the future'),
  address: z.string().optional(),
});

// Same shape, but every field is optional — for partial updates.
const updatePatientSchema = createPatientSchema.partial();

module.exports = { createPatientSchema, updatePatientSchema };
