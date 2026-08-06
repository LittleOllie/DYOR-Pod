const REMINDER_MINUTES = 15;
const CHECK_INTERVAL_MS = 5 * 60 * 1000;
const notifiedKeys = new Set();

function reminderKey(event) {
  return `${event.showId}:${event.start}`;
}

async function fetchUpcomingEvents() {
  const response = await fetch("/api/schedule", { cache: "no-store" });
  if (!response.ok) {
    return [];
  }

  const payload = await response.json();
  return payload.events ?? [];
}

function msUntilReminder(eventStartIso) {
  const start = new Date(eventStartIso).getTime();
  const reminderAt = start - REMINDER_MINUTES * 60 * 1000;
  return reminderAt - Date.now();
}

async function scheduleReminders() {
  if (!self.registration?.showNotification) {
    return;
  }

  const events = await fetchUpcomingEvents();
  const now = Date.now();

  for (const event of events) {
    const key = reminderKey(event);
    if (notifiedKeys.has(key)) {
      continue;
    }

    const delay = msUntilReminder(event.start);
    if (delay <= 0 && delay > -CHECK_INTERVAL_MS) {
      notifiedKeys.add(key);
      await self.registration.showNotification(`${event.name} starts soon`, {
        body: `DYOR Space reminder — starting in about ${REMINDER_MINUTES} minutes.`,
        tag: key,
        data: { url: event.xUrl ?? "/#schedule" },
        icon: "/brand/logo-d.png",
        badge: "/brand/logo-d.png",
      });
      continue;
    }

    if (delay > 0 && delay <= 24 * 60 * 60 * 1000) {
      setTimeout(async () => {
        if (notifiedKeys.has(key)) return;
        notifiedKeys.add(key);
        await self.registration.showNotification(`${event.name} starts soon`, {
          body: `DYOR Space reminder — starting in about ${REMINDER_MINUTES} minutes.`,
          tag: key,
          data: { url: event.xUrl ?? "/#schedule" },
          icon: "/brand/logo-d.png",
          badge: "/brand/logo-d.png",
        });
      }, delay);
    }
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      await scheduleReminders();
      setInterval(scheduleReminders, CHECK_INTERVAL_MS);
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? "/#schedule";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "schedule-reminders") {
    scheduleReminders();
  }
});
