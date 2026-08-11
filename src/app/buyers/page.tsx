import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import AllBuyersView from "@/components/AllBuyersView";
import { listBuyers } from "@/lib/airtable";
import { getCurrentUser } from "@/lib/session";

/** All Buyers — the full list with search and filters. */
export default async function BuyersPage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login");

  let buyers = null;
  let error: string | null = null;

  try {
    buyers = await listBuyers();
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Could not reach Airtable.";
  }

  return (
    <>
      <AppHeader user={user} />
      <main className="mx-auto max-w-2xl px-4 py-4">
        {error ? (
          <div className="card space-y-2">
            <h1 className="font-semibold text-red-400">Couldn&apos;t load buyers</h1>
            <p className="text-sm text-muted">{error}</p>
          </div>
        ) : (
          <AllBuyersView initialBuyers={buyers ?? []} currentUser={user} />
        )}
      </main>
    </>
  );
}
