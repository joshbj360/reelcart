// server/database/client.ts
import { prisma } from '../utils/db'
import { slugExtension } from './slugExtension'

export const prismaDb = prisma.$extends(slugExtension)