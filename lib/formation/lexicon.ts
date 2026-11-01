/** Lexique « zéro jargon » — définitions courtes + exemple. */

export type LexiconEntry = {
  id: string;
  term: string;
  definition: string;
  example?: string;
};

export const LEXICON: LexiconEntry[] = [
  {
    id: "ai-act",
    term: "AI Act",
    definition: "La loi européenne qui encadre l'IA.",
    example:
      "Elle demande des mesures pour favoriser le développement de la maîtrise de l'IA (Art. 4).",
  },
  {
    id: "art4",
    term: "Article 4",
    definition:
      "Depuis fév. 2025 : prendre des mesures pour favoriser le développement de la maîtrise de l'IA — pas garantir un niveau individuel. Pas de plafond d'amende propre à cet article ; des sanctions ou mesures d'exécution restent possibles.",
    example: "Cette formation en fait partie. L'attestation prouve le suivi.",
  },
  {
    id: "art5",
    term: "Pratiques interdites",
    definition: "Usages d'IA carrément interdits (Art. 5).",
    example:
      "Inférer les émotions d'un collègue (hors exceptions limitées), ou déduire sa religion d'une photo.",
  },
  {
    id: "art50",
    term: "Transparence",
    definition: "Dire clairement quand c'est une IA (Art. 50).",
    example: "Un chatbot doit se présenter comme une IA.",
  },
  {
    id: "haut-risque",
    term: "Haut risque",
    definition:
      "Niveau AI Act (annexe III) selon la finalité du système — ex. certains outils de recrutement. Un humain décide. Tous les outils RH ne sont pas automatiquement à haut risque.",
    example: "Tri de CV, évaluation de salariés…",
  },
  {
    id: "ia-generative",
    term: "IA générative",
    definition: "Une IA qui crée du texte, une image, un résumé…",
    example: "ChatGPT, Copilot, Gemini.",
  },
  {
    id: "deepfake",
    term: "Deepfake",
    definition: "Fausse vidéo, photo ou voix d'une vraie personne.",
    example: "Un faux appel du directeur pour un virement.",
  },
  {
    id: "hallucination",
    term: "Hallucination",
    definition: "Une réponse convaincante… mais fausse. Plausible ≠ vrai.",
    example: "Elle cite une étude qui n'existe pas.",
  },
  {
    id: "llm",
    term: "LLM",
    definition: "Le moteur texte derrière ChatGPT, Copilot… Il prédit le mot suivant.",
    example: "Pas de « compréhension » magique : du calcul de suite probable.",
  },
  {
    id: "prompt",
    term: "Prompt",
    definition: "La consigne que vous écrivez à l'IA. Objectif, contraintes, format.",
    example: "« Résume en 3 lignes. N'invente rien. »",
  },
  {
    id: "contexte",
    term: "Contexte",
    definition: "Ce que l'IA voit pour cette requête. Mémoire de travail, pas mémoire longue.",
    example: "Elle n'a que ce que vous lui donnez là — pas tout votre historique.",
  },
  {
    id: "deployeur",
    term: "Utilisateur / vendeur",
    definition:
      "Utilisateur = j'utilise une IA déjà en vente. Vendeur = je la fabrique ou la mets sur le marché sous ma marque.",
    example: "ChatGPT au bureau = vous utilisez. Cas le plus courant.",
  },
  {
    id: "donnee-perso",
    term: "Donnée personnelle",
    definition: "Info qui permet de reconnaître une personne.",
    example: "Nom, mail, photo, téléphone.",
  },
  {
    id: "shadow-ai",
    term: "Outil en cachette",
    definition: "Utiliser une IA sans que l'entreprise le sache.",
    example: "ChatGPT perso avec des fichiers clients.",
  },
  {
    id: "referent",
    term: "Référent IA",
    definition: "La personne à qui poser vos questions sur l'IA.",
    example: "« Cette IA est-elle autorisée ? »",
  },
  {
    id: "dpo",
    term: "DPO",
    definition:
      "Délégué à la protection des données : la personne qui veille au respect du RGPD dans l'entreprise.",
    example: "En cas d'erreur avec des données personnelles, vous le prévenez aussi.",
  },
  {
    id: "supervision-humaine",
    term: "Supervision humaine",
    definition: "Un humain garde le dernier mot, pas l'IA seule.",
    example: "Valider une décision avant de l'appliquer.",
  },
  {
    id: "omnibus",
    term: "Omnibus",
    definition:
      "Règlement (UE) 2026/1744 (Digital Omnibus on AI), adopté et en vigueur : reformule l'art. 4 (« favoriser le développement de la maîtrise ») et reporte certaines échéances haut risque (ex. emploi / recrutement).",
    example: "Le geste du quotidien ne change pas : un humain garde la décision.",
  },
];
