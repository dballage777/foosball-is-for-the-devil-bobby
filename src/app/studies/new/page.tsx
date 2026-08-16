import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import { getCurrentUser } from "@/lib/supabase/server";
import { AuthGate } from "@/components/auth-gate";
import { createStudy } from "@/app/studies/actions";
import { BIBLE_BOOKS } from "@/lib/bible/books";

export const metadata: Metadata = {
  title: "Create a Bible Study",
  robots: { index: false, follow: false },
};

export default async function NewStudyPage() {
  const configured = isSupabaseConfigured();
  const user = configured ? await getCurrentUser() : null;
  if (configured && !user) redirect("/account");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-brand">
        Create a Bible Study
      </h1>

      {!configured ? (
        <AuthGate feature="create a Bible study" />
      ) : (
        <form action={createStudy} className="mt-6 space-y-5">
          <Field label="Study name" required>
            <input
              name="name"
              required
              maxLength={160}
              className="w-full rounded-md border border-line bg-surface px-3 py-2"
              placeholder="e.g. Wednesday Night John Study"
            />
          </Field>

          <Field label="Description">
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-md border border-line bg-surface px-3 py-2"
              placeholder="What is this study about?"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Book">
              <select
                name="book_slug"
                className="w-full rounded-md border border-line bg-surface px-3 py-2"
              >
                <option value="">— Select —</option>
                {BIBLE_BOOKS.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Chapter">
              <input
                name="chapter"
                type="number"
                min={1}
                className="w-full rounded-md border border-line bg-surface px-3 py-2"
              />
            </Field>
          </div>

          <Field label="Passage reference (optional)">
            <input
              name="passage_ref"
              maxLength={120}
              className="w-full rounded-md border border-line bg-surface px-3 py-2"
              placeholder="e.g. John 1:1–18"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Study date (optional)">
              <input
                name="study_date"
                type="date"
                className="w-full rounded-md border border-line bg-surface px-3 py-2"
              />
            </Field>
            <Field label="Recurring schedule (optional)">
              <input
                name="recurring_schedule"
                maxLength={120}
                className="w-full rounded-md border border-line bg-surface px-3 py-2"
                placeholder="e.g. Weekly on Wednesday"
              />
            </Field>
          </div>

          <Field label="Privacy">
            <select
              name="privacy"
              defaultValue="private"
              className="w-full rounded-md border border-line bg-surface px-3 py-2"
            >
              <option value="private">Private — invite only (not discoverable)</option>
              <option value="public">Public — anyone signed in can find it</option>
            </select>
          </Field>

          <button
            type="submit"
            className="rounded-md bg-brand px-5 py-2.5 font-semibold text-white hover:opacity-90"
          >
            Create study
          </button>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      {children}
    </label>
  );
}
