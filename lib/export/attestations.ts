import type { Employee } from "@/components/demo/data";
import {
  certificateFingerprint,
  certificateSerialFromId,
  createCertificateId,
  CURRICULUM_LABEL,
  formatDurationSec,
  formatProofDate,
  formatProofDateUtc,
} from "@/lib/formation/proof";
import {
  ATTESTATION_COURSE_TITLE,
  SOCLE_DURATION_HOURS,
  SOCLE_DURATION_LABEL,
} from "@/lib/formation/curriculum";
import { buildLearnerAttestationPdf } from "@/lib/export/attestation-pdf";
import { buildSimplePdf, downloadBytes, slug } from "@/lib/export/proof-zip";

/** Durée pédagogique du socle (heures), reprise sur l'attestation / registre. */
export const TRAINING_HOURS_EACH = SOCLE_DURATION_HOURS;

export type LearnerAttestationInput = {
  fullName: string;
  role: string;
  companyName: string;
  certificateId: string;
  quizScore: number;
  /** ISO. Sert au horodatage UTC. */
  issuedAt?: string | null;
  dateLabel: string;
  timeLabel: string;
  specimen?: boolean;
  /** Temps de connexion mesuré (secondes) — figé à l'émission. */
  timeSpentSec?: number | null;
  /** Nombre de modules / étapes validés. */
  modulesCompleted?: number | null;
};

/** Identifiant de suivi structure : REG-LIA-YYYY-XXXXX */
export function createRegistryId(seed?: string) {
  return `REG-${createCertificateId(seed)}`;
}

/** @deprecated Préférer createRegistryId / Structure.registryId (figé). Conservé pour rétrocompat. */
export function registryIdForCompany(companyName: string) {
  return createRegistryId(companyName.trim().toLowerCase() || "entreprise");
}

export function splitPersonName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? (fullName.trim() || "—");
  const last = parts.slice(1).join(" ") || "—";
  return { first, last };
}

function stampLines(issuedAt: string | null | undefined, dateLabel: string, timeLabel: string) {
  const paris =
    issuedAt && !Number.isNaN(new Date(issuedAt).getTime())
      ? formatProofDate(issuedAt)
      : { date: dateLabel, time: timeLabel };
  const utc =
    issuedAt && !Number.isNaN(new Date(issuedAt).getTime()) ? formatProofDateUtc(issuedAt) : null;
  return { paris, utc };
}

export function downloadLearnerAttestation(input: LearnerAttestationInput) {
  const { first, last } = splitPersonName(input.fullName);
  const serial = certificateSerialFromId(input.certificateId);
  const hash = certificateFingerprint(serial);
  const { paris, utc } = stampLines(input.issuedAt, input.dateLabel, input.timeLabel);

  downloadBytes(
    `attestation-${slug(input.certificateId)}.pdf`,
    buildLearnerAttestationPdf({
      first,
      last,
      role: input.role || "Collaborateur",
      companyName: input.companyName,
      certificateId: input.certificateId,
      curriculumLabel: CURRICULUM_LABEL,
      courseTitle: ATTESTATION_COURSE_TITLE,
      durationLabel: SOCLE_DURATION_LABEL,
      quizScore: input.quizScore,
      dateLabel: paris.date,
      timeLabel: paris.time,
      issuedAtLabel: `${paris.date} à ${paris.time} (Europe/Paris)`,
      utcLabel: utc ? `${utc.date} à ${utc.time} UTC` : null,
      hash,
      specimen: input.specimen,
      timeSpentLabel:
        input.timeSpentSec != null && input.timeSpentSec > 0
          ? formatDurationSec(input.timeSpentSec)
          : null,
      modulesCompletedLabel:
        input.modulesCompleted != null && input.modulesCompleted > 0
          ? String(input.modulesCompleted)
          : null,
    }),
    "application/pdf",
  );
}

export function companyTrainingStats(employees: Employee[]) {
  const total = employees.length;
  const trained = employees.filter((employee) => employee.percent >= 100).length;
  const certified = employees.filter((employee) => Boolean(employee.certificateId)).length;
  const rate = total === 0 ? 0 : Math.round((trained / total) * 100);
  return {
    total,
    trained,
    certified,
    rate,
    hours: trained * TRAINING_HOURS_EACH,
  };
}

export function downloadCompanyReport(
  companyName: string,
  employees: Employee[],
  registryIdOverride?: string | null,
) {
  const stats = companyTrainingStats(employees);
  const issuedAt = new Date().toISOString();
  const paris = formatProofDate(issuedAt);
  const utc = formatProofDateUtc(issuedAt);
  const registryId =
    registryIdOverride?.trim() || registryIdForCompany(companyName);
  const serial = certificateSerialFromId(registryId);
  const hash = certificateFingerprint(serial);
  const complete = stats.total > 0 && stats.certified === stats.total;

  const people = employees.map((employee) => {
    const when = employee.certifiedAt ? formatProofDate(employee.certifiedAt) : null;
    const whenUtc = employee.certifiedAt ? formatProofDateUtc(employee.certifiedAt) : null;
    const attestation = employee.certificateId ?? "sans attestation";
    const parisLabel = when ? `${when.date} ${when.time} Europe/Paris` : "—";
    const utcLabel = whenUtc ? `${whenUtc.date} ${whenUtc.time} UTC` : "—";
    return `${employee.name} — ${attestation} — ${parisLabel} — ${utcLabel} — score ${employee.quizScore ?? "—"}`;
  });

  const lines = [
    "LockinIA",
    "Rapport d'engagement et de suivi — Article 4",
    "Attestations de suivi · AI Act (article 4) et RGPD",
    "",
    `Raison sociale : ${companyName}`,
    `Identifiant suivi : ${registryId}`,
    `Empreinte : ${hash}`,
    `Émis le : ${paris.date} à ${paris.time} (Europe/Paris)`,
    `Horodatage UTC : ${utc.date} à ${utc.time} UTC`,
    `Statut du suivi : ${complete ? "À jour — chaque collaborateur actif a une attestation" : "En cours"}`,
    "",
    "Synthèse",
    `Collaborateurs actifs : ${stats.total}`,
    `Parcours validés à 100 % : ${stats.trained}/${stats.total} (${stats.rate} %)`,
    `Attestations de suivi émises : ${stats.certified}`,
    `Volume d'heures : ${stats.hours} h`,
    `Durée pédagogique comptée : ${SOCLE_DURATION_LABEL} par collaborateur au parcours validé (100 %).`,
    "",
    "Récapitulatif horodaté — archive audit",
    ...(people.length ? people : ["Aucun collaborateur."]),
    "",
    "Document émis par LockinIA et conservé dans le suivi des parcours.",
    "Il consigne les attestations de suivi des collaborateurs.",
    "Il ne certifie pas l'entreprise et ne constitue pas un conseil juridique.",
  ];

  downloadBytes(
    `rapport-article-4-${slug(companyName)}.pdf`,
    buildSimplePdf(lines),
    "application/pdf",
  );
}
