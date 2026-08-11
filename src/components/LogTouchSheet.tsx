"use client";

import { useEffect, useState } from "react";
import {
  CALL_OUTCOMES,
  TEXT_OUTCOMES,
  type Buyer,
  type CallWindow,
  type Outcome,
  type TouchType,
} from "@/lib/types";

/**
 * Bottom sheet for recording the result of a call or text.
 *
 * Optimized for the common case: "No Answer" for calls and "Sent" for texts are
 * preselected, so the usual interaction is one tap on Save.
 */

const CALL_WINDOWS: CallWindow[] = [
  "Morning (9-12)",
  "Midday (12-3)",
  "Evening (5-8)",
  "Weekend",
  "Unknown",
];

export default function LogTouchSheet({
  buyer,
  type,
  onClose,
  onLogged,
}: {
  buyer: Buyer;
  type: TouchType;
  onClose: () => void;
  onLogged: (updated: Buyer) => void;
}) {
  const outcomes: readonly Outcome[] = type === "Call" ? CALL_OUTCOMES : TEXT_OUTCOMES;

  const [outcome, setOutcome] = useState<Outcome>(
    type === "Call" ? "No Answer" : "Sent"
  );
  const [notes, setNotes] = useState("");
  const [callWindow, setCallWindow] = useState<CallWindow | "">("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  async function save() {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/touch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: buyer.id,
          type,
          outcome,
          notes,
          ...(callWindow ? { callWindow } : {}),
        }),
      });

      const data = (await response.json()) as { buyer?: Buyer; error?: string };

      if (!response.ok || !data.buyer) {
        setError(data.error ?? "Could not save.");
        setSaving(false);
        return;
      }

      onLogged(data.buyer);
    } catch {
      setError("Network error — nothing was saved. Try again.");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Log a ${type.toLowerCase()}`}
      onClick={() => !saving && onClose()}
    >
      <div
        className="w-full max-w-md space-y-4 rounded-t-3xl border border-edge bg-panel p-5 sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div>
          <h2 className="text-lg font-bold">
            {type === "Call" ? "📞 Log a call" : "💬 Log a text"}
          </h2>
          <p className="text-sm text-muted">
            {buyer.buyerName || buyer.username} · {buyer.phoneDisplay}
          </p>
        </div>

        {/* Outcome */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Outcome
          </p>
          <div className="flex flex-wrap gap-2">
            {outcomes.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setOutcome(option)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                  outcome === option
                    ? "border-sky-500 bg-sky-600 text-white"
                    : "border-edge bg-panel2 text-slate-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {(outcome === "Do Not Call" || outcome === "Bad Number") && (
            <p className="text-xs text-amber-400">
              This permanently removes {buyer.buyerName || "them"} from the
              callable list.
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label
            htmlFor="touch-notes"
            className="text-xs font-semibold uppercase tracking-wide text-muted"
          >
            Notes
          </label>
          <textarea
            id="touch-notes"
            className="field min-h-24 resize-y"
            placeholder="What did they say? Written so Seth can read it cold."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        {/* Call window — only worth asking when we actually spoke to them. */}
        {outcome === "Connected" && (
          <div className="space-y-2">
            <label
              htmlFor="call-window"
              className="text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Best time to reach them (their local time)
            </label>
            <select
              id="call-window"
              className="field"
              value={callWindow}
              onChange={(event) =>
                setCallWindow(event.target.value as CallWindow | "")
              }
            >
              <option value="">Leave as {buyer.callWindow ?? "Unknown"}</option>
              {CALL_WINDOWS.map((window) => (
                <option key={window} value={window}>
                  {window}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-call disabled:opacity-60"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
