// server/database/client.ts
import { prisma } from '../utils/db'
import { slugExtension } from './slugExtension'

export const db = prisma.$extends(slugExtension)