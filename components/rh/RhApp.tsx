"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import HrView from "@/components/demo/HrView";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { Employee, EmployeeStatus } from "@/components/demo/data";
import type { CompanyModuleContent, PlatformUser, Structure } from "@/lib/admin/types";
import { getStructure, listUsersByStructure, saveCompanyModule } from "@/lib/firebase/tenant-data";
import {
  ensureStructureInviteToken,
  structureInviteLink,
} from "@/lib/firebase/structure-invite";
import { getStructureSeatStatus } from "@/lib/firebase/seats";

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
    .filter(
      (u) =>
        u.role === "employee" || (u.role === "rh" && Boolean(u.formationEnrolled)),
    )
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role:
        u.role === "rh"
          ? "RH"
          : u.jobTitle?.trim() || "Collaborateur",
      path: "IA + RGPD",
      status: toStatus(u.progressPercent),
      percent: u.progressPercent ?? 0,
      lastSeen:
        u.status === "invited" || u.id.startsWith("pending_")
          ? "En attente"
          : formatLastSeen(u.lastLoginAt ?? u.certifiedAt),
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
  const [seatsMax, setSeatsMax] = useState(5);
  const [seatsUsed, setSeatsUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

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
        const seats = await getStructureSeatStatus(session.structureId!);
        if (cancelled) return;
        setStructure(structureReady);
        setSeatsMax(seats.seatsMax);
        setSeatsUsed(seats.seatsUsed);
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
  }, [session, reloadKey]);

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
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-sky-100/80 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.14),_transparent_65%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.12),_transparent_65%)]"
      />
      <header className="sticky top-0 z-20 border-b border-blue-100/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="relative z-10 flex min-w-0 items-center gap-2.5">
            <ThemeToggle />
            <Link
              href="/"
              className="flex shrink-0 items-center gap-1.5 text-lg font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Conform<span className="text-blue-600 dark:text-blue-400">AI</span>
              <GraduationCap
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Link>
            <span className="hidden sm:inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              Espace RH
            </span>
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-28 sm:px-40">
            <div className="min-w-0 max-w-full text-center leading-tight">
              <p className="truncate text-sm text-slate-700 dark:text-slate-200">{session.name}</p>
              <p className="truncate text-xs text-slate-400">{session.email}</p>
            </div>
          </div>

          <div className="relative z-10 flex shrink-0 justify-end">
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

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
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
            seatsMax={seatsMax}
            seatsUsed={seatsUsed}
            companyModule={structure?.companyModule}
            onRosterChange={() => setReloadKey((k) => k + 1)}
            onSaveCompanyModule={async (module: CompanyModuleContent) => {
              await saveCompanyModule(session.structureId!, module);
              setStructure((current) => (current ? { ...current, companyModule: module } : current));
            }}
          />
        )}
      </main>
    </div>
  );
}
