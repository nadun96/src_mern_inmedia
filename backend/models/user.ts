// User model is now defined in prisma/schema.prisma
// Import and use PrismaClient to interact with the User model:
//
//   import { PrismaClient } from '../generated/prisma/client.js';
//   const prisma = new PrismaClient();
//
//   // Create a user
//   await prisma.user.create({ data: { name, email, password } });
//
//   // Find all users
//   await prisma.user.findMany();
//
//   // Find by email
//   await prisma.user.findUnique({ where: { email } });

export { PrismaClient } from '../generated/prisma/client.js';