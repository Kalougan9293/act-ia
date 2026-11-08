/** Lexique « zéro jargon » — définitions courtes + exemple. */

export type LexiconLaw = "AI Act" | "RGPD";

export type LexiconEntry = {
  id: string;
  term: string;
  definition: string;
  example?: string;
  /** Texte de loi concerné — affiché sur la fiche pour lever l'ambiguïté. */
  law?: LexiconLaw;
};

export const LEXICON: LexiconEntry[] = [
  {
    id: "ai-act",
    term: "AI Act",
    definition: "La loi européenne qui encadre l'IA.",
    example:
      "Elle demande des mesures pour favoriser le développement de la maîtrise de l'IA (AI Act, art. 4).",
    law: "AI Act",
  },
  {
    id: "rgpd",
    term: "RGPD",
    definition:
      "La loi européenne qui protège les données personnelles, avec ou sans IA.",
    example: "Nom, mail, photo, voix : ce sont des données personnelles.",
    law: "RGPD",
  },
  {
    id: "art4",
    term: "Article 4",
    definition:
      "Dans l'AI Act : depuis février 2025, l'entreprise doit aider celles et ceux qui utilisent l'IA à mieux la maîtriser. Elle n'a pas à certifier le niveau de chaque personne : elle doit surtout proposer des mesures concrètes.",
    example: "Cette formation en est une. L'attestation prouve le suivi.",
    law: "AI Act",
  },
  {
    id: "art5",
    term: "Pratiques interdites",
    definition: "Ce que l'IA n'a pas le droit de faire (AI Act, art. 5).",
    example:
      "Inférer les émotions d'un collègue (hors exceptions limitées), ou déduire sa religion d'une photo.",
    law: "AI Act",
  },
  {
    id: "art50",
    term: "Transparence",
    definition: "Dire clairement quand c'est une IA (AI Act, art. 50).",
    example: "Un chatbot doit se présenter comme une IA.",
    law: "AI Act",
  },
  {
    id: "haut-risque",
    term: "Haut risque",
    definition:
      "Usage d'IA qui touche fort les personnes : un humain doit garder la décision finale.",
    example: "Tri de CV, évaluation de salariés… Pas tous les outils RH.",
    law: "AI Act",
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
    law: "AI Act",
  },
  {
    id: "donnee-perso",
    term: "Donnée personnelle",
    definition: "Info qui permet de reconnaître une personne.",
    example: "Nom, mail, photo, téléphone.",
    law: "RGPD",
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
    law: "RGPD",
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
      "Règlement (UE) 2026/1744 (Digital Omnibus on AI), adopté et en vigueur : reformule l'art. 4 de l'AI Act (« favoriser le développement de la maîtrise ») et reporte certaines échéances haut risque (ex. emploi / recrutement).",
    example: "Le geste du quotidien ne change pas : un humain garde la décision.",
    law: "AI Act",
  },
];
