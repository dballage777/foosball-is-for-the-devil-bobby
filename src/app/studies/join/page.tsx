import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Join a Bible Study",
  robots: { index: false, follow: false },
};

/**
 * Paste-a-link/token entry. Normalizes either a full invite URL or a bare
 * token, then forwards to the token join page.
 */
export default function JoinEntryPage() {
  async function go(formData: FormData) {
    "use server";
    const raw = String(formData.get("token") ?? "").trim();
    const token = raw.split("/").filter(Boolean).pop() ?? raw;
    if (!token) redirect("/studies/join");
    redirect(`/studies/join/${encodeURIComponent(token)}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-serif text-3xl font-bold text-brand">
        Join a Bible study
      </h1>
      <p className="mt-2 text-muted">
        Paste the invitation link (or token) a friend shared with you.
      </p>
      <form action={go} className="mt-6 flex gap-2">
        <input
          name="token"
          required
          placeholder="https://…/studies/join/abcdef123…"
          className="flex-1 rounded-md border border-line bg-surface px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 font-semibold text-white hover:opacity-90"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
