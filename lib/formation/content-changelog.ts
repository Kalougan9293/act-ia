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
    at: "2026-11-05",
    version: "V1.0",
    summary:
      "Ajouts pédagogiques : jeu « J'envoie ou je corrige ? » (3.5, fenêtre de chat) et jeu de label « Généré par l'IA » (5.4). Renumerotation 3.5→3.8.",
  },
  {
    at: "2026-10-23",
    version: "V1.0",
    summary:
      "Socle V1.0 publié : 6 blocs, positionnement, QCM final (seuil 80 %), durée pédagogique fixée à 1 h 15, relevés de connexion, satisfaction à chaud et fiche programme.",
  },
  {
    at: "2026-11-02",
    version: "V1.0",
    summary:
      "V1 produit figée : espaces RH / partenaire (tutoriels, KPI, liens), synthèse Article 4 & badges, wording Qualiopi partenaire, pilotage sièges et exports preuves.",
  },
  {
    at: "2026-11-02",
    version: "V1.0",
    summary:
      "Alignement juridique avocat : Art. 4 « favoriser le développement de la maîtrise » (Omnibus 2026/1744), nuance sanctions Art. 4, jalons deepfakes / haut risque / annexe I, réserve classification RH.",
  },
];
