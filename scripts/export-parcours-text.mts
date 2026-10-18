/**
 * Exporte le parcours utilisateur (Faisons connaissance → fiches métiers) en texte.
 * Puis: python scripts/txt-to-pdf.py pour le PDF.
 * Usage: npx tsx scripts/export-parcours-text.mts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { BLOCKS, REFLEXES_AFTER, REFLEXES_BEFORE } from "../lib/formation/socle";
import {
  POSITIONING_BANK,
  QUIZ_DRAW_SIZE,
  QUIZ_PASS_COUNT,
  QUIZ_PASS_PERCENT,
  QUIZ_TIMER_SECONDS,
  SOCLE_QUESTION_BANK,
} from "../lib/formation/evaluation";
import { FORMATION_PROMISE, SOCLE_DURATION_LABEL } from "../lib/formation/curriculum";
import { CAREER_PATHS } from "../lib/formation/careers";
import type { Activity } from "../lib/formation/activity";

function lines(...parts: (string | null | undefined | false)[]) {
  return parts.filter(Boolean).join("\n");
}

/** Type pédagogique affiché : vidéo | jeu | question. */
function typeLabel(kind: Activity["kind"]): "vidéo" | "jeu" | "question" {
  if (kind === "video") return "vidéo";
  if (kind === "quiz") return "question";
  // Lecture / fiche / checklist : traité comme question (réflexion, pas un jeu)
  if (kind === "text" || kind === "fiche" || kind === "checklist") return "question";
  return "jeu";
}

function formatActivity(activity: Activity): string {
  const type = typeLabel(activity.kind);
  switch (activity.kind) {
    case "video":
      return lines(
        `Type: ${type}`,
        `Format: ${activity.format}`,
        "",
        "Script:",
        activity.script,
      );
    case "text":
      return lines(
        `Type: ${type}`,
        "",
        ...activity.paragraphs,
        activity.beforeAfter
          ? lines(
              "",
              `${activity.beforeAfter.beforeTitle} :`,
              ...activity.beforeAfter.before.map((p, i) => `${i + 1}. ${p}`),
              "",
              `${activity.beforeAfter.afterTitle} :`,
              ...activity.beforeAfter.after.map((p, i) => `${i + 1}. ${p}`),
            )
          : null,
        activity.points?.length
          ? lines("", "Points:", ...activity.points.map((p, i) => `${i + 1}. ${p}`))
          : null,
      );
    case "fiche":
      return lines(
        `Type: ${type}`,
        "",
        activity.intro,
        "",
        ...activity.items.map((item, i) => `${i + 1}. ${item}`),
      );
    case "quiz":
      return lines(
        `Type: ${type}`,
        activity.briefing ? `Énoncé: ${activity.briefing}` : null,
        "",
        ...activity.questions.flatMap((q, qi) => [
          `Question ${qi + 1}: ${q.prompt}`,
          ...q.choices.map(
            (c, ci) =>
              `  ${String.fromCharCode(65 + ci)}. ${c.label}${c.correct ? " ✓" : ""}`,
          ),
          ...q.choices
            .filter((c) => c.explanation)
            .map((c) => `     → ${c.label}: ${c.explanation}`),
          "",
        ]),
      );
    case "sort":
      return lines(
        `Type: ${type}`,
        activity.briefing ? `Énoncé:\n${activity.briefing}` : null,
        `Consigne: ${activity.instruction}`,
        "",
        "Cases:",
        ...activity.bins.map((b) => `  • ${b.label}`),
        "",
        "Cartes:",
        ...activity.cards.map(
          (c) =>
            `  • ${c.label}\n    → Case: ${activity.bins.find((b) => b.id === c.binId)?.label ?? c.binId}\n    → ${c.explanation}`,
        ),
      );
    case "slash":
      return lines(
        `Type: ${type}`,
        activity.briefing ? `Énoncé:\n${activity.briefing}` : null,
        activity.intro ? `Intro: ${activity.intro}` : null,
        activity.takeaway ? `À retenir:\n${activity.takeaway}` : null,
        "",
        "Bulles:",
        ...activity.items.map(
          (item) =>
            `  • ${item.label} [${item.personal ? "donnée perso" : "pas perso"}]\n    → ${item.explanation}`,
        ),
      );
    case "stamp":
      return lines(
        `Type: ${type}`,
        activity.briefing ? `Énoncé:\n${activity.briefing}` : null,
        "",
        "Mots:",
        ...activity.stamps.map((s) => `  • ${s.label}${s.hint ? ` (${s.hint})` : ""}`),
        "",
        "Cartes:",
        ...activity.cards.map((c) => {
          const stamp = activity.stamps.find((s) => s.id === c.stampId)?.label ?? c.stampId;
          return `  • ${c.label}\n    → ${stamp}\n    → ${c.explanation}`;
        }),
      );
    case "swipe":
      return lines(
        `Type: ${type}`,
        activity.briefing ? `Énoncé:\n${activity.briefing}` : null,
        `Gauche: ${activity.left.label}`,
        `Droite: ${activity.right.label}`,
        "",
        "Cartes:",
        ...activity.cards.map((c) => {
          const zone =
            c.zoneId === activity.left.id
              ? activity.left.label
              : c.zoneId === activity.right.id
                ? activity.right.label
                : c.zoneId;
          return `  • ${c.label}\n    → ${zone}\n    → ${c.explanation}`;
        }),
      );
    case "scenario":
      return lines(
        `Type: ${type}`,
        activity.briefing ? `Énoncé: ${activity.briefing}` : null,
        "",
        ...activity.steps.flatMap((step, si) => [
          `Situation ${si + 1}: ${step.prompt}`,
          step.imageSrcs?.length
            ? `  Images: ${step.imageSrcs.join(", ")}`
            : step.imageSrc
              ? `  Image: ${step.imageSrc}`
              : null,
          step.mediaSrc
            ? `  Vidéo: ${step.mediaSrc}${step.mediaLabel ? ` [${step.mediaLabel}]` : ""}`
            : null,
          step.imageCaption ? `  Légende: ${step.imageCaption}` : null,
          ...step.choices.map(
            (c, ci) =>
              `  ${String.fromCharCode(65 + ci)}. ${c.label}${c.correct ? " ✓" : ""}\n     → ${c.explanation}`,
          ),
          "",
        ]),
      );
    case "truefake":
      return lines(
        `Type: ${type}`,
        activity.briefing ? `Énoncé:\n${activity.briefing}` : null,
        "",
        ...activity.items.map((item, i) => {
          const kind = item.mediaKind ?? "video";
          return `Extrait ${i + 1} (${kind}): ${item.prompt}\n  Média: ${item.mediaSrc ?? item.mediaPlaceholder}`;
        }),
        "",
        `Conclusion: ${activity.outro}`,
      );
    case "match":
      return lines(
        `Type: ${type}`,
        activity.briefing ? `Énoncé:\n${activity.briefing}` : null,
        activity.instruction ? `Consigne: ${activity.instruction}` : null,
        "",
        "Paires:",
        ...activity.pairs.map(
          (p) => `  • ${p.left}\n    → ${p.right}\n    → ${p.explanation}`,
        ),
      );
    case "checklist":
      return lines(
        `Type: ${type}`,
        activity.intro,
        "",
        ...activity.items.map((item, i) => `${i + 1}. ${item}`),
      );
    case "predict":
      return lines(
        `Type: ${type}`,
        activity.briefing ? `Énoncé:\n${activity.briefing}` : null,
        activity.hint ? `Indice: ${activity.hint}` : null,
        "",
        ...activity.rounds.flatMap((round, ri) => [
          `Manche ${ri + 1}: « ${round.lead} »`,
          ...round.options.map((o) => `  • ${o.label} (${o.percent} %)`),
          `  Message: ${round.message}`,
          "",
        ]),
      );
    case "spot":
      return lines(
        `Type: ${type}`,
        activity.briefing ? `Énoncé: ${activity.briefing}` : null,
        activity.intro,
        "",
        "Fragments:",
        ...activity.fragments.map(
          (f) =>
            `  • ${f.text}${f.trap ? " [PIÈGE]" : ""}${f.explanation ? `\n    → ${f.explanation}` : ""}`,
        ),
      );
    case "redact":
      return lines(
        `Type: ${type}`,
        activity.briefing ? `Énoncé: ${activity.briefing}` : null,
        activity.intro,
        "",
        "Texte tokenisé:",
        activity.tokens.map((t) => (t.redact ? `[${t.text}]` : t.text)).join(" "),
        "",
        `Explication: ${activity.explanation}`,
      );
    case "traffic":
      return lines(
        `Type: ${type}`,
        activity.briefing ? `Énoncé:\n${activity.briefing}` : null,
        "",
        ...activity.items.map(
          (item) =>
            `  • [${item.level}] ${item.label}\n    → ${item.explanation}`,
        ),
      );
    case "timeline":
      return lines(
        `Type: ${type}`,
        activity.briefing ? `Énoncé: ${activity.briefing}` : null,
        "",
        ...activity.items.map(
          (item) =>
            `  • ${item.date} — ${item.label}\n    ${item.law}\n    ${item.detail}`,
        ),
      );
    case "tetris":
      return lines(
        `Type: ${type}`,
        activity.briefing ? `Énoncé: ${activity.briefing}` : null,
        activity.intro,
        "",
        ...activity.blocks.map((b, i) => `${i + 1}. ${b.label}`),
      );
    case "dodge":
      return lines(
        `Type: ${type}`,
        activity.intro,
        `Objectif: ${activity.goal}`,
        "",
        ...activity.hazards.map(
          (h) => `  • ${h.label}${h.good ? " [à attraper]" : " [à esquiver]"}`,
        ),
      );
    default:
      return `Type: ${(activity as { kind: string }).kind}`;
  }
}

const out: string[] = [];

out.push("StartIA — PARCOURS UTILISATEUR");
out.push("=".repeat(60));
out.push("");
out.push(`Promesse: ${FORMATION_PROMISE}`);
out.push(`Durée socle: ${SOCLE_DURATION_LABEL}`);
out.push(`Export généré le: ${new Date().toISOString().slice(0, 10)}`);
out.push("");
out.push("De « Faisons connaissance » aux fiches métiers.");
out.push("Types d'étape: vidéo · jeu · question");
out.push("");

out.push("#".repeat(60));
out.push("FAISONS CONNAISSANCE — question");
out.push("#".repeat(60));
out.push("");
out.push(
  `Type: question — Questionnaire de positionnement (${POSITIONING_BANK.length} questions).`,
);
out.push("Non noté pour l'attestation ; sert à situer le niveau de départ.");
out.push("");
for (const [i, q] of POSITIONING_BANK.entries()) {
  out.push(`${i + 1}. ${q.prompt}`);
  q.choices.forEach((c, ci) => {
    out.push(`   ${String.fromCharCode(65 + ci)}. ${c}${ci === q.correctIndex ? " ✓" : ""}`);
  });
  out.push(`   → ${q.explanation}`);
  out.push("");
}

for (const block of BLOCKS) {
  out.push("#".repeat(60));
  out.push(`BLOC ${block.number} — ${block.title}`);
  out.push(`Durée: ${block.duration}`);
  out.push(`Objectif: ${block.goal}`);
  out.push("#".repeat(60));
  out.push("");

  for (const chapter of block.chapters) {
    const type = typeLabel(chapter.activity.kind);
    out.push("-".repeat(50));
    out.push(`${chapter.id} · ${chapter.title}`);
    out.push(`Type: ${type} | Durée: ${chapter.duration}`);
    out.push("-".repeat(50));
    out.push("");
    out.push(formatActivity(chapter.activity));
    out.push("");
  }
}

out.push("#".repeat(60));
out.push("LES 7 RÉFLEXES (synthèse)");
out.push("#".repeat(60));
out.push("");
out.push("Avant :");
REFLEXES_BEFORE.forEach((r, i) => out.push(`${i + 1}. ${r}`));
out.push("");
out.push("Après :");
REFLEXES_AFTER.forEach((r, i) =>
  out.push(`${REFLEXES_BEFORE.length + i + 1}. ${r}`),
);
out.push("");

out.push("#".repeat(60));
out.push("EXAMEN FINAL — question");
out.push("#".repeat(60));
out.push("");
out.push(`Type: question`);
out.push(
  `Tirage: ${QUIZ_DRAW_SIZE} questions parmi ${SOCLE_QUESTION_BANK.length} — 1 question par famille de compétence.`,
);
out.push(
  `Seuil de réussite: ${QUIZ_PASS_PERCENT} % (${QUIZ_PASS_COUNT}/${QUIZ_DRAW_SIZE}).`,
);
out.push(`Chrono indicatif: ${QUIZ_TIMER_SECONDS / 60} minutes.`);
out.push("");
out.push("BANQUE COMPLÈTE DES QUESTIONS:");
out.push("");

for (const [i, q] of SOCLE_QUESTION_BANK.entries()) {
  out.push(`${i + 1}. [${q.blockId}${q.theme ? ` / ${q.theme}` : ""}] ${q.prompt}`);
  q.choices.forEach((c, ci) => {
    out.push(`   ${String.fromCharCode(65 + ci)}. ${c}${ci === q.correctIndex ? " ✓" : ""}`);
  });
  out.push(`   → ${q.explanation}`);
  out.push("");
}

out.push("#".repeat(60));
out.push("PARCOURS MÉTIERS — gabarit 6 rubriques (~8 min)");
out.push("#".repeat(60));
out.push("");
out.push("1 Pourquoi exposé · 2 Jamais · 3 Feu tricolore · 4 Cas · 5 Usages · 6 Quiz");
out.push("");
for (const path of CAREER_PATHS) {
  out.push("-".repeat(50));
  out.push(`${path.title} (${path.duration})`);
  out.push(`Focus: ${path.focus}`);
  out.push("-".repeat(50));
  out.push("");
  out.push("1. Pourquoi ce métier est exposé:");
  out.push(path.whyExposed);
  out.push("");
  out.push("2. Ce qui ne va jamais dans une IA grand public:");
  for (const item of path.neverList) out.push(`  ✕ ${item}`);
  out.push("");
  out.push("3. Feu tricolore:");
  for (const item of path.traffic) {
    out.push(`  [${item.level}] ${item.situation}`);
    out.push(`    → ${item.explanation}`);
  }
  out.push("");
  out.push("4. Trois cas pratiques:");
  path.cases.forEach((item, index) => {
    out.push(`  Cas ${index + 1}: ${item.situation}`);
    out.push(`    → ${item.answer}`);
  });
  out.push("");
  out.push("5. Trois idées d'usage:");
  for (const tip of path.tips) out.push(`  ✓ ${tip}`);
  out.push("");
  out.push("6. Quiz validé:");
  path.quiz.forEach((q, index) => {
    out.push(`  Q${index + 1}. ${q.prompt}`);
    q.choices.forEach((choice, cIndex) => {
      const mark = cIndex === q.correctIndex ? "✓" : " ";
      out.push(`    ${String.fromCharCode(65 + cIndex)}. [${mark}] ${choice}`);
    });
    out.push(`    Pourquoi: ${q.why}`);
  });
  out.push("");
}

const textPath = join(process.cwd(), "exports", "parcours-utilisateur.txt");
const { mkdirSync } = await import("node:fs");
mkdirSync(join(process.cwd(), "exports"), { recursive: true });
writeFileSync(textPath, out.join("\n"), "utf8");
console.log(`OK texte: ${textPath}`);
console.log(`Lignes: ${out.length}`);
