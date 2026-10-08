/** Contenu pédagogique Layer 1 — ConformAI. L'accueil lit les blocs ; les activités sont dans le socle. */

import {
  BLOCKS as SOCLE_BLOCKS,
  REFLEXES_AFTER,
  REFLEXES_BEFORE,
  SEVEN_REFLEXES,
} from "@/lib/formation/socle";

export type { Activity, Chapter, Block } from "@/lib/formation/activity";

export const BLOCKS = SOCLE_BLOCKS;
export { SEVEN_REFLEXES, REFLEXES_BEFORE, REFLEXES_AFTER };

export const FORMATION_PROMISE =
  "Des réflexes concrets pour utiliser l'IA sans vous faire piéger — ni mettre l'entreprise en danger. La loi le demande aussi (AI Act, Art. 4). Une attestation de suivi à la fin.";

/** Parcours complet : max 1h30 (plusieurs sessions possibles). */
export const SOCLE_DURATION_LABEL = "max 1h30";
export const FULL_PATH_DURATION_LABEL = "max 1h30";

export const AI_ACT_MILESTONES = [
  {
    date: "2 février 2025",
    label: "Article 4 et pratiques interdites",
    detail: "Maîtrise de l'IA (Art. 4) et pratiques interdites (Art. 5).",
  },
  {
    date: "2 août 2025",
    label: "Modèles à usage général",
    detail: "Règles pour les modèles d'IA à usage général, gouvernance et sanctions.",
  },
  {
    date: "2 août 2026",
    label: "Article 50 — transparence",
    detail: "Chatbots, deepfakes, contenus générés. Les obligations varient selon le cas.",
  },
  {
    date: "2 décembre 2026",
    label: "Nouvelle interdiction",
    detail: "Contenus intimes ou sexuels non consentis, contenus pédocriminels.",
  },
  {
    date: "2 décembre 2027",
    label: "Haut risque (Annexe III)",
    detail: "Dont le recrutement et la gestion RH.",
  },
  {
    date: "2 août 2028",
    label: "Haut risque (Annexe I)",
    detail: "IA intégrée dans des produits réglementés.",
  },
] as const;

export function allChapterIds(): string[] {
  return BLOCKS.flatMap((block) => block.chapters.map((chapter) => chapter.id));
}

export function findChapter(chapterId: string) {
  for (const block of BLOCKS) {
    const index = block.chapters.findIndex((chapter) => chapter.id === chapterId);
    if (index >= 0) return { block, chapter: block.chapters[index]!, index };
  }
  return null;
}
