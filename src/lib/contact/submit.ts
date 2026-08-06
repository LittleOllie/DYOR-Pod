import { appendContactEnquiry } from "@/lib/enquiries/storage";
import type { ContactPayload, ContactResult } from "./types";
import { getContactConfig, hasExternalContactEndpoint, isContactConfigured } from "./types";

async function forwardContactToExternal(payload: ContactPayload): Promise<boolean> {
  const config = getContactConfig();
  const endpoint = config.formEndpoint ?? config.webhookUrl;
  if (!endpoint) {
    return false;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      message: payload.message,
      source: "dyor-website-contact",
    }),
  });

  return response.ok;
}

export async function submitContactForm(payload: ContactPayload): Promise<ContactResult> {
  if (payload.honeypot) {
    return { success: true, message: "Message sent. Thanks for reaching out." };
  }

  if (!isContactConfigured()) {
    return {
      success: false,
      code: "NOT_CONFIGURED",
      message:
        "Contact form is not yet connected. Please reach out to @DYORPod on X in the meantime.",
    };
  }

  const stored = await appendContactEnquiry({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    message: payload.message,
  });

  if (hasExternalContactEndpoint()) {
    try {
      const forwarded = await forwardContactToExternal(payload);
      if (forwarded) {
        return {
          success: true,
          message: "Message sent. Thanks for reaching out — we'll be in touch.",
        };
      }
    } catch {
      // Fall through — stored submissions still count as success.
    }
  }

  if (stored) {
    return {
      success: true,
      message: "Message sent. Thanks for reaching out — we'll be in touch.",
    };
  }

  return {
    success: false,
    message: "Something went wrong sending your message. Please try again or message us on X.",
  };
}
