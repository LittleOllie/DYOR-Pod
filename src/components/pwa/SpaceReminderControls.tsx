"use client";

import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { useSpaceReminders } from "@/hooks/useSpaceReminders";
import { cn } from "@/lib/utils/cn";

type SpaceReminderButtonProps = {
  variant?: "primary" | "secondary";
  className?: string;
  compact?: boolean;
};

export function SpaceReminderButton({
  variant = "primary",
  className,
  compact = false,
}: SpaceReminderButtonProps) {
  const { state, message, subscribe, unsubscribe, iosInstallRequired } = useSpaceReminders();
  const [showIosHint, setShowIosHint] = useState(false);

  const label =
    state === "processing"
      ? "Setting reminder…"
      : state === "subscribed"
        ? "Reminder on"
        : state === "denied"
          ? "Notifications blocked"
          : "Remind me";

  const handleClick = () => {
    if (state === "subscribed") {
      void unsubscribe();
      return;
    }

    if (iosInstallRequired) {
      setShowIosHint(true);
      return;
    }

    void subscribe();
  };

  const disabled =
    state === "processing" ||
    state === "unsupported" ||
    state === "not-configured" ||
    state === "denied";

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        type="button"
        variant={variant === "primary" ? "primary" : "secondary"}
        size={compact ? "md" : "lg"}
        className={cn(
          "min-h-[50px] w-full",
          !compact && "md:min-h-[52px] md:text-base",
        )}
        onClick={handleClick}
        disabled={disabled}
        aria-pressed={state === "subscribed"}
        aria-live="polite"
      >
        {label}
      </Button>
      {showIosHint && iosInstallRequired && (
        <IosInstallReminderHint />
      )}
      {state === "subscribed" && !compact && (
        <button
          type="button"
          className="text-xs text-text-secondary underline-offset-2 hover:text-brand-bright hover:underline focus-ring"
          onClick={() => void unsubscribe()}
        >
          Turn off reminders
        </button>
      )}
      {message && (
        <p className="text-xs leading-relaxed text-text-secondary" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

export function IosInstallReminderHint() {
  const { iosInstallRequired } = useSpaceReminders();
  if (!iosInstallRequired) {
    return null;
  }

  return (
    <div className="rounded-[var(--radius-large)] border border-border/80 bg-surface/40 p-4">
      <p className="font-heading text-sm font-bold text-text-primary">
        Get Space reminders on iPhone
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-text-secondary">
        <li>Tap Share in Safari</li>
        <li>
          Choose <strong className="text-text-primary">Add to Home Screen</strong>
        </li>
        <li>Open DYOR from your Home Screen</li>
        <li>Tap <strong className="text-text-primary">Remind me</strong></li>
      </ol>
    </div>
  );
}

export function ScheduleInstallHelper() {
  const { iosInstallRequired } = useSpaceReminders();

  return (
    <div className="mt-8 rounded-[var(--radius-xl)] border border-border/80 bg-surface/50 p-5 md:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
        Stay on mission
      </p>
      <h3 className="mt-2 font-heading text-xl font-bold text-text-primary">
        Get DYOR on your Home Screen
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        Install DYOR like an app for quick access to the next Space and reminders.
      </p>

      {iosInstallRequired ? (
        <div className="mt-4">
          <IosInstallReminderHint />
        </div>
      ) : (
        <p className="mt-4 text-sm text-text-secondary">
          On Android Chrome: Menu →{" "}
          <strong className="text-text-primary">Install app</strong> or{" "}
          <strong className="text-text-primary">Add to Home screen</strong>.
        </p>
      )}

      <div className="mt-5">
        <SpaceReminderButton variant="secondary" compact />
      </div>
    </div>
  );
}

export function HeroReminderActions({
  isLive,
  ctaUrl,
}: {
  isLive: boolean;
  ctaUrl?: string;
}) {
  if (isLive && ctaUrl) {
    return (
      <div className="mt-5 space-y-3">
        <LinkButton
          href={ctaUrl}
          variant="live"
          size="lg"
          external
          className="min-h-[50px] w-full text-base md:min-h-[52px]"
        >
          Join live
        </LinkButton>
        <LinkButton
          href="/#schedule"
          variant="secondary"
          size="lg"
          className="min-h-[50px] w-full md:min-h-[52px]"
        >
          View schedule
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-3">
      <SpaceReminderButton variant="primary" />
      <LinkButton
        href="/#schedule"
        variant="secondary"
        size="lg"
        className="min-h-[50px] w-full md:min-h-[52px]"
      >
        View schedule
      </LinkButton>
    </div>
  );
}
