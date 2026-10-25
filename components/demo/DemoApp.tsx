"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import HrView from "./HrView";
import UserView, { DEMO_USER } from "./UserView";
import { employees } from "./data";

type View = "rh" | "user";

export default function DemoApp() {
  const [view, setView] = useState<View>("rh");

  return (
    <div
      className={`min-h-screen ${
        view === "rh" ? "bg-blue-50 dark:bg-slate-950" : "bg-slate-50 dark:bg-slate-950"
      }`}
    >
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        {view === "user" ? (
          <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <div className="relative z-10 flex min-w-0 items-center gap-2.5">
              <ThemeToggle />
              <Link
                href="/"
                className="hidden shrink-0 items-center gap-1.5 text-lg font-bold tracking-tight text-slate-900 sm:flex dark:text-white"
              >
                Start<span className="text-blue-600 dark:text-blue-400">IA</span>
                <GraduationCap
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </Link>
              <span className="hidden rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 sm:inline-flex dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                Formation
              </span>
            </div>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-16 sm:px-48">
              <div className="min-w-0 max-w-full text-center leading-tight">
                <p className="truncate text-sm text-slate-700 dark:text-slate-200">
                  {DEMO_USER.fullName}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {DEMO_USER.company} · {DEMO_USER.email}
                </p>
              </div>
            </div>

            <div className="relative z-10 flex shrink-0 items-center gap-2">
              <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                {(
                  [
                    ["rh", "Vue RH"],
                    ["user", "Vue Utilisateurs"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setView(id)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm ${
                      view === id
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-1.5 text-lg font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Start<span className="text-blue-600 dark:text-blue-400">IA</span>
              <GraduationCap
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Link>

            <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {(
                [
                  ["rh", "Vue RH"],
                  ["user", "Vue Utilisateurs"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setView(id)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors sm:px-4 ${
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

            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        )}
      </header>

      <main
        className={
          view === "user"
            ? "mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8"
            : "mx-auto max-w-6xl px-4 py-8 sm:px-6"
        }
      >
        {view === "rh" ? (
          <HrView demo initialEmployees={employees.slice(0, 4)} />
        ) : (
          <UserView />
        )}
      </main>
    </div>
  );
}
