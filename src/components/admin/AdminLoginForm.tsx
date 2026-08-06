"use client";

import { useState, useTransition } from "react";
import { signInAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    startTransition(async () => {
      const result = await signInAction(email, password);

      if (!result.ok) {
        setStatus("error");
        setMessage(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="admin-email" className="block text-sm font-medium text-text-primary">
          Team email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-[var(--radius-medium)] border border-border bg-surface px-3 py-2.5 text-text-primary focus-ring"
          placeholder="you@dyorpod.com"
        />
      </div>

      <div>
        <label htmlFor="admin-password" className="block text-sm font-medium text-text-primary">
          Team password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-[var(--radius-medium)] border border-border bg-surface px-3 py-2.5 text-text-primary focus-ring"
        />
      </div>

      <Button type="submit" size="md" className="w-full" disabled={status === "loading" || isPending}>
        {status === "loading" || isPending ? "Signing in…" : "Sign in"}
      </Button>

      {message ? (
        <p role="alert" className="text-sm text-live">
          {message}
        </p>
      ) : null}

      <p className="text-xs leading-relaxed text-text-secondary/80">
        Only allowlisted DYOR team emails can access the dashboard.
      </p>
    </form>
  );
}
