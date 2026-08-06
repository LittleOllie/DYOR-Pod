"use client";

import { useSyncExternalStore, useState } from "react";
import { Button } from "@/components/ui/Button";

type InstallState = "browser" | "standalone" | "ios";

function detectInstallState(): InstallState {
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

function subscribeInstallState(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

function getNotificationPermission(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "default";
  }
  return Notification.permission;
}

function subscribeNotificationPermission(onStoreChange: () => void) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return () => {};
  }

  const interval = window.setInterval(onStoreChange, 1000);
  return () => window.clearInterval(interval);
}

export function InstallAndNotifyPrompt() {
  const installState = useSyncExternalStore(
    subscribeInstallState,
    detectInstallState,
    () => "browser" as InstallState,
  );
  const permission = useSyncExternalStore(
    subscribeNotificationPermission,
    getNotificationPermission,
    () => "default" as NotificationPermission,
  );
  const [notifyStatus, setNotifyStatus] = useState<string | null>(null);

  async function enableReminders() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setNotifyStatus("Notifications are not supported in this browser.");
      return;
    }

    const result = await Notification.requestPermission();

    if (result !== "granted") {
      setNotifyStatus(
        "Notifications blocked. Enable them in browser settings to get Space reminders.",
      );
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({ type: "schedule-reminders" });
    setNotifyStatus(
      "Reminders enabled — we'll notify you ~15 minutes before a Space starts.",
    );
  }

  return (
    <div className="mt-8 rounded-[var(--radius-xl)] border border-border/80 bg-surface/50 p-5 md:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
        Stay on mission
      </p>
      <h3 className="mt-2 font-heading text-xl font-bold text-text-primary">
        Add DYOR to your home screen
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        Install the site like an app and turn on Space reminders so you don&apos;t miss
        the next live show.
      </p>

      {installState === "ios" ? (
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-text-secondary">
          <li>Tap the Share button in Safari</li>
          <li>
            Choose <strong className="text-text-primary">Add to Home Screen</strong>
          </li>
          <li>Open DYOR from your home screen, then enable reminders below</li>
        </ol>
      ) : installState === "browser" ? (
        <p className="mt-4 text-sm text-text-secondary">
          On Android Chrome: Menu →{" "}
          <strong className="text-text-primary">Install app</strong> or{" "}
          <strong className="text-text-primary">Add to Home screen</strong>.
        </p>
      ) : (
        <p className="mt-4 text-sm text-brand-bright">
          DYOR is installed on your home screen.
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="secondary"
          onClick={enableReminders}
          disabled={permission === "denied"}
        >
          {permission === "granted" ? "Reminders enabled" : "Enable Space reminders"}
        </Button>
        {notifyStatus && (
          <p className="text-sm text-text-secondary" role="status" aria-live="polite">
            {notifyStatus}
          </p>
        )}
      </div>
    </div>
  );
}
