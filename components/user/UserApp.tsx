"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import FormationExperience from "@/components/user/FormationExperience";
import { FloatingLexiconFab } from "@/components/user/LexiconTip";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { CompanyModuleContent } from "@/lib/admin/types";
import { emptyCompanyModule } from "@/lib/admin/types";
import { getStructure } from "@/lib/firebase/tenant-data";

export default function UserApp() {
  const router = useRouter();
  const { ready, session, signOutUser } = useAuth();
  const [companyName, setCompanyName] = useState("Votre entreprise");
  const [companyModule, setCompanyModule] = useState<CompanyModuleContent>(() => emptyCompanyModule());

  useEffect(() => {
    if (!session?.structureId) return;
    let cancelled = false;
    void getStructure(session.structureId).then((structure) => {
      if (cancelled || !structure) return;
      if (structure.name) setCompanyName(structure.name);
      setCompanyModule(structure.companyModule ?? emptyCompanyModule());
    });
    return () => {
      cancelled = true;
    };
  }, [session?.structureId]);

  // RH non inscrit via Ajouter → pas de formation
  useEffect(() => {
    if (!ready || !session) return;
    if (session.role === "rh" && !session.formationEnrolled) {
      router.replace("/rh");
    }
  }, [ready, session, router]);

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

  if (session.role === "rh" && !session.formationEnrolled) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        Redirection…
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
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="relative z-10 flex min-w-0 items-center gap-2.5">
            <ThemeToggle />
            <Link
              href="/"
              className="hidden shrink-0 items-center gap-1.5 text-lg font-bold tracking-tight text-slate-900 sm:flex dark:text-white"
            >
              Conform<span className="text-blue-600 dark:text-blue-400">AI</span>
              <GraduationCap
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Link>
            <span className="hidden sm:inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              Formation
            </span>
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-16 sm:px-40">
            <div className="min-w-0 max-w-full text-center leading-tight">
              <p className="truncate text-sm text-slate-700 dark:text-slate-200">{session.name}</p>
              <p className="truncate text-xs text-slate-400">
                {companyName} · {session.email}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex shrink-0 justify-end">
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

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <FormationExperience
          key={session.uid}
          uid={session.uid}
          firstName={firstName}
          fullName={session.name}
          companyName={companyName}
          companyModule={companyModule}
        />
        <FloatingLexiconFab />
      </main>
    </div>
  );
}
