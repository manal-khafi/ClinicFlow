import { z } from 'zod';

// Mirrors backend/src/validators/users.validator.js's createUserSchema.
export const createUserSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'staff']),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

// Same shape, minus password — password changes are a separate concern (not built yet).
export const updateUserSchema = createUserSchema.omit({ password: true }).partial();

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
