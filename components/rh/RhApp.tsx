"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import HrView from "@/components/demo/HrView";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { Employee, EmployeeStatus } from "@/components/demo/data";
import type { PlatformUser, Structure } from "@/lib/admin/types";
import { getStructure, listUsersByStructure } from "@/lib/firebase/tenant-data";
import {
  ensureStructureInviteToken,
  structureInviteLink,
} from "@/lib/firebase/structure-invite";

function toStatus(percent: number | null): EmployeeStatus {
  if (percent == null || percent <= 0) return "todo";
  if (percent >= 100) return "done";
  return "progress";
}

function formatLastSeen(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function toEmployees(users: PlatformUser[], companyName: string): Employee[] {
  return users
    .filter((u) => u.role === "employee" || u.role === "rh")
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role === "rh" ? "RH" : u.jobTitle?.trim() || "Collaborateur",
      path: "IA + RGPD",
      status: toStatus(u.progressPercent),
      percent: u.progressPercent ?? 0,
      lastSeen: formatLastSeen(u.lastLoginAt ?? u.certifiedAt),
      certificateId: u.certificateId,
      certifiedAt: u.certifiedAt,
      quizScore: u.quizScore,
      companyName,
    }));
}

export default function RhApp() {
  const router = useRouter();
  const { session, signOutUser } = useAuth();
  const [structure, setStructure] = useState<Structure | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.structureId || session.role !== "rh") {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [nextStructure, members] = await Promise.all([
          getStructure(session.structureId!),
          listUsersByStructure(session.structureId!),
        ]);
        if (cancelled) return;
        let structureReady = nextStructure;
        if (structureReady) {
          structureReady = await ensureStructureInviteToken(structureReady);
        }
        if (cancelled) return;
        setStructure(structureReady);
        setInviteLink(
          structureReady?.inviteToken
            ? structureInviteLink(structureReady.inviteToken)
            : null,
        );
        setEmployees(toEmployees(members, structureReady?.name ?? "Entreprise"));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Chargement impossible");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!session || session.role !== "rh" || !session.structureId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-3">
        <h1 className="text-xl font-bold">Accès RH requis</h1>
        <p className="text-sm text-slate-500">
          Cet espace est réservé au compte RH de votre structure.
        </p>
        <Link href="/connexion?next=/rh" className="text-sm font-semibold text-blue-600 hover:underline">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-slate-950">
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
              Espace RH
            </span>
          </div>

          <div className="text-center leading-tight min-w-0 px-2">
            <p className="text-center text-sm text-slate-700 dark:text-slate-200 truncate">{session.name}</p>
            <p className="text-center text-xs text-slate-400 truncate">{session.email}</p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={async () => {
                await signOutUser();
                router.replace("/connexion?next=/rh");
              }}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <p className="mb-4 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {loading ? (
          <p className="text-center text-sm text-slate-500">Chargement…</p>
        ) : (
          <HrView
            key={session.structureId}
            initialEmployees={employees}
            companyName={structure?.name ?? "Entreprise"}
            structureId={session.structureId}
            structureInviteLink={inviteLink}
          />
        )}
      </main>
    </div>
  );
}
