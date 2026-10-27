/** Fiches métiers — gabarit 6 rubriques (~8 min), LockinIA. */

export type CareerTrafficLevel = "green" | "orange" | "red";

export type CareerTrafficItem = {
  level: CareerTrafficLevel;
  situation: string;
  explanation: string;
};

export type CareerCase = {
  situation: string;
  answer: string;
};

export type CareerQuizQuestion = {
  prompt: string;
  choices: [string, string, string];
  correctIndex: 0 | 1 | 2;
  why: string;
};

export type CareerPath = {
  id: string;
  title: string;
  duration: string; // "≈ 8 min"
  focus: string; // short subtitle under title
  whyExposed: string;
  neverList: string[];
  traffic: CareerTrafficItem[]; // 5 items: 2 green, 1 orange, 2 red
  cases: CareerCase[]; // 3
  tips: string[]; // 3
  quiz: CareerQuizQuestion[]; // 3
};

export const CAREER_PATHS: CareerPath[] = [
  {
    id: "direction",
    title: "Direction",
    duration: "≈ 8 min",
    focus: "Cadre, outils autorisés, contrats, décisions humaines",
    whyExposed:
      "C'est vous qui décidez quelles IA l'entreprise a le droit d'utiliser, et qui signe les contrats avec les éditeurs. Si ce cadre n'existe pas, chacun choisit son outil et des infos sensibles partent dehors. Ce que l'éditeur peut faire de vos données se joue au moment de la signature.",
    neverList: [
      "Business plan et projets stratégiques",
      "Projets de rachat, de cession ou de levée de fonds",
      "Comptes et chiffres non publiés",
      "Négociations en cours avec clients ou fournisseurs",
      "Rémunérations et dossiers individuels de salariés",
      "Contentieux et procédures en cours",
    ],
    traffic: [
      {
        level: "green",
        situation:
          "Demander à une IA de reformuler votre mot d'accueil pour la newsletter interne, sans chiffre non publié",
        explanation:
          "Rien de secret, personne de reconnaissable. Vous relisez avant diffusion.",
      },
      {
        level: "green",
        situation: "Demander à une IA de préparer la trame d'un séminaire d'équipe",
        explanation: "Une structure générique ne révèle rien.",
      },
      {
        level: "orange",
        situation: "Faire synthétiser par une IA le compte rendu d'un comité de direction",
        explanation:
          "Seulement dans l'outil IA autorisé, noms et chiffres sensibles retirés.",
      },
      {
        level: "red",
        situation:
          "Faire analyser un projet de rachat d'un concurrent par une IA grand public",
        explanation:
          "Secret stratégique : une fuite peut faire échouer l'opération.",
      },
      {
        level: "red",
        situation:
          "Coller la grille des salaires dans une IA pour préparer les augmentations",
        explanation:
          "Données personnelles et secret d'entreprise à la fois.",
      },
    ],
    cases: [
      {
        situation:
          "Un vendeur vous pousse à signer cette semaine pour une IA type ChatGPT destinée à toute l'entreprise.",
        answer:
          "Vous ne signez pas sous la pression. Vous vérifiez d'abord à quoi elle servira vraiment, ce que le contrat dit de vos données (réutilisation, entraînement, hébergement), et qui sera responsable en interne. Ensuite seulement, l'outil entre sur la liste autorisée.",
      },
      {
        situation:
          "Un manager vous apprend que son équipe utilise une IA gratuite depuis trois mois.",
        answer:
          "Vous ne cherchez pas de coupable. Vous faites déclarer l'usage, vous évaluez l'outil, puis vous le validez ou vous proposez une alternative autorisée.",
      },
      {
        situation:
          "Un tableau de bord IA classe les commerciaux et propose de supprimer la prime des trois derniers.",
        answer:
          "Une décision qui touche une personne reste humaine. Vous regardez les dossiers, vous comprenez le classement, et vous devez pouvoir expliquer votre choix.",
      },
    ],
    tips: [
      "Demander à une IA une grille « oui / non / à clarifier » pour évaluer un nouvel outil. Vous validez et vous décidez.",
      "Faire rédiger par une IA un premier brouillon de charte à partir de vos règles, puis le relire avant diffusion.",
      "Demander à une IA la liste des questions à poser à un éditeur avant d'acheter.",
    ],
    quiz: [
      {
        prompt: "Avant d'acheter un outil IA, le point clé du contrat, c'est…",
        choices: [
          "Le prix par utilisateur",
          "Le design de l'interface",
          "Ce que l'éditeur fait de vos données",
        ],
        correctIndex: 2,
        why: "L'éditeur peut réutiliser vos données ou s'en servir pour entraîner son modèle : c'est le contrat qui le dit.",
      },
      {
        prompt:
          "Une équipe utilise une IA non autorisée depuis des mois. Vous…",
        choices: [
          "Faites déclarer l'usage et évaluez l'outil",
          "Sanctionnez le manager",
          "Laissez faire : ça fonctionne",
        ],
        correctIndex: 0,
        why: "L'objectif est de connaître les outils utilisés, pas de punir. Un usage caché est un risque que personne ne gère.",
      },
      {
        prompt:
          "Un outil propose de supprimer la prime de trois salariés. Qui décide ?",
        choices: [
          "L'outil, il est neutre",
          "Un humain, après lecture des dossiers",
          "Le premier qui clique sur valider",
        ],
        correctIndex: 1,
        why: "Un classement peut reproduire des biais. Décider, c'est comprendre, pouvoir modifier et pouvoir dire non.",
      },
    ],
  },
  {
    id: "rh",
    title: "Ressources humaines",
    duration: "≈ 8 min",
    focus: "Recrutement, paie, dossiers salariés",
    whyExposed:
      "CV, notes d'entretien, paie, arrêts maladie : vous manipulez les données personnelles de toute l'entreprise, et certaines sont sensibles. Une IA grand public n'est pas un coffre-fort. Par ailleurs, dès qu'un outil trie ou note des personnes, c'est un humain qui garde la décision.",
    neverList: [
      "CV et lettres de candidature complets",
      "Arrêts maladie, visites médicales, situations de handicap",
      "Bulletins de paie et numéros de sécurité sociale",
      "Dossiers disciplinaires et enquêtes internes",
      "Appartenance syndicale",
      "Notes d'entretien sur un candidat ou un salarié",
    ],
    traffic: [
      {
        level: "green",
        situation:
          "Demander à une IA de reformuler une offre d'emploi sur un ton clair et inclusif",
        explanation: "Aucun candidat concerné. Vous relisez avant publication.",
      },
      {
        level: "green",
        situation: "Demander à une IA de préparer un guide d'entretien pour un poste",
        explanation: "Une trame de questions ne vise personne.",
      },
      {
        level: "orange",
        situation: "Faire résumer par une IA les compétences d'un CV",
        explanation:
          "Seulement dans l'outil RH autorisé, sans adresse, téléphone ni date de naissance.",
      },
      {
        level: "red",
        situation:
          "Demander à une IA de rédiger un courrier en citant le motif médical d'un arrêt",
        explanation:
          "Donnée de santé : jamais dans une IA grand public, même sans le nom.",
      },
      {
        level: "red",
        situation:
          "Faire analyser par une IA la vidéo d'un entretien pour mesurer la motivation du candidat",
        explanation:
          "Interdit : on ne déduit pas les émotions d'une personne avec une IA au travail, recrutement compris.",
      },
    ],
    cases: [
      {
        situation:
          "On vous demande de coller 40 CV dans une IA publique pour faire un pré-tri.",
        answer:
          "Vous refusez hors outil autorisé. Vous proposez l'outil validé par l'entreprise, ou un tri humain sur des critères écrits à l'avance.",
      },
      {
        situation:
          "Un candidat écarté par un tri automatique demande qu'un recruteur relise son dossier.",
        answer:
          "C'est son droit. Vous transmettez la demande, et un humain revoit réellement le dossier.",
      },
      {
        situation:
          "Un prestataire vous propose un logiciel qui analyse les visios d'entretien pour noter la motivation des candidats.",
        answer:
          "Vous refusez : cette pratique est interdite. Vous en parlez au référent IA ou au DPO.",
      },
    ],
    tips: [
      "Demander à une IA de reformuler une offre d'emploi : ton clair, inclusif, sans aucun dossier candidat.",
      "Demander à une IA de construire la trame du parcours d'intégration d'un nouveau poste.",
      "Faire transformer par une IA une note RH en FAQ simple, puis la vérifier avant diffusion.",
    ],
    quiz: [
      {
        prompt: "Un CV, c'est…",
        choices: [
          "Une donnée personnelle",
          "Une information libre si on retire le prénom",
          "Une donnée publique",
        ],
        correctIndex: 0,
        why: "Un CV porte un nom, un parcours, des coordonnées : il permet de reconnaître la personne.",
      },
      {
        prompt:
          "Un logiciel mesure la motivation des candidats pendant la visio.",
        choices: [
          "C'est possible si le candidat est prévenu",
          "C'est possible si seul le recruteur voit le score",
          "C'est interdit",
        ],
        correctIndex: 2,
        why: "Déduire les émotions d'une personne avec une IA est interdit au travail, et le recrutement en fait partie.",
      },
      {
        prompt:
          "Un candidat écarté automatiquement demande une relecture humaine.",
        choices: [
          "Impossible : le score est définitif",
          "Vous transmettez : un humain revoit le dossier",
          "Seulement s'il prouve que le score est faux",
        ],
        correctIndex: 1,
        why: "Une personne peut demander qu'un humain intervienne quand une machine a pris seule une décision qui la concerne.",
      },
    ],
  },
  {
    id: "marketing",
    title: "Marketing & ventes",
    duration: "≈ 8 min",
    focus: "Contenus générés, chatbots, fichiers clients et prospects",
    whyExposed:
      "Vous publiez à l'extérieur et vous travaillez avec les fichiers clients. Ce que l'IA produit part au nom de l'entreprise : les droits sur les images, la transparence envers le public et la protection des prospects se jouent chez vous.",
    neverList: [
      "Fichiers clients et prospects, exports du CRM",
      "Grilles de prix non publiques, remises et marges",
      "Lancements et campagnes non annoncés",
      "Propositions commerciales nominatives",
      "Photos ou voix de clients ou de salariés sans leur accord",
    ],
    traffic: [
      {
        level: "green",
        situation:
          "Demander à une IA cinq angles de posts LinkedIn sur un sujet public",
        explanation:
          "Rien de secret. Vous choisissez et adaptez le ton de la marque.",
      },
      {
        level: "green",
        situation: "Demander à une IA de reformuler une fiche produit déjà en ligne",
        explanation:
          "Le texte est public. Vous vérifiez que les caractéristiques restent exactes.",
      },
      {
        level: "orange",
        situation: "Faire personnaliser par une IA un mail de prospection",
        explanation:
          "Dans l'outil IA autorisé, avec le minimum : prénom et secteur, pas tout l'historique.",
      },
      {
        level: "red",
        situation:
          "Importer l'export du CRM dans une IA grand public pour segmenter les clients",
        explanation:
          "Fichier de données personnelles et secret commercial : jamais.",
      },
      {
        level: "red",
        situation:
          "Générer avec une IA une vidéo d'un vrai client qui recommande votre produit, sans son accord",
        explanation:
          "Image utilisée sans accord et faux témoignage trompeur : on ne le fait pas.",
      },
    ],
    cases: [
      {
        situation:
          "Votre équipe veut une vidéo promo avec un porte-parole généré par IA, qui a l'air d'une vraie personne.",
        answer:
          "Vous ajoutez une mention claire « générée par IA », vous vérifiez les droits (image, voix, musique) et vous obtenez un accord écrit si la vidéo imite une personne réelle.",
      },
      {
        situation: "Le chatbot du site répond aux clients.",
        answer:
          "Il se présente comme une IA dès le début de l'échange. Une mention cachée dans les conditions générales ne suffit pas.",
      },
      {
        situation:
          "L'IA propose de rédiger vingt avis clients pour votre fiche en ligne.",
        answer:
          "Vous refusez. De faux avis trompent les clients et sont interdits. Vous sollicitez plutôt de vrais avis.",
      },
    ],
    tips: [
      "Avant de publier une image, un logo ou une pub générés par IA : vérifier les droits, ne pas copier une marque ou une personne réelle, et indiquer clairement si le contenu est généré.",
      "Faire décliner par une IA un texte validé en version courte, longue et newsletter.",
      "Demander à une IA les réponses aux objections fréquentes d'un argumentaire, sans donnée client.",
    ],
    quiz: [
      {
        prompt: "Le chatbot du site doit…",
        choices: [
          "Se présenter comme une IA dès le début",
          "Ne rien dire : le client s'en doute",
          "Être mentionné dans les conditions générales",
        ],
        correctIndex: 0,
        why: "La personne doit savoir qu'elle échange avec une machine, au moment de l'échange.",
      },
      {
        prompt:
          "Sur LinkedIn ou Instagram, vous publiez une pub générée par IA qui montre une personne qui n'existe pas.",
        choices: [
          "On publie sans rien dire : c'est juste un visuel",
          "On ajoute une mention claire « générée par IA »",
          "On publie si la personne a l'air réelle",
        ],
        correctIndex: 1,
        why: "Quand un contenu généré peut passer pour réel, la transparence compte — surtout sur les réseaux.",
      },
      {
        prompt: "Un visuel généré ressemble au logo d'une marque connue.",
        choices: [
          "On publie : l'IA l'a créé",
          "On le retouche un peu",
          "On ne publie pas dans le doute",
        ],
        correctIndex: 2,
        why: "Un logo reconnaissable peut être protégé. Le retoucher ne règle pas la question des droits.",
      },
    ],
  },
  {
    id: "managers",
    title: "Managers",
    duration: "≈ 8 min",
    focus: "Équipe, outils déclarés, relecture des livrables",
    whyExposed:
      "Vous êtes l'intermédiaire entre les règles et le terrain. C'est souvent vous qu'on interroge : « On peut utiliser cette IA ? » Et ce que votre équipe envoie aux clients passe souvent par votre validation. Si un outil non autorisé ou un chiffre inventé sort, le risque est pour l'entreprise. Votre rôle : faire déclarer les usages, relire avant envoi, et montrer l'exemple.",
    neverList: [
      "Entretiens annuels et évaluations individuelles",
      "Santé, vie privée ou situation familiale d'un collaborateur",
      "Conflits et dossiers disciplinaires",
      "Objectifs et chiffres internes non publiés",
      "Documents clients confidentiels",
    ],
    traffic: [
      {
        level: "green",
        situation: "Demander à une IA de préparer l'ordre du jour d'une réunion d'équipe",
        explanation: "Rien de personnel ni de secret.",
      },
      {
        level: "green",
        situation: "Demander à une IA de reformuler une consigne pour la rendre plus claire",
        explanation:
          "Vous relisez pour vérifier que le sens n'a pas changé.",
      },
      {
        level: "orange",
        situation: "Faire résumer par une IA les retours de l'équipe sur un projet",
        explanation: "Dans l'outil IA autorisé, prénoms retirés.",
      },
      {
        level: "red",
        situation:
          "Coller dans une IA les notes d'entretien annuel d'un collaborateur pour rédiger son évaluation",
        explanation:
          "Données personnelles sur une personne précise : jamais dans une IA grand public.",
      },
      {
        level: "red",
        situation:
          "Demander à une IA si un collaborateur a l'air démotivé d'après une vidéo de réunion",
        explanation:
          "Interdit : on ne déduit pas les émotions d'un salarié avec une IA.",
      },
    ],
    cases: [
      {
        situation:
          "Un rapport visiblement écrit par une IA, avec des chiffres sans source, doit partir chez un client.",
        answer:
          "Vous bloquez l'envoi. Chaque chiffre doit avoir une source et doit être vérifié. Règle d'équipe : rien ne sort sans relecture.",
      },
      {
        situation:
          "Un collaborateur utilise une IA gratuite non autorisée depuis des semaines.",
        answer:
          "Vous l'aidez à déclarer l'usage au référent IA, sans chercher de coupable. L'outil sera validé ou remplacé.",
      },
      {
        situation: "Un nouvel arrivant commence lundi.",
        answer:
          "Vous lui montrez la liste des outils autorisés et les réflexes de base avant son premier usage de l'IA.",
      },
    ],
    tips: [
      "Demander à une IA de reformuler un point d'avancement pour un client : vous vérifiez chaque chiffre et chaque promesse avant envoi.",
      "Faire rédiger par une IA un compte rendu à partir de vos notes, sans sujet personnel, puis le relire.",
      "Demander à une IA la trame d'accueil d'un nouvel arrivant.",
    ],
    quiz: [
      {
        prompt:
          "Un livrable rédigé avec l'IA contient des chiffres sans source.",
        choices: [
          "On l'envoie : le style est bon",
          "On bloque jusqu'à vérification",
          "On corrige seulement le ton",
        ],
        correctIndex: 1,
        why: "Un chiffre sans source peut être inventé. Ce qui part chez un client engage l'entreprise.",
      },
      {
        prompt: "Un collaborateur utilise une IA non autorisée.",
        choices: [
          "Sanction immédiate",
          "On ferme les yeux",
          "On l'aide à déclarer l'usage",
        ],
        correctIndex: 2,
        why: "Un usage déclaré peut être encadré. Un usage caché, non.",
      },
      {
        prompt:
          "Rédiger l'évaluation d'un collaborateur avec ses notes d'entretien dans une IA grand public ?",
        choices: ["Non", "Oui, sans son nom", "Oui, si l'évaluation est positive"],
        correctIndex: 0,
        why: "Même sans le nom, les notes permettent de reconnaître la personne.",
      },
    ],
  },
  {
    id: "tech",
    title: "Tech, IT & développeurs",
    duration: "≈ 8 min",
    focus: "Code, logs, secrets, assistants de code",
    whyExposed:
      "L'IA aide sur le code, les bugs et la documentation, et elle peut emporter des secrets. Une clé d'API ou un log client collé par erreur sort de l'entreprise. Et un assistant de code peut proposer des actions, ou des bibliothèques, qu'il faut vérifier.",
    neverList: [
      "Clés d'API, mots de passe, jetons d'accès",
      "Fichiers de configuration et secrets (.env…)",
      "Logs contenant des données clients (e-mails, adresses IP)",
      "Code source propriétaire ou sensible",
      "Bases de données réelles, même partielles",
      "Failles de sécurité non corrigées",
    ],
    traffic: [
      {
        level: "green",
        situation: "Demander à une IA comment fonctionne une commande Git",
        explanation: "Question générale, rien d'interne.",
      },
      {
        level: "green",
        situation:
          "Demander à une IA d'expliquer un message d'erreur courant d'une bibliothèque publique",
        explanation: "Aucun code ni donnée de l'entreprise.",
      },
      {
        level: "orange",
        situation: "Faire relire par une IA un extrait de code nettoyé",
        explanation:
          "Dans l'assistant de code autorisé, sans secret ni donnée réelle.",
      },
      {
        level: "red",
        situation: "Coller un fichier .env dans une IA pour déboguer une connexion",
        explanation: "Il contient des secrets : ils sortent de l'entreprise.",
      },
      {
        level: "red",
        situation: "Coller des logs de production dans une IA pour analyser un incident",
        explanation:
          "Ils contiennent des données clients : jamais dans une IA grand public.",
      },
    ],
    cases: [
      {
        situation:
          "Bug urgent : vous voulez coller les logs et un extrait de code dans une IA grand public.",
        answer:
          "Non. Vous utilisez l'outil autorisé, vous nettoyez les données, puis vous relisez le correctif avant de l'appliquer.",
      },
      {
        situation:
          "Une extension IA pour votre éditeur de code promet d'aller deux fois plus vite.",
        answer:
          "Vous vérifiez où part votre code et vous demandez avant de l'installer.",
      },
      {
        situation: "L'IA vous recommande une bibliothèque que vous ne connaissez pas.",
        answer:
          "Vous vérifiez qu'elle existe vraiment et qu'elle est fiable. L'IA peut inventer des noms de paquets, et des pirates en profitent.",
      },
    ],
    tips: [
      "Demander à une IA d'expliquer un diff ou de rédiger des tests, dans l'outil autorisé, sur un extrait anonymisé.",
      "Demander à une IA de rédiger la documentation d'une fonction.",
      "Demander à une IA de traduire un message d'erreur technique en explication simple pour un utilisateur.",
    ],
    quiz: [
      {
        prompt: "Une clé d'API dans un prompt…",
        choices: [
          "N'a jamais sa place",
          "C'est possible si on la change après",
          "C'est possible dans un outil payant",
        ],
        correctIndex: 0,
        why: "Une fois envoyée, la clé est hors de votre contrôle.",
      },
      {
        prompt: "L'IA recommande un paquet inconnu.",
        choices: [
          "Je l'installe",
          "Je vérifie qu'il existe et qu'il est fiable",
          "Je demande à l'IA s'il est sûr",
        ],
        correctIndex: 1,
        why: "L'IA peut inventer un nom de paquet, et elle peut confirmer sa propre erreur.",
      },
      {
        prompt: "Un agent IA propose de déployer en production.",
        choices: [
          "J'accepte : il a testé",
          "J'accepte si les tests passent",
          "Je relis et je valide moi-même",
        ],
        correctIndex: 2,
        why: "Une action irréversible ne part pas sans validation humaine.",
      },
    ],
  },
  {
    id: "finance",
    title: "Finance & comptabilité",
    duration: "≈ 8 min",
    focus: "Paiements, factures, trésorerie, fraude",
    whyExposed:
      "L'IA accélère les tableaux, les analyses et les relances, et elle peut inventer des chiffres. Vous tenez aussi les virements : les fraudeurs le savent, et une fausse voix de dirigeant se fabrique en quelques minutes.",
    neverList: [
      "IBAN et coordonnées bancaires",
      "Fichiers de paie",
      "Relevés bancaires",
      "Comptes et résultats non publiés",
      "Prévisionnel de trésorerie",
      "Contrats fournisseurs et conditions négociées",
    ],
    traffic: [
      {
        level: "green",
        situation: "Demander à une IA de reformuler une relance de facture générique",
        explanation: "Sans nom ni montant réel : vous complétez ensuite.",
      },
      {
        level: "green",
        situation: "Demander à une IA d'expliquer une formule Excel",
        explanation: "Aucune donnée de l'entreprise n'est nécessaire.",
      },
      {
        level: "orange",
        situation: "Faire commenter par une IA un tableau de dépenses agrégé",
        explanation:
          "Dans l'outil IA autorisé, sans nom de fournisseur ni de salarié.",
      },
      {
        level: "red",
        situation: "Coller le fichier de paie dans une IA pour vérifier les cotisations",
        explanation:
          "Salaires, numéros de sécurité sociale, absences : jamais.",
      },
      {
        level: "red",
        situation:
          "Faire commenter le prévisionnel de trésorerie par une IA grand public",
        explanation: "Secret d'entreprise : il ne sort pas.",
      },
    ],
    cases: [
      {
        situation:
          "Message vocal du « DAF », voix crédible : changer l'IBAN d'un fournisseur avant midi.",
        answer:
          "Vous ne touchez à rien. Vous rappelez sur son numéro habituel ou vous suivez la procédure interne. Répondre au vocal, c'est parler au fraudeur.",
      },
      {
        situation: "L'IA calcule une variation de marge dans un tableau.",
        answer:
          "Vous recalculez. L'IA peut se tromper sur des chiffres, avec un ton très sûr.",
      },
      {
        situation: "L'IA propose de lancer le lot de paiements fournisseurs.",
        answer:
          "Vous vérifiez bénéficiaires et montants, puis c'est vous qui validez.",
      },
    ],
    tips: [
      "Demander à une IA de reformuler une relance client, sans IBAN : les montants viennent de votre logiciel.",
      "Demander à une IA de rédiger le commentaire d'une analyse à partir de chiffres agrégés déjà validés.",
      "Demander à une IA d'expliquer une formule ou une macro Excel.",
    ],
    quiz: [
      {
        prompt: "Un vocal du DAF demande un changement d'IBAN urgent.",
        choices: [
          "Je réponds au vocal pour confirmer",
          "Je change : c'est sa voix",
          "Je rappelle sur son numéro habituel",
        ],
        correctIndex: 2,
        why: "Une voix se fabrique. Seul un canal que vous connaissez déjà est fiable.",
      },
      {
        prompt: "L'IA donne un total dans un tableau.",
        choices: [
          "Je recalcule avant de l'utiliser",
          "Je le reprends tel quel",
          "Je le reprends s'il semble cohérent",
        ],
        correctIndex: 0,
        why: "Une réponse probable n'est pas une réponse vraie, surtout pour un calcul.",
      },
      {
        prompt: "Le fichier de paie dans une IA grand public ?",
        choices: [
          "Oui, sans les noms",
          "Non, jamais",
          "Oui, pour un contrôle rapide",
        ],
        correctIndex: 1,
        why: "Il contient des données personnelles, et parfois de santé (absences). Retirer les noms ne suffit pas.",
      },
    ],
  },
  {
    id: "support",
    title: "Relation client & support",
    duration: "≈ 8 min",
    focus: "Tickets, appels, chatbots, données clients",
    whyExposed:
      "Tickets, appels et mails contiennent des noms, des numéros, parfois des informations de paiement ou de santé. Et l'IA peut promettre un délai ou un geste commercial qui n'existe pas : ce que vous envoyez engage l'entreprise.",
    neverList: [
      "Tickets complets avec coordonnées",
      "Enregistrements et transcriptions d'appels",
      "Moyens de paiement et IBAN",
      "Informations de santé confiées par un client",
      "Historiques de litiges nominatifs",
    ],
    traffic: [
      {
        level: "green",
        situation:
          "Demander à une IA de rédiger la réponse type à une question fréquente déjà publiée",
        explanation: "Le contenu est public. Vous vérifiez qu'il est à jour.",
      },
      {
        level: "green",
        situation:
          "Demander à une IA de corriger l'orthographe d'une réponse sans donnée client",
        explanation: "Rien de personnel. Vous relisez avant d'envoyer.",
      },
      {
        level: "orange",
        situation: "Demander à une IA de rédiger une réponse à partir d'un résumé du ticket",
        explanation: "Dans l'outil IA autorisé, nom et téléphone retirés.",
      },
      {
        level: "red",
        situation:
          "Coller dans une IA un ticket où le client parle de sa maladie pour expliquer un retard de paiement",
        explanation:
          "Information de santé : jamais dans une IA grand public.",
      },
      {
        level: "red",
        situation: "Faire transcrire un appel client par une IA grand public",
        explanation:
          "La voix et le contenu de l'appel sont des données personnelles.",
      },
    ],
    cases: [
      {
        situation:
          "Un ticket contient un nom, un téléphone et un litige. Vous voulez une réponse rédigée par l'IA.",
        answer:
          "Outil autorisé, superflu retiré, relecture avant envoi : pas de délai inventé, pas de geste commercial fantôme.",
      },
      {
        situation: "L'IA a écrit « nous vous rembourserons sous 48 h ».",
        answer:
          "Vous vérifiez que c'est vrai et autorisé avant d'envoyer. Une promesse écrite engage l'entreprise.",
      },
      {
        situation: "Un client demande quelles données l'entreprise a sur lui.",
        answer:
          "Vous transmettez tout de suite sa demande au DPO ou au référent, sans répondre seul.",
      },
    ],
    tips: [
      "Demander à une IA trois tons (ferme, empathique, factuel) sur un résumé anonymisé. Vous choisissez ; l'IA ne décide pas du geste.",
      "Demander à une IA de mettre à jour la FAQ à partir des questions fréquentes, sans donnée client.",
      "Demander à une IA de résumer une procédure longue en cinq étapes pour un nouvel agent.",
    ],
    quiz: [
      {
        prompt: "L'IA promet un remboursement sous 48 h.",
        choices: [
          "J'envoie",
          "Je vérifie que c'est vrai avant d'envoyer",
          "J'envoie en ajoutant « sous réserve »",
        ],
        correctIndex: 1,
        why: "L'IA peut inventer un délai. Une mention ne remplace pas la vérification.",
      },
      {
        prompt: "Un client veut savoir quelles données vous avez sur lui.",
        choices: [
          "Je transmets au DPO ou au référent",
          "Je lui envoie l'export du CRM",
          "Je réponds que c'est impossible",
        ],
        correctIndex: 0,
        why: "C'est son droit d'accès. L'entreprise a en général un mois pour répondre, et la réponse se prépare avec le DPO.",
      },
      {
        prompt: "Le chatbot client…",
        choices: [
          "Peut se faire passer pour un agent",
          "Le dit seulement si on lui demande",
          "Se présente comme une IA dès le début",
        ],
        correctIndex: 2,
        why: "Le client doit savoir qu'il échange avec une machine.",
      },
    ],
  },
  {
    id: "tous",
    title: "Autres métiers",
    duration: "≈ 8 min",
    focus: "Accueil, administratif, terrain, atelier",
    whyExposed:
      "Même hors des cases, les mêmes réflexes s'appliquent : outil autorisé, minimum de données, relecture. Ce que vous envoyez part au nom de l'entreprise, et une extension « pour aller plus vite » peut emporter plus que prévu.",
    neverList: [
      "Carnet d'adresses et coordonnées clients",
      "Photos de pièces d'identité",
      "Plannings et badges nominatifs",
      "Plans, procédés et savoir-faire de fabrication",
      "Informations sur la santé d'un collègue",
    ],
    traffic: [
      {
        level: "green",
        situation:
          "Demander à une IA de créer un modèle de mail de confirmation de rendez-vous",
        explanation: "Un modèle sans nom, réutilisable.",
      },
      {
        level: "green",
        situation:
          "Demander à une IA de traduire une consigne de sécurité générale pour un visiteur",
        explanation:
          "Rien de personnel. Vous faites vérifier la traduction si la consigne est importante.",
      },
      {
        level: "orange",
        situation: "Demander à une IA de préparer un rappel client à partir de son message",
        explanation: "Dans l'outil IA autorisé, avec seulement le motif.",
      },
      {
        level: "red",
        situation:
          "Photographier la pièce d'identité d'un visiteur pour la faire lire par une IA",
        explanation:
          "Document d'identité : jamais dans une IA grand public.",
      },
      {
        level: "red",
        situation:
          "Envoyer à une IA le plan d'une pièce fabriquée à l'atelier pour l'optimiser",
        explanation: "Savoir-faire de l'entreprise : il ne sort pas.",
      },
    ],
    cases: [
      {
        situation:
          "Un client vous envoie un mail avec son nom, son téléphone et sa demande. Vous voulez préparer un rappel avec l'IA.",
        answer:
          "Outil autorisé. Vous retirez le téléphone, et le nom s'il ne sert pas. Vous relisez avant d'envoyer.",
      },
      {
        situation:
          "Une extension IA « pour aller plus vite » s'installe en un clic sur votre navigateur.",
        answer:
          "Vous demandez avant de l'installer : certaines lisent tout ce qui s'affiche à l'écran.",
      },
      {
        situation: "Vous avez collé par erreur une liste de clients dans une IA.",
        answer:
          "Vous prévenez tout de suite votre manager ou le référent. En cas de fuite, l'entreprise a parfois seulement 72 h pour agir.",
      },
    ],
    tips: [
      "Demander à une IA un modèle de mail de confirmation, créé une fois et réutilisé, sans coller le carnet d'adresses.",
      "Demander à une IA de traduire une consigne générale pour un collègue ou un visiteur.",
      "Demander à une IA de transformer des notes en procédure claire, sans secret de fabrication.",
    ],
    quiz: [
      {
        prompt: "Une extension IA promet de vous faire gagner du temps.",
        choices: [
          "Je demande avant de l'installer",
          "Je l'installe : elle est gratuite",
          "Je l'installe si un collègue l'utilise",
        ],
        correctIndex: 0,
        why: "Gratuit ne veut pas dire autorisé. Certaines extensions lisent tout ce que vous voyez.",
      },
      {
        prompt: "Vous avez collé par erreur une liste de clients dans une IA.",
        choices: [
          "J'efface l'historique",
          "J'attends de voir",
          "Je préviens tout de suite",
        ],
        correctIndex: 2,
        why: "Plus l'entreprise est prévenue tôt, plus elle peut réagir à temps.",
      },
      {
        prompt: "Pour préparer un rappel client, vous donnez à l'IA…",
        choices: [
          "Le mail entier",
          "Seulement l'utile, sans téléphone",
          "Tout, pour qu'elle soit précise",
        ],
        correctIndex: 1,
        why: "On ne donne que ce qui sert à la tâche.",
      },
    ],
  },
  {
    id: "expert-comptable",
    title: "Expert-comptable",
    duration: "≈ 8 min",
    focus: "Données financières des clients, secret professionnel",
    whyExposed:
      "Vous manipulez ce qu'une entreprise a de plus confidentiel : sa banque, ses salaires, ses comptes. Et vous êtes tenu au secret professionnel. L'IA peut vous faire gagner des heures, à condition de ne rien lui confier qui sorte du cabinet.",
    neverList: [
      "Relevés bancaires et IBAN",
      "Bulletins de paie et numéros de sécurité sociale",
      "Arrêts maladie et mutuelle",
      "Fichier des écritures comptables (FEC) et liasses fiscales",
      "Dossiers de clients en difficulté",
    ],
    traffic: [
      {
        level: "green",
        situation:
          "Demander à une IA de rédiger un mail générique de rappel des échéances fiscales",
        explanation:
          "Sans nom ni montant. Vous vérifiez les dates sur la source officielle.",
      },
      {
        level: "green",
        situation: "Demander à une IA de reformuler la plaquette du cabinet",
        explanation: "Document public. Vous relisez avant publication.",
      },
      {
        level: "orange",
        situation: "Faire résumer par une IA le mail d'un client",
        explanation: "Dans l'outil IA autorisé du cabinet, nom retiré.",
      },
      {
        level: "red",
        situation: "Coller un bulletin de paie dans une IA pour vérifier un calcul",
        explanation:
          "Salaire, numéro de sécurité sociale, absences : jamais.",
      },
      {
        level: "red",
        situation:
          "Envoyer le FEC d'un client à une IA pour détecter des anomalies",
        explanation:
          "Toute la comptabilité du client, couverte par le secret professionnel.",
      },
    ],
    cases: [
      {
        situation:
          "Un client demande de catégoriser 300 lignes de son relevé bancaire. Vous collez tout dans ChatGPT ?",
        answer:
          "Non. Vous utilisez l'IA intégrée au logiciel comptable validé par le cabinet, ou rien.",
      },
      {
        situation:
          "L'IA rédige une note sur un seuil de TVA en citant un article du Code général des impôts.",
        answer:
          "Vous vérifiez sur Légifrance ou le BOFiP. Les seuils changent chaque année, et l'IA peut citer un article qui n'existe pas.",
      },
      {
        situation:
          "Message vocal du dirigeant d'un client : « Change l'IBAN pour le virement des salaires, c'est urgent. »",
        answer:
          "Vous rappelez sur son numéro habituel avant de toucher à quoi que ce soit.",
      },
    ],
    tips: [
      "Demander à une IA un modèle de mail de relance des pièces manquantes, créé une fois et réutilisé.",
      "Demander à une IA de vulgariser une nouveauté fiscale pour la newsletter, puis vérifier sur la source officielle.",
      "Demander à une IA une trame de checklist de clôture, que vous relisez.",
    ],
    quiz: [
      {
        prompt: "Un bulletin de paie dans ChatGPT grand public ?",
        choices: [
          "Oui, si on retire le nom",
          "Non, jamais",
          "Oui, pour un calcul rapide",
        ],
        correctIndex: 1,
        why: "Il reste un numéro de sécurité sociale, un salaire, des absences : la personne est reconnaissable.",
      },
      {
        prompt: "L'IA cite un article du Code général des impôts. Vous…",
        choices: [
          "Le reprenez tel quel",
          "Demandez à l'IA s'il existe",
          "Vérifiez sur Légifrance ou le BOFiP",
        ],
        correctIndex: 2,
        why: "L'IA peut inventer un article, et confirmer sa propre invention.",
      },
      {
        prompt:
          "L'IA classe et lettre vos factures automatiquement. Avant la déclaration de TVA…",
        choices: [
          "Je contrôle : c'est moi qui signe",
          "Je fais confiance à l'outil",
          "Je vérifie seulement si un client se plaint",
        ],
        correctIndex: 0,
        why: "L'outil prépare. La responsabilité reste la vôtre.",
      },
    ],
  },
  {
    id: "immobilier",
    title: "Immobilier",
    duration: "≈ 5 min",
    focus: "Mandats, dossiers locataires, photos, négociations",
    whyExposed:
      "Vous manipulez des dossiers complets : identité, revenus, situation familiale, et parfois des secrets de négociation. Une IA grand public n'est pas un coffre-fort pour un bail ou un compromis. Ce que vous publiez (annonce, photo, description) engage l'agence.",
    neverList: [
      "Pièces d'identité et justificatifs de revenus complets",
      "Dossiers locataires ou acquéreurs nominatifs",
      "Compromis, promesses et avenants non signés",
      "Coordonnées bancaires et IBAN de clients",
      "Photos d'intérieur permettant d'identifier l'adresse sans accord",
      "Notes de négociation et offres concurrentes non publiques",
    ],
    traffic: [
      {
        level: "green",
        situation:
          "Demander à une IA de reformuler une annonce déjà en ligne, sans donnée perso",
        explanation:
          "Le bien est public. Vous vérifiez surfaces, prix et mentions légales avant republication.",
      },
      {
        level: "green",
        situation:
          "Demander à une IA de préparer une checklist de visite type pour un bien neuf",
        explanation: "Une trame générique ne vise personne.",
      },
      {
        level: "orange",
        situation:
          "Faire résumer par une IA le mail d'un prospect pour préparer un rappel",
        explanation:
          "Dans l'outil IA autorisé, avec le minimum : prénom et type de bien, pas tout le dossier.",
      },
      {
        level: "red",
        situation:
          "Coller un dossier locataire complet dans une IA grand public pour « pré-trier »",
        explanation:
          "Identité, revenus, situation familiale : données personnelles, parfois sensibles.",
      },
      {
        level: "red",
        situation:
          "Faire analyser un compromis de vente non signé par une IA ouverte",
        explanation:
          "Secret de négociation et données des parties : il ne sort pas de l'agence.",
      },
    ],
    cases: [
      {
        situation:
          "Un collègue veut coller dix dossiers locataires dans ChatGPT pour classer les « meilleurs » profils.",
        answer:
          "Vous refusez hors outil autorisé. Proposez un tri sur critères écrits, ou l'outil validé par l'agence — la décision reste humaine.",
      },
      {
        situation:
          "L'IA propose une description d'annonce qui invente une surface et une vue mer.",
        answer:
          "Vous vérifiez chaque mention sur le mandat et les diagnostics. Une fausse info engage l'agence.",
      },
      {
        situation:
          "Un acquéreur envoie un vocal urgent : « Change l'IBAN du séquestre avant ce soir. »",
        answer:
          "Vous ne touchez à rien. Vous rappelez sur un numéro déjà connu ou vous suivez la procédure interne.",
      },
    ],
    tips: [
      "Demander à une IA cinq angles d'annonce à partir d'éléments déjà publics, sans dossier client.",
      "Demander à une IA une FAQ visite / diagnostics, que vous relisez avant diffusion.",
      "Demander à une IA un modèle de mail de confirmation de rendez-vous, réutilisable sans carnet d'adresses.",
    ],
    quiz: [
      {
        prompt: "Un dossier locataire dans une IA grand public ?",
        choices: [
          "Oui, si on retire le prénom",
          "Non, jamais hors outil autorisé",
          "Oui, pour aller plus vite",
        ],
        correctIndex: 1,
        why: "Revenus, identité et situation personnelle restent reconnaissables.",
      },
      {
        prompt: "L'IA invente une caractéristique dans une annonce. Vous…",
        choices: [
          "Publiez : le ton est bon",
          "Vérifiez chaque fait sur le mandat",
          "Publiez en ajoutant « sous réserve »",
        ],
        correctIndex: 1,
        why: "Une mention inexacte engage l'agence. Relire ne suffit pas si on ne vérifie pas.",
      },
      {
        prompt: "Un vocal demande de changer l'IBAN du séquestre.",
        choices: [
          "Je change : c'est urgent",
          "Je réponds au vocal pour confirmer",
          "Je rappelle sur un numéro déjà connu",
        ],
        correctIndex: 2,
        why: "Une voix se fabrique. Seul un canal déjà connu est fiable.",
      },
    ],
  },
];
