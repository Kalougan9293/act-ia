/** Contenu pédagogique Layer 1 — ConformAI. L'accueil lit les blocs ; les activités sont dans le socle. */

import { BLOCKS as SOCLE_BLOCKS, SEVEN_REFLEXES } from "@/lib/formation/socle";

export type { Activity, Chapter, Block } from "@/lib/formation/activity";

export const BLOCKS = SOCLE_BLOCKS;
export { SEVEN_REFLEXES };

export const FORMATION_PROMISE =
  "Une formation pour acquérir les réflexes essentiels d'utilisation responsable de l'IA au travail et contribuer à la démarche de maîtrise de l'IA (AI literacy) de votre entreprise.";

/** Parcours complet ≈ 1 h 00 (plusieurs sessions possibles). */
export const SOCLE_DURATION_LABEL = "1h00";
export const FULL_PATH_DURATION_LABEL = "1h00";

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
