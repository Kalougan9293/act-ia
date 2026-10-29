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
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-emerald-600 bg-emerald-50 text-emerald-700 shadow-[0_0_0_6px_rgba(16,185,129,0.15)]">
      <Award className="h-9 w-9" strokeWidth={1.75} />
    </div>
  );
}

/** Badge site web — sceau « Certifié par LockinIA ». */
function WebTrustBadge({
  company,
  year,
  locked,
}: {
  company: string;
  year: number;
  locked?: boolean;
}) {
  return (
    <div
      className={`relative isolate w-[272px] overflow-hidden rounded-[22px] text-left transition ${
        locked ? "opacity-55 grayscale" : ""
      }`}
      style={{
        background:
          "linear-gradient(145deg, #0b1f17 0%, #123c2c 42%, #0f766e 78%, #134e4a 100%)",
        boxShadow:
          "0 18px 40px rgba(6, 40, 30, 0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(251,191,36,0.55) 0%, transparent 68%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[1px] rounded-[21px] border border-amber-200/25"
      />
      <div className="relative flex items-stretch gap-3 px-3.5 py-3.5">
        <div
          className="relative flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center rounded-full"
          style={{
            background:
              "conic-gradient(from 210deg, #fde68a, #b45309, #fef3c7, #92400e, #fde68a)",
            boxShadow: "0 0 0 3px rgba(15, 118, 110, 0.55)",
          }}
        >
          <div className="flex h-[3.35rem] w-[3.35rem] flex-col items-center justify-center rounded-full bg-[#0b1f17] text-amber-100">
            <ShieldCheck className="h-5 w-5 text-amber-200" strokeWidth={2.25} />
            <span className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.14em] text-amber-100/90">
              Art. 4
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-amber-200/90">
            Certifié par
          </p>
          <p className="mt-0.5 text-[17px] font-bold leading-none tracking-tight text-white">
            Lockin<span className="text-amber-300">IA</span>
          </p>
          <p className="mt-2 truncate text-[12px] font-semibold leading-tight text-emerald-50/95">
            {company}
          </p>
          <p className="mt-1 text-[10px] leading-snug text-emerald-100/70">
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
}) {
  const { company, registryId, year } = params;
  const safeCompany = company
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  return `<!-- Badge LockinIA — synthèse de suivi Art. 4 -->
<a href="https://lockin-web.online" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:12px;max-width:280px;padding:14px 16px;border-radius:22px;text-decoration:none;color:#fff;background:linear-gradient(145deg,#0b1f17 0%,#123c2c 42%,#0f766e 78%,#134e4a 100%);box-shadow:0 14px 32px rgba(6,40,30,.28);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
  <span style="display:flex;width:58px;height:58px;align-items:center;justify-content:center;border-radius:999px;background:conic-gradient(from 210deg,#fde68a,#b45309,#fef3c7,#92400e,#fde68a);flex-shrink:0;">
    <span style="display:flex;width:46px;height:46px;align-items:center;justify-content:center;border-radius:999px;background:#0b1f17;font-size:9px;font-weight:700;letter-spacing:.12em;color:#fde68a;">ART.4</span>
  </span>
  <span style="min-width:0;">
    <span style="display:block;font-size:9px;font-weight:600;letter-spacing:.28em;text-transform:uppercase;color:#fde68a;">Certifié par</span>
    <span style="display:block;margin-top:2px;font-size:17px;font-weight:700;letter-spacing:-0.02em;color:#fff;">Lockin<span style="color:#fcd34d;">IA</span></span>
    <span style="display:block;margin-top:8px;font-size:12px;font-weight:600;color:#ecfdf5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeCompany}</span>
    <span style="display:block;margin-top:3px;font-size:10px;color:rgba(209,250,229,.72);">Synthèse de suivi · AI Act · ${year}</span>
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
      }),
    [company, registryId, badgeYear],
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

        <article className="overflow-hidden rounded-sm bg-[#fbf8f1] text-slate-900 shadow-2xl">
          <div className="bg-emerald-800 px-8 py-3 text-center text-xs font-semibold tracking-[0.28em] text-emerald-50">
            LockinIA · SYNTHÈSE DE SUIVI
          </div>
          <div className="border-[10px] border-emerald-800/90 px-6 py-8 sm:px-10">
            <div className="border border-emerald-700/30 px-6 py-8 text-center">
              {!unlocked && (
                <div className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-amber-700">
                  Aperçu — disponible lorsque chaque collaborateur a une attestation de
                  suivi
                </div>
              )}
              <Seal />
              <h2 className="mt-5 text-xl font-bold tracking-tight sm:text-2xl">
                Synthèse de suivi — Article 4
              </h2>
              <p className="mt-2 text-center text-sm text-slate-600">
                Attestations de suivi · AI Act (article 4)
              </p>
              {localReport && localReport.version > 0 ? (
                <p className="mt-1 text-center text-xs font-semibold text-emerald-800">
                  Version v{localReport.version}
                  {unlocked ? " · suivi complet" : " · en cours"}
                </p>
              ) : null}

              <p className="mt-8 text-center text-xs uppercase tracking-[0.2em] text-slate-500">
                Raison sociale
              </p>
              <p className="mt-1 text-center text-3xl font-semibold">{company}</p>

              <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-1.5 text-sm font-semibold text-white">
                <ShieldCheck className="h-4 w-4" />
                {done}/{total} collaborateurs formés ·{" "}
                {total === 0 ? 0 : Math.round((done / total) * 100)} %
              </div>
              <p className="mt-3 text-center text-sm text-slate-700">
                {hours} h de formation · {certified} attestation
                {certified > 1 ? "s" : ""} émise{certified > 1 ? "s" : ""}
              </p>

              <dl className="mx-auto mt-8 max-w-md space-y-3 text-left text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">
                    Identifiant suivi
                  </dt>
                  <dd className="font-mono text-sm">{registryId}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">
                    Empreinte
                  </dt>
                  <dd className="font-mono text-xs">{fingerprint}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">
                    Périmètre documenté
                  </dt>
                  <dd>
                    Usage des IA génératives, protection des données et cadre EU AI Act
                    (article 4).
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">
                    Volume d&apos;heures
                  </dt>
                  <dd>
                    {Number.isInteger(hours) ? hours : hours.toLocaleString("fr-FR")} h — 1
                    h 15 par collaborateur au parcours validé (100 %).
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">
                    {unlocked && localReport?.firstIssuedAt
                      ? "Première complétion"
                      : "Horodatage aperçu"}
                  </dt>
                  <dd>
                    {paris.date} à {paris.time} (Europe/Paris)
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {utc.date} à {utc.time} UTC
                    </span>
                  </dd>
                </div>
                {firstParis && unlocked ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-slate-500">
                      Dernier export
                    </dt>
                    <dd className="text-xs text-slate-600">
                      {localReport?.lastExportedAt
                        ? `${formatProofDate(localReport.lastExportedAt).date} à ${formatProofDate(localReport.lastExportedAt).time}`
                        : "—"}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <div className="mx-auto mt-8 max-w-md text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Attestations émises
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {attested.length} attesté{attested.length > 1 ? "s" : ""}
                  {pendingCount > 0
                    ? ` · ${pendingCount} sans attestation`
                    : ""}
                  {employees.length > 0
                    ? ` · ${employees.length} collaborateur${employees.length > 1 ? "s" : ""}`
                    : ""}
                </p>
                {previewAttested.length > 0 ? (
                  <ul className="mt-2 divide-y divide-emerald-900/10 rounded-xl border border-emerald-900/15 bg-white/70">
                    {previewAttested.map((employee) => (
                      <li
                        key={employee.id}
                        className="flex items-start gap-2 px-3 py-2 text-sm"
                      >
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">{employee.name}</span>
                          <span className="block text-xs text-slate-500">
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
                  <p className="mt-2 rounded-xl border border-dashed border-emerald-900/20 bg-white/50 px-3 py-3 text-center text-xs text-slate-500">
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
                  <p className="mt-1.5 text-center text-xs text-amber-800/90 dark:text-amber-200/90">
                    Les collaborateurs sans attestation ne sont pas listés nominativement
                    (suivi détaillé dans l&apos;espace RH).
                  </p>
                ) : null}
              </div>

              <p className="mx-auto mt-8 max-w-md text-center text-xs leading-relaxed text-slate-500">
                Document émis par LockinIA et conservé dans le suivi des parcours. Il
                consigne les attestations de suivi. Il ne certifie pas l&apos;entreprise et
                ne constitue pas un conseil juridique. Le PDF versionné liste les
                collaborateurs attestés ; le détail des parcours en cours reste dans
                l&apos;espace RH.
              </p>
            </div>
          </div>
        </article>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            disabled={!canDownload || busy}
            onClick={() => void handleDownload()}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {busy
              ? "Préparation…"
              : "Télécharger la synthèse Article 4 (PDF)"}
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5 text-center shadow-lg dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Badge pour le site web
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-center text-xs leading-relaxed text-slate-500">
            Sceau « Certifié par LockinIA » — à placer sur votre site une fois le
            suivi complet. Certifie la synthèse de suivi délivrée par LockinIA, pas
            une conformité réglementaire globale.
          </p>
          <div className="mt-4 flex justify-center">
            <WebTrustBadge
              company={company}
              year={badgeYear}
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
            {copied ? "HTML du badge copié" : "Copier le code HTML du badge"}
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
