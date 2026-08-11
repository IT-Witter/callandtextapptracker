"use client";

import { useMemo, useState } from "react";
import BuyerCard from "./BuyerCard";
import FilterBar, { EMPTY_FILTERS, type Filters } from "./FilterBar";
import { toE164 } from "@/lib/phone";
import type { Buyer, User } from "@/lib/types";

/** Full searchable list, so Seth can look anyone up or reassign. */
export default function AllBuyersView({
  initialBuyers,
  currentUser,
}: {
  initialBuyers: Buyer[];
  currentUser: User;
}) {
  const [buyers, setBuyers] = useState(initialBuyers);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const owners = useMemo(() => {
    const set = new Set<string>();
    for (const buyer of buyers) {
      if (buyer.assignedTo) set.add(buyer.assignedTo);
    }
    return [...set].sort();
  }, [buyers]);

  const visible = useMemo(() => {
    const needle = filters.search.trim().toLowerCase();
    const needleDigits = needle.replace(/\D+/g, "");

    return buyers.filter((buyer) => {
      if (filters.tier && buyer.tier !== filters.tier) return false;
      if (filters.assignedTo && buyer.assignedTo !== filters.assignedTo) return false;
      if (filters.channel && buyer.channel !== filters.channel) return false;

      if (filters.status) {
        const status = buyer.callStatus;
        if (filters.status === "callnow" && !status.startsWith("Call now")) return false;
        if (filters.status === "never" && status !== "Call now - never contacted")
          return false;
        if (filters.status === "cooling" && status !== "Cooling down") return false;
        if (filters.status === "excluded" && status !== "Excluded") return false;
      }

      if (needle) {
        const haystack = `${buyer.buyerName} ${buyer.username}`.toLowerCase();
        const phoneMatch =
          needleDigits.length >= 3 &&
          (toE164(buyer.phone) ?? buyer.phone).includes(needleDigits);
        if (!haystack.includes(needle) && !phoneMatch) return false;
      }

      return true;
    });
  }, [buyers, filters]);

  function replace(updated: Buyer) {
    setBuyers((prior) => prior.map((b) => (b.id === updated.id ? updated : b)));
  }

  return (
    <div className="space-y-4">
      <FilterBar filters={filters} owners={owners} onChange={setFilters} />

      <p className="text-sm text-muted">
        {visible.length} of {buyers.length} buyers
      </p>

      {visible.length === 0 ? (
        <p className="card text-sm text-muted">No buyers match those filters.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((buyer) => (
            <BuyerCard
              key={buyer.id}
              buyer={buyer}
              currentUser={currentUser}
              onLogged={replace}
            />
          ))}
        </div>
      )}
    </div>
  );
}
