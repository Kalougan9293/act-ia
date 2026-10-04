/** Parcours métiers — ConformAI V1.0 */

import type { QuizQuestion } from "@/lib/formation/evaluation";

export type CareerPath = {
  id: string;
  title: string;
  duration: string;
  focus: string;
  script: string;
  casePrompt: string;
  caseCorrection: string;
  questions: QuizQuestion[];
};

export const CAREER_PATHS: CareerPath[] = [
  {
    id: "tous",
    title: "Autres",
    duration: "10–15 min",
    focus: "Réflexes quotidiens, vérification des faits, sécurité des données et Shadow AI.",
    script:
      "En tant que collaborateur, vous êtes au cœur de l'usage au quotidien. Vos 3 réflexes indispensables :\n\nRéfléchissez avant de poster : réduisez au maximum les données personnelles ou confidentielles dans vos prompts.\n\nVérifiez systématiquement : l'IA est un outil d'assistance, pas un décideur. Elle peut halluciner ou inventer des faits. Vous restez responsable de la vérification de vos documents.\n\nDéclarez vos outils : n'utilisez pas d'outils d'IA personnels non approuvés pour traiter des documents internes de l'entreprise.",
    casePrompt:
      "Vous devez résumer un compte rendu de réunion contenant des noms de clients. Que faites-vous avant d'utiliser l'IA ?",
    caseCorrection:
      "J'utilise un outil autorisé par l'entreprise et je retire ou remplace les noms des clients s'ils ne sont pas nécessaires au résumé. Je relis ensuite le résumé avant de le diffuser, car l'IA peut déformer des propos.",
    questions: [
      {
        id: "t1",
        blockId: "tous",
        prompt: "Vous devez traduire un email client contenant son adresse et son téléphone.",
        choices: [
          "Je colle l'email entier dans n'importe quelle IA.",
          "J'utilise un outil autorisé et je retire les coordonnées si elles ne sont pas utiles.",
          "Je ne traduis jamais d'email.",
        ],
        correctIndex: 1,
        explanation: "Outil autorisé et minimisation : les deux premiers réflexes.",
      },
      {
        id: "t2",
        blockId: "tous",
        prompt: "Une synthèse IA contient un chiffre surprenant.",
        choices: [
          "Je le diffuse, c'est une information intéressante.",
          "Je retrouve la source avant de diffuser.",
          "Je l'arrondis.",
        ],
        correctIndex: 1,
        explanation: "Un chiffre surprenant est souvent une hallucination.",
      },
      {
        id: "t3",
        blockId: "tous",
        prompt: "Un collègue vous recommande une extension IA gratuite pour votre navigateur.",
        choices: [
          "Je l'installe tout de suite.",
          "Je demande sa validation avant de l'installer.",
          "Je l'installe sur mon poste personnel et j'y traite mes fichiers pro.",
        ],
        correctIndex: 1,
        explanation: "Une extension peut lire tout ce qui s'affiche à l'écran.",
      },
    ],
  },
  {
    id: "direction",
    title: "Direction & management stratégique",
    duration: "10–15 min",
    focus: "Gouvernance, politique d'achat, responsabilité de l'employeur et arbitrage des risques.",
    script:
      "En tant que dirigeant, votre rôle est de fixer le cadre de gouvernance et de sécuriser l'entreprise :\n\nMettre en place le registre : cartographiez les outils, leurs finalités et les propriétaires de cas d'usage pour éliminer le Shadow AI.\n\nEncadrer les achats : validez la finalité, la base légale et le DPA de chaque logiciel IA avant tout déploiement.\n\nAnticiper les changements de statut : si vos équipes développent ou intègrent des briques IA commercialisées sous votre marque, faites vérifier votre statut juridique (Fournisseur vs Déployeur).",
    casePrompt:
      "Un responsable d'équipe a souscrit seul un abonnement IA pour ses collaborateurs. Quelles questions posez-vous avant de le valider ?",
    caseCorrection:
      "Je vérifie la finalité, le contrat (DPA), la réutilisation des données et l'hébergement, puis je fais inscrire l'outil au registre avant de le valider. Un achat isolé crée du Shadow AI, même avec de bonnes intentions.",
    questions: [
      {
        id: "d1",
        blockId: "direction",
        prompt:
          "Une agence modifie de manière substantielle un système d'IA à Haut Risque et le commercialise sous sa propre marque. Quelle affirmation est exacte ?",
        choices: [
          "Elle reste simple déployeur tant qu'elle n'a pas entraîné le modèle de base.",
          "Dans les conditions de l'Article 25, elle peut devenir Fournisseur du système à Haut Risque et en assumer les obligations.",
          "Elle reste déployeur tant que le client n'a pas mis le système en service.",
        ],
        correctIndex: 1,
        explanation:
          "Le statut de fournisseur dépend des conditions précises de l'Article 25 (marque, modification substantielle, changement de finalité) : à analyser au cas par cas.",
      },
      {
        id: "d2",
        blockId: "direction",
        prompt: "Avant d'acheter un logiciel d'IA pour l'entreprise, la priorité est :",
        choices: [
          "Le prix le plus bas.",
          "Valider la finalité, la base légale, le contrat (DPA) et la réutilisation des données.",
          "Le nombre de fonctionnalités.",
        ],
        correctIndex: 1,
        explanation: "On encadre l'achat avant le déploiement, pas après.",
      },
      {
        id: "d3",
        blockId: "direction",
        prompt: "En cas de contrôle, comment prouver votre démarche Article 4 ?",
        choices: [
          "Une déclaration orale du dirigeant.",
          "Registre des usages, attestations de suivi et traces de formation.",
          "Aucune preuve n'est nécessaire.",
        ],
        correctIndex: 1,
        explanation: "Le dossier de preuve (registre, attestations, suivi formation) sert à documenter la démarche.",
      },
    ],
  },
  {
    id: "rh",
    title: "Ressources humaines",
    duration: "10–15 min",
    focus: "Recrutement, évaluation des candidats et salariés, Article 22 RGPD et dialogue social.",
    script:
      "Les usages RH font partie des cas les plus réglementés :\n\nTri de CV et évaluation : ces cas d'usage relèvent de l'Annexe III (Haut Risque, échéance 2 décembre 2027). Ils nécessitent une supervision humaine effective.\n\nArticle 22 RGPD : une décision d'embauche ou de promotion ne doit pas être prise sur la base exclusive d'un algorithme. Assurez-vous qu'un évaluateur humain dispose du pouvoir réel de modifier ou de rejeter la suggestion de l'IA, et prévoyez une procédure permettant aux candidats d'exprimer leur point de vue.\n\nInformation : dans le cadre professionnel, informez les collaborateurs et leurs représentants (notamment le CSE en France selon les règles du Code du travail).",
    casePrompt:
      "Votre logiciel de recrutement propose un classement automatique des candidats. Qui valide, et comment un candidat peut-il contester ?",
    caseCorrection:
      "Un recruteur humain valide, avec le pouvoir réel de modifier ou rejeter le classement. Les candidats sont informés et peuvent présenter leur point de vue et contester. C'est un usage à Haut Risque, et l'Article 22 RGPD s'applique.",
    questions: [
      {
        id: "r1",
        blockId: "rh",
        prompt: "Votre logiciel de recrutement classe automatiquement les candidats. Qui décide ?",
        choices: [
          "Le logiciel, il est plus objectif.",
          "Un recruteur humain, avec le pouvoir réel de modifier ou rejeter le classement.",
          "Le premier candidat de la liste est retenu d'office.",
        ],
        correctIndex: 1,
        explanation: "Haut risque (Annexe III) et Article 22 RGPD.",
      },
      {
        id: "r2",
        blockId: "rh",
        prompt: "L'entreprise veut déployer une IA d'évaluation des salariés. Que faut-il prévoir ?",
        choices: [
          "Rien, c'est un outil interne.",
          "Informer les salariés et leurs représentants, notamment le CSE.",
          "Prévenir uniquement les managers.",
        ],
        correctIndex: 1,
        explanation: "L'information des salariés et du CSE est un préalable.",
      },
      {
        id: "r3",
        blockId: "rh",
        prompt: "Un outil propose d'analyser les émotions des candidats pendant les entretiens vidéo.",
        choices: [
          "C'est autorisé si le candidat ne le sait pas.",
          "Cela relève des pratiques interdites de l'Article 5 (reconnaissance des émotions dans le cadre du travail).",
          "C'est autorisé s'il est hébergé en Europe.",
        ],
        correctIndex: 1,
        explanation: "Seules les exceptions médicales ou de sécurité sont prévues.",
      },
    ],
  },
  {
    id: "marketing",
    title: "Marketing & sales",
    duration: "10–15 min",
    focus: "Génération de contenu, chatbots clients (Art. 50), deepfakes, propriété intellectuelle et RGPD commercial.",
    script:
      "Le marketing et les ventes manipulent de la donnée client et diffusent du contenu vers l'extérieur :\n\nChatbots et agents conversationnels : vous devez informer les utilisateurs de manière claire qu'ils échangent avec une IA, sauf si le contexte le rend évident.\n\nDeepfakes et textes d'information : si vous utilisez des vidéos, sons ou visuels générés simulant des personnes réelles, la mention explicite d'IA est obligatoire, et une relecture ne la remplace pas. Pour une œuvre manifestement artistique, satirique ou de fiction, la mention reste due mais peut être discrète. Pour des articles textuels d'information générale, l'obligation de divulgation ne s'applique pas si une relecture et une responsabilité éditoriale humaines sont exercées.\n\nFichiers CRM : ne collez jamais de bases prospects dans des IA publiques sans avoir vérifié la finalité, le DPA et l'absence de réentraînement.",
    casePrompt:
      "Vous voulez une vidéo promotionnelle avec un porte-parole généré par IA. Quelles mentions et quelles vérifications ?",
    caseCorrection:
      "La vidéo doit indiquer clairement qu'elle est générée par IA si le porte-parole ressemble à une personne réelle (deepfake). Je vérifie aussi les droits (image, voix, musique) et l'accord de la personne imitée, le cas échéant.",
    questions: [
      {
        id: "m1",
        blockId: "marketing",
        prompt: "Vous lancez un agent conversationnel pour le service client.",
        choices: [
          "Inutile de préciser que c'est une IA.",
          "Les clients doivent être informés qu'ils échangent avec une IA.",
          "Il suffit de l'indiquer dans les CGV.",
        ],
        correctIndex: 1,
        explanation: "Article 50 : l'information doit être claire au moment de l'échange.",
      },
      {
        id: "m2",
        blockId: "marketing",
        prompt: "Une vidéo publicitaire met en scène une personne réelle générée par IA, relue par l'équipe.",
        choices: [
          "La relecture dispense de mention.",
          "La mention d'IA reste obligatoire.",
          "La mention n'est utile que sur les réseaux sociaux.",
        ],
        correctIndex: 1,
        explanation: "Pas d'exception de relecture pour les deepfakes.",
      },
      {
        id: "m3",
        blockId: "marketing",
        prompt: "Vous voulez faire analyser un fichier de 5 000 prospects par une IA publique.",
        choices: [
          "C'est possible, ce sont des données commerciales.",
          "Pas sans avoir vérifié la finalité, le contrat et l'absence de réentraînement.",
          "C'est possible si le fichier est en Excel.",
        ],
        correctIndex: 1,
        explanation: "Un fichier prospects contient des données personnelles.",
      },
    ],
  },
  {
    id: "managers",
    title: "Managers",
    duration: "10–15 min",
    focus: "Encadrement des équipes, contrôle qualité des livrables et gestion du Shadow AI.",
    script:
      "En tant que manager de proximité, vous faites le lien entre la gouvernance et l'exécution :\n\nDétection du Shadow AI : si un membre de votre équipe utilise un nouvel outil IA non répertorié, accompagnez-le pour soumettre le cas d'usage dans le registre de l'entreprise.\n\nValidation des livrables : sensibilisez votre équipe sur le fait qu'aucun document externe (devis, rapport, code) ne doit être transmis à un client sans relecture humaine préalable.",
    casePrompt:
      "Un collaborateur vous rend un rapport visiblement rédigé par IA, avec des chiffres non sourcés. Comment réagissez-vous ?",
    caseCorrection:
      "Je ne transmets pas le rapport en l'état : je demande que chaque chiffre soit sourcé et vérifié. J'explique pourquoi (hallucinations) plutôt que de sanctionner, et je rappelle la règle : aucun document externe sans relecture humaine.",
    questions: [
      {
        id: "g1",
        blockId: "managers",
        prompt: "Un membre de votre équipe utilise un outil d'IA non répertorié.",
        choices: [
          "Je l'interdis sans explication.",
          "Je l'accompagne pour déclarer le cas d'usage dans le registre.",
          "Je fais comme si je n'avais rien vu.",
        ],
        correctIndex: 1,
        explanation: "Le but est de faire sortir le Shadow AI de l'ombre, pas de sanctionner.",
      },
      {
        id: "g2",
        blockId: "managers",
        prompt: "Un rapport destiné à un client contient des chiffres non sourcés, visiblement générés par IA.",
        choices: [
          "Je l'envoie, le client vérifiera.",
          "Je demande la vérification des chiffres avant tout envoi.",
          "Je supprime les chiffres sans prévenir.",
        ],
        correctIndex: 1,
        explanation: "Aucun document externe sans relecture humaine.",
      },
      {
        id: "g3",
        blockId: "managers",
        prompt: "On vous propose une IA pour évaluer la performance de votre équipe.",
        choices: [
          "Je l'utilise pour décider des primes.",
          "Je reste prudent : risque de biais, décision humaine, information des salariés.",
          "Je l'utilise sans prévenir l'équipe.",
        ],
        correctIndex: 1,
        explanation: "Plus la décision touche une personne, plus on contrôle.",
      },
    ],
  },
  {
    id: "tech",
    title: "Tech, IT & développeurs",
    duration: "10–15 min",
    focus: "API, agents autonomes, gestion des secrets, RAG et sécurité des flux no-code.",
    script:
      "Les équipes techniques construisent l'architecture des systèmes :\n\nGestion des accès et permissions : pour les agents IA connectés à vos bases (via API, n8n, Make), dotez-les uniquement des autorisations strictement nécessaires en lecture et en écriture.\n\nSécurité RAG et secrets : protégez vos bases de connaissances contre les attaques de type injection de prompt et ne hardcodez aucune clé d'API.\n\nVigilance qualification (Art. 25 et Art. 3) : assurez-vous que l'assemblage de briques IA no-code ou code ne fasse pas de l'entreprise le Fournisseur d'un système à Haut Risque sans l'accord préalable de la direction juridique.",
    casePrompt:
      "On vous demande de connecter un agent IA à la boîte mail commerciale. Quelles permissions lui donnez-vous, et quelles actions restent validées par un humain ?",
    caseCorrection:
      "Je donne uniquement les droits nécessaires (lecture ou brouillons), jamais l'envoi, la suppression ou le transfert automatique. Toute action importante reste validée par un humain, car l'agent peut être manipulé par un email piégé (injection de prompt).",
    questions: [
      {
        id: "te1",
        blockId: "tech",
        prompt: "Quelle est la priorité lors de la connexion d'un agent IA à une base de données via une API ?",
        choices: [
          "Lui donner les droits administrateur pour fluidifier les requêtes.",
          "Restreindre ses droits d'écriture et de suppression et garder un contrôle humain sur les décisions critiques.",
          "Désactiver les logs pour accélérer.",
        ],
        correctIndex: 1,
        explanation: "Principe du moindre privilège : restreindre les droits et garder un contrôle humain.",
      },
      {
        id: "te2",
        blockId: "tech",
        prompt: "Où stocker la clé d'API d'un service d'IA ?",
        choices: [
          "Directement dans le code source.",
          "Dans un gestionnaire de secrets ou des variables d'environnement.",
          "Dans un commentaire du code.",
        ],
        correctIndex: 1,
        explanation: "Une clé en dur finit tôt ou tard dans un dépôt partagé.",
      },
      {
        id: "te3",
        blockId: "tech",
        prompt:
          "Vous assemblez des briques IA en un outil de tri de CV que l'entreprise veut vendre sous sa marque.",
        choices: [
          "Aucun impact juridique, ce sont des briques existantes.",
          "J'alerte la direction juridique : l'entreprise peut devenir Fournisseur d'un système à Haut Risque.",
          "Il suffit d'héberger l'outil en Europe.",
        ],
        correctIndex: 1,
        explanation: "Articles 3 et 25 : le statut de fournisseur peut entraîner des obligations lourdes, selon les conditions exactes.",
      },
    ],
  },
];
