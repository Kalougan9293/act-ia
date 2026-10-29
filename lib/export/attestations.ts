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
import {
  buildCompanyArticle4Pdf,
  buildLearnerAttestationPdf,
} from "@/lib/export/attestation-pdf";
import { downloadBytes, slug } from "@/lib/export/proof-zip";
import type { Article4ReportRecord } from "@/lib/admin/types";

/** Durée pédagogique du socle (heures), reprise sur l'attestation / registre. */
export const TRAINING_HOURS_EACH = SOCLE_DURATION_HOURS;

export type LearnerAttestationInput = {
  fullName: string;
  /** Conservé pour compat ; non affiché sur l'attestation. */
  role?: string;
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

/** Construit / met à jour l'enregistrement stocké sur la structure. */
export function nextArticle4ReportRecord(params: {
  previous: Article4ReportRecord | null | undefined;
  employees: Employee[];
  registryId: string;
  /** true = export PDF (incrémente version) */
  forExport: boolean;
}): Article4ReportRecord {
  const stats = companyTrainingStats(params.employees);
  const complete = stats.total > 0 && stats.certified === stats.total;
  const now = new Date().toISOString();
  const fingerprint = certificateFingerprint(
    certificateSerialFromId(params.registryId),
  );
  const previous = params.previous ?? null;
  const first = previous?.firstIssuedAt ?? (complete ? now : null);

  return {
    firstIssuedAt: first,
    lastExportedAt: params.forExport ? now : (previous?.lastExportedAt ?? null),
    version: params.forExport
      ? Math.max(1, (previous?.version ?? 0) + 1)
      : Math.max(0, previous?.version ?? 0),
    fingerprint,
    trainedCount: stats.trained,
    certifiedCount: stats.certified,
    totalCount: stats.total,
    hours: stats.hours,
    status: complete ? "complete" : "preview",
  };
}

export function downloadCompanyReport(
  companyName: string,
  employees: Employee[],
  registryIdOverride?: string | null,
  report?: Article4ReportRecord | null,
) {
  const stats = companyTrainingStats(employees);
  const registryId =
    registryIdOverride?.trim() || registryIdForCompany(companyName);
  const serial = certificateSerialFromId(registryId);
  const hash = report?.fingerprint || certificateFingerprint(serial);
  const complete = stats.total > 0 && stats.certified === stats.total;
  const exportIso = report?.lastExportedAt || new Date().toISOString();
  const paris = formatProofDate(exportIso);
  const utc = formatProofDateUtc(exportIso);
  const firstIso = report?.firstIssuedAt;
  const firstParis = firstIso ? formatProofDate(firstIso) : null;

  downloadBytes(
    `synthese-suivi-article-4-${slug(companyName)}.pdf`,
    buildCompanyArticle4Pdf({
      companyName,
      registryId,
      fingerprint: hash,
      version: report?.version ?? 1,
      statusComplete: complete,
      trained: stats.trained,
      certified: stats.certified,
      total: stats.total,
      hours: stats.hours,
      durationLabel: SOCLE_DURATION_LABEL,
      issuedAtLabel: `${paris.date} à ${paris.time} (Europe/Paris)`,
      utcLabel: `${utc.date} à ${utc.time} UTC`,
      firstIssuedLabel: firstParis
        ? `${firstParis.date} à ${firstParis.time} (Europe/Paris)`
        : null,
      people: employees
        .filter(
          (employee) =>
            Boolean(employee.certificateId) && employee.percent >= 100,
        )
        .sort((a, b) => a.name.localeCompare(b.name, "fr"))
        .map((employee) => {
          const when = employee.certifiedAt
            ? formatProofDate(employee.certifiedAt)
            : null;
          return {
            name: employee.name,
            certificateId: employee.certificateId ?? null,
            certifiedAtLabel: when
              ? `${when.date} à ${when.time} (Europe/Paris)`
              : null,
            quizScore: employee.quizScore ?? null,
            complete: true,
          };
        }),
      pendingCount: Math.max(0, stats.total - stats.certified),
    }),
    "application/pdf",
  );
}
