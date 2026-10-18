/**
 * Exporte page d'accueil + parcours utilisateur (sans RH / superadmin) en texte.
 * Puis: python scripts/txt-to-pdf.py
 * Usage: npx tsx scripts/export-projet-complet.mts
 */
import { writeFileSync, mkdirSync } from "node:fs";
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
import { faqs } from "../lib/landing/faq";
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

const plans = [
  {
    name: "Micro",
    seats: "1 à 5 salariés",
    price: "390 € / an",
    features: [
      "Jusqu'à 5 accès utilisateurs",
      "Abonnement annuel, sans frais cachés",
      "Socle commun et fiches métiers incluses",
      "Module entreprise (charte, outils, référent)",
      "Attestations nominatives",
      "Preuves conservées 12 mois après le contrat",
      "Tableau de bord RH, suivi et export",
      "Veille incluse : le parcours suit l'actualité",
      "Support par email",
    ],
  },
  {
    name: "TPE",
    seats: "6 à 20 salariés",
    price: "790 € / an",
    features: [
      "Jusqu'à 20 accès utilisateurs",
      "Tout le plan Micro inclus",
      "Support prioritaire",
    ],
  },
  {
    name: "PME",
    seats: "21 à 50 salariés",
    price: "1 290 € / an",
    features: ["Jusqu'à 50 accès utilisateurs", "Tout le plan TPE inclus"],
  },
  {
    name: "ETI",
    seats: "+50 salariés",
    price: "Sur devis",
    features: [
      "Plus de 50 accès",
      "Tout le plan PME inclus",
      "Intégrations sur devis",
      "Contrat et support dédié",
    ],
  },
];

const addons = [
  {
    name: "Module métier sur mesure",
    tag: "Dans StartIA",
    price: "690 € / module",
    description:
      "Un module conçu au cas par cas, selon votre métier, vos usages et vos demandes — rédigé et intégré à votre parcours StartIA.",
  },
  {
    name: "Marque blanche",
    tag: "Partenaires",
    price: "2 000 – 5 000 € / an + par apprenant",
    description:
      "Votre logo et vos couleurs sur la plateforme — pour un organisme de formation ou un cabinet RH. Fourchette indicative ; devis selon le volume.",
  },
  {
    name: "Atelier usages & automatisation",
    tag: "Accompagnement",
    price: "Sur devis",
    description:
      "Session avec vos équipes (visio ou présentiel) : prioriser les usages, gagner du temps sur le quotidien, cadrer ce qui peut être automatisé. Hors abonnement, sur devis.",
  },
];

const out: string[] = [];

out.push("StartIA — RÉSUMÉ PROJET COMPLET");
out.push("=".repeat(60));
out.push("");
out.push("Contenu: page d'accueil + parcours utilisateur (salarié).");
out.push("Hors scope: espace RH, superadmin.");
out.push(`Export généré le: ${new Date().toISOString().slice(0, 10)}`);
out.push("");

out.push("#".repeat(60));
out.push("PARTIE 1 — PAGE D'ACCUEIL");
out.push("#".repeat(60));
out.push("");
out.push("-".repeat(50));
out.push("HERO");
out.push("-".repeat(50));
out.push("");
out.push("Badge: Formation Art. 4 · Données & bons usages");
out.push(
  "Titre: La plateforme clé en main pour attester la formation de vos salariés à l'IA et au RGPD en continu",
);
out.push(
  "Sous-titre: Mettez les salariés de votre entreprise en mesure de répondre à l'AI act (article 4) et suivez l'avancement RH sans effort",
);
out.push("CTA: Demander un accès");
out.push("");
out.push("-".repeat(50));
out.push("PROBLÈMES");
out.push("-".repeat(50));
out.push("");
out.push("Titre: Ce que l'absence de mesures fait risquer à votre entreprise");
out.push("");
out.push("AI Act • Article 4 — Agir sans pouvoir le prouver");
out.push(
  "L'article 4 impose déjà des mesures pour les équipes qui utilisent l'IA. Sans preuves de suivi, la démarche ne tient pas en cas de contrôle, d'incident ou d'audit client.",
);
out.push("");
out.push("Données & sécurité — Fuites d'informations sensibles");
out.push(
  "Sans cadre clair, un salarié peut saisir dans une IA des données personnelles (RGPD) ou des secrets d'entreprise.",
);
out.push("");
out.push("Charge RH — Des heures perdues à former");
out.push(
  "Multiplier les formations externes coûte cher, sans vision claire de qui a vraiment suivi.",
);
out.push("");
out.push("-".repeat(50));
out.push("CONFIANCE / PREUVES");
out.push("-".repeat(50));
out.push("");
out.push("  • Preuves Art. 4 — Attestations nominatives et suivi des parcours");
out.push("  • RS6776 & RS6601 — Organisme de formation partenaire");
out.push("  • Attestation de suivi — Nominative et horodatée");
out.push("  • Suivi RH — Qui a suivi quoi, et qui est en retard");
out.push("  • Prise en main immédiate — 100 % SaaS");
out.push("  • Veille réglementaire — Le parcours suit l'actualité");
out.push("");
out.push("-".repeat(50));
out.push("FONCTIONNALITÉS");
out.push("-".repeat(50));
out.push("");
out.push("Pour les salariés — Réflexes du quotidien");
out.push("  • Risques et hallucinations");
out.push("  • Données et secrets d'entreprise");
out.push("  • Vérifier avant d'utiliser");
out.push("  • Savoir quand demander de l'aide");
out.push("");
out.push("Pour les entreprises — Démarche documentée");
out.push("  • Attestations nominatives");
out.push("  • Suivi RH : qui a suivi");
out.push("  • Export pour audits et contrôles");
out.push("");
out.push("Pour les responsables métiers — Usages ciblés");
out.push("  • Modules après le socle");
out.push("  • Cas concrets par métier");
out.push("  • Consignes adaptées aux usages");
out.push("  • Option : module rédigé pour votre métier");
out.push("");
out.push("-".repeat(50));
out.push("TARIFS");
out.push("-".repeat(50));
out.push("");
out.push("Titre: Un prix fixe, des attestations à jour");
out.push(
  "Mention: Prise en charge OPCO possible via un organisme de formation partenaire Qualiopi, selon éligibilité.",
);
out.push("");
for (const plan of plans) {
  out.push(`${plan.name} — ${plan.seats} — ${plan.price}`);
  for (const feat of plan.features) out.push(`  • ${feat}`);
  out.push("");
}
out.push("OPTIONS");
out.push("");
for (const addon of addons) {
  out.push(`${addon.name} [${addon.tag}] — ${addon.price}`);
  out.push(addon.description);
  out.push("");
}
out.push("-".repeat(50));
out.push("FAQ");
out.push("-".repeat(50));
out.push("");
for (const [i, faq] of faqs.entries()) {
  out.push(`${i + 1}. ${faq.question}`);
  out.push(faq.answer);
  out.push("");
}

out.push("#".repeat(60));
out.push("PARTIE 2 — PARCOURS UTILISATEUR (SALARIÉ)");
out.push("#".repeat(60));
out.push("");
out.push(`Promesse: ${FORMATION_PROMISE}`);
out.push(`Durée socle: ${SOCLE_DURATION_LABEL}`);
out.push("");
out.push("De « Faisons connaissance » aux fiches métiers.");
out.push("Types d'étape: vidéo · jeu · question");
out.push("Module entreprise et fiche métier : optionnels après l'examen.");
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
out.push("PARCOURS MÉTIERS — question");
out.push("#".repeat(60));
out.push("");
  out.push("Type: question — un texte, un cas à trancher, une idée d'usage IA.");
  out.push("");
for (const path of CAREER_PATHS) {
  out.push("-".repeat(50));
  out.push(`${path.title}`);
  out.push(`Type: question | Focus: ${path.focus}`);
  out.push("-".repeat(50));
  out.push("");
  out.push("Texte:");
  out.push(path.briefing);
  out.push("");
  out.push(`Cas pratique: ${path.casePrompt}`);
  for (const option of path.caseOptions) {
    out.push(`  - [${option.correct ? "OK" : "  "}] ${option.label}`);
  }
  out.push(`Correction: ${path.caseCorrection}`);
  out.push("");
  out.push(`Idée d'usage IA: ${path.aiTip}`);
  out.push("");
}

const dir = join(process.cwd(), "exports");
mkdirSync(dir, { recursive: true });
const textPath = join(dir, "startia-projet-complet.txt");
writeFileSync(textPath, out.join("\n"), "utf8");
console.log(`OK texte: ${textPath}`);
console.log(`Lignes: ${out.length}`);
