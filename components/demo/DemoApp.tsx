"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import HrView from "./HrView";
import UserView from "./UserView";
import { employees } from "./data";

type View = "rh" | "user";

export default function DemoApp() {
  const [view, setView] = useState<View>("rh");

  return (
    <div className={`min-h-screen ${view === "rh" ? "bg-blue-50 dark:bg-slate-950" : "bg-violet-50 dark:bg-slate-950"}`}>
      <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-lg tracking-tight shrink-0">
            Conform<span className="text-blue-600 dark:text-blue-400">AI</span>
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2} aria-hidden="true" />
          </Link>

          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
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
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  view === id
                    ? id === "rh"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-violet-600 text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {view === "rh" ? <HrView demo initialEmployees={employees.slice(0, 4)} /> : <UserView />}
      </main>
    </div>
  );
}
