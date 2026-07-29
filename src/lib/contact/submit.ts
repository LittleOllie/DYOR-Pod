import type { ContactPayload, ContactResult } from "./types";
import { getContactConfig, isContactConfigured } from "./types";

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

  const config = getContactConfig();
  const endpoint = config.formEndpoint ?? config.webhookUrl;

  if (!endpoint) {
    return {
      success: false,
      code: "NOT_CONFIGURED",
      message: "Contact form is not yet configured.",
    };
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

  if (response.ok) {
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
