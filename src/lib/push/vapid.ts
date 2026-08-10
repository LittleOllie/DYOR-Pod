import webpush from "web-push";

export type WebPushConfig = {
  publicKey: string;
  privateKey: string;
  subject: string;
};

export function getWebPushPublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY?.trim();
  return key || null;
}

export function getWebPushConfig(): WebPushConfig | null {
  const publicKey = getWebPushPublicKey();
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY?.trim();
  const subject =
    process.env.WEB_PUSH_SUBJECT?.trim() || "mailto:hello@dyorpod.com";

  if (!publicKey || !privateKey) {
    return null;
  }

  return { publicKey, privateKey, subject };
}

export function isWebPushConfigured(): boolean {
  return getWebPushConfig() !== null;
}

export function configureWebPush(): WebPushConfig | null {
  const config = getWebPushConfig();
  if (!config) {
    return null;
  }

  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  return config;
}

export { webpush };
