// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as { prisma?: PrismaClient }

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const db = prisma