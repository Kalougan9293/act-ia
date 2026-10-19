import type { Block } from "@/lib/formation/activity";

/** Avant d'écrire à l'IA */
export const REFLEXES_BEFORE = [
  "Cette IA est-elle autorisée chez nous ?",
  "Est-ce une info sur une personne ?",
  "Est-ce trop privé (santé, religion…) ?",
  "Est-ce un secret de l'entreprise ?",
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
    goal: "Comprendre comment l'outil écrit, pourquoi il peut inventer, et ce que vous venez faire ici.",
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
            "Vous êtes ici parce que votre entreprise doit prendre des mesures pour soutenir la maîtrise de l'IA, conformément à l'article 4 du règlement européen en vigueur depuis février 2025 — pas pour « garantir » que chacun devient expert. Le but de cette formation n'est pas de vous faire passer un examen de droit, mais de vous aider à acquérir des réflexes simples, avec à la fin une attestation qui prouve que vous avez suivi le parcours.\n\nVous utilisez peut-être déjà ChatGPT, Copilot, ou une application qui crée des images. Si ce n'est pas votre cas, regardez autour de vous : beaucoup de collègues s'en servent déjà. L'IA peut vous faire gagner du temps. Elle peut rédiger, résumer, traduire ou chercher. Mais elle peut aussi se tromper, ou faire sortir une information qui devait rester dans l'entreprise.\n\nDans cette formation, on avance un sujet à la fois. D'abord, on explique comment l'outil écrit. Ensuite, on aborde ce que la loi exige. Et enfin, on voit comment utiliser l'outil, ce que vous pouvez y intégrer, et les informations qu'il faut garder pour vous.",
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
            "Il y a deux familles d'outils quand on parle d'IA.\n\nLa première, c'est l'IA classique. Elle ne rédige pas un texte nouveau. Elle classe, elle trie ou elle calcule. Le filtre qui met un mail dans les indésirables, c'est cette famille. Le GPS qui propose un itinéraire, c'est cette famille aussi.\n\nLa deuxième, c'est l'IA qui crée. On l'appelle aussi IA générative. ChatGPT, Copilot et Gemini en font partie. Vous lui demandez un mail, une image ou un résumé, et elle produit quelque chose qui n'existait pas.\n\nComment elle écrit ? Elle avance mot après mot. À chaque fois, elle choisit le mot qui a le plus de chances de suivre, parce qu'elle l'a souvent vu dans d'autres textes. Elle ne sait pas si c'est vrai. Elle devine la suite la plus probable.\n\nQuatre mots suffisent pour en parler. Le LLM, c'est le moteur qui écrit, derrière ChatGPT ou Copilot. L'hallucination, c'est une réponse bien tournée, mais fausse.\n\nLe prompt, c'est votre consigne : ce que vous lui demandez de faire. Par exemple : « Écris un mail court, poli, et n'invente pas de date. »\n\nLe contexte, ce sont les informations pour qu'elle sache de quoi vous parlez. Un fichier, un mail d'un client, des faits peuvent être ajoutés à votre conversation. Si vous ne les lui donnez pas, elle ne les a pas. Et si vous ouvrez une nouvelle discussion, elle les perd, vous devez alors les lui redonner.\n\nRetenez cette phrase : une réponse probable n'est pas une réponse vraie. C'est pour ça que vous devez vérifier les informations qu'elle donne avant de les utiliser.",
        },
      },
      {
        id: "1.3",
        title: "IA classique ou Générative ?",
        duration: "1 min 30",
        format: "Jeu",
        activity: {
          kind: "sort",
          briefing:
            "On vient de voir les deux familles.\nL'IA classique trie, ou calcule. Elle n'invente pas un texte.\nL'IA générative, c'est celle qui crée. Elle rédige, résume, ou produit une image.\n\nClassez chaque exemple dans la bonne famille.\nLisez d'abord, puis glissez.",
          instruction: "Glissez chaque carte dans la bonne famille.",
          colorful: true,
          bins: [
            { id: "classic", label: "IA classique" },
            { id: "gen", label: "IA générative" },
          ],
          cards: [
            {
              id: "spam",
              label: "Filtre anti-spam",
              binId: "classic",
              explanation:
                "Elle range les mails. Elle n'écrit pas un nouveau message. C'est l'IA classique.",
            },
            {
              id: "gpt",
              label: "ChatGPT",
              binId: "gen",
              explanation: "Elle rédige un texte qui n'existait pas. C'est l'IA générative.",
            },
            {
              id: "gps",
              label: "GPS",
              binId: "classic",
              explanation: "Elle calcule un itinéraire parmi des routes qui existent déjà.",
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
                "Elle propose des produits qui sont déjà au catalogue. Elle ne les invente pas.",
            },
            {
              id: "spell",
              label: "Correcteur d'orthographe",
              binId: "classic",
              explanation:
                "Elle repère et corrige parmi des règles déjà connues. Elle n'invente pas un texte.",
            },
            {
              id: "mail",
              label: "Mail rédigé par Copilot",
              binId: "gen",
              explanation:
                "Copilot produit un message nouveau à partir de votre consigne. C'est de l'IA générative.",
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
            "On vient de nommer 4 mots : LLM, prompt, hallucination, contexte.\nVous choisissez le mot qui décrit l'exemple.",
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
                "C'est le LLM, le moteur qui écrit. Il propose une suite. Il ne vérifie pas si cette suite est vraie.",
            },
            {
              id: "c2",
              label: "Vous précisez le ton, la longueur, et ce que l'outil ne doit pas inventer",
              stampId: "prompt",
              explanation:
                "C'est le prompt : la consigne que vous écrivez à l'IA. Vous y dites le ton, la longueur, et ce qu'elle ne doit pas inventer. Plus cette consigne est précise, plus la réponse vous sert.",
            },
            {
              id: "c3",
              label:
                "Au travail, vous avez reçu un mail de relance écrit par l'IA. Elle mentionne « pour la réunion du 3 mars ». Cette réunion n'a jamais eu lieu.",
              stampId: "hallu",
              explanation:
                "Vous en déduisez que l'IA a inventé la réunion. Le mail a l'air vrai, mais le fait est faux. C'est une hallucination. Vous ne croyez pas la date sans la vérifier.",
            },
            {
              id: "c4",
              label: "Vous ouvrez une nouvelle discussion dans l'IA. Elle ne retrouve plus le fichier, tant que vous ne le joignez pas de nouveau",
              stampId: "ctx",
              explanation:
                "C'est le contexte. À chaque nouvelle discussion, l'IA perd la mémoire. Pour qu'elle retrouve la situation, vous lui redonnez le fichier.",
            },
          ],
        },
      },
      {
        id: "1.5",
        title: "Quelle suite l'IA choisirait-elle ?",
        duration: "2 min",
        format: "Animation",
        activity: {
          kind: "predict",
          briefing:
            "L'outil ne cherche pas votre vraie réponse.\nIl complète avec la suite la plus fréquente dans les textes qu'il a vus.\nLisez le début de phrase, et devinez ce qu'il ajouterait.",
          hint: "Quelle suite est la plus probable selon la façon dont l'IA réfléchit ? Ce n'est pas forcément la vraie. Les % sont illustratifs.",
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
                "Pourquoi « planifier un créneau », et pas « renvoyer le devis » ? Parce qu'après un « merci », les mails proposent très souvent un rendez-vous. « Renvoyer le devis » peut être ce que vous vouliez vraiment, mais l'outil ne le sait pas. Il choisit la suite qu'il a le plus souvent vue. Il ne lit pas votre intention.",
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
    duration: "8 min",
    goal: "Savoir ce que la loi vous demande, quel est votre rôle, et quelles dates comptent vraiment",
    chapters: [
      {
        id: "2.1",
        title: "Avant la vidéo",
        duration: "30 s",
        format: "Pré-quiz",
        activity: {
          kind: "quiz",
          questions: [
            {
              prompt: "Depuis quand l'entreprise doit-elle prendre des mesures pour soutenir la maîtrise de l'IA ?",
              choices: [
                {
                  label: "Depuis le 2 février 2025",
                  correct: true,
                  explanation:
                    "Exact. L'article 4 s'applique depuis cette date (pas depuis août 2025). La vidéo vous explique ce que ça change pour vous.",
                },
                {
                  label: "Seulement en 2027",
                  correct: false,
                  explanation:
                    "Pas tout à fait. 2027 concerne surtout le tri automatique de CV. La vidéo vous explique.",
                },
                {
                  label: "Il n'y a aucune obligation",
                  correct: false,
                  explanation:
                    "Si, une obligation existe déjà depuis février 2025. La vidéo vous explique.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "2.2",
        title: "La loi en clair",
        duration: "2 min",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "Les voitures ont un code de la route, pour que chacun sache ce qui est permis. L'Europe a fait quelque chose de comparable pour l'IA. Ce texte s'appelle l'AI Act.\n\nPour votre quotidien, l'AI Act prévoit quatre niveaux de risque.\nLe risque inacceptable : en principe interdit. Par exemple, demander à une IA, à partir d'une vidéo ou de la voix, si un collègue a l'air stressé ou motivé — sauf exceptions très limitées, notamment santé ou sécurité. Autre exemple, analyser la photo d'un collègue pour déduire sa religion ou son origine.\nLe haut risque : des exigences plus strictes. Par exemple, un outil qui trie des CV peut aider, mais un humain doit garder la décision finale.\nLe risque limité : dans la plupart des cas, il faut prévenir. Par exemple avec un chatbot, l'utilisateur doit savoir qu'il parle à une machine, pas à un humain. Il faut clairement l'indiquer, sauf exceptions prévues par le texte.\nEnfin, le risque minimal : pas d'obligation particulière comme corriger un mail, résumer une réunion… juste du bon sens.\n\nCe texte regarde aussi votre place face à l'outil. Il y a 2 cas de figure : soit vous utilisez Claude, Gemini ou Copilot pour travailler — vous êtes utilisateurs, comme presque tout le monde. Soit votre entreprise fabrique une IA et la vend sous son nom — vous êtes vendeurs, et là les règles sont plus lourdes.\n\nPour finir : c'est l'entreprise qui reste responsable face à la loi. Vous, en tant qu'utilisateur, devez suivre les règles internes et les bons réflexes : c'est comme ça que vous protégez l'entreprise et vous-même.",
        },
      },
      {
        id: "2.3",
        title: "J'utilise ou je vends ?",
        duration: "1 min 30",
        format: "Jeu",
        activity: {
          kind: "swipe",
          briefing:
            "Deux rôles.\n« J'utilise » : votre entreprise se sert d'un outil déjà en vente, comme ChatGPT.\n« Je vends » : votre entreprise fabrique une IA, ou la propose à ses clients sous sa marque.\nBalancez chaque situation vers la bonne zone.",
          left: { id: "deploy", label: "J'utilise" },
          right: { id: "provider", label: "Je vends" },
          cards: [
            {
              id: "mail",
              label: "Rédiger mes mails avec ChatGPT",
              zoneId: "deploy",
              explanation:
                "Vous vous servez d'un outil qui existe déjà. C'est le cas le plus courant pour un salarié.",
            },
            {
              id: "copilot",
              label: "Écrire avec Copilot",
              zoneId: "deploy",
              explanation: "Copilot est édité par une autre entreprise. Vous l'utilisez, vous ne le vendez pas.",
            },
            {
              id: "hrsaas",
              label: "Acheter un logiciel IA de tri de CV",
              zoneId: "deploy",
              explanation:
                "Vous achetez un outil déjà sur le marché, et vous vous en servez. Vous êtes dans « j'utilise ».",
            },
            {
              id: "compta",
              label: "Utiliser l'assistant IA intégré à votre logiciel de compta",
              zoneId: "deploy",
              explanation: "L'IA est dans un logiciel que vous achetez. Vous l'utilisez.",
            },
            {
              id: "brand",
              label: "Vendre un chatbot sous votre marque",
              zoneId: "provider",
              explanation:
                "Vous mettez l'IA sur le marché, sous votre nom. Les obligations sont plus lourdes que pour un simple utilisateur.",
            },
            {
              id: "product",
              label: "Intégrer une IA dans un logiciel vendu aux clients",
              zoneId: "provider",
              explanation: "Vos clients achètent votre offre, et l'IA en fait partie. Vous êtes du côté de ceux qui vendent.",
            },
          ],
        },
      },
      {
        id: "2.4",
        title: "Quel niveau de risque ?",
        duration: "2 min",
        format: "Jeu",
        activity: {
          kind: "sort",
          briefing:
            "On reprend les quatre niveaux de la vidéo.\n« Risque minimal » : usages courants, juste du bon sens.\n« Risque limité » : la personne doit savoir que c'est une IA.\n« Haut risque » : un humain doit garder la décision finale.\n« Risque inacceptable » : pratique interdite.\nClassez chaque usage.",
          instruction: "Glissez chaque usage dans le bon niveau.",
          colorful: true,
          bins: [
            { id: "low", label: "Risque minimal" },
            { id: "clear", label: "Risque limité" },
            { id: "high", label: "Haut risque" },
            { id: "ban", label: "Risque inacceptable" },
          ],
          cards: [
            {
              id: "spell",
              label: "Correcteur d'orthographe",
              binId: "low",
              explanation:
                "Risque minimal : juste du bon sens.",
            },
            {
              id: "meet",
              label: "Résumer une réunion avec ChatGPT",
              binId: "low",
              explanation:
                "C'est du risque minimal. Usage courant : vous relisez le résumé, et c'est tout.",
            },
            {
              id: "bot",
              label: "Chatbot qui parle aux clients",
              binId: "clear",
              explanation:
                "C'est du risque limité. Le client doit savoir qu'il parle à une machine.",
            },
            {
              id: "summary",
              label: "Un assistant répond aux mails clients en se faisant passer pour une personne",
              binId: "clear",
              explanation:
                "Même règle, risque limité. La personne doit savoir qu'elle échange avec une IA, même par mail.",
            },
            {
              id: "cvsort",
              label: "Tri automatique de CV",
              binId: "high",
              explanation:
                "C'est du haut risque (AI Act). L'outil peut aider à trier, mais un humain garde la décision — déjà exigé par le RGPD (art. 22).",
            },
            {
              id: "emotion",
              label: "Demander à une IA si un collègue a l'air stressé d'après sa voix ou une vidéo",
              binId: "ban",
              explanation:
                "C'est un risque inacceptable (Art. 5) : au travail, on ne déduit pas les émotions avec une IA, hors exceptions très limitées (notamment santé ou sécurité).",
            },
            {
              id: "biocat",
              label: "Analyser la photo d'un collègue pour déduire sa religion ou son origine",
              binId: "ban",
              explanation:
                "C'est un risque inacceptable (Art. 5). On ne déduit pas la religion, l'origine ou l'orientation à partir d'une photo.",
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
              law: "Articles 4 et 5 — déjà en vigueur",
              detail:
                "Article 4 (après l'Omnibus 2026) : l'entreprise doit prendre des mesures pour soutenir la maîtrise de l'IA chez celles et ceux qui l'utilisent — pas « garantir » un niveau d'expertise. Cette formation en fait partie. Le texte n'attache pas d'amende spécifique à l'article 4. Article 5 : les pratiques à risque inacceptable sont déjà interdites. Par exemple, analyser les émotions d'un collègue avec une IA (voix ou vidéo) — hors exceptions très limitées —, ou déduire sa religion ou son origine à partir d'une photo.",
            },
            {
              id: "aout26",
              shortDate: "Août 2026",
              date: "2 août 2026",
              label: "Déjà en vigueur",
              law: "Article 50 — transparence",
              detail:
                "Août 2026, c'est surtout la transparence (Art. 50). Un chatbot doit dire dès le début que c'est une machine. Pour une image, une vidéo ou une voix générée : on signale surtout ce qui peut passer pour réel (deepfake). Pas toute image IA stylisée. Le but : personne ne doit croire à tort que c'est un humain ou un vrai enregistrement.",
            },
            {
              id: "dec26",
              shortDate: "Déc. 2026",
              date: "2 décembre 2026",
              label: "Prochaine échéance",
              law: "Deepfakes intimes — AI Act + déjà en France",
              detail:
                "En France, diffuser un deepfake sexuel sans consentement est déjà un délit (loi SREN). Au 2 décembre 2026, l'AI Act ajoute aussi une interdiction européenne sur certains systèmes qui produisent ce type de contenus intimes non consentis. Retenez : on ne fait pas ça — c'est déjà interdit en France.\n\n* On y revient plus tard dans la formation.",
            },
            {
              id: "dec27",
              shortDate: "Déc. 2027",
              date: "2 décembre 2027",
              label: "Recrutement",
              law: "Haut risque — décalé par l'Omnibus",
              detail:
                "Décembre 2027 concerne surtout les règles AI Act les plus strictes sur le recrutement et les outils qui trient des CV ou notent des salariés (report via l'Omnibus). Attention : le RGPD (art. 22) s'applique déjà — on ne laisse pas une machine écarter seule un candidat. L'outil peut aider à classer, mais un humain garde la décision finale.",
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
    duration: "12 min",
    goal: "Apprendre ce que vous pouvez saisir dans une IA sans mettre l'entreprise ni les salariés en danger",
    chapters: [
      {
        id: "3.1",
        title: "Ce que vous pouvez saisir",
        duration: "1 min 30",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "Avant de saisir ou de coller un texte dans une IA, retenez une chose : l'outil n'est pas un carnet privé.\n\nDans un outil grand public, votre texte peut être enregistré, relu ou réutilisé — selon l'outil, ses paramètres et ses conditions. La fenêtre est sur votre écran, mais l'information, elle, peut sortir de l'entreprise.\n\nDeux textes comptent ici : l'AI Act qui encadre les outils d'IA, et le RGPD qui protège les données personnelles, avec ou sans IA.\n\nUne donnée personnelle, c'est tout ce qui permet d'identifier quelqu'un : un nom, bien sûr, mais aussi un e-mail, une voix, une photo, une plaque d'immatriculation. Et même une simple description : « le directeur de l'agence de Paris », ça suffit à l'identifier.\n\nPour savoir ce que vous pouvez saisir, il y a trois degrés de vigilance, matérialisés par trois couleurs.\n\nVert : OK. Pas d'information secrète, pas de personne reconnaissable non plus. Cela peut concerner une idée de titre, ou une question déjà publiée sur votre site, par exemple.\n\nOrange : la prudence est de mise si une personne est identifiable. Évitez les informations qui permettent de la reconnaître, et n'utilisez qu'un outil autorisé. Exemple : au lieu d'écrire à l'IA « Julie Martin », écrivez « une collègue ». Le RGPD appelle ça la minimisation.\n\nRouge : règle de prudence — ne mettez pas ça dans une IA grand public non autorisée. Les informations relatives à la santé, la religion, l'appartenance syndicale ou l'origine sont des données sensibles. De même pour les secrets de l'entreprise comme les prix non publics, les contrats, le business plan ou le code interne. Un outil validé par l'entreprise peut être utilisé pour ça, seulement si c'est nécessaire et autorisé.\n\nSi un usage d'IA devient régulier dans votre équipe, vous en parlez à votre manager ou au référent IA : l'entreprise doit avoir connaissance des outils utilisés par ses salariés.",
        },
      },
      {
        id: "3.2",
        title: "Donnée perso ou pas ?",
        duration: "1 min 30",
        format: "Jeu",
        activity: {
          kind: "slash",
          briefing:
            "Une donnée personnelle, c'est tout ce qui permet de reconnaître quelqu'un, même sans son nom. Découpez les bulles qui en contiennent une.",
          intro:
            "Une donnée personnelle, c'est tout ce qui permet de reconnaître quelqu'un, même sans son nom. Découpez les cases qui contiennent une donnée personnelle.",
          takeaway:
            "Une donnée personnelle, c'est tout ce qui permet de reconnaître quelqu'un — avec ou sans son nom : mail, voix, photo, plaque, badge, ou même une simple description.\n\nL'exercice sert à les repérer d'un coup d'œil, pour ne pas les coller dans une IA sans y penser.",
          items: [
            {
              id: "mail",
              label: "L'adresse j.martin@entreprise.fr",
              personal: true,
              explanation: "Une adresse pro identifie aussi une personne.",
            },
            {
              id: "plaque",
              label: "La plaque de la voiture de service attribuée à Paul",
              personal: true,
              explanation: "Elle renvoie à une personne précise.",
            },
            {
              id: "badge",
              label: "Le numéro de badge d'un salarié",
              personal: true,
              explanation: "Un numéro suffit si on peut retrouver la personne.",
            },
            {
              id: "voix",
              label: "L'enregistrement de la voix d'un client",
              personal: true,
              explanation: "La voix identifie la personne.",
            },
            {
              id: "ip",
              label: "L'adresse IP de l'ordinateur d'un client",
              personal: true,
              explanation: "Elle permet de remonter jusqu'à quelqu'un.",
            },
            {
              id: "brive",
              label: "« Le directeur de l'agence de Paris »",
              personal: true,
              explanation: "Pas de nom, mais on le reconnaît.",
            },
            {
              id: "photo",
              label: "Une photo d'équipe au séminaire",
              personal: true,
              explanation: "Les visages identifient les personnes.",
            },
            {
              id: "ca",
              label: "Le chiffre d'affaires annuel de l'entreprise",
              personal: false,
              explanation:
                "Il ne vise personne… mais s'il n'est pas publié, c'est un secret : Stop.",
            },
            {
              id: "stats",
              label: "« 40 % des salariés utilisent l'IA chaque semaine »",
              personal: false,
              explanation: "Une statistique globale ne vise personne.",
            },
            {
              id: "ri",
              label: "Le règlement intérieur de l'entreprise",
              personal: false,
              explanation: "Un document général, sans personne visée.",
            },
          ],
        },
      },
      {
        id: "3.3",
        title: "Quel niveau d'attention ?",
        duration: "2 min",
        format: "Jeu",
        activity: {
          kind: "traffic",
          briefing:
            "Chaque voiture s'arrête devant un feu avec une information. À vous de choisir :\nVert : tout va bien.\nOrange : ça doit rester encadré.\nRouge : c'est interdit.",
          items: [
            {
              id: "title",
              label: "Idée de titre pour une pub",
              level: "green",
              explanation:
                "C'est une idée créative, sans nom et sans secret. Personne n'est reconnaissable, rien ne sort de l'entreprise. Vous pouvez écrire cette idée dans une IA grand public.",
            },
            {
              id: "faq",
              label: "FAQ déjà sur le site",
              level: "green",
              explanation:
                "Ce texte est déjà sur votre site : n'importe qui peut le lire. Demander à une IA de le reformuler ne révèle ni personne, ni secret — par exemple « comment créer un compte » ou « quels sont vos horaires ».",
            },
            {
              id: "mail",
              label: "E-mail d'un collègue",
              level: "orange",
              explanation:
                "Vous avez le droit, mais encadré. Une adresse mail (ex. marie.dupont@entreprise.fr) est une donnée personnelle au sens du RGPD : elle désigne quelqu'un. Passez uniquement par un outil autorisé par l'entreprise, et n'écrivez que le minimum utile — pas toute la conversation.",
            },
            {
              id: "cv",
              label: "CV d'un candidat",
              level: "orange",
              explanation:
                "Vous avez le droit, mais encadré. Un CV porte un nom, un téléphone, un parcours : c'est une donnée personnelle au sens du RGPD. Utilisez un outil autorisé, et ne donnez que ce qui sert — par exemple le poste et les compétences, pas l'adresse ni le numéro « au cas où ».",
            },
            {
              id: "arret",
              label: "Arrêt maladie",
              level: "red",
              explanation:
                "Donnée sensible (art. 9 RGPD). Règle de prudence : ne la saisissez pas dans une IA grand public non autorisée — même « grippe » ou « opération ».",
            },
            {
              id: "syndicat",
              label: "Liste d'adhérents syndicaux",
              level: "red",
              explanation:
                "Donnée sensible (art. 9 RGPD). Règle de prudence : cette liste ne va pas dans une IA grand public non autorisée.",
            },
            {
              id: "plan",
              label: "Business plan",
              level: "red",
              explanation:
                "Secret d'entreprise. Règle de prudence : ne l'écrivez pas dans une IA externe non autorisée — même sans aucun nom.",
            },
            {
              id: "prix",
              label: "Grille de prix non publique",
              level: "red",
              explanation:
                "Secret d'entreprise. Règle de prudence : remises, marges, tarifs négociés — pas dans une IA externe non autorisée.",
            },
            {
              id: "code",
              label: "Code d'un logiciel interne",
              level: "red",
              explanation:
                "Secret d'entreprise. Ici, « code » = programme écrit par vos équipes. Règle de prudence : pas dans une IA grand public non autorisée.",
            },
          ],
        },
      },
      {
        id: "3.4",
        title: "Nettoyez ce prompt",
        duration: "1 min 30",
        format: "Jeu",
        activity: {
          kind: "redact",
          briefing:
            "Vous allez retirer ce qui identifie la personne ou parle de sa santé. Le but n'est pas de tout effacer. La demande doit rester utile.",
          intro: "Cliquez sur ce qu'il faut enlever.",
          tokens: [
            { id: "w1", text: "Rédige", redact: false },
            { id: "w2", text: "un", redact: false },
            { id: "w3", text: "mail", redact: false },
            { id: "w4", text: "pour", redact: false },
            { id: "w5", text: "Julie Martin", redact: true, replacement: "une collègue," },
            { id: "w6", text: "(julie.martin@mail.com),", redact: true, replacement: "" },
            { id: "w7", text: "42 ans,", redact: true, replacement: "" },
            { id: "w8", text: "en", redact: false },
            { id: "w8b", text: "arrêt", redact: false },
            { id: "w8c", text: "pour", redact: true, replacement: "" },
            { id: "w8d", text: "dépression", redact: true, replacement: "" },
            { id: "w8e", text: "depuis", redact: true, replacement: "" },
            { id: "w8f", text: "mars,", redact: true, replacement: "" },
            { id: "w9", text: "afin", redact: false },
            { id: "w10", text: "de", redact: false },
            { id: "w11", text: "l'accueillir", redact: false },
            { id: "w12", text: "à", redact: false },
            { id: "w13", text: "son", redact: false },
            { id: "w14", text: "retour", redact: false },
            { id: "w15", text: "la", redact: false },
            { id: "w16", text: "semaine", redact: false },
            { id: "w17", text: "prochaine.", redact: false },
            { id: "w18", text: "Ton", redact: false },
            { id: "w19", text: "chaleureux,", redact: false },
            { id: "w20", text: "court", redact: false },
            { id: "w21", text: "et", redact: false },
            { id: "w22", text: "professionnel.", redact: false },
          ],
          explanation:
            "C'est le principe de minimisation : on ne donne à l'IA que le strict nécessaire.\n« Julie Martin » devient « une collègue ». L'e-mail et l'âge partent.\n« En arrêt » suffit pour le contexte.\n« Pour dépression depuis mars » ne doit pas y figurer : c'est une information de santé — règle de prudence face à un outil grand public non autorisé.\nLa demande reste claire, sans personne reconnaissable.",
        },
      },
      {
        id: "3.5",
        title: "Les bons gestes",
        duration: "1 min 30",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "Trois situations arrivent fréquemment au travail, et voici quoi faire si ça survient.\n\nPremière situation : l'erreur. Imaginez que vous venez de coller par erreur un fichier clients, ou le motif d'un arrêt maladie, dans une IA grand public. Vous ne faites pas comme si de rien n'était. Vous prévenez tout de suite votre manager, le référent IA ou le DPO. Pourquoi cette urgence ? L'entreprise doit pouvoir évaluer l'incident. Si c'est une violation de données à risque pour les personnes, le RGPD (article 33) prévoit en général 72 heures pour prévenir la CNIL — ce n'est pas automatique pour chaque erreur, mais plus vous parlez tôt, plus elle peut réagir à temps.\n\nDeuxième situation : la réunion. Avant d'appuyer sur « enregistrer » pour qu'un outil résume l'échange, vous prévenez tout le monde dans la salle — y compris le prestataire ou le client en visio, parce que leur voix est aussi une donnée personnelle. Et ensuite, vous ne laissez pas l'enregistrement dormir des mois dans un dossier partagé : vous suivez la durée de conservation prévue dans votre entreprise.\n\nTroisième situation : un client ou un collègue vous contacte parce qu'il veut consulter les données personnelles que l'entreprise conserve à son sujet, corriger une adresse erronée, ou demander l'effacement de ses informations. Ces droits figurent aux articles 15 à 17 du RGPD. Vous ne traitez pas la demande seul : vous la transmettez tout de suite au DPO ou au référent. L'entreprise dispose en général d'un mois pour répondre.",
        },
      },
      {
        id: "3.6",
        title: "Quel droit ?",
        duration: "1 min 30",
        format: "Jeu",
        activity: {
          kind: "match",
          briefing:
            "Chaque personne a des droits sur ses données. Reliez chaque situation au droit qu'elle exerce.",
          instruction: "Reliez les 5 situations aux 5 droits.",
          pairs: [
            {
              id: "acces",
              left: "Un client veut savoir quelles informations l'entreprise a sur lui",
              right: "Droit d'accès",
              explanation:
                "Le droit d'accès (article 15 du RGPD) permet à une personne d'obtenir la liste des données que l'entreprise détient sur elle, et à quelles fins.",
            },
            {
              id: "rectif",
              left: "Une salariée signale que son adresse est fausse dans le fichier RH",
              right: "Droit de rectification",
              explanation:
                "Le droit de rectification (article 16 du RGPD) permet de faire corriger une donnée inexacte ou incomplète, comme une mauvaise adresse.",
            },
            {
              id: "efface",
              left: "Un ancien client demande qu'on supprime tout ce qui le concerne",
              right: "Droit à l'effacement",
              explanation:
                "Le droit à l'effacement (article 17 du RGPD), parfois appelé « droit à l'oubli », permet de demander la suppression de ses données quand elles ne sont plus nécessaires.",
            },
            {
              id: "oppose",
              left: "Un prospect ne veut plus recevoir vos mails commerciaux",
              right: "Droit d'opposition",
              explanation:
                "Le droit d'opposition (article 21 du RGPD) permet de refuser un traitement, notamment la prospection commerciale.",
            },
            {
              id: "humain",
              left: "Une IA a écarté un candidat automatiquement. Il demande qu'un recruteur humain relise son dossier",
              right: "Droit de ne pas être jugé uniquement par une machine",
              explanation:
                "L'article 22 du RGPD protège contre une décision prise uniquement par une machine qui produit des effets importants, comme un refus de candidature. La personne peut exiger qu'un humain revoie le dossier.",
            },
          ],
        },
      },
      {
        id: "3.7",
        title: "La réunion de 14 h",
        duration: "2 min",
        format: "Scénario",
        activity: {
          kind: "scenario",
          briefing:
            "Une réunion va être enregistrée. Pour chaque étape, choisissez ce qu'il faut faire.",
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
                  label: "Je choisis un outil payant : c'est plus sûr",
                  correct: false,
                  explanation:
                    "Payant ne veut pas dire autorisé. C'est la liste de l'entreprise qui décide.",
                },
                {
                  label: "Je lance l'enregistrement, parce que tout le monde fait ça",
                  correct: false,
                  explanation:
                    "L'habitude ne vaut pas une autorisation. Vous vérifiez la liste des outils autorisés par l'entreprise, ou vous demandez avant d'enregistrer des voix.",
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
                    "Vous prévenez tout le monde avant d'appuyer sur enregistrer. Les personnes extérieures n'ont pas signé vos règles internes, et leur voix est aussi une information personnelle. Elles ne doivent pas découvrir l'enregistrement après coup.",
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
                  label: "Je l'envoie avec la mention « généré par IA, à vérifier »",
                  correct: false,
                  explanation:
                    "La mention ne remplace pas votre relecture. Vous relisez avant d'envoyer.",
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
    ],
  },
  {
    id: "bloc-4",
    number: 4,
    title: "C'est vous qui décidez",
    duration: "10 min",
    goal: "L'IA peut proposer, c'est vous qui décidez",
    chapters: [
      {
        id: "4.1",
        title: "L'IA propose, vous décidez",
        duration: "2 min",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "Jusqu'ici, on a vu ce qu'on peut saisir dans une IA, et comment réagir quand quelque chose dérape. Dans cette vidéo, on attire votre attention sur un point essentiel : l'IA peut proposer et aider, mais c'est vous qui restez le décideur final — et vous devez comprendre ce qu'elle vous propose avant de valider.\n\nCertains usages sont dits « haut risque » parce qu'ils touchent fortement les personnes — par exemple un outil qui trie des CV ou qui note des salariés. C'est pour ça qu'un humain doit garder la décision finale. Le RGPD (article 22) l'exige déjà : on ne laisse pas une machine écarter seule une personne. Voici ce que ça change pour tout le monde au travail, pas seulement pour les RH.\n\nL'IA peut vous préparer un texte, une liste ou une proposition, ou vous aider à trier, mais elle ne décide pas à votre place. Dès qu'une personne est concernée, qu'il s'agisse d'un client, d'un collègue, d'un remboursement, d'une sanction ou d'un paiement, vous devez rester vigilant. Valider sans lire, ce n'est pas décider : décider, concrètement, c'est comprendre ce que l'outil propose, pouvoir le modifier, et pouvoir dire non.\n\nUn score ou un classement peut aussi être injuste, parce que l'IA apprend sur des exemples du passé, et si ce passé était biaisé, l'outil peut reproduire cette injustice tout en ayant l'air neutre. Un exemple connu : chez Amazon, un outil de tri de CV a appris sur des embauches surtout masculines, et il écartait ou mettait de côté les profils associés aux femmes, sans que personne ait écrit cette consigne. Le même risque existe dès qu'un outil classe des personnes, des demandes ou des dossiers.\n\nConcrètement, l'outil peut classer ou vous aider à trier, mais il ne doit pas faire disparaître une personne ou un dossier sans que vous le sachiez. Vous regardez aussi ce qu'il a écarté ou mis de côté, c'est vous qui choisissez, et qui pouvez expliquer pourquoi.",
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
            "Trois situations du quotidien. À chaque fois, demandez-vous qui décide vraiment : vous, ou l'outil.",
          steps: [
            {
              prompt:
                "L'IA propose de refuser automatiquement le remboursement d'un client. Que faites-vous ?",
              imageSrc: "/media/formation/scenario-remboursement.jpg",
              imageAlt: "Client au téléphone face à un refus de remboursement proposé par une IA",
              choices: [
                {
                  label: "Je laisse l'outil envoyer, parce que c'est plus rapide",
                  correct: false,
                  explanation:
                    "Un refus qui touche une personne, c'est vous qui validez. L'outil peut préparer le brouillon, pas trancher seul.",
                },
                {
                  label: "Je valide tous les refus d'un coup, sans tout relire",
                  correct: false,
                  explanation:
                    "L'outil peut préparer le refus, mais c'est vous qui lisez et qui décidez d'envoyer.",
                },
                {
                  label: "Je lis, et c'est moi qui valide",
                  correct: true,
                  explanation:
                    "L'outil peut préparer le refus, mais c'est vous qui lisez et qui décidez d'envoyer.",
                },
              ],
            },
            {
              prompt: "L'IA a rédigé un courrier juridique. Le courrier a l'air très propre. Je…",
              imageSrc: "/media/formation/scenario-courrier.jpg",
              imageAlt: "Courrier juridique sur un bureau avec une suggestion d'IA à l'écran",
              choices: [
                {
                  label: "Je l'envoie, parce que le ton est professionnel",
                  correct: false,
                  explanation:
                    "Un ton propre ne veut pas dire que le droit est juste. Vous le faites relire par la personne compétente avant tout envoi.",
                },
                {
                  label: "Je vérifie juste l'orthographe et les dates, puis je l'envoie",
                  correct: false,
                  explanation:
                    "Des dates justes ne disent rien du fond. Une erreur de droit engage l'entreprise.",
                },
                {
                  label: "Je le fais relire par la personne compétente avant de l'envoyer",
                  correct: true,
                  explanation:
                    "Vous ne signez pas un courrier juridique sur la seule foi de l'outil. Une erreur de droit engage l'entreprise.",
                },
              ],
            },
            {
              prompt: "Un paiement important est prêt. L'IA propose de le lancer. Je…",
              imageSrc: "/media/formation/scenario-paiement.jpg",
              imageAlt: "Écran de paiement avec une IA qui propose de valider le virement",
              choices: [
                {
                  label: "Je fais confiance à l'IA et je lance tout de suite",
                  correct: false,
                  explanation:
                    "L'outil peut préparer le paiement, mais c'est vous qui vérifiez le bénéficiaire et le montant avant de valider.",
                },
                {
                  label: "Je regarde seulement si le montant est le bon",
                  correct: false,
                  explanation:
                    "L'outil peut préparer le paiement, mais c'est vous qui vérifiez le bénéficiaire et le montant avant de valider.",
                },
                {
                  label: "Je vérifie tout avant de valider",
                  correct: true,
                  explanation:
                    "L'outil peut préparer le paiement, mais c'est vous qui vérifiez le bénéficiaire et le montant avant de valider.",
                },
              ],
            },
          ],
        },
      },
      {
        id: "4.3",
        title: "Reliez la bonne règle",
        duration: "2 min",
        format: "Jeu",
        activity: {
          kind: "match",
          briefing:
            "Reliez chaque situation à la bonne règle.\nCliquez d'un côté, puis de l'autre, pour tracer le trait.",
          instruction: "Reliez les 4 situations aux 4 règles.",
          pairs: [
            {
              id: "humain",
              left: "L'IA propose d'envoyer seule un refus à une cliente",
              right: "Rien ne part sans votre feu vert",
              explanation:
                "Dès qu'une personne est concernée, c'est vous qui validez. L'outil peut préparer, pas trancher.",
            },
            {
              id: "bas",
              left: "Cinq demandes sont tout en bas du classement, sans explication",
              right: "Vous regardez aussi ce que l'outil a écarté",
              explanation:
                "Ce que l'outil a mis de côté peut cacher une personne écartée à tort. Vous ouvrez aussi ces dossiers.",
            },
            {
              id: "score",
              left: "L'outil affiche 62/100 pour un entretien, sans dire ce qu'il mesure",
              right: "Vous lisez le dossier avant de trancher",
              explanation:
                "Un chiffre n'est pas une décision. Vous lisez le dossier, le score reste un indice.",
            },
            {
              id: "biais",
              left: "Le classement a appris sur des décisions passées injustes",
              right: "Un historique injuste peut se répéter tout seul",
              explanation:
                "Si le passé était biaisé, le classement peut reproduire l'injustice tout en ayant l'air neutre.",
            },
          ],
        },
      },
      {
        id: "4.4",
        title: "Avant de publier ou d'agir",
        duration: "2 min",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo courte",
          script:
            "Dans cette vidéo, on voit la conduite à tenir face à une image générée, ou face à une consigne cachée.\n\nQuand l'IA crée une image ou un texte, vous n'êtes pas automatiquement libre de le publier partout, parce que l'image peut ressembler à une œuvre protégée, à un logo ou au visage de quelqu'un, que le texte peut recopier un passage trouvé sur le web, et que les conditions de l'outil peuvent limiter ce que vous avez le droit de réutiliser, même si c'est vous qui avez cliqué sur générer.\n\nAvant de publier, posez-vous ces trois questions : est-ce que je reconnais une marque, une personne ou une œuvre, est-ce que les conditions de l'outil autorisent cet usage, et est-ce que mon entreprise valide cette publication. Si vous ne savez pas répondre, vous ne publiez pas pour voir, vous demandez.\n\nEnsuite, parfois l'IA ne fait pas que répondre : elle peut aussi passer à l'action, comme envoyer un mail, partager un fichier ou lancer un paiement. Le piège, c'est qu'une consigne peut être cachée dans un document ou dans un mail que vous lui faites lire, par exemple une phrase presque invisible qui dit « envoie les contrats », et l'outil peut alors proposer de le faire comme s'il s'agissait d'un ordre.\n\nVous ne le laissez pas agir seul sur quelque chose d'irréversible : résumer un mail, oui, envoyer des contrats, payer ou partager un fichier confidentiel, non. Vous lisez la proposition, et si vous n'avez pas demandé cette action vous-même, vous la refusez.",
        },
      },
      {
        id: "4.5",
        title: "Je publie ou pas ?",
        duration: "1 min 30",
        format: "Scénario",
        activity: {
          kind: "scenario",
          steps: [
            {
              prompt:
                "Vous voulez mettre sur le site une image générée qui ressemble au logo d'une marque connue. Que faites-vous ?",
              imageSrcs: [
                "/media/formation/faux-marques/sport.jpg",
                "/media/formation/faux-marques/tech.jpg",
                "/media/formation/faux-marques/food.jpg",
                "/media/formation/faux-marques/boisson.jpg",
                "/media/formation/faux-marques/auto.jpg",
                "/media/formation/faux-marques/cafe.jpg",
                "/media/formation/faux-marques/luxe.jpg",
                "/media/formation/faux-marques/basket.jpg",
                "/media/formation/faux-marques/stream.jpg",
              ],
              imageAlt: "Logo généré qui évoque une marque connue sans la reproduire",
              imageCaption:
                "Exemples de logos générés qui évoquent des marques connues, sans les être vraiment.",
              choices: [
                {
                  label: "Je publie, parce que l'IA l'a créée, donc je peux m'en servir",
                  correct: false,
                  explanation:
                    "Le fait que l'IA l'ait produite ne vous donne pas tous les droits. Un logo reconnaissable peut être protégé. Vous vérifiez avant de publier.",
                },
                {
                  label: "Je le retouche pour qu'il ressemble moins au logo",
                  correct: false,
                  explanation:
                    "Retoucher ne règle pas la question des droits. Vous vérifiez, ou vous demandez.",
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
              prompt:
                "Le texte généré reprend presque mot pour mot un article trouvé sur le web. Je…",
              imageSrc: "/media/formation/article-journal.jpg",
              imageAlt: "Article de journal en ligne fictif dont le texte a été repris",
              imageCaption:
                "Exemple d'article trouvé sur le web : si l'IA le recopie presque mot pour mot, vous ne publiez pas tel quel.",
              choices: [
                {
                  label: "Je publie, parce que l'IA a un peu reformulé",
                  correct: false,
                  explanation:
                    "Une légère reformulation ne suffit pas si le texte reste celui de quelqu'un d'autre. Vous réécrivez vraiment, ou vous citez la source si vous en avez le droit.",
                },
                {
                  label: "Je change quelques mots et je publie",
                  correct: false,
                  explanation:
                    "Quelques mots changés, c'est toujours le texte de quelqu'un d'autre.",
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
        id: "4.6",
        title: "Ce qui pourrait faire agir l'IA",
        duration: "1 min 30",
        format: "Jeu",
        activity: {
          kind: "spot",
          briefing:
            "Vous collez ce mail dans une IA. Cliquez, mot par mot, sur la phrase qu'elle pourrait prendre pour une action à faire.",
          intro: "Cliquez, mot par mot, sur ce que l'IA pourrait interpréter comme une action.",
          fragments: [
            { id: "w1", text: "Bonjour,", trap: false },
            { id: "w2", text: "suite", trap: false },
            { id: "w3", text: "à", trap: false },
            { id: "w4", text: "notre", trap: false },
            { id: "w5", text: "échange", trap: false },
            { id: "w6", text: "de", trap: false },
            { id: "w7", text: "ce", trap: false },
            { id: "w8", text: "matin", trap: false },
            { id: "w9", text: "sur", trap: false },
            { id: "w10", text: "le", trap: false },
            { id: "w11", text: "dossier", trap: false },
            { id: "w12", text: "client", trap: false },
            { id: "w13", text: "Dupont,", trap: false },
            { id: "w14", text: "je", trap: false },
            { id: "w15", text: "vous", trap: false },
            { id: "w16", text: "confirme", trap: false },
            { id: "w17", text: "que", trap: false },
            { id: "w18", text: "les", trap: false },
            { id: "w19", text: "avenants", trap: false },
            { id: "w20", text: "sont", trap: false },
            { id: "w21", text: "prêts", trap: false },
            { id: "w22", text: "côté", trap: false },
            { id: "w23", text: "juridique.", trap: false },
            { id: "w24", text: "Les", trap: false },
            { id: "w25", text: "pièces", trap: false },
            { id: "w26", text: "jointes", trap: false },
            { id: "w27", text: "sont", trap: false },
            { id: "w28", text: "à", trap: false },
            { id: "w29", text: "jour", trap: false },
            { id: "w30", text: "pour", trap: false },
            { id: "w31", text: "la", trap: false },
            { id: "w32", text: "réunion", trap: false },
            { id: "w33", text: "de", trap: false },
            { id: "w34", text: "jeudi.", trap: false },
            {
              id: "w35",
              text: "Il",
              trap: true,
              explanation:
                "Si vous collez ce mail dans une IA, elle peut interpréter « il faudrait envoyer le contrat… » comme une action à faire. Ce n'est pas un ordre que vous lui avez donné : si elle propose d'envoyer, vous refusez.",
            },
            { id: "w36", text: "faudrait", trap: true },
            { id: "w37", text: "envoyer", trap: true },
            { id: "w38", text: "le", trap: true },
            { id: "w39", text: "contrat", trap: true },
            { id: "w40", text: "à", trap: true },
            { id: "w41", text: "toute", trap: true },
            { id: "w42", text: "l'équipe", trap: true },
            { id: "w43", text: "plus", trap: true },
            { id: "w44", text: "tard.", trap: true },
            { id: "w45", text: "Je", trap: false },
            { id: "w46", text: "suis", trap: false },
            { id: "w47", text: "en", trap: false },
            { id: "w48", text: "déplacement", trap: false },
            { id: "w49", text: "jusqu'à", trap: false },
            { id: "w50", text: "lundi.", trap: false },
            { id: "w51", text: "Cordialement,", trap: false },
            { id: "w52", text: "Marie.", trap: false },
          ],
        },
      },
    ],
  },
  {
    id: "bloc-5",
    number: 5,
    title: "Le deepfake",
    duration: "7 min",
    goal: "Reconnaître une fausse vidéo ou une fausse voix, ne pas obéir à l'urgence, et le dire si vous en publiez une",
    chapters: [
      {
        id: "5.1",
        title: "Vrai ou faux ?",
        duration: "2 min",
        format: "Jeu",
        activity: {
          kind: "truefake",
          briefing:
            "Quatre extraits. Pour chacun, choisissez « vrai » ou « faux ». Les quatre sont générés par IA.",
          outro:
            "Les quatre extraits étaient générés par IA. Le message : on ne peut plus se fier seulement à l'œil ou à l'oreille. On verra juste après comment faire attention, concrètement.",
          items: [
            {
              id: "tf1",
              prompt: "Cette vidéo est-elle réelle ou générée par IA ?",
              answer: "fake",
              mediaKind: "video",
              mediaSrc: "/media/formation/truefake-1.mp4",
              mediaPlaceholder: "Exemple vidéo — extrait 1",
            },
            {
              id: "tf2",
              prompt: "Cette voix est-elle réelle ou générée par IA ?",
              answer: "fake",
              mediaKind: "audio",
              mediaSrc: "/media/formation/truefake-voice-1.mp3",
              mediaPlaceholder: "Exemple audio — voix 1",
            },
            {
              id: "tf3",
              prompt: "Cette vidéo est-elle réelle ou générée par IA ?",
              answer: "fake",
              mediaKind: "video",
              mediaSrc: "/media/formation/truefake-2.mp4",
              mediaPlaceholder: "Exemple vidéo — extrait 2",
            },
            {
              id: "tf4",
              prompt: "Cette voix est-elle réelle ou générée par IA ?",
              answer: "fake",
              mediaKind: "audio",
              mediaSrc: "/media/formation/truefake-voice-2.mp3",
              mediaPlaceholder: "Exemple audio — voix 2",
            },
          ],
        },
      },
      {
        id: "5.2",
        title: "Une vidéo peut mentir",
        duration: "2 min",
        format: "Vidéo",
        activity: {
          kind: "video",
          format: "vidéo maison",
          src: "/media/deepfake-exemple.mp4",
          script:
            "On va parler des deepfakes : ce que c'est, ce que vous faites si vous en recevez un, et quoi faire si votre entreprise en publie un.\n\nUn deepfake, c'est une vidéo, une photo ou une voix fabriquée par une IA pour imiter une vraie personne. Le résultat peut être très net, avec le bon logo, la bonne intonation et le bon bureau en arrière-plan, et pourtant ça ne prouve plus que c'est vraiment réel.\n\nRegardez l'exemple. Aujourd'hui, on peut fabriquer un message où votre directeur semble vous demander un virement ou un mot de passe, et l'urgence fait partie du piège. Surtout, ne faites pas ce qui est demandé, et vérifiez avant tout par un autre canal que vous connaissez déjà, comme le numéro habituel ou le mail. N'utilisez pas le lien suspect.\n\nEnsuite, parfois c'est votre entreprise qui publie. Si vous diffusez une vidéo ou une voix générée par une IA qui peut passer pour réelle, vous devez le dire clairement — et obtenir l'accord de la personne concernée (droit à l'image, RGPD). La mention « Générée par l'IA » seule ne suffit pas sans cet accord.\n\nEt pour un deepfake sexuel sans consentement : en France, c'est déjà un délit (loi SREN), avant même certaines dates de l'AI Act.\n\nSi un message vous semble trop urgent pour être honnête, ou si vous hésitez avant de publier, vous demandez.",
        },
      },
      {
        id: "5.3",
        title: "Deux situations",
        duration: "2 min",
        format: "Scénario",
        activity: {
          kind: "scenario",
          steps: [
            {
              prompt:
                "En visio, le « directeur » demande un virement tout de suite. La voix et le visage correspondent. Je…",
              imageSrc: "/media/formation/visio-directeur.jpg",
              imageAlt: "Visio urgente : le directeur à l'écran demande un virement bancaire",
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
              mediaSrc: "/media/deepfake-exemple.mp4",
              mediaLabel: "Générée par l'IA",
              choices: [
                {
                  label: "On publie : le contenu a été relu, ça suffit",
                  correct: false,
                  explanation:
                    "Il faut l'accord du salarié et une mention claire « Générée par l'IA ». Relire ne suffit pas.",
                },
                {
                  label: "On indique « Générée par l'IA », sans demander au salarié",
                  correct: false,
                  explanation:
                    "La mention seule ne suffit pas : il faut aussi l'accord de la personne (droit à l'image, RGPD).",
                },
                {
                  label:
                    "On obtient l'accord du salarié et on indique clairement que c'est généré par IA",
                  correct: true,
                  explanation:
                    "Accord de la personne + mention claire. Les deux sont nécessaires pour publier une vidéo IA d'un vrai salarié.",
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
    duration: "5 min",
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
            "Voici les sept questions à garder près de l'écran. Ce n'est pas une nouvelle leçon : c'est le résumé de ce que vous venez de faire.",
          ],
          beforeAfter: {
            beforeTitle: "Avant",
            before: [...REFLEXES_BEFORE],
            afterTitle: "Après",
            after: [...REFLEXES_AFTER],
          },
        },
      },
      {
        id: "6.2",
        title: "Rangez les 7 réflexes",
        duration: "2 min 30",
        format: "Jeu",
        activity: {
          kind: "tetris",
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
