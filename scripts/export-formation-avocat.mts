/**
 * Exporte le contenu pédagogique LockinIA en JSON pour génération PDF avocat.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  BLOCKS,
  REFLEXES_BEFORE,
  REFLEXES_AFTER,
  SEVEN_REFLEXES,
} from "../lib/formation/socle.ts";
import {
  FORMATION_PROMISE,
  ATTESTATION_COURSE_TITLE,
  SOCLE_DURATION_LABEL,
  AI_ACT_MILESTONES,
} from "../lib/formation/curriculum.ts";
import {
  POSITIONING_BANK,
  SOCLE_QUESTION_BANK,
  QUIZ_PASS_PERCENT,
  QUIZ_PASS_COUNT,
  QUIZ_DRAW_SIZE,
  QUIZ_TIMER_SECONDS,
} from "../lib/formation/evaluation.ts";
import { LEXICON } from "../lib/formation/lexicon.ts";
import { CAREER_PATHS } from "../lib/formation/careers.ts";
import { PROGRAMME } from "../lib/formation/programme.ts";
import { ASSISTANCE } from "../lib/formation/assistance.ts";
import { CURRICULUM_VERSION } from "../lib/formation/proof.ts";
import type { Activity } from "../lib/formation/activity.ts";
import { defaultCompanyModuleMinimum } from "../lib/admin/types.ts";

function activityText(activity: Activity): string[] {
  const lines: string[] = [];
  const push = (s: string) => {
    const t = s.trim();
    if (t) lines.push(t);
  };

  switch (activity.kind) {
    case "video":
      push(`Format : ${activity.format}`);
      push(activity.script);
      break;
    case "text":
      for (const p of activity.paragraphs) push(p);
      if (activity.points) for (const p of activity.points) push(`• ${p}`);
      if (activity.beforeAfter) {
        push(activity.beforeAfter.beforeTitle);
        for (const x of activity.beforeAfter.before) push(`• ${x}`);
        push(activity.beforeAfter.afterTitle);
        for (const x of activity.beforeAfter.after) push(`• ${x}`);
      }
      break;
    case "quiz":
      if (activity.briefing) push(activity.briefing);
      activity.questions.forEach((q, i) => {
        push(`Q${i + 1}. ${q.prompt}`);
        for (const c of q.choices) {
          push(`${c.correct ? "✓" : "○"} ${c.label}`);
          if (c.explanation) push(`  → ${c.explanation}`);
        }
      });
      break;
    case "sort":
      if (activity.briefing) push(activity.briefing);
      push(activity.instruction);
      push(`Familles : ${activity.bins.map((b) => b.label).join(" / ")}`);
      for (const card of activity.cards) {
        const bin = activity.bins.find((b) => b.id === card.binId)?.label ?? card.binId;
        push(`• ${card.label} → ${bin}`);
        if (card.explanation) push(`  ${card.explanation}`);
      }
      break;
    case "slash":
      if (activity.briefing) push(activity.briefing);
      push(activity.intro);
      for (const item of activity.items) {
        push(
          `• ${item.label} — ${item.personal ? "donnée personnelle" : "pas une donnée personnelle"}`,
        );
        if (item.explanation) push(`  ${item.explanation}`);
      }
      push(activity.takeaway);
      break;
    case "stamp":
      if (activity.briefing) push(activity.briefing);
      push(`Tampons : ${activity.stamps.map((s) => `${s.label} (${s.hint})`).join(" · ")}`);
      for (const card of activity.cards) {
        const stamp =
          activity.stamps.find((s) => s.id === card.stampId)?.label ?? card.stampId;
        push(`• ${card.label} → ${stamp}`);
        if (card.explanation) push(`  ${card.explanation}`);
      }
      break;
    case "swipe":
      if (activity.briefing) push(activity.briefing);
      push(`Gauche : ${activity.left.label} · Droite : ${activity.right.label}`);
      for (const card of activity.cards) {
        const zone =
          card.zoneId === activity.left.id
            ? activity.left.label
            : card.zoneId === activity.right.id
              ? activity.right.label
              : card.zoneId;
        push(`• ${card.label} → ${zone}`);
        if (card.explanation) push(`  ${card.explanation}`);
      }
      break;
    case "match":
      if (activity.briefing) push(activity.briefing);
      if (activity.instruction) push(activity.instruction);
      for (const p of activity.pairs) {
        push(`• ${p.left} ↔ ${p.right}`);
        if (p.explanation) push(`  ${p.explanation}`);
      }
      break;
    case "scenario":
      if (activity.briefing) push(activity.briefing);
      activity.steps.forEach((step, i) => {
        push(`Étape ${i + 1} — ${step.prompt}`);
        for (const c of step.choices) {
          push(`${c.correct ? "✓" : "○"} ${c.label}`);
          if (c.explanation) push(`  → ${c.explanation}`);
        }
      });
      break;
    case "truefake":
      if (activity.briefing) push(activity.briefing);
      for (const item of activity.items) {
        push(
          `• ${item.prompt} — réponse : ${item.answer === "fake" ? "généré par IA" : "réel"}`,
        );
        if (item.mediaPlaceholder) push(`  (${item.mediaPlaceholder})`);
      }
      push(activity.outro);
      break;
    case "checklist":
      push(activity.intro);
      for (const item of activity.items) push(`• ${item}`);
      break;
    case "tetris":
      if (activity.briefing) push(activity.briefing);
      push(activity.intro);
      for (const b of activity.blocks) push(`• ${b.label}`);
      break;
    case "dodge":
      push(activity.intro);
      for (const h of activity.hazards) {
        push(`• ${h.label}${h.good ? " (à attraper)" : " (à esquiver)"}`);
      }
      push(`Objectif : ${activity.goal}`);
      break;
    case "predict":
      if (activity.briefing) push(activity.briefing);
      if (activity.hint) push(activity.hint);
      activity.rounds.forEach((r, i) => {
        push(`Round ${i + 1} — ${r.lead}`);
        if (r.hint) push(r.hint);
        for (const o of r.options) push(`• ${o.label} (${o.percent} %)`);
        push(r.message);
      });
      break;
    case "spot":
      if (activity.briefing) push(activity.briefing);
      push(activity.intro);
      for (const f of activity.fragments) {
        push(`• ${f.text}${f.trap ? " [piège]" : ""}${f.veiled ? " [voilé]" : ""}`);
        if (f.explanation) push(`  ${f.explanation}`);
      }
      break;
    case "redact":
      if (activity.briefing) push(activity.briefing);
      push(activity.intro);
      push(
        `Texte : ${activity.tokens.map((t) => (t.redact ? `[${t.text}]` : t.text)).join(" ")}`,
      );
      push(
        `À retirer : ${activity.tokens
          .filter((t) => t.redact)
          .map((t) => t.text)
          .join(", ")}`,
      );
      push(activity.explanation);
      break;
    case "traffic":
      if (activity.briefing) push(activity.briefing);
      for (const item of activity.items) {
        const level =
          item.level === "green" ? "Vert" : item.level === "orange" ? "Orange" : "Rouge";
        push(`• [${level}] ${item.label}`);
        if (item.explanation) push(`  ${item.explanation}`);
      }
      break;
    case "timeline":
      if (activity.briefing) push(activity.briefing);
      for (const item of activity.items) {
        push(`• ${item.date} — ${item.label} (${item.law})`);
        push(`  ${item.detail}`);
      }
      break;
    case "fiche":
      push(activity.intro);
      for (const item of activity.items) push(`• ${item}`);
      break;
    default:
      push(`[Activité ${(activity as { kind: string }).kind}]`);
  }
  return lines;
}

const payload = {
  meta: {
    title: "LockinIA — Contenu textuel de la formation (dossier avocat)",
    version: CURRICULUM_VERSION,
    duration: SOCLE_DURATION_LABEL,
    courseTitle: ATTESTATION_COURSE_TITLE,
    promise: FORMATION_PROMISE,
    generatedAt: new Date().toISOString(),
    purpose:
      "Document de revue juridique du contenu pédagogique et du traitement des données. Non destiné aux apprenants.",
  },
  reflexes: {
    before: [...REFLEXES_BEFORE],
    after: [...REFLEXES_AFTER],
    all: [...SEVEN_REFLEXES],
  },
  milestones: AI_ACT_MILESTONES,
  assistance: ASSISTANCE,
  programme: PROGRAMME,
  positioning: POSITIONING_BANK.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    choices: q.choices.map((label, i) => ({
      label,
      correct: i === q.correctIndex,
    })),
    explanation: q.explanation,
    explanations: q.explanations ?? null,
  })),
  exam: {
    drawSize: QUIZ_DRAW_SIZE,
    passPercent: QUIZ_PASS_PERCENT,
    passCount: QUIZ_PASS_COUNT,
    timerSeconds: QUIZ_TIMER_SECONDS,
    bank: SOCLE_QUESTION_BANK.map((q) => ({
      id: q.id,
      blockId: q.blockId,
      theme: q.theme ?? null,
      prompt: q.prompt,
      choices: q.choices.map((label, i) => ({
        label,
        correct: i === q.correctIndex,
      })),
      explanation: q.explanation,
    })),
  },
  lexicon: LEXICON,
  companyModuleDefault: defaultCompanyModuleMinimum(),
  blocks: BLOCKS.map((block) => ({
    id: block.id,
    number: block.number,
    title: block.title,
    duration: block.duration,
    goal: block.goal,
    chapters: block.chapters.map((ch) => ({
      id: ch.id,
      title: ch.title,
      duration: ch.duration,
      format: ch.format,
      kind: ch.activity.kind,
      text: activityText(ch.activity),
    })),
  })),
  careers: CAREER_PATHS.map((c) => ({
    id: c.id,
    title: c.title,
    duration: c.duration,
    focus: c.focus,
    whyExposed: c.whyExposed,
    neverList: c.neverList,
    traffic: c.traffic,
    cases: c.cases,
    tips: c.tips,
    quiz: c.quiz.map((q) => ({
      prompt: q.prompt,
      choices: q.choices.map((label, i) => ({
        label,
        correct: i === q.correctIndex,
      })),
      why: q.why,
    })),
  })),
};

const out = resolve("docs/formation-avocat-contenu.json");
writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");
console.log(`OK ${out} (${payload.blocks.length} blocs, ${payload.exam.bank.length} QCM, ${payload.careers.length} métiers)`);
