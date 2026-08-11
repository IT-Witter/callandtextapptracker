"use client";

import { useMemo, useState } from "react";
import BuyerCard from "./BuyerCard";
import { isCallNow, type Buyer, type User } from "@/lib/types";

/**
 * "My Queue" — the buyers assigned to you who are dialable today.
 *
 * Sort order: Tier A first, then never-contacted before previously-contacted,
 * then oldest last-call first. That puts the highest-value untouched accounts at
 * the top of the list every morning.
 */

const TIER_RANK: Record<string, number> = { A: 0, B: 1, C: 2 };

function compare(a: Buyer, b: Buyer): number {
  const tierDiff =
    (TIER_RANK[a.tier ?? "C"] ?? 3) - (TIER_RANK[b.tier ?? "C"] ?? 3);
  if (tierDiff !== 0) return tierDiff;

  const aNever = !a.lastCalled;
  const bNever = !b.lastCalled;
  if (aNever !== bNever) return aNever ? -1 : 1;

  // Both have been called: oldest first.
  if (a.lastCalled && b.lastCalled) {
    return a.lastCalled.localeCompare(b.lastCalled);
  }

  return (a.buyerName || a.username).localeCompare(b.buyerName || b.username);
}

export default function QueueView({
  initialBuyers,
  currentUser,
}: {
  initialBuyers: Buyer[];
  currentUser: User;
}) {
  const [buyers, setBuyers] = useState(initialBuyers);
  const [showDone, setShowDone] = useState(false);

  const queue = useMemo(
    () => buyers.filter(isCallNow).sort(compare),
    [buyers]
  );

  const done = useMemo(
    () => buyers.filter((b) => !isCallNow(b)).sort(compare),
    [buyers]
  );

  function replace(updated: Buyer) {
    setBuyers((prior) =>
      prior.map((b) => (b.id === updated.id ? updated : b))
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold">
          {queue.length} to call
          {queue.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted">
              {queue.filter((b) => b.tier === "A").length} tier A
            </span>
          )}
        </h1>
      </div>

      {buyers.length === 0 ? (
        <p className="card text-sm text-muted">
          Nothing is assigned to {currentUser} yet. Check the All Buyers tab, or
          set <strong>Assigned To</strong> in Airtable.
        </p>
      ) : queue.length === 0 ? (
        <p className="card text-sm text-muted">
          🎉 Queue is clear. Everyone assigned to you is cooling down or excluded.
        </p>
      ) : (
        <div className="space-y-3">
          {queue.map((buyer) => (
            <BuyerCard
              key={buyer.id}
              buyer={buyer}
              currentUser={currentUser}
              onLogged={replace}
            />
          ))}
        </div>
      )}

      {done.length > 0 && (
        <section className="space-y-3 pt-2">
          <button
            type="button"
            className="btn-ghost w-full text-sm"
            onClick={() => setShowDone((value) => !value)}
          >
            {showDone ? "Hide" : "Show"} {done.length} cooling down / excluded
          </button>

          {showDone &&
            done.map((buyer) => (
              <BuyerCard
                key={buyer.id}
                buyer={buyer}
                currentUser={currentUser}
                onLogged={replace}
              />
            ))}
        </section>
      )}
    </div>
  );
}
