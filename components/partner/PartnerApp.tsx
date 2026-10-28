"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Gauge, Plus, Users, X } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  type Partner,
  type PlatformUser,
  type Structure,
} from "@/lib/admin/types";
import {
  computePartnerLearnerStats,
  createPartnerStructure,
  getPartner,
  listStructuresByPartner,
  listUsersForStructures,
  partnerSeatsAllocated,
} from "@/lib/firebase/partners";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950";

export default function PartnerApp() {
  const router = useRouter();
  const { session, signOutUser } = useAuth();
  const partnerId = session?.partnerId ?? null;

  const [partner, setPartner] = useState<Partner | null>(null);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    seats: 5,
    rhName: "",
    rhEmail: "",
    siret: "",
    phone: "",
  });

  useEffect(() => {
    if (!partnerId || session?.role !== "partner") {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Isolation : uniquement le partnerId de la session (jamais un autre OF)
        const nextPartner = await getPartner(partnerId);
        if (!nextPartner) throw new Error("Partenaire introuvable");
        if (nextPartner.status !== "active") {
          throw new Error("Accès partenaire révoqué. Contactez LockinIA.");
        }
        const nextStructures = await listStructuresByPartner(partnerId);
        const nextUsers = await listUsersForStructures(
          nextStructures.map((s) => s.id),
          partnerId,
        );
        if (cancelled) return;
        setPartner(nextPartner);
        setStructures(nextStructures);
        setUsers(nextUsers);
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
  }, [partnerId, session?.role, reloadKey]);

  const stats = useMemo(
    () => computePartnerLearnerStats(structures, users),
    [structures, users],
  );
  const seatsAllocated = useMemo(() => partnerSeatsAllocated(structures), [structures]);
  const seatsMax = partner?.seatsMax ?? 0;
  const seatsLeft = Math.max(0, seatsMax - seatsAllocated);

  const activeStructures = useMemo(
    () => structures.filter((s) => s.status === "active" && !s.archivedAt),
    [structures],
  );

  function openCreate() {
    setForm({
      name: "",
      seats: Math.min(5, seatsLeft || 1),
      rhName: "",
      rhEmail: "",
      siret: "",
      phone: "",
    });
    setModalOpen(true);
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!partner || saving) return;
    setSaving(true);
    setError(null);
    try {
      await createPartnerStructure({
        partnerId: partner.id,
        partnerSeatsMax: partner.seatsMax,
        existingStructures: structures,
        name: form.name,
        seats: form.seats,
        rhName: form.rhName,
        rhEmail: form.rhEmail,
        siret: form.siret,
        phone: form.phone,
      });
      setModalOpen(false);
      setReloadKey((k) => k + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Création impossible");
    } finally {
      setSaving(false);
    }
  }

  if (!session || session.role !== "partner" || !partnerId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-3">
        <h1 className="text-xl font-bold">Accès partenaire requis</h1>
        <p className="text-sm text-slate-500">
          Cet espace est réservé aux organismes partenaires LockinIA.
        </p>
        <Link
          href="/connexion?next=/partenaire"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
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
              <BrandMark className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Lockin<span className="text-blue-600 dark:text-blue-400">IA</span>
            </Link>
            <span className="hidden sm:inline-flex rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
              Espace partenaire
            </span>
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-28 sm:px-40">
            <div className="min-w-0 max-w-full text-center leading-tight">
              <p className="truncate text-sm text-slate-700 dark:text-slate-200">
                {partner?.name ?? session.name}
              </p>
              <p className="truncate text-xs text-slate-400">{session.email}</p>
            </div>
          </div>

          <div className="relative z-10 flex shrink-0 justify-end">
            <button
              type="button"
              onClick={async () => {
                await signOutUser();
                router.replace("/connexion?next=/partenaire");
              }}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-center text-sm text-slate-500">Chargement…</p>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Vos entreprises clientes
                </h1>
              </div>
              <button
                type="button"
                onClick={openCreate}
                disabled={seatsLeft <= 0}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Ajouter une entreprise
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { label: "Entreprises", value: String(stats.companies), icon: Building2 },
                { label: "Inscrits", value: String(stats.enrolled), icon: Users },
                { label: "En cours", value: String(stats.inProgress), icon: Users },
                { label: "Terminés", value: String(stats.done), icon: Users },
                {
                  label: "Limite",
                  value: `${seatsAllocated}/${seatsMax}`,
                  icon: Gauge,
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {card.label}
                    </p>
                    <card.icon className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Entreprises ({activeStructures.length})
                </h2>
              </div>
              {activeStructures.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-500">
                  Aucune entreprise pour l&apos;instant. Ajoutez votre premier client.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/50">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Entreprise</th>
                        <th className="px-4 py-2.5 font-semibold">Limite max</th>
                        <th className="px-4 py-2.5 font-semibold">Apprenants</th>
                        <th className="px-4 py-2.5 font-semibold">Terminés</th>
                        <th className="px-4 py-2.5 font-semibold">RH</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeStructures.map((structure) => {
                        const members = users.filter((u) => u.structureId === structure.id);
                        const learners = members.filter(
                          (u) =>
                            u.role === "employee" ||
                            (u.role === "rh" && Boolean(u.formationEnrolled)),
                        );
                        const done = learners.filter((u) => (u.progressPercent ?? 0) >= 100).length;
                        const rh = members.find((u) => u.role === "rh");
                        return (
                          <tr key={structure.id} className="text-slate-700 dark:text-slate-200">
                            <td className="px-4 py-3 font-medium">{structure.name}</td>
                            <td className="px-4 py-3 tabular-nums">
                              {structure.billing.seats}
                            </td>
                            <td className="px-4 py-3 tabular-nums">{learners.length}</td>
                            <td className="px-4 py-3 tabular-nums">{done}</td>
                            <td className="px-4 py-3">
                              <div className="min-w-0">
                                <p className="truncate font-medium">{rh?.name ?? "—"}</p>
                                <p className="truncate text-xs text-slate-400">
                                  {rh?.email ?? "—"}
                                </p>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Nouvelle entreprise</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-500">Nom de l&apos;entreprise</span>
                <input
                  required
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-500">
                  Limite max ({seatsLeft} siège{seatsLeft !== 1 ? "s" : ""} restant
                  {seatsLeft !== 1 ? "s" : ""})
                </span>
                <input
                  type="number"
                  min={1}
                  max={seatsLeft || 1}
                  required
                  className={inputClass}
                  value={form.seats}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seats: Number(e.target.value) || 1 }))
                  }
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Nom du RH</span>
                  <input
                    required
                    className={inputClass}
                    value={form.rhName}
                    onChange={(e) => setForm((f) => ({ ...f, rhName: e.target.value }))}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-slate-500">E-mail du RH</span>
                  <input
                    type="email"
                    required
                    className={inputClass}
                    value={form.rhEmail}
                    onChange={(e) => setForm((f) => ({ ...f, rhEmail: e.target.value }))}
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-slate-500">SIRET</span>
                  <input
                    className={inputClass}
                    value={form.siret}
                    onChange={(e) => setForm((f) => ({ ...f, siret: e.target.value }))}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Téléphone</span>
                  <input
                    className={inputClass}
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </label>
              </div>
              <p className="text-xs text-slate-500">
                L’e-mail RH active l’accès « Première connexion ». À charge pour vous
                d’expliquer à votre client comment se connecter et utiliser son espace RH.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Création…" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
