/** Banque d'évaluation — questions courtes, orales, anti-doublon par thème. */

export type QuizQuestion = {
  id: string;
  /** Bloc pédagogique, pour le tirage « au moins 3 questions par bloc ». */
  blockId: string;
  /** Thème anti-doublon : au plus une question par thème dans un tirage. */
  theme?: string;
  prompt: string;
  choices: [string, string, string] | [string, string];
  correctIndex: 0 | 1 | 2;
  explanation: string;
};

export const QUIZ_DRAW_SIZE = 20;
export const QUIZ_PASS_PERCENT = 80;
/** Équivalent lisible : 16 / 20. */
export const QUIZ_PASS_COUNT = 16;
/** Chrono indicatif (ne coupe pas l'examen). ~45 s par question. */
export const QUIZ_TIMER_SECONDS = 15 * 60;
export const POSITIONING_MIN = 6;
export const POSITIONING_MAX = 8;

/**
 * Banque du socle — 36 questions.
 * Choix courts (longueur comparable). Explications en « Pourquoi ? ».
 * Au moins 3 par bloc pour le tirage (20 questions).
 */
export const SOCLE_QUESTION_BANK: QuizQuestion[] = [
  {
    id: "q1",
    blockId: "bloc-1",
    theme: "art4-why",
    prompt: "Pourquoi votre entreprise vous forme-t-elle à l'IA ?",
    choices: [
      "La loi (Art. 4) lui demande d'aider ses équipes",
      "Pour un diplôme européen obligatoire",
      "Parce que l'IA est interdite sans ce parcours",
    ],
    correctIndex: 0,
    explanation:
      "Pourquoi ? Depuis fév. 2025, l'AI Act Art. 4 exige de former. L'attestation est la preuve.",
  },
  {
    id: "q2",
    blockId: "bloc-1",
    theme: "gen-def",
    prompt: "Une IA qui crée (IA générative), c'est…",
    choices: [
      "Un outil qui crée texte, image ou son",
      "Uniquement un filtre anti-spam",
      "Un robot physique en usine",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? ChatGPT, Copilot, Gemini créent. Le filtre anti-spam, lui, classe.",
  },
  {
    id: "q3",
    blockId: "bloc-1",
    theme: "hallucination",
    prompt: "L'IA invente un fait avec un ton très sûr. On parle d'…",
    choices: [
      "Hallucination (l'IA invente)",
      "Antivirus",
      "Mise à jour obligatoire",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Convaincant ≠ vrai. Chiffres, études, lois : on vérifie.",
  },
  {
    id: "q4",
    blockId: "bloc-1",
    theme: "verify-habit",
    prompt: "Avant d'utiliser une réponse d'IA, vous…",
    choices: [
      "Vérifiez chiffres, sources et lois importantes",
      "Copiez tel quel : le ton est sûr",
      "Envoyez d'abord, vérifiez si on se plaint",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Bien écrit ne veut pas dire vrai. Plausible ≠ vrai.",
  },
  {
    id: "q5",
    blockId: "bloc-5",
    theme: "deepfake-def",
    prompt: "Un deepfake, c'est…",
    choices: [
      "Une fausse vidéo, voix ou image faite à l'IA",
      "Un antivirus",
      "Un type de contrat RH",
    ],
    correctIndex: 0,
    explanation:
      "C'est une vidéo, une photo ou une voix générée qui imite une vraie personne. Une image nette ne prouve plus que c'est vrai.",
  },
  {
    id: "q6",
    blockId: "bloc-1",
    theme: "llm",
    prompt: "Un LLM, c'est…",
    choices: [
      "Le moteur texte derrière ChatGPT ou Copilot",
      "Un badge d'accès",
      "Un réseau social",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Il prédit le mot suivant, le plus probable. Pas une magie de compréhension.",
  },
  {
    id: "q7",
    blockId: "bloc-2",
    theme: "art4-date",
    prompt: "Depuis quand l'article 4 s'applique ?",
    choices: [
      "2 février 2025",
      "2 décembre 2027 seulement",
      "Il n'est pas encore en vigueur",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Former les équipes est déjà obligatoire depuis fév. 2025.",
  },
  {
    id: "q8",
    blockId: "bloc-2",
    theme: "role-user",
    prompt: "Vous rédigez vos mails avec ChatGPT. Votre rôle ?",
    choices: [
      "J'utilise un outil (cas le plus courant)",
      "Je vends une IA sous ma marque",
      "Aucune règle ne me concerne",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Utiliser un outil du marché = déployeur. Cas normal du salarié.",
  },
  {
    id: "q9",
    blockId: "bloc-2",
    theme: "chatbot-label",
    prompt: "Un chatbot répond aux clients sur le site. Que faire ?",
    choices: [
      "Indiquer clairement que c'est une IA",
      "Rien : le client s'en doute",
      "Cacher que c'est une IA",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Art. 50 : le client doit savoir qu'il parle à une machine.",
  },
  {
    id: "q10",
    blockId: "bloc-5",
    theme: "deepfake-label",
    prompt: "Votre entreprise publie une fausse vidéo d'un vrai salarié. Elle doit…",
    choices: [
      "Dire clairement que c'est généré par IA",
      "Publier sans rien dire si on a relu",
      "Interdire toute vidéo, même avec mention",
    ],
    correctIndex: 0,
    explanation:
      "Même si le texte est exact, vous indiquez que la vidéo est générée. Relire ne suffit pas : la personne qui regarde doit le voir.",
  },
  {
    id: "q11",
    blockId: "bloc-2",
    theme: "high-risk-hr",
    prompt: "Une IA qui trie des CV, c'est…",
    choices: [
      "Haut risque : un humain garde la décision",
      "Sans aucune règle",
      "Interdit dans tous les cas",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Le recrutement est très encadré. L'humain tranche.",
  },
  {
    id: "q12",
    blockId: "bloc-2",
    theme: "forbidden",
    prompt: "Noter les gens selon leur vie sociale avec une IA ?",
    choices: [
      "Interdit",
      "Autorisé si c'est payant",
      "Autorisé avec un bandeau",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Pratique interdite (AI Act, Art. 5).",
  },
  {
    id: "q13",
    blockId: "bloc-3",
    theme: "health",
    prompt: "Coller un arrêt maladie dans ChatGPT grand public ?",
    choices: [
      "Non : la santé est en rouge",
      "Oui si on efface seulement le nom",
      "Oui : c'est pour aider",
    ],
    correctIndex: 0,
    explanation:
      "Un arrêt parle de santé. L'outil n'est pas un carnet privé : le texte peut être enregistré. Vous ne le collez pas.",
  },
  {
    id: "q14",
    blockId: "bloc-3",
    theme: "secret",
    prompt: "Un business plan sans aucun nom, c'est…",
    choices: [
      "Un secret d'entreprise (rouge)",
      "Une donnée de santé",
      "Une info libre à coller partout",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Pas de nom ≠ pas de secret. Ça reste rouge.",
  },
  {
    id: "q15",
    blockId: "bloc-3",
    theme: "tool-auth",
    prompt: "Avant d'utiliser un nouvel outil IA au travail :",
    choices: [
      "Je vérifie qu'il est autorisé",
      "Je l'installe : le gratuit est OK",
      "Je demande seulement après un incident",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Outil validé d'abord. Payant ≠ sûr.",
  },
  {
    id: "q16",
    blockId: "bloc-3",
    theme: "recording",
    prompt: "Vous enregistrez une réunion avec des externes. Vous…",
    choices: [
      "Prévenez tout le monde avant",
      "Prévenez seulement les collègues",
      "N'avez rien à dire",
    ],
    correctIndex: 0,
    explanation:
      "Vous prévenez tout le monde avant d'enregistrer, y compris les personnes extérieures. Leur voix est une information personnelle, comme celle de vos collègues.",
  },
  {
    id: "q17",
    blockId: "bloc-3",
    theme: "incident",
    prompt: "Vous avez collé un fichier client par erreur. Vous…",
    choices: [
      "Prévenez tout de suite (manager / référent / DPO)",
      "Attendez de voir si ça se sait",
      "Effacez l'historique et gardez le silence",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? L'entreprise n'a parfois que 72 h. Le dire vite vous protège.",
  },
  {
    id: "q18",
    blockId: "bloc-3",
    theme: "minimize",
    prompt: "Dans un prompt, le mieux c'est…",
    choices: [
      "Enlever noms, mails et infos inutiles",
      "Coller tout le dossier",
      "Ajouter le plus de détails perso possible",
    ],
    correctIndex: 0,
    explanation:
      "Vous ne donnez que ce qui sert à la tâche. Un prénom inutile ne part pas dans l'outil.",
  },
  {
    id: "q19",
    blockId: "bloc-4",
    theme: "verify-source",
    prompt: "L'IA cite une étude avec un chiffre précis. Vous…",
    choices: [
      "Ouvrez le lien et vérifiez",
      "Faites confiance : le ton est pro",
      "Arrondissez le chiffre et c'est bon",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? L'IA invente souvent des études qui sonnent juste.",
  },
  {
    id: "q20",
    blockId: "bloc-5",
    theme: "deepfake-fraud",
    prompt: "Visio urgente : le « directeur » demande un virement. Vous…",
    choices: [
      "Raccrochez et rappelez sur un numéro connu",
      "Obéissez : voix et visage correspondent",
      "Demandez l'IBAN dans le chat de la visio",
    ],
    correctIndex: 0,
    explanation:
      "Une voix et un visage justes ne prouvent plus rien. Vous vérifiez sur un numéro que vous connaissez déjà, pas depuis le message urgent.",
  },
  {
    id: "q21",
    blockId: "bloc-4",
    theme: "copyright",
    prompt: "Une image 100 % créée par IA est toujours libre de droits ?",
    choices: [
      "Faux",
      "Vrai",
      "Vrai si l'outil est gratuit",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Elle peut copier une œuvre, un logo ou un visage.",
  },
  {
    id: "q22",
    blockId: "bloc-4",
    theme: "agent-action",
    prompt: "L'assistant propose d'envoyer seul des contrats. Vous…",
    choices: [
      "Refusez : il n'agit pas seul sur l'irréversible",
      "Acceptez : il a lu la consigne",
      "Acceptez si le domaine du mail est connu",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Résumer oui. Envoyer des contrats, non.",
  },
  {
    id: "q23",
    blockId: "bloc-4",
    theme: "bias",
    prompt: "Une IA de tri de CV peut être injuste. Donc…",
    choices: [
      "Un humain garde la décision finale",
      "On laisse l'IA trancher pour plus d'équité",
      "On interdit toute aide à la rédaction",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? L'IA aide. Elle n'écarte pas seule un candidat.",
  },
  {
    id: "q24",
    blockId: "bloc-4",
    theme: "rgpd",
    prompt: "Le RGPD interdit-il toute IA en entreprise ?",
    choices: [
      "Non",
      "Oui, totalement",
      "Oui, sauf pour les RH",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Le RGPD n'interdit pas l'IA. Il encadre les données.",
  },
  {
    id: "q25",
    blockId: "bloc-4",
    theme: "auto-decision",
    prompt: "L'IA veut envoyer seule les refus aux candidats. Vous…",
    choices: [
      "Vous lisez, et c'est vous qui validez l'envoi",
      "Vous la laissez envoyer pour gagner du temps",
      "Vous laissez faire si le ton est poli",
    ],
    correctIndex: 0,
    explanation:
      "Un refus est une décision sur une personne. L'outil peut préparer le brouillon. C'est vous qui décidez de l'envoyer.",
  },
  {
    id: "q26",
    blockId: "bloc-3",
    theme: "green-mail",
    prompt: "Reformuler un mail d'équipe, sans nom et sans secret. Vous pouvez ?",
    choices: [
      "Oui, puis je relis avant d'envoyer",
      "Non, tout mail est interdit",
      "Oui, sans relire",
    ],
    correctIndex: 0,
    explanation:
      "S'il n'y a ni personne identifiable ni secret, vous pouvez demander une reformulation. Vous relisez quand même avant d'envoyer.",
  },
  {
    id: "q27",
    blockId: "bloc-4",
    theme: "human-decide",
    prompt: "Qui décide sur un paiement ou un envoi important ?",
    choices: [
      "Un humain",
      "L'IA, si le score de confiance est haut",
      "Le premier qui clique",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? L'IA propose. Vous validez.",
  },
  {
    id: "q28",
    blockId: "bloc-3",
    theme: "health-stop",
    prompt: "Effacer le prénom suffit-il pour coller un dossier médical ?",
    choices: [
      "Non : la santé ne part pas dans un outil grand public",
      "Oui, si c'est pour aider quelqu'un",
      "Oui, dès que le prénom a disparu",
    ],
    correctIndex: 0,
    explanation:
      "Enlever le prénom ne suffit pas. Un dossier médical reste une information de santé. Vous ne le collez pas.",
  },
  {
    id: "q29",
    blockId: "bloc-4",
    theme: "human-oversight",
    prompt: "Cliquer « valider » sans lire la proposition de l'IA, c'est…",
    choices: [
      "Pas un vrai contrôle humain",
      "Suffisant si l'outil est payant",
      "Recommandé pour aller plus vite",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Décider = pouvoir comprendre, modifier, refuser.",
  },
  {
    id: "q30",
    blockId: "bloc-6",
    theme: "ask-doubt",
    prompt: "Vous avez un doute sur une info à coller. Vous…",
    choices: [
      "Demandez avant (manager / référent)",
      "Testez avec le vrai fichier",
      "Attendez qu'un incident arrive",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? On ne teste pas avec une info sensible. Demander n'est jamais une erreur.",
  },
  {
    id: "q31",
    blockId: "bloc-6",
    theme: "declare-usage",
    prompt: "Un usage d'IA devient régulier dans l'équipe. Vous…",
    choices: [
      "Le déclarez (manager / référent / registre)",
      "Le gardez informel : ça marche",
      "Le déclarez seulement s'il y a de la santé",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Un usage qui dure ne reste pas dans l'ombre (anti Shadow AI).",
  },
  {
    id: "q32",
    blockId: "bloc-6",
    theme: "seven-reflexes",
    prompt: "Les 7 réflexes servent à…",
    choices: [
      "Vérifier avant et après chaque usage d'IA",
      "Remplacer le quiz final",
      "Configurer le serveur de l'entreprise",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Checklist simple à garder près de l'écran.",
  },
  {
    id: "q33",
    blockId: "bloc-6",
    theme: "tool-list",
    prompt: "L'outil n'est pas sur la liste autorisée. Vous…",
    choices: [
      "Ne l'utilisez pas pour le travail",
      "L'utilisez en navigation privée",
      "L'utilisez si vos collègues le font",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Outil non listé = Shadow AI. On demande avant.",
  },
  {
    id: "q34",
    blockId: "bloc-6",
    theme: "attestation",
    prompt: "Après le parcours, l'attestation prouve…",
    choices: [
      "Que vous avez suivi la formation (Art. 4)",
      "Que l'entreprise est certifiée IA Act à vie",
      "Que vous êtes juriste IA",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Preuve de suivi. Pas un diplôme, pas une certification d'entreprise.",
  },
  {
    id: "q35",
    blockId: "bloc-2",
    theme: "calendar-2026",
    prompt: "Le 2 décembre 2026, qu'est-ce qui change surtout ?",
    choices: [
      "De nouvelles interdictions (ex. contenus intimes non consentis)",
      "La fin de toute obligation de formation",
      "L'interdiction de ChatGPT en Europe",
    ],
    correctIndex: 0,
    explanation:
      "À cette date, l'IA qui fabrique une image ou une vidéo intime d'une personne sans son accord devient explicitement interdite. La formation, elle, est déjà obligatoire depuis 2025.",
  },
  {
    id: "q36",
    blockId: "bloc-1",
    theme: "how-ai-works",
    prompt: "Quand l'IA écrit, elle calcule surtout…",
    choices: [
      "La suite la plus probable",
      "La vérité absolue dans une base officielle",
      "Le sentiment de votre manager",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Probable ≠ vrai. D'où la vérification.",
  },
];

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

const QUIZ_MIN_PER_BLOCK = 3;

function takeUniqueThemes(
  pool: QuizQuestion[],
  count: number,
  usedThemes: Set<string>,
): { taken: QuizQuestion[]; rest: QuizQuestion[] } {
  const mixed = shuffle(pool);
  const taken: QuizQuestion[] = [];
  const deferred: QuizQuestion[] = [];
  for (const question of mixed) {
    if (taken.length >= count) {
      deferred.push(question);
      continue;
    }
    if (question.theme && usedThemes.has(question.theme)) {
      deferred.push(question);
      continue;
    }
    taken.push(question);
    if (question.theme) usedThemes.add(question.theme);
  }
  while (taken.length < count && deferred.length > 0) {
    taken.push(deferred.shift()!);
  }
  return { taken, rest: deferred };
}

/** Tirage du QCM final : 20 questions, ≥3 par bloc, thèmes non doublonnés si possible. */
export function drawSocleQuiz(size = QUIZ_DRAW_SIZE): QuizQuestion[] {
  const byBlock = new Map<string, QuizQuestion[]>();
  for (const question of SOCLE_QUESTION_BANK) {
    const list = byBlock.get(question.blockId) ?? [];
    list.push(question);
    byBlock.set(question.blockId, list);
  }

  const usedThemes = new Set<string>();
  const picked: QuizQuestion[] = [];
  const leftovers: QuizQuestion[] = [];
  for (const pool of byBlock.values()) {
    const { taken, rest } = takeUniqueThemes(
      pool,
      Math.min(QUIZ_MIN_PER_BLOCK, pool.length),
      usedThemes,
    );
    picked.push(...taken);
    leftovers.push(...rest);
  }

  const { taken: extra, rest: unused } = takeUniqueThemes(
    leftovers,
    Math.max(0, size - picked.length),
    usedThemes,
  );
  picked.push(...extra);
  while (picked.length < size && unused.length > 0) {
    picked.push(unused.pop()!);
  }
  return shuffle(picked).slice(0, size);
}

/**
 * Positionnement : 8 questions oui/non. Pas de bonne ni mauvaise réponse.
 * Le message de fin compte les « Oui » (index 0). Pas de « Je ne sais pas ».
 */
export const POSITIONING_BANK: QuizQuestion[] = [
  {
    id: "pos-1",
    blockId: "positioning",
    theme: "pos-used",
    prompt: "Avez-vous déjà utilisé ChatGPT, Gemini, Copilot ou une autre IA ?",
    choices: ["Oui", "Non"],
    correctIndex: 0,
    explanation: "Que vous découvriez ou que vous pratiquiez déjà, la suite est faite pour vous.",
  },
  {
    id: "pos-2",
    blockId: "positioning",
    theme: "pos-phone",
    prompt: "Avez-vous une application d'IA sur votre téléphone ?",
    choices: ["Oui", "Non"],
    correctIndex: 0,
    explanation: "Beaucoup de gens en ont une. Ici, on voit comment s'en servir sans risque au travail.",
  },
  {
    id: "pos-3",
    blockId: "positioning",
    theme: "pos-image",
    prompt: "Avez-vous déjà créé une image avec l'IA ?",
    choices: ["Oui", "Non"],
    correctIndex: 0,
    explanation: "C'est courant. On verra, le moment venu, ce que vous pouvez publier.",
  },
  {
    id: "pos-4",
    blockId: "positioning",
    theme: "pos-deepfake",
    prompt: "Savez-vous ce qu'est un deepfake ?",
    choices: ["Oui", "Non"],
    correctIndex: 0,
    explanation: "Si non, ce n'est pas un problème. On l'expliquera dans son propre bloc, avec des cas concrets.",
  },
  {
    id: "pos-5",
    blockId: "positioning",
    theme: "pos-work",
    prompt: "Utilisez-vous parfois l'IA pour votre travail ?",
    choices: ["Oui", "Non"],
    correctIndex: 0,
    explanation: "Si oui, ces réflexes vous protègent tout de suite. Si non, vous saurez quoi faire le jour où vous vous en servirez.",
  },
  {
    id: "pos-6",
    blockId: "positioning",
    theme: "pos-auth",
    prompt: "Savez-vous quelles IA votre entreprise autorise ?",
    choices: ["Oui", "Non"],
    correctIndex: 0,
    explanation: "Si vous ne le savez pas, le réflexe est simple : vous demandez avant d'utiliser un outil.",
  },
  {
    id: "pos-7",
    blockId: "positioning",
    theme: "pos-verify",
    prompt: "Avez-vous déjà vérifié si une réponse de l'IA était vraie ?",
    choices: ["Oui", "Non"],
    correctIndex: 0,
    explanation: "C'est le bon réflexe. L'outil peut écrire quelque chose de faux avec un ton très sûr.",
  },
  {
    id: "pos-8",
    blockId: "positioning",
    theme: "pos-personal",
    prompt: "Savez-vous ce qu'est une donnée personnelle ?",
    choices: ["Oui", "Non"],
    correctIndex: 0,
    explanation: "C'est une information qui permet de reconnaître quelqu'un : un nom, un e-mail, une photo, un numéro.",
  },
];

/** 8 questions. Non éliminatoire. Ordre mélangé. */
export function drawPositioningQuiz(): QuizQuestion[] {
  return shuffle(POSITIONING_BANK).slice(0, POSITIONING_BANK.length);
}
