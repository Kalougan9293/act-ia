/** Parcours métiers — StartIA V1.0 (texte + cas à trancher + idée d'usage). */

export type CareerCaseOption = {
  label: string;
  correct: boolean;
};

export type CareerPath = {
  id: string;
  title: string;
  duration: string;
  focus: string;
  /** Texte concis à lire — phrases simples. */
  briefing: string;
  casePrompt: string;
  caseOptions: CareerCaseOption[];
  caseCorrection: string;
  /** Idée concrète d'usage IA pour ce métier. */
  aiTip: string;
};

export const CAREER_PATHS: CareerPath[] = [
  {
    id: "direction",
    title: "Direction",
    duration: "3–5 min",
    focus: "Cadre, outils autorisés, décisions humaines.",
    briefing:
      "Vous fixez le cadre : outils autorisés, contrats, responsabilités. Sans ça, chacun improvise et les infos sortent.\n\nAvant d'acheter une IA : à quoi sert-elle ? Que dit le contrat sur vos données ? L'éditeur les réutilise-t-il ? Une décision importante reste humaine.",
    casePrompt:
      "Un éditeur veut faire signer une IA « productivité » cette semaine. Que faites-vous ?",
    caseOptions: [
      { label: "Signer vite pour ne pas bloquer les équipes", correct: false },
      {
        label: "Vérifier usage, clauses données et responsable interne avant",
        correct: true,
      },
      { label: "Laisser chaque service décider seul", correct: false },
    ],
    caseCorrection:
      "Vous vérifiez l'usage réel, les clauses données / réentraînement, et qui est responsable en interne. Ensuite seulement, l'outil entre sur la liste autorisée.",
    aiTip:
      "Demandez à l'IA une grille « oui / non / à clarifier » pour chaque nouvel outil. Elle prépare. Vous décidez.",
  },
  {
    id: "rh",
    title: "Ressources humaines",
    duration: "3–5 min",
    focus: "CV, entretiens, outils RH : données perso.",
    briefing:
      "CV, notes d'entretien, paie : données personnelles, parfois sensibles. Une IA grand public n'est pas un coffre-fort.\n\nOutil autorisé, minimum de données, décision humaine. Un score IA ne remplace pas votre jugement.",
    casePrompt:
      "On vous demande de coller 40 CV dans une IA publique pour « pré-trier ». Que répondez-vous ?",
    caseOptions: [
      { label: "OK si on anonymise les prénoms seulement", correct: false },
      {
        label: "Refuser, sauf outil autorisé et cadre clair",
        correct: true,
      },
      { label: "Accepter : un CV n'est pas une donnée personnelle", correct: false },
    ],
    caseCorrection:
      "Vous refusez hors outil autorisé. Un CV porte un nom et un parcours. Proposez l'outil validé, ou un tri humain sur critères écrits.",
    aiTip:
      "Faites reformuler une offre d'emploi par l'IA : ton clair, inclusif. Aucun dossier candidat.",
  },
  {
    id: "marketing",
    title: "Marketing & sales",
    duration: "3–5 min",
    focus: "Chatbots, contenus générés, fichiers prospects.",
    briefing:
      "Vous publiez dehors et touchez aux fichiers clients. Un chatbot doit se présenter comme machine dès le début.\n\nContenu généré qui imite quelqu'un : mention claire + droits (image, voix, musique). Pas de base prospects dans une IA ouverte.",
    casePrompt:
      "Vidéo promo avec un porte-parole généré par IA. Que faites-vous ?",
    caseOptions: [
      { label: "Publier sans mention : c'est juste du marketing", correct: false },
      {
        label: "Mention IA si la personne paraît réelle + vérifier les droits",
        correct: true,
      },
      { label: "Une relecture suffit, pas besoin de mention", correct: false },
    ],
    caseCorrection:
      "Mention claire si la personne paraît réelle, droits vérifiés, accord si vous imitez quelqu'un. Relire ne remplace pas la mention.",
    aiTip:
      "Cinq angles de posts LinkedIn via l'IA, sans fichier clients. Vous choisissez le ton marque.",
  },
  {
    id: "managers",
    title: "Managers",
    duration: "3–5 min",
    focus: "Équipe, outils déclarés, relecture des livrables.",
    briefing:
      "Vous reliez les règles et le terrain. IA hors liste : aidez à déclarer, sans chercher un coupable.\n\nRien vers un client sans relecture. Chiffres sans source = à vérifier. Les nouveaux apprennent les outils autorisés avant le premier collage.",
    casePrompt:
      "Un rapport clairement écrit par une IA, chiffres sans source. Que faites-vous ?",
    caseOptions: [
      { label: "L'envoyer au client : le style est bon", correct: false },
      {
        label: "Bloquer, exiger sources et vérification avant envoi",
        correct: true,
      },
      { label: "Corriger le ton seulement, garder les chiffres", correct: false },
    ],
    caseCorrection:
      "Vous ne transmettez pas en l'état. Source + vérif pour chaque chiffre. Règle : rien dehors sans relecture.",
    aiTip:
      "Checklist « avant envoi client » générée une fois : chiffres, noms, promesses, ton.",
  },
  {
    id: "tech",
    title: "Tech, IT & développeurs",
    duration: "3–5 min",
    focus: "Code, logs, secrets, outils dans l'IDE.",
    briefing:
      "L'IA aide sur le code et les bugs — et peut emporter des secrets. Pas de configs, clés, logs clients ou code sensible dans un outil grand public.\n\nOutil autorisé, extrait nettoyé, relecture (y compris dépendances). Extension IDE : savoir où part le code avant de l'activer.",
    casePrompt:
      "Bug urgent : coller logs + extrait de code dans ChatGPT grand public ?",
    caseOptions: [
      { label: "Oui, c'est urgent et interne", correct: false },
      {
        label: "Non : outil autorisé, données nettoyées, puis relecture",
        correct: true,
      },
      { label: "Oui si on retire seulement les mots de passe visibles", correct: false },
    ],
    caseCorrection:
      "Non sans outil autorisé. Logs et code peuvent cacher secrets et données clients. Nettoyez, utilisez l'outil validé, relisez le correctif.",
    aiTip:
      "Expliquer un diff ou rédiger des tests dans l'outil autorisé, sur un extrait anonymisé.",
  },
  {
    id: "finance",
    title: "Finance & comptabilité",
    duration: "3–5 min",
    focus: "Paiements, factures, fraude, fichiers sensibles.",
    briefing:
      "L'IA accélère tableaux et relances — et invente des chiffres. Les fraudeurs le savent.\n\nMessage urgent du « DAF » pour un virement / IBAN : rappel sur le numéro habituel. IBAN, salaires, extraits : pas dans une IA grand public. L'IA prépare ; elle ne lance pas le paiement.",
    casePrompt:
      "Vocal du « DAF », voix crédible : changer l'IBAN d'un fournisseur avant midi. Que faites-vous ?",
    caseOptions: [
      { label: "Changer l'IBAN : la voix est la sienne", correct: false },
      {
        label: "Ne rien toucher ; rappeler sur le numéro habituel",
        correct: true,
      },
      { label: "Répondre au vocal pour confirmer l'identité", correct: false },
    ],
    caseCorrection:
      "Vous ne touchez pas à l'IBAN. Rappel ou process interne. Une voix se fabrique ; répondre au vocal, c'est parler au fraudeur.",
    aiTip:
      "Reformuler une relance client sans IBAN ni fichier paie. Les montants viennent de votre système.",
  },
  {
    id: "support",
    title: "Relation client & support",
    duration: "3–5 min",
    focus: "Tickets, appels, chatbots : données clients.",
    briefing:
      "Tickets et mails : noms, numéros, parfois IBAN. Outil autorisé, données inutiles retirées, réponse reluée.\n\nL'IA peut inventer un délai ou un geste commercial. Chatbot client : il se présente comme machine dès le début.",
    casePrompt:
      "Ticket avec nom, téléphone et litige : vous voulez une réponse IA. Avant ?",
    caseOptions: [
      { label: "Coller tout le ticket pour plus de contexte", correct: false },
      {
        label: "Outil autorisé, retirer le superflu, relire avant envoi",
        correct: true,
      },
      { label: "Envoyer tel quel : l'IA gère le ton", correct: false },
    ],
    caseCorrection:
      "Outil autorisé, téléphone et superflu retirés, relecture : pas de délai inventé ni de geste fantôme. Puis envoi.",
    aiTip:
      "Trois tons (ferme, empathique, factuel) sur un résumé anonymisé. Vous choisissez. L'IA ne décide pas du geste.",
  },
  {
    id: "tous",
    title: "Autres",
    duration: "3–5 min",
    focus: "Accueil, mails, atelier : réflexes du quotidien.",
    briefing:
      "Même hors cases : outil autorisé, minimum de données, relecture. Ce que vous renvoyez part au nom de l'entreprise.\n\nExtension IA « pour aller plus vite » : demander avant d'installer.",
    casePrompt:
      "Mail client (nom, téléphone, motif) : préparer un rappel avec l'IA. Avant ?",
    caseOptions: [
      { label: "Coller le mail entier pour être précis", correct: false },
      {
        label: "Outil autorisé, garder le utile, relire avant envoi",
        correct: true,
      },
      { label: "Utiliser n'importe quelle IA : c'est juste un rappel", correct: false },
    ],
    caseCorrection:
      "Outil autorisé. Retirez le téléphone (et le nom s'il ne sert pas). Relisez avant d'envoyer.",
    aiTip:
      "Créez une fois un modèle de mail de confirmation, puis réutilisez-le — sans coller le carnet d'adresses.",
  },
];
