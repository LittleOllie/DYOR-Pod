"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { newsletter as newsletterContent } from "@/content/site";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { cn } from "@/lib/utils/cn";

type FormState = "idle" | "loading" | "success" | "error";

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

  return (
    <div className="mx-auto max-w-lg">
      {state === "success" ? (
        <div>
          <NewsletterSuccess />
          <div className="mt-8">
            <p className="mb-4 text-sm font-medium text-text-primary">
              What are you most interested in? (optional)
            </p>
            <div className="flex flex-wrap justify-center gap-2">
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
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="card-surface mx-auto max-w-md border-brand/20 p-5 md:p-6"
        >
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <label htmlFor="newsletter-email" className="block text-sm font-medium text-text-primary">
            Email address
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={state === "loading"}
              className="min-h-[48px] flex-1 rounded-[var(--radius-medium)] border border-border bg-bg-primary/60 px-4 text-base text-text-primary placeholder:text-text-secondary/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50"
              aria-describedby={state === "error" ? "newsletter-error" : "newsletter-consent"}
              aria-invalid={state === "error"}
            />
            <Button
              type="submit"
              size="lg"
              disabled={state === "loading"}
              className="min-h-[48px] shrink-0"
            >
              {state === "loading" ? "Joining…" : newsletterContent.buttonLabel}
            </Button>
          </div>

          {state === "error" && (
            <p id="newsletter-error" role="alert" className="mt-2 text-sm text-live">
              {errorMessage}
            </p>
          )}

          <p id="newsletter-consent" className="mt-3 text-xs leading-relaxed text-text-secondary">
            {newsletterContent.consentText}
          </p>
        </form>
      )}
    </div>
  );
}

export function NewsletterSuccess() {
  return (
    <div
      className="card-surface mx-auto max-w-md border-success/30 bg-success/10 p-5 text-center"
      role="status"
    >
      <p className="font-medium text-success">You&apos;re on the list!</p>
      <p className="mt-1 text-sm text-text-secondary">
        Welcome to the DYOR Briefing. Check your inbox for confirmation.
      </p>
    </div>
  );
}
