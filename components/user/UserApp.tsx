"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import FormationExperience from "@/components/user/FormationExperience";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getStructure } from "@/lib/firebase/tenant-data";

export default function UserApp() {
  const router = useRouter();
  const { ready, session, signOutUser } = useAuth();
  const [companyName, setCompanyName] = useState("Votre entreprise");

  useEffect(() => {
    if (!session?.structureId) return;
    let cancelled = false;
    void getStructure(session.structureId).then((structure) => {
      if (!cancelled && structure?.name) setCompanyName(structure.name);
    });
    return () => {
      cancelled = true;
    };
  }, [session?.structureId]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        Chargement…
      </div>
    );
  }

  if (!session || (session.role !== "employee" && session.role !== "rh")) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg text-center space-y-3">
          <h1 className="text-xl font-bold">Accès collaborateur requis</h1>
          <Link href="/connexion?next=/utilisateur" className="text-sm font-semibold text-blue-600 hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (!session.structureId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg text-center space-y-3">
          <h1 className="text-xl font-bold">Aucune structure liée</h1>
          <p className="text-sm text-slate-500">
            Votre compte n&apos;est rattaché à aucune entreprise. Contactez votre RH.
          </p>
        </div>
      </div>
    );
  }

  const firstName = session.name.trim().split(/\s+/)[0] ?? "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <ThemeToggle />
            <Link
              href="/"
              className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-lg tracking-tight shrink-0"
            >
              Conform<span className="text-blue-600 dark:text-blue-400">AI</span>
              <GraduationCap
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Link>
            <span className="hidden sm:inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              Formation
            </span>
          </div>

          <div className="text-center leading-tight min-w-0 px-2">
            <p className="text-center text-sm text-slate-700 dark:text-slate-200 truncate">
              {session.name}
            </p>
            <p className="text-center text-xs text-slate-400 truncate">
              {companyName} · {session.email}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={async () => {
                await signOutUser();
                router.replace("/connexion?next=/utilisateur");
              }}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <FormationExperience
          key={session.uid}
          uid={session.uid}
          firstName={firstName}
          fullName={session.name}
          companyName={companyName}
        />
      </main>
    </div>
  );
}
