"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Building2,
  Check,
  Copy,
  Download,
  Info,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { employees, type Employee } from "./data";
import CertificatePreview from "./CertificatePreview";
import CompanyCertificate from "./CompanyCertificate";
import { formatProofDate } from "@/lib/formation/proof";
import {
  AI_USE_CASE_STATUS_LABELS,
  emptyAiUseCase,
  emptyCompanyModule,
  isAiUseCaseFilled,
  normalizeAiUseCase,
  type AiUseCaseEntry,
  type CompanyModuleContent,
} from "@/lib/admin/types";
import { downloadCompanyReport } from "@/lib/export/attestations";
import { downloadProofZip } from "@/lib/export/proof-zip";
import { provisionTenantUser } from "@/lib/firebase/provision-user";
import type { FormEvent } from "react";
import { PlainText } from "@/lib/format/plain-text";
import {
  deleteEmployeeAsRh,
  deletePendingInviteAsRh,
} from "@/lib/firebase/delete-employee";

const QUICK_USE_CASE_KEYS = new Set<keyof AiUseCaseEntry>(["tool", "purpose", "data"]);

const USE_CASE_FIELDS: { key: keyof AiUseCaseEntry; label: string; placeholder: string }[] = [
  { key: "service", label: "Service", placeholder: "Ressources humaines" },
  { key: "owner", label: "Propriétaire", placeholder: "Nom du responsable" },
  { key: "population", label: "Population concernée", placeholder: "Candidats, salariés du pôle…" },
  { key: "tool", label: "Outil", placeholder: "Copilot, ATS + module IA…" },
  { key: "vendor", label: "Fournisseur", placeholder: "Éditeur de l'outil" },
  { key: "purpose", label: "Usage et finalité", placeholder: "Aide à la pré-sélection des candidatures" },
  { key: "data", label: "Données traitées", placeholder: "CV, coordonnées, données personnelles…" },
  { key: "legalBasis", label: "Base légale RGPD", placeholder: "Contrat, intérêt légitime, obligation…" },
  { key: "article22", label: "Décision automatisée (art. 22)", placeholder: "Un humain peut-il modifier ou rejeter ?" },
  { key: "aiAct", label: "Qualification AI Act", placeholder: "À analyser, Annexe III, transparence…" },
  { key: "aiActJustification", label: "Justification", placeholder: "Pourquoi ce niveau de risque" },
  { key: "aipd", label: "AIPD", placeholder: "À cadrer, non requise, réalisée…" },
  { key: "dpa", label: "DPA / éditeur", placeholder: "DPA à vérifier, non-réentraînement…" },
  { key: "transfers", label: "Transferts", placeholder: "Hébergement UE, clauses types…" },
];

function normalizeModule(module?: CompanyModuleContent | null): CompanyModuleContent {
  const base = emptyCompanyModule();
  if (!module) return base;
  return {
    ...base,
    ...module,
    useCases: Array.isArray(module.useCases)
      ? module.useCases.map((row, index) => normalizeAiUseCase(row, index))
      : [],
    revisions: Array.isArray(module.revisions) ? module.revisions : [],
  };
}

function trimUseCase(row: AiUseCaseEntry): AiUseCaseEntry {
  const next = normalizeAiUseCase(row);
  next.id = row.id;
  for (const field of USE_CASE_FIELDS) {
    const value = next[field.key];
    if (typeof value === "string") next[field.key] = value.trim() as never;
  }
  next.reviewAt = row.reviewAt.trim();
  return next;
}

type SortKey = "name" | "email" | "percent" | "lastSeen";

function dateValue(value: string) {
  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) return 0;
  return new Date(year, month - 1, day).getTime();
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className="px-4 py-3 font-medium">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white"
      >
        {label}
        <Icon className="h-3.5 w-3.5 opacity-60" />
      </button>
    </th>
  );
}

function ProgressBar({
  value,
  onDownload,
}: {
  value: number;
  onDownload?: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="w-10 text-xs tabular-nums text-slate-600 dark:text-slate-300">{value}%</span>
      {onDownload && (
        <button
          type="button"
          onClick={onDownload}
          aria-label="Voir l'attestation"
          className="inline-flex text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <Download className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function NameWithService({ name, role }: { name: string; role: string }) {
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? name;
  const last = parts.slice(1).join(" ");

  return (
    <>
      <span
        className="cursor-default"
        onMouseEnter={(event) => setTip({ x: event.clientX, y: event.clientY + 16 })}
        onMouseMove={(event) => setTip({ x: event.clientX, y: event.clientY + 16 })}
        onMouseLeave={() => setTip(null)}
      >
        {first}
      </span>
      {last ? ` ${last}` : null}
      {tip && role.trim() && (
        <span
          className="fixed z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-lg"
          style={{ left: tip.x, top: tip.y }}
        >
          {role}
        </span>
      )}
    </>
  );
}

export default function HrView({
  initialEmployees = employees,
  companyName = "Atelier Lumière",
  structureId,
  structureInviteLink,
  seatsMax = 5,
  seatsUsed = 0,
  companyModule: companyModuleProp,
  onSaveCompanyModule,
  onRosterChange,
  demo = false,
}: {
  initialEmployees?: Employee[];
  companyName?: string;
  structureId?: string;
  structureInviteLink?: string | null;
  seatsMax?: number;
  seatsUsed?: number;
  companyModule?: CompanyModuleContent;
  onSaveCompanyModule?: (module: CompanyModuleContent) => Promise<void>;
  onRosterChange?: () => void;
  /** Démo publique : lien fictif, export bloqué. */
  demo?: boolean;
}) {
  const [roster, setRoster] = useState<Employee[]>(initialEmployees);
  const [preview, setPreview] = useState<string | null>(null);
  const [copiedPermanent, setCopiedPermanent] = useState(false);
  const [query, setQuery] = useState("");
  const [showCompany, setShowCompany] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addFirstName, setAddFirstName] = useState("");
  const [addLastName, setAddLastName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addDone, setAddDone] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showModuleEditor, setShowModuleEditor] = useState(false);
  const [moduleDraft, setModuleDraft] = useState<CompanyModuleContent>(
    () => normalizeModule(companyModuleProp),
  );
  const [moduleSaved, setModuleSaved] = useState<CompanyModuleContent>(
    () => normalizeModule(companyModuleProp),
  );
  const [moduleSaving, setModuleSaving] = useState(false);
  const [moduleError, setModuleError] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });

  useEffect(() => {
    setRoster(initialEmployees);
  }, [initialEmployees]);

  useEffect(() => {
    const next = normalizeModule(companyModuleProp);
    setModuleSaved(next);
    if (!showModuleEditor) setModuleDraft(next);
  }, [companyModuleProp, showModuleEditor]);

  const active = roster;
  const needle = query.trim().toLowerCase();
  const visible = active.filter((employee) => {
    if (!needle) return true;
    return employee.name.toLowerCase().includes(needle) || employee.email.toLowerCase().includes(needle);
  });
  const sorted = [...visible].sort((a, b) => {
    const result =
      sort.key === "name"
        ? a.name.localeCompare(b.name, "fr")
        : sort.key === "email"
          ? a.email.localeCompare(b.email, "fr")
          : sort.key === "percent"
            ? a.percent - b.percent
            : dateValue(a.lastSeen) - dateValue(b.lastSeen);
    return sort.dir === "asc" ? result : -result;
  });
  const done = active.filter((employee) => employee.percent >= 100).length;
  const certified = active.filter((employee) => Boolean(employee.certificateId)).length;
  const rate = active.length === 0 ? 0 : Math.round((done / active.length) * 100);
  /** Dossier de preuve : tout le monde a une attestation (après entreprise + métier) */
  const companyReady = active.length > 0 && certified === active.length;
  const selected = roster.find((employee) => employee.id === preview) ?? null;
  const seatsFull = seatsUsed >= seatsMax;

  function toggleSort(key: SortKey) {
    setSort((current) =>
      current.key === key ? { key, dir: current.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  }

  const permanentLink = demo ? "/lien-personnalisé" : structureInviteLink || "/rejoindre/demo";

  async function copyPermanentLink() {
    const absolute = permanentLink.startsWith("http")
      ? permanentLink
      : `${window.location.origin}${permanentLink}`;
    try {
      await navigator.clipboard.writeText(absolute);
      setCopiedPermanent(true);
      window.setTimeout(() => setCopiedPermanent(false), 1800);
    } catch {
      /* ignore */
    }
  }

  function openAddForm() {
    setAddFirstName("");
    setAddLastName("");
    setAddEmail("");
    setAddError(null);
    setAddDone(false);
    setShowAdd(true);
  }

  async function submitAddCollaborator(event: FormEvent) {
    event.preventDefault();
    if (demo) {
      setAddDone(true);
      return;
    }
    if (!structureId) {
      setAddError("Structure introuvable");
      return;
    }
    if (seatsFull) {
      setAddError(`Offre pleine (${seatsMax}). Supprimez un compte pour en ajouter un.`);
      return;
    }
    const name = `${addFirstName.trim()} ${addLastName.trim()}`.trim();
    if (!name) {
      setAddError("Prénom et nom requis");
      return;
    }
    setAddBusy(true);
    setAddError(null);
    try {
      const created = await provisionTenantUser({
        email: addEmail,
        name,
        role: "employee",
        structureId,
      });
      setRoster((current) => {
        const row = {
          id: created.id,
          name: created.name,
          email: created.email,
          role: created.role === "rh" ? "RH" : "Collaborateur",
          path: "IA + RGPD",
          status: "todo" as const,
          percent: created.progressPercent ?? 0,
          lastSeen:
            created.status === "invited" || created.id.startsWith("pending_")
              ? "En attente"
              : "—",
          companyName,
        };
        const without = current.filter((e) => e.id !== created.id);
        return [row, ...without];
      });
      setAddDone(true);
      onRosterChange?.();
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Ajout impossible");
    } finally {
      setAddBusy(false);
    }
  }

  async function removeCollaborator(employee: Employee) {
    if (demo || deletingId) return;
    const ok = window.confirm(
      `Attention ! Vous allez perdre tout le suivi !\n\n` +
        `Supprimer ${employee.name} efface définitivement sa progression et son attestation.\n` +
        `S’il est réinscrit, il devra tout recommencer depuis zéro.\n\n` +
        `Continuer ?`,
    );
    if (!ok) return;

    setDeletingId(employee.id);
    setDeleteError(null);
    try {
      if (employee.id.startsWith("invite:") && employee.inviteToken) {
        if (structureId) {
          await deletePendingInviteAsRh({
            token: employee.inviteToken,
            structureId,
          });
        }
        setRoster((current) => current.filter((e) => e.id !== employee.id));
      } else if (structureId) {
        await deleteEmployeeAsRh({ userId: employee.id, structureId });
        setRoster((current) => current.filter((e) => e.id !== employee.id));
        onRosterChange?.();
      } else {
        setRoster((current) => current.filter((e) => e.id !== employee.id));
      }
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Suppression impossible");
    } finally {
      setDeletingId(null);
    }
  }

  function openModuleEditor() {
    setModuleDraft(moduleSaved);
    setModuleError(null);
    setShowModuleEditor(true);
  }

  async function saveModuleEditor() {
    setModuleSaving(true);
    setModuleError(null);
    try {
      const useCases = (moduleDraft.useCases ?? []).map(trimUseCase).filter(isAiUseCaseFilled);
      const summaryParts = [
        `registre : ${useCases.length} usage${useCases.length > 1 ? "s" : ""}`,
      ];
      if (moduleDraft.charter.trim() !== moduleSaved.charter) summaryParts.push("charte");
      if (moduleDraft.tools.trim() !== moduleSaved.tools) summaryParts.push("outils");
      if (moduleDraft.contacts.trim() !== moduleSaved.contacts) summaryParts.push("référent");
      if (moduleDraft.declaration.trim() !== moduleSaved.declaration) summaryParts.push("déclaration");
      const next: CompanyModuleContent = {
        tools: moduleDraft.tools.trim(),
        charter: moduleDraft.charter.trim(),
        contacts: moduleDraft.contacts.trim(),
        declaration: moduleDraft.declaration.trim(),
        useCases,
        revisions: [
          ...moduleSaved.revisions,
          { at: new Date().toISOString(), summary: summaryParts.join(" · ") },
        ].slice(-80),
      };
      if (onSaveCompanyModule) await onSaveCompanyModule(next);
      setModuleSaved(next);
      setShowModuleEditor(false);
    } catch (e) {
      setModuleError(e instanceof Error ? e.message : "Enregistrement impossible");
    } finally {
      setModuleSaving(false);
    }
  }

  return (
    <div className="space-y-8 text-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pilotage RH</h1>
        <p className="mt-1 text-center text-sm text-blue-700/70 dark:text-blue-300/70">{companyName}</p>
      </div>

      {companyReady && (
        <button
          type="button"
          onClick={() => setShowCompany(true)}
          className="mx-auto block w-full max-w-2xl rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100 dark:hover:bg-emerald-950/50"
        >
          Registre à jour : chaque collaborateur actif a une attestation de suivi. Cliquez pour voir le dossier de preuve Article 4.
        </button>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setShowCompany(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-900 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          Rapport Article 4
        </button>
        <button
          type="button"
          disabled={demo}
          onClick={() => downloadCompanyReport(companyName, active)}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-900 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-200"
        >
          <Download className="h-4 w-4" />
          Télécharger le rapport (PDF)
        </button>
        <button
          type="button"
          disabled={demo}
          onClick={() => downloadProofZip(companyName, active, moduleSaved)}
          className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-2.5 text-sm font-semibold text-sky-900 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <Download className="h-4 w-4" />
          Exporter le dossier (ZIP)
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/90 px-4 py-5 text-center shadow-sm dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{done}/{active.length}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Salariés formés</div>
        </div>
        <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/90 px-4 py-5 text-center shadow-sm dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
          <div className="text-2xl font-bold text-sky-700 dark:text-sky-300">{rate} %</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Taux de suivi</div>
        </div>
        <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/80 px-4 py-5 text-center shadow-sm dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">90 jours</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Avant échéance (31 déc. 2026)</div>
        </div>
        <button
          type="button"
          onClick={openModuleEditor}
          className="rounded-xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/90 px-4 py-5 text-center shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-700 dark:from-slate-800 dark:to-slate-800 dark:hover:border-blue-800"
        >
          <div className="flex justify-center text-blue-700 dark:text-blue-300">
            <Building2 className="h-7 w-7" strokeWidth={2} />
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Module entreprise
          </div>
        </button>
      </div>

      {deleteError && (
        <p className="text-center text-sm text-red-600 dark:text-red-400">{deleteError}</p>
      )}

      {(demo || structureInviteLink) && (
        <div className="flex justify-center px-2">
          <div className="flex w-full max-w-lg flex-col items-center gap-2.5 rounded-2xl border border-blue-100/80 bg-gradient-to-b from-blue-50/60 to-white px-5 py-4 text-center shadow-sm dark:border-slate-700 dark:from-slate-800/80 dark:to-slate-900">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              Lien de connexion
            </p>
            <p className="w-full break-all text-sm font-medium leading-relaxed text-blue-600 dark:text-blue-400">
              {permanentLink}
            </p>
            <button
              type="button"
              onClick={() => void copyPermanentLink()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"
            >
              {copiedPermanent ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedPermanent ? "Copié" : "Copier"}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-blue-100 bg-white/90 shadow-sm dark:border-slate-700 dark:bg-slate-800 text-left">
        <div className="flex flex-col gap-3 border-b border-blue-50 bg-gradient-to-r from-blue-50/90 to-sky-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">
            Liste des collaborateurs ({visible.length})
          </h2>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher"
              className="w-full sm:w-52 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="text-slate-500 dark:text-slate-400">
              <tr>
                <SortHeader label="Collaborateur" active={sort.key === "name"} dir={sort.dir} onClick={() => toggleSort("name")} />
                <SortHeader label="E-mail" active={sort.key === "email"} dir={sort.dir} onClick={() => toggleSort("email")} />
                <SortHeader label="Avancement" active={sort.key === "percent"} dir={sort.dir} onClick={() => toggleSort("percent")} />
                <SortHeader label="Dernière connexion" active={sort.key === "lastSeen"} dir={sort.dir} onClick={() => toggleSort("lastSeen")} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((employee) => (
                <tr key={employee.id} className="group border-t border-slate-100 dark:border-slate-700">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    <NameWithService name={employee.name} role={employee.role} />
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {employee.email}
                  </td>
                  <td className="px-4 py-3">
                    <ProgressBar
                      value={employee.percent}
                      onDownload={
                        employee.percent >= 100 && employee.certificateId
                          ? () => setPreview(employee.id)
                          : employee.percent >= 100
                            ? () => setPreview(employee.id)
                            : undefined
                      }
                    />
                  </td>
                  <td className="relative px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {employee.lastSeen}
                    <button
                      type="button"
                      disabled={Boolean(deletingId) || demo}
                      onClick={() => void removeCollaborator(employee)}
                      aria-label={`Effacer ${employee.name}`}
                      title="Effacer — perte définitive du suivi"
                      className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex text-slate-400 opacity-100 transition-opacity hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-40 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="text-center max-w-2xl">
          Supprimer un collaborateur est définitif : progression et attestation sont effacées, et l&apos;accès est
          libéré pour un autre salarié. Cela permet de rester dans la capacité de votre offre et de garder le
          registre à jour.
        </p>
      </div>

      {selected && (
        <CertificatePreview
          employee={selected}
          companyName={companyName}
          proof={
            selected.certificateId
              ? {
                  score: selected.quizScore ?? 80,
                  ...formatProofDate(selected.certifiedAt ?? new Date().toISOString()),
                  issuedAt: selected.certifiedAt ?? null,
                  serial: selected.certificateId.replace(/^CONF-\d+-/, ""),
                  certificateId: selected.certificateId,
                  specimen: false,
                }
              : undefined
          }
          onClose={() => setPreview(null)}
        />
      )}
      {showCompany && (
        <CompanyCertificate
          company={companyName}
          done={done}
          total={active.length}
          employees={active}
          canDownload={!demo}
          onClose={() => setShowCompany(false)}
        />
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3 text-left">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Ajouter un collaborateur
              </h2>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {addDone ? (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Accès créé. Si c&apos;est un nouveau collaborateur :{" "}
                  <span className="font-semibold">/connexion</span> → « Première connexion ? ».
                  Si c&apos;est votre compte RH : vous pouvez ouvrir la formation.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Fermer
                </button>
              </>
            ) : (
              <form onSubmit={(e) => void submitAddCollaborator(e)} className="space-y-3 text-left">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Sans cet ajout, la personne ne peut pas se connecter. Elle active ensuite son
                  accès via le lien (Première connexion).
                </p>
                {seatsFull ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                    Offre pleine ({seatsMax} collaborateurs). Supprimez un compte pour en ajouter un.
                  </p>
                ) : null}
                <div className="grid grid-cols-2 gap-3">
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-slate-500">Prénom</span>
                    <input
                      required
                      value={addFirstName}
                      onChange={(e) => setAddFirstName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                      placeholder="Camille"
                      disabled={addBusy || seatsFull}
                      autoComplete="given-name"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-slate-500">Nom</span>
                    <input
                      required
                      value={addLastName}
                      onChange={(e) => setAddLastName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                      placeholder="Bernard"
                      disabled={addBusy || seatsFull}
                      autoComplete="family-name"
                    />
                  </label>
                </div>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-slate-500">E-mail</span>
                  <input
                    required
                    type="email"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                    placeholder="prenom.nom@entreprise.fr"
                    disabled={addBusy || seatsFull}
                    autoComplete="email"
                  />
                </label>
                {addError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{addError}</p>
                )}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={addBusy || seatsFull}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {addBusy ? "…" : "Créer l'accès"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showModuleEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Module « Votre entreprise »
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Visible dans le parcours collaborateurs. Écrivez en texte simple — le rendu se met en forme tout seul.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModuleEditor(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/80 px-3.5 py-3 text-xs leading-relaxed text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-100">
              <p className="font-semibold">Astuces de saisie</p>
              <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
                <li>
                  Une ligne qui commence par <code className="rounded bg-white/70 px-1 dark:bg-slate-900/60">-</code> ou{" "}
                  <code className="rounded bg-white/70 px-1 dark:bg-slate-900/60">1.</code> devient une liste.
                </li>
                <li>Laissez une ligne vide entre deux paragraphes.</li>
                <li>Les e-mails et liens (https://…) deviennent cliquables automatiquement.</li>
                <li>Champ vide = non affiché côté collaborateur.</li>
              </ul>
            </div>

            <div className="mt-5 space-y-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Registre des usages IA
                    </p>
                    <p className="mt-0.5 text-justify text-xs text-slate-500 hyphens-auto">
                      L&apos;outil, l&apos;usage et les données. Le reste de la fiche se complète ensuite, avec le DPO ou le référent.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setModuleDraft((current) => ({
                        ...current,
                        useCases: [...(current.useCases ?? []), emptyAiUseCase()],
                      }))
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter un usage
                  </button>
                </div>
                {(moduleDraft.useCases ?? []).length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-500 dark:border-slate-700">
                    Aucune ligne pour l&apos;instant. Ajoutez ChatGPT, Copilot, etc.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {(moduleDraft.useCases ?? []).map((row, index) => (
                      <div
                        key={row.id}
                        className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-950/50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-500">Usage {index + 1}</p>
                          <button
                            type="button"
                            onClick={() =>
                              setModuleDraft((current) => ({
                                ...current,
                                useCases: current.useCases.filter((item) => item.id !== row.id),
                              }))
                            }
                            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                            aria-label="Supprimer la fiche"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {USE_CASE_FIELDS.filter((field) => QUICK_USE_CASE_KEYS.has(field.key)).map(
                            (field) => (
                            <label key={field.key} className="block text-left">
                              <span className="mb-1 block text-[11px] font-medium text-slate-500">
                                {field.label}
                              </span>
                              <input
                                value={String(row[field.key] ?? "")}
                                onChange={(event) =>
                                  setModuleDraft((current) => ({
                                    ...current,
                                    useCases: current.useCases.map((item) =>
                                      item.id === row.id
                                        ? { ...item, [field.key]: event.target.value }
                                        : item,
                                    ),
                                  }))
                                }
                                placeholder={field.placeholder}
                                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                              />
                            </label>
                            ),
                          )}
                          <label className="block text-left">
                            <span className="mb-1 block text-[11px] font-medium text-slate-500">
                              Statut
                            </span>
                            <select
                              value={row.status}
                              onChange={(event) =>
                                setModuleDraft((current) => ({
                                  ...current,
                                  useCases: current.useCases.map((item) =>
                                    item.id === row.id
                                      ? {
                                          ...item,
                                          status: event.target.value as AiUseCaseEntry["status"],
                                        }
                                      : item,
                                  ),
                                }))
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                            >
                              {(
                                Object.keys(AI_USE_CASE_STATUS_LABELS) as AiUseCaseEntry["status"][]
                              ).map((status) => (
                                <option key={status} value={status}>
                                  {AI_USE_CASE_STATUS_LABELS[status]}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {(
                [
                  {
                    key: "tools" as const,
                    label: "Précisions / interdits (texte libre)",
                    why: "Complément au registre : règles transverses, données interdites, extensions non validées.",
                    placeholder:
                      "Outils validés :\n- Microsoft Copilot (messagerie & documents internes)\n- ChatGPT Entreprise (compte pro uniquement)\n\nInterdit :\n- Toute IA grand public pour des données clients ou RH\n- Extensions navigateur non validées",
                  },
                  {
                    key: "charter" as const,
                    label: "Charte IA",
                    why: "Les 4–6 règles que chacun doit connaître. Pas besoin d’un PDF : 1 règle par ligne suffit.",
                    placeholder:
                      "Règles d'usage :\n1. Je n'y mets jamais de données personnelles ou confidentielles sans validation.\n2. Je vérifie toujours le résultat avant de l'envoyer à un client ou un collègue.\n3. Je reste responsable de ce que je publie ou décide.\n4. En cas de doute, je demande au référent IA avant d'utiliser un nouvel outil.",
                  },
                  {
                    key: "contacts" as const,
                    label: "Référent IA & DPO",
                    why: "Qui contacter pour une question, un incident ou un doute. Indiquez nom + e-mail (ou canal Slack/Teams).",
                    placeholder:
                      "Référent IA : Marie Dupont — marie.dupont@entreprise.fr\nDPO : dpo@entreprise.fr\nCanal interne : #ia-questions (Teams)",
                  },
                  {
                    key: "declaration" as const,
                    label: "Procédure de déclaration",
                    why: "Comment un collab demande un nouvel outil ou signale un usage. Étapes courtes + délai attendu.",
                    placeholder:
                      "Pour déclarer un nouvel outil ou usage :\n1. Remplir le formulaire : https://intranet.entreprise.fr/ia\n2. Attendre le statut « validé » (délai indicatif : 5 jours ouvrés)\n3. Ne pas utiliser l'outil tant qu'il n'est pas au registre",
                  },
                ] as const
              ).map((field) => {
                const value = moduleDraft[field.key];
                return (
                  <div key={field.key} className="space-y-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{field.label}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{field.why}</p>
                    </div>
                    <textarea
                      value={value}
                      onChange={(event) =>
                        setModuleDraft((current) => ({ ...current, [field.key]: event.target.value }))
                      }
                      rows={6}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-blue-500/30 placeholder:text-slate-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                      placeholder={field.placeholder}
                    />
                    {value.trim() ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-950/60">
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Aperçu collaborateur
                        </p>
                        <PlainText text={value} compact />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {moduleError && (
              <p className="mt-3 text-center text-sm text-red-600 dark:text-red-400">{moduleError}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModuleEditor(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={moduleSaving}
                onClick={() => void saveModuleEditor()}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {moduleSaving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
