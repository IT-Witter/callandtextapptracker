"use client";

/** Search + dropdown filters for the All Buyers screen. */
export interface Filters {
  search: string;
  tier: string;
  assignedTo: string;
  status: string;
  channel: string;
}

export const EMPTY_FILTERS: Filters = {
  search: "",
  tier: "",
  assignedTo: "",
  status: "",
  channel: "",
};

export default function FilterBar({
  filters,
  owners,
  onChange,
}: {
  filters: Filters;
  owners: string[];
  onChange: (next: Filters) => void;
}) {
  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="space-y-2">
      <input
        type="search"
        className="field"
        placeholder="Search name, username, or phone…"
        value={filters.search}
        onChange={(event) => set("search", event.target.value)}
        aria-label="Search buyers"
      />

      <div className="grid grid-cols-2 gap-2">
        <select
          className="field"
          value={filters.tier}
          onChange={(event) => set("tier", event.target.value)}
          aria-label="Filter by tier"
        >
          <option value="">All tiers</option>
          <option value="A">Tier A</option>
          <option value="B">Tier B</option>
          <option value="C">Tier C</option>
        </select>

        <select
          className="field"
          value={filters.assignedTo}
          onChange={(event) => set("assignedTo", event.target.value)}
          aria-label="Filter by owner"
        >
          <option value="">Everyone</option>
          {owners.map((owner) => (
            <option key={owner} value={owner}>
              {owner}
            </option>
          ))}
        </select>

        <select
          className="field"
          value={filters.status}
          onChange={(event) => set("status", event.target.value)}
          aria-label="Filter by call status"
        >
          <option value="">Any status</option>
          <option value="callnow">Call now</option>
          <option value="never">Never contacted</option>
          <option value="cooling">Cooling down</option>
          <option value="excluded">Excluded</option>
        </select>

        <select
          className="field"
          value={filters.channel}
          onChange={(event) => set("channel", event.target.value)}
          aria-label="Filter by channel"
        >
          <option value="">All channels</option>
          <option value="Whatnot">Whatnot</option>
          <option value="eBay">eBay</option>
          <option value="Both">Both</option>
        </select>
      </div>
    </div>
  );
}
