export type NewsletterProvider = "mailchimp" | "kit" | "beehiiv" | "substack" | "brevo" | "custom";

export type SubscribePayload = {
  email: string;
  interests?: string[];
  honeypot?: string;
};

export type SubscribeResult =
  | { success: true; pending?: boolean; message: string }
  | { success: false; message: string; code?: string };

export type NewsletterConfig = {
  provider?: NewsletterProvider;
  apiKey?: string;
  listId?: string;
  formEndpoint?: string;
};

export function getNewsletterConfig(): NewsletterConfig {
  return {
    provider: process.env.NEWSLETTER_PROVIDER as NewsletterProvider | undefined,
    apiKey: process.env.NEWSLETTER_API_KEY,
    listId: process.env.NEWSLETTER_LIST_ID,
    formEndpoint: process.env.NEWSLETTER_FORM_ENDPOINT,
  };
}

export function isNewsletterConfigured(): boolean {
  const config = getNewsletterConfig();
  if (config.formEndpoint) return true;
  return Boolean(config.provider && config.apiKey && config.listId);
}
