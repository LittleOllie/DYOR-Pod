"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { contactPage } from "@/content/contact";
import { site } from "@/content/site";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { cn } from "@/lib/utils/cn";

type FormState = "idle" | "loading" | "success" | "error";

const inputClass =
  "min-h-[52px] w-full rounded-[var(--radius-medium)] border border-border bg-surface px-4 text-base text-text-primary placeholder:text-text-secondary/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50";

export function ContactForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, message, honeypot }),
      });

      const data = (await response.json()) as { success: boolean; message: string };

      if (data.success) {
        setState("success");
        trackEvent("contact_submit");
        setFirstName("");
        setLastName("");
        setEmail("");
        setMessage("");
      } else {
        setState("error");
        setErrorMessage(data.message);
      }
    } catch {
      setState("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  if (state === "success") {
    return (
      <div
        className="rounded-[var(--radius-large)] border border-success/30 bg-success/10 p-6 text-center"
        role="status"
      >
        <p className="text-lg font-medium text-success">{contactPage.successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-first-name" className="mb-2 block text-sm font-medium text-text-primary">
            First name <span className="text-brand-bright">(required)</span>
          </label>
          <input
            id="contact-first-name"
            name="firstName"
            type="text"
            required
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={state === "loading"}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact-last-name" className="mb-2 block text-sm font-medium text-text-primary">
            Last name <span className="text-brand-bright">(required)</span>
          </label>
          <input
            id="contact-last-name"
            name="lastName"
            type="text"
            required
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={state === "loading"}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-text-primary">
          Email <span className="text-brand-bright">(required)</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "loading"}
          className={inputClass}
          aria-describedby={state === "error" ? "contact-error" : "contact-consent"}
          aria-invalid={state === "error"}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-text-primary">
          Message <span className="text-brand-bright">(required)</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={state === "loading"}
          className={cn(inputClass, "min-h-[160px] resize-y py-3")}
          aria-describedby={state === "error" ? "contact-error" : "contact-consent"}
          aria-invalid={state === "error"}
        />
      </div>

      {state === "error" && (
        <div id="contact-error" role="alert" className="rounded-md border border-live/30 bg-live/10 p-4 text-sm text-live">
          <p>{errorMessage}</p>
          {site.social.x && (
            <p className="mt-2">
              Or message us on{" "}
              <ExternalLink href={site.social.x}>@DYORPod on X</ExternalLink>.
            </p>
          )}
        </div>
      )}

      <p id="contact-consent" className="text-xs text-text-secondary">
        {contactPage.consentText}
      </p>

      <Button
        type="submit"
        size="lg"
        disabled={state === "loading"}
        className="min-h-[52px] w-full sm:w-auto sm:min-w-[140px]"
      >
        {state === "loading" ? "Sending…" : contactPage.submitLabel}
      </Button>
    </form>
  );
}
