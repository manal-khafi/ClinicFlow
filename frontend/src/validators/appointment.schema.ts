import { z } from 'zod';

// Mirrors backend/src/validators/appointments.validator.js's createAppointmentSchema.
export const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  appointmentDate: z.string()
    .min(1, 'Date and time are required')
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Enter a valid date and time' })
    .refine((val) => new Date(val) >= new Date(), { message: 'Appointment cannot be in the past' }),
  reason: z.string().min(2, 'Reason must be at least 2 characters'),
  notes: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;
