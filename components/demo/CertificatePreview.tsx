"use client";

import { X } from "lucide-react";
import type { Employee } from "./data";
import { CURRICULUM_LABEL } from "@/lib/formation/proof";

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
};

function FakeQr() {
  const cells = [
    "111011101",
    "100010001",
    "101110101",
    "101010101",
    "111011101",
    "000100010",
    "110101011",
    "101000101",
    "111011101",
  ];

  return (
    <div className="inline-grid grid-cols-9 gap-px bg-white p-1 border border-slate-300" aria-hidden="true">
      {cells.flatMap((row, y) =>
        row.split("").map((cell, x) => (
          <span key={`${y}-${x}`} className={`w-2 h-2 ${cell === "1" ? "bg-slate-900" : "bg-white"}`} />
        )),
      )}
    </div>
  );
}

export default function CertificatePreview({
  employee,
  onClose,
  companyName = "Atelier Lumière",
  proof: proofProp,
}: {
  employee: Employee;
  onClose: () => void;
  companyName?: string;
  proof?: CertificateProof;
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
    certificateId: employee.certificateId ?? `CONF-2026-${demo.serial}`,
    specimen: !employee.certificateId,
  };
  const certificateId = proof.certificateId ?? `CONF-2026-${proof.serial}`;
  const hash = `a9f3c1${proof.serial.toLowerCase()}8e42b7d0`;
  const issuedAt = `${proof.date} à ${proof.time} (Europe/Paris)`;
  const specimen = proof.specimen ?? !Boolean(employee.certificateId);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 px-4 py-8" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl bg-white text-slate-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-900"
          aria-label="Fermer l'attestation"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-8 sm:px-12 py-10 space-y-8">
          <header className="text-center space-y-2 border-b border-slate-200 pb-6">
            <div className="text-sm font-bold tracking-[0.25em] text-blue-600">CONFORMAI</div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Attestation de suivi de formation et de sensibilisation
            </h2>
            <p className="text-center text-sm text-slate-600">Intelligence artificielle — EU AI Act &amp; RGPD</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 pt-2 text-xs text-slate-500">
              <span>Attestation n° {certificateId}</span>
              <span>Version {CURRICULUM_LABEL}</span>
              {specimen && <span className="text-amber-700 font-semibold">Spécimen de démonstration</span>}
            </div>
          </header>

          <section className="space-y-3">
            <h3 className="text-xs font-bold tracking-widest text-blue-700">01 — Bénéficiaire</h3>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-xs text-slate-500">Nom et prénom</div>
                <div className="font-semibold">{first} {last}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Fonction</div>
                <div className="font-semibold">{employee.role}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Entreprise</div>
                <div className="font-semibold">{employee.companyName ?? companyName}</div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold tracking-widest text-blue-700">02 — Parcours suivi</h3>
            <p className="text-left text-sm leading-relaxed">
              Nous attestons que la personne identifiée ci-dessus a suivi le parcours de sensibilisation proposé par la plateforme ConformAI et a satisfait aux conditions de validation définies pour ce parcours.
            </p>
            <div className="text-sm">
              <div className="text-xs text-slate-500">Intitulé du parcours</div>
              <div className="font-semibold">
                Sensibilisation à la littératie en intelligence artificielle et bonnes pratiques de protection des données
              </div>
            </div>
            <div className="text-sm">
              <div className="text-xs text-slate-500">Référentiel</div>
              <div>EU AI Act — dispositions relatives à la AI literacy</div>
              <div>Règlement général sur la protection des données (RGPD)</div>
            </div>
            <ul className="text-sm text-left space-y-1 list-disc pl-5">
              <li>Comprendre les principes liés à l&apos;utilisation de l&apos;IA et à la AI literacy.</li>
              <li>Identifier les principaux risques, notamment pour les données personnelles.</li>
              <li>Adopter des pratiques responsables avec les outils d&apos;IA générative.</li>
              <li>Repérer les situations qui relèvent des règles internes de l&apos;entreprise.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold tracking-widest text-blue-700">03 — Validation</h3>
            <table className="w-full text-sm text-left border border-slate-200">
              <tbody>
                {[
                  ["Durée pédagogique prévue", "≈ 1 h 25 à 1 h 30"],
                  ["Parcours complété", "100 %"],
                  ["Évaluation finale", `${proof.score} / 100`],
                  ["Seuil de réussite", "80 / 100"],
                  ["Statut", "Validé"],
                  ["Date de finalisation", proof.date],
                  ["Heure de finalisation", `${proof.time} Europe/Paris`],
                ].map(([label, value]) => (
                  <tr key={label} className="border-t border-slate-200 first:border-t-0">
                    <th className="px-3 py-2 font-medium text-slate-600 w-1/2">{label}</th>
                    <td className="px-3 py-2 font-semibold">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-sm font-semibold">Résultat : parcours validé</div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-bold tracking-widest text-blue-700">04 — Traçabilité</h3>
            <p className="text-left text-sm leading-relaxed">
              Attestation générée automatiquement par ConformAI à partir des données de suivi enregistrées.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 text-sm">
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-slate-500">Identifiant unique</div>
                  <div className="font-mono text-xs">{certificateId}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Empreinte documentaire</div>
                  <div className="font-mono text-xs break-all">{hash}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Émise le</div>
                  <div>{issuedAt}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Version du parcours</div>
                  <div>{CURRICULUM_LABEL}</div>
                </div>
              </div>
              <FakeQr />
            </div>
          </section>

          <footer className="border-t border-slate-200 pt-6 space-y-3 text-sm">
            <div>
              <div className="font-semibold">ConformAI</div>
              <div className="text-slate-600">
                {specimen ? "Émetteur — spécimen de démonstration" : "Émetteur — attestation de suivi"}
              </div>
            </div>
            <p className="text-left text-xs text-slate-500 leading-relaxed">
              Ce document constitue un justificatif de suivi délivré à l&apos;entreprise pour documenter sa démarche de maîtrise de l&apos;IA. Il ne constitue ni une certification officielle de conformité à l&apos;AI Act ou au RGPD, ni une certification délivrée par l&apos;Union européenne.
            </p>
            <div className="text-xs text-slate-500">
              Référence {certificateId} · Document {hash.slice(-8)}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
