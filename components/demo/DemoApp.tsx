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
    <div className={`min-h-screen ${view === "rh" ? "bg-blue-50 dark:bg-slate-950" : "bg-slate-50 dark:bg-slate-950"}`}>
      <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-lg tracking-tight shrink-0">
            Start<span className="text-blue-600 dark:text-blue-400">IA</span>
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-blue-900 dark:bg-slate-900 dark:text-slate-200 sm:px-5">
          <p className="font-semibold text-slate-900 dark:text-white">
            Démo — ce que vous montrez à un prospect
          </p>
          <p className="mt-1 leading-relaxed">
            {view === "rh" ? (
              <>
                Côté RH : suivez qui a terminé, invitez des sièges, éditez le module entreprise,
                puis exportez le dossier de preuves (ZIP / JSON) pour documenter votre démarche
                Article 4. Besoin d&apos;un cas propre à votre métier ? On rédige un module sur
                mesure (690&nbsp;€) intégré en quelques jours — vos règles, vos usages.
              </>
            ) : (
              <>
                Côté collaborateur : parcours court (~1 h), quiz, attestation nominative de suivi.
                Ce n&apos;est pas un diplôme — c&apos;est la preuve que la personne a suivi.
              </>
            )}
          </p>
        </div>
        {view === "rh" ? <HrView demo initialEmployees={employees.slice(0, 4)} /> : <UserView />}
      </main>
    </div>
  );
}
