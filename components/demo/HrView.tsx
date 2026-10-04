"use client";

import { useEffect, useState } from "react";
import {
  Award,
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
  emptyCompanyModule,
  type CompanyModuleContent,
} from "@/lib/admin/types";
import { PlainText } from "@/lib/format/plain-text";
import { createInvite, inviteLink } from "@/lib/firebase/invites";

type SortKey = "name" | "email" | "percent" | "lastSeen";

function exportProofCsv(rows: Employee[], companyName: string) {
  const header = [
    "Nom",
    "Email",
    "Fonction",
    "Avancement %",
    "N° attestation",
    "Date émission",
    "Score QCM",
    "Entreprise",
  ];
  const lines = rows.map((e) =>
    [
      e.name,
      e.email,
      e.role,
      String(e.percent),
      e.certificateId ?? "",
      e.certifiedAt ? formatProofDate(e.certifiedAt).date : "",
      e.quizScore != null ? String(e.quizScore) : "",
      companyName,
    ]
      .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
      .join(";"),
  );
  const csv = `\uFEFF${[header.join(";"), ...lines].join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dossier-preuve-article4-${companyName.replace(/\s+/g, "-").toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

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
  companyModule: companyModuleProp,
  onSaveCompanyModule,
}: {
  initialEmployees?: Employee[];
  companyName?: string;
  structureId?: string;
  structureInviteLink?: string | null;
  seatsMax?: number;
  companyModule?: CompanyModuleContent;
  onSaveCompanyModule?: (module: CompanyModuleContent) => Promise<void>;
}) {
  const [roster, setRoster] = useState<Employee[]>(initialEmployees);
  const [preview, setPreview] = useState<string | null>(null);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [copiedPermanent, setCopiedPermanent] = useState(false);
  const [query, setQuery] = useState("");
  const [showCompany, setShowCompany] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [draftFirst, setDraftFirst] = useState("");
  const [draftLast, setDraftLast] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftRole, setDraftRole] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [inviteShare, setInviteShare] = useState<{
    name: string;
    email: string;
    link: string;
  } | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [showModuleEditor, setShowModuleEditor] = useState(false);
  const [moduleDraft, setModuleDraft] = useState<CompanyModuleContent>(
    () => companyModuleProp ?? emptyCompanyModule(),
  );
  const [moduleSaved, setModuleSaved] = useState<CompanyModuleContent>(
    () => companyModuleProp ?? emptyCompanyModule(),
  );
  const [moduleSaving, setModuleSaving] = useState(false);
  const [moduleError, setModuleError] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });

  useEffect(() => {
    setRoster(initialEmployees);
  }, [initialEmployees]);

  useEffect(() => {
    const next = companyModuleProp ?? emptyCompanyModule();
    setModuleSaved(next);
    if (!showModuleEditor) setModuleDraft(next);
  }, [companyModuleProp, showModuleEditor]);

  const active = roster.filter((employee) => !archivedIds.includes(employee.id));
  const archived = roster.filter((employee) => archivedIds.includes(employee.id));
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

  function toggleSort(key: SortKey) {
    setSort((current) =>
      current.key === key ? { key, dir: current.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  }

  const permanentLink = structureInviteLink || "/rejoindre/demo";

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
    setDraftFirst("");
    setDraftLast("");
    setDraftEmail("");
    setDraftRole("");
    setAddError(null);
    setShowAdd(true);
  }

  async function addCollaborator() {
    const first = draftFirst.trim();
    const last = draftLast.trim();
    const email = draftEmail.trim().toLowerCase();
    const jobTitle = draftRole.trim();
    if (!first || !last || !email || adding) return;

    setAdding(true);
    setAddError(null);
    try {
      if (structureId) {
        const { invite, link } = await createInvite({
          email,
          name: `${first} ${last}`,
          role: "employee",
          structureId,
          jobTitle,
        });
        setRoster((current) => [
          ...current.filter((e) => e.email.toLowerCase() !== email),
          {
            id: `invite:${invite.token}`,
            name: invite.name,
            email: invite.email,
            role: jobTitle || "Collaborateur",
            path: "IA + RGPD",
            status: "todo",
            percent: 0,
            lastSeen: "Invité",
            inviteToken: invite.token,
          },
        ]);
        setInviteShare({ name: invite.name, email: invite.email, link });
      } else {
        const token = crypto.randomUUID().replace(/-/g, "");
        const link = inviteLink(token);
        setRoster((current) => [
          ...current,
          {
            id: `invite:${token}`,
            name: `${first} ${last}`,
            email,
            role: jobTitle || "Collaborateur",
            path: "IA + RGPD",
            status: "todo",
            percent: 0,
            lastSeen: "Invité",
            inviteToken: token,
          },
        ]);
        setInviteShare({ name: `${first} ${last}`, email, link });
      }
      setShowAdd(false);
      setDraftFirst("");
      setDraftLast("");
      setDraftEmail("");
      setDraftRole("");
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Invitation impossible");
    } finally {
      setAdding(false);
    }
  }

  async function copyInviteShare() {
    if (!inviteShare) return;
    try {
      await navigator.clipboard.writeText(inviteShare.link);
      setCopiedInvite(true);
      window.setTimeout(() => setCopiedInvite(false), 1800);
    } catch {
      /* ignore */
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
      const next = {
        tools: moduleDraft.tools.trim(),
        charter: moduleDraft.charter.trim(),
        contacts: moduleDraft.contacts.trim(),
        declaration: moduleDraft.declaration.trim(),
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
        <p className="mt-1 text-sm text-blue-700/70 dark:text-blue-300/70">{companyName}</p>
      </div>

      {companyReady && (
        <div className="space-y-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Registre à jour : chaque collaborateur actif a une attestation de suivi. Ce document trace vos mesures ; il ne certifie pas l&apos;entreprise.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowCompany(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              <Award className="h-4 w-4" />
              Dossier de preuve Article 4
            </button>
            <button
              type="button"
              onClick={openModuleEditor}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-2.5 text-sm font-semibold text-blue-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
            >
              <Building2 className="h-4 w-4" />
              Module entreprise
            </button>
            <button
              type="button"
              onClick={() => exportProofCsv(active, companyName)}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              <Download className="h-4 w-4" />
              Exporter le registre (CSV)
            </button>
          </div>
        </div>
      )}

      {!companyReady && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={openModuleEditor}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-2.5 text-sm font-semibold text-blue-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
          >
            <Building2 className="h-4 w-4" />
            Module entreprise
          </button>
          {active.length > 0 && (
            <button
              type="button"
              onClick={() => exportProofCsv(active, companyName)}
              className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-2.5 text-sm font-semibold text-sky-900 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <Download className="h-4 w-4" />
              Exporter le registre (CSV)
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>

      <div className="mx-auto max-w-xl space-y-2 rounded-2xl border border-blue-100 bg-white/70 px-4 py-4 text-center shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70">
        <p className="text-center text-sm font-semibold text-slate-900 dark:text-white">
          Lien d&apos;invitation (tous les collaborateurs)
        </p>
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Un seul lien à partager : chacun s&apos;inscrit avec son e-mail et mot de passe.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 pt-0.5">
          <span className="break-all text-center text-sm font-medium text-blue-600 dark:text-blue-400">
            {permanentLink}
          </span>
          <button
            type="button"
            onClick={() => void copyPermanentLink()}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            {copiedPermanent ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedPermanent ? "Copié" : "Copier"}
          </button>
        </div>
      </div>

      {inviteShare && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-center dark:border-blue-800 dark:bg-blue-950/30">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Lien à envoyer à {inviteShare.name}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{inviteShare.email}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="break-all text-sm font-medium text-blue-600 dark:text-blue-400">
              {inviteShare.link}
            </span>
            <button
              type="button"
              onClick={() => void copyInviteShare()}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600"
            >
              {copiedInvite ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedInvite ? "Copié" : "Copier"}
            </button>
            <button
              type="button"
              onClick={() => setInviteShare(null)}
              className="text-xs font-medium text-slate-400 hover:text-slate-600"
            >
              Fermer
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
                      onClick={() => setArchivedIds((current) => [...current, employee.id])}
                      aria-label={`Archiver ${employee.name}`}
                      className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex text-slate-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100 dark:hover:text-red-400"
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
        <p className="text-center">
          Veille automatique AI Act &amp; RGPD : en cas d&apos;évolution légale, l&apos;équipe RH et les salariés sont automatiquement notifiés des nouveaux modules.
        </p>
      </div>

      {archived.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 text-center">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Archivés</h2>
          <ul className="mt-2 space-y-1">
            {archived.map((employee) => (
              <li key={employee.id} className="text-sm text-slate-600 dark:text-slate-300">
                {employee.name} · conservé, retiré du suivi
              </li>
            ))}
          </ul>
        </div>
      )}

      {selected && (
        <CertificatePreview
          employee={selected}
          companyName={companyName}
          proof={
            selected.certificateId
              ? {
                  score: selected.quizScore ?? 80,
                  ...formatProofDate(selected.certifiedAt ?? new Date().toISOString()),
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
          onClose={() => setShowCompany(false)}
        />
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void addCollaborator();
            }}
            className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
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
            <p className="text-xs text-slate-500">
              Un lien d&apos;invitation personnel sera généré. Vous pourrez aussi utiliser le lien permanent de la structure.
            </p>
            <label className="block text-sm text-slate-700 dark:text-slate-200">
              Prénom
              <input
                value={draftFirst}
                onChange={(event) => setDraftFirst(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950"
                required
                autoComplete="given-name"
              />
            </label>
            <label className="block text-sm text-slate-700 dark:text-slate-200">
              Nom
              <input
                value={draftLast}
                onChange={(event) => setDraftLast(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950"
                required
                autoComplete="family-name"
              />
            </label>
            <label className="block text-sm text-slate-700 dark:text-slate-200">
              E-mail
              <input
                type="email"
                value={draftEmail}
                onChange={(event) => setDraftEmail(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950"
                required
                autoComplete="email"
              />
            </label>
            <label className="block text-sm text-slate-700 dark:text-slate-200">
              Fonction <span className="text-xs text-slate-400">facultatif</span>
              <input
                value={draftRole}
                onChange={(event) => setDraftRole(event.target.value)}
                placeholder="Commerce, RH, Support…"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950"
                autoComplete="organization-title"
              />
            </label>
            {addError && (
              <p className="text-center text-sm text-red-600 dark:text-red-400">{addError}</p>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                disabled={adding}
                className="px-3 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50 dark:text-slate-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={adding}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {adding ? "…" : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showModuleEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:p-6">
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
              {(
                [
                  {
                    key: "tools" as const,
                    label: "Outils autorisés",
                    why: "Liste claire des IA validées, et ce qui est interdit (données clients, secrets, etc.).",
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
