import Link from "next/link";
import { SITE } from "@/lib/config";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/bible", label: "Bible" },
  { href: "/my-study", label: "My Study" },
  { href: "/studies", label: "Bible Studies" },
  { href: "/apologetics", label: "Apologetics" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

export function SiteNav() {
  return (
    <header className="border-b border-line bg-surface/80 backdrop-blur sticky top-0 z-40">
      <nav
        className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-3"
        aria-label="Primary"
      >
        <Link href="/" className="mr-2 flex items-center gap-2 font-serif text-lg font-bold text-brand">
          <span aria-hidden className="text-accent">✦</span>
          {SITE.name}
        </Link>
        <ul className="hidden flex-1 items-center gap-1 md:flex">
          {NAV.slice(1).map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-ink/80 hover:bg-brand-soft hover:text-brand"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/account"
            className="rounded-md border border-line px-3 py-2 text-sm font-medium hover:bg-brand-soft"
          >
            Account
          </Link>
        </div>
      </nav>
      {/* Mobile nav */}
      <div className="border-t border-line md:hidden">
        <ul className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-3 py-2 text-sm">
          {NAV.slice(1).map((item) => (
            <li key={item.href} className="shrink-0">
              <Link href={item.href} className="rounded-md px-3 py-1.5 text-ink/80 hover:bg-brand-soft">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted">
        <p className="font-serif text-base text-brand">{SITE.name}</p>
        <p className="mt-1">{SITE.tagline}</p>
        <p className="mt-4 text-xs">
          Scripture is served through a licensed provider abstraction. The NIV is
          copyrighted; see project documentation for licensing. Apologetics
          resources link to their official owners.
        </p>
      </div>
    </footer>
  );
}
