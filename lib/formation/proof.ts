import { allChapterIds } from "@/lib/formation/curriculum";

/** Résultat horodaté d'un module / étape (export Qualiopi / FOAD). */
export type ModuleResult = {
  id: string;
  label: string;
  kind: "intro" | "positioning" | "chapter" | "company" | "quiz" | "career";
  completedAt: string;
  score: number | null;
};

/** Session de connexion / présence sur le parcours à distance. */
export type ConnectionSession = {
  id: string;
  startedAt: string;
  endedAt: string;
  durationSec: number;
};

export type SatisfactionFeedback = {
  rating: number;
  comment: string;
  complaint: string;
  submittedAt: string;
};

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
  /** Dates + scores par module (complète completedChapters). */
  moduleResults: ModuleResult[];
  /** Relevés de connexion (sessions). */
  sessions: ConnectionSession[];
  /** Temps cumulé mesuré sur la plateforme (secondes). */
  totalTimeSpentSec: number;
  /** Questionnaire de satisfaction à chaud (+ réclamation éventuelle). */
  satisfaction: SatisfactionFeedback | null;
};

export const CURRICULUM_VERSION = "V1.0";
export const CURRICULUM_LABEL = "V1.0";
const MAX_SESSIONS = 200;

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
    moduleResults: [],
    sessions: [],
    totalTimeSpentSec: 0,
    satisfaction: null,
  };
}

export function upsertModuleResult(
  progress: FormationProgress,
  result: ModuleResult,
): FormationProgress {
  const moduleResults = [
    ...progress.moduleResults.filter((row) => row.id !== result.id),
    result,
  ].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  return { ...progress, moduleResults };
}

/** Met à jour une session en cours ; n'ajoute au total que le delta de durée. */
export function upsertConnectionSession(
  progress: FormationProgress,
  session: ConnectionSession,
): FormationProgress {
  const prev = progress.sessions.find((row) => row.id === session.id);
  const delta = Math.max(0, session.durationSec - (prev?.durationSec ?? 0));
  const sessions = [
    ...progress.sessions.filter((row) => row.id !== session.id),
    session,
  ]
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
    .slice(-MAX_SESSIONS);
  return {
    ...progress,
    sessions,
    totalTimeSpentSec: progress.totalTimeSpentSec + delta,
  };
}

export function formatDurationSec(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h} h ${String(m).padStart(2, "0")} min`;
  if (m > 0) return `${m} min ${String(s).padStart(2, "0")} s`;
  return `${s} s`;
}

/**
 * Avancement RH / barre : socle + examen uniquement.
 * Module entreprise et fiche métier viennent après, sans bloquer le 100 %.
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

/** Attestation de suivi AI Act (Art. 4) : socle + QCM ≥ 80 %. Entreprise / métier optionnels. */
export function isFormationComplete(progress: FormationProgress): boolean {
  const chapters = allChapterIds();
  const allChaptersDone = chapters.every((id) => progress.completedChapters.includes(id));
  return progress.introDone && allChaptersDone && progress.quizPassed;
}

/** Préfixe StartIA. Les ids historiques CONF-YYYY-XXXXX restent valides en lecture. */
export const CERTIFICATE_ID_PREFIX = "SIA";

/** Identifiant attestation : SIA-YYYY-XXXXX */
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
  return `${CERTIFICATE_ID_PREFIX}-${year}-${serial}`;
}

/** Extrait le serial d'un id SIA-…, CONF-… ou REG-SIA-/REG-CONF-… */
export function certificateSerialFromId(id: string): string {
  const cleaned = id.replace(/^REG-/, "");
  const match = cleaned.match(/^(?:SIA|CONF)-\d+-(.+)$/i);
  return match?.[1] ?? cleaned;
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
