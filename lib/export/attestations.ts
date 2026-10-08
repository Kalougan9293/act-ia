import type { Employee } from "@/components/demo/data";
import {
  certificateFingerprint,
  createCertificateId,
  CURRICULUM_LABEL,
  formatProofDate,
  formatProofDateUtc,
} from "@/lib/formation/proof";
import { buildSimplePdf, downloadBytes, slug } from "@/lib/export/proof-zip";

/** Durée pédagogique du socle, reprise sur l'attestation individuelle. */
export const TRAINING_HOURS_EACH = 1.5;

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
};

export function registryIdForCompany(companyName: string) {
  return `REG-${createCertificateId(companyName.trim().toLowerCase() || "entreprise")}`;
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
  const serial = input.certificateId.replace(/^CONF-\d+-/, "");
  const hash = certificateFingerprint(serial);
  const { paris, utc } = stampLines(input.issuedAt, input.dateLabel, input.timeLabel);
  const lines = [
    "CONFORMAI",
    "Attestation de suivi de formation et de sensibilisation",
    "Maîtrise de l'IA — Article 4 (AI Act) et RGPD",
    "",
    `Attestation n° ${input.certificateId}`,
    `Version ${CURRICULUM_LABEL}`,
    input.specimen ? "Spécimen de démonstration" : "Attestation de suivi",
    "",
    "01 — Bénéficiaire",
    `Prénom : ${first}`,
    `Nom : ${last}`,
    `Fonction : ${input.role || "Collaborateur"}`,
    `Entreprise : ${input.companyName}`,
    "",
    "02 — Parcours suivi",
    "Sensibilisation à la littératie en intelligence artificielle et bonnes pratiques de protection des données.",
    "Référentiel : EU AI Act (AI literacy, article 4) et RGPD.",
    "",
    "03 — Validation",
    "Durée pédagogique prévue : max 1 h 30",
    "Parcours complété : 100 %",
    `Évaluation finale : ${input.quizScore} / 100`,
    "Seuil de réussite : 80 / 100",
    "Statut : Validé",
    `Date de finalisation (Europe/Paris) : ${paris.date}`,
    `Heure de finalisation (Europe/Paris) : ${paris.time}`,
    utc ? `Horodatage UTC : ${utc.date} à ${utc.time} UTC` : "Horodatage UTC : —",
    "",
    "04 — Traçabilité",
    `Identifiant : ${input.certificateId}`,
    `Empreinte documentaire : ${hash}`,
    `Émise le : ${paris.date} à ${paris.time} (Europe/Paris)`,
    "",
    "Ce document est un justificatif de suivi délivré pour documenter la démarche de maîtrise de l'IA.",
    "Il ne constitue ni une certification officielle de conformité à l'AI Act ou au RGPD, ni une certification de l'Union européenne.",
  ];

  downloadBytes(
    `attestation-${slug(input.certificateId)}.pdf`,
    buildSimplePdf(lines),
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

export function downloadCompanyReport(companyName: string, employees: Employee[]) {
  const stats = companyTrainingStats(employees);
  const issuedAt = new Date().toISOString();
  const paris = formatProofDate(issuedAt);
  const utc = formatProofDateUtc(issuedAt);
  const registryId = registryIdForCompany(companyName);
  const serial = registryId.replace(/^REG-CONF-\d+-/, "");
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
    "CONFORMAI",
    "Rapport d'engagement et de conformité — Article 4",
    "Attestations de suivi · AI Act (article 4) et RGPD",
    "",
    `Raison sociale : ${companyName}`,
    `Identifiant registre : ${registryId}`,
    `Empreinte : ${hash}`,
    `Émis le : ${paris.date} à ${paris.time} (Europe/Paris)`,
    `Horodatage UTC : ${utc.date} à ${utc.time} UTC`,
    `Statut du registre : ${complete ? "À jour — chaque collaborateur actif a une attestation" : "En cours"}`,
    "",
    "Synthèse",
    `Collaborateurs actifs : ${stats.total}`,
    `Parcours validés à 100 % : ${stats.trained}/${stats.total} (${stats.rate} %)`,
    `Attestations de suivi émises : ${stats.certified}`,
    `Volume d'heures : ${stats.hours} h`,
    "Durée pédagogique comptée : max 1 h 30 par collaborateur au parcours validé (100 %).",
    "",
    "Récapitulatif horodaté — archive audit",
    ...(people.length ? people : ["Aucun collaborateur."]),
    "",
    "Document émis par ConformAI et conservé dans le registre de suivi.",
    "Il consigne les attestations de suivi des collaborateurs.",
    "Il ne certifie pas l'entreprise et ne constitue pas un conseil juridique.",
  ];

  downloadBytes(
    `rapport-article-4-${slug(companyName)}.pdf`,
    buildSimplePdf(lines),
    "application/pdf",
  );
}
