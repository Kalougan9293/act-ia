"use client";

import { FormEvent, Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ChevronDown, ChevronUp, Gauge, Plus, Users, X } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  type Partner,
  type PlatformUser,
  type Structure,
} from "@/lib/admin/types";
import {
  adjustPartnerStructureSeats,
  computePartnerLearnerStats,
  createPartnerStructure,
  getPartner,
  listStructuresByPartner,
  listUsersForStructures,
  partnerSeatsAllocated,
} from "@/lib/firebase/partners";
import { getInviteSeatInfo } from "@/lib/firebase/seats";

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
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [seatsUsedById, setSeatsUsedById] = useState<Record<string, number>>({});
  /** Entreprise dépliée pour le suivi apprenants */
  const [expandedId, setExpandedId] = useState<string | null>(null);
  /** Avis (note + commentaire, sans réclamation) */
  const [avisUser, setAvisUser] = useState<PlatformUser | null>(null);
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
        const usedEntries = await Promise.all(
          nextStructures.map(async (s) => {
            if (!s.inviteToken) return [s.id, 0] as const;
            const info = await getInviteSeatInfo(s.inviteToken);
            return [s.id, info?.seatsUsed ?? 0] as const;
          }),
        );
        if (cancelled) return;
        setPartner(nextPartner);
        setStructures(nextStructures);
        setUsers(nextUsers);
        setSeatsUsedById(Object.fromEntries(usedEntries));
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

  async function handleAdjustSeats(structure: Structure, delta: 1 | -1) {
    if (!partner || adjustingId) return;
    setAdjustingId(structure.id);
    setError(null);
    try {
      const updated = await adjustPartnerStructureSeats({
        partnerId: partner.id,
        partnerSeatsMax: partner.seatsMax,
        structures,
        structureId: structure.id,
        delta,
      });
      setStructures((current) =>
        current.map((s) => (s.id === updated.id ? updated : s)),
      );
      if (structure.inviteToken) {
        const info = await getInviteSeatInfo(structure.inviteToken);
        setSeatsUsedById((m) => ({
          ...m,
          [structure.id]: info?.seatsUsed ?? m[structure.id] ?? 0,
        }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ajustement impossible");
    } finally {
      setAdjustingId(null);
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
                  className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80"
                >
                  <div className="flex w-full items-center justify-center gap-1.5">
                    <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {card.label}
                    </p>
                    <card.icon className="h-4 w-4 shrink-0 text-blue-500" />
                  </div>
                  <p className="mt-2 w-full text-center text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
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
                        <th className="px-4 py-2.5 text-center font-semibold">Apprenants</th>
                        <th className="px-4 py-2.5 text-center font-semibold">Terminés</th>
                        <th className="px-4 py-2.5 text-center font-semibold">Sat. moy.</th>
                        <th className="px-4 py-2.5 font-semibold">RH</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeStructures.map((structure) => {
                        const members = users.filter((u) => u.structureId === structure.id);
                        const learners = members
                          .filter(
                            (u) =>
                              u.role === "employee" ||
                              (u.role === "rh" && Boolean(u.formationEnrolled)),
                          )
                          .sort((a, b) => a.name.localeCompare(b.name, "fr"));
                        const done = learners.filter((u) => (u.progressPercent ?? 0) >= 100).length;
                        const rated = learners.filter((u) => u.satisfactionRating != null);
                        const satAvg =
                          rated.length > 0
                            ? (
                                rated.reduce(
                                  (sum, u) => sum + (u.satisfactionRating ?? 0),
                                  0,
                                ) / rated.length
                              ).toFixed(1)
                            : null;
                        const rh = members.find((u) => u.role === "rh");
                        const seats = Math.max(1, Number(structure.billing.seats) || 1);
                        const seatsUsed = seatsUsedById[structure.id] ?? 0;
                        const canDecrease = seats > Math.max(1, seatsUsed);
                        const canIncrease = seatsLeft > 0;
                        const busy = adjustingId === structure.id;
                        const expanded = expandedId === structure.id;
                        return (
                          <Fragment key={structure.id}>
                          <tr className="text-slate-700 dark:text-slate-200">
                            <td className="px-4 py-3 font-medium">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedId((id) =>
                                    id === structure.id ? null : structure.id,
                                  )
                                }
                                className="inline-flex max-w-full items-center gap-1.5 text-left hover:text-violet-700 dark:hover:text-violet-300"
                                title={
                                  expanded
                                    ? "Masquer le suivi"
                                    : "Voir le suivi apprenants"
                                }
                              >
                                {expanded ? (
                                  <ChevronUp className="h-4 w-4 shrink-0 text-violet-500" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                                )}
                                <span className="truncate">{structure.name}</span>
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="inline-flex items-center gap-1">
                                <span className="min-w-[1.75rem] text-center tabular-nums font-semibold">
                                  {seats}
                                </span>
                                <div className="flex flex-col">
                                  <button
                                    type="button"
                                    disabled={busy || !canIncrease}
                                    onClick={() => void handleAdjustSeats(structure, 1)}
                                    aria-label={`Augmenter la limite de ${structure.name}`}
                                    title={
                                      canIncrease
                                        ? "Augmenter la limite (+1)"
                                        : "Quota partenaire atteint"
                                    }
                                    className="rounded p-0.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                                  >
                                    <ChevronUp className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busy || !canDecrease}
                                    onClick={() => void handleAdjustSeats(structure, -1)}
                                    aria-label={`Diminuer la limite de ${structure.name}`}
                                    title={
                                      canDecrease
                                        ? "Diminuer la limite (−1)"
                                        : seatsUsed > 0
                                          ? `Minimum ${seatsUsed} (sièges déjà consommés)`
                                          : "Minimum 1"
                                    }
                                    className="rounded p-0.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                                  >
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center tabular-nums">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedId((id) =>
                                    id === structure.id ? null : structure.id,
                                  )
                                }
                                className="font-semibold text-violet-600 hover:underline dark:text-violet-400"
                                title="Voir le suivi apprenants"
                              >
                                {learners.length}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-center tabular-nums">{done}</td>
                            <td className="px-4 py-3 text-center tabular-nums">
                              {satAvg != null ? (
                                <span className="font-semibold">{satAvg}/5</span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="min-w-0">
                                <p className="truncate font-medium">{rh?.name ?? "—"}</p>
                                <p className="truncate text-xs text-slate-400">
                                  {rh?.email ?? "—"}
                                </p>
                              </div>
                            </td>
                          </tr>
                          {expanded ? (
                            <tr className="bg-violet-50/60 dark:bg-violet-500/10">
                              <td colSpan={6} className="px-3 py-3 sm:px-4">
                                {learners.length === 0 ? (
                                  <p className="py-2 text-center text-xs text-slate-500">
                                    Aucun apprenant inscrit pour cette entreprise.
                                  </p>
                                ) : (
                                  <div className="overflow-x-auto rounded-xl border border-violet-200/80 bg-white dark:border-violet-500/30 dark:bg-slate-950/40">
                                    <table className="min-w-full text-center text-xs sm:text-sm">
                                      <thead className="text-slate-500 dark:text-slate-400">
                                        <tr>
                                          <th className="px-3 py-2 font-medium">Apprenant</th>
                                          <th className="px-3 py-2 font-medium">E-mail</th>
                                          <th className="px-3 py-2 font-medium">%</th>
                                          <th
                                            className="px-3 py-2 font-medium"
                                            title="Positionnement → QCM"
                                          >
                                            Avant/Après
                                          </th>
                                          <th className="px-3 py-2 font-medium">Avis</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {learners.map((learner) => {
                                          const before =
                                            learner.positioningScore != null
                                              ? `${learner.positioningScore}`
                                              : "—";
                                          const after =
                                            learner.quizScore != null
                                              ? `${learner.quizScore}`
                                              : "—";
                                          return (
                                            <tr
                                              key={learner.id}
                                              className="border-t border-slate-100 dark:border-slate-800"
                                            >
                                              <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-100">
                                                {learner.name}
                                              </td>
                                              <td className="max-w-[10rem] truncate px-3 py-2 text-slate-600 dark:text-slate-300 sm:max-w-none">
                                                {learner.email}
                                              </td>
                                              <td className="px-3 py-2 tabular-nums">
                                                {learner.progressPercent ?? 0}&nbsp;%
                                              </td>
                                              <td className="px-3 py-2 tabular-nums text-slate-600 dark:text-slate-300">
                                                {before} → {after}
                                              </td>
                                              <td className="px-3 py-2">
                                                {learner.satisfactionRating != null ? (
                                                  <button
                                                    type="button"
                                                    onClick={() => setAvisUser(learner)}
                                                    className="font-semibold tabular-nums text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
                                                    title="Voir le commentaire"
                                                  >
                                                    {learner.satisfactionRating}/5
                                                  </button>
                                                ) : (
                                                  <span className="text-slate-400">—</span>
                                                )}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ) : null}
                          </Fragment>
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

      {avisUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4"
          onClick={() => setAvisUser(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setAvisUser(null)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="pr-8 text-sm font-semibold text-slate-900 dark:text-white">
              Avis — {avisUser.name}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {avisUser.satisfactionRating}/5
            </p>
            {avisUser.satisfactionComment?.trim() ? (
              <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                « {avisUser.satisfactionComment.trim()} »
              </p>
            ) : (
              <p className="mt-3 text-sm text-slate-400">Sans commentaire</p>
            )}
          </div>
        </div>
      )}

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
