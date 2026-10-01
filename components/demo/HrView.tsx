"use client";

import { useState } from "react";
import { Award, ArrowDown, ArrowUp, ArrowUpDown, Download, Eye, Info, Lock, Plus, Trash2 } from "lucide-react";
import { employees, type Employee } from "./data";
import CertificatePreview from "./CertificatePreview";
import CompanyCertificate from "./CompanyCertificate";

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
        className={`inline-flex items-center gap-1 ${active ? "text-blue-700 dark:text-blue-300" : "hover:text-slate-800 dark:hover:text-slate-200"}`}
      >
        {label}
        <Icon className="h-3.5 w-3.5" />
      </button>
    </th>
  );
}

function ProgressBar({ value, onDownload }: { value: number; onDownload?: () => void }) {
  const color =
    value >= 100
      ? "bg-lime-400"
      : value >= 80
        ? "bg-emerald-500"
        : value > 20
          ? "bg-yellow-400"
          : value > 0
            ? "bg-orange-500"
            : "bg-red-500";

  return (
    <div className="mx-auto flex w-[7.5rem] items-center" aria-label={`${value} %`}>
      <div
        className={`h-1.5 w-16 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ${
          value >= 100 ? "shadow-[0_0_10px_rgba(163,230,53,0.95)]" : ""
        }`}
      >
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: value === 0 ? "8px" : `${value}%` }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-900 dark:text-white">
        {value}%
      </span>
      <span className="ml-1.5 flex w-3.5 shrink-0 justify-center">
        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            aria-label="Télécharger l'attestation"
            className="inline-flex text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}
      </span>
    </div>
  );
}

function NameWithService({ name, role }: { name: string; role: string }) {
  const [first, ...rest] = name.split(" ");
  const last = rest.join(" ");
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  return (
    <>
      <span
        className="cursor-default border-b border-dotted border-slate-300 dark:border-slate-500"
        onMouseEnter={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setTip({ x: rect.left + rect.width / 2, y: rect.bottom + 6 });
        }}
        onMouseLeave={() => setTip(null)}
      >
        {first}
      </span>
      {last ? ` ${last}` : null}
      {tip && (
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

export default function HrView() {
  const [roster, setRoster] = useState<Employee[]>(employees);
  const [preview, setPreview] = useState<string | null>(null);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [query, setQuery] = useState("");
  const [showCompany, setShowCompany] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });

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

  function addCollaborator() {
    const name = draftName.trim();
    const email = draftEmail.trim();
    if (!name || !email) return;
    setRoster((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name,
        email,
        role: "À préciser",
        path: "IA + RGPD",
        status: "todo",
        percent: 0,
        lastSeen: "—",
        dueDate: "15/10/2026",
      },
    ]);
    setDraftName("");
    setDraftEmail("");
    setShowAdd(false);
  }

  return (
    <div className="space-y-8 text-center">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pilotage RH</h1>

      {companyReady && (
        <div className="space-y-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Félicitations. Votre entreprise est 100 % conforme à l&apos;article 4 de l&apos;AI Act et au RGPD. Votre registre est à jour.
          </div>
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowCompany(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              <Award className="h-4 w-4" />
              Certificat global de conformité 2026
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-5 text-center shadow-sm">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{done}/{active.length}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Salariés formés</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-5 text-center shadow-sm">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{rate} %</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Taux de conformité</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-5 text-center shadow-sm">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">90 jours</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Avant échéance (31 déc. 2026)</div>
        </div>
        <div className="col-start-2 -mt-1 flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setShowCompany(true)}
            aria-label="Voir l'aperçu du diplôme de conformité"
            className="inline-flex text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Eye className="h-4 w-4" />
          </button>
          <p className="flex items-center justify-center gap-1 text-[11px] leading-tight text-slate-400">
            {!companyReady && <Lock className="h-3 w-3 shrink-0" />}
            Certificat d&apos;entreprise{!companyReady ? " (déblocage à 100 %)" : ""}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden text-left">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-4 sm:px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
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
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
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
                      onDownload={employee.percent >= 100 ? () => setPreview(employee.id) : undefined}
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

      {selected && <CertificatePreview employee={selected} onClose={() => setPreview(null)} />}
      {showCompany && (
        <CompanyCertificate
          company="Atelier Lumière"
          done={done}
          total={active.length}
          onClose={() => setShowCompany(false)}
        />
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4" onClick={() => setShowAdd(false)}>
          <form
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 text-left shadow-xl space-y-4"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              addCollaborator();
            }}
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white text-center">Ajouter un collaborateur</h2>
            <label className="block text-sm text-slate-700 dark:text-slate-200">
              Nom et prénom
              <input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2"
                required
              />
            </label>
            <label className="block text-sm text-slate-700 dark:text-slate-200">
              E-mail
              <input
                type="email"
                value={draftEmail}
                onChange={(event) => setDraftEmail(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2"
                required
              />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                Annuler
              </button>
              <button type="submit" className="px-3 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700">
                Ajouter
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
