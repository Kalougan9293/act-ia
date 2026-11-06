import type { IssuedCertificate } from "@/lib/firebase/formation-progress";

/**
 * Compte témoin exclusif — démo commerciale.
 * Cadenas ouverts sauf chapitres listés ci-dessous ; AUCUNE validation syncée (local only).
 * Ne jamais élargir cette liste sans revue produit.
 */
const WITNESS_DEMO_EMAILS = new Set(["c@gmail.com"]);

/** Chapitres visibles mais verrouillés (démo clients) — c@gmail.com uniquement. */
export const WITNESS_LOCKED_CHAPTER_IDS = [
  "1.2",
  "1.5",
  "1.6",
  "1.7",
  "2.1",
  "2.2",
  "2.3",
  "2.5",
  "3.1",
  "3.4",
  "3.6",
  "3.7",
  "3.8",
  "4.1",
  "4.2",
  "4.3",
  "4.4",
  "4.6",
  "5.2",
  "5.3",
  "6.1",
  "6.2",
] as const;

/** Chapitres masqués (démo clients) — c@gmail.com uniquement. */
export const WITNESS_HIDDEN_CHAPTER_IDS = [] as const;

const WITNESS_LOCKED_CHAPTER_SET = new Set<string>(WITNESS_LOCKED_CHAPTER_IDS);
const WITNESS_HIDDEN_CHAPTER_SET = new Set<string>(WITNESS_HIDDEN_CHAPTER_IDS);

/** Attestation figée — affichage local uniquement, jamais écrite en base. */
const WITNESS_SPECIMEN_CERTIFICATE: IssuedCertificate = {
  id: "CAI-2026-WITNESS-0001",
  issuedAt: "2026-10-15T14:30:00.000Z",
  quizScore: 92,
  careerPathId: null,
  timeSpentSec: 78 * 60,
  modulesCompleted: 18,
};

export function isWitnessDemoAccount(email: string | null | undefined): boolean {
  if (!email) return false;
  return WITNESS_DEMO_EMAILS.has(email.trim().toLowerCase());
}

/** Chapitre volontairement verrouillé sur le compte témoin (visible, non accessible). */
export function isWitnessLockedChapter(chapterId: string): boolean {
  return WITNESS_LOCKED_CHAPTER_SET.has(chapterId);
}

/** Chapitre masqué sur le compte témoin (absent de la grille). */
export function isWitnessHiddenChapter(chapterId: string): boolean {
  return WITNESS_HIDDEN_CHAPTER_SET.has(chapterId);
}

/** Attestation de démo pour l’espace témoin (spécimen local). */
export function witnessDemoCertificate(): IssuedCertificate {
  return { ...WITNESS_SPECIMEN_CERTIFICATE };
}
