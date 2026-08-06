"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MobileSectionHeader } from "@/components/mobile/MobileSectionHeader";
import { HeadingWithAccent } from "@/components/ui/ColorfulAccent";
import { newsletter as newsletterContent, newsletterMobile } from "@/content/site";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { cn } from "@/lib/utils/cn";

type FormState = "idle" | "loading" | "success" | "error";

function NewsletterFormFields({
  email,
  setEmail,
  honeypot,
  setHoneypot,
  state,
  errorMessage,
  onSubmit,
  layout,
}: {
  email: string;
  setEmail: (v: string) => void;
  honeypot: string;
  setHoneypot: (v: string) => void;
  state: FormState;
  errorMessage: string;
  onSubmit: (e: React.FormEvent) => void;
  layout: "mobile" | "desktop";
}) {
  const isDesktop = layout === "desktop";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn(
        isDesktop
          ? "newsletter-form w-full min-w-0"
          : "mobile-newsletter-panel mx-auto max-w-md md:card-surface md:border-brand/20 md:p-6",
      )}
    >
      <div className="sr-only" aria-hidden="true">
        <label htmlFor={`website-${layout}`}>Website</label>
        <input
          id={`website-${layout}`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {!isDesktop && (
        <>
          <p className="mb-4 hidden text-base leading-relaxed text-text-secondary md:block">
            {newsletterContent.description}
          </p>
          <p className="mb-4 text-[15px] leading-[1.6] text-text-secondary md:hidden">
            {newsletterContent.description}
          </p>
        </>
      )}

      <label
        htmlFor={`newsletter-email-${layout}`}
        className={cn(
          "block text-sm font-medium text-text-primary",
          isDesktop && "sr-only",
        )}
      >
        Email address
      </label>
      <div
        className={cn(
          "mt-2 grid w-full min-w-0 gap-3",
          isDesktop
            ? "min-[1151px]:grid-cols-[minmax(260px,1fr)_auto]"
            : "grid-cols-1",
        )}
      >
        <input
          id={`newsletter-email-${layout}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={state === "loading"}
          className={cn(
            "newsletter-form__input min-h-[50px] w-full min-w-0 rounded-[var(--radius-medium)] border border-border bg-bg-primary/60 px-[18px] text-base text-text-primary placeholder:text-text-secondary/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50",
            isDesktop && "min-h-[54px] text-[16px]",
          )}
          aria-describedby={state === "error" ? `newsletter-error-${layout}` : `newsletter-consent-${layout}`}
          aria-invalid={state === "error"}
        />
        <Button
          type="submit"
          size="lg"
          disabled={state === "loading"}
          className={cn(
            "newsletter-form__submit min-h-[50px] w-full shrink-0 whitespace-nowrap",
            isDesktop &&
              "min-h-[54px] px-7 min-[1151px]:w-auto min-[1151px]:min-w-[210px] min-[1151px]:max-w-[280px]",
          )}
        >
          {state === "loading" ? "Joining…" : newsletterContent.buttonLabel}
        </Button>
      </div>

      {state === "error" && (
        <p id={`newsletter-error-${layout}`} role="alert" className="mt-2 text-sm text-live">
          {errorMessage}
        </p>
      )}

      <p
        id={`newsletter-consent-${layout}`}
        className={cn(
          "newsletter-form__privacy col-span-full mt-3 text-xs leading-relaxed text-text-secondary",
        )}
      >
        {newsletterContent.consentText}
      </p>
    </form>
  );
}

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showInterests, setShowInterests] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, honeypot }),
      });

      const data = (await response.json()) as { success: boolean; message: string };

      if (data.success) {
        setState("success");
        setShowInterests(true);
        trackEvent("newsletter_submit");
      } else {
        setState("error");
        setErrorMessage(data.message);
      }
    } catch {
      setState("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  };

  if (state === "success" && !showInterests) {
    return <NewsletterSuccess />;
  }

  const successBlock = state === "success" && (
    <div className={cn("md:mx-auto md:max-w-md", "lg:mx-0 lg:max-w-none")}>
      <NewsletterSuccess />
      <div className="mt-6">
        <p className="mb-4 text-sm font-medium text-text-primary">
          What are you most interested in? (optional)
        </p>
        <div className="flex flex-wrap gap-2">
          {newsletterContent.interests.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={cn(
                "min-h-[44px] rounded-full border px-3 py-2 text-sm transition-colors duration-[var(--motion-fast)] focus-ring",
                selectedInterests.includes(interest)
                  ? "border-brand bg-brand/15 text-brand-bright"
                  : "border-border text-text-secondary hover:border-brand/50",
              )}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <MobileSectionHeader
        eyebrow={newsletterMobile.eyebrow}
        title={newsletterContent.heading}
        className="md:hidden"
      />

      {/* Mobile */}
      <div className="mx-auto max-w-lg md:hidden">
        {state === "success" ? (
          <div className="mobile-newsletter-panel">{successBlock}</div>
        ) : (
          <NewsletterFormFields
            email={email}
            setEmail={setEmail}
            honeypot={honeypot}
            setHoneypot={setHoneypot}
            state={state}
            errorMessage={errorMessage}
            onSubmit={handleSubmit}
            layout="mobile"
          />
        )}
      </div>

      {/* Desktop full-width band content */}
      <div className="newsletter-inner hidden min-w-0 md:grid md:grid-cols-1 md:gap-8 min-[1151px]:grid-cols-[minmax(320px,0.8fr)_minmax(520px,1.2fr)] min-[1151px]:items-center min-[1151px]:gap-[clamp(3rem,7vw,7.5rem)]">
        <div className="max-w-xl min-[1151px]:max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">
            The weekly briefing
          </p>
          <h2 className="mt-3 font-heading text-4xl font-bold leading-[1.08] text-text-primary lg:text-5xl xl:text-[3.25rem]">
            <HeadingWithAccent
              title={newsletterContent.heading}
              accent="DYOR Briefing"
            />
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-text-secondary lg:text-xl">
            {newsletterContent.description}
          </p>
        </div>

        <div className="min-w-0">
          {state === "success" ? (
            successBlock
          ) : (
            <NewsletterFormFields
              email={email}
              setEmail={setEmail}
              honeypot={honeypot}
              setHoneypot={setHoneypot}
              state={state}
              errorMessage={errorMessage}
              onSubmit={handleSubmit}
              layout="desktop"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function NewsletterSuccess() {
  return (
    <div
      className="rounded-[var(--radius-large)] border border-success/30 bg-success/10 p-5 text-center md:border-success/25 md:bg-success/10 md:text-left lg:p-6"
      role="status"
    >
      <p className="font-medium text-success">You&apos;re on the list.</p>
      <p className="mt-1 text-sm text-text-secondary">
        The next briefing will land in your inbox.
      </p>
    </div>
  );
}
