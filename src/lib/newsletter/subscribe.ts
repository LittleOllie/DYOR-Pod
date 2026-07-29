import type { SubscribePayload, SubscribeResult } from "./types";
import { getNewsletterConfig, isNewsletterConfigured } from "./types";

async function subscribeMailchimp(
  payload: SubscribePayload,
  config: ReturnType<typeof getNewsletterConfig>,
): Promise<SubscribeResult> {
  const datacenter = config.apiKey?.split("-").pop();
  const url = `https://${datacenter}.api.mailchimp.com/3.0/lists/${config.listId}/members`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `apikey ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: payload.email,
      status: "subscribed",
    }),
  });

  if (response.ok || response.status === 400) {
    return { success: true, message: "You're on the list. Welcome to the briefing." };
  }

  return { success: false, message: "Subscription failed. Please try again later." };
}

async function subscribeCustomEndpoint(
  payload: SubscribePayload,
  endpoint: string,
): Promise<SubscribeResult> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      interests: payload.interests,
    }),
  });

  if (response.ok) {
    return { success: true, message: "You're on the list. Welcome to the briefing." };
  }

  return { success: false, message: "Subscription failed. Please try again later." };
}

export async function subscribeToNewsletter(
  payload: SubscribePayload,
): Promise<SubscribeResult> {
  if (payload.honeypot) {
    return { success: true, message: "You're on the list. Welcome to the briefing." };
  }

  if (!isNewsletterConfigured()) {
    return {
      success: false,
      code: "NOT_CONFIGURED",
      message:
        "Newsletter signup is not yet configured. Please follow DYOR on X for updates in the meantime.",
    };
  }

  const config = getNewsletterConfig();

  if (config.formEndpoint) {
    return subscribeCustomEndpoint(payload, config.formEndpoint);
  }

  switch (config.provider) {
    case "mailchimp":
      return subscribeMailchimp(payload, config);
    default:
      return {
        success: false,
        code: "UNSUPPORTED_PROVIDER",
        message: `Provider "${config.provider}" is not yet implemented. Contact the site owner.`,
      };
  }
}
