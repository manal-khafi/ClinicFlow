const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { AppError } = require('../middlewares/error.middleware');

// passwordHash intentionally left out of every select below.
const USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

async function createUser(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });

  if (existing) {
    throw new AppError(409, 'A user with this email already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      role: data.role,
    },
    select: USER_SELECT,
  });
}

async function getUsers({ search, page = 1, limit = 10 } = {}) {
  const where = {
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take: limit, select: USER_SELECT }),
    prisma.user.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id }, select: USER_SELECT });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
}

async function updateUser(id, data) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  if (data.email && data.email !== user.email) {
    const emailTaken = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id } },
    });

    if (emailTaken) {
      throw new AppError(409, 'A user with this email already exists');
    }
  }

  return prisma.user.update({ where: { id }, data, select: USER_SELECT });
}

async function deactivateUser(id) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return prisma.user.update({ where: { id }, data: { isActive: false }, select: USER_SELECT });
}

async function reactivateUser(id) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return prisma.user.update({ where: { id }, data: { isActive: true }, select: USER_SELECT });
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser,
  reactivateUser,
};
