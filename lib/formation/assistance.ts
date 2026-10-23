/**
 * Modalités d'assistance FOAD (Code du travail) — référents nommés.
 * Une même personne peut cumuler les rôles pédagogique et technique
 * (cas courant en micro-entreprise), dès lors qu'elle est identifiée.
 */

export const ASSISTANCE = {
  referentPedagogique: {
    name: "Jonathan Seroussi",
    role: "Référent pédagogique",
    mission:
      "Questions sur le contenu du parcours, les objectifs, les évaluations et la progression.",
  },
  referentTechnique: {
    name: "Jonathan Seroussi",
    role: "Référent technique",
    mission:
      "Accès à la plateforme, connexions, bugs et dysfonctionnements techniques.",
  },
  email: "contact@lockin-web.online",
  phone: "06.62.28.86.56",
  phoneHref: "tel:+33662288656",
  /** Délai de réponse annoncé aux apprenants et au client. */
  responseDelay: "sous 48 heures ouvrées",
  responseDelayShort: "48 h ouvrées",
  /** Activités à distance et durée moyenne (socle). */
  remoteActivities:
    "Parcours asynchrone en ligne (vidéos, textes, activités interactives, quiz).",
  averageDuration: "1 h 15",
  evaluation:
    "Évaluation finale par QCM (seuil de réussite 80 / 100). Positionnement non éliminatoire en début de parcours. Attestation nominative de suivi à la validation.",
} as const;
