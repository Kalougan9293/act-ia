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
  "Des réflexes concrets, les bases de l'AI Act (art. 4) et du RGPD, et une attestation de suivi à la fin.";

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
    label: "AI Act — article 4 et pratiques interdites",
    detail:
      "Mesures pour favoriser le développement de la maîtrise de l'IA (AI Act, art. 4, précisé par l'Omnibus 2026/1744) et pratiques interdites (AI Act, art. 5).",
  },
  {
    date: "2 août 2025",
    label: "AI Act — modèles à usage général",
    detail:
      "Obligations AI Act relatives aux modèles d'IA à usage général (GPAI) et certaines dispositions de gouvernance.",
  },
  {
    date: "2 août 2026",
    label: "AI Act, article 50 — transparence",
    detail:
      "Obligations de transparence de l'AI Act (chatbots, certains contenus synthétiques). Les obligations varient selon le cas.",
  },
  {
    date: "2 décembre 2026",
    label: "AI Act — interdictions contenus illicites",
    detail:
      "Certaines interdictions spécifiques de l'AI Act (ex. contenus intimes non consentis) — distinctes des obligations générales de transparence (AI Act, art. 50). En France, la diffusion sans consentement est déjà un délit (loi SREN).",
  },
  {
    date: "2 décembre 2027",
    label: "AI Act — haut risque (Annexe III)",
    detail:
      "Règles AI Act pour les systèmes concernés (dont emploi / recrutement selon finalité). Tous les outils RH ne sont pas automatiquement à haut risque. Le RGPD art. 22 s'applique déjà.",
  },
  {
    date: "2 août 2028",
    label: "AI Act — haut risque (art. 6 §1 / Annexe I)",
    detail:
      "Certaines catégories AI Act liées à des produits réglementés couverts par l'annexe I.",
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
