/** Activités du socle — structure pédagogique V2.8. Seul le QCM final est noté. */

export type ActivityChoice = {
  label: string;
  correct: boolean;
  explanation: string;
};

export type Activity =
  | { kind: "text"; paragraphs: string[]; points?: string[] }
  | { kind: "video"; format: string; script: string }
  | { kind: "quiz"; questions: { prompt: string; choices: ActivityChoice[] }[] }
  | {
      kind: "sort";
      instruction: string;
      /** Conservé pour compatibilité ; les jeux de tri sont toujours colorés. */
      colorful?: boolean;
      bins: { id: string; label: string }[];
      cards: { id: string; label: string; binId: string; explanation: string }[];
    }
  | {
      kind: "stamp";
      stamps: { id: string; label: string; hint: string }[];
      cards: { id: string; label: string; stampId: string; explanation: string }[];
    }
  | { kind: "scenario"; steps: { prompt: string; choices: ActivityChoice[] }[] }
  | { kind: "checklist"; intro: string; items: string[]; centered?: boolean }
  | {
      kind: "tetris";
      intro: string;
      /** Gros blocs qui tombent — en pratique les 7 réflexes */
      blocks: { id: string; label: string }[];
    }
  | {
      kind: "predict";
      lead: string;
      hint: string;
      options: { label: string; percent: number }[];
      message: string;
    }
  | {
      kind: "spot";
      intro: string;
      fragments: { id: string; text: string; trap: boolean; explanation?: string }[];
    }
  | {
      kind: "redact";
      intro: string;
      tokens: { id: string; text: string; redact: boolean }[];
      explanation: string;
    }
  | {
      kind: "traffic";
      items: { id: string; label: string; level: "green" | "orange" | "red"; explanation: string }[];
    }
  | {
      kind: "timeline";
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
