/** Converts a base64 URL-encoded VAPID public key for PushManager.subscribe(). */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function getInstallState(): "browser" | "standalone" | "ios" {
  if (typeof window === "undefined") {
    return "browser";
  }

  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone));

  if (standalone) {
    return "standalone";
  }

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return isIos ? "ios" : "browser";
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function needsIosInstallForPush(): boolean {
  return getInstallState() === "ios";
}
