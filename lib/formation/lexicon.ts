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
    example: "Elle demande de former les équipes (Art. 4).",
  },
  {
    id: "art4",
    term: "Article 4",
    definition: "Obligation depuis fév. 2025 : former les utilisateurs d'IA.",
    example: "Votre attestation de suivi est la preuve.",
  },
  {
    id: "art5",
    term: "Pratiques interdites",
    definition: "Usages d'IA carrément interdits (Art. 5).",
    example: "Noter les émotions des salariés au travail.",
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
    definition: "IA très encadrée (ex. tri de CV). Un humain décide.",
    example: "Recrutement, notes de salariés…",
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
    term: "Déployeur / fournisseur",
    definition: "Déployeur = j'utilise une IA. Fournisseur = je la fabrique ou la vends.",
    example: "ChatGPT au bureau = votre entreprise est déployeur.",
  },
  {
    id: "donnee-perso",
    term: "Donnée personnelle",
    definition: "Info qui permet de reconnaître une personne.",
    example: "Nom, mail, photo, téléphone.",
  },
  {
    id: "shadow-ai",
    term: "Shadow AI",
    definition: "Utiliser une IA en cachette, sans accord.",
    example: "ChatGPT perso avec des fichiers clients.",
  },
  {
    id: "referent",
    term: "Référent IA",
    definition: "La personne à qui poser vos questions sur l'IA.",
    example: "« Cet outil est-il autorisé ? »",
  },
  {
    id: "supervision-humaine",
    term: "Supervision humaine",
    definition: "Un humain garde le dernier mot, pas l'IA seule.",
    example: "Valider une décision avant de l'appliquer.",
  },
];
