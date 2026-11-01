"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Award, Check, Copy, Download, ShieldCheck, X } from "lucide-react";
import type { Employee } from "./data";
import type { Article4ReportRecord } from "@/lib/admin/types";
import {
  companyTrainingStats,
  downloadCompanyReport,
  nextArticle4ReportRecord,
  registryIdForCompany,
  TRAINING_HOURS_EACH,
} from "@/lib/export/attestations";
import {
  certificateFingerprint,
  certificateSerialFromId,
  formatProofDate,
  formatProofDateUtc,
} from "@/lib/formation/proof";

function Seal() {
  return (
    <div className="relative mx-auto flex h-[5.5rem] w-[5.5rem] items-center justify-center">
      <div
        aria-hidden
        className="absolute inset-0 rounded-full border-[3px] border-emerald-700/90"
      />
      <div
        aria-hidden
        className="absolute inset-1.5 rounded-full border border-amber-600/50"
      />
      <div className="relative flex h-[4.25rem] w-[4.25rem] flex-col items-center justify-center rounded-full bg-emerald-50 text-emerald-800 shadow-[0_0_0_6px_rgba(6,95,70,0.08)]">
        <Award className="h-7 w-7" strokeWidth={1.75} />
        <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em]">
          Art. 4
        </span>
      </div>
    </div>
  );
}

type BadgeVariant = "discrete" | "normal" | "visible";

const BADGE_VARIANTS: {
  id: BadgeVariant;
  label: string;
  hint: string;
}[] = [
  { id: "discrete", label: "Discret", hint: "Pied de page, petit" },
  { id: "normal", label: "Normal", hint: "Équilibre classique" },
  { id: "visible", label: "Visible", hint: "Plus présent" },
];

function escapeHtmlAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Badge site web — 3 formats bleu / vert (sans gris). */
function WebTrustBadge({
  company,
  year,
  variant,
  locked,
}: {
  company: string;
  year: number;
  variant: BadgeVariant;
  locked?: boolean;
}) {
  const lockedClass = locked ? "opacity-50" : "";

  if (variant === "discrete") {
    return (
      <div
        className={`inline-flex max-w-[220px] items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-left shadow-sm dark:border-emerald-500/50 dark:bg-emerald-950/50 ${lockedClass}`}
      >
        <ShieldCheck
          className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300"
          strokeWidth={2.25}
        />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[11px] font-semibold text-emerald-950 dark:text-emerald-50">
            Suivi Lockin
            <span className="text-blue-600 dark:text-blue-400">IA</span>
          </p>
          <p className="truncate text-[9px] font-medium text-emerald-700/80 dark:text-emerald-300/80">
            Synthèse · Art. 4 · {year}
          </p>
        </div>
      </div>
    );
  }

  if (variant === "visible") {
    return (
      <div
        className={`relative isolate w-[300px] overflow-hidden rounded-2xl text-left ${lockedClass}`}
        style={{
          background:
            "linear-gradient(155deg, #047857 0%, #0f766e 40%, #2563eb 100%)",
          boxShadow:
            "0 20px 44px rgba(5, 150, 105, 0.35), inset 0 1px 0 rgba(255,255,255,0.22)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-8 h-40 w-40 rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.45) 0%, transparent 70%)",
          }}
        />
        <div className="relative px-4 pb-4 pt-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/35 backdrop-blur-sm">
              <ShieldCheck className="h-7 w-7 text-white" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-100">
                Suivi validé
              </p>
              <p className="text-[22px] font-bold leading-none tracking-tight text-white">
                Lockin<span className="text-sky-200">IA</span>
              </p>
            </div>
          </div>
          <p className="mt-3 truncate text-[13px] font-semibold text-white">
            {company}
          </p>
          <p className="mt-1 text-[11px] text-emerald-50/95">
            Synthèse de suivi · AI Act art. 4 · {year}
          </p>
        </div>
      </div>
    );
  }

  // normal — bleu LockinIA
  return (
    <div
      className={`relative isolate w-[272px] overflow-hidden rounded-[18px] text-left ${lockedClass}`}
      style={{
        background: "linear-gradient(145deg, #1e40af 0%, #2563eb 55%, #0ea5e9 100%)",
        boxShadow:
          "0 16px 36px rgba(37, 99, 235, 0.32), inset 0 1px 0 rgba(255,255,255,0.18)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[1px] rounded-[17px] border border-sky-200/30"
      />
      <div className="relative flex items-stretch gap-3 px-3.5 py-3.5">
        <div className="flex h-[4.1rem] w-[4.1rem] shrink-0 items-center justify-center rounded-full bg-emerald-400/25 ring-2 ring-emerald-200/60">
          <div className="flex h-[3.2rem] w-[3.2rem] flex-col items-center justify-center rounded-full bg-blue-950/40 text-emerald-50">
            <ShieldCheck className="h-5 w-5 text-emerald-100" strokeWidth={2.25} />
            <span className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.14em] text-emerald-50/95">
              Art. 4
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-sky-100">
            Suivi validé
          </p>
          <p className="mt-0.5 text-[17px] font-bold leading-none tracking-tight text-white">
            Lockin<span className="text-emerald-200">IA</span>
          </p>
          <p className="mt-2 truncate text-[12px] font-semibold leading-tight text-blue-50">
            {company}
          </p>
          <p className="mt-1 text-[10px] leading-snug text-sky-100/85">
            Synthèse de suivi · AI Act · {year}
          </p>
        </div>
      </div>
    </div>
  );
}

function buildBadgeEmbedHtml(params: {
  company: string;
  registryId: string;
  year: number;
  variant: BadgeVariant;
}) {
  const { company, registryId, year, variant } = params;
  const safeCompany = escapeHtmlAttr(company);
  const font =
    "font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif";

  if (variant === "discrete") {
    return `<!-- Badge LockinIA (discret) — synthèse de suivi Art. 4 -->
<a href="https://lockin-web.online" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;max-width:220px;padding:6px 12px;border-radius:999px;text-decoration:none;color:#064e3b;background:#ecfdf5;border:1px solid #6ee7b7;box-shadow:0 1px 2px rgba(5,150,105,.12);${font};">
  <span style="display:inline-flex;width:16px;height:16px;align-items:center;justify-content:center;border-radius:999px;background:#d1fae5;color:#047857;font-size:10px;font-weight:700;flex-shrink:0;">✓</span>
  <span style="min-width:0;line-height:1.15;">
    <span style="display:block;font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Suivi Lockin<span style="color:#2563eb;">IA</span></span>
    <span style="display:block;font-size:9px;font-weight:500;color:#047857;">Synthèse · Art. 4 · ${year}</span>
  </span>
</a>
<!-- Réf. ${registryId} · ${safeCompany} -->`;
  }

  if (variant === "visible") {
    return `<!-- Badge LockinIA (visible) — synthèse de suivi Art. 4 -->
<a href="https://lockin-web.online" target="_blank" rel="noopener noreferrer" style="display:inline-block;width:300px;max-width:100%;padding:14px 16px;border-radius:16px;text-decoration:none;color:#fff;background:linear-gradient(155deg,#047857 0%,#0f766e 40%,#2563eb 100%);box-shadow:0 16px 36px rgba(5,150,105,.32);${font};">
  <span style="display:flex;align-items:center;gap:12px;">
    <span style="display:flex;width:56px;height:56px;flex-direction:column;align-items:center;justify-content:center;border-radius:14px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.35);flex-shrink:0;"><span style="font-size:11px;font-weight:800;letter-spacing:.08em;color:#fff;">ART.4</span></span>
    <span style="min-width:0;">
      <span style="display:block;font-size:10px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#d1fae5;">Suivi validé</span>
      <span style="display:block;margin-top:2px;font-size:22px;font-weight:700;letter-spacing:-0.02em;color:#fff;">Lockin<span style="color:#bae6fd;">IA</span></span>
    </span>
  </span>
  <span style="display:block;margin-top:12px;font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeCompany}</span>
  <span style="display:block;margin-top:4px;font-size:11px;color:#ecfdf5;">Synthèse de suivi · AI Act art. 4 · ${year}</span>
</a>
<!-- Réf. ${registryId} -->`;
  }

  return `<!-- Badge LockinIA (normal) — synthèse de suivi Art. 4 -->
<a href="https://lockin-web.online" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:12px;max-width:280px;padding:14px 16px;border-radius:18px;text-decoration:none;color:#fff;background:linear-gradient(145deg,#1e40af 0%,#2563eb 55%,#0ea5e9 100%);box-shadow:0 14px 32px rgba(37,99,235,.28);${font};">
  <span style="display:flex;width:58px;height:58px;align-items:center;justify-content:center;border-radius:999px;background:rgba(52,211,153,.28);border:2px solid rgba(167,243,208,.65);flex-shrink:0;">
    <span style="display:flex;width:46px;height:46px;align-items:center;justify-content:center;border-radius:999px;background:rgba(30,64,175,.45);font-size:9px;font-weight:700;letter-spacing:.12em;color:#ecfdf5;">ART.4</span>
  </span>
  <span style="min-width:0;">
    <span style="display:block;font-size:9px;font-weight:600;letter-spacing:.28em;text-transform:uppercase;color:#e0f2fe;">Suivi validé</span>
    <span style="display:block;margin-top:2px;font-size:17px;font-weight:700;letter-spacing:-0.02em;color:#fff;">Lockin<span style="color:#a7f3d0;">IA</span></span>
    <span style="display:block;margin-top:8px;font-size:12px;font-weight:600;color:#eff6ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeCompany}</span>
    <span style="display:block;margin-top:3px;font-size:10px;color:#e0f2fe;">Synthèse de suivi · AI Act · ${year}</span>
  </span>
</a>
<!-- Réf. ${registryId} -->`;
}

export default function CompanyCertificate({
  company,
  done,
  total,
  employees = [],
  registryId: registryIdProp,
  article4Report = null,
  canDownload = true,
  onReportChange,
  onClose,
}: {
  company: string;
  done: number;
  total: number;
  employees?: Employee[];
  /** Identifiant figé de la structure (REG-LIA-…). */
  registryId?: string | null;
  article4Report?: Article4ReportRecord | null;
  canDownload?: boolean;
  /** Persistance après export / première complétion */
  onReportChange?: (report: Article4ReportRecord) => Promise<void> | void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [badgeVariant, setBadgeVariant] = useState<BadgeVariant>("normal");
  const [localReport, setLocalReport] = useState(article4Report);
  const freezeOnce = useRef(false);

  const unlocked = total > 0 && done === total;
  const registryId = registryIdProp?.trim() || registryIdForCompany(company);
  const fingerprint =
    localReport?.fingerprint ||
    certificateFingerprint(certificateSerialFromId(registryId));
  const stats = companyTrainingStats(employees.length ? employees : []);
  const hours = employees.length ? stats.hours : done * TRAINING_HOURS_EACH;
  const certified = employees.length ? stats.certified : unlocked ? total : 0;

  useEffect(() => {
    setLocalReport(article4Report);
  }, [article4Report]);

  /** Figé firstIssuedAt dès l'ouverture si suivi complet (sans attendre l'export). */
  useEffect(() => {
    if (!canDownload || !unlocked || freezeOnce.current) return;
    if (localReport?.firstIssuedAt) {
      freezeOnce.current = true;
      return;
    }
    freezeOnce.current = true;
    const next = nextArticle4ReportRecord({
      previous: localReport,
      employees,
      registryId,
      forExport: false,
    });
    if (!next.firstIssuedAt) return;
    setLocalReport(next);
    void onReportChange?.(next);
  }, [
    canDownload,
    unlocked,
    localReport,
    employees,
    registryId,
    onReportChange,
  ]);

  const displayIso = useMemo(() => {
    if (unlocked && localReport?.firstIssuedAt) return localReport.firstIssuedAt;
    if (localReport?.lastExportedAt) return localReport.lastExportedAt;
    return new Date().toISOString();
  }, [unlocked, localReport]);

  const paris = formatProofDate(displayIso);
  const utc = formatProofDateUtc(displayIso);
  const firstParis = localReport?.firstIssuedAt
    ? formatProofDate(localReport.firstIssuedAt)
    : null;

  const badgeYear = useMemo(() => {
    const iso = localReport?.firstIssuedAt || displayIso;
    const y = new Date(iso).getFullYear();
    return Number.isFinite(y) ? y : new Date().getFullYear();
  }, [localReport?.firstIssuedAt, displayIso]);

  const badgeEmbedHtml = useMemo(
    () =>
      buildBadgeEmbedHtml({
        company,
        registryId,
        year: badgeYear,
        variant: badgeVariant,
      }),
    [company, registryId, badgeYear, badgeVariant],
  );

  /** Aperçu UI : seulement les attestés, plafonné (le PDF porte la liste complète des attestés). */
  const PREVIEW_ATTESTED_MAX = 6;
  const attested = useMemo(
    () =>
      employees
        .filter((e) => e.percent >= 100 && Boolean(e.certificateId))
        .sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [employees],
  );
  const pendingCount = Math.max(0, employees.length - attested.length);
  const previewAttested = attested.slice(0, PREVIEW_ATTESTED_MAX);
  const attestedHidden = Math.max(0, attested.length - previewAttested.length);

  async function copyBadge() {
    try {
      await navigator.clipboard.writeText(badgeEmbedHtml);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  async function handleDownload() {
    if (!canDownload || busy) return;
    setBusy(true);
    try {
      const next = nextArticle4ReportRecord({
        previous: localReport,
        employees,
        registryId,
        forExport: true,
      });
      setLocalReport(next);
      downloadCompanyReport(company, employees, registryId, next);
      await onReportChange?.(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 px-4 py-8"
      onClick={onClose}
    >
      <div className="relative w-full max-w-2xl" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 rounded-full bg-white p-2 text-slate-500 shadow hover:text-slate-900"
          aria-label="Fermer la synthèse"
        >
          <X className="h-5 w-5" />
        </button>

        <article className="overflow-hidden rounded-sm bg-[#fbf8f1] text-slate-900 shadow-2xl ring-1 ring-emerald-900/10">
          <div className="border-[10px] border-emerald-800">
            <div className="border border-amber-700/40">
              <div className="bg-emerald-800 px-6 py-2.5 text-center text-[11px] font-semibold tracking-[0.28em] text-emerald-50 sm:px-8">
                LOCKINIA · SYNTHÈSE DE SUIVI · ARTICLE 4
              </div>

              <div className="px-5 py-8 text-center sm:px-10 sm:py-9">
                {!unlocked ? (
                  <p className="mb-5 inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                    Aperçu — suivi incomplet
                  </p>
                ) : (
                  <p className="mb-5 inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800">
                    Suivi complet
                  </p>
                )}

                <Seal />

                <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Synthèse de suivi — Article 4
                </h2>
                <p className="mt-1.5 text-sm text-slate-600">
                  Attestations de suivi · AI Act (article 4)
                </p>
                <p
                  className={`mt-2 text-xs font-semibold ${
                    unlocked ? "text-emerald-800" : "text-amber-800"
                  }`}
                >
                  Version v{Math.max(1, localReport?.version ?? 1)}
                  {unlocked ? " · suivi complet" : " · document en cours"}
                </p>

                <div className="mx-auto mt-7 h-px w-24 bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />

                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Raison sociale
                </p>
                <p className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {company}
                </p>

                <div className="mx-auto mt-6 max-w-lg rounded-xl border border-emerald-800/20 bg-emerald-50/80 px-4 py-3.5">
                  <p className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-emerald-900">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    {done} / {total} collaborateurs formés ·{" "}
                    {total === 0 ? 0 : Math.round((done / total) * 100)} %
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {Number.isInteger(hours) ? hours : hours.toLocaleString("fr-FR")} h de
                    formation · {certified} attestation
                    {certified > 1 ? "s" : ""} émise{certified > 1 ? "s" : ""}
                  </p>
                </div>

                <dl className="mx-auto mt-7 grid max-w-lg gap-3 text-left text-sm sm:grid-cols-2">
                  <div className="rounded-lg border border-emerald-900/10 bg-white/70 px-3 py-2.5 sm:col-span-2">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Identifiant de suivi
                    </dt>
                    <dd className="mt-0.5 font-mono text-sm">{registryId}</dd>
                  </div>
                  <div className="rounded-lg border border-emerald-900/10 bg-white/70 px-3 py-2.5 sm:col-span-2">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Empreinte documentaire
                    </dt>
                    <dd className="mt-0.5 break-all font-mono text-xs">{fingerprint}</dd>
                  </div>
                  <div className="rounded-lg border border-emerald-900/10 bg-white/70 px-3 py-2.5 sm:col-span-2">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Périmètre documenté
                    </dt>
                    <dd className="mt-0.5 text-slate-700">
                      Usage des IA génératives, protection des données et cadre EU AI Act
                      (article 4).
                    </dd>
                  </div>
                  <div className="rounded-lg border border-emerald-900/10 bg-white/70 px-3 py-2.5 sm:col-span-2">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Volume d&apos;heures
                    </dt>
                    <dd className="mt-0.5 text-slate-700">
                      {Number.isInteger(hours) ? hours : hours.toLocaleString("fr-FR")} h — 1
                      h 15 par collaborateur au parcours validé (100 %).
                    </dd>
                  </div>
                  <div className="rounded-lg border border-emerald-900/10 bg-white/70 px-3 py-2.5">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {unlocked && localReport?.firstIssuedAt
                        ? "Première complétion"
                        : "Horodatage (Paris)"}
                    </dt>
                    <dd className="mt-0.5 text-slate-700">
                      {paris.date} à {paris.time}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-emerald-900/10 bg-white/70 px-3 py-2.5">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Horodatage UTC
                    </dt>
                    <dd className="mt-0.5 text-slate-700">
                      {utc.date} à {utc.time}
                    </dd>
                  </div>
                  {firstParis && unlocked ? (
                    <div className="rounded-lg border border-emerald-900/10 bg-white/70 px-3 py-2.5 sm:col-span-2">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Dernier export
                      </dt>
                      <dd className="mt-0.5 text-slate-700">
                        {localReport?.lastExportedAt
                          ? `${formatProofDate(localReport.lastExportedAt).date} à ${formatProofDate(localReport.lastExportedAt).time}`
                          : "—"}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <div className="mx-auto mt-8 max-w-lg text-left">
                  <div className="mb-2 flex items-end justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Attestations émises
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {attested.length} attesté{attested.length > 1 ? "s" : ""}
                      {pendingCount > 0 ? ` · ${pendingCount} sans` : ""}
                      {employees.length > 0
                        ? ` · ${employees.length} collab.`
                        : ""}
                    </p>
                  </div>
                  {previewAttested.length > 0 ? (
                    <ul className="divide-y divide-emerald-900/10 overflow-hidden rounded-xl border border-emerald-900/15 bg-white/80">
                      {previewAttested.map((employee) => (
                        <li
                          key={employee.id}
                          className="flex items-start gap-2.5 px-3.5 py-2.5 text-sm"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white">
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold text-slate-900">
                              {employee.name}
                            </span>
                            <span className="block font-mono text-[11px] text-slate-500">
                              {employee.certificateId}
                              {employee.certifiedAt
                                ? ` · ${formatProofDate(employee.certifiedAt).date}`
                                : ""}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded-xl border border-dashed border-emerald-900/20 bg-white/60 px-3 py-4 text-center text-xs text-slate-500">
                      Aucune attestation émise pour le moment.
                    </p>
                  )}
                  {attestedHidden > 0 ? (
                    <p className="mt-2 text-center text-xs text-slate-500">
                      + {attestedHidden} autre{attestedHidden > 1 ? "s" : ""} attesté
                      {attestedHidden > 1 ? "s" : ""} — liste complète dans le PDF
                    </p>
                  ) : null}
                  {pendingCount > 0 ? (
                    <p className="mt-2 text-center text-xs text-amber-800">
                      Les collaborateurs sans attestation ne sont pas listés
                      nominativement (suivi détaillé dans l&apos;espace RH).
                    </p>
                  ) : null}
                </div>

                <div className="mx-auto mt-8 max-w-lg border-t border-amber-700/30 pt-5">
                  <p className="text-center text-[11px] leading-relaxed text-slate-500">
                    Document émis par LockinIA et conservé dans le suivi des parcours. Il
                    consigne les attestations de suivi. Il ne certifie pas l&apos;entreprise
                    et ne constitue pas un conseil juridique. Le PDF versionné liste les
                    collaborateurs attestés ; le détail des parcours en cours reste dans
                    l&apos;espace RH.
                  </p>
                  <p className="mt-3 text-center text-[11px] font-semibold text-slate-700">
                    LockinIA — édité par FITOPS AI (micro-entreprise)
                  </p>
                  <p className="mt-0.5 text-center text-[10px] text-slate-500">
                    119 rue Jules Parent, 92500 Rueil-Malmaison · SIRET 853 780 906 00063
                  </p>
                  <p className="mt-0.5 text-center text-[10px] text-slate-500">
                    contact@lockin-web.online · lockin-web.online
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            disabled={!canDownload || busy}
            onClick={() => void handleDownload()}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-900/20 bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {busy ? "Préparation…" : "Télécharger la synthèse Article 4 (PDF)"}
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5 text-center shadow-lg dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Badge pour le site web
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-center text-xs leading-relaxed text-slate-500">
            Sceau « Suivi LockinIA » — à placer sur votre site une fois le
            suivi complet. Certifie la synthèse de suivi délivrée par LockinIA, pas
            une conformité réglementaire globale.
          </p>

          <div className="mx-auto mt-4 flex max-w-md flex-wrap items-center justify-center gap-2">
            {BADGE_VARIANTS.map((option) => {
              const selected = badgeVariant === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setBadgeVariant(option.id)}
                  className={`rounded-xl border px-3 py-2 text-left transition ${
                    selected
                      ? "border-blue-500 bg-blue-50 shadow-sm dark:border-blue-400 dark:bg-blue-500/15"
                      : "border-slate-200 bg-white hover:border-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-blue-700"
                  }`}
                >
                  <span
                    className={`block text-xs font-semibold ${
                      selected
                        ? "text-blue-800 dark:text-blue-200"
                        : "text-slate-800 dark:text-slate-100"
                    }`}
                  >
                    {option.label}
                  </span>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                    {option.hint}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex min-h-[7.5rem] items-center justify-center">
            <WebTrustBadge
              company={company}
              year={badgeYear}
              variant={badgeVariant}
              locked={!unlocked}
            />
          </div>
          <button
            type="button"
            onClick={() => void copyBadge()}
            disabled={!unlocked}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
          >
            <Copy className="h-4 w-4" />
            {copied
              ? "HTML du badge copié"
              : `Copier le HTML (${BADGE_VARIANTS.find((v) => v.id === badgeVariant)?.label.toLowerCase()})`}
          </button>
          {!unlocked ? (
            <p className="mx-auto mt-2 max-w-xs text-center text-xs text-slate-400">
              Disponible lorsque chaque collaborateur a une attestation.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
