// server/database/client.ts
import { prisma } from '../utils/db'
import { slugExtension } from './slugExtension'

export const prismaClient = prisma.$extends(slugExtension)