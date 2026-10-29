"use client";

import { createPortal } from "react-dom";
import { Award, Download, ShieldCheck, X } from "lucide-react";
import type { Employee } from "./data";
import { downloadLearnerAttestation } from "@/lib/export/attestations";
import { ATTESTATION_COURSE_TITLE, SOCLE_DURATION_LABEL } from "@/lib/formation/curriculum";
import {
  ATTESTATION_HEADER_TAGLINE,
  ATTESTATION_INTRO,
  ATTESTATION_ISSUER,
  ATTESTATION_REFERENTIEL,
  QUIZ_PASS_THRESHOLD,
} from "@/lib/formation/attestation-issuer";
import {
  certificateFingerprint,
  CURRICULUM_LABEL,
  formatDurationSec,
  formatProofDateUtc,
} from "@/lib/formation/proof";

const demoProofs: Record<string, { score: number; date: string; time: string; serial: string }> = {
  "2": { score: 94, date: "28/09/2026", time: "16:42", serial: "M4K2L" },
  "3": { score: 88, date: "22/09/2026", time: "11:05", serial: "B7N3Q" },
  "5": { score: 97, date: "29/09/2026", time: "09:18", serial: "L2P8C" },
};

export type CertificateProof = {
  score: number;
  date: string;
  time: string;
  serial: string;
  certificateId?: string;
  specimen?: boolean;
  /** ISO, pour le horodatage UTC du PDF. */
  issuedAt?: string | null;
  timeSpentSec?: number | null;
  modulesCompleted?: number | null;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-slate-900">{children}</dd>
    </div>
  );
}

export default function CertificatePreview({
  employee,
  onClose,
  companyName = "Atelier Lumière",
  proof: proofProp,
  canDownload = true,
}: {
  employee: Employee;
  onClose: () => void;
  companyName?: string;
  proof?: CertificateProof;
  /** Désactiver en démo publique. */
  canDownload?: boolean;
}) {
  const [first, ...rest] = employee.name.split(" ");
  const last = rest.join(" ");
  const demo = demoProofs[employee.id] ?? {
    score: employee.quizScore ?? 90,
    date: employee.lastSeen,
    time: "10:00",
    serial: "X0000",
  };
  const proof: CertificateProof = proofProp ?? {
    ...demo,
    certificateId: employee.certificateId ?? `LIA-2026-${demo.serial}`,
    specimen: !employee.certificateId,
  };
  const certificateId = proof.certificateId ?? `LIA-2026-${proof.serial}`;
  const hash = certificateFingerprint(proof.serial);
  const issuedAt = `${proof.date} à ${proof.time} (Europe/Paris)`;
  const utc = proof.issuedAt ? formatProofDateUtc(proof.issuedAt) : null;
  const specimen = proof.specimen ?? !Boolean(employee.certificateId);

  const validationRows: [string, string][] = [
    ["Durée pédagogique prévue (socle)", SOCLE_DURATION_LABEL],
    ...(proof.timeSpentSec != null && proof.timeSpentSec > 0
      ? ([
          ["Temps de connexion enregistré", formatDurationSec(proof.timeSpentSec)],
        ] as [string, string][])
      : []),
    ...(proof.modulesCompleted != null && proof.modulesCompleted > 0
      ? ([["Modules / étapes validés", String(proof.modulesCompleted)]] as [string, string][])
      : []),
    ["Parcours complété", "100 %"],
    ["Résultat de l'évaluation", `${proof.score} / 100 — Réussite`],
    [
      "Seuil de réussite défini pour ce parcours",
      `${QUIZ_PASS_THRESHOLD} / 100`,
    ],
    ["Date de finalisation", proof.date],
    ["Heure de finalisation", `${proof.time} Europe/Paris`],
    ...(utc ? ([["Horodatage UTC", `${utc.date} à ${utc.time} UTC`]] as [string, string][]) : []),
  ];

  function download() {
    downloadLearnerAttestation({
      fullName: employee.name,
      companyName: employee.companyName ?? companyName,
      certificateId,
      quizScore: proof.score,
      issuedAt: proof.issuedAt,
      dateLabel: proof.date,
      timeLabel: proof.time,
      specimen,
      timeSpentSec: proof.timeSpentSec,
      modulesCompleted: proof.modulesCompleted,
    });
  }

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-slate-900/60 px-3 py-6 sm:px-4 sm:py-8"
      onClick={onClose}
    >
      <div className="relative w-full max-w-2xl" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-1 -right-1 z-10 rounded-full bg-white p-2 text-slate-500 shadow-md transition hover:text-slate-900"
          aria-label="Fermer l'attestation"
        >
          <X className="h-5 w-5" />
        </button>

        <article className="overflow-hidden rounded-sm bg-[#fbf8f1] text-slate-900 shadow-2xl">
          <div className="bg-blue-700 px-6 py-2.5 text-center text-[11px] font-semibold tracking-[0.28em] text-blue-50 sm:px-8">
            LockinIA · ATTESTATION DE SUIVI
          </div>

          <div className="border-[10px] border-blue-700/90 px-4 py-6 sm:px-8 sm:py-8">
            <div className="border border-blue-700/25 px-4 py-7 sm:px-8 sm:py-9">
              {specimen ? (
                <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                  Spécimen de démonstration
                </p>
              ) : null}

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-blue-600 bg-blue-50 text-blue-700 shadow-[0_0_0_5px_rgba(37,99,235,0.12)]">
                <Award className="h-7 w-7" strokeWidth={1.75} />
              </div>

              <header className="mt-5 space-y-2 text-center">
                <p className="text-center text-xs font-bold tracking-[0.28em] text-blue-700">
                  LockinIA
                </p>
                <h2 className="text-center text-xl font-bold tracking-tight sm:text-2xl">
                  Attestation de suivi de formation
                  <span className="block text-lg font-semibold text-slate-700 sm:text-xl">
                    et de sensibilisation
                  </span>
                </h2>
                <p className="text-center text-sm text-slate-600">
                  {ATTESTATION_HEADER_TAGLINE}
                </p>
                <p className="pt-1 text-center text-xs text-slate-500">
                  Attestation n°{" "}
                  <span className="font-mono font-medium text-slate-700">
                    {certificateId}
                  </span>
                  <span className="mx-1.5 text-slate-300">·</span>
                  Version {CURRICULUM_LABEL}
                </p>
              </header>

              <div className="mt-5 flex justify-center">
                <div className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-3.5 py-1.5 text-center text-xs font-semibold text-white">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Réussite · {proof.score} / 100
                  </span>
                </div>
              </div>

              <section className="mt-8 text-left">
                <h3 className="text-center text-[11px] font-bold tracking-[0.2em] text-blue-700">
                  01 — BÉNÉFICIAIRE
                </h3>
                <dl className="mt-3 grid gap-4 rounded-xl border border-blue-900/10 bg-white/70 px-4 py-4 sm:grid-cols-2">
                  <Field label="Nom et prénom">
                    {first} {last}
                  </Field>
                  <Field label="Entreprise">
                    {employee.companyName ?? companyName}
                  </Field>
                </dl>
              </section>

              <section className="mt-7">
                <h3 className="text-center text-[11px] font-bold tracking-[0.2em] text-blue-700">
                  02 — PARCOURS SUIVI
                </h3>
                <div className="mt-3 space-y-3 rounded-xl border border-blue-900/10 bg-white/70 px-4 py-4 text-left text-sm leading-relaxed text-slate-700">
                  <p>{ATTESTATION_INTRO}</p>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Intitulé du parcours
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">{ATTESTATION_COURSE_TITLE}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Référentiel pédagogique
                    </p>
                    <p className="mt-1">{ATTESTATION_REFERENTIEL}</p>
                  </div>
                  <ul className="space-y-1.5 pl-1 text-[13px]">
                    {[
                      "Comprendre les principes liés à l'utilisation de l'IA et à la AI literacy.",
                      "Identifier les principaux risques, notamment pour les données personnelles.",
                      "Adopter des pratiques responsables avec les outils d'IA générative.",
                      "Repérer les situations qui relèvent des règles internes de l'entreprise.",
                    ].map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="mt-7">
                <h3 className="text-center text-[11px] font-bold tracking-[0.2em] text-blue-700">
                  03 — VALIDATION
                </h3>
                <div className="mt-3 overflow-hidden rounded-xl border border-blue-900/10 bg-white/70">
                  <table className="w-full text-left text-sm">
                    <tbody>
                      {validationRows.map(([label, value], i) => (
                        <tr
                          key={label}
                          className={i % 2 === 1 ? "bg-slate-50/80" : undefined}
                        >
                          <th className="w-1/2 px-3.5 py-2 font-medium text-slate-500">
                            {label}
                          </th>
                          <td className="px-3.5 py-2 font-semibold text-slate-900">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 px-1 text-center text-[11px] leading-relaxed text-slate-500">
                  Le temps de connexion enregistré peut être inférieur à la durée pédagogique
                  prévue (sessions fractionnées, onglet en arrière-plan).
                </p>
                <p className="mt-3 text-center text-sm font-semibold text-emerald-800">
                  Résultat de l&apos;évaluation : {proof.score}/100 — Réussite
                </p>
              </section>

              <section className="mt-7">
                <h3 className="text-center text-[11px] font-bold tracking-[0.2em] text-blue-700">
                  04 — TRAÇABILITÉ
                </h3>
                <div className="mt-3 rounded-xl border border-blue-900/10 bg-white/70 px-4 py-4">
                  <p className="text-left text-sm leading-relaxed text-slate-600">
                    Attestation générée par LockinIA à partir des données de suivi
                    enregistrées.
                  </p>
                  <dl className="mt-4 space-y-3 text-left">
                    <Field label="Identifiant unique">
                      <span className="break-all font-mono text-xs">{certificateId}</span>
                    </Field>
                    <Field label="Empreinte documentaire">
                      <span className="break-all font-mono text-[11px] font-medium">
                        {hash}
                      </span>
                    </Field>
                    <Field label="Émise le">{issuedAt}</Field>
                    <Field label="Version du parcours">{CURRICULUM_LABEL}</Field>
                  </dl>
                </div>
              </section>

              <footer className="mt-8 border-t border-blue-900/15 pt-5 text-center">
                {specimen ? (
                  <p className="mb-2 text-center text-xs font-semibold text-amber-700">
                    Spécimen de démonstration — non opposable
                  </p>
                ) : null}
                <p className="text-center text-sm font-semibold text-slate-900">
                  {ATTESTATION_ISSUER.brand} — édité par {ATTESTATION_ISSUER.legalName}
                </p>
                <p className="mt-1 text-center text-xs text-slate-500">
                  {ATTESTATION_ISSUER.address}
                </p>
                <p className="text-center text-xs text-slate-500">
                  SIRET {ATTESTATION_ISSUER.siret} · {ATTESTATION_ISSUER.email}
                </p>
                <p className="mx-auto mt-3 max-w-md text-center text-xs leading-relaxed text-slate-500">
                  Ce document constitue un justificatif de suivi délivré à l&apos;entreprise pour
                  documenter sa démarche de maîtrise de l&apos;IA. Il ne constitue ni une
                  certification officielle de conformité à l&apos;AI Act ou au RGPD, ni une
                  certification délivrée par l&apos;Union européenne.
                </p>
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  Référence {certificateId} · Document {hash.slice(-8)}
                </p>
              </footer>
            </div>
          </div>
        </article>

        {canDownload ? (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={download}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-800"
            >
              <Download className="h-4 w-4" />
              Télécharger l&apos;attestation (PDF)
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );

  // Hors du DOM parent (ex. translate sur le badge témoin) pour un vrai plein écran.
  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
