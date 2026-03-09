
// lib/prisma.ts

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/index.js";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Prisma 7: Requires adapter for database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

function createPrismaClient() {
  return new PrismaClient({ adapter });
}

// Use cached client only if it has jeuEnCours (avoids stale client after schema changes)
const cached = globalForPrisma.prisma;
const hasJeuEnCours = cached && typeof (cached as { jeuEnCours?: unknown }).jeuEnCours !== "undefined";

export const prisma = hasJeuEnCours ? cached : (globalForPrisma.prisma = createPrismaClient());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
