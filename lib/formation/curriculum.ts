/** Contenu pédagogique Layer 1 — StartIA. L'accueil lit les blocs ; les activités sont dans le socle. */

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
  "Des réflexes concrets pour utiliser l'IA sans vous faire piéger ni mettre l'entreprise en danger — AI Act (art. 4) et bases du RGPD —, avec une attestation de suivi à la fin.";

/** Durée pédagogique du socle (examen compris), reprise partout y compris sur l'attestation. */
export const SOCLE_DURATION_LABEL = "1 h 00";
export const FULL_PATH_DURATION_LABEL = "1 h 00";

/** Intitulé officiel du parcours, aligné attestation PDF / aperçu. */
export const ATTESTATION_COURSE_TITLE =
  "Sensibilisation à la maîtrise de l'IA et aux bons usages des données au travail";

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
    label: "Deepfakes intimes — interdits",
    detail: "Toujours l'Art. 5 : contenus intimes non consentis et contenus pédocriminels.",
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
