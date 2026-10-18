/** Activités du socle — structure pédagogique V1.0. Seul le QCM final est noté. */

export type ActivityChoice = {
  label: string;
  correct: boolean;
  explanation: string;
};

/** Consigne lue avant de pouvoir cliquer. Le jeu n'apparaît qu'après. */
type Brief = { briefing?: string };

export type Activity =
  | {
      kind: "text";
      paragraphs: string[];
      points?: string[];
      /** Encadrés Avant / Après (ex. 7 réflexes) — évite de répéter les questions dans le texte */
      beforeAfter?: {
        beforeTitle: string;
        before: string[];
        afterTitle: string;
        after: string[];
      };
    }
  | { kind: "video"; format: string; script: string; src?: string }
  | ({ kind: "quiz"; questions: { prompt: string; choices: ActivityChoice[] }[] } & Brief)
  | {
      kind: "sort";
      briefing?: string;
      instruction: string;
      /** Conservé pour compatibilité ; les jeux de tri sont toujours colorés. */
      colorful?: boolean;
      bins: { id: string; label: string }[];
      cards: { id: string; label: string; binId: string; explanation: string }[];
    }
  | {
      /** Bulles flottantes : on découpe (souris / doigt) celles qui sont une donnée perso. */
      kind: "slash";
      briefing?: string;
      intro: string;
      /** Deux phrases centrées après le jeu (but de l'exercice). */
      takeaway: string;
      items: { id: string; label: string; personal: boolean; explanation: string }[];
    }
  | {
      kind: "stamp";
      briefing?: string;
      stamps: { id: string; label: string; hint: string }[];
      cards: { id: string; label: string; stampId: string; explanation: string }[];
    }
  | {
      /** Une carte au centre : on la balance à gauche ou à droite. */
      kind: "swipe";
      briefing?: string;
      left: { id: string; label: string };
      right: { id: string; label: string };
      cards: { id: string; label: string; zoneId: string; explanation: string }[];
    }
  | {
      kind: "match";
      briefing?: string;
      instruction?: string;
      /** Gauche = situations, droite = réponses à relier */
      pairs: { id: string; left: string; right: string; explanation: string }[];
    }
  | {
      kind: "scenario";
      briefing?: string;
      steps: {
        prompt: string;
        choices: ActivityChoice[];
        mediaSrc?: string;
        /** Bandeau visible sur la vidéo (ex. « Générée par l'IA ») */
        mediaLabel?: string;
        imageSrc?: string;
        imageSrcs?: string[];
        imageAlt?: string;
        imageCaption?: string;
      }[];
    }
  | {
      /** Vrai / faux : révèle la bonne réponse (réel ou généré par IA). */
      kind: "truefake";
      briefing?: string;
      outro: string;
      items: {
        id: string;
        prompt: string;
        /** Bonne réponse */
        answer: "real" | "fake";
        /** video (défaut) ou audio */
        mediaKind?: "video" | "audio";
        /** Média à brancher plus tard */
        mediaSrc?: string;
        /** Texte dans l'encadré vide tant qu'il n'y a pas de média */
        mediaPlaceholder: string;
      }[];
    }
  | { kind: "checklist"; intro: string; items: string[]; centered?: boolean }
  | {
      kind: "tetris";
      briefing?: string;
      intro: string;
      /** Gros blocs qui tombent — en pratique les 7 réflexes */
      blocks: { id: string; label: string }[];
    }
  | {
      kind: "dodge";
      intro: string;
      /** Cubes qui tombent. good = à attraper, sinon à esquiver. */
      hazards: { id: string; label: string; good?: boolean }[];
      goal: number;
    }
  | {
      kind: "predict";
      briefing?: string;
      /** Consigne commune (sinon hint par round). */
      hint?: string;
      rounds: {
        lead: string;
        hint?: string;
        options: { label: string; percent: number }[];
        message: string;
      }[];
    }
  | {
      kind: "spot";
      briefing?: string;
      intro: string;
      fragments: {
        id: string;
        text: string;
        trap: boolean;
        /** Ordre presque invisible (encre pâle), à repérer. */
        veiled?: boolean;
        explanation?: string;
      }[];
    }
  | {
      kind: "redact";
      briefing?: string;
      intro: string;
      /** replacement : texte affiché à la place quand on retire le mot. Chaîne vide = on l'enlève. */
      tokens: { id: string; text: string; redact: boolean; replacement?: string }[];
      explanation: string;
    }
  | {
      kind: "traffic";
      briefing?: string;
      items: { id: string; label: string; level: "green" | "orange" | "red"; explanation: string }[];
    }
  | {
      kind: "timeline";
      briefing?: string;
      items: {
        id: string;
        /** Date courte sur le cube */
        shortDate: string;
        /** Date complète dans le panneau */
        date: string;
        label: string;
        law: string;
        detail: string;
      }[];
    }
  | { kind: "fiche"; intro: string; items: string[] };

export type Chapter = {
  id: string;
  title: string;
  duration: string;
  format: string;
  activity: Activity;
};

export type Block = {
  id: string;
  number: number;
  title: string;
  duration: string;
  goal: string;
  chapters: Chapter[];
};
