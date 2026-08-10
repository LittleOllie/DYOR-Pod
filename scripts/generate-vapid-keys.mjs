import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("Add these to .env.local and Vercel (server-only for private key):\n");
console.log(`NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=${keys.publicKey}`);
console.log(`WEB_PUSH_PRIVATE_KEY=${keys.privateKey}`);
console.log("WEB_PUSH_SUBJECT=mailto:hello@dyorpod.com");
console.log("CRON_SECRET=<generate with: openssl rand -base64 32>");
