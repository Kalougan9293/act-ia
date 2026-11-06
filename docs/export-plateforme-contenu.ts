/**
 * Export du contenu plateforme LockinIA HORS parcours apprenant (socle/métiers/QCM).
 * Pour revue juriste / formateur / produit.
 */
import { writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { faqs } from "../lib/landing/faq";
import { PROGRAMME } from "../lib/formation/programme";
import { ASSISTANCE } from "../lib/formation/assistance";
import { AI_ACT_MILESTONES, FORMATION_PROMISE } from "../lib/formation/curriculum";
import { BOOKING_INTERESTS } from "../lib/booking/interests";

function stripTsxToText(src: string): string {
  return src
    .replace(/import[\s\S]*?from\s+["'][^"']+["'];?\s*/g, "")
    .replace(/export\s+const\s+metadata[\s\S]*?;\s*/g, "")
    .replace(/export\s+default\s+function[\s\S]*?\{/, "")
    .replace(/<\/?[A-Za-z][^>]*>/g, " ")
    .replace(/\{`([\s\S]*?)`\}/g, "$1")
    .replace(/\{["']([^"']*)["']\}/g, "$1")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\{\s*['"`]([^'"`]+)['"`]\s*\}/g, "$1")
    .replace(/\{[^}]+\}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readLegalRough(slug: string): string {
  try {
    const path = resolve(process.cwd(), `app/${slug}/page.tsx`);
    return stripTsxToText(readFileSync(path, "utf8")).slice(0, 12000);
  } catch {
    return "";
  }
}

const pricing = {
  plans: [
    {
      name: "Micro",
      seats: "1 à 5 salariés",
      price: "390 € / an",
      features: [
        "Jusqu'à 5 accès utilisateurs",
        "Abonnement annuel, sans frais cachés",
        "Socle commun et fiches métiers incluses",
        "Module entreprise (charte, outils, référent)",
        "Attestations nominatives",
        "Preuves (attestations + relevés) : année + 3 ans",
        "Tableau de bord RH, relevés de connexion et export",
        "Veille incluse : le parcours suit l'actualité",
        "Renouvellement : nouveaux arrivants + mises à jour",
        "Référents pédagogique & technique nommés (48 h)",
      ],
    },
    {
      name: "TPE",
      seats: "6 à 20 salariés",
      price: "790 € / an",
      features: [
        "Jusqu'à 20 accès utilisateurs",
        "Tout le plan Micro inclus",
        "Assistance prioritaire : réponse sous 24 h ouvrées",
      ],
    },
    {
      name: "PME",
      seats: "21 à 50 salariés",
      price: "1 290 € / an",
      features: ["Jusqu'à 50 accès utilisateurs", "Tout le plan TPE inclus"],
    },
    {
      name: "ETI",
      seats: "+50 salariés",
      price: "Sur devis",
      features: [
        "Plus de 50 accès",
        "Tout le plan PME inclus",
        "Intégrations sur devis",
        "Assistance dédiée",
      ],
    },
  ],
  options: [
    {
      name: "Module métier sur mesure",
      price: "690 € / module",
      detail:
        "Format standard : texte + cas pratique + idée d'usage, intégré au parcours. Demande plus large : sur devis.",
    },
    {
      name: "Atelier usages & automatisation",
      price: "Sur devis",
      detail:
        "Session visio ou présentiel : prioriser les usages, automatiser le répétitif. Hors abonnement.",
    },
    {
      name: "Marque blanche (OF)",
      price: "500 € (one-shot) + grille / apprenant",
      detail:
        "Tranches partenaires : 1–19 → 35 € ; 20–49 → 30 € ; 50–149 → 24 € ; 150–499 → 19 € ; 500+ sur devis. Co-branding inclus.",
    },
  ],
};

const payload = {
  meta: {
    title: "LockinIA — Plateforme & espaces (hors parcours apprenant)",
    purpose:
      "Document de revue pour juriste / formateur / produit. Décrit le site public, la prise de RDV, l'auth, l'espace RH, l'espace partenaire, la démo, les pages légales et les exports. Exclut le contenu pédagogique du parcours utilisateur (socle, fiches métiers, QCM) et l'espace super-admin.",
    promise: FORMATION_PROMISE,
    generatedAt: new Date().toISOString(),
    excluded: [
      "Contenu intégral du socle / chapitres / scripts / jeux",
      "Fiches métiers détaillées",
      "Banque QCM",
      "Espace super-admin (/admin)",
    ],
  },
  routes: [
    { path: "/", auth: "public", role: "—", label: "Landing marketing" },
    { path: "/interventions", auth: "public", role: "—", label: "Accompagnement IA" },
    { path: "/demo", auth: "public", role: "—", label: "Démo interactive RH + parcours" },
    { path: "/programme", auth: "public", role: "—", label: "Fiche programme formation" },
    { path: "/ai-act", auth: "public", role: "—", label: "Page pédagogique AI Act" },
    { path: "/connexion", auth: "public", role: "—", label: "Connexion / 1ʳᵉ connexion / reset MDP" },
    { path: "/rejoindre/[token]", auth: "public", role: "—", label: "Lien structure (RH → collabs)" },
    { path: "/invitation/[token]", auth: "public", role: "—", label: "Invitation tokenisée (legacy)" },
    { path: "/rh", auth: "required", role: "rh", label: "Espace RH" },
    { path: "/partenaire", auth: "required", role: "partner", label: "Espace partenaire OF" },
    { path: "/utilisateur", auth: "required", role: "employee|rh enrolled", label: "Parcours collaborateur (non détaillé ici)" },
    {
      path: "/cgu|/cgv|/dpa|/confidentialite|/cookies|/mentions-legales|/rgpd",
      auth: "public",
      role: "—",
      label: "Pages légales",
    },
  ],
  landing: {
    hero: {
      badge: "Formation Art. 4 · Données & bons usages",
      h1: "La plateforme clé en main pour attester la formation de vos salariés à l'IA et au RGPD en continu",
      ctas: ["Demander un accès", "Tester la démo"],
    },
    trust: [
      "Dossier de preuves",
      "Contenu expert",
      "Attestation de suivi",
      "Pilotage RH",
      "100 % en ligne",
      "Veille AI Act",
    ],
    sections: [
      "Problème (AI Act / Données / Charge RH)",
      "Fonctionnalités (salariés / entreprises / responsables métiers)",
      "Déploiement en 5 minutes",
      "Tarifs",
      "Aller plus loin (accompagnement)",
      "FAQ",
      "Footer légal",
    ],
    booking: {
      to: "contact@lockin-web.online",
      rules: "Créneaux mar–jeu 12h–18h Europe/Paris, au plus tôt J+2, pas de 30 min",
      interests: BOOKING_INTERESTS,
      fields: ["E-mail", "Société", "Objet", "Jour", "Horaire"],
      note: "Le lien visio est envoyé manuellement par LockinIA après réception du mail.",
    },
  },
  pricing,
  interventions: {
    title: "Accompagnement IA",
    pitch: "Ne testez pas l'IA. Faites-en un outil de travail.",
    offerings: ["Audit", "Formation", "Intégration", "Automatisation", "Canal IA"],
    ctas: ["Parlons de vos besoins", "Échanger sur mon projet"],
  },
  faq: faqs,
  programme: PROGRAMME,
  assistance: ASSISTANCE,
  milestones: AI_ACT_MILESTONES,
  auth: {
    modes: ["Connexion", "Première connexion (Activer mon compte)", "Mot de passe oublié"],
    passwordRules: ["8 caractères min.", "1 majuscule", "1 caractère spécial"],
    redirects: {
      partner: "/partenaire",
      rh: "/rh",
      employee: "/utilisateur",
      note: "Un RH peut aussi suivre la formation s'il est inscrit (formationEnrolled) → /utilisateur",
    },
    joinFlow: {
      path: "/rejoindre/[token]",
      description:
        "Lien permanent de la structure. Le collaborateur active son compte seulement si le RH a créé son accès (e-mail).",
    },
    inviteFlow: {
      path: "/invitation/[token]",
      description: "Flux alternatif d'invitation tokenisée (acceptInvite).",
    },
  },
  rh: {
    route: "/rh",
    title: "Pilotage RH",
    kpis: ["Inscrits", "En cours", "Terminés", "Limite (used/max)"],
    tableColumns: [
      "Collaborateur",
      "E-mail",
      "Avancement",
      "Avant/Après (positionnement → QCM)",
      "Avis",
      "Dernière connexion",
    ],
    actions: [
      "Ajouter un collaborateur (Prénom, Nom, E-mail) → Créer l'accès",
      "Copier le lien /rejoindre/{token}",
      "Supprimer un collaborateur / invite pending (confirmation)",
      "Ouvrir / éditer le Module entreprise",
      "Synthèse Article 4 (aperçu + PDF)",
      "Exporter le dossier de preuves (ZIP)",
      "Télécharger une attestation nominative si parcours validé (100 %)",
    ],
    seatsRule:
      "Un siège est consommé dès qu'une progression > 0 %. Il n'est libéré que si la progression est à 0 %.",
    companyModule: {
      title: "Module « Votre entreprise »",
      toggle: "Afficher aux collaborateurs",
      fields: [
        "Outils autorisés",
        "Charte / règles",
        "Référent IA & DPO / contacts",
        "Procédure de déclaration",
        "Précisions / interdits (texte libre)",
      ],
      registreColumns: [
        "Service",
        "Propriétaire",
        "Population concernée",
        "Outil",
        "Fournisseur",
        "Usage et finalité",
        "Données traitées",
        "Base légale RGPD",
        "Décision automatisée (art. 22)",
        "Qualification AI Act",
        "Justification",
        "AIPD",
        "DPA / éditeur",
        "Transferts",
      ],
      note: "Historique des révisions conservé. Visible dans le parcours collab si activé.",
    },
    article4: {
      title: "Synthèse de suivi — Article 4",
      outputs: [
        "PDF synthèse entreprise",
        "Badge web Suivi LockinIA (Discret / Normal / Visible) + HTML à copier",
        "Versionnement (firstIssuedAt, lastExportedAt, version, registryId)",
      ],
    },
    proofZip: [
      "dossier.json",
      "registre.json",
      "attestations.json",
      "releves-connexion.json",
      "resultats-modules.json",
      "historique.json",
      "dossier.pdf",
    ],
    notAvailable: ["Export CSV"],
  },
  partner: {
    route: "/partenaire",
    title: "Pilotage partenaire",
    kpis: ["Entreprises", "Inscrits", "En cours", "Terminés", "Limite (alloués / seatsMax)"],
    tableColumns: [
      "Entreprise",
      "Limite max (±1)",
      "Apprenants",
      "Terminés",
      "Sat. moy.",
      "RH",
      "Lien (copier)",
    ],
    actions: [
      "Créer une entreprise cliente (nom, limite, RH nom/e-mail, SIRET, téléphone)",
      "Ajuster les sièges de la structure (±1 sous plafond partenaire)",
      "Copier le lien /rejoindre de chaque entreprise",
      "Voir le suivi apprenants (lecture) et les avis",
    ],
    notAvailable: [
      "Module entreprise",
      "Export ZIP / PDF Art. 4",
      "Création / suppression de collaborateurs (délégué au RH client)",
      "Téléchargement d'attestations nominatives",
    ],
  },
  demo: {
    route: "/demo",
    description:
      "Sans compte : bascule Parcours | Espace RH. Données mock (ex. Atelier Lumière). Téléchargements PDF/ZIP désactivés.",
  },
  isolation: {
    roles: ["partner", "rh", "employee"],
    noteExcluded: "super_admin exclu de ce document",
    rules: [
      "RH : strictement limité à sa structureId",
      "Partenaire : strictement limité à son partnerId et aux structures rattachées",
      "Collaborateur : son parcours / sa progression",
      "Hébergement données formation : Firebase/Firestore UE (eur3) ; site Vercel (DPA / CCT)",
    ],
  },
  legalPages: Object.fromEntries(
    [
      "mentions-legales",
      "confidentialite",
      "cgu",
      "cgv",
      "dpa",
      "cookies",
      "rgpd",
      "ai-act",
    ].map((slug) => [slug, readLegalRough(slug)]),
  ),
};

const out = resolve(process.cwd(), "docs/plateforme-contenu.json");
writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");
console.log(`OK → ${out}`);
console.log(
  `FAQ ${faqs.length} · plans ${pricing.plans.length} · pages légales ${Object.keys(payload.legalPages).length}`,
);
