/**
 * Veille tracée — historique daté des mises à jour du contenu pédagogique.
 * À compléter à chaque modification substantielle du socle / QCM / parcours.
 */

export type ContentChange = {
  /** Date ISO (jour) */
  at: string;
  version: string;
  summary: string;
};

export const CONTENT_CHANGELOG: ContentChange[] = [
  {
    at: "2026-10-23",
    version: "V1.0",
    summary:
      "Socle V1.0 publié : 6 blocs, positionnement, QCM final (seuil 80 %), durée pédagogique fixée à 1 h 15, relevés de connexion, satisfaction à chaud et fiche programme.",
  },
];
