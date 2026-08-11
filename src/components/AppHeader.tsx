"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@/lib/types";

/** Sticky header: who you are, where you are, and a way out. */
export default function AppHeader({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth", { method: "DELETE" });
    router.replace("/login");
    router.refresh();
  }

  const tabs = [
    { href: "/", label: "My Queue" },
    { href: "/buyers", label: "All Buyers" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-edge bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Signed in as</span>
          <span className="font-semibold">{user}</span>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="rounded-lg border border-edge px-3 py-1.5 text-sm text-slate-300 active:bg-panel2"
        >
          Switch
        </button>
      </div>

      <nav className="mx-auto flex max-w-2xl gap-1 px-4 pb-2">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                active ? "bg-panel2 text-white" : "text-muted"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
