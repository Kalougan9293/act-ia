import { allChapterIds } from "@/lib/formation/curriculum";

export type FormationProgress = {
  introDone: boolean;
  /** Test de positionnement (non éliminatoire). N'entre pas dans la validation. */
  positioningDone: boolean;
  positioningScore: number | null;
  completedChapters: string[];
  companyModuleDone: boolean;
  quizScore: number | null;
  quizPassed: boolean;
  quizAttempts: number;
  careerPathId: string | null;
};

export const CURRICULUM_VERSION = "V1.0";
export const CURRICULUM_LABEL = "V1.0";

export function emptyProgress(): FormationProgress {
  return {
    introDone: false,
    positioningDone: false,
    positioningScore: null,
    completedChapters: [],
    companyModuleDone: false,
    quizScore: null,
    quizPassed: false,
    quizAttempts: 0,
    careerPathId: null,
  };
}

/**
 * Avancement RH / barre : socle + examen uniquement.
 * Module entreprise et parcours métier viennent après, sans bloquer le 100 %.
 */
export function computeFormationPercent(progress: FormationProgress): number {
  const chapters = allChapterIds();
  const totalChapters = chapters.length;
  if (totalChapters === 0) return 0;

  if (progress.quizPassed) {
    const allChaptersDone = chapters.every((id) => progress.completedChapters.includes(id));
    if (progress.introDone && allChaptersDone) return 100;
  }

  const totalSteps = 1 + totalChapters + 1;
  const doneSteps =
    Number(progress.introDone) +
    progress.completedChapters.length +
    Number(progress.quizPassed);
  return Math.min(99, Math.round((doneSteps / totalSteps) * 100));
}

/** Attestation : socle + QCM ≥ 80 % + module entreprise + parcours métier */
export function isFormationComplete(progress: FormationProgress): boolean {
  const chapters = allChapterIds();
  const allChaptersDone = chapters.every((id) => progress.completedChapters.includes(id));
  return (
    progress.introDone &&
    allChaptersDone &&
    progress.companyModuleDone &&
    progress.quizPassed &&
    !!progress.careerPathId
  );
}

/** Identifiant attestation : CONF-YYYY-XXXXX */
export function createCertificateId(seed?: string): string {
  const year = new Date().getFullYear();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let serial = "";
  if (seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    for (let i = 0; i < 5; i++) {
      serial += alphabet[(h + i * 17) % alphabet.length]!;
      h = (h * 1103515245 + 12345) >>> 0;
    }
  } else {
    const bytes = crypto.getRandomValues(new Uint8Array(5));
    serial = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  }
  return `CONF-${year}-${serial}`;
}

function formatInZone(iso: string, timeZone: string): { date: string; time: string } | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return {
    date: d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone,
    }),
    time: d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    }),
  };
}

export function formatProofDate(iso: string): { date: string; time: string } {
  return formatInZone(iso, "Europe/Paris") ?? { date: iso.slice(0, 10), time: "—" };
}

export function formatProofDateUtc(iso: string): { date: string; time: string } {
  return formatInZone(iso, "UTC") ?? { date: iso.slice(0, 10), time: "—" };
}

/** Empreinte affichée sur l'attestation — même formule que l'aperçu RH. */
export function certificateFingerprint(serial: string): string {
  return `a9f3c1${serial.toLowerCase()}8e42b7d0`;
}
