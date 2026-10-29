"use client";

import { Download, X } from "lucide-react";
import type { PlatformUser, Structure } from "@/lib/admin/types";
import { formatDate } from "@/lib/admin/format";
import { downloadLearnerAttestation } from "@/lib/export/attestations";
import {
  ATTESTATION_HEADER_TAGLINE,
  ATTESTATION_ISSUER,
} from "@/lib/formation/attestation-issuer";
import { formatDurationSec, formatProofDate } from "@/lib/formation/proof";
import { SOCLE_DURATION_LABEL } from "@/lib/formation/curriculum";

export default function AdminCertificatePreview({
  user,
  structure,
  onClose,
}: {
  user: PlatformUser;
  structure: Structure | null;
  onClose: () => void;
}) {
  const certificateId = user.certificateId ?? "—";
  const score = user.quizScore ?? 0;
  const companyName =
    structure?.billing.companyName ?? structure?.name ?? "—";
  const issuedAt = user.certifiedAt
    ? `${formatDate(user.certifiedAt)} à 10:00 (Europe/Paris)`
    : "—";
  const proofStamp = user.certifiedAt
    ? formatProofDate(user.certifiedAt)
    : { date: formatDate(new Date().toISOString()), time: "10:00" };
  const canDownload = Boolean(user.certificateId);

  function download() {
    if (!user.certificateId) return;
    downloadLearnerAttestation({
      fullName: user.name,
      companyName,
      certificateId: user.certificateId,
      quizScore: score,
      issuedAt: user.certifiedAt,
      dateLabel: proofStamp.date,
      timeLabel: proofStamp.time,
      specimen: false,
      timeSpentSec: user.attestationTimeSpentSec,
      modulesCompleted: user.attestationModulesCompleted,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/60 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white text-slate-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {canDownload ? (
            <button
              type="button"
              onClick={download}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Download className="h-3.5 w-3.5" />
              Télécharger PDF
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900"
            aria-label="Fermer l'attestation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-8 px-8 py-10 sm:px-12">
          <header className="space-y-2 border-b border-slate-200 pb-6 text-center">
            <div className="text-sm font-bold tracking-[0.25em] text-blue-600">
              LockinIA
            </div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Attestation de suivi de formation et de sensibilisation
            </h2>
            <p className="text-center text-sm text-slate-600">
              {ATTESTATION_HEADER_TAGLINE}
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 pt-2 text-xs text-slate-500">
              <span>Attestation n° {certificateId}</span>
              <span>Version 1.0</span>
            </div>
          </header>

          <section className="space-y-3 text-center">
            <h3 className="text-xs font-bold tracking-widest text-blue-700">
              01 — Bénéficiaire
            </h3>
            <p className="text-lg font-semibold">{user.name}</p>
            <p className="text-sm text-slate-600">{companyName}</p>
          </section>

          <section className="space-y-3 text-center">
            <h3 className="text-xs font-bold tracking-widest text-blue-700">
              02 — Validation
            </h3>
            <p className="text-sm text-slate-700">
              Résultat de l&apos;évaluation :{" "}
              <span className="font-semibold">{score} / 100 — Réussite</span>
            </p>
            <p className="text-sm text-slate-700">
              Durée pédagogique prévue (socle) : {SOCLE_DURATION_LABEL}
            </p>
            {user.attestationTimeSpentSec != null &&
            user.attestationTimeSpentSec > 0 ? (
              <p className="text-sm text-slate-700">
                Temps de connexion enregistré :{" "}
                <span className="font-semibold">
                  {formatDurationSec(user.attestationTimeSpentSec)}
                </span>
              </p>
            ) : null}
            {user.attestationModulesCompleted != null &&
            user.attestationModulesCompleted > 0 ? (
              <p className="text-sm text-slate-700">
                Modules / étapes validés :{" "}
                <span className="font-semibold">
                  {user.attestationModulesCompleted}
                </span>
              </p>
            ) : null}
            <p className="text-sm text-slate-700">Délivrée le {issuedAt}</p>
          </section>

          <footer className="flex flex-col items-center gap-3 border-t border-slate-200 pt-6">
            <p className="max-w-md text-center text-xs text-slate-500">
              {ATTESTATION_ISSUER.brand} — {ATTESTATION_ISSUER.legalName} · SIRET{" "}
              {ATTESTATION_ISSUER.siret}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
