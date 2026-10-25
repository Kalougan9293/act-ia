import { BLOCKS, ATTESTATION_COURSE_TITLE, SOCLE_DURATION_LABEL } from "@/lib/formation/curriculum";
import { ASSISTANCE } from "@/lib/formation/assistance";
import { QUIZ_PASS_PERCENT } from "@/lib/formation/evaluation";

/** Fiche programme formelle — action de formation StartIA (socle). */
export const PROGRAMME = {
  intitule: ATTESTATION_COURSE_TITLE,
  version: "V1.0",
  modalite: "Formation à distance asynchrone (FOAD)",
  organisme: "FITOPS AI — plateforme StartIA",
  contact: ASSISTANCE.email,
  phone: ASSISTANCE.phone,
  statutQualiopi:
    "Dossier Qualiopi en préparation (référentiel et preuves FOAD) — état au 25/10/2026 : aucune date d'audit fixée, aucun numéro de déclaration d'activité revendiqué. StartIA n'est pas présenté comme un organisme certifié Qualiopi tant que la certification n'est pas obtenue.",
  objectifs: [
    {
      label: "Comprendre le fonctionnement de l'IA générative et ses limites",
      evaluable:
        "Distinguer IA classique / générative ; identifier une hallucination ; formuler un prompt utile.",
    },
    {
      label: "Situer les obligations liées à l'AI Act (art. 4) et aux usages au travail",
      evaluable:
        "Citer le rôle de l'article 4 ; distinguer usage et mise sur le marché ; repérer un niveau de risque courant.",
    },
    {
      label: "Protéger données personnelles et secrets d'entreprise face à l'IA",
      evaluable:
        "Classer une information (OK / attention / interdit) ; appliquer un réflexe en cas d'erreur ou d'enregistrement.",
    },
    {
      label: "Garder la décision humaine et les bons usages de publication",
      evaluable:
        "Identifier qui valide ; savoir quand ne pas publier un contenu généré sans contrôle.",
    },
    {
      label: "Repérer deepfakes et urgences manipulées",
      evaluable:
        "Adopter un réflexe de vérification face à une vidéo / voix douteuse ou une demande urgente.",
    },
    {
      label: "Mobiliser les 7 réflexes au quotidien",
      evaluable:
        "Restituer et classer les questions avant / après usage de l'IA.",
    },
  ],
  public:
    "Salariés, dirigeants et collaborateurs d'entreprises qui utilisent ou sont exposés à des outils d'IA au travail (tous secteurs).",
  prerequis: [
    "Savoir utiliser un navigateur web et une adresse e-mail professionnelle.",
    "Aucun prérequis technique en IA ni en droit.",
    "Accès à un poste ou smartphone connecté à Internet.",
  ],
  duree: SOCLE_DURATION_LABEL,
  dureeDetail:
    "Durée moyenne indicative du socle (activités + évaluation finale). Le parcours peut être suivi en une ou plusieurs sessions.",
  methodes: [
    "FOAD asynchrone sur plateforme StartIA",
    "Vidéos courtes et textes pédagogiques",
    "Activités interactives (tri, quiz formatifs, mises en situation)",
    "Test de positionnement non éliminatoire en début de parcours",
    "Évaluation finale sommative (QCM)",
    "Assistance pédagogique et technique nommée (voir modalités FOAD)",
  ],
  evaluation: [
    `Évaluation finale : QCM — seuil de réussite ${QUIZ_PASS_PERCENT} / 100.`,
    "Positionnement initial : non éliminatoire, à visée pédagogique.",
    "Validation : parcours socle complété + QCM réussi → attestation nominative de suivi.",
    "L'attestation documente le suivi ; elle n'est ni un diplôme ni une certification officielle de conformité.",
  ],
  accessibilite: [
    "Formation 100 % en ligne, réalisable sur ordinateur ou smartphone.",
    "En cas de situation de handicap, contactez-nous avant ou pendant le parcours pour étudier les adaptations possibles (rythme, formats, assistance).",
    `Référent handicap / assistance : ${ASSISTANCE.referentPedagogique.name} — ${ASSISTANCE.email} — ${ASSISTANCE.phone}.`,
    `Délai de réponse : ${ASSISTANCE.responseDelay}.`,
  ],
  tarifs: [
    "Abonnement annuel StartIA (accès plateforme + parcours + suivi RH + attestations) : Micro 390 € (1–5 accès), TPE 790 € (6–20), PME 1 290 € (21–50), ETI sur devis.",
    "Options hors abonnement : module métier sur mesure 690 € (format standard) ; atelier usages & automatisation sur devis ; marque blanche sur devis.",
    "TVA non applicable, art. 293 B du CGI.",
  ],
  financements: [
    "Dossier Qualiopi en préparation — aucune certification Qualiopi ni numéro de déclaration d'activité n'est revendiqué à ce stade.",
    "Une prise en charge OPCO peut être étudiée sous réserve d'éligibilité de l'entreprise et, le cas échéant, via un organisme de formation partenaire certifié Qualiopi (émetteur de l'attestation / certificat de réalisation à définir contractuellement).",
    "Aucun financement n'est garanti. Les modalités exactes seront confirmées après obtention éventuelle de la certification / montage avec partenaire.",
  ],
  deroule: [
    {
      etape: "Accueil & introduction",
      duree: "≈ 5 min",
      detail: "Présentation du parcours, objectifs et modalités.",
    },
    {
      etape: "Test de positionnement",
      duree: "≈ 5 min",
      detail: "QCM non éliminatoire pour situer le niveau de départ.",
    },
    ...BLOCKS.map((block) => ({
      etape: `Bloc ${block.number} — ${block.title}`,
      duree: block.duration,
      detail: `${block.goal} Contenu : ${block.chapters.map((c) => c.title).join(" · ")}.`,
    })),
    {
      etape: "Évaluation finale",
      duree: "≈ 10 min",
      detail: `QCM sommative, seuil ${QUIZ_PASS_PERCENT} %.`,
    },
    {
      etape: "Attestation de suivi",
      duree: "—",
      detail:
        "Émission automatique de l'attestation nominative (date, score, temps de connexion mesuré, modules validés).",
    },
    {
      etape: "Bonus optionnels",
      duree: "variable",
      detail:
        "Module entreprise (charte, outils, référent) et fiche métier — hors validation obligatoire du socle.",
    },
  ],
} as const;
