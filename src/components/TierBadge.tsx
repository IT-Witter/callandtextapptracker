import type { Tier } from "@/lib/types";

/** Tier A/B/C badge. Colors match the Airtable select. */
const STYLES: Record<Tier, string> = {
  A: "bg-emerald-500 text-emerald-950",
  B: "bg-amber-400 text-amber-950",
  C: "bg-slate-500 text-slate-50",
};

/** Cadence per tier, from the Next Eligible formula. */
const CADENCE: Record<Tier, string> = {
  A: "Tier A — call every 30 days",
  B: "Tier B — call every 45 days",
  C: "Tier C — call every 60 days",
};

export default function TierBadge({ tier }: { tier: Tier | null }) {
  if (!tier) {
    return <span className="chip" title="No tier set">—</span>;
  }

  return (
    <span
      title={CADENCE[tier]}
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${STYLES[tier]}`}
    >
      {tier}
    </span>
  );
}
