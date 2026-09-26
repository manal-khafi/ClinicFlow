import { z } from 'zod';

// Mirrors backend/src/validators/patients.validator.js's createPatientSchema.
// birthDate stays a plain string (not z.coerce.date()) — a native <input type="date">
// already produces a YYYY-MM-DD string, zodResolver's input/output types need to match
// for useForm's generic to work cleanly, and the backend coerces the string itself anyway.
export const patientSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  cin: z.string().min(1, 'CIN is required'),
  phone: z.string().min(6, 'Phone must be at least 6 characters'),
  birthDate: z.string()
    .min(1, 'Date of birth is required')
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Enter a valid date' })
    .refine((val) => new Date(val) <= new Date(), { message: 'Date of birth cannot be in the future' }),
  address: z.string().optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
