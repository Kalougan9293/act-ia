/** Banque d'évaluation — questions courtes, orales, anti-doublon par thème. */

export type QuizQuestion = {
  id: string;
  /** Bloc pédagogique, pour le tirage « au moins 3 questions par bloc ». */
  blockId: string;
  /** Thème anti-doublon : au plus une question par thème dans un tirage. */
  theme?: string;
  /** Famille de compétence (tirage : 1 question par famille). */
  famille?: string;
  prompt: string;
  choices: [string, string, string] | [string, string];
  correctIndex: 0 | 1 | 2;
  explanation: string;
  /** Message selon la réponse choisie (même ordre que `choices`). */
  explanations?: [string, string] | [string, string, string];
};

export const QUIZ_DRAW_SIZE = 20;
export const QUIZ_PASS_PERCENT = 80;
/** Équivalent lisible : 16 / 20. */
export const QUIZ_PASS_COUNT = 16;
/** Chrono indicatif (ne coupe pas l'examen). ~36 s par question. */
export const QUIZ_TIMER_SECONDS = 12 * 60;
export const POSITIONING_MIN = 6;
export const POSITIONING_MAX = 8;

/**
 * Banque du socle — 35 questions.
 * Distracteurs crédibles. Vocabulaire aligné sur le parcours.
 * Tirage : ≥3 par bloc, thèmes non doublonnés si possible.
 */
export const SOCLE_QUESTION_BANK: QuizQuestion[] = [
  {
    id: "q1",
    blockId: "bloc-1",
    theme: "art4-why",
    famille: "F01",
    prompt: "Pourquoi votre entreprise vous propose-t-elle cette formation ?",
    choices: [
      "La loi lui demande de prendre des mesures pour soutenir la maîtrise de l'IA",
      "Parce qu'un diplôme européen est obligatoire pour chaque salarié",
      "Parce que toute IA est interdite sans ce parcours",
    ],
    correctIndex: 0,
    explanation:
      "Pourquoi ? Depuis fév. 2025 (Art. 4), l'entreprise doit soutenir la maîtrise de l'IA — pas garantir un niveau pour chaque personne. Cette formation en fait partie. L'attestation est la preuve du suivi.",
  },
  {
    id: "q2",
    blockId: "bloc-1",
    theme: "gen-def",
    famille: "F02",
    prompt: "Une IA générative, c'est surtout…",
    choices: [
      "Un outil qui crée du texte, une image ou un résumé",
      "Uniquement un filtre qui range les mails",
      "Un outil qui ne fait que calculer un itinéraire",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? ChatGPT, Copilot, Gemini créent. Le filtre anti-spam, lui, classe.",
  },
  {
    id: "q3",
    blockId: "bloc-1",
    theme: "hallucination",
    famille: "F03",
    prompt: "L'IA invente un fait avec un ton très sûr. On parle d'…",
    choices: [
      "Hallucination",
      "Un biais",
      "Un prompt",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Convaincant ≠ vrai. Chiffres, études, dates : on vérifie.",
  },
  {
    id: "q4",
    blockId: "bloc-1",
    theme: "verify-habit",
    famille: "F03",
    prompt: "Avant d'utiliser une réponse d'IA au travail, vous…",
    choices: [
      "Vérifiez ce qui compte : chiffres, noms, sources",
      "Copiez tel quel : le ton est professionnel",
      "Envoyez d'abord, vérifiez seulement si on se plaint",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Bien écrit ne veut pas dire vrai.",
  },
  {
    id: "q5",
    blockId: "bloc-5",
    theme: "deepfake-def",
    famille: "F19",
    prompt: "Un deepfake, c'est…",
    choices: [
      "Un mail urgent du vrai directeur",
      "Une fausse vidéo, voix ou image faite à l'IA",
      "Un résumé de réunion un peu imprécis",
    ],
    correctIndex: 1,
    explanation:
      "C'est une vidéo, une photo ou une voix générée qui imite une vraie personne. Une image nette ne prouve plus que c'est vrai.",
  },
  {
    id: "q6",
    blockId: "bloc-1",
    theme: "llm",
    famille: "F02",
    prompt: "Un LLM, c'est…",
    choices: [
      "Le moteur texte derrière ChatGPT ou Copilot",
      "La liste des outils autorisés par l'entreprise",
      "Le score de confiance affiché par l'outil",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Il prédit le mot suivant, le plus probable. Pas une magie de compréhension.",
  },
  {
    id: "q7",
    blockId: "bloc-2",
    theme: "art4-date",
    famille: "F01",
    prompt: "Depuis quand l'article 4 s'applique ?",
    choices: [
      "2 février 2025",
      "2 août 2025",
      "2 décembre 2027 seulement",
    ],
    correctIndex: 0,
    explanation:
      "Pourquoi ? Depuis le 2 février 2025 — pas le 2 août 2025. L'entreprise doit déjà prendre des mesures pour soutenir la maîtrise de l'IA. Août 2025 concerne surtout d'autres règles (modèles à usage général). 2027, c'est surtout le haut risque recrutement.",
  },
  {
    id: "q8",
    blockId: "bloc-2",
    theme: "role-user",
    famille: "F04",
    prompt: "Vous rédigez vos mails avec ChatGPT. Votre rôle ?",
    choices: [
      "J'utilise un outil (cas le plus courant)",
      "Je vends une IA sous la marque de mon entreprise",
      "Aucune règle ne me concerne",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Vous utilisez un outil déjà en vente. C'est le cas normal du salarié.",
  },
  {
    id: "q9",
    blockId: "bloc-2",
    theme: "chatbot-label",
    famille: "F07",
    prompt: "Un chatbot répond aux clients sur le site. Que retenir ?",
    choices: [
      "Il faut indiquer clairement que c'est une IA",
      "Rien : le client s'en doute forcément",
      "Il suffit de le mettre dans les conditions générales",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Art. 50 : la personne doit savoir qu'elle parle à une machine, au moment de l'échange.",
  },
  {
    id: "q10",
    blockId: "bloc-5",
    theme: "deepfake-label",
    famille: "F07",
    prompt: "Votre entreprise publie une fausse vidéo d'un vrai salarié. Elle doit…",
    choices: [
      "Publier sans rien dire si l'équipe a relu",
      "Dire clairement que c'est généré par IA, sans demander au salarié",
      "Obtenir l'accord du salarié et indiquer clairement que c'est généré par IA",
    ],
    correctIndex: 2,
    explanation:
      "Accord de la personne + mention claire. Relire ou seulement afficher « Générée par l'IA » ne suffit pas.",
  },
  {
    id: "q11",
    blockId: "bloc-2",
    theme: "high-risk-hr",
    famille: "F06",
    prompt: "Une IA qui trie des CV, c'est…",
    choices: [
      "Du haut risque : un humain garde la décision finale",
      "Du risque minimal : aucune règle particulière",
      "Interdit dans tous les cas",
    ],
    correctIndex: 0,
    explanation:
      "Pourquoi ? L'humain tranche. Les règles AI Act « haut risque » RH sont renforcées plus tard, mais le RGPD (art. 22) s'applique déjà.",
  },
  {
    id: "q12",
    blockId: "bloc-2",
    theme: "forbidden",
    famille: "F05",
    prompt:
      "Un prestataire propose un outil qui analyse les visios d'équipe pour repérer qui semble démotivé. Que retenez-vous ?",
    choices: [
      "C'est possible si l'équipe est prévenue",
      "C'est interdit au travail : on ne l'utilise pas",
      "C'est possible si seul le manager voit les résultats",
    ],
    correctIndex: 1,
    explanation:
      "Déduire les émotions des salariés avec une IA est en principe interdit au travail (Art. 5), hors exceptions très limitées — même si l'équipe est prévenue.",
  },
  {
    id: "q13",
    blockId: "bloc-3",
    theme: "health",
    famille: "F08",
    prompt: "Mettre un arrêt maladie dans ChatGPT grand public ?",
    choices: [
      "Oui si on efface seulement le nom",
      "Non : c'est « Stop » — jamais dans un outil grand public",
      "Oui : c'est pour aider la personne",
    ],
    correctIndex: 1,
    explanation:
      "Un arrêt parle de santé. Règle de prudence : pas dans une IA grand public non autorisée — le texte peut être traité selon l'outil et le contrat.",
  },
  {
    id: "q14",
    blockId: "bloc-3",
    theme: "secret",
    famille: "F09",
    prompt: "Un business plan sans aucun nom, c'est…",
    choices: [
      "Une info libre, puisqu'il n'y a pas de nom",
      "Une donnée de santé",
      "Un secret d'entreprise : « Stop » dans un outil grand public",
    ],
    correctIndex: 2,
    explanation: "Pourquoi ? Pas de nom ≠ pas de secret. Ça reste « Stop ».",
  },
  {
    id: "q15",
    blockId: "bloc-3",
    theme: "tool-auth",
    famille: "F10",
    prompt: "Avant d'utiliser un nouvel outil IA au travail :",
    choices: [
      "Je vérifie qu'il est autorisé par l'entreprise",
      "Je l'installe : s'il est gratuit, c'est OK",
      "Je demande seulement après un incident",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Outil validé d'abord. Payant ne veut pas dire sûr. Gratuit ne veut pas dire interdit.",
  },
  {
    id: "q16",
    blockId: "bloc-3",
    theme: "recording",
    famille: "F12",
    prompt:
      "Visio avec un client. Votre outil de prise de notes IA, autorisé, rejoint l'appel automatiquement.",
    choices: [
      "Le client verra l'outil dans la liste des participants",
      "Je l'annonce au client dès le début, avant l'enregistrement",
      "Je l'annonce seulement si le client pose la question",
    ],
    correctIndex: 1,
    explanation:
      "Les personnes extérieures sont prévenues avant. Un nom dans la liste des participants ne suffit pas.",
  },
  {
    id: "q17",
    blockId: "bloc-3",
    theme: "incident",
    famille: "F13",
    prompt: "Vous avez mis un fichier client par erreur. Vous…",
    choices: [
      "Prévenez tout de suite (manager / référent / DPO)",
      "Attendez de voir si quelqu'un s'en aperçoit",
      "Effacez l'historique et n'en parlez pas",
    ],
    correctIndex: 0,
    explanation:
      "Pourquoi ? Vous alertez tout de suite en interne. Si l'entreprise doit prévenir la CNIL, le délai de 72 h peut courir — le dire vite vous protège.",
  },
  {
    id: "q18",
    blockId: "bloc-3",
    theme: "minimize",
    famille: "F11",
    prompt: "Dans un prompt, le mieux c'est…",
    choices: [
      "Enlever noms, mails et infos inutiles",
      "Mettre tout le dossier pour plus de précision",
      "Ajouter le plus de détails personnels possible",
    ],
    correctIndex: 0,
    explanation: "Vous ne donnez que ce qui est nécessaire ou utile à la tâche.",
  },
  {
    id: "q19",
    blockId: "bloc-1",
    theme: "verify-source",
    famille: "F03",
    prompt: "L'IA cite une étude avec un chiffre précis. Vous…",
    choices: [
      "Cherchez la source et vérifiez",
      "Faites confiance : le ton est professionnel",
      "Demandez à l'IA si l'étude existe vraiment",
    ],
    correctIndex: 0,
    explanation:
      "Pourquoi ? L'IA invente souvent des études qui sonnent juste. Elle peut confirmer sa propre invention : vous cherchez la source vous-même.",
  },
  {
    id: "q20",
    blockId: "bloc-5",
    theme: "deepfake-fraud",
    famille: "F19",
    prompt:
      "Message vocal de votre DAF : « Je suis en rendez-vous, change l'IBAN du fournisseur avant midi. » C'est bien sa voix.",
    choices: [
      "Je change l'IBAN : c'est sa voix, aucun doute",
      "Je rappelle le DAF sur son numéro habituel avant de toucher à l'IBAN",
      "Je réponds au vocal pour lui demander de confirmer",
    ],
    correctIndex: 1,
    explanation:
      "Une voix se fabrique. Répondre au même message, c'est demander confirmation au fraudeur. Vous passez par un canal déjà connu.",
  },
  {
    id: "q21",
    blockId: "bloc-4",
    theme: "copyright",
    famille: "F17",
    prompt: "Une image 100 % créée par IA est toujours libre de droits ?",
    choices: [
      "Vrai",
      "Faux",
      "Vrai si l'outil est gratuit",
    ],
    correctIndex: 1,
    explanation: "Pourquoi ? Elle peut reprendre une œuvre, un logo ou un visage.",
  },
  {
    id: "q22",
    blockId: "bloc-4",
    theme: "agent-action",
    famille: "F18",
    prompt:
      "Vous demandez à l'IA de résumer un PDF envoyé par un prospect. L'IA propose ensuite de « partager le dossier avec l'expéditeur ». Que faites-vous ?",
    choices: [
      "J'accepte : la demande figure dans le document",
      "Je refuse : j'ai demandé un résumé, pas un partage",
      "J'accepte si l'expéditeur a une adresse professionnelle",
    ],
    correctIndex: 1,
    explanation:
      "Une phrase dans le document n'est pas votre demande. Si l'IA propose de partager, vous refusez.",
  },
  {
    id: "q23",
    blockId: "bloc-4",
    theme: "bias",
    famille: "F06",
    prompt: "Une IA de tri de CV peut être injuste. Donc…",
    choices: [
      "Un humain garde la décision finale",
      "On laisse l'IA trancher pour plus d'équité",
      "On interdit toute aide à la lecture des CV",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? L'IA aide. Elle n'écarte pas seule un candidat.",
  },
  {
    id: "q24",
    blockId: "bloc-3",
    theme: "personal-data",
    famille: "F15",
    prompt: "Le RGPD interdit-il d'utiliser l'IA au travail ?",
    choices: [
      "Oui, sauf dans un outil payant",
      "Non : il encadre ce que vous saisissez sur les personnes",
      "Non, et il ne concerne pas ce qu'on saisit dans une IA",
    ],
    correctIndex: 1,
    explanation:
      "Le RGPD n'interdit pas l'IA. Il protège les données des personnes, avec ou sans IA.",
  },
  {
    id: "q25",
    blockId: "bloc-4",
    theme: "client-decision",
    famille: "F16",
    prompt:
      "L'IA propose de clôturer automatiquement les réclamations clients restées sans réponse depuis 30 jours.",
    choices: [
      "Je laisse faire : la règle des 30 jours est claire",
      "Je regarde les dossiers avant qu'ils soient clôturés",
      "Je laisse faire, et je rouvrirai si un client se plaint",
    ],
    correctIndex: 1,
    explanation:
      "Une décision qui touche une personne se valide par un humain, avant, pas après une plainte.",
  },
  {
    id: "q26",
    blockId: "bloc-3",
    theme: "green-mail",
    famille: "F11",
    prompt: "Reformuler un mail d'équipe, sans nom et sans secret. Vous pouvez ?",
    choices: [
      "Oui, puis je relis avant d'envoyer",
      "Non, seulement avec l'accord du manager",
      "Oui, sans relire",
    ],
    correctIndex: 0,
    explanation:
      "S'il n'y a ni personne identifiable ni secret, vous pouvez. Vous relisez quand même.",
  },
  {
    id: "q27",
    blockId: "bloc-4",
    theme: "human-decide",
    famille: "F16",
    prompt: "Qui décide sur un paiement ou un envoi important ?",
    choices: [
      "Un humain",
      "L'IA, si le score de confiance est haut",
      "L'outil, si un humain a configuré la règle au départ",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? L'IA propose. Vous validez.",
  },
  {
    id: "q28",
    blockId: "bloc-3",
    theme: "health-stop",
    famille: "F08",
    prompt: "Effacer le prénom suffit-il pour mettre un dossier médical dans une IA ?",
    choices: [
      "Non : la santé ne part pas dans un outil grand public",
      "Oui, si c'est pour aider quelqu'un",
      "Oui, dès que le prénom a disparu",
    ],
    correctIndex: 0,
    explanation:
      "Enlever le prénom ne suffit pas. Un dossier médical reste une information de santé.",
  },
  {
    id: "q29",
    blockId: "bloc-4",
    theme: "human-oversight",
    famille: "F16",
    prompt: "Cliquer « valider » sans lire la proposition de l'IA, c'est…",
    choices: [
      "Pas un vrai contrôle humain",
      "Suffisant si l'outil a déjà fait ses preuves",
      "Un vrai contrôle, puisque c'est vous qui cliquez",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Décider = pouvoir comprendre, modifier, refuser.",
  },
  {
    id: "q30",
    blockId: "bloc-3",
    theme: "ask-doubt",
    famille: "F13",
    prompt: "Vous avez un doute sur une info à saisir. Vous…",
    choices: [
      "Demandez avant (manager / référent)",
      "Collez l'info quand même pour voir ce que l'IA répond",
      "Attendez qu'un incident arrive",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? On ne teste pas avec une info sensible. Demander n'est jamais une erreur.",
  },
  {
    id: "q31",
    blockId: "bloc-3",
    theme: "declare-usage",
    famille: "F20",
    prompt: "Un usage d'IA devient régulier dans l'équipe. Vous…",
    choices: [
      "En parlez (manager ou référent IA)",
      "Le gardez informel : ça marche bien",
      "Le déclarez seulement s'il y a de la santé",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Un usage qui dure ne reste pas caché. L'entreprise doit savoir quels outils passent.",
  },
  {
    id: "q32",
    blockId: "bloc-6",
    theme: "seven-reflexes",
    famille: "F20",
    prompt: "Les 7 réflexes servent à…",
    choices: [
      "Vérifier avant et après chaque usage d'IA",
      "Vérifier seulement après un incident",
      "Remplacer la liste des outils autorisés",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Checklist simple à garder près de l'écran.",
  },
  {
    id: "q33",
    blockId: "bloc-3",
    theme: "tool-list",
    famille: "F10",
    prompt: "L'outil n'est pas sur la liste autorisée. Vous…",
    choices: [
      "Ne l'utilisez pas pour le travail, ou vous demandez",
      "L'utilisez en navigation privée",
      "L'utilisez si vos collègues le font déjà",
    ],
    correctIndex: 0,
    explanation: "Pourquoi ? Ce n'est pas la liste des collègues qui décide. Vous demandez avant.",
  },
  {
    id: "q35",
    blockId: "bloc-2",
    theme: "forbidden-photo",
    famille: "F05",
    prompt:
      "Pour adapter le planning des fêtes, un collègue veut faire deviner par une IA la religion des salariés à partir de leurs photos de profil.",
    choices: [
      "C'est possible, puisque c'est pour leur rendre service",
      "C'est interdit : on ne déduit pas la religion d'une photo",
      "C'est possible si les photos sont déjà sur l'intranet",
    ],
    correctIndex: 1,
    explanation: "Déduire la religion à partir d'une photo est interdit (Art. 5). L'intention ne change rien.",
  },
  {
    id: "q36",
    blockId: "bloc-1",
    theme: "how-ai-works",
    famille: "F02",
    prompt: "Quand l'IA écrit, elle calcule surtout…",
    choices: [
      "La vérité absolue dans une base officielle",
      "La suite la plus probable",
      "Ce que votre manager aurait voulu dire",
    ],
    correctIndex: 1,
    explanation: "Pourquoi ? Probable ≠ vrai. D'où la vérification.",
  },
  {
    id: "q37",
    blockId: "bloc-3",
    theme: "personal-data-indirect",
    famille: "F11",
    prompt:
      "Dans un message à l'IA, vous écrivez : « le responsable du seul magasin de Quimper, arrivé en janvier ». Est-ce une donnée personnelle ?",
    choices: [
      "Non : il n'y a ni nom ni e-mail",
      "Oui : on peut le reconnaître, même sans son nom",
      "Seulement si on ajoute sa photo",
    ],
    correctIndex: 1,
    explanation:
      "Une donnée personnelle, c'est tout ce qui permet de reconnaître quelqu'un, directement ou non.",
  },
  {
    id: "q38",
    blockId: "bloc-3",
    theme: "right-access",
    famille: "F14",
    prompt: "Un client vous appelle : il veut savoir quelles données l'entreprise a sur lui.",
    choices: [
      "Je lui envoie moi-même l'export du CRM",
      "Je transmets tout de suite sa demande au DPO ou au référent",
      "Je lui réponds que ce n'est pas possible",
    ],
    correctIndex: 1,
    explanation:
      "C'est son droit d'accès. Vous n'envoyez rien seul. L'entreprise a en général un mois pour répondre.",
  },
  {
    id: "q39",
    blockId: "bloc-3",
    theme: "right-human",
    famille: "F14",
    prompt:
      "Un candidat écarté par un tri 100 % automatique demande qu'une personne revoie son dossier.",
    choices: [
      "Impossible : le score de l'outil est définitif",
      "C'est son droit : un humain doit pouvoir revoir la décision",
      "Seulement s'il prouve que le score est faux",
    ],
    correctIndex: 1,
    explanation:
      "Le RGPD protège contre les décisions prises uniquement par une machine. La personne peut demander une intervention humaine.",
  },
  {
    id: "q40",
    blockId: "bloc-3",
    theme: "retention",
    famille: "F12",
    prompt: "Un enregistrement de réunion a servi à rédiger le compte rendu. Ensuite…",
    choices: [
      "On le garde sans limite, au cas où",
      "On le garde seulement le temps prévu par l'entreprise",
      "On le met sur le drive partagé pour les absents",
    ],
    correctIndex: 1,
    explanation:
      "On ne garde pas des données plus longtemps que nécessaire. « Au cas où » n'est pas une raison.",
  },
  {
    id: "q41",
    blockId: "bloc-3",
    theme: "sensitive",
    famille: "F08",
    prompt: "Laquelle de ces informations est une donnée sensible au sens du RGPD ?",
    choices: [
      "Son adresse e-mail professionnelle",
      "L'appartenance syndicale d'un salarié",
      "Son numéro de badge",
    ],
    correctIndex: 1,
    explanation:
      "Santé, religion, syndicat, origine… sont des données sensibles. Un e-mail ou un badge sont des données personnelles, pas sensibles.",
  },
  {
    id: "q42",
    blockId: "bloc-3",
    theme: "aiact-vs-rgpd",
    famille: "F15",
    prompt: "Quelle phrase est juste ?",
    choices: [
      "L'AI Act remplace le RGPD depuis 2025",
      "L'AI Act encadre les outils d'IA ; le RGPD protège les données des personnes, avec ou sans IA",
      "Le RGPD ne s'applique plus quand on utilise une IA",
    ],
    correctIndex: 1,
    explanation:
      "Les deux textes s'additionnent. Dès que vous saisissez des infos sur quelqu'un dans une IA, les deux comptent.",
  },
  {
    id: "q43",
    blockId: "bloc-4",
    theme: "copyright-text",
    famille: "F17",
    prompt:
      "L'IA vous propose un paragraphe pour le site. En vérifiant, vous retrouvez une phrase à l'identique sur le blog d'un concurrent.",
    choices: [
      "Je publie : c'est l'IA qui l'a écrit",
      "Je réécris vraiment ce passage",
      "Je change deux ou trois mots",
    ],
    correctIndex: 1,
    explanation:
      "Un texte recopié reste celui de quelqu'un d'autre. Changer quelques mots ne suffit pas.",
  },
  {
    id: "q44",
    blockId: "bloc-2",
    theme: "role-provider",
    famille: "F04",
    prompt:
      "Votre entreprise développe un assistant IA et le propose à ses clients sous son nom.",
    choices: [
      "C'est « j'utilise », comme ChatGPT",
      "C'est « je vends » : les obligations sont plus lourdes",
      "Peu importe, tant que c'est hébergé en Europe",
    ],
    correctIndex: 1,
    explanation:
      "Mettre une IA sur le marché sous votre marque, c'est le rôle « je vends ».",
  },
  {
    id: "q45",
    blockId: "bloc-4",
    theme: "agent-send",
    famille: "F16",
    prompt:
      "L'assistant a rédigé un mail de refus client et propose de l'envoyer tout de suite, sans relecture.",
    choices: [
      "J'envoie : le ton est professionnel",
      "Je relis et je valide moi-même avant tout envoi",
      "J'envoie si le destinataire est déjà client",
    ],
    correctIndex: 1,
    explanation:
      "L'outil peut préparer. Il n'envoie rien d'irréversible seul. C'est vous qui validez.",
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

/** Tirage du QCM final : 1 question par famille quand possible, sinon repli par bloc. */
export function drawSocleQuiz(size = QUIZ_DRAW_SIZE): QuizQuestion[] {
  const byFamille = new Map<string, QuizQuestion[]>();
  for (const question of SOCLE_QUESTION_BANK) {
    if (!question.famille) continue;
    const list = byFamille.get(question.famille) ?? [];
    list.push(question);
    byFamille.set(question.famille, list);
  }

  if (byFamille.size >= size) {
    const picked: QuizQuestion[] = [];
    for (const pool of byFamille.values()) {
      if (picked.length >= size) break;
      const [one] = shuffle(pool);
      if (one) picked.push(one);
    }
    return shuffle(picked).slice(0, size);
  }

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
 * Positionnement : 8 questions oui/non.
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
    explanation: "On y reviendra dans un bloc dédié, avec des cas concrets.",
  },
  {
    id: "pos-5",
    blockId: "positioning",
    theme: "pos-work",
    prompt: "Utilisez-vous parfois l'IA pour votre travail ?",
    choices: ["Oui", "Non"],
    correctIndex: 0,
    explanation: "Cette formation vous concerne directement.",
    explanations: [
      "Cette formation vous concerne directement.",
      "Vous saurez quoi faire le jour où vous l'utiliserez au travail.",
    ],
  },
  {
    id: "pos-6",
    blockId: "positioning",
    theme: "pos-tools",
    prompt: "Savez-vous quelles IA votre entreprise autorise ?",
    choices: ["Oui", "Non"],
    correctIndex: 0,
    explanation: "Le réflexe est simple : vous demandez avant d'utiliser un outil que vous ne connaissez pas.",
  },
  {
    id: "pos-7",
    blockId: "positioning",
    theme: "pos-verify",
    prompt: "Avez-vous déjà vérifié si une réponse de l'IA était vraie ?",
    choices: ["Oui", "Non"],
    correctIndex: 0,
    explanation: "L'outil peut écrire des choses erronées, avec un ton très sûr.",
  },
  {
    id: "pos-8",
    blockId: "positioning",
    theme: "pos-personal",
    prompt: "Savez-vous ce qu'est une donnée personnelle ?",
    choices: ["Oui", "Non"],
    correctIndex: 0,
    explanation:
      "C'est une information qui permet de reconnaître quelqu'un : un nom, un e-mail, une photo, un numéro.",
  },
];

/** Tirage positionnement : toute la banque, mélangée. */
export function drawPositioningQuiz(): QuizQuestion[] {
  return shuffle(POSITIONING_BANK).slice(0, POSITIONING_BANK.length);
}
