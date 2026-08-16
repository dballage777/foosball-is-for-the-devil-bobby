import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="font-serif text-6xl font-bold text-brand">404</p>
      <h1 className="mt-4 font-serif text-2xl font-semibold">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-2 text-muted">
        The passage, study, or resource may have moved.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-brand px-5 py-2.5 font-semibold text-white hover:opacity-90"
        >
          Home
        </Link>
        <Link
          href="/bible"
          className="rounded-md border border-line px-5 py-2.5 font-semibold hover:bg-brand-soft"
        >
          Read the Bible
        </Link>
      </div>
    </div>
  );
}
