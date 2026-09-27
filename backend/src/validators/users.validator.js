const { z } = require('zod');

const ROLE_VALUES = ['admin', 'staff'];

const createUserSchema = z.object({
  fullName: z.string().min(2, 'fullName must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'password must be at least 8 characters'),
  role: z.enum(ROLE_VALUES, 'role must be one of admin, staff'),
});

// Same shape, minus password — password changes are a separate concern (not built yet).
const updateUserSchema = createUserSchema.omit({ password: true }).partial();

module.exports = { createUserSchema, updateUserSchema };
