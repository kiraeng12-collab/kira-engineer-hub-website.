import type { PrismaClient } from "@/lib/generated/prisma";

const WINDOW_MINUTES = 60;
const MAX_PER_EMAIL = 5;
const MAX_PER_IP = 10;

export type RateLimitResult = { limited: boolean; reason?: string };

/**
 * DB-backed rate limit for form submissions: serverless functions are
 * stateless between invocations, so an in-memory counter wouldn't work
 * reliably - this checks recent FormSubmission rows instead.
 */
export async function checkFormRateLimit(
  prisma: PrismaClient,
  { email, ipHint }: { email: string; ipHint: string }
): Promise<RateLimitResult> {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000);

  const emailCount = await prisma.formSubmission.count({
    where: { email, createdAt: { gte: since } },
  });
  if (emailCount >= MAX_PER_EMAIL) {
    return { limited: true, reason: "Too many requests from this email address. Please try again later." };
  }

  if (ipHint) {
    const ipCount = await prisma.formSubmission.count({
      where: { ipHint, createdAt: { gte: since } },
    });
    if (ipCount >= MAX_PER_IP) {
      return { limited: true, reason: "Too many requests from this network. Please try again later." };
    }
  }

  return { limited: false };
}

/**
 * General-purpose sliding-window rate limit for any endpoint, keyed by an
 * arbitrary bucket string (e.g. "login:email:x@example.com"). Unlike
 * checkFormRateLimit (which counts existing FormSubmission rows), this
 * records its own event on every call - so call it once per attempt,
 * including failed ones, not just successful submissions.
 */
export async function checkRateLimit(
  prisma: PrismaClient,
  { bucket, windowMinutes, max }: { bucket: string; windowMinutes: number; max: number }
): Promise<RateLimitResult> {
  const since = new Date(Date.now() - windowMinutes * 60_000);
  const count = await prisma.rateLimitEvent.count({ where: { bucket, createdAt: { gte: since } } });

  if (count >= max) {
    return { limited: true, reason: "Too many attempts. Please try again later." };
  }

  await prisma.rateLimitEvent.create({ data: { bucket } });
  return { limited: false };
}
