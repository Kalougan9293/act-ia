import type { Block } from "@/lib/formation/activity";

/** Avant d'écrire à l'IA */
export const REFLEXES_BEFORE = [
  "Est-ce un secret de l'entreprise ?",
  "Est-ce une info sur une personne ?",
  "Est-ce trop privé (santé, religion…) ?",
  "Cet outil est-il autorisé chez nous ?",
] as const;

/** Après la réponse de l'IA */
export const REFLEXES_AFTER = [
  "Ai-je vérifié la réponse ?",
  "Est-ce un humain qui décide vraiment ?",
  "Dois-je prévenir mon manager ou le référent IA ?",
] as const;

/** Les 7 réflexes — checklist plate (jeux + fiche). */
export const SEVEN_REFLEXES = [...REFLEXES_BEFORE, ...REFLEXES_AFTER] as const;

/** Socle V2 — oral simple, vendeur, conforme AI Act. */
export const BLOCKS: Block[] = [
  {
    id: "bloc-1",
    number: 1,
    title: "L'IA, c'est quoi ?",
    duration: "10 min",
    goal: "Comprendre l'IA, pourquoi elle se trompe, et pourquoi vous êtes là",
    chapters: [
      {
        id: "1.1",
        title: "Pourquoi vous êtes ici",
        duration: "2 min",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "Alors… vous utilisez déjà l'IA ? ChatGPT, Copilot, une appli pour les images…\n\nSi non, regardez autour de vous. Vos collègues, eux, oui.\n\nL'IA, ça aide. Elle écrit, elle résume, elle traduit, elle recherche. Mais elle peut aussi créer de vrais problèmes.\n\nTrois histoires très concrètes. Chez Samsung, un secret collé dans ChatGPT… et hop, il ressort en faveur de la concurrence. Un avocat aide son client avec l'IA… et annonce des faux articles, des décisions de justice inventés. Un deepfake du « patron » appelle pour un virement urgent… et des millions partent.\n\nC'est pour ça que l'Europe a fait l'AI Act. Depuis février 2025, l'article 4 dit à votre entreprise de former vos équipes.\n\nIci, c'est simple. Sept réflexes. Une attestation de suivi. Pas un examen de droit. On y va ?",
        },
      },
      {
        id: "1.2",
        title: "Les mots à connaître",
        duration: "2 min",
        format: "Jeu",
        activity: {
          kind: "stamp",
          stamps: [
            {
              id: "llm",
              label: "LLM",
              hint: "Il prédit le mot suivant, le plus probable",
            },
            {
              id: "prompt",
              label: "Prompt",
              hint: "Votre consigne : objectif, contraintes, format",
            },
            {
              id: "hallu",
              label: "Hallucination",
              hint: "Convaincant… mais faux. Plausible ≠ vrai",
            },
            {
              id: "deep",
              label: "Deepfake",
              hint: "Fausse vidéo, voix ou image très réaliste",
            },
          ],
          cards: [
            {
              id: "c1",
              label: "Le « cerveau » qui écrit des phrases, mot après mot",
              stampId: "llm",
              explanation: "Oui, c'est le LLM. Il prédit la suite. Pas un cerveau : un calcul.",
            },
            {
              id: "c2",
              label: "Votre demande à l'outil, ce que vous lui écrivez",
              stampId: "prompt",
              explanation: "Oui, c'est le prompt. Objectif clair + contraintes = meilleure réponse.",
            },
            {
              id: "c3",
              label: "Un chiffre ou une loi inventés, avec un ton très sûr",
              stampId: "hallu",
              explanation: "Oui : hallucination. Bien écrit ≠ vrai. Vous vérifiez.",
            },
            {
              id: "c4",
              label: "Une vidéo qui imite le visage de quelqu'un de vrai",
              stampId: "deep",
              explanation: "Oui, c'est un deepfake. Une image nette ne prouve plus que c'est vrai.",
            },
          ],
        },
      },
      {
        id: "1.3",
        title: "L'IA qui crée",
        duration: "2 min",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "En gros, il y a deux familles.\n\nD'abord, l'IA classique. Elle ne crée pas de texte. Elle classe, ou elle prédit. Par exemple, le filtre anti-spam qui trie vos mails. Ou le GPS qui calcule un itinéraire.\n\nEnsuite, l'IA qui crée — on dit IA générative. Elle invente un mail, une image, un résumé, comme ChatGPT, Copilot ou Gemini…\n\nEt comment elle fait ? Mot après mot. Elle choisit ce qui a l'air le plus probable. Un peu comme des mathématiques, mais en texte. Elle ne « sait » pas. Elle devine.\n\nEt attention. Ce n'est pas une mémoire longue. Elle lit surtout ce que vous lui donnez là, pour cette requête. Une mémoire de travail. Pas un cerveau qui se souvient de tout.\n\nDonc retenez surtout ça. Probable, ce n'est pas forcément vrai.",
        },
      },
      {
        id: "1.4",
        title: "Classez : classique ou qui crée ?",
        duration: "1 min 30",
        format: "Jeu",
        activity: {
          kind: "sort",
          instruction: "Glissez chaque carte. Exemple : ChatGPT → IA qui crée.",
          colorful: true,
          bins: [
            { id: "classic", label: "IA classique" },
            { id: "gen", label: "IA qui crée" },
          ],
          cards: [
            {
              id: "spam",
              label: "Filtre anti-spam",
              binId: "classic",
              explanation: "Il trie. Il n'écrit pas un nouveau message.",
            },
            {
              id: "gpt",
              label: "ChatGPT",
              binId: "gen",
              explanation: "Il crée du texte nouveau.",
            },
            {
              id: "gps",
              label: "GPS",
              binId: "classic",
              explanation: "Il calcule un itinéraire.",
            },
            {
              id: "meet",
              label: "Résumé de réunion",
              binId: "gen",
              explanation: "Le résumé est un texte créé.",
            },
            {
              id: "image",
              label: "Image créée par IA",
              binId: "gen",
              explanation: "L'outil a inventé l'image.",
            },
            {
              id: "reco",
              label: "« Vous aimerez aussi… »",
              binId: "classic",
              explanation: "Il propose des produits déjà en catalogue.",
            },
          ],
        },
      },
      {
        id: "1.5",
        title: "Pensez comme une IA",
        duration: "2 min",
        format: "Animation",
        activity: {
          kind: "predict",
          hint: "Si je commence mon prompt comme ça… quelle suite est la plus probable ?",
          rounds: [
            {
              lead: "Le contrat doit être signé avant le…",
              options: [
                { label: "vendredi", percent: 38 },
                { label: "15 mars", percent: 22 },
                { label: "déjeuner", percent: 3 },
                { label: "client", percent: 11 },
              ],
              message:
                "L'IA miserait sur « vendredi ». C'est fréquent dans les mails. Ce n'est pas forcément VOTRE vraie date. Elle choisit le probable, pas le vrai.",
            },
            {
              lead: "Merci pour votre retour. Je vous propose de…",
              options: [
                { label: "planifier un créneau", percent: 41 },
                { label: "manger une pizza", percent: 2 },
                { label: "renvoyer le devis", percent: 28 },
                { label: "fermer le dossier", percent: 14 },
              ],
              message:
                "L'IA miserait sur « planifier un créneau ». Phrase polie = suite polie et fréquente. Pas forcément ce que VOUS vouliez écrire.",
            },
            {
              lead: "Selon le rapport, le chiffre d'affaires a…",
              options: [
                { label: "augmenté de 12 %", percent: 36 },
                { label: "disparu dans le cloud", percent: 1 },
                { label: "été stable", percent: 24 },
                { label: "baissé légèrement", percent: 19 },
              ],
              message:
                "L'IA miserait sur « augmenté de 12 % ». Ton de rapport + chiffre précis, ça sonne « vrai ». Probable ≠ vrai. Et elle n'a pas de mémoire longue : seulement le contexte que vous lui donnez.",
            },
          ],
        },
      },
      {
        id: "1.6",
        title: "Trouvez ce qui cloche",
        duration: "1 min 30",
        format: "Jeu",
        activity: {
          kind: "spot",
          intro: "Cliquez sur les passages à vérifier.",
          fragments: [
            { id: "a", text: "Selon notre assistant,", trap: false },
            {
              id: "b",
              text: "le chiffre d'affaires a bondi de 340 % en un trimestre",
              trap: true,
              explanation: "Chiffre trop beau : l'IA invente souvent un pourcentage précis.",
            },
            { id: "c", text: ", comme le confirme", trap: false },
            {
              id: "d",
              text: "l'étude INSEE-IA 2019 citée en note",
              trap: true,
              explanation: "Étude introuvable : le modèle invente des titres sérieux.",
            },
            { id: "e", text: ". La réunion a eu lieu mardi,", trap: false },
            {
              id: "f",
              text: "comme l'impose l'article L.123-99 du Code du travail",
              trap: true,
              explanation: "Article inventé. On vérifie toujours une loi soi-même.",
            },
            { id: "g", text: ".", trap: false },
          ],
        },
      },
      {
        id: "1.7",
        title: "Avant d'utiliser une réponse",
        duration: "30 s",
        format: "Checklist",
        activity: {
          kind: "checklist",
          centered: true,
          intro: "Je vérifie toujours :",
          items: ["Les chiffres", "Les sources", "Les citations", "Les textes de loi"],
        },
      },
    ],
  },
  {
    id: "bloc-2",
    number: 2,
    title: "Le code de la route de l'IA",
    duration: "12 min",
    goal: "AI Act : formation (Art. 4), transparence, interdits, haut risque — et votre rôle",
    chapters: [
      {
        id: "2.1",
        title: "La loi en clair",
        duration: "2 min",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "Les voitures ont eu besoin d'un code de la route. Bah… l'IA aussi. L'Europe a créé l'AI Act.\n\nImaginez un feu tricolore. Rouge : certaines IA, carrément interdites. Orange : risque élevé, donc très surveillées. Jaune : là, il faut le dire clairement. « Attention, je suis une IA. » Et vert… c'est le quotidien. Rien de spécial, juste du bon sens.\n\nEt pour vous, concrètement, ici… ça signifie quoi ? Depuis février 2025, l'article 4 demande à votre entreprise de former les équipes. C'est pour ça que vous êtes là.\n\nUn jour, contrôle. On demande qui a été formé, quelles preuves. Votre attestation, c'est ça aujourd'hui.\n\nPetite chose importante. La machine, elle n'est jamais responsable. C'est l'entreprise qui l'est. Et souvent… ben, c'est vous.",
        },
      },
      {
        id: "2.2",
        title: "Depuis quand ?",
        duration: "1 min",
        format: "Pré-quiz",
        activity: {
          kind: "quiz",
          questions: [
            {
              prompt: "Depuis quand l'entreprise doit-elle former ses équipes à l'IA ?",
              choices: [
                {
                  label: "Depuis le 2 février 2025",
                  correct: true,
                  explanation:
                    "Pourquoi ? L'article 4 s'applique depuis cette date. C'est ce parcours.",
                },
                {
                  label: "Seulement en 2027",
                  correct: false,
                  explanation:
                    "Pourquoi ? 2027, c'est surtout le haut risque (ex. recrutement). La formation est déjà due.",
                },
                {
                  label: "Il n'y a aucune obligation",
                  correct: false,
                  explanation: "Pourquoi ? L'obligation de former existe déjà depuis février 2025.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "2.3",
        title: "J'utilise ou je vends ?",
        duration: "2 min",
        format: "Jeu",
        activity: {
          kind: "sort",
          instruction:
            "Deux rôles AI Act :\n• J'utilise = mon entreprise se sert d'une IA déjà sur le marché (déployeur).\n• Je vends = mon entreprise fabrique ou vend une IA (fournisseur).",
          colorful: true,
          bins: [
            { id: "deploy", label: "J'utilise" },
            { id: "provider", label: "Je vends" },
          ],
          cards: [
            {
              id: "mail",
              label: "Rédiger mes mails avec ChatGPT",
              binId: "deploy",
              explanation: "Vous utilisez un outil existant. Cas le plus courant.",
            },
            {
              id: "copilot",
              label: "Écrire avec Copilot",
              binId: "deploy",
              explanation: "Outil d'un éditeur : vous l'utilisez.",
            },
            {
              id: "hrsaas",
              label: "Acheter un logiciel IA de tri de CV",
              binId: "deploy",
              explanation: "Vous achetez et utilisez. Attention : haut risque → règles fortes.",
            },
            {
              id: "brand",
              label: "Vendre un chatbot sous votre marque",
              binId: "provider",
              explanation: "Vous mettez l'IA sur le marché : obligations plus lourdes.",
            },
            {
              id: "product",
              label: "Intégrer une IA dans un logiciel vendu aux clients",
              binId: "provider",
              explanation: "Vous commercialisez l'IA sous votre offre.",
            },
          ],
        },
      },
      {
        id: "2.4",
        title: "Du vert à l'interdit",
        duration: "2 min",
        format: "Jeu",
        activity: {
          kind: "sort",
          instruction: "Classez chaque usage. Plus c'est risqué, plus les règles sont strictes.",
          colorful: true,
          bins: [
            { id: "low", label: "Peu de règles" },
            { id: "clear", label: "Il faut prévenir" },
            { id: "high", label: "Très encadré" },
            { id: "ban", label: "Interdit" },
          ],
          cards: [
            {
              id: "spell",
              label: "Correcteur d'orthographe",
              binId: "low",
              explanation: "Usage courant. Peu d'obligations.",
            },
            {
              id: "bot",
              label: "Chatbot qui parle aux clients",
              binId: "clear",
              explanation: "Le client doit savoir qu'il parle à une IA (Art. 50).",
            },
            {
              id: "deep",
              label: "Vidéo d'une vraie personne faite à l'IA",
              binId: "clear",
              explanation: "Deepfake : on doit le dire clairement.",
            },
            {
              id: "cvsort",
              label: "Tri automatique de CV",
              binId: "high",
              explanation: "Haut risque. Un humain garde la décision.",
            },
            {
              id: "score",
              label: "Noter les gens selon leur vie sociale",
              binId: "ban",
              explanation: "Interdit (Art. 5).",
            },
            {
              id: "emotion",
              label: "Analyser les émotions des salariés",
              binId: "ban",
              explanation: "Interdit au travail, sauf cas très limités.",
            },
            {
              id: "intimate",
              label: "Image intime sans accord",
              binId: "ban",
              explanation: "Interdit (renforcé dès déc. 2026).",
            },
          ],
        },
      },
      {
        id: "2.5",
        title: "Les dates qui comptent",
        duration: "2 min",
        format: "Jeu",
        activity: {
          kind: "timeline",
          items: [
            {
              id: "2025",
              shortDate: "Fév. 2025",
              date: "2 février 2025",
              label: "Déjà en vigueur",
              law: "Article 4 — formation",
              detail:
                "Votre entreprise doit déjà former les équipes qui utilisent l'IA. C'est ce parcours.",
            },
            {
              id: "aout26",
              shortDate: "Août 2026",
              date: "2 août 2026",
              label: "Transparence",
              law: "Article 50",
              detail:
                "On doit pouvoir savoir si on parle à une IA. Un deepfake d'une vraie personne doit être signalé.",
            },
            {
              id: "dec26",
              shortDate: "Déc. 2026",
              date: "2 décembre 2026",
              label: "Ligne rouge",
              law: "Article 5 — interdictions",
              detail:
                "Image ou vidéo intime sans accord : interdit. Zéro zone grise.",
            },
            {
              id: "dec27",
              shortDate: "Déc. 2027",
              date: "2 décembre 2027",
              label: "Recrutement & RH",
              law: "Haut risque",
              detail:
                "Une IA qui trie des CV devient très encadrée. Un humain garde le pouvoir de décider.",
            },
            {
              id: "aout28",
              shortDate: "Août 2028",
              date: "2 août 2028",
              label: "Et ça continue…",
              law: "Loi en cours — ça bouge",
              detail:
                "D'autres règles arrivent (IA dans les produits, etc.). Le calendrier évolue encore. Restez à jour.",
            },
          ],
        },
      },
      {
        id: "2.6",
        title: "Chatbot et deepfake",
        duration: "1 min 30",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "Deux règles de transparence. C'est l'article 50.\n\nUn chatbot sur le site ? Le client doit savoir qu'il parle à une machine. Pas à un humain.\n\nUn deepfake ? Une fausse vidéo, une fausse voix d'une vraie personne. Vous le dites clairement. Même si c'est bien fait.\n\nUn texte, ce n'est pas pareil. S'il informe le public, qu'un humain l'a relu, et que quelqu'un assume la publication… ce n'est pas un deepfake. Le deepfake, on le signale toujours.\n\nEt si vous hésitez avant de publier… demandez à votre manager ou au référent IA. Tout simplement.",
        },
      },
      {
        id: "2.7",
        title: "Que faites-vous ?",
        duration: "1 min 30",
        format: "Scénario",
        activity: {
          kind: "scenario",
          steps: [
            {
              prompt: "Nouveau chatbot sur le site client. Que faites-vous ?",
              choices: [
                {
                  label: "Rien : c'est juste un outil",
                  correct: false,
                  explanation: "Pourquoi ? Le client doit savoir qu'il parle à une IA.",
                },
                {
                  label: "On l'indique clairement",
                  correct: true,
                  explanation: "Pourquoi ? Transparence dès le début (Art. 50).",
                },
              ],
            },
            {
              prompt: "Vidéo d'un vrai salarié… générée par IA. Le contenu est correct. On publie ?",
              mediaSrc: "/media/formation/video-project-5.mp4",
              choices: [
                {
                  label: "Oui, si le contenu est correct",
                  correct: false,
                  explanation: "Pourquoi ? Deepfake : il faut le signaler.",
                },
                {
                  label: "Oui, en indiquant que c'est de l'IA",
                  correct: true,
                  explanation: "Pourquoi ? On le dit, même si le contenu est bon.",
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: "bloc-3",
    number: 3,
    title: "Mes données & secrets",
    duration: "11 min",
    goal: "Feu tricolore : savoir ce qu'on peut coller dans une IA — et ce qu'il ne faut jamais coller",
    chapters: [
      {
        id: "3.1",
        title: "Le feu tricolore des infos",
        duration: "1 min 30",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "Avant de coller quoi que ce soit dans une IA… pensez feu tricolore.\n\nAu vert : tout ce qui est déjà public, ou sans enjeu. Un titre d'article, une FAQ du site, une reformulation d'un texte anonyme. Là, allez-y. Aucun souci.\n\nÀ l'orange : dès qu'il y a quelqu'un dedans. Un nom. Un mail. Un CV. Un numéro de téléphone. Là, seulement avec un outil autorisé par l'entreprise. Et le moins possible, et si vous pouvez anonymiser… anonymisez. Mais « le salarié A », ça ne suffit pas toujours. Si on reconnaît encore la personne, c'est toujours quelqu'un.\n\nAu rouge : trop privé, ou secret d'entreprise. Santé, religion, situation familiale… Ou alors les prix, les contrats, les projets internes. Stop. On ne colle pas. Pourquoi ? D'abord, la loi. Ensuite… parce que ces infos peuvent sortir de l'entreprise. Et là, c'est trop tard.\n\nEt attention au piège. Un contrat sans le nom dessus… reste rouge. C'est toujours un secret.",
        },
      },
      {
        id: "3.2",
        title: "Classez dans le bon feu",
        duration: "3 min",
        format: "Jeu",
        activity: {
          kind: "sort",
          instruction:
            "Glissez chaque carte. Exemple : arrêt maladie → Rouge.",
          colorful: true,
          bins: [
            { id: "green", label: "Vert — OK" },
            { id: "orange", label: "Orange — prudence" },
            { id: "red", label: "Rouge — stop" },
          ],
          cards: [
            {
              id: "title",
              label: "Idée de titre pour une pub",
              binId: "green",
              explanation: "Vert : pas de personne, pas de secret.",
            },
            {
              id: "faq",
              label: "FAQ déjà sur le site",
              binId: "green",
              explanation: "Vert : info déjà publique.",
            },
            {
              id: "mail",
              label: "E-mail d'un collègue",
              binId: "orange",
              explanation: "Orange : ça identifie quelqu'un.",
            },
            {
              id: "cv",
              label: "CV d'un candidat",
              binId: "orange",
              explanation: "Orange : donnée personnelle.",
            },
            {
              id: "photo",
              label: "Photo d'un salarié",
              binId: "orange",
              explanation: "Orange : le visage identifie.",
            },
            {
              id: "arret",
              label: "Arrêt maladie",
              binId: "red",
              explanation: "Rouge : santé. Jamais dans une IA grand public.",
            },
            {
              id: "synd",
              label: "Liste d'adhérents syndicaux",
              binId: "red",
              explanation: "Rouge : trop privé.",
            },
            {
              id: "plan",
              label: "Business plan",
              binId: "red",
              explanation: "Rouge : secret d'entreprise.",
            },
            {
              id: "prix",
              label: "Grille de prix non publique",
              binId: "red",
              explanation: "Rouge : secret commercial.",
            },
            {
              id: "code",
              label: "Code d'un logiciel interne",
              binId: "red",
              explanation: "Rouge : « code » = le programme. Secret. Pas un code PIN.",
            },
          ],
        },
      },
      {
        id: "3.3",
        title: "Les bons gestes",
        duration: "1 min 30",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "Une info un peu limite ? C'est l'orange. Trois gestes à retenir.\n\nPremier geste, le moins d'infos possible. Dites « Client A », pas Monsieur Dupont.\n\nDeuxième geste, seulement les outils autorisés chez vous. Payant, ça ne veut pas dire sûr. Gratuit, ça ne veut pas dire interdit.\n\nTroisième geste, vous avez fait une erreur ? Vous avez collé un fichier clients ? Prévenez tout de suite. Pourquoi ? Parce qu'en cas de fuite, l'entreprise a souvent soixante-douze heures pour prévenir la CNIL. Le dire vite… c'est vous protéger.\n\nOn se dit souvent : « Bah… y a pas de conséquence. » En vrai, ça part de presque rien. Un copier-coller. Et derrière : une fuite, une alerte CNIL, une amende… ou juste la confiance qui casse. Mieux vaut prévenir.",
        },
      },
      {
        id: "3.4",
        title: "Nettoyez ce prompt",
        duration: "2 min",
        format: "Jeu",
        activity: {
          kind: "redact",
          intro: "Cliquez sur ce qu'il ne faut pas laisser.",
          tokens: [
            { id: "w1", text: "Rédige", redact: false },
            { id: "w2", text: "un", redact: false },
            { id: "w3", text: "mail", redact: false },
            { id: "w4", text: "pour", redact: false },
            { id: "w5", text: "Julie", redact: true },
            { id: "w6", text: "Martin", redact: true },
            { id: "w7", text: "(", redact: false },
            { id: "w8", text: "julie.martin@mail.com", redact: true },
            { id: "w9", text: "),", redact: false },
            { id: "w10", text: "42", redact: true },
            { id: "w11", text: "ans,", redact: true },
            { id: "w12", text: "en", redact: false },
            { id: "w13", text: "arrêt", redact: false },
            { id: "w14", text: "pour", redact: false },
            { id: "w15", text: "dépression", redact: true },
            { id: "w16", text: ".", redact: false },
            { id: "w17", text: "Propose", redact: false },
            { id: "w18", text: "3", redact: false },
            { id: "w19", text: "idées", redact: false },
            { id: "w20", text: "d'accompagnement.", redact: false },
          ],
          explanation:
            "Nom, mail, âge, santé : hors de l'outil. « Le salarié A » aide, mais si on reconnaît encore la personne, ça reste quelqu'un.",
        },
      },
      {
        id: "3.5",
        title: "Avant d'utiliser un outil",
        duration: "1 min",
        format: "Fiche",
        activity: {
          kind: "text",
          paragraphs: [
            "En général, ce n'est pas à vous de faire l'analyse juridique. Votre rôle : utiliser les outils déjà validés.",
          ],
          points: [
            "L'outil est-il autorisé chez nous ?",
            "Réutilise-t-il nos textes pour s'entraîner ?",
            "Où vont les données ?",
          ],
        },
      },
      {
        id: "3.6",
        title: "La réunion de 14 h",
        duration: "2 min",
        format: "Scénario",
        activity: {
          kind: "scenario",
          steps: [
            {
              prompt: "Vous voulez un outil qui enregistre et résume la réunion. Première étape ?",
              choices: [
                {
                  label: "Je vérifie s'il est dans la liste des outils autorisés (ou j'en parle au référent IA)",
                  correct: true,
                  explanation: "Pourquoi ? C'est l'entreprise qui valide l'outil, pas la salle ni l'habitude.",
                },
                {
                  label: "Je lance : tout le monde fait ça",
                  correct: false,
                  explanation: "Pourquoi ? L'habitude ne remplace pas l'autorisation.",
                },
              ],
            },
            {
              prompt: "L'outil est OK. Il y a des externes dans la salle.",
              choices: [
                {
                  label: "Je préviens tout le monde avant",
                  correct: true,
                  explanation: "Pourquoi ? Y compris les externes. La voix est une donnée personnelle.",
                },
                {
                  label: "Je préviens seulement les collègues",
                  correct: false,
                  explanation: "Pourquoi ? Les externes sont concernés aussi.",
                },
              ],
            },
            {
              prompt: "Le résumé est prêt.",
              choices: [
                {
                  label: "Je le relis avant d'envoyer",
                  correct: true,
                  explanation: "Pourquoi ? L'IA peut se tromper de personne.",
                },
                {
                  label: "J'envoie tout de suite",
                  correct: false,
                  explanation: "Pourquoi ? Deux minutes de relecture évitent un faux résumé.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "3.7",
        title: "Si vous avez collé ce qu'il ne fallait pas",
        duration: "30 s",
        format: "Alerte",
        activity: {
          kind: "text",
          paragraphs: [
            "Prévenez tout de suite votre manager, le référent IA ou le DPO.",
            "L'entreprise n'a parfois que 72 heures pour agir.",
            "Ne restez pas seul avec l'erreur.",
          ],
        },
      },
    ],
  },
  {
    id: "bloc-4",
    number: 4,
    title: "Les pièges de l'IA",
    duration: "14 min",
    goal: "Vérifier, repérer les pièges, ne pas se faire avoir",
    chapters: [
      {
        id: "4.1",
        title: "Pourquoi vérifier",
        duration: "1 min 30",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "L'IA peut écrire un rapport impeccable… avec des faits faux.\n\nPourquoi ? Elle ne vérifie pas à votre place. Il manque un chiffre, une étude, une loi ? Elle complète avec ce qui sonne juste. Et ça s'écrit très bien.\n\nUn chiffre inventé. Une étude inventée. Une loi inventée. Et le ton ? Toujours très sûr. Plus c'est propre, plus on y croit. La belle forme ne prouve rien.\n\nDonc avant d'envoyer ça à un client, vérifiez ce qui compte vraiment. Les chiffres. Les noms. Les dates. Et surtout les sources : l'étude citée, l'article de loi. Ouvrez-les. S'ils n'existent pas, vous le voyez tout de suite.\n\nCe n'est pas de la méfiance. C'est juste… du professionnalisme. Le rapport part avec votre nom. Pas avec celui de l'outil.",
        },
      },
      {
        id: "4.2",
        title: "Le rapport trop beau",
        duration: "2 min",
        format: "Jeu",
        activity: {
          kind: "spot",
          intro: "Cliquez sur ce qu'il ne faut pas reprendre tel quel.",
          fragments: [
            { id: "a", text: "Selon notre analyse,", trap: false },
            {
              id: "b",
              text: "le concurrent a été condamné à 2 millions d'euros",
              trap: true,
              explanation: "Condamnation à vérifier : ça peut être inventé.",
            },
            { id: "c", text: ". Le texte dit aussi que", trap: false },
            {
              id: "d",
              text: "le RGPD interdit toute IA en entreprise",
              trap: true,
              explanation: "Faux. Le RGPD n'interdit pas l'IA par principe.",
            },
            { id: "e", text: ", et cite", trap: false },
            {
              id: "f",
              text: "une étude montrant 47 % de gains",
              trap: true,
              explanation: "Chiffre et étude : à ouvrir soi-même avant de citer.",
            },
            { id: "g", text: ".", trap: false },
          ],
        },
      },
      {
        id: "4.3",
        title: "L'IA peut être injuste",
        duration: "1 min 30",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "L'IA apprend sur le passé. Et si le passé était injuste… l'outil peut l'être aussi. Tout en ayant l'air neutre.\n\nChez Amazon, une IA a trié des CV. Elle a appris sur dix ans d'embauches. Et pendant dix ans, les personnes embauchées étaient surtout des hommes. Alors elle descendait un CV dès qu'elle lisait « capitaine de l'équipe féminine ». Personne n'avait écrit « écarter les femmes ». Le passé suffisait. Et à l'écran ? Un score. Propre. Neutre.\n\nLa règle, c'est simple. L'outil peut classer, résumer, rédiger. Il peut aussi écarter quelqu'un… sans le faire exprès. Alors le score ne suffit pas. Donc c'est toujours à un humain de lire les CV, en haut et en bas de la liste. Vous décidez qui vous recevez. Si un nom disparaît, vous devez savoir pourquoi. C'est vous qui l'assumez.",
        },
      },
      {
        id: "4.4",
        title: "Droits et images",
        duration: "1 min 30",
        format: "Jeu",
        activity: {
          kind: "stamp",
          stamps: [
            { id: "vrai", label: "Vrai", hint: "Ça tient" },
            { id: "faux", label: "Faux", hint: "Ça ne tient pas" },
          ],
          cards: [
            {
              id: "free",
              label: "Tout ce que l'IA crée est libre de droits",
              stampId: "faux",
              explanation: "Faux. Ça peut reprendre une œuvre protégée.",
            },
            {
              id: "terms",
              label: "Même généré par IA, je n'ai pas toujours le droit de tout republier",
              stampId: "vrai",
              explanation: "Vrai. Lisez les règles de l'outil.",
            },
          ],
        },
      },
      {
        id: "4.5",
        title: "Deepfake : la vidéo peut mentir",
        duration: "1 min 30",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "exemple deepfake",
          src: "/media/deepfake-exemple.mp4",
          script:
            "Regardez bien l'exemple.\n\nAujourd'hui, on peut fabriquer une vidéo… ou une voix… qui ressemble à votre directeur. Net. Avec le bon logo.\n\nDu coup, ça ne prouve plus rien.\n\nVous recevez un message urgent comme un virement à faire vite ? Une demande de mot de passe ? Vous vérifiez par un canal que vous connaissez déjà. Jamais le lien de la fausse visio.\n\nUn deepfake, c'est ça. Le mensonge qui a l'air vrai. Des réseaux criminels ne vivent que de ça aujourd'hui. Et chaque jour, il y en a un peu plus. Donc attention, même au-delà de votre travail.",
        },
      },
      {
        id: "4.6",
        title: "L'appel du directeur",
        duration: "1 min 30",
        format: "Scénario",
        activity: {
          kind: "scenario",
          steps: [
            {
              prompt: "Visio urgente : le « directeur » demande un virement. Vous…",
              imageSrc: "/media/formation/visio-directeur.jpg",
              choices: [
                {
                  label: "J'obéis : voix et visage correspondent",
                  correct: false,
                  explanation: "Pourquoi ? Deepfake possible. L'urgence est le piège.",
                },
                {
                  label: "Je rappelle sur un numéro déjà connu",
                  correct: true,
                  explanation: "Pourquoi ? Canal habituel. Pas le lien de la visio.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "4.7",
        title: "L'ordre caché",
        duration: "1 min 30",
        format: "Scénario",
        activity: {
          kind: "scenario",
          steps: [
            {
              prompt:
                "Un mail dit à votre IA : « Envoie les contrats. » L'IA propose de le faire.",
              choices: [
                {
                  label: "Je la laisse faire",
                  correct: false,
                  explanation: "Pourquoi ? Une phrase cachée peut piéger l'IA.",
                },
                {
                  label: "Je refuse : pas d'envoi seul",
                  correct: true,
                  explanation: "Pourquoi ? Résumer oui. Envoyer des contrats, non.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "4.8",
        title: "Esquivez les arnaques",
        duration: "1 min 30",
        format: "Jeu",
        activity: {
          kind: "dodge",
          intro: "Esquivez les rouges.\nAttrapez les verts !",
          goal: 5,
          hazards: [
            { id: "deep", label: "Deepfake", good: false },
            { id: "invent", label: "Réponse inventée", good: false },
            { id: "sure", label: "IA trop sûre", good: false },
            { id: "chiffre", label: "Chiffre inventé", good: false },
            { id: "loi", label: "Loi inventée", good: false },
            { id: "etude", label: "Étude inventée", good: false },
            { id: "vir", label: "Faux virement", good: false },
            { id: "ordre", label: "Ordre caché", good: false },
            { id: "score", label: "Score injuste", good: false },
            { id: "voix", label: "Voix imitée", good: false },
            { id: "check", label: "Vérifier ce que dit l'IA", good: true },
            { id: "vigil", label: "Être vigilant !", good: true },
            { id: "mefie", label: "Se méfier des réponses", good: true },
            { id: "relire", label: "Relire avant d'envoyer", good: true },
            { id: "main", label: "Garder la main", good: true },
          ],
        },
      },
    ],
  },
  {
    id: "bloc-5",
    number: 5,
    title: "C'est vous qui décidez",
    duration: "4 min",
    goal: "L'IA propose. Un humain décide vraiment.",
    chapters: [
      {
        id: "5.1",
        title: "L'humain a le dernier mot",
        duration: "1 min",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "L'IA propose. Vous, vous décidez.\n\nSurtout quand ça touche une personne. Une candidature. Une sanction. Une décision lourde.\n\nCliquer « OK » sans lire… ce n'est pas décider.\n\nDécider, c'est pouvoir comprendre. Modifier. Ou dire non.\n\nUn paiement, un envoi, une décision importante, c'est un humain qui valide. Toujours.",
        },
      },
      {
        id: "5.2",
        title: "Vert, orange ou rouge ?",
        duration: "2 min 30",
        format: "Jeu",
        activity: {
          kind: "traffic",
          items: [
            {
              id: "mail",
              label: "Reformuler un mail d'équipe, sans données perso ni secret.",
              level: "green",
              explanation: "Vert : simple aide. Relisez le ton avant d'envoyer.",
            },
            {
              id: "grid",
              label: "L'IA prépare des questions d'entretien. Ensuite, c'est vous qui décidez.",
              level: "orange",
              explanation: "Orange : utile, mais recrutement = vous gardez la décision.",
            },
            {
              id: "health",
              label: "Coller un dossier médical dans ChatGPT grand public.",
              level: "red",
              explanation: "Rouge : la santé ne va pas dans un outil grand public.",
            },
            {
              id: "reject",
              label: "L'IA envoie seule les refus aux candidats.",
              level: "red",
              explanation: "Rouge : décision automatisée sur une personne.",
            },
            {
              id: "legal",
              label: "L'IA écrit un courrier juridique. Vous l'envoyez sans relire.",
              level: "red",
              explanation: "Rouge : une erreur de droit engage l'entreprise.",
            },
          ],
        },
      },
    ],
  },
  {
    id: "bloc-6",
    number: 6,
    title: "Les 7 réflexes",
    duration: "3 min",
    goal: "Partir avec une checklist Avant / Après",
    chapters: [
      {
        id: "6.1",
        title: "Le défi des 7 réflexes",
        duration: "2 min 30",
        format: "Jeu",
        activity: {
          kind: "tetris",
          intro: "Les 7 réflexes tombent.\nDéplacez, tournez, lisez, posez.",
          blocks: SEVEN_REFLEXES.map((label, index) => ({
            id: `r${index + 1}`,
            label,
          })),
        },
      },
      {
        id: "6.2",
        title: "La fiche à garder",
        duration: "30 s",
        format: "Fiche",
        activity: {
          kind: "fiche",
          intro: "",
          items: [
            "🛑 Secret de l'entreprise ?",
            "🛑 Info sur une personne ?",
            "🛑 Trop privé (santé…) ?",
            "🛑 Outil autorisé ?",
            "✅ Réponse vérifiée ?",
            "✅ Humain qui décide ?",
            "✅ Dois-je prévenir ?",
          ],
        },
      },
    ],
  },
];
