/** Parcours métiers — StartIA V1.0 (texte + cas + idée d'usage, sans vidéo). */

export type CareerPath = {
  id: string;
  title: string;
  duration: string;
  focus: string;
  /** Texte concis à lire — phrases simples. */
  briefing: string;
  casePrompt: string;
  caseCorrection: string;
  /** Idée concrète d'usage IA pour ce métier. */
  aiTip: string;
};

export const CAREER_PATHS: CareerPath[] = [
  {
    id: "direction",
    title: "Direction & management stratégique",
    duration: "5–8 min",
    focus: "Cadre, outils autorisés, décisions humaines.",
    briefing:
      "Vous donnez le cadre. Si personne ne sait quels outils sont autorisés, chacun improvise. Et les informations sortent sans que vous le voyiez.\n\nAvant d'acheter une IA, posez trois questions. À quoi sert-elle vraiment ? Que dit le contrat sur vos données ? Est-ce que l'éditeur les réutilise pour s'entraîner ? Vous validez ça avant de brancher l'outil, pas après un incident.\n\nSi vous utilisez un outil acheté, vous restez responsable du bon usage. Si vous vendez une IA sous votre marque, les obligations sont plus lourdes. Dans les deux cas, une décision importante reste humaine.",
    casePrompt:
      "Un éditeur vous propose une IA « pour booster la productivité ». Il veut faire signer cette semaine. Que vérifiez-vous avant de dire oui ?",
    caseCorrection:
      "Vous vérifiez l'usage réel, les clauses sur les données et le réentraînement, et qui sera responsable en interne. Vous ne signez pas « pour aller vite » sans ça. Ensuite seulement, l'outil peut entrer sur la liste autorisée.",
    aiTip:
      "Demandez à l'IA une grille « oui / non / à clarifier » pour chaque nouvel outil. Elle prépare le dossier. Vous gardez la décision.",
  },
  {
    id: "rh",
    title: "Ressources humaines",
    duration: "5–8 min",
    focus: "CV, entretiens, outils RH : données perso.",
    briefing:
      "Un CV, une note d'entretien, un arrêt maladie, une fiche de paie : ce sont des données personnelles. Parfois, c'est même sensible.\n\nUne IA grand public n'est pas un coffre-fort. Pour analyser un CV ou préparer un compte rendu, vous passez par un outil autorisé. Vous ne donnez que ce qui sert.\n\nLa décision d'embaucher, ou de sanctionner, reste humaine. Un score donné par une IA ne remplace pas votre jugement. Vous le relisez. Vous le contestez s'il le faut. Et les personnes concernées sont informées si un outil pèse dans le process.",
    casePrompt:
      "On vous demande de coller 40 CV dans une IA publique pour « pré-trier » les candidats. Que répondez-vous ?",
    caseCorrection:
      "Vous refusez, sauf outil autorisé et cadre clair. Un CV porte un nom, un parcours, parfois des infos sensibles. Vous proposez l'outil validé par l'entreprise, ou un tri humain sur des critères écrits.",
    aiTip:
      "Faites reformuler une offre d'emploi par l'IA : ton clair, inclusif, sans jargon. Vous ne collez aucun dossier candidat.",
  },
  {
    id: "marketing",
    title: "Marketing & sales",
    duration: "5–8 min",
    focus: "Chatbots, contenus générés, fichiers prospects.",
    briefing:
      "Vous publiez vers l'extérieur. Vous touchez aussi aux fichiers clients.\n\nSi un chatbot répond sur le site, le client doit savoir dès le début qu'il parle à une machine. Ce n'est pas assez de le mettre dans les CGV.\n\nUne vidéo ou une voix qui imite quelqu'un se signale clairement. Vous vérifiez aussi les droits : image, voix, musique.\n\nUn fichier de milliers de prospects ne part pas dans une IA ouverte. Même pour « personnaliser » un mail : outil autorisé, contrat lu, et vous ne collez pas toute la base d'un coup.",
    casePrompt:
      "Vous voulez une vidéo promo avec un porte-parole généré par IA. Quelles mentions et quelles vérifications faites-vous ?",
    caseCorrection:
      "Vous indiquez clairement que c'est généré par IA si la personne paraît réelle. Vous vérifiez les droits sur l'image, la voix et la musique. Si vous imitez quelqu'un, vous avez son accord. Relire la vidéo ne dispense pas de la mention.",
    aiTip:
      "Demandez à l'IA cinq angles de posts LinkedIn, sans coller de fichier clients. Vous choisissez. Vous adaptez au ton de la marque.",
  },
  {
    id: "managers",
    title: "Managers",
    duration: "5–8 min",
    focus: "Équipe, outils déclarés, relecture des livrables.",
    briefing:
      "Vous êtes le lien entre les règles et ce que l'équipe fait vraiment.\n\nQuelqu'un utilise une IA hors liste ? Vous l'aidez à déclarer l'usage. Le but n'est pas de chercher un coupable. C'est de savoir où passent les informations.\n\nUn devis, un rapport, un code : rien ne part chez un client sans relecture humaine. Si des chiffres n'ont pas de source, vous les faites vérifier avant l'envoi.\n\nUn outil qui noterait la performance ou les primes : vous restez prudent. La décision reste humaine. Et un nouvel arrivant apprend les outils autorisés avant son premier collage dans ChatGPT.",
    casePrompt:
      "Un collaborateur vous rend un rapport clairement écrit par une IA, avec des chiffres sans source. Que faites-vous ?",
    caseCorrection:
      "Vous ne transmettez pas le rapport en l'état. Vous demandez une source et une vérification pour chaque chiffre. Vous expliquez pourquoi : l'outil peut inventer. Vous rappelez la règle : rien vers l'extérieur sans relecture.",
    aiTip:
      "Faites générer une checklist « avant envoi client » : chiffres, noms, promesses, ton. L'équipe s'en sert à chaque livrable.",
  },
  {
    id: "tech",
    title: "Tech, IT & développeurs",
    duration: "5–8 min",
    focus: "Code, logs, secrets, outils dans l'IDE.",
    briefing:
      "L'IA écrit du code. Elle explique un bug. Elle résume des logs. Elle peut aussi emporter des secrets.\n\nVous ne collez pas de configs, de clés, de logs clients ou de code sensible dans un outil grand public. Vous passez par un outil autorisé. Et vous relisez ce qui est généré — y compris les dépendances.\n\nUne extension « magique » dans l'IDE ? Vous vérifiez où part le code avant de l'activer sur le dépôt de l'entreprise.",
    casePrompt:
      "Bug urgent. Vous voulez coller des logs et un extrait de code dans ChatGPT grand public. Est-ce OK ?",
    caseCorrection:
      "Non, pas sans outil autorisé. Les logs et le code peuvent contenir des secrets et des données clients. Vous utilisez l'outil validé. Vous retirez le superflu. Vous relisez le correctif proposé.",
    aiTip:
      "Faites expliquer un diff, ou rédiger des tests, dans l'outil autorisé, sur un extrait anonymisé. Vous gagnez du temps de revue sans exposer tout le dépôt.",
  },
  {
    id: "finance",
    title: "Finance & comptabilité",
    duration: "5–8 min",
    focus: "Paiements, factures, fraude, fichiers sensibles.",
    briefing:
      "L'IA accélère les tableaux et les relances. Elle invente aussi des chiffres. Et les fraudeurs le savent.\n\nUn message urgent du « DAF » qui demande un virement ou un changement d'IBAN : vous ne bougez pas depuis ce message. Vous rappelez sur le numéro habituel.\n\nSur une facture, vous croisez les montants avec le document source avant de comptabiliser. Les IBAN, les salaires, les extraits bancaires ne partent pas dans un outil grand public.\n\nL'IA peut préparer un paiement. Elle ne le lance pas seule.",
    casePrompt:
      "Vous recevez un vocal du « DAF ». La voix est la sienne. Il demande de changer l'IBAN d'un fournisseur avant midi. Que faites-vous ?",
    caseCorrection:
      "Vous ne touchez pas à l'IBAN. Vous rappelez le DAF sur son numéro habituel, ou vous passez par le process interne. Une voix se fabrique. Répondre au même vocal, c'est parler au fraudeur.",
    aiTip:
      "Faites reformuler une relance client par l'IA, sans coller d'IBAN ni de fichier paie. L'outil soigne le ton. Les montants viennent de votre système.",
  },
  {
    id: "support",
    title: "Relation client & support",
    duration: "5–8 min",
    focus: "Tickets, appels, chatbots : données clients.",
    briefing:
      "Chaque jour, des tickets, des mails, des appels. Il y a des noms, des numéros, parfois un IBAN ou un numéro de commande.\n\nAvant de coller un ticket dans une IA, vous utilisez un outil autorisé. Vous retirez ce qui ne sert pas — le téléphone, l'adresse complète, un numéro de carte s'il y en a un.\n\nLa réponse part au nom de l'entreprise. Vous la relisez. L'outil peut inventer un délai de livraison ou un geste commercial. Vous ne validez pas une promesse que vous ne pouvez pas tenir.\n\nSi un chatbot répond aux clients, ils doivent savoir que c'est une machine, dès le début. Et vous ne collez pas tout l'historique CRM « pour que l'IA connaisse le client ».",
    casePrompt:
      "Un ticket contient le nom du client, son téléphone et le détail d'un litige. Vous voulez une réponse polie générée par l'IA. Que faites-vous avant ?",
    caseCorrection:
      "Vous passez par un outil autorisé. Vous retirez le téléphone, et tout ce qui ne sert pas à rédiger. Vous relisez la réponse : pas de délai inventé, pas de geste commercial fantôme. Ensuite seulement, vous envoyez.",
    aiTip:
      "Demandez trois formulations de réponse — ferme, empathique, factuelle — à partir d'un résumé anonymisé du litige. Vous choisissez le ton. L'IA ne décide pas du geste commercial.",
  },
  {
    id: "tous",
    title: "Autres",
    duration: "5–8 min",
    focus: "Accueil, mails, atelier : réflexes du quotidien.",
    briefing:
      "Votre métier n'est pas dans une des cases à côté ? Les mêmes règles s'appliquent.\n\nUn client laisse un nom et un téléphone. Avant de coller ça dans une IA pour traduire ou préparer une réponse, vous utilisez un outil autorisé. Vous gardez seulement ce qui est utile.\n\nEnsuite, vous relisez. L'outil peut inventer une date de rendez-vous, ou changer le sens d'une phrase. Ce que vous renvoyez part avec le nom de l'entreprise.\n\nSi un collègue propose une extension IA « pour aller plus vite », vous demandez avant d'installer. Ce n'est pas une faute de poser la question.",
    casePrompt:
      "À l'accueil, vous devez préparer un message de rappel. Le mail client contient son nom, son téléphone et le motif de sa visite. Que faites-vous avant d'utiliser l'IA ?",
    caseCorrection:
      "Vous utilisez un outil autorisé. Vous retirez le téléphone, et le nom s'il ne sert pas. Vous gardez seulement ce qui aide à rédiger. Vous relisez le message avant de l'envoyer.",
    aiTip:
      "Faites créer une fois un modèle de mail de confirmation de rendez-vous. Ensuite, vous le réutilisez. Moins de frappe, et vous ne collez jamais tout le carnet d'adresses.",
  },
];
