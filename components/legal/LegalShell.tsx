import type { ReactNode } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

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
            Conform<span className="text-blue-600 dark:text-blue-400">AI</span>
            <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-blue-600">
            Retour
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {children}
        </div>
        <p className="mt-10 text-xs text-slate-400">Dernière mise à jour : octobre 2026</p>
      </main>
    </div>
  );
}
