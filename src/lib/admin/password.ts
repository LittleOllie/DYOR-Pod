import { createHash, timingSafeEqual } from "node:crypto";

function hashPassword(password: string): Buffer {
  return createHash("sha256").update(password).digest();
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return false;
  }

  const providedHash = hashPassword(password);
  const expectedHash = hashPassword(expected);
  return timingSafeEqual(providedHash, expectedHash);
}
