import { redirect } from "next/navigation";
import NamePicker from "@/components/NamePicker";
import { getCurrentUser } from "@/lib/session";

export default async function LoginPage() {
  // Already signed in? Skip straight to the queue.
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect("/");

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <NamePicker />
    </main>
  );
}
