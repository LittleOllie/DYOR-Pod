import { isKvConfigured } from "@/lib/admin/config";
import { kv } from "@/lib/library/redis";
import type { ContactEnquiry, NewsletterSignup } from "./types";

export const ENQUIRY_KEYS = {
  contact: "enquiries:contact",
  newsletter: "enquiries:newsletter",
} as const;

export const MAX_ENQUIRIES = 200;

export function prependEnquiry<T>(list: T[] | null | undefined, entry: T, max: number): T[] {
  return [entry, ...(list ?? [])].slice(0, max);
}

function createId(): string {
  return crypto.randomUUID();
}

export async function appendContactEnquiry(
  data: Omit<ContactEnquiry, "id" | "createdAt">,
): Promise<boolean> {
  if (!isKvConfigured()) {
    return false;
  }

  try {
    const existing = await kv.get<ContactEnquiry[]>(ENQUIRY_KEYS.contact);
    const entry: ContactEnquiry = {
      id: createId(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    await kv.set(ENQUIRY_KEYS.contact, prependEnquiry(existing, entry, MAX_ENQUIRIES));
    return true;
  } catch {
    return false;
  }
}

export async function appendNewsletterSignup(
  data: Omit<NewsletterSignup, "id" | "createdAt">,
): Promise<boolean> {
  if (!isKvConfigured()) {
    return false;
  }

  try {
    const existing = await kv.get<NewsletterSignup[]>(ENQUIRY_KEYS.newsletter);
    const entry: NewsletterSignup = {
      id: createId(),
      createdAt: new Date().toISOString(),
      interests: data.interests ?? [],
      email: data.email,
    };
    await kv.set(ENQUIRY_KEYS.newsletter, prependEnquiry(existing, entry, MAX_ENQUIRIES));
    return true;
  } catch {
    return false;
  }
}

export async function listContactEnquiries(): Promise<ContactEnquiry[]> {
  if (!isKvConfigured()) {
    return [];
  }

  try {
    return (await kv.get<ContactEnquiry[]>(ENQUIRY_KEYS.contact)) ?? [];
  } catch {
    return [];
  }
}

export async function listNewsletterSignups(): Promise<NewsletterSignup[]> {
  if (!isKvConfigured()) {
    return [];
  }

  try {
    return (await kv.get<NewsletterSignup[]>(ENQUIRY_KEYS.newsletter)) ?? [];
  } catch {
    return [];
  }
}

export async function deleteContactEnquiry(id: string): Promise<boolean> {
  if (!isKvConfigured()) {
    return false;
  }

  try {
    const existing = await kv.get<ContactEnquiry[]>(ENQUIRY_KEYS.contact);
    const next = (existing ?? []).filter((entry) => entry.id !== id);
    if (next.length === (existing ?? []).length) {
      return false;
    }
    await kv.set(ENQUIRY_KEYS.contact, next);
    return true;
  } catch {
    return false;
  }
}

export async function deleteNewsletterSignup(id: string): Promise<boolean> {
  if (!isKvConfigured()) {
    return false;
  }

  try {
    const existing = await kv.get<NewsletterSignup[]>(ENQUIRY_KEYS.newsletter);
    const next = (existing ?? []).filter((entry) => entry.id !== id);
    if (next.length === (existing ?? []).length) {
      return false;
    }
    await kv.set(ENQUIRY_KEYS.newsletter, next);
    return true;
  } catch {
    return false;
  }
}
