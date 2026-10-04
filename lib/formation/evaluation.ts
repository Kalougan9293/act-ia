/** Banque d'évaluation Layer 1 — ConformAI CDC V2.7 */

export type QuizQuestion = {
  id: string;
  /** Bloc pédagogique, pour le tirage « au moins 2 questions par bloc ». */
  blockId: string;
  prompt: string;
  choices: [string, string, string];
  correctIndex: 0 | 1 | 2;
  explanation: string;
};

export const QUIZ_DRAW_SIZE = 20;
export const QUIZ_PASS_PERCENT = 80;
/** Chrono indicatif (ne coupe pas l'examen). ~45 s par question. */
export const QUIZ_TIMER_SECONDS = 15 * 60;
export const POSITIONING_SIZE = 10;

/**
 * Banque du socle (30 questions).
 * Les anciennes questions 3 et 5 du QCM V2.4 sont rattachées aux parcours
 * Direction et Tech : elles ne font pas partie de ce tirage.
 * Les trois choix d'une question ont une longueur comparable (anti-biais « la plus longue »).
 */
export const SOCLE_QUESTION_BANK: QuizQuestion[] = [
  {
    id: "q1",
    blockId: "bloc-3",
    prompt:
      "Votre équipe souhaite utiliser un outil d'IA commercial. L'analyse du contrat montre que l'éditeur réutilise les données saisies pour réentraîner ses modèles publics sans option de désactivation. Quelle démarche faut-il appliquer ?",
    choices: [
      "L'usage est autorisé sans restriction dès lors que la licence est payante, car le tarif Enterprise suffit à garantir la confidentialité et la conformité du traitement.",
      "L'usage doit être évalué au préalable : sans garanties suffisantes sur la confidentialité et le rôle RGPD de l'éditeur, l'entreprise restreint l'outil ou le refuse.",
      "L'usage est automatiquement conforme si l'outil est installé sur un serveur virtuel local, même lorsque l'éditeur réutilise les données pour entraîner ses modèles publics.",
    ],
    correctIndex: 1,
    explanation:
      "Payant ne veut pas dire conforme : sans garanties sur la réutilisation des données, l'entreprise limite l'usage ou refuse l'outil.",
  },
  {
    id: "q2",
    blockId: "bloc-2",
    prompt:
      "Une entreprise étudie le déploiement d'une IA d'évaluation automatique de candidatures. Que précise le cadre juridique ?",
    choices: [
      "Cet usage est qualifié de risque minimal : aucune démarche particulière n'est exigée, ni supervision humaine, ni information des candidats ou des instances.",
      "Cet usage relève du haut risque (Annexe III) et peut aussi engager l'article 22 du RGPD : il faut une intervention humaine réelle, des garanties et une information adaptée.",
      "Cet usage est une pratique interdite par l'article 5 de l'AI Act dans tous les cas, sans possibilité d'encadrement ni de déploiement sous supervision humaine.",
    ],
    correctIndex: 1,
    explanation:
      "Le recrutement relève du haut risque (Annexe III) et l'Article 22 RGPD impose un humain avec un vrai pouvoir de décision.",
  },
  {
    id: "q4",
    blockId: "bloc-2",
    prompt:
      "Une entreprise publie un article sur son site web afin d'informer le public sur une question d'intérêt général. Le texte a été généré par IA puis entièrement révisé par un rédacteur qui en assume la responsabilité éditoriale. Quelle règle de l'Article 50 s'applique ?",
    choices: [
      "L'obligation de divulgation spécifique ne s'applique pas : le texte a fait l'objet d'un contrôle éditorial humain et une responsabilité éditoriale est clairement assumée.",
      "La publication est interdite sans filigrane numérique visible sur chaque paragraphe, même après relecture complète et prise de responsabilité par un rédacteur humain.",
      "L'obligation de divulgation s'applique systématiquement à tout texte touché par une IA, quelle que soit la relecture éditoriale et la responsabilité humaine ensuite assumée.",
    ],
    correctIndex: 0,
    explanation:
      "Pour un texte d'information d'intérêt public, la relecture éditoriale humaine dispense de la mention ; ce n'est jamais le cas pour un deepfake.",
  },
  {
    id: "q6",
    blockId: "bloc-1",
    prompt: "Une IA vous donne une réponse détaillée, bien rédigée, citant un article de loi. Que faites-vous ?",
    choices: [
      "Je l'utilise telle quelle : le ton est assuré, la rédaction est soignée et la citation d'un article suffit à établir la fiabilité.",
      "Je vérifie que l'article existe vraiment et qu'il dit bien cela, avant de m'appuyer sur la réponse dans mon travail.",
      "Je redemande à l'IA si elle est certaine ; si elle confirme avec le même aplomb, je considère la réponse comme fiable.",
    ],
    correctIndex: 1,
    explanation: "Une IA peut inventer un article de loi avec aplomb : on vérifie toujours la source.",
  },
  {
    id: "q7",
    blockId: "bloc-3",
    prompt: "Parmi ces informations, laquelle est une donnée sensible au sens du RGPD ?",
    choices: [
      "L'adresse e-mail professionnelle d'un client, utilisée pour le suivi commercial habituel du dossier.",
      "Un arrêt maladie mentionnant une pathologie, qui relève des données de santé protégées de façon renforcée.",
      "Le montant d'un devis adressé à un prospect, sans autre élément permettant d'identifier une personne.",
    ],
    correctIndex: 1,
    explanation: "Les données de santé font partie des données sensibles, protégées de façon renforcée.",
  },
  {
    id: "q8",
    blockId: "bloc-3",
    prompt:
      "Un collègue veut résumer un contrat client confidentiel avec son compte personnel gratuit d'une IA. Quelle est la bonne réaction ?",
    choices: [
      "C'est possible s'il supprime la conversation juste après, car aucune trace durable ne resterait alors chez l'éditeur.",
      "Il utilise un outil validé par l'entreprise ou retire les informations confidentielles, et demande au référent en cas de doute.",
      "C'est possible car un contrat commercial ne contient pas de données personnelles au sens du RGPD, donc aucun risque.",
    ],
    correctIndex: 1,
    explanation:
      "Un contrat confidentiel ne va jamais dans un outil personnel non autorisé, même sans donnée personnelle.",
  },
  {
    id: "q9",
    blockId: "bloc-4",
    prompt: "Le marketing a généré une image par IA pour une campagne. Que faut-il retenir ?",
    choices: [
      "Une image générée par IA est toujours libre de droits et peut être publiée sans vérification préalable.",
      "Il faut vérifier les conditions de l'outil et l'absence de ressemblance avec une œuvre, une marque ou une personne existante.",
      "Toute image générée par IA est interdite en communication, même après contrôle des droits et des ressemblances.",
    ],
    correctIndex: 1,
    explanation: "Une image générée peut reproduire une œuvre, une marque ou une personne existante.",
  },
  {
    id: "q10",
    blockId: "bloc-4",
    prompt:
      "Vous recevez un appel vidéo de votre directeur, visiblement pressé, qui demande un virement urgent vers un nouveau compte. Que faites-vous ?",
    choices: [
      "J'exécute immédiatement : je reconnais son visage et sa voix, et l'urgence justifie de ne pas attendre.",
      "Je vérifie par un autre canal déjà connu (rappel, validation interne) avant toute action irréversible.",
      "Je demande une confirmation par e-mail à l'adresse qu'il m'indique pendant l'appel, puis j'exécute.",
    ],
    correctIndex: 1,
    explanation:
      "Visage et voix peuvent être imités (deepfake) : une demande urgente inhabituelle se vérifie par un autre canal.",
  },
  {
    id: "q11",
    blockId: "bloc-5",
    prompt:
      "Une IA classe automatiquement les salariés pour une prime. Les résultats défavorisent nettement les salariés à temps partiel. Que faites-vous ?",
    choices: [
      "Je ne fais rien : un algorithme est neutre par nature et ne peut pas produire de discrimination réelle.",
      "Je signale le problème : l'IA peut reproduire des biais ; les résultats doivent être contrôlés et la décision rester humaine.",
      "J'exclus purement et simplement les salariés à temps partiel de l'analyse pour faire disparaître l'écart observé.",
    ],
    correctIndex: 1,
    explanation: "Une IA peut reproduire des biais ; les résultats se contrôlent et la décision reste humaine.",
  },
  {
    id: "q12",
    blockId: "bloc-5",
    prompt: "Dans laquelle de ces situations faut-il s'abstenir d'utiliser l'IA sans validation préalable ?",
    choices: [
      "Reformuler un e-mail interne sans information confidentielle ni donnée personnelle identifiable.",
      "Trouver des idées de titres pour une présentation interne, sans données clients ni contenu sensible.",
      "Laisser un agent IA supprimer automatiquement des dossiers clients jugés obsolètes, sans contrôle humain.",
    ],
    correctIndex: 2,
    explanation:
      "Une action automatique irréversible sur des données clients exige une validation humaine préalable.",
  },
  {
    id: "q13",
    blockId: "bloc-1",
    prompt: "Qu'est-ce qu'un prompt ?",
    choices: [
      "La réponse complète produite par l'IA après avoir traité votre demande.",
      "L'instruction ou la question que vous écrivez pour orienter la réponse de l'IA.",
      "Un logiciel de sécurité qui filtre les contenus avant qu'ils n'atteignent l'IA.",
    ],
    correctIndex: 1,
    explanation: "Le prompt est ce que vous donnez à l'IA ; plus il est clair, meilleure est la réponse.",
  },
  {
    id: "q14",
    blockId: "bloc-1",
    prompt: "Comment un modèle de langage (LLM) construit-il sa réponse ?",
    choices: [
      "Il consulte une base de vérités vérifiées et ne renvoie que des faits déjà validés.",
      "Il prédit, mot après mot, la suite la plus probable d'après ses données d'entraînement.",
      "Il copie intégralement une page web existante puis la reformule légèrement avant de répondre.",
    ],
    correctIndex: 1,
    explanation: "C'est pour cela qu'une réponse peut être plausible sans être vraie.",
  },
  {
    id: "q15",
    blockId: "bloc-2",
    prompt: "Votre entreprise installe un chatbot sur son site. Que faut-il faire ?",
    choices: [
      "Rien de particulier : un chatbot grand public n'entraîne aucune obligation de transparence.",
      "Informer clairement les visiteurs qu'ils échangent avec une IA, sauf si c'est déjà évident.",
      "Ne le dire que si un visiteur pose explicitement la question pendant la conversation.",
    ],
    correctIndex: 1,
    explanation: "C'est une obligation de transparence de l'Article 50, applicable depuis le 2 août 2026.",
  },
  {
    id: "q16",
    blockId: "bloc-2",
    prompt: "Laquelle de ces pratiques est interdite par l'AI Act ?",
    choices: [
      "Résumer des documents internes pour préparer une réunion, avec un outil autorisé par l'entreprise.",
      "Analyser les émotions des salariés par webcam afin d'évaluer leur engagement au travail.",
      "Traduire un e-mail professionnel vers une autre langue avant de l'envoyer à un partenaire.",
    ],
    correctIndex: 1,
    explanation: "La reconnaissance des émotions au travail est interdite, sauf motifs médicaux ou de sécurité.",
  },
  {
    id: "q17",
    blockId: "bloc-2",
    prompt: "Un document envoyé à un client contient une erreur produite par l'IA. Qui est responsable ?",
    choices: [
      "L'éditeur de l'outil d'IA, car c'est sa technologie qui a généré le contenu erroné.",
      "L'entreprise, et la personne qui a validé l'envoi, car l'IA ne transfère pas la responsabilité.",
      "Personne : dès lors qu'une machine a produit le texte, aucune responsabilité humaine ne s'applique.",
    ],
    correctIndex: 1,
    explanation: "Utiliser une IA ne transfère jamais la responsabilité à la machine.",
  },
  {
    id: "q18",
    blockId: "bloc-2",
    prompt: "Que demande l'Article 4 de l'AI Act ?",
    choices: [
      "Un diplôme officiel ou une certification individuelle pour chaque salarié utilisant un outil d'IA.",
      "Que l'entreprise prenne des mesures pour développer la maîtrise de l'IA de son personnel.",
      "D'interdire purement et simplement l'IA à tout salarié qui n'a pas suivi une formation diplômante.",
    ],
    correctIndex: 1,
    explanation: "L'Article 4 vise une démarche de l'entreprise, pas une certification individuelle.",
  },
  {
    id: "q19",
    blockId: "bloc-2",
    prompt: "Votre entreprise publie une vidéo générée par IA montrant une personne réelle. Faut-il une mention ?",
    choices: [
      "Oui : pour ce type de contenu (deepfake), la mention d'IA reste obligatoire malgré une relecture.",
      "Non : dès qu'un rédacteur a relu la vidéo, aucune mention d'IA n'est plus exigée par la loi.",
      "Seulement si un spectateur demande explicitement si la vidéo a été produite avec une IA.",
    ],
    correctIndex: 0,
    explanation:
      "Pour un deepfake, la mention est obligatoire et une relecture ne la remplace pas. Seule une œuvre manifestement artistique, satirique ou de fiction bénéficie d'une mention allégée, qui reste due.",
  },
  {
    id: "q20",
    blockId: "bloc-3",
    prompt: "Un business plan ne contenant aucun nom est :",
    choices: [
      "Une donnée personnelle, car tout document d'entreprise identifie forcément des personnes.",
      "Une information confidentielle, protégée notamment par le secret des affaires de l'entreprise.",
      "Une information libre d'utilisation, puisque l'absence de nom retire toute protection juridique.",
    ],
    correctIndex: 1,
    explanation: "Confidentiel ne veut pas forcément dire personnel ; les deux se protègent.",
  },
  {
    id: "q21",
    blockId: "bloc-3",
    prompt: "Quelle pratique respecte la minimisation des données dans un prompt ?",
    choices: [
      "Donner un maximum de détails sur la personne pour que l'IA produise une réponse plus précise.",
      "Remplacer les noms par « Client A » ou « Candidat 1 » et ne transmettre que le nécessaire.",
      "Ajouter le numéro de sécurité sociale afin d'éviter toute confusion entre plusieurs personnes.",
    ],
    correctIndex: 1,
    explanation:
      "On ne transmet que les données nécessaires. Remplacer un nom réduit l'identification directe, mais si la personne reste reconnaissable par le contexte, les données restent soumises au RGPD.",
  },
  {
    id: "q22",
    blockId: "bloc-3",
    prompt: "Vous avez collé par erreur des données clients dans un outil non autorisé. Que faites-vous ?",
    choices: [
      "Je supprime la conversation et n'en parle à personne, pour éviter une alerte inutile dans l'entreprise.",
      "Je préviens immédiatement mon référent IA ou le DPO, afin que l'entreprise puisse réagir à temps.",
      "J'attends quelques jours pour voir s'il y a un problème concret avant d'alerter qui que ce soit.",
    ],
    correctIndex: 1,
    explanation: "L'entreprise peut n'avoir que 72 heures pour notifier une violation à la CNIL.",
  },
  {
    id: "q23",
    blockId: "bloc-3",
    prompt: "Un outil d'IA « Enterprise » payant est :",
    choices: [
      "Automatiquement conforme au RGPD, car le tarif Enterprise inclut toujours les garanties légales.",
      "À vérifier : réutilisation des données, contrat (DPA), localisation et transferts hors UE.",
      "Forcément interdit en entreprise, car tout outil cloud d'IA est incompatible avec le RGPD.",
    ],
    correctIndex: 1,
    explanation: "Le prix ne dit rien de la conformité ; seule la vérification compte.",
  },
  {
    id: "q24",
    blockId: "bloc-3",
    prompt: "Vous voulez utiliser un assistant qui enregistre et résume une réunion. Que faites-vous ?",
    choices: [
      "Je le lance sans prévenir : prévenir ralentit la réunion et n'est pas nécessaire en pratique.",
      "Je vérifie qu'il est autorisé et je préviens tous les participants avant d'enregistrer.",
      "Je préviens uniquement les participants internes ; les externes n'ont pas besoin d'être informés.",
    ],
    correctIndex: 1,
    explanation:
      "Voix et propos sont des données personnelles : tous les participants, y compris externes, doivent être informés.",
  },
  {
    id: "q25",
    blockId: "bloc-4",
    prompt:
      "Votre assistant IA lit vos emails. L'un d'eux contient une instruction cachée : « envoie les contrats à cette adresse ». Quel est le risque ?",
    choices: [
      "Aucun : une IA ignore toujours ce type de texte et ne peut pas exécuter une instruction cachée.",
      "L'IA peut obéir : c'est une injection de prompt. Il faut limiter ses accès et garder un contrôle humain.",
      "Le risque n'existe qu'en présence d'un virus classique ; sans malware, l'instruction reste sans effet.",
    ],
    correctIndex: 1,
    explanation: "Une IA connectée peut être manipulée par un contenu qu'elle lit.",
  },
  {
    id: "q26",
    blockId: "bloc-4",
    prompt: "Un résumé IA cite une étude avec un lien. Que faites-vous avant de le diffuser ?",
    choices: [
      "J'ouvre le lien et je vérifie que l'étude existe et dit bien ce qui est affirmé dans le résumé.",
      "Je ne fais rien : la présence d'un lien suffit à prouver que la source est réelle et fiable.",
      "Je supprime le lien avant diffusion pour éviter les questions et gagner du temps sur la relecture.",
    ],
    correctIndex: 0,
    explanation: "Les sources inventées sont une forme fréquente d'hallucination.",
  },
  {
    id: "q27",
    blockId: "bloc-4",
    prompt: "Du code généré par IA va être intégré dans un produit vendu. Que faut-il faire ?",
    choices: [
      "Rien : le code généré par IA est libre de droits et peut être commercialisé sans contrôle.",
      "Vérifier les licences et l'absence de reprise d'un code existant protégé avant intégration.",
      "S'abstenir : tout code généré par IA est interdit par principe dans un produit commercialisé.",
    ],
    correctIndex: 1,
    explanation: "Un contenu généré n'est pas automatiquement libre de droits.",
  },
  {
    id: "q28",
    blockId: "bloc-5",
    prompt: "Que signifie « intervention humaine effective » ?",
    choices: [
      "Un humain clique sur « valider » sans vraiment relire, car le simple clic suffit juridiquement.",
      "Un humain a le pouvoir réel de modifier ou de rejeter la proposition de l'IA, et l'exerce.",
      "L'IA décide seule, puis consulte un humain uniquement lorsqu'elle estime elle-même hésiter.",
    ],
    correctIndex: 1,
    explanation: "Valider sans lire n'est pas une intervention humaine.",
  },
  {
    id: "q29",
    blockId: "bloc-5",
    prompt: "On vous demande de résumer avec l'IA un dossier médical de salarié. Que faites-vous ?",
    choices: [
      "J'utilise l'outil le plus rapide disponible, pour rendre le résumé dans les meilleurs délais.",
      "Je n'utilise pas l'IA, ou je demande d'abord un avis au référent IA ou au DPO de l'entreprise.",
      "Je retire seulement le nom du salarié puis j'utilise n'importe quel outil grand public.",
    ],
    correctIndex: 1,
    explanation: "Données de santé = données très sensibles : c'est un cas où l'on ne fonce pas.",
  },
  {
    id: "q30",
    blockId: "bloc-6",
    prompt: "Vous découvrez un outil d'IA très pratique qui n'est pas sur la liste de l'entreprise. Que faites-vous ?",
    choices: [
      "Je l'utilise discrètement pour gagner du temps, sans le déclarer tant qu'aucun incident n'arrive.",
      "Je demande à mon manager ou au référent avant de l'utiliser, même si l'outil paraît inoffensif.",
      "Je l'utilise uniquement pour des documents internes, ce qui rend toute validation inutile.",
    ],
    correctIndex: 1,
    explanation: "En cas de doute, on demande avant : c'est le réflexe n° 5.",
  },
  {
    id: "q31",
    blockId: "bloc-6",
    prompt: "Qu'appelle-t-on le « Shadow AI » ?",
    choices: [
      "Une IA configurée pour fonctionner surtout la nuit, hors des heures de travail de l'équipe.",
      "L'usage d'outils d'IA non autorisés ou non déclarés dans l'entreprise, hors du cadre prévu.",
      "Une IA particulièrement sécurisée, réservée aux dossiers les plus sensibles de l'entreprise.",
    ],
    correctIndex: 1,
    explanation: "Le Shadow AI fait sortir des données sans contrôle de l'entreprise.",
  },
  {
    id: "q32",
    blockId: "bloc-6",
    prompt: "Un devis a été rédigé avec l'aide de l'IA. Avant de l'envoyer au client :",
    choices: [
      "Je l'envoie directement : l'IA ne se trompe pas sur les calculs ni sur les conditions contractuelles.",
      "Je le relis et je vérifie les montants, les délais et les conditions avant tout envoi au client.",
      "Je demande à l'IA de se relire elle-même, ce qui remplace efficacement une relecture humaine.",
    ],
    correctIndex: 1,
    explanation: "Aucun document externe ne part sans relecture humaine.",
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

/** Tirage du QCM final : 20 questions, au moins 2 par bloc, ordre mélangé. */
export function drawSocleQuiz(size = QUIZ_DRAW_SIZE): QuizQuestion[] {
  const byBlock = new Map<string, QuizQuestion[]>();
  for (const question of SOCLE_QUESTION_BANK) {
    const list = byBlock.get(question.blockId) ?? [];
    list.push(question);
    byBlock.set(question.blockId, list);
  }

  const picked: QuizQuestion[] = [];
  const leftovers: QuizQuestion[] = [];
  for (const pool of byBlock.values()) {
    const mixed = shuffle(pool);
    picked.push(...mixed.slice(0, Math.min(2, mixed.length)));
    leftovers.push(...mixed.slice(2));
  }

  const rest = shuffle(leftovers);
  while (picked.length < size && rest.length > 0) {
    picked.push(rest.pop()!);
  }
  return shuffle(picked).slice(0, size);
}

/** Questions simples du positionnement. Elles n'entrent pas dans le QCM noté. */
export const POSITIONING_WARMUP: QuizQuestion[] = [
  {
    id: "w1",
    blockId: "positioning",
    prompt: "ChatGPT, Gemini et Copilot sont :",
    choices: [
      "Des outils d'IA qui produisent du texte à partir de ce qu'on leur demande.",
      "Des logiciels de comptabilité.",
      "Des antivirus.",
    ],
    correctIndex: 0,
    explanation:
      "ChatGPT, Gemini et Copilot sont des assistants d'IA générative. On leur écrit une demande, ils proposent une réponse.",
  },
  {
    id: "w2",
    blockId: "positioning",
    prompt: "Une réponse d'IA peut être fausse même si elle a l'air sûre d'elle.",
    choices: ["Vrai", "Faux", "Seulement le week-end"],
    correctIndex: 0,
    explanation: "L'IA peut inventer avec un ton très convaincant. On vérifie toujours ce qui compte.",
  },
  {
    id: "w3",
    blockId: "positioning",
    prompt: "Coller un contrat client dans un outil d'IA personnel gratuit :",
    choices: [
      "Est sans risque si on efface ensuite.",
      "Peut faire sortir des informations hors de l'entreprise.",
      "Est obligatoire depuis 2025.",
    ],
    correctIndex: 1,
    explanation: "Sans outil autorisé, les données peuvent être lues ou réutilisées hors de votre cadre.",
  },
  {
    id: "w4",
    blockId: "positioning",
    prompt: "Qui est responsable d'un e-mail erroné envoyé à un client après usage d'une IA ?",
    choices: ["L'IA", "La personne / l'entreprise qui a envoyé", "Personne"],
    correctIndex: 1,
    explanation: "L'outil aide. La responsabilité reste humaine.",
  },
  {
    id: "w5",
    blockId: "positioning",
    prompt: "Avant d'utiliser un nouvel outil d'IA au travail, le bon réflexe est :",
    choices: [
      "De l'essayer tout de suite.",
      "De vérifier s'il est autorisé ou de demander.",
      "De créer un compte personnel.",
    ],
    correctIndex: 1,
    explanation: "La liste des outils autorisés et le référent existent pour ça.",
  },
  {
    id: "w6",
    blockId: "positioning",
    prompt: "Un deepfake, c'est :",
    choices: [
      "Un antivirus.",
      "Une imitation réaliste de voix ou de visage créée par IA.",
      "Un type de contrat.",
    ],
    correctIndex: 1,
    explanation: "D'où l'importance de vérifier les demandes urgentes par un autre canal.",
  },
];

export function drawPositioningQuiz(size = POSITIONING_SIZE): QuizQuestion[] {
  const warmup = shuffle(POSITIONING_WARMUP);
  const rest = shuffle(SOCLE_QUESTION_BANK).slice(0, Math.max(0, size - warmup.length));
  return shuffle([...warmup, ...rest]).slice(0, size);
}
