/**
 * Exporte tout le contenu pédagogique utilisateur (socle + fiches métiers + QCM)
 * vers docs/parcours-utilisateurs-contenu.json — source de vérité pour le PDF de revue.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  AI_ACT_MILESTONES,
  ATTESTATION_COURSE_TITLE,
  BLOCKS,
  FORMATION_PROMISE,
  REFLEXES_AFTER,
  REFLEXES_BEFORE,
  SOCLE_DURATION_LABEL,
} from "../lib/formation/curriculum";
import { CAREER_PATHS } from "../lib/formation/careers";
import {
  POSITIONING_MAX,
  POSITIONING_MIN,
  QUIZ_DRAW_SIZE,
  QUIZ_PASS_COUNT,
  QUIZ_PASS_PERCENT,
  QUIZ_TIMER_SECONDS,
  SOCLE_QUESTION_BANK,
} from "../lib/formation/evaluation";
import { ASSISTANCE } from "../lib/formation/assistance";
import { PROGRAMME } from "../lib/formation/programme";
import type { Activity } from "../lib/formation/activity";

function flattenActivity(activity: Activity): Record<string, unknown> {
  switch (activity.kind) {
    case "text":
      return {
        kind: "text",
        paragraphs: activity.paragraphs,
        points: activity.points ?? [],
        beforeAfter: activity.beforeAfter ?? null,
      };
    case "video":
      return {
        kind: "video",
        format: activity.format,
        src: activity.src ?? null,
        mediaLabel: activity.mediaLabel ?? null,
        noteAfter: activity.noteAfter ?? null,
        script: activity.script,
      };
    case "quiz":
      return {
        kind: "quiz",
        briefing: activity.briefing ?? null,
        questions: activity.questions.map((q) => ({
          prompt: q.prompt,
          choices: q.choices.map((c) => ({
            label: c.label,
            correct: c.correct,
            explanation: c.explanation,
          })),
        })),
      };
    case "sort":
      return {
        kind: "sort",
        briefing: activity.briefing ?? null,
        instruction: activity.instruction,
        layout: activity.layout ?? "tubes",
        bins: activity.bins,
        cards: activity.cards,
      };
    case "slash":
      return {
        kind: "slash",
        briefing: activity.briefing ?? null,
        intro: activity.intro,
        takeaway: activity.takeaway,
        items: activity.items,
      };
    case "stamp":
      return {
        kind: "stamp",
        briefing: activity.briefing ?? null,
        stamps: activity.stamps,
        cards: activity.cards,
      };
    case "swipe":
      return {
        kind: "swipe",
        briefing: activity.briefing ?? null,
        left: activity.left,
        right: activity.right,
        cards: activity.cards,
      };
    case "match":
      return {
        kind: "match",
        briefing: activity.briefing ?? null,
        instruction: activity.instruction ?? null,
        pairs: activity.pairs,
      };
    case "scenario":
      return {
        kind: "scenario",
        briefing: activity.briefing ?? null,
        steps: activity.steps.map((s) => ({
          prompt: s.prompt,
          mediaLabel: s.mediaLabel ?? null,
          choices: s.choices.map((c) => ({
            label: c.label,
            correct: c.correct,
            explanation: c.explanation,
          })),
        })),
      };
    case "truefake":
      return {
        kind: "truefake",
        briefing: activity.briefing ?? null,
        outro: activity.outro,
        items: activity.items.map((i) => ({
          id: i.id,
          prompt: i.prompt,
          answer: i.answer,
          mediaKind: i.mediaKind ?? "video",
          mediaPlaceholder: i.mediaPlaceholder,
        })),
      };
    case "checklist":
      return {
        kind: "checklist",
        intro: activity.intro,
        items: activity.items,
      };
    case "tetris":
      return {
        kind: "tetris",
        briefing: activity.briefing ?? null,
        intro: activity.intro,
        blocks: activity.blocks,
      };
    case "dodge":
      return {
        kind: "dodge",
        intro: activity.intro,
        hazards: activity.hazards,
        goal: activity.goal,
      };
    case "predict":
      return {
        kind: "predict",
        briefing: activity.briefing ?? null,
        hint: activity.hint ?? null,
        rounds: activity.rounds,
      };
    case "spot":
      return {
        kind: "spot",
        briefing: activity.briefing ?? null,
        intro: activity.intro,
        fragments: activity.fragments,
      };
    case "redact":
      return {
        kind: "redact",
        briefing: activity.briefing ?? null,
        intro: activity.intro,
        tokens: activity.tokens,
        explanation: activity.explanation,
      };
    case "label":
      return {
        kind: "label",
        briefing: activity.briefing ?? null,
        instruction: activity.instruction,
        sticker: activity.sticker,
        items: activity.items.map((i) => ({
          id: i.id,
          caption: i.caption,
          needsLabel: i.needsLabel,
          explanation: i.explanation,
        })),
      };
    case "send":
      return {
        kind: "send",
        briefing: activity.briefing ?? null,
        instruction: activity.instruction,
        items: activity.items,
      };
    case "traffic":
      return {
        kind: "traffic",
        briefing: activity.briefing ?? null,
        items: activity.items,
      };
    case "timeline":
      return {
        kind: "timeline",
        briefing: activity.briefing ?? null,
        items: activity.items,
      };
    case "fiche":
      return {
        kind: "fiche",
        intro: activity.intro,
        items: activity.items,
      };
    default: {
      const _exhaustive: never = activity;
      return { kind: "unknown", raw: _exhaustive };
    }
  }
}

const payload = {
  meta: {
    title: "LockinIA — Parcours utilisateurs (contenu intégral)",
    purpose:
      "Document de revue pour juriste et formateur. Contient l'intégralité du contenu pédagogique proposé aux apprenants (socle, fiches métiers, banque QCM). Non destiné aux apprenants.",
    courseTitle: ATTESTATION_COURSE_TITLE,
    promise: FORMATION_PROMISE,
    duration: SOCLE_DURATION_LABEL,
    generatedAt: new Date().toISOString(),
    source: "lib/formation/* (export automatique)",
  },
  programme: PROGRAMME,
  assistance: ASSISTANCE,
  evaluationRules: {
    quizDrawSize: QUIZ_DRAW_SIZE,
    passPercent: QUIZ_PASS_PERCENT,
    passCount: QUIZ_PASS_COUNT,
    timerSeconds: QUIZ_TIMER_SECONDS,
    positioningMin: POSITIONING_MIN,
    positioningMax: POSITIONING_MAX,
    bankSize: SOCLE_QUESTION_BANK.length,
  },
  reflexes: {
    before: [...REFLEXES_BEFORE],
    after: [...REFLEXES_AFTER],
  },
  milestones: AI_ACT_MILESTONES,
  blocks: BLOCKS.map((block) => ({
    id: block.id,
    number: block.number,
    title: block.title,
    duration: block.duration,
    goal: block.goal,
    chapters: block.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      subtitle: chapter.subtitle ?? null,
      duration: chapter.duration,
      format: chapter.format,
      activity: flattenActivity(chapter.activity),
    })),
  })),
  careers: CAREER_PATHS,
  questionBank: SOCLE_QUESTION_BANK,
};

const out = resolve(process.cwd(), "docs/parcours-utilisateurs-contenu.json");
writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");
console.log(
  `OK → ${out} (${BLOCKS.length} blocs, ${CAREER_PATHS.length} métiers, ${SOCLE_QUESTION_BANK.length} QCM)`,
);
