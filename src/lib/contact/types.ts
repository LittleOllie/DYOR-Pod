import { isKvConfigured } from "@/lib/admin/config";

export type ContactPayload = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  honeypot?: string;
};

export type ContactResult =
  | { success: true; message: string }
  | { success: false; message: string; code?: string };

export type ContactConfig = {
  formEndpoint?: string;
  webhookUrl?: string;
};

export function getContactConfig(): ContactConfig {
  return {
    formEndpoint: process.env.CONTACT_FORM_ENDPOINT,
    webhookUrl: process.env.CONTACT_WEBHOOK_URL,
  };
}

export function hasExternalContactEndpoint(): boolean {
  const config = getContactConfig();
  return Boolean(config.formEndpoint || config.webhookUrl);
}

export function isContactConfigured(): boolean {
  return isKvConfigured() || hasExternalContactEndpoint();
}
