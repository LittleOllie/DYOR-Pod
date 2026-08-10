"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getInstallState,
  isPushSupported,
  needsIosInstallForPush,
  urlBase64ToUint8Array,
} from "@/lib/push/client";

export type ReminderState =
  | "unsupported"
  | "not-configured"
  | "default"
  | "processing"
  | "subscribed"
  | "denied"
  | "error";

type UseSpaceRemindersResult = {
  state: ReminderState;
  message: string | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  supported: boolean;
  iosInstallRequired: boolean;
};

const PUBLIC_KEY = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY?.trim() ?? "";

async function readExistingSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator)) {
    return null;
  }
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export function useSpaceReminders(): UseSpaceRemindersResult {
  const [state, setState] = useState<ReminderState>("default");
  const [message, setMessage] = useState<string | null>(null);

  const supported = isPushSupported();
  const iosInstallRequired = needsIosInstallForPush();

  const syncState = useCallback(async () => {
    if (!supported) {
      setState("unsupported");
      return;
    }

    if (!PUBLIC_KEY) {
      setState("not-configured");
      return;
    }

    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }

    const existing = await readExistingSubscription();
    if (existing) {
      setState("subscribed");
      return;
    }

    setState("default");
  }, [supported]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!supported) {
        if (!cancelled) setState("unsupported");
        return;
      }

      if (!PUBLIC_KEY) {
        if (!cancelled) setState("not-configured");
        return;
      }

      if (Notification.permission === "denied") {
        if (!cancelled) setState("denied");
        return;
      }

      const existing = await readExistingSubscription();
      if (cancelled) return;

      if (existing) {
        setState("subscribed");
        return;
      }

      setState("default");
    })();

    return () => {
      cancelled = true;
    };
  }, [supported]);

  const subscribe = useCallback(async () => {
    setMessage(null);

    if (!supported) {
      setState("unsupported");
      setMessage("Reminders aren't supported in this browser.");
      return;
    }

    if (!PUBLIC_KEY) {
      setState("not-configured");
      setMessage("Reminders aren't available yet. Please try again later.");
      return;
    }

    if (iosInstallRequired) {
      return;
    }

    if (Notification.permission === "denied") {
      setState("denied");
      setMessage("Notifications are blocked. Enable them in your browser settings.");
      return;
    }

    setState("processing");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "default");
        setMessage("Notifications were not enabled.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY) as BufferSource,
        });
      }

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) {
        throw new Error("subscribe-failed");
      }

      setState("subscribed");
      setMessage("You're set — we'll remind you about 15 minutes before each Space.");
    } catch {
      setState("error");
      setMessage("Couldn't enable reminders. Please try again.");
      await syncState();
    }
  }, [supported, iosInstallRequired, syncState]);

  const unsubscribe = useCallback(async () => {
    setMessage(null);
    setState("processing");

    try {
      const subscription = await readExistingSubscription();
      if (subscription) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription.toJSON()),
        });
        await subscription.unsubscribe();
      }

      setState("default");
      setMessage("Reminders turned off.");
    } catch {
      setState("error");
      setMessage("Couldn't turn off reminders. Please try again.");
      await syncState();
    }
  }, [syncState]);

  return {
    state,
    message,
    subscribe,
    unsubscribe,
    supported,
    iosInstallRequired: iosInstallRequired && getInstallState() === "ios",
  };
}
