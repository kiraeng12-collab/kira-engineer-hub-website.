import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/lib/generated/prisma";

/**
 * Lazily-created Prisma client using the Neon serverless driver adapter,
 * cached on globalThis so dev hot-reload doesn't exhaust Neon's connection
 * limit by creating a new client on every reload. Returns null when
 * DATABASE_URL isn't configured yet so callers can degrade gracefully
 * (mirrors how Stripe/webhook/Resend env vars are handled elsewhere).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrismaClient(): PrismaClient | null {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  const adapter = new PrismaNeon({ connectionString });
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}
