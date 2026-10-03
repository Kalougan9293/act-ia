import { allChapterIds } from "@/lib/formation/curriculum";

export type FormationProgress = {
  introDone: boolean;
  completedChapters: string[];
  companyModuleDone: boolean;
  quizScore: number | null;
  quizPassed: boolean;
  careerPathId: string | null;
};

export const CURRICULUM_VERSION = "CDC-V2.6";

export function emptyProgress(): FormationProgress {
  return {
    introDone: false,
    completedChapters: [],
    companyModuleDone: false,
    quizScore: null,
    quizPassed: false,
    careerPathId: null,
  };
}

export function computeFormationPercent(progress: FormationProgress): number {
  const totalChapters = allChapterIds().length;
  const doneChapters = progress.completedChapters.length;
  const totalSteps = 1 + totalChapters + 1 + 1 + 1;
  const doneSteps =
    Number(progress.introDone) +
    doneChapters +
    Number(progress.companyModuleDone) +
    Number(progress.quizPassed) +
    Number(!!progress.careerPathId);
  return Math.round((doneSteps / totalSteps) * 100);
}

/** Parcours validé = socle + QCM ≥ 80 % + parcours métier */
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

export function formatProofDate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { date: iso.slice(0, 10), time: "—" };
  }
  const date = d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Paris",
  });
  const time = d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
  return { date, time };
}
