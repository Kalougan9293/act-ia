/** Contenu pédagogique Layer 1 — LockinIA. L'accueil lit les blocs ; les activités sont dans le socle. */

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
export const SOCLE_DURATION_LABEL = "1 h 15";
export const FULL_PATH_DURATION_LABEL = "1 h 15";
/** Equivalent décimal pour volumes d'heures (rapports RH). */
export const SOCLE_DURATION_HOURS = 1.25;

/** Intitulé officiel du parcours, aligné attestation PDF / aperçu. */
export const ATTESTATION_COURSE_TITLE =
  "Sensibilisation à la maîtrise de l'IA et aux bons usages des données au travail";

export const AI_ACT_MILESTONES = [
  {
    date: "2 février 2025",
    label: "Article 4 et pratiques interdites",
    detail:
      "Mesures pour favoriser le développement de la maîtrise de l'IA (Art. 4, précisé par l'Omnibus 2026/1744) et pratiques interdites (Art. 5).",
  },
  {
    date: "2 août 2025",
    label: "Modèles à usage général",
    detail:
      "Obligations relatives aux modèles d'IA à usage général (GPAI) et certaines dispositions de gouvernance.",
  },
  {
    date: "2 août 2026",
    label: "Article 50 — transparence",
    detail:
      "Obligations de transparence (chatbots, certains contenus synthétiques). Les obligations varient selon le cas.",
  },
  {
    date: "2 décembre 2026",
    label: "Interdictions contenus illicites",
    detail:
      "Certaines interdictions spécifiques (ex. contenus intimes non consentis) — distinctes des obligations générales de transparence (Art. 50). En France, la diffusion sans consentement est déjà un délit (loi SREN).",
  },
  {
    date: "2 décembre 2027",
    label: "Haut risque (Annexe III)",
    detail:
      "Règles pour les systèmes concernés (dont emploi / recrutement selon finalité). Tous les outils RH ne sont pas automatiquement à haut risque. Le RGPD art. 22 s'applique déjà.",
  },
  {
    date: "2 août 2028",
    label: "Haut risque (Art. 6 §1 / Annexe I)",
    detail:
      "Certaines catégories liées à des produits réglementés couverts par l'annexe I.",
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
