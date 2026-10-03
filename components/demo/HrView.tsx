"use client";

import { useEffect, useState } from "react";
import { Award, ArrowDown, ArrowUp, ArrowUpDown, Check, Copy, Download, Info, Trash2 } from "lucide-react";
import { employees, type Employee } from "./data";
import CertificatePreview from "./CertificatePreview";
import CompanyCertificate from "./CompanyCertificate";
import { formatProofDate } from "@/lib/formation/proof";

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
  structureInviteLink,
}: {
  initialEmployees?: Employee[];
  companyName?: string;
  structureId?: string;
  structureInviteLink?: string | null;
  seatsMax?: number;
}) {
  const [roster, setRoster] = useState<Employee[]>(initialEmployees);
  const [preview, setPreview] = useState<string | null>(null);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [copiedPermanent, setCopiedPermanent] = useState(false);
  const [query, setQuery] = useState("");
  const [showCompany, setShowCompany] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });

  useEffect(() => {
    setRoster(initialEmployees);
  }, [initialEmployees]);

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
  const done = active.filter((employee) => employee.status === "done").length;
  const rate = active.length === 0 ? 0 : Math.round((done / active.length) * 100);
  const companyReady = active.length > 0 && done === active.length;
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

  return (
    <div className="space-y-8 text-center">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pilotage RH</h1>

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
              onClick={() => exportProofCsv(active, companyName)}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              <Download className="h-4 w-4" />
              Exporter le registre (CSV)
            </button>
          </div>
        </div>
      )}

      {!companyReady && active.length > 0 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => exportProofCsv(active, companyName)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Download className="h-4 w-4" />
            Exporter le registre (CSV)
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-5 text-center shadow-sm">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{done}/{active.length}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Salariés formés</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-5 text-center shadow-sm">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{rate} %</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Taux de suivi</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-5 text-center shadow-sm">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">90 jours</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Avant échéance (31 déc. 2026)</div>
        </div>
      </div>

      <div className="mx-auto max-w-xl space-y-2 text-center">
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

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden text-left">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">
            Liste des collaborateurs ({visible.length})
          </h2>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher"
            className="w-full sm:w-52 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
          />
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
    </div>
  );
}
