"use client";

import { useState } from "react";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";
import HrView from "./HrView";
import UserView from "./UserView";
import { demoCompanyModule, demoEmployees } from "./data";

type View = "rh" | "user";

export default function DemoApp() {
  const [view, setView] = useState<View>("rh");

  return (
    <div
      className={`min-h-screen ${
        view === "rh"
          ? "bg-gradient-to-b from-sky-50 via-blue-50/80 to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950"
          : "bg-gradient-to-b from-violet-50/80 via-slate-50 to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950"
      }`}
    >
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <div className="relative z-10 flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="flex shrink-0 items-center gap-1.5 text-lg font-bold tracking-tight text-slate-900 dark:text-white"
            >
              <BrandMark className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Lockin<span className="text-blue-600 dark:text-blue-400">IA</span>
            </Link>
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="pointer-events-auto inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {(
                [
                  ["rh", "Espace RH"],
                  ["user", "Parcours"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setView(id)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                    view === id
                      ? id === "rh"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-violet-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Espace symétrique pour garder le logo/toggle visibles */}
          <div className="w-10 shrink-0 sm:w-[7.5rem]" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {view === "rh" ? (
          <HrView
            demo
            initialEmployees={demoEmployees}
            companyName="Atelier Lumière"
            companyModule={demoCompanyModule}
            seatsMax={5}
            seatsUsed={5}
            structureRegistryId="REG-LIA-2026-DEMO1"
          />
        ) : (
          <UserView />
        )}
      </main>
    </div>
  );
}
