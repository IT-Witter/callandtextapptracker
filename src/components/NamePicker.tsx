"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { USERS, type User } from "@/lib/types";

/** Per-person accent colors, matched to the Airtable select colors. */
const COLORS: Record<User, string> = {
  Seth: "bg-red-600 active:bg-red-700",
  Ben: "bg-sky-500 active:bg-sky-600",
  Marley: "bg-teal-600 active:bg-teal-700",
  Colton: "bg-blue-600 active:bg-blue-700",
};

/**
 * Two-step sign-in: shared PIN, then tap your name.
 * The PIN is verified server-side by POST /api/auth.
 */
export default function NamePicker() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [pending, setPending] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(user: User) {
    if (pin.trim().length === 0) {
      setError("Enter the team PIN first.");
      return;
    }

    setPending(user);
    setError(null);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, user }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Sign-in failed.");
        setPending(null);
        return;
      }

      // Full refresh so the server components re-render with the new session.
      router.replace("/");
      router.refresh();
    } catch {
      setError("Network error — check your connection.");
      setPending(null);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Witter Call &amp; Text Tracker</h1>
        <p className="text-sm text-muted">Enter the team PIN, then tap your name.</p>
      </div>

      <input
        type="password"
        inputMode="numeric"
        autoComplete="off"
        className="field text-center tracking-[0.3em]"
        placeholder="PIN"
        value={pin}
        onChange={(event) => {
          setPin(event.target.value);
          setError(null);
        }}
        aria-label="Team PIN"
      />

      <div className="grid grid-cols-2 gap-3">
        {USERS.map((user) => (
          <button
            key={user}
            type="button"
            onClick={() => signIn(user)}
            disabled={pending !== null}
            className={`btn text-white disabled:opacity-50 ${COLORS[user]}`}
          >
            {pending === user ? "…" : user}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-center text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
