const { z } = require('zod');

const STATUS_VALUES = ['pending', 'confirmed', 'cancelled'];

const createAppointmentSchema = z.object({
  patientId: z.string().uuid('patientId must be a valid UUID'),
  appointmentDate: z.string()
    .min(1, 'appointmentDate is required')
    .refine((val) => !isNaN(Date.parse(val)), { message: 'appointmentDate must be a valid ISO datetime' })
    .refine((val) => new Date(val) >= new Date(), { message: 'appointmentDate cannot be in the past' }),
  reason: z.string().min(2, 'reason must be at least 2 characters'),
  notes: z.string().optional(),
  status: z.enum(STATUS_VALUES, 'status must be one of pending, confirmed, cancelled').optional().default('pending'),
});

const updateStatusSchema = z.object({
  status: z.enum(STATUS_VALUES, 'status must be one of pending, confirmed, cancelled'),
});

module.exports = { createAppointmentSchema, updateStatusSchema };
