import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import QueueView from "@/components/QueueView";
import { listBuyers } from "@/lib/airtable";
import { getCurrentUser } from "@/lib/session";

/** My Queue — buyers assigned to the signed-in user. Server-rendered. */
export default async function HomePage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login");

  let buyers = null;
  let error: string | null = null;

  try {
    const all = await listBuyers();
    buyers = all.filter((buyer) => buyer.assignedTo === user);
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
            <p className="text-sm text-muted">
              Check that <code>AIRTABLE_TOKEN</code> in <code>.env.local</code> is
              valid and has access to the <em>whatnot username tracker</em> base.
            </p>
          </div>
        ) : (
          <QueueView initialBuyers={buyers ?? []} currentUser={user} />
        )}
      </main>
    </>
  );
}
