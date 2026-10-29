import type { ReactNode } from "react";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";

const LEGAL_NAV = [
  { label: "Mentions", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "CGU", href: "/cgu" },
  { label: "CGV", href: "/cgv" },
  { label: "DPA", href: "/dpa" },
  { label: "Cookies", href: "/cookies" },
] as const;

export default function LegalShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <header className="border-b border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-slate-900 dark:text-white"
          >
            <BrandMark className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Lockin<span className="text-blue-600 dark:text-blue-400">IA</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-blue-600">
            Retour
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav
          aria-label="Documents juridiques"
          className="mb-6 flex flex-wrap gap-x-1 gap-y-1.5 text-xs text-slate-500"
        >
          {LEGAL_NAV.map((item, i) => (
            <span key={item.href} className="inline-flex items-center">
              {i > 0 ? (
                <span aria-hidden className="mx-1.5 text-slate-300 dark:text-slate-700">
                  ·
                </span>
              ) : null}
              <Link
                href={item.href}
                className="rounded-md px-1 py-0.5 font-medium hover:bg-slate-100 hover:text-blue-700 dark:hover:bg-slate-900 dark:hover:text-blue-300"
              >
                {item.label}
              </Link>
            </span>
          ))}
        </nav>
        <h1 className="text-justify text-2xl font-bold text-slate-900 hyphens-auto dark:text-white">
          {title}
        </h1>
        <div className="mt-6 space-y-4 text-justify text-sm leading-relaxed text-slate-600 hyphens-auto dark:text-slate-300 [&_li]:text-justify [&_p]:text-justify">
          {children}
        </div>
        <p className="mt-10 text-justify text-xs text-slate-400">
          Dernière mise à jour : 29 octobre 2026
        </p>
      </main>
    </div>
  );
}
