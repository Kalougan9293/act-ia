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

/** Socle — une thématique à la fois : leçon, puis pratique. On n'y revient pas avant le quiz. */
export const BLOCKS: Block[] = [
  {
    id: "bloc-1",
    number: 1,
    title: "L'IA, c'est quoi ?",
    duration: "10 min",
    goal: "Comprendre comment l'outil écrit, pourquoi il peut inventer, et ce que vous venez faire ici",
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
            "Vous êtes ici parce que votre entreprise doit former les personnes qui utilisent l'IA. C'est l'article 4 du règlement européen, et il s'applique depuis février 2025. Ce n'est pas un examen de droit. Vous repartez avec des réflexes simples, et avec une attestation qui prouve que vous avez suivi la formation.\n\nVous utilisez peut-être déjà ChatGPT, Copilot, ou une application qui crée des images. Si ce n'est pas votre cas, regardez autour de vous : beaucoup de collègues s'en servent déjà. L'IA peut vous faire gagner du temps. Elle peut rédiger, résumer, traduire ou chercher. Elle peut aussi se tromper, ou faire sortir une information qui devait rester dans l'entreprise.\n\nOn avance un sujet à la fois. D'abord, vous comprenez comment l'outil écrit. Ensuite, vous voyez ce que la loi vous demande vraiment. Puis vous apprenez ce que vous pouvez lui donner, et ce que vous ne lui donnez jamais. À chaque fois, je vous explique, et ensuite seulement vous vous exercez. On y va ?",
        },
      },
      {
        id: "1.2",
        title: "Comment elle écrit",
        duration: "2 min",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "Il y a deux familles d'outils, et ça change ce que vous pouvez en attendre.\n\nLa première, c'est l'IA classique. Elle ne rédige pas un texte nouveau. Elle classe, elle trie ou elle calcule. Le filtre qui met un mail dans les indésirables, c'est cette famille. Le GPS qui propose un itinéraire, c'est cette famille aussi.\n\nLa deuxième, c'est l'IA qui crée. On l'appelle aussi IA générative. ChatGPT, Copilot et Gemini en font partie. Vous lui demandez un mail, une image ou un résumé, et elle produit quelque chose qui n'existait pas.\n\nComment elle écrit ? Elle avance mot après mot. À chaque fois, elle choisit le mot qui a le plus de chances de suivre, parce qu'elle l'a souvent vu dans d'autres textes. Elle ne sait pas si c'est vrai. Elle devine la suite la plus probable.\n\nEt elle ne se souvient pas de votre vie. Pour la question que vous lui posez maintenant, elle ne voit que le texte que vous venez de lui écrire. Si vous ne lui donnez pas une information, elle ne l'a pas. Elle peut alors inventer une suite qui sonne juste, simplement parce que cette suite est fréquente.\n\nQuatre mots suffisent pour en parler. Le LLM, c'est le moteur qui écrit, derrière ChatGPT ou Copilot. Le prompt, c'est la consigne que vous lui tapez. Une hallucination, c'est une réponse bien tournée, mais fausse. Le contexte, c'est seulement le texte que vous lui donnez pour cette question-là.\n\nRetenez cette phrase : une réponse probable n'est pas une réponse vraie. C'est pour ça que vous vérifiez avant de l'utiliser. Le jeu d'après vous fait classer les deux familles. Celui qui suit vous fait retrouver ces quatre mots, dans des situations nouvelles.",
        },
      },
      {
        id: "1.3",
        title: "Classique, ou qui crée ?",
        duration: "1 min 30",
        format: "Jeu",
        activity: {
          kind: "sort",
          briefing:
            "On vient de voir les deux familles. L'IA classique trie ou calcule : elle n'invente pas un texte. L'IA qui crée rédige, résume ou produit une image. Classez chaque exemple dans la bonne famille. Lisez d'abord, puis glissez.",
          instruction: "Glissez chaque carte dans la bonne famille.",
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
              explanation:
                "Il range les mails. Il n'écrit pas un nouveau message. C'est l'IA classique.",
            },
            {
              id: "gpt",
              label: "ChatGPT",
              binId: "gen",
              explanation: "Il rédige un texte qui n'existait pas. C'est l'IA qui crée.",
            },
            {
              id: "gps",
              label: "GPS",
              binId: "classic",
              explanation: "Il calcule un itinéraire parmi des routes qui existent déjà.",
            },
            {
              id: "meet",
              label: "Résumé de réunion",
              binId: "gen",
              explanation: "Le résumé est un texte nouveau, produit à partir de ce que vous lui avez donné.",
            },
            {
              id: "image",
              label: "Image créée par IA",
              binId: "gen",
              explanation: "L'outil a produit une image. Ce n'est pas un simple classement.",
            },
            {
              id: "reco",
              label: "« Vous aimerez aussi… »",
              binId: "classic",
              explanation:
                "Il propose des produits qui sont déjà au catalogue. Il ne les invente pas.",
            },
          ],
        },
      },
      {
        id: "1.4",
        title: "Les mots à connaître",
        duration: "2 min",
        format: "Jeu",
        activity: {
          kind: "stamp",
          briefing:
            "On vient de nommer quatre mots : LLM, prompt, hallucination, contexte. Ils ne sont pas redéfinis sur les boutons. Lisez chaque situation, et retrouvez le mot. Ce ne sont pas les mêmes phrases que dans la vidéo.",
          stamps: [
            { id: "llm", label: "LLM", hint: "" },
            { id: "prompt", label: "Prompt", hint: "" },
            { id: "hallu", label: "Hallucination", hint: "" },
            { id: "ctx", label: "Contexte", hint: "" },
          ],
          cards: [
            {
              id: "c1",
              label: "Dans le mail, Copilot vous propose la fin de la phrase pendant que vous tapez",
              stampId: "llm",
              explanation:
                "C'est le LLM, le moteur qui écrit. Il propose une suite. Il ne vérifie pas si elle est vraie.",
            },
            {
              id: "c2",
              label: "Vous précisez le ton, la longueur, et ce que l'outil ne doit pas inventer",
              stampId: "prompt",
              explanation:
                "C'est le prompt : votre consigne. Plus elle dit ce que vous voulez, plus la réponse vous sert.",
            },
            {
              id: "c3",
              label: "Le mail de relance parle d'une réunion du 3 mars. Cette réunion n'a jamais eu lieu",
              stampId: "hallu",
              explanation:
                "C'est une hallucination : le mail a l'air vrai, mais le fait est faux. Vous vérifiez avant d'envoyer.",
            },
            {
              id: "c4",
              label: "Vous ouvrez une nouvelle discussion. Il ne retrouve plus le fichier, tant que vous ne le joignez pas de nouveau",
              stampId: "ctx",
              explanation:
                "C'est le contexte : seulement ce que vous lui donnez dans cette question. Une nouvelle discussion repart de zéro.",
            },
          ],
        },
      },
      {
        id: "1.5",
        title: "Quelle suite choisirait-elle ?",
        duration: "2 min",
        format: "Animation",
        activity: {
          kind: "predict",
          briefing:
            "L'outil ne cherche pas votre vraie réponse. Il complète avec la suite la plus fréquente dans les textes qu'il a vus. Lisez le début de phrase, et devinez ce qu'il ajouterait. Le pourcentage qui s'affiche ensuite n'est pas un chiffre de votre entreprise : c'est seulement « cette suite est très courante ».",
          hint: "Quelle suite est la plus courante, pas forcément la vraie ?",
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
                "Pourquoi « vendredi », et pas « 15 mars » ? Parce que dans les mails, on lit très souvent « avant vendredi ». « 15 mars » serait peut-être votre vraie date, mais l'outil ne la connaît pas. « Déjeuner » ne termine presque jamais cette phrase, donc il ne le choisit pas. Il reprend une habitude de langage. Il ne lit pas votre contrat.",
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
                "Pourquoi « planifier un créneau » ? Parce qu'une phrase polie est souvent suivie d'une autre phrase polie et très banale. « Renvoyer le devis » est possible, mais moins automatique. L'outil ne devine pas ce que vous, vous vouliez dire. Il prend la suite la plus habituelle.",
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
                "Pourquoi « 12 % » ? Ce n'est pas le résultat de votre entreprise. Un rapport contient souvent un pourcentage précis, donc cette forme sonne sérieuse. L'outil n'a pas ouvert votre comptabilité. Il a fabriqué une phrase qui a l'air d'un vrai rapport. Le 12 % est inventé. Avant de le citer, vous vérifiez le document.",
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
          briefing:
            "On vient de voir que l'outil peut inventer avec un ton très sûr. Voici un paragraphe qu'il a écrit. Vous allez cliquer sur ce qu'il ne faut pas reprendre tel quel.",
          intro: "Cliquez sur les passages à vérifier avant de les envoyer.",
          fragments: [
            { id: "a", text: "Selon notre assistant,", trap: false },
            {
              id: "b",
              text: "le chiffre d'affaires a bondi de 340 % en un trimestre",
              trap: true,
              explanation:
                "Un pourcentage aussi précis et aussi beau est souvent inventé. Vous le cherchez dans vos vrais chiffres avant de le répéter.",
            },
            { id: "c", text: ", comme le confirme", trap: false },
            {
              id: "d",
              text: "l'étude INSEE-IA 2019 citée en note",
              trap: true,
              explanation:
                "Le titre a l'air officiel, mais l'étude peut ne pas exister. Vous la cherchez vraiment, vous ne vous fiez pas au nom.",
            },
            { id: "e", text: ". La réunion a eu lieu mardi,", trap: false },
            {
              id: "f",
              text: "comme l'impose l'article L.123-99 du Code du travail",
              trap: true,
              explanation:
                "Un numéro d'article bien présenté peut être faux. Vous ouvrez le texte de loi vous-même.",
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
          intro: "Avant de reprendre une réponse, je vérifie toujours ces quatre points :",
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
    goal: "Savoir ce que la loi vous demande, quel est votre rôle, et quelles dates comptent vraiment",
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
            "Les voitures ont un code de la route, pour que chacun sache ce qui est permis. L'Europe a fait quelque chose de comparable pour l'IA. Ce texte s'appelle l'AI Act.\n\nPour votre quotidien, retenez quatre niveaux. Certains usages sont interdits. Par exemple, analyser les émotions des salariés au travail. Noter les gens à partir de leur vie sociale. Ou fabriquer une image intime de quelqu'un sans son accord. D'autres usages sont très encadrés, comme un outil qui trie des CV : un humain doit garder la décision. D'autres demandent de prévenir la personne. Un chatbot sur le site, par exemple : elle doit savoir qu'elle parle à une machine. Et le reste, ce sont les usages courants, avec du bon sens.\n\nVoici l'ordre de ce bloc, pour que rien n'arrive sans prévenir. D'abord une question sur la date de la formation. Ensuite, vous classez votre rôle : vous utilisez un outil, ou votre entreprise en vend un. Puis vous rangez des exemples dans les quatre niveaux. Ensuite, on prend le chatbot, avec la phrase à écrire. Les dates détaillées ferment le bloc.\n\nDepuis février 2025, l'article 4 demande à votre entreprise de former les équipes. C'est pour ça que vous suivez ce parcours. Si un contrôle demande qui a été formé, et sur quelle preuve, votre attestation sert exactement à ça.\n\nIl existe deux rôles, et presque tout le monde est dans le premier. Quand vous utilisez ChatGPT ou Copilot pour votre travail, vous vous servez d'un outil déjà en vente. On dira « j'utilise ». Quand une entreprise fabrique une IA et la vend à ses clients, sous sa propre marque, les obligations sont plus lourdes. On dira « je vends ».\n\nUn texte récent, le Digital Omnibus, a décalé quelques dates. Vous n'avez pas à les réciter. On les ouvre à la fin du bloc, en français clair.\n\nDernier point, et il est important. La machine n'est jamais responsable à votre place. C'est l'entreprise qui répond de l'usage. Et dans votre travail, c'est vous qui choisissez ce que vous collez, et ce que vous envoyez.",
        },
      },
      {
        id: "2.2",
        title: "Depuis quand ?",
        duration: "1 min",
        format: "Pré-quiz",
        activity: {
          kind: "quiz",
          briefing:
            "Une seule question, pour fixer la date. On vient de le dire dans la vidéo : ce n'est pas un piège.",
          questions: [
            {
              prompt: "Depuis quand l'entreprise doit-elle former ses équipes à l'IA ?",
              choices: [
                {
                  label: "Depuis le 2 février 2025",
                  correct: true,
                  explanation:
                    "L'article 4 s'applique depuis cette date. La formation est déjà due. C'est ce parcours.",
                },
                {
                  label: "Seulement en 2027",
                  correct: false,
                  explanation:
                    "2027, c'est surtout le moment où le tri automatique de CV devient très encadré. La formation, elle, est déjà obligatoire.",
                },
                {
                  label: "Il n'y a aucune obligation",
                  correct: false,
                  explanation: "L'obligation de former existe déjà depuis février 2025.",
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
          briefing:
            "Deux rôles, et un seul vous concerne en général. « J'utilise » : votre entreprise se sert d'un outil déjà en vente, comme ChatGPT. « Je vends » : votre entreprise fabrique une IA, ou la propose à ses clients sous sa marque. Lisez chaque situation, puis classez-la.",
          instruction: "Glissez chaque situation dans le bon rôle.",
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
              explanation:
                "Vous vous servez d'un outil qui existe déjà. C'est le cas le plus courant pour un salarié.",
            },
            {
              id: "copilot",
              label: "Écrire avec Copilot",
              binId: "deploy",
              explanation: "Copilot est édité par une autre entreprise. Vous l'utilisez, vous ne le vendez pas.",
            },
            {
              id: "hrsaas",
              label: "Acheter un logiciel IA de tri de CV",
              binId: "deploy",
              explanation:
                "Vous achetez un outil déjà sur le marché, et vous vous en servez. Vous êtes dans « j'utilise ».",
            },
            {
              id: "brand",
              label: "Vendre un chatbot sous votre marque",
              binId: "provider",
              explanation:
                "Vous mettez l'IA sur le marché, sous votre nom. Les obligations sont plus lourdes que pour un simple utilisateur.",
            },
            {
              id: "product",
              label: "Intégrer une IA dans un logiciel vendu aux clients",
              binId: "provider",
              explanation: "Vos clients achètent votre offre, et l'IA en fait partie. Vous êtes du côté de ceux qui vendent.",
            },
          ],
        },
      },
      {
        id: "2.4",
        title: "Quel niveau de règle ?",
        duration: "2 min",
        format: "Jeu",
        activity: {
          kind: "sort",
          briefing:
            "On reprend les quatre niveaux de la vidéo. « Peu de règles » : usage courant. « Il faut prévenir » : la personne doit savoir que c'est une IA. « Très encadré » : un humain garde la décision. « Interdit » : on ne le fait pas. Classez chaque usage.",
          instruction: "Glissez chaque usage dans le bon niveau.",
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
              explanation: "C'est un usage courant. Vous relisez, et il n'y a pas de règle spéciale à ajouter.",
            },
            {
              id: "bot",
              label: "Chatbot qui parle aux clients",
              binId: "clear",
              explanation:
                "Le client doit savoir qu'il parle à une machine. La vidéo juste après vous donne la phrase à écrire.",
            },
            {
              id: "summary",
              label: "Un assistant répond aux mails clients en se faisant passer pour une personne",
              binId: "clear",
              explanation:
                "Même règle que le chatbot. La personne doit savoir qu'elle échange avec une IA, même par mail.",
            },
            {
              id: "cvsort",
              label: "Tri automatique de CV",
              binId: "high",
              explanation:
                "C'est très encadré. L'outil peut aider à lire. C'est un humain qui décide qui est reçu.",
            },
            {
              id: "score",
              label: "Noter les gens selon leur vie sociale",
              binId: "ban",
              explanation: "C'est interdit par l'article 5. On ne construit pas une note sociale avec une IA.",
            },
            {
              id: "emotion",
              label: "Analyser les émotions des salariés",
              binId: "ban",
              explanation: "C'est interdit au travail, sauf cas médicaux ou de sécurité très limités.",
            },
            {
              id: "intimate",
              label: "Image intime d'une personne, sans son accord",
              binId: "ban",
              explanation:
                "C'est interdit. On ne fabrique pas ce genre d'image. La date exacte est sur la frise, à la fin du bloc.",
            },
          ],
        },
      },
      {
        id: "2.5",
        title: "Le chatbot doit se présenter",
        duration: "1 min 30",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "Vous venez de ranger le chatbot dans « il faut prévenir ». Voici le geste, concrètement. C'est une règle de l'article 50, déjà en vigueur depuis août 2026.\n\nS'il y a un chatbot sur votre site, ou dans une application, ou un assistant qui répond aux mails, le client doit savoir qu'il parle à une machine. Il ne doit pas croire qu'il discute avec une personne du service client. Vous l'avertissez dès le début, avec une phrase simple. Par exemple : « Vous échangez avec un assistant automatique. »\n\nSi le chatbot se présente avec un prénom, comme « Bonjour, je suis Sophie », c'est encore plus facile de s'y tromper. Le prénom donne l'impression d'une collègue. Vous ajoutez quand même, clairement, que c'est une IA.\n\nVous n'avez pas à écrire un paragraphe juridique. Une phrase visible suffit, avant que la personne commence à poser ses questions. Si vous hésitez sur la phrase à afficher, vous demandez à votre manager ou au référent IA. On s'exerce juste après.",
        },
      },
      {
        id: "2.6",
        title: "Le chatbot, en situation",
        duration: "1 min 30",
        format: "Scénario",
        activity: {
          kind: "scenario",
          briefing:
            "Deux situations, sur la phrase qu'on vient de voir. Vous choisissez le geste.",
          steps: [
            {
              prompt: "Un nouveau chatbot arrive sur le site. Que faites-vous avant de le mettre en ligne ?",
              choices: [
                {
                  label: "Rien : les clients vont bien voir que ce n'est pas une personne",
                  correct: false,
                  explanation:
                    "On ne compte pas sur le client pour deviner. Vous lui dites, dès le premier message, qu'il parle à une IA.",
                },
                {
                  label: "On écrit clairement qu'il s'agit d'un assistant automatique",
                  correct: true,
                  explanation:
                    "C'est le geste de l'article 50. Une phrase claire, visible, avant la conversation.",
                },
              ],
            },
            {
              prompt:
                "Le chatbot dit « Bonjour, je suis Sophie, du service client », et il ne précise pas que c'est une machine. Vous le laissez comme ça ?",
              choices: [
                {
                  label: "Oui : le prénom rend le service plus agréable",
                  correct: false,
                  explanation:
                    "Le prénom fait justement croire à une personne réelle. Vous ajoutez que Sophie est un assistant automatique.",
                },
                {
                  label: "Non : on ajoute que le client parle à une IA",
                  correct: true,
                  explanation:
                    "Vous pouvez garder un ton accueillant. Vous ne laissez pas le client croire qu'il parle à une collègue.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "2.7",
        title: "Les dates qui comptent",
        duration: "2 min",
        format: "Jeu",
        activity: {
          kind: "timeline",
          briefing:
            "On ferme le bloc avec cinq dates. Le chatbot que vous venez de voir a la sienne. Le Digital Omnibus est le texte récent qui a décalé certaines échéances. Ouvrez les dates dans l'ordre. Vous n'avez pas à les réciter.",
          items: [
            {
              id: "2025",
              shortDate: "Fév. 2025",
              date: "2 février 2025",
              label: "Déjà en vigueur",
              law: "Article 4 — vous former",
              detail:
                "Votre entreprise doit déjà former les personnes qui utilisent l'IA. Plusieurs usages sont aussi déjà interdits, comme la notation sociale ou l'analyse des émotions au travail.",
            },
            {
              id: "aout26",
              shortDate: "Août 2026",
              date: "2 août 2026",
              label: "Déjà en vigueur",
              law: "Article 50 — prévenir",
              detail:
                "C'est la date de la règle que vous venez de pratiquer. Depuis août 2026, le chatbot doit se présenter comme une IA.",
            },
            {
              id: "dec26",
              shortDate: "Déc. 2026",
              date: "2 décembre 2026",
              label: "Prochaine échéance",
              law: "Article 5 — une interdiction de plus",
              detail:
                "À partir de cette date, il est interdit d'utiliser l'IA pour fabriquer une image, une vidéo ou une voix intime d'une personne réelle sans son accord explicite. Si ce n'est pas votre métier, retenez simplement : on ne fait pas ça.",
            },
            {
              id: "dec27",
              shortDate: "Déc. 2027",
              date: "2 décembre 2027",
              label: "Recrutement",
              law: "Haut risque — décalé par l'Omnibus",
              detail:
                "L'Omnibus a repoussé à cette date les règles strictes sur le tri de CV. Vous n'avez pas à anticiper le détail juridique. Le geste du quotidien est déjà celui de la vidéo : un humain garde la décision.",
            },
            {
              id: "aout28",
              shortDate: "Août 2028",
              date: "2 août 2028",
              label: "Plus tard",
              law: "IA dans certains produits",
              detail:
                "D'autres règles arriveront pour l'IA intégrée dans des produits réglementés. Vous n'avez pas à les connaître dans le détail. Si ça concerne votre métier, votre entreprise vous le dira.",
            },
          ],
        },
      },
    ],
  },
  {
    id: "bloc-3",
    number: 3,
    title: "Mes données et mes secrets",
    duration: "11 min",
    goal: "Savoir ce que vous pouvez donner à une IA, et pourquoi ce n'est pas un carnet privé",
    chapters: [
      {
        id: "3.1",
        title: "Ce que vous pouvez coller",
        duration: "2 min",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "Avant de coller un texte dans une IA, il y a une chose que beaucoup de gens découvrent ici. L'outil n'est pas un carnet privé. Quand vous écrivez dans ChatGPT, ou dans un outil ouvert au public, votre texte peut être enregistré. Il peut être lu par l'entreprise qui fournit l'outil. Il peut être réutilisé. Il peut aussi ressortir plus tard, parfois dans une autre réponse. Ce n'est pas parce que la fenêtre est sur votre écran que l'information reste dans votre entreprise.\n\nVous rangez donc ce que vous voulez coller en trois familles.\n\nVous pouvez y aller quand il n'y a ni personne identifiable, ni secret. Une idée de titre, une question déjà publiée sur votre site, une reformulation d'un texte anonyme : c'est bon.\n\nVous faites attention dès qu'une personne est reconnaissable. Un nom, un e-mail, un CV, une photo. Dans ce cas, vous n'utilisez qu'un outil autorisé par votre entreprise. Et vous ne donnez que ce qui sert vraiment à la tâche. Si le prénom n'aide pas, vous ne le mettez pas. Vous pouvez dire « un collègue » plutôt que « Julie Martin ». Attention : si on reconnaît encore la personne, ce n'est pas vraiment anonyme.\n\nVous ne collez pas ce qui est trop privé, ni les secrets de l'entreprise. La santé, la religion, la situation familiale, un arrêt maladie : vous ne mettez pas ça dans un outil grand public. Les prix qui ne sont pas publics, les contrats, le business plan, le programme d'un logiciel interne : vous ne les mettez pas non plus. Même sans nom dessus, un contrat reste un secret.\n\nSi vous hésitez, vous ne collez pas. Vous demandez à votre manager ou au référent IA.",
        },
      },
      {
        id: "3.2",
        title: "Dans quelle famille ?",
        duration: "3 min",
        format: "Jeu",
        activity: {
          kind: "sort",
          briefing:
            "On vient de voir les trois familles. « Je peux » : pas de personne, pas de secret. « Je fais attention » : une personne est reconnaissable, donc vous passez par un outil autorisé et vous n'en dites pas plus que nécessaire. « Je ne colle pas » : santé, vie très privée, ou secret d'entreprise. Rappel : le texte peut être enregistré et ressortir. Classez chaque carte.",
          instruction: "Glissez chaque information dans la bonne famille.",
          colorful: true,
          bins: [
            { id: "green", label: "Je peux" },
            { id: "orange", label: "Je fais attention" },
            { id: "red", label: "Je ne colle pas" },
          ],
          cards: [
            {
              id: "title",
              label: "Idée de titre pour une pub",
              binId: "green",
              explanation:
                "Vous pouvez. Il n'y a ni personne identifiable, ni secret. L'outil peut vous aider à chercher un titre.",
            },
            {
              id: "faq",
              label: "FAQ déjà sur le site",
              binId: "green",
              explanation: "Vous pouvez. Cette information est déjà publique. La coller ne fait rien sortir de nouveau.",
            },
            {
              id: "mail",
              label: "E-mail d'un collègue",
              binId: "orange",
              explanation:
                "Vous faites attention. Un e-mail identifie une personne. Vous ne le mettez que dans un outil autorisé, et seulement s'il sert vraiment.",
            },
            {
              id: "cv",
              label: "CV d'un candidat",
              binId: "orange",
              explanation:
                "Vous faites attention. Un CV est plein d'informations personnelles. Outil autorisé, et vous n'en donnez pas plus que ce dont vous avez besoin.",
            },
            {
              id: "photo",
              label: "Photo d'un salarié",
              binId: "orange",
              explanation:
                "Vous faites attention. Le visage identifie la personne. Vous ne l'envoyez pas dans un outil grand public.",
            },
            {
              id: "arret",
              label: "Arrêt maladie",
              binId: "red",
              explanation:
                "Vous ne collez pas. Un arrêt parle de santé. Même si l'outil a l'air privé, cette information peut être stockée. La santé ne va pas dans une IA grand public.",
            },
            {
              id: "synd",
              label: "Liste d'adhérents syndicaux",
              binId: "red",
              explanation:
                "Vous ne collez pas. C'est une information très privée sur des personnes. Elle n'a rien à faire dans ce que vous écrivez à l'outil.",
            },
            {
              id: "plan",
              label: "Business plan",
              binId: "red",
              explanation:
                "Vous ne collez pas. C'est un secret d'entreprise, même s'il n'y a aucun nom dedans. Enlever les noms ne le rend pas public.",
            },
            {
              id: "prix",
              label: "Grille de prix non publique",
              binId: "red",
              explanation:
                "Vous ne collez pas. Ces prix ne sont pas publics. Si l'outil les enregistre, ils peuvent sortir de l'entreprise.",
            },
            {
              id: "code",
              label: "Code d'un logiciel interne",
              binId: "red",
              explanation:
                "Vous ne collez pas. Ici, « code » veut dire le programme écrit par votre entreprise. C'est un secret, pas un code de carte bancaire.",
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
            "Quand une information est un peu sensible, vous avez trois réflexes.\n\nD'abord, vous ne donnez que ce qui sert à la tâche. Vous n'avez pas besoin du nom, de l'âge et de l'adresse pour demander des idées. Vous décrivez la situation sans identifier la personne.\n\nEnsuite, vous n'utilisez que les outils autorisés chez vous. Un outil payant n'est pas automatiquement sûr. Un outil gratuit n'est pas automatiquement interdit. C'est la liste de votre entreprise qui décide.\n\nEnfin, si vous avez collé quelque chose qu'il ne fallait pas, vous le dites tout de suite. Vous prévenez votre manager, le référent IA ou le DPO. En cas de fuite, l'entreprise a souvent soixante-douze heures pour agir auprès de la CNIL. Prévenir vite protège l'entreprise, et ça vous protège aussi. Une carte à la fin du bloc vous le remet sous les yeux.\n\nSi l'outil enregistre une réunion, la voix est une information sur une personne. Vous prévenez tout le monde avant de lancer l'enregistrement. Vos collègues, et aussi les personnes extérieures à l'entreprise. Elles n'ont pas à découvrir l'enregistrement après coup. On s'exercera là-dessus avec une réunion concrète.\n\nOn se dit parfois que ce n'est qu'un copier-coller, et qu'il n'y aura pas de conséquence. C'est souvent comme ça que ça commence. Derrière, il peut y avoir une fuite, une alerte, parfois une amende, et surtout une confiance qui casse.",
        },
      },
      {
        id: "3.4",
        title: "Nettoyez ce prompt",
        duration: "2 min",
        format: "Jeu",
        activity: {
          kind: "redact",
          briefing:
            "Vous allez retirer ce qui identifie la personne ou parle de sa santé. Le but n'est pas de tout effacer. La demande doit rester utile. Quand vous cliquez, le mot sensible est remplacé, et la phrase doit encore vouloir dire quelque chose.",
          intro: "Cliquez sur ce qu'il faut enlever. Gardez une demande claire.",
          tokens: [
            { id: "w1", text: "Rédige", redact: false },
            { id: "w2", text: "un", redact: false },
            { id: "w3", text: "mail", redact: false },
            { id: "w4", text: "pour", redact: false },
            { id: "w5", text: "Julie Martin", redact: true, replacement: "une collègue" },
            { id: "w6", text: "(julie.martin@mail.com),", redact: true, replacement: "" },
            { id: "w7", text: "42 ans,", redact: true, replacement: "" },
            { id: "w8", text: "en arrêt pour dépression.", redact: true, replacement: "." },
            { id: "w11", text: "Propose", redact: false },
            { id: "w12", text: "3", redact: false },
            { id: "w13", text: "idées", redact: false },
            { id: "w14", text: "d'accompagnement.", redact: false },
          ],
          explanation:
            "Vous gardez la demande. Elle peut devenir : « Rédige un mail pour une collègue. Propose 3 idées d'accompagnement. » Vous avez enlevé le nom, l'e-mail, l'âge et la santé. Un arrêt maladie ne se résume pas dans un outil grand public. Si on reconnaît encore la personne, ce n'est pas suffisant.",
        },
      },
      {
        id: "3.5",
        title: "Avant d'ouvrir l'outil",
        duration: "1 min",
        format: "Fiche",
        activity: {
          kind: "text",
          paragraphs: [
            "Ce n'est pas à vous de retracer le trajet technique des données. En pratique, vous ne savez pas toujours où elles sont stockées, et ce n'est pas votre travail de juriste.",
            "Avant d'ouvrir l'outil, vous vous posez trois questions. Si une réponse est non, vous n'y allez pas, ou vous demandez.",
          ],
          points: [
            "Est-ce que les informations que je vais coller sont acceptables ?",
            "Est-ce que j'utilise un outil autorisé par mon entreprise ?",
            "Est-ce que je m'en sers pour préparer mon travail, et je relis avant d'envoyer ?",
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
          briefing:
            "Voici la réunion dont on vient de parler. Trois questions, dans l'ordre. Choisissez le geste.",
          steps: [
            {
              prompt: "Vous voulez un outil qui enregistre et résume la réunion. Quelle est la première chose à faire ?",
              choices: [
                {
                  label: "Je vérifie qu'il est autorisé, ou j'en parle au référent IA",
                  correct: true,
                  explanation:
                    "C'est l'entreprise qui valide l'outil. Le fait que tout le monde s'en serve ne remplace pas cette validation.",
                },
                {
                  label: "Je lance l'enregistrement : tout le monde fait ça",
                  correct: false,
                  explanation:
                    "L'habitude ne vaut pas une autorisation. Vous vérifiez la liste, ou vous demandez, avant d'enregistrer des voix.",
                },
              ],
            },
            {
              prompt:
                "L'outil est autorisé. Des personnes extérieures à l'entreprise sont dans la salle, et leur voix sera enregistrée aussi. Que faites-vous ?",
              choices: [
                {
                  label: "Je préviens tout le monde avant, y compris les personnes extérieures",
                  correct: true,
                  explanation:
                    "Vous prévenez tout le monde avant d'appuyer sur enregistrer. Les personnes extérieures n'ont pas signé vos règles internes, et leur voix est aussi une information personnelle. Elles ne doivent pas découvrir l'enregistrement après coup.",
                },
                {
                  label: "Je préviens seulement mes collègues",
                  correct: false,
                  explanation:
                    "Les personnes extérieures sont concernées aussi. Leur voix part dans l'outil comme celle de vos collègues. Vous les prévenez avant.",
                },
              ],
            },
            {
              prompt: "Le résumé est prêt. Que faites-vous avant de l'envoyer ?",
              choices: [
                {
                  label: "Je le relis, parce que l'outil peut se tromper de personne ou de décision",
                  correct: true,
                  explanation:
                    "Vous relisez. L'outil peut attribuer une phrase à la mauvaise personne, ou inventer une décision qui n'a pas été prise.",
                },
                {
                  label: "Je l'envoie tout de suite pour gagner du temps",
                  correct: false,
                  explanation:
                    "Deux minutes de relecture évitent d'envoyer un faux compte rendu. Le temps gagné ne vaut pas une erreur envoyée à tout le monde.",
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
            "On l'a dit dans la vidéo. Le voici, pour le garder.",
            "Vous prévenez tout de suite votre manager, le référent IA ou le DPO. Vous ne restez pas seul avec l'erreur, et vous n'attendez pas de voir si quelqu'un s'en aperçoit.",
            "L'entreprise n'a parfois que 72 heures pour agir. Plus vous le dites tôt, plus elle peut limiter les dégâts.",
          ],
        },
      },
    ],
  },
  {
    id: "bloc-4",
    number: 4,
    title: "C'est vous qui décidez",
    duration: "12 min",
    goal: "Garder la main : sur les personnes, sur les publications, et sur ce que l'outil n'a pas le droit de faire seul",
    chapters: [
      {
        id: "4.1",
        title: "L'IA propose, vous décidez",
        duration: "1 min 30",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "Dans le bloc sur la loi, certains usages sont « très encadrés » parce qu'un humain doit garder la décision. Voici ce que ça change dans vos gestes.\n\nL'IA peut vous préparer un texte, une liste ou une proposition. Elle ne décide pas à votre place.\n\nC'est particulièrement vrai quand une personne est concernée. Une candidature, une sanction, un refus, un paiement. Si vous cliquez sur valider sans lire, vous n'avez pas vraiment décidé. Vous avez laissé l'outil trancher.\n\nDécider, ça veut dire trois choses concrètes. Vous comprenez ce que l'outil propose. Vous pouvez le modifier. Vous pouvez dire non.\n\nUn envoi définitif, un paiement, une décision lourde : c'est un humain qui valide. Toujours. On va le mettre en situation juste après.",
        },
      },
      {
        id: "4.2",
        title: "Qui valide ?",
        duration: "2 min",
        format: "Scénario",
        activity: {
          kind: "scenario",
          briefing:
            "Trois situations qu'on vient d'évoquer. À chaque fois, demandez-vous qui décide vraiment : vous, ou l'outil.",
          steps: [
            {
              prompt: "L'IA a préparé les refus à envoyer aux candidats. Que faites-vous ?",
              choices: [
                {
                  label: "Je la laisse envoyer : c'est plus rapide",
                  correct: false,
                  explanation:
                    "Un refus est une décision sur une personne. Vous lisez chaque message, et c'est vous qui validez l'envoi.",
                },
                {
                  label: "Je lis chaque refus, et c'est moi qui valide l'envoi",
                  correct: true,
                  explanation:
                    "L'outil peut préparer le brouillon. La décision d'envoyer, et le contenu, restent les vôtres.",
                },
              ],
            },
            {
              prompt: "L'IA a rédigé un courrier juridique. Il a l'air très propre. Vous…",
              choices: [
                {
                  label: "Je l'envoie, parce que le ton est professionnel",
                  correct: false,
                  explanation:
                    "Un ton propre ne veut pas dire que le droit est juste. Vous le faites relire par la personne compétente avant tout envoi.",
                },
                {
                  label: "Je le fais relire avant de l'envoyer",
                  correct: true,
                  explanation:
                    "Vous ne signez pas un courrier juridique sur la seule foi de l'outil. Une erreur de droit engage l'entreprise.",
                },
              ],
            },
            {
              prompt: "Un paiement important est prêt. L'IA propose de le lancer. Vous…",
              choices: [
                {
                  label: "Je lance le paiement : le montant a l'air cohérent",
                  correct: false,
                  explanation:
                    "Vous ne lancez pas un paiement parce qu'un outil le propose. Un humain le valide, sur le canal habituel de l'entreprise.",
                },
                {
                  label: "Un humain valide le paiement, sur le canal habituel",
                  correct: true,
                  explanation:
                    "L'outil peut préparer. Il ne paie pas seul. Vous vérifiez le bénéficiaire et le montant avant de valider.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "4.3",
        title: "Elle peut être injuste",
        duration: "1 min 30",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "Le tri de CV était dans les usages très encadrés. Voici pourquoi un score peut être injuste, avec un exemple.\n\nL'IA apprend sur des exemples du passé. Si ce passé était injuste, l'outil peut reproduire cette injustice, tout en ayant l'air neutre.\n\nChez Amazon, un outil a trié des CV pendant une expérimentation. Il avait appris sur dix ans d'embauches. Pendant ces dix ans, les personnes embauchées étaient surtout des hommes. Résultat : dès que le CV mentionnait une activité associée aux femmes, par exemple « capitaine de l'équipe féminine », l'outil plaçait ce CV plus bas dans la liste, comme s'il était moins bon. Personne n'avait écrit la consigne « écarter les femmes ». Les exemples du passé suffisaient. À l'écran, on ne voyait qu'un score, propre, qui avait l'air objectif.\n\nConcrètement, l'outil peut classer, résumer, ou vous aider à lire. Il ne doit pas faire disparaître une personne sans que vous le sachiez. Vous lisez les CV, y compris ceux que l'outil a mis en bas de la liste. C'est vous qui choisissez qui vous recevez, et c'est vous qui pouvez expliquer pourquoi.",
        },
      },
      {
        id: "4.4",
        title: "Le bas de la liste",
        duration: "1 min 30",
        format: "Scénario",
        activity: {
          kind: "scenario",
          briefing:
            "On vient de voir qu'un score peut écarter quelqu'un sans que ce soit juste. Voici deux décisions de recrutement. Vous gardez la main.",
          steps: [
            {
              prompt:
                "L'outil a classé les CV. Plusieurs candidatures sont tout en bas, et il n'explique pas pourquoi. Que faites-vous ?",
              choices: [
                {
                  label: "Je ne regarde que le haut de la liste",
                  correct: false,
                  explanation:
                    "Le bas de la liste peut cacher une personne écartée à tort, comme dans l'exemple d'Amazon. Vous ouvrez aussi ces CV.",
                },
                {
                  label: "Je lis aussi les CV du bas, et je décide qui je reçois",
                  correct: true,
                  explanation:
                    "L'outil peut vous aider à préparer la lecture. Il ne choisit pas à votre place qui a le droit d'être reçu.",
                },
              ],
            },
            {
              prompt: "Un score affiche 62 sur 100. Vous ne savez pas ce qu'il mesure. Vous…",
              choices: [
                {
                  label: "Je suis le score : un chiffre est plus objectif",
                  correct: false,
                  explanation:
                    "Un chiffre n'est pas objectif par magie. S'il a appris sur un passé biaisé, il reproduit ce passé. Vous ne tranchez pas sur le score seul.",
                },
                {
                  label: "Je lis le CV. Le score ne décide pas",
                  correct: true,
                  explanation:
                    "Vous pouvez regarder le score comme un indice. La décision vient de votre lecture, pas du nombre.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "4.5",
        title: "Avant de publier",
        duration: "1 min 30",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "Quand l'IA crée une image ou un texte, vous n'êtes pas automatiquement libre de le publier partout.\n\nL'image peut ressembler à une œuvre déjà protégée, à un logo, ou au visage de quelqu'un. Le texte peut recopier un passage trouvé sur le web. Et les conditions de l'outil peuvent limiter ce que vous avez le droit de réutiliser, même si c'est vous qui avez cliqué sur générer.\n\nAvant de publier, vous vous posez trois questions. Est-ce que je reconnais une marque, une personne ou une œuvre ? Est-ce que les conditions de l'outil autorisent cet usage ? Est-ce que mon entreprise valide cette publication ?\n\nSi vous ne savez pas répondre, vous ne publiez pas pour voir. Vous demandez.",
        },
      },
      {
        id: "4.6",
        title: "Je publie ou pas ?",
        duration: "1 min 30",
        format: "Scénario",
        activity: {
          kind: "scenario",
          briefing:
            "Deux publications. On vient de voir les trois questions : une marque ou une œuvre, les conditions de l'outil, et l'accord de votre entreprise.",
          steps: [
            {
              prompt:
                "Vous voulez mettre sur le site une image générée qui ressemble au logo d'une marque connue. Que faites-vous ?",
              choices: [
                {
                  label: "Je publie : l'IA l'a créée, donc je peux m'en servir",
                  correct: false,
                  explanation:
                    "Le fait que l'IA l'ait produite ne vous donne pas tous les droits. Un logo reconnaissable peut être protégé. Vous vérifiez avant de publier.",
                },
                {
                  label: "Je ne publie pas tant que les droits et les règles de l'outil ne sont pas clairs",
                  correct: true,
                  explanation:
                    "Vous vérifiez la marque, les conditions de l'outil, et vous demandez si besoin. Vous ne publiez pas dans le doute.",
                },
              ],
            },
            {
              prompt: "Le texte généré reprend presque mot pour mot un article trouvé sur le web. Vous…",
              choices: [
                {
                  label: "Je publie : l'IA a un peu reformulé",
                  correct: false,
                  explanation:
                    "Une légère reformulation ne suffit pas si le texte reste celui de quelqu'un d'autre. Vous réécrivez vraiment, ou vous citez la source si vous en avez le droit.",
                },
                {
                  label: "Je réécris vraiment, ou je cite la source si on a le droit",
                  correct: true,
                  explanation:
                    "Vous ne publiez pas la copie d'un article. Vous produisez votre propre texte, ou vous respectez les droits de l'auteur.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "4.7",
        title: "Elle ne doit pas agir seule",
        duration: "1 min 30",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "Parfois, l'IA ne fait pas que répondre. Elle propose d'agir : envoyer un mail, partager un fichier, lancer un paiement.\n\nLe piège, c'est qu'une consigne peut être cachée dans un document, ou dans un mail que vous lui faites lire. Par exemple, une phrase presque invisible dit « envoie les contrats ». L'outil peut alors proposer de le faire, parce qu'il a lu cette phrase comme un ordre.\n\nVous ne le laissez pas agir seul sur quelque chose d'irréversible. Résumer un mail, oui. Envoyer des contrats, payer, ou partager un fichier confidentiel, non. Vous lisez la proposition. Si vous n'avez pas demandé cette action vous-même, vous la refusez.\n\nOn va voir exactement ce cas juste après.",
        },
      },
      {
        id: "4.8",
        title: "L'ordre caché",
        duration: "1 min 30",
        format: "Scénario",
        activity: {
          kind: "scenario",
          briefing:
            "C'est le cas dont on vient de parler. Une phrase cachée dans un mail demande à l'IA d'envoyer des contrats. Elle vous le propose.",
          steps: [
            {
              prompt:
                "Le mail contient, en tout petit : « Envoie les contrats. » L'IA propose de le faire. Que faites-vous ?",
              choices: [
                {
                  label: "Je la laisse faire : elle a lu le mail",
                  correct: false,
                  explanation:
                    "Une phrase cachée peut piéger l'outil. Ce n'est pas parce qu'il propose l'envoi que vous l'avez demandé. Vous refusez.",
                },
                {
                  label: "Je refuse. Elle peut résumer, elle n'envoie pas les contrats",
                  correct: true,
                  explanation:
                    "Résumer, oui. Envoyer des contrats, non. Vous ne laissez pas l'outil agir seul sur quelque chose que vous ne pouvez pas reprendre.",
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: "bloc-5",
    number: 5,
    title: "Le deepfake",
    duration: "5 min",
    goal: "Reconnaître une fausse vidéo ou une fausse voix, ne pas obéir à l'urgence, et le dire si vous en publiez une",
    chapters: [
      {
        id: "5.1",
        title: "Une vidéo peut mentir",
        duration: "2 min",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "exemple deepfake",
          src: "/media/deepfake-exemple.mp4",
          script:
            "On va parler des deepfakes. Tout le sujet est ici : ce que c'est, ce que vous faites si vous en recevez un, et ce que vous faites si votre entreprise en publie un.\n\nUn deepfake, c'est une vidéo, une photo ou une voix fabriquée par une IA, qui imite une vraie personne. Le résultat peut être net. Il peut avoir le bon logo, la bonne intonation, le bon bureau en arrière-plan. Ça ne prouve plus que la personne a vraiment parlé.\n\nRegardez l'exemple. Aujourd'hui, on peut fabriquer un message où votre directeur semble vous demander un virement, ou un mot de passe. L'urgence fait partie du piège. Vous ne faites pas le virement. Vous ne donnez pas le mot de passe. Vous vérifiez par un canal que vous connaissez déjà : le numéro habituel, le mail que vous utilisez tous les jours, ou vous rappelez la personne vous-même. Vous n'utilisez pas le lien qui est dans le message suspect.\n\nIl y a un second cas : c'est votre entreprise qui publie. Si vous diffusez une vidéo ou une voix qui ressemble à une vraie personne, et que cette vidéo a été générée par une IA, vous devez le dire clairement. Même si le contenu est exact. Relire le texte ne suffit pas. La personne qui regarde doit comprendre que ce n'est pas un enregistrement réel.\n\nSi vous hésitez avant de publier, ou si un message vous semble trop urgent pour être honnête, vous demandez. On s'exerce juste après.",
        },
      },
      {
        id: "5.2",
        title: "Deux situations",
        duration: "2 min",
        format: "Scénario",
        activity: {
          kind: "scenario",
          briefing:
            "On vient de voir les deux gestes. D'abord, vous recevez un message trop urgent. Ensuite, votre équipe veut publier une vidéo générée. Choisissez ce que vous faites vraiment.",
          steps: [
            {
              prompt:
                "En visio, le « directeur » demande un virement tout de suite. La voix et le visage correspondent. Vous…",
              imageSrc: "/media/formation/visio-directeur.jpg",
              choices: [
                {
                  label: "J'obéis : si le visage correspond, c'est lui",
                  correct: false,
                  explanation:
                    "Un visage net et une voix juste ne prouvent plus rien. L'urgence est le piège. Vous ne faites pas le virement depuis cette visio.",
                },
                {
                  label: "Je raccroche et je rappelle sur un numéro déjà connu",
                  correct: true,
                  explanation:
                    "Vous vérifiez par un canal que vous utilisez déjà. Vous n'utilisez pas le lien ni le numéro affichés dans le message suspect.",
                },
              ],
            },
            {
              prompt:
                "Votre équipe veut publier une vidéo d'un vrai salarié, générée par IA. Le texte est exact. Que faites-vous ?",
              mediaSrc: "/media/formation/video-project-5.mp4",
              choices: [
                {
                  label: "On publie : le contenu a été relu, ça suffit",
                  correct: false,
                  explanation:
                    "Relire le texte ne suffit pas. La personne qui regarde doit voir que cette vidéo a été générée. Sinon, elle croit à un enregistrement réel.",
                },
                {
                  label: "On publie seulement en indiquant clairement que c'est généré par IA",
                  correct: true,
                  explanation:
                    "Vous le dites, même si le contenu est juste. Une fausse vidéo d'une vraie personne se signale. Toujours.",
                },
              ],
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
    duration: "4 min",
    goal: "Repartir avec les sept questions, expliquées, puis revues dans le jeu",
    chapters: [
      {
        id: "6.1",
        title: "Les sept questions",
        duration: "1 min 30",
        format: "Fiche",
        activity: {
          kind: "text",
          paragraphs: [
            "Vous avez maintenant les pièces. Voici les sept questions à garder près de l'écran. Ce n'est pas une nouvelle leçon : c'est le résumé de ce que vous venez de faire.",
            "Avant d'écrire à l'outil, vous vous en posez quatre. Est-ce un secret de l'entreprise ? Est-ce une information sur une personne ? Est-ce trop privé, comme la santé ? L'outil est-il autorisé chez nous ?",
            "Après la réponse, vous vous en posez trois. Ai-je vérifié ce qui compte, les chiffres, les noms, les sources ? Est-ce bien un humain qui décide ? Dois-je prévenir mon manager ou le référent IA ?",
            "Le jeu qui suit sert à les revoir. Vous les connaissez déjà. Il ne démarre pas sans cette explication.",
          ],
          points: [...SEVEN_REFLEXES],
        },
      },
      {
        id: "6.2",
        title: "Rangez les 7 réflexes",
        duration: "2 min 30",
        format: "Jeu",
        activity: {
          kind: "tetris",
          briefing:
            "Les sept réflexes que vous venez de lire vont tomber un par un. Vous les déplacez, vous les tournez, vous les posez. Le but est de les relire, pas de battre un score. Quand vous êtes prêt, vous lancez la partie.",
          intro: "Relisez chaque réflexe en le posant.",
          blocks: SEVEN_REFLEXES.map((label, index) => ({
            id: `r${index + 1}`,
            label,
          })),
        },
      },
    ],
  },
];
