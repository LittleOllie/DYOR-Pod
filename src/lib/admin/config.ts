export function isKvConfigured(): boolean {
  return Boolean(
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
      (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
  );
}

export function getAllowedAdminEmails(): string[] {
  const raw = process.env.ADMIN_ALLOWED_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowlisted(email: string): boolean {
  return getAllowedAdminEmails().includes(email.trim().toLowerCase());
}

export function getAdminConfigMissing(): string[] {
  const missing: string[] = [];

  if (!process.env.ADMIN_PASSWORD) {
    missing.push("ADMIN_PASSWORD");
  }

  if (!process.env.ADMIN_SESSION_SECRET) {
    missing.push("ADMIN_SESSION_SECRET");
  }

  if (getAllowedAdminEmails().length === 0) {
    missing.push("ADMIN_ALLOWED_EMAILS");
  }

  if (!isKvConfigured()) {
    missing.push("KV_REST_API_URL + KV_REST_API_TOKEN (Upstash Redis)");
  }

  return missing;
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_SESSION_SECRET &&
      getAllowedAdminEmails().length > 0,
  );
}

export function isAdminStorageConfigured(): boolean {
  return isKvConfigured();
}
