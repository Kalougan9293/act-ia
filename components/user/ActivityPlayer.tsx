"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  type LucideIcon,
  Mail,
  MessageCircle,
  Mic,
  RotateCw,
  Video,
} from "lucide-react";
import VideoScript from "@/components/user/VideoScript";
import type { Activity, ActivityChoice } from "@/lib/formation/activity";

function Feedback({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border-2 border-blue-400 bg-blue-50 px-6 py-6 text-center shadow-lg shadow-blue-500/15 dark:border-blue-500 dark:bg-blue-950/60">
      <p className="text-center text-xs font-bold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">
        À retenir
      </p>
      <p className="mt-3 text-center text-base font-semibold leading-relaxed text-slate-900 dark:text-white">
        {text}
      </p>
    </div>
  );
}

function SceneFrame({
  badge,
  badgeTone,
  icon: Icon,
  iconTone,
  shell,
  children,
}: {
  badge: string;
  badgeTone: string;
  icon: LucideIcon;
  iconTone: string;
  shell: string;
  children: ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border-2 px-5 py-6 shadow-md ${shell}`}>
      <div className="mb-4 flex items-center justify-center">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${badgeTone}`}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/90" />
          {badge}
        </span>
      </div>
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white/70 bg-white/70 shadow-sm dark:border-white/10 dark:bg-slate-950/40">
        <Icon className={`h-7 w-7 ${iconTone}`} />
      </div>
      {children}
    </div>
  );
}

function choiceStyle(reveal: boolean, correct: boolean, selected: boolean) {
  if (reveal && correct) return "border-emerald-700 bg-emerald-600 font-semibold text-white";
  if (reveal && selected && !correct) return "border-red-900 bg-red-800 font-semibold text-white";
  if (selected) return "border-blue-400 bg-blue-50 text-slate-800 dark:bg-blue-950/30 dark:text-slate-100";
  return "border-slate-200 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-blue-500 dark:hover:bg-blue-950/40";
}

function ChoiceList({
  choices,
  onPick,
}: {
  choices: ActivityChoice[];
  onPick: (choice: ActivityChoice) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const reveal = picked !== null;
  return (
    <div className="space-y-2.5">
      <ul className="mx-auto grid max-w-lg gap-2.5">
        {choices.map((choice, index) => (
          <li key={choice.label}>
            <button
              type="button"
              disabled={reveal}
              onClick={() => {
                setPicked(index);
                onPick(choice);
              }}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm transition duration-300 enabled:hover:-translate-y-0.5 enabled:hover:shadow-md disabled:cursor-default ${choiceStyle(
                reveal,
                choice.correct,
                picked === index,
              )}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  reveal && (choice.correct || picked === index)
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {reveal && choice.correct ? <Check className="h-4 w-4" /> : String.fromCharCode(65 + index)}
              </span>
              <span className="font-medium leading-snug">{choice.label}</span>
            </button>
          </li>
        ))}
      </ul>
      {reveal && picked !== null && <Feedback text={choices[picked]!.explanation} />}
    </div>
  );
}

function TextActivity({
  activity,
  onReady,
}: {
  activity: Extract<Activity, { kind: "text" | "fiche" }>;
  onReady: () => void;
}) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
      {activity.kind === "fiche" && (
        <p className="text-center text-sm leading-relaxed text-slate-700 dark:text-slate-200">{activity.intro}</p>
      )}
      {activity.kind === "text" && (
        <div className="space-y-3">
          {activity.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="text-center text-[1.0625rem] leading-8 text-slate-800 [font-family:var(--font-reading),Georgia,serif] dark:text-slate-100"
            >
              {paragraph}
            </p>
          ))}
          {activity.points && (
            <ul className="mt-8 space-y-3">
              {activity.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start justify-center gap-2 text-center text-[1.0625rem] leading-8 text-slate-800 [font-family:var(--font-reading),Georgia,serif] dark:text-slate-100"
                >
                  <Check className="mt-1.5 h-4 w-4 shrink-0 text-blue-600" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {activity.kind === "fiche" && (
        <ol className="mx-auto max-w-md list-decimal space-y-2 pl-5 text-left text-sm text-slate-700 dark:text-slate-200">
          {activity.items.map((item) => (
            <li key={item} className="pl-1">
              {item}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function QuizActivity({
  questions,
  onReady,
}: {
  questions: { prompt: string; choices: ActivityChoice[] }[];
  onReady: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const current = questions[index];
  if (!current) return null;
  return (
    <div className="space-y-5">
      {questions.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {questions.map((_, stepIndex) => (
            <span
              key={stepIndex}
              className={`h-1.5 w-1.5 rounded-full ${
                stepIndex < index
                  ? "bg-emerald-500"
                  : stepIndex === index
                    ? "bg-blue-500"
                    : "bg-slate-300 dark:bg-slate-600"
              }`}
            />
          ))}
        </div>
      )}
      <p className="mx-auto max-w-lg text-center text-base font-semibold leading-snug text-slate-900 dark:text-white">
        {current.prompt}
      </p>
      <ChoiceList key={index} choices={current.choices} onPick={() => setAnswered(true)} />
      {answered && index < questions.length - 1 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              setIndex((value) => value + 1);
              setAnswered(false);
            }}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Suite
          </button>
        </div>
      )}
      {answered && index === questions.length - 1 && <ReadyOnce onReady={onReady} />}
    </div>
  );
}

function ReadyOnce({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

type BinTone = { idle: string; over: string; title: string };

const BIN_TONE_PALETTE: BinTone[] = [
  {
    idle: "border-sky-300 bg-sky-50/70 dark:border-sky-700 dark:bg-sky-950/30",
    over: "border-sky-500 bg-sky-100 dark:border-sky-400 dark:bg-sky-950/50",
    title: "text-sky-700 dark:text-sky-300",
  },
  {
    idle: "border-violet-300 bg-violet-50/70 dark:border-violet-700 dark:bg-violet-950/30",
    over: "border-violet-500 bg-violet-100 dark:border-violet-400 dark:bg-violet-950/50",
    title: "text-violet-700 dark:text-violet-300",
  },
  {
    idle: "border-amber-300 bg-amber-50/70 dark:border-amber-700 dark:bg-amber-950/30",
    over: "border-amber-500 bg-amber-100 dark:border-amber-400 dark:bg-amber-950/50",
    title: "text-amber-700 dark:text-amber-300",
  },
  {
    idle: "border-emerald-300 bg-emerald-50/70 dark:border-emerald-700 dark:bg-emerald-950/30",
    over: "border-emerald-500 bg-emerald-100 dark:border-emerald-400 dark:bg-emerald-950/50",
    title: "text-emerald-700 dark:text-emerald-300",
  },
  {
    idle: "border-rose-300 bg-rose-50/70 dark:border-rose-700 dark:bg-rose-950/30",
    over: "border-rose-500 bg-rose-100 dark:border-rose-400 dark:bg-rose-950/50",
    title: "text-rose-700 dark:text-rose-300",
  },
  {
    idle: "border-cyan-300 bg-cyan-50/70 dark:border-cyan-700 dark:bg-cyan-950/30",
    over: "border-cyan-500 bg-cyan-100 dark:border-cyan-400 dark:bg-cyan-950/50",
    title: "text-cyan-700 dark:text-cyan-300",
  },
];

const BIN_TONES: Record<string, BinTone> = {
  classic: BIN_TONE_PALETTE[0]!,
  gen: BIN_TONE_PALETTE[1]!,
  deploy: BIN_TONE_PALETTE[0]!,
  provider: BIN_TONE_PALETTE[1]!,
  ban: BIN_TONE_PALETTE[4]!,
  high: BIN_TONE_PALETTE[2]!,
  clear: BIN_TONE_PALETTE[0]!,
  low: BIN_TONE_PALETTE[3]!,
  perso: BIN_TONE_PALETTE[0]!,
  sens: BIN_TONE_PALETTE[4]!,
  conf: BIN_TONE_PALETTE[2]!,
};

function binTone(binId: string, index: number): BinTone {
  return BIN_TONES[binId] ?? BIN_TONE_PALETTE[index % BIN_TONE_PALETTE.length]!;
}

const BUBBLE_COLORS = [
  "border-rose-300 bg-rose-200 text-rose-950",
  "border-orange-300 bg-orange-200 text-orange-950",
  "border-amber-300 bg-amber-200 text-amber-950",
  "border-lime-300 bg-lime-200 text-lime-950",
  "border-emerald-300 bg-emerald-200 text-emerald-950",
  "border-cyan-300 bg-cyan-200 text-cyan-950",
  "border-sky-300 bg-sky-200 text-sky-950",
  "border-violet-300 bg-violet-200 text-violet-950",
  "border-fuchsia-300 bg-fuchsia-200 text-fuchsia-950",
];

function SortActivity({
  activity,
  onReady,
}: {
  activity: Extract<Activity, { kind: "sort" }>;
  onReady: () => void;
}) {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const [overBin, setOverBin] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const binRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragId = useRef<string | null>(null);
  const allPlaced = activity.cards.every((card) => placed[card.id]);
  const draggingCard = activity.cards.find((card) => card.id === drag?.id);
  const row4 = activity.bins.length === 4;

  function hitBin(x: number, y: number) {
    for (const bin of activity.bins) {
      const el = binRefs.current[bin.id];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return bin.id;
    }
    return null;
  }

  useEffect(() => {
    if (!drag) return;
    function move(event: PointerEvent) {
      const id = dragId.current;
      if (!id) return;
      setDrag({ id, x: event.clientX, y: event.clientY });
      setOverBin(hitBin(event.clientX, event.clientY));
    }
    function up(event: PointerEvent) {
      const id = dragId.current;
      const bin = hitBin(event.clientX, event.clientY);
      if (id) {
        setPlaced((current) => {
          const next = { ...current };
          if (bin) next[id] = bin;
          else delete next[id];
          return next;
        });
      }
      dragId.current = null;
      setDrag(null);
      setOverBin(null);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag !== null]);

  function startDrag(event: React.PointerEvent, cardId: string) {
    if (checked) return;
    event.preventDefault();
    dragId.current = cardId;
    setDrag({ id: cardId, x: event.clientX, y: event.clientY });
  }

  const guideCorrection = row4;
  const targetBins = new Set(
    checked && guideCorrection
      ? activity.cards
          .filter((card) => placed[card.id] && placed[card.id] !== card.binId)
          .map((card) => card.binId)
      : [],
  );

  function bubbleClass(index: number, right?: boolean) {
    const tone = checked
      ? right
        ? "border-emerald-700 bg-emerald-500 text-white"
        : "border-red-900 bg-red-800 text-white"
      : BUBBLE_COLORS[index % BUBBLE_COLORS.length];
    const feedbackMotion =
      checked && guideCorrection ? (right ? "sort-pop" : "sort-shake") : checked ? "sort-pop" : "";
    return `touch-none select-none border-2 text-center font-semibold shadow-sm transition ${
      row4
        ? "max-w-full rounded-xl px-1.5 py-1.5 text-[10px] leading-snug sm:px-2 sm:text-[11px]"
        : "rounded-full px-3.5 py-2 text-xs"
    } ${checked ? "cursor-default" : "cursor-grab active:cursor-grabbing"} ${tone} ${feedbackMotion}`;
  }

  function Bubble({ cardId }: { cardId: string }) {
    const index = activity.cards.findIndex((card) => card.id === cardId);
    const card = activity.cards[index];
    if (!card || drag?.id === card.id) return null;
    const binId = placed[card.id];
    const right = binId === card.binId;
    const fromIndex = activity.bins.findIndex((bin) => bin.id === binId);
    const toIndex = activity.bins.findIndex((bin) => bin.id === card.binId);
    const target = activity.bins[toIndex];
    const goLeft = toIndex < fromIndex;

    return (
      <div className="flex max-w-full flex-col items-center gap-1">
        <button type="button" onPointerDown={(event) => startDrag(event, card.id)} className={bubbleClass(index, right)}>
          {card.label}
        </button>
        {checked && guideCorrection && right && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
            <Check className="h-3 w-3" />
            OK
          </span>
        )}
        {checked && guideCorrection && !right && target && (
          <div
            className={`flex max-w-full flex-col items-center gap-0.5 text-[10px] font-semibold leading-tight text-emerald-700 dark:text-emerald-300 ${
              goLeft ? "sort-arrow-left" : "sort-arrow"
            }`}
          >
            <span className="inline-flex items-center gap-0.5">
              {goLeft ? <ArrowLeft className="h-3 w-3 shrink-0" /> : <ArrowRight className="h-3 w-3 shrink-0" />}
              <span className="uppercase tracking-wide">{target.label}</span>
            </span>
          </div>
        )}
        {checked && (
          <p
            className={`max-w-[14rem] text-center text-[11px] font-medium leading-snug sm:text-xs ${
              right ? "text-emerald-800 dark:text-emerald-200" : "text-red-800 dark:text-red-200"
            }`}
          >
            {card.explanation}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="whitespace-pre-line text-center text-sm text-slate-600 dark:text-slate-300">
        {activity.instruction}
      </p>
      <div
        className={`grid ${
          row4 ? "grid-cols-4 gap-1.5 sm:gap-2" : "grid-cols-1 gap-3 sm:grid-cols-2"
        }`}
      >
        {activity.bins.map((bin, binIndex) => {
          const tone = binTone(bin.id, binIndex);
          const hot = overBin === bin.id;
          const isTarget = targetBins.has(bin.id);
          return (
            <div
              key={bin.id}
              ref={(node) => {
                binRefs.current[bin.id] = node;
              }}
              className={`border-2 border-dashed transition ${
                row4
                  ? "min-h-40 rounded-xl p-1.5 sm:min-h-44 sm:rounded-2xl sm:p-2"
                  : "min-h-36 rounded-3xl p-3"
              } ${hot ? tone.over : tone.idle} ${isTarget ? "sort-target border-emerald-500" : ""}`}
            >
              <p
                className={`text-center font-semibold uppercase tracking-wide ${
                  row4 ? "mb-1.5 text-[10px] leading-tight sm:text-[11px]" : "mb-3 text-xs"
                } ${tone.title}`}
              >
                {bin.label}
              </p>
              <div className={`flex flex-col items-center ${row4 ? "gap-1.5" : "gap-2"}`}>
                {activity.cards
                  .filter((card) => placed[card.id] === bin.id)
                  .map((card) => (
                    <Bubble key={card.id} cardId={card.id} />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-2.5">
        {activity.cards
          .filter((card) => !placed[card.id])
          .map((card) => (
            <Bubble key={card.id} cardId={card.id} />
          ))}
      </div>
      {drag && draggingCard && (
        <div
          className={`pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 scale-105 shadow-lg ${bubbleClass(
            activity.cards.findIndex((card) => card.id === draggingCard.id),
          )}`}
          style={{ left: drag.x, top: drag.y }}
        >
          {draggingCard.label}
        </div>
      )}
      {!checked && (
        <div className="flex justify-center">
          <button
            type="button"
            disabled={!allPlaced}
            onClick={() => {
              setChecked(true);
              onReady();
            }}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-blue-700 disabled:opacity-40"
          >
            Vérifier
          </button>
        </div>
      )}
    </div>
  );
}

function scenarioSkin(prompt: string) {
  const text = prompt.toLowerCase();
  if (text.includes("visio") || text.includes("virement") || text.includes("directeur")) {
    return {
      Icon: Video,
      badge: "Appel entrant",
      shell:
        "border-rose-300 bg-gradient-to-b from-rose-100 via-white to-amber-50 dark:border-rose-800 dark:from-rose-950/50 dark:via-slate-900 dark:to-amber-950/30",
      badgeTone: "bg-rose-600 text-white",
      iconTone: "text-rose-600 dark:text-rose-300",
    };
  }
  if (text.includes("e-mail") || text.includes("mail") || text.includes("contrats")) {
    return {
      Icon: Mail,
      badge: "Message",
      shell:
        "border-sky-300 bg-gradient-to-b from-sky-100 via-white to-violet-50 dark:border-sky-800 dark:from-sky-950/50 dark:via-slate-900 dark:to-violet-950/30",
      badgeTone: "bg-sky-600 text-white",
      iconTone: "text-sky-600 dark:text-sky-300",
    };
  }
  if (text.includes("réunion") || text.includes("enregistre")) {
    return {
      Icon: Mic,
      badge: "Réunion",
      shell:
        "border-violet-300 bg-gradient-to-b from-violet-100 via-white to-fuchsia-50 dark:border-violet-800 dark:from-violet-950/50 dark:via-slate-900 dark:to-fuchsia-950/30",
      badgeTone: "bg-violet-600 text-white",
      iconTone: "text-violet-600 dark:text-violet-300",
    };
  }
  if (text.includes("chatbot")) {
    return {
      Icon: MessageCircle,
      badge: "Chat",
      shell:
        "border-cyan-300 bg-gradient-to-b from-cyan-100 via-white to-emerald-50 dark:border-cyan-800 dark:from-cyan-950/50 dark:via-slate-900 dark:to-emerald-950/30",
      badgeTone: "bg-cyan-700 text-white",
      iconTone: "text-cyan-700 dark:text-cyan-300",
    };
  }
  return {
    Icon: MessageCircle,
    badge: "Situation",
    shell:
      "border-blue-300 bg-gradient-to-b from-blue-100 via-white to-slate-50 dark:border-blue-800 dark:from-blue-950/50 dark:via-slate-900 dark:to-slate-950",
    badgeTone: "bg-blue-600 text-white",
    iconTone: "text-blue-600 dark:text-blue-300",
  };
}

function ScenarioActivity({
  steps,
  onReady,
}: {
  steps: { prompt: string; choices: ActivityChoice[] }[];
  onReady: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const current = steps[index];
  if (!current) return null;
  const answered = picked !== null;
  const skin = scenarioSkin(current.prompt);

  return (
    <div className="space-y-5">
      {steps.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {steps.map((_, stepIndex) => (
            <span
              key={stepIndex}
              className={`h-1.5 w-1.5 rounded-full ${
                stepIndex < index
                  ? "bg-emerald-500"
                  : stepIndex === index
                    ? "bg-blue-500"
                    : "bg-slate-300 dark:bg-slate-600"
              }`}
            />
          ))}
        </div>
      )}

      <SceneFrame
        badge={skin.badge}
        badgeTone={skin.badgeTone}
        icon={skin.Icon}
        iconTone={skin.iconTone}
        shell={skin.shell}
      >
        <p className="mx-auto max-w-md text-center text-base font-semibold leading-snug text-slate-900 dark:text-white">
          {current.prompt}
        </p>
      </SceneFrame>

      <ul className="mx-auto grid max-w-lg gap-2.5">
        {current.choices.map((choice, choiceIndex) => {
          const selected = picked === choiceIndex;
          const reveal = answered;
          const tone = choiceStyle(reveal, choice.correct, selected);
          return (
            <li key={choice.label}>
              <button
                type="button"
                disabled={answered}
                onClick={() => setPicked(choiceIndex)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm transition duration-300 enabled:hover:-translate-y-0.5 enabled:hover:shadow-md disabled:cursor-default ${tone}`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    reveal && choice.correct
                      ? "bg-white/20 text-white"
                      : reveal && selected
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {reveal && choice.correct ? <Check className="h-4 w-4" /> : String.fromCharCode(65 + choiceIndex)}
                </span>
                <span className="font-medium leading-snug">{choice.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {answered && picked !== null && <Feedback text={current.choices[picked]!.explanation} />}

      {answered && index < steps.length - 1 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              setIndex((value) => value + 1);
              setPicked(null);
            }}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Suite
          </button>
        </div>
      )}
      {answered && index === steps.length - 1 && <ReadyOnce onReady={onReady} />}
    </div>
  );
}

function ChecklistActivity({
  intro,
  items,
  centered = false,
  onReady,
}: {
  intro: string;
  items: string[];
  centered?: boolean;
  onReady: () => void;
}) {
  const [checked, setChecked] = useState<string[]>([]);
  const [validated, setValidated] = useState(false);
  useEffect(() => {
    if (!centered && checked.length === items.length) onReady();
  }, [centered, checked.length, items.length, onReady]);
  return (
    <div className="space-y-5">
      <p className="mx-auto max-w-lg text-center text-base font-semibold leading-snug text-slate-900 dark:text-white">
        {intro}
      </p>
      <ul className={`space-y-2.5 ${centered ? "mx-auto max-w-lg" : ""}`}>
        {items.map((item) => {
          const on = centered ? validated || checked.includes(item) : checked.includes(item);
          const allGood = centered && (validated || checked.length === items.length);
          return (
            <li key={item}>
              <button
                type="button"
                disabled={validated}
                onClick={() =>
                  setChecked((current) =>
                    current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
                  )
                }
                className={`flex w-full gap-2 rounded-2xl border-2 px-4 py-3.5 text-sm transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-md disabled:cursor-default ${
                  centered ? "items-center justify-center text-center" : "items-start text-left"
                } ${
                  allGood && on
                    ? "border-emerald-700 bg-emerald-600 font-semibold text-white"
                    : on
                      ? "border-emerald-400 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-50"
                      : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                <Check
                  className={`h-4 w-4 shrink-0 ${
                    allGood && on ? "text-white" : on ? "text-emerald-600" : "text-slate-300"
                  } ${centered ? "" : "mt-0.5"}`}
                />
                <span className="font-medium">{item}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {centered && !validated && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => {
              setValidated(true);
              onReady();
            }}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Valider
          </button>
        </div>
      )}
    </div>
  );
}

function PredictActivity({
  activity,
  onReady,
}: {
  activity: Extract<Activity, { kind: "predict" }>;
  onReady: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const top = Math.max(...activity.options.map((option) => option.percent));
  const open = picked !== null;
  return (
    <div className="space-y-5">
      <div className="mx-auto max-w-lg space-y-2 text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{activity.hint}</p>
        <p className="text-lg font-bold leading-snug text-slate-900 dark:text-white">{activity.lead}</p>
      </div>
      <ul className="mx-auto grid max-w-lg gap-2.5">
        {activity.options.map((option, index) => {
          const correct = option.percent === top;
          const mine = option.label === picked;
          const tone = !open
            ? "border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-amber-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            : correct
              ? "border-emerald-700 bg-emerald-600 text-white"
              : mine
                ? "border-red-900 bg-red-800 text-white"
                : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900";
          return (
            <li key={option.label}>
              <button
                type="button"
                disabled={open}
                onClick={() => setPicked(option.label)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-semibold transition disabled:cursor-default ${tone}`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    open && (correct || mine)
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {open && correct ? <Check className="h-4 w-4" /> : String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 leading-snug">{option.label}</span>
                {open && (
                  <span className={`text-xs font-semibold ${correct || mine ? "text-white/90" : "text-slate-400"}`}>
                    {option.percent} %
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {open && (
        <>
          <Feedback text={activity.message} />
          <ReadyOnce onReady={onReady} />
        </>
      )}
    </div>
  );
}

function SpotActivity({
  activity,
  onReady,
}: {
  activity: Extract<Activity, { kind: "spot" }>;
  onReady: () => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const traps = activity.fragments.filter((fragment) => fragment.trap);
  return (
    <div className="space-y-5">
      <p className="mx-auto max-w-lg text-center text-base font-semibold leading-snug text-slate-900 dark:text-white">
        {activity.intro}
      </p>
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-center text-sm leading-8 text-slate-800 dark:text-slate-100">
          {activity.fragments.map((fragment, index) => {
            const on = picked.includes(fragment.id);
            const text = fragment.text.trim();
            const gap = index > 0 && !/^[,.;:!?]/.test(text) ? " " : "";
            const found = checked && fragment.trap && on;
            const missed = checked && fragment.trap && !on;
            const extra = checked && !fragment.trap && on;
            const tone = checked
              ? found
                ? "rounded bg-emerald-500 px-0.5 font-semibold text-white"
                : missed
                  ? "rounded bg-red-600 px-0.5 font-semibold text-white"
                  : extra
                    ? "rounded bg-red-200 px-0.5 font-semibold text-red-900 line-through"
                    : ""
              : on
                ? "rounded bg-slate-200 px-0.5 dark:bg-slate-700"
                : "rounded px-0.5 hover:bg-slate-100 dark:hover:bg-slate-800";
            return (
              <Fragment key={fragment.id}>
                {gap}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (checked) return;
                    setPicked((current) =>
                      current.includes(fragment.id)
                        ? current.filter((id) => id !== fragment.id)
                        : [...current, fragment.id],
                    );
                  }}
                  onKeyDown={(event) => {
                    if (checked || (event.key !== "Enter" && event.key !== " ")) return;
                    event.preventDefault();
                    setPicked((current) =>
                      current.includes(fragment.id)
                        ? current.filter((id) => id !== fragment.id)
                        : [...current, fragment.id],
                    );
                  }}
                  className={`cursor-pointer ${tone}`}
                >
                  {text}
                </span>
              </Fragment>
            );
          })}
        </p>
      </div>
      {checked && (
        <div className="mx-auto flex max-w-lg flex-col gap-2">
          {traps.map((trap) => (
            <div
              key={trap.id}
              className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-center dark:border-emerald-700 dark:bg-emerald-950/40"
            >
              <p className="text-center text-sm font-medium text-emerald-900 dark:text-emerald-100">
                {trap.explanation}
              </p>
            </div>
          ))}
        </div>
      )}
      {!checked && (
        <div className="flex justify-center">
          <button
            type="button"
            disabled={picked.length === 0}
            onClick={() => {
              setChecked(true);
              onReady();
            }}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-blue-700 disabled:opacity-40"
          >
            Vérifier
          </button>
        </div>
      )}
    </div>
  );
}

function RedactActivity({
  activity,
  onReady,
}: {
  activity: Extract<Activity, { kind: "redact" }>;
  onReady: () => void;
}) {
  const [hidden, setHidden] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  return (
    <div className="space-y-5">
      <p className="mx-auto max-w-lg text-center text-base font-semibold leading-snug text-slate-900 dark:text-white">
        {activity.intro}
      </p>
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-center text-sm leading-8">
          {activity.tokens.map((token, index) => {
            const on = hidden.includes(token.id);
            const good = checked && token.redact && on;
            const missed = checked && token.redact && !on;
            const extra = checked && !token.redact && on;
            return (
              <Fragment key={token.id}>
                {index > 0 ? " " : null}
                <button
                  type="button"
                  onClick={() => {
                    if (checked) return;
                    setHidden((current) =>
                      current.includes(token.id)
                        ? current.filter((id) => id !== token.id)
                        : [...current, token.id],
                    );
                  }}
                  className={`inline rounded px-0.5 py-0.5 font-medium transition ${
                    checked
                      ? good
                        ? "bg-emerald-500 font-semibold text-white"
                        : missed
                          ? "bg-red-600 font-semibold text-white"
                          : extra
                            ? "bg-red-200 font-semibold text-red-900 line-through"
                            : "text-slate-700 dark:text-slate-200"
                      : on
                        ? "bg-slate-900 text-slate-900 dark:bg-slate-100 dark:text-slate-100"
                        : "text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {token.text}
                </button>
              </Fragment>
            );
          })}
        </p>
      </div>
      {checked && <Feedback text={activity.explanation} />}
      {!checked && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              setChecked(true);
              onReady();
            }}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Vérifier
          </button>
        </div>
      )}
    </div>
  );
}

const TRAFFIC_LEVELS = [
  {
    id: "green",
    label: "Vert",
    hint: "OK, usage courant",
    idle: "border-emerald-400 bg-emerald-100 text-emerald-950 hover:bg-emerald-200 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-100",
    active: "border-emerald-600 bg-emerald-500 text-white",
  },
  {
    id: "orange",
    label: "Orange",
    hint: "L'IA aide, l'humain décide",
    idle: "border-amber-400 bg-amber-100 text-amber-950 hover:bg-amber-200 dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-100",
    active: "border-amber-600 bg-amber-500 text-white",
  },
  {
    id: "red",
    label: "Rouge",
    hint: "On s'arrête",
    idle: "border-rose-400 bg-rose-100 text-rose-950 hover:bg-rose-200 dark:border-rose-500 dark:bg-rose-950/50 dark:text-rose-100",
    active: "border-rose-600 bg-rose-500 text-white",
  },
] as const;

function TrafficActivity({
  items,
  onReady,
}: {
  items: Extract<Activity, { kind: "traffic" }>["items"];
  onReady: () => void;
}) {
  const [cursor, setCursor] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const item = items[cursor];
  const revealed = picked !== null;
  const right = revealed && item ? picked === item.level : false;
  const last = cursor >= items.length - 1;

  function goNext() {
    if (last) {
      onReady();
      setFinished(true);
      return;
    }
    setCursor((value) => value + 1);
    setPicked(null);
  }

  if (!item) return null;

  return (
    <div className="space-y-5">
      <div className="flex justify-center gap-1.5">
        {items.map((_, index) => (
          <span
            key={index}
            className={`h-1.5 w-1.5 rounded-full transition ${
              index < cursor
                ? "bg-emerald-500"
                : index === cursor
                  ? "bg-blue-500"
                  : "bg-slate-300 dark:bg-slate-600"
            }`}
          />
        ))}
      </div>

      <div className="flex justify-center">
        <div
          className={`w-full max-w-lg rounded-3xl border-2 px-6 py-8 shadow-lg transition duration-300 ${
            revealed
              ? right
                ? "sort-pop border-emerald-600 bg-emerald-500 text-white"
                : "sort-shake border-red-900 bg-red-800 text-white"
              : "border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-900"
          }`}
        >
          <p
            className={`text-center text-base font-bold leading-snug sm:text-lg ${
              revealed ? "text-white" : "text-slate-900 dark:text-white"
            }`}
          >
            {item.label}
          </p>
          {revealed && (
            <p className="mt-4 text-center text-sm font-medium leading-relaxed text-white/95">{item.explanation}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {TRAFFIC_LEVELS.map((level) => {
          const isPick = picked === level.id;
          const isAnswer = revealed && level.id === item.level;
          return (
            <button
              key={level.id}
              type="button"
              disabled={revealed}
              onClick={() => setPicked(level.id)}
              className={`flex min-h-[5.5rem] flex-col items-center justify-center rounded-2xl border-2 px-2 py-3 text-center shadow-sm transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-md disabled:cursor-default sm:min-h-[6rem] sm:px-3 ${
                revealed
                  ? isAnswer
                    ? level.active
                    : isPick
                      ? "border-red-900 bg-red-800 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-400 opacity-45 dark:border-slate-700 dark:bg-slate-900"
                  : level.idle
              }`}
            >
              <span className="inline-flex items-center justify-center gap-1 text-sm font-bold uppercase tracking-wide">
                {revealed && isAnswer ? <Check className="h-4 w-4 shrink-0" /> : null}
                {level.label}
              </span>
              <span className="mt-2 block text-[11px] font-medium leading-snug normal-case opacity-90 sm:text-xs">
                {level.hint}
              </span>
            </button>
          );
        })}
      </div>

      {revealed && !finished && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={goNext}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}

const CUBE_TONES = [
  {
    face: "border-sky-400 bg-gradient-to-br from-sky-300 to-sky-500 text-sky-950",
    side: "bg-sky-600",
    glow: "shadow-sky-400/40",
    panel: "border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/40",
    accent: "text-sky-700 dark:text-sky-300",
  },
  {
    face: "border-violet-400 bg-gradient-to-br from-violet-300 to-violet-500 text-violet-950",
    side: "bg-violet-600",
    glow: "shadow-violet-400/40",
    panel: "border-violet-300 bg-violet-50 dark:border-violet-700 dark:bg-violet-950/40",
    accent: "text-violet-700 dark:text-violet-300",
  },
  {
    face: "border-amber-400 bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950",
    side: "bg-amber-600",
    glow: "shadow-amber-400/40",
    panel: "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40",
    accent: "text-amber-700 dark:text-amber-300",
  },
  {
    face: "border-emerald-400 bg-gradient-to-br from-emerald-300 to-emerald-500 text-emerald-950",
    side: "bg-emerald-600",
    glow: "shadow-emerald-400/40",
    panel: "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40",
    accent: "text-emerald-700 dark:text-emerald-300",
  },
  {
    face: "border-rose-400 bg-gradient-to-br from-rose-300 to-rose-500 text-rose-950",
    side: "bg-rose-600",
    glow: "shadow-rose-400/40",
    panel: "border-rose-300 bg-rose-50 dark:border-rose-700 dark:bg-rose-950/40",
    accent: "text-rose-700 dark:text-rose-300",
  },
];

const STAMP_TONES: Record<string, { idle: string; active: string }> = {
  perso: {
    idle: "border-sky-400 bg-sky-100 text-sky-950 hover:bg-sky-200 dark:border-sky-500 dark:bg-sky-950/50 dark:text-sky-100",
    active: "border-sky-600 bg-sky-500 text-white",
  },
  sens: {
    idle: "border-rose-400 bg-rose-100 text-rose-950 hover:bg-rose-200 dark:border-rose-500 dark:bg-rose-950/50 dark:text-rose-100",
    active: "border-rose-600 bg-rose-500 text-white",
  },
  conf: {
    idle: "border-amber-400 bg-amber-100 text-amber-950 hover:bg-amber-200 dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-100",
    active: "border-amber-600 bg-amber-500 text-white",
  },
  vrai: {
    idle: "border-emerald-400 bg-emerald-100 text-emerald-950 hover:bg-emerald-200 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-100",
    active: "border-emerald-600 bg-emerald-500 text-white",
  },
  faux: {
    idle: "border-rose-400 bg-rose-100 text-rose-950 hover:bg-rose-200 dark:border-rose-500 dark:bg-rose-950/50 dark:text-rose-100",
    active: "border-rose-600 bg-rose-500 text-white",
  },
};

function StampActivity({
  activity,
  onReady,
}: {
  activity: Extract<Activity, { kind: "stamp" }>;
  onReady: () => void;
}) {
  const [order] = useState(() => {
    const ids = activity.cards.map((_, index) => index);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    }
    return ids;
  });
  const [cursor, setCursor] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const card = activity.cards[order[cursor] ?? 0];
  const revealed = picked !== null;
  const right = revealed && card ? picked === card.stampId : false;
  const last = cursor >= order.length - 1;

  function goNext() {
    if (last) {
      onReady();
      setFinished(true);
      return;
    }
    setCursor((value) => value + 1);
    setPicked(null);
  }

  if (!card) return null;

  return (
    <div className="space-y-5">
      <div className="flex justify-center gap-1.5">
        {order.map((_, index) => (
          <span
            key={index}
            className={`h-1.5 w-1.5 rounded-full transition ${
              index < cursor
                ? "bg-emerald-500"
                : index === cursor
                  ? "bg-blue-500"
                  : "bg-slate-300 dark:bg-slate-600"
            }`}
          />
        ))}
      </div>

      <p className="text-center text-sm font-medium text-slate-600 dark:text-slate-300">
        Clic sur la bonne case selon l&apos;info du milieu
      </p>

      <div className="flex justify-center">
        <div
          className={`w-full max-w-lg rounded-3xl border-2 px-6 py-8 shadow-lg transition duration-300 ${
            revealed
              ? right
                ? "sort-pop border-emerald-600 bg-emerald-500 text-white"
                : "sort-shake border-red-900 bg-red-800 text-white"
              : "border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-900"
          }`}
        >
          <p
            className={`text-center text-xl font-bold leading-snug ${
              revealed ? "text-white" : "text-slate-900 dark:text-white"
            }`}
          >
            {card.label}
          </p>
          {revealed && (
            <p className="mt-4 text-center text-sm font-medium leading-relaxed text-white/95">{card.explanation}</p>
          )}
        </div>
      </div>

      <div
        className={`grid gap-2 sm:gap-3 ${
          activity.stamps.length === 2 ? "grid-cols-2" : "grid-cols-3"
        }`}
      >
        {activity.stamps.map((stamp) => {
          const tone = STAMP_TONES[stamp.id] ?? STAMP_TONES.perso!;
          const isPick = picked === stamp.id;
          const isAnswer = revealed && stamp.id === card.stampId;
          return (
            <button
              key={stamp.id}
              type="button"
              disabled={revealed}
              onClick={() => setPicked(stamp.id)}
              className={`rounded-2xl border-2 px-2 py-3 text-center shadow-sm transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-md disabled:cursor-default sm:px-3 ${
                revealed
                  ? isAnswer
                    ? tone.active
                    : isPick
                      ? "border-red-900 bg-red-800 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-400 opacity-45 dark:border-slate-700 dark:bg-slate-900"
                  : tone.idle
              }`}
            >
              <span className="inline-flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wide sm:text-sm">
                {revealed && isAnswer ? <Check className="h-4 w-4 shrink-0" /> : null}
                {stamp.label}
              </span>
              <span className="mt-1.5 block text-[10px] font-medium leading-snug normal-case opacity-90 sm:text-xs">
                {stamp.hint}
              </span>
            </button>
          );
        })}
      </div>

      {revealed && !finished && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={goNext}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}

function TimelineActivity({
  items,
  onReady,
}: {
  items: Extract<Activity, { kind: "timeline" }>["items"];
  onReady: () => void;
}) {
  const [opened, setOpened] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const nextIndex = opened.length;
  const allOpen = opened.length === items.length;
  const activeIndex = items.findIndex((item) => item.id === activeId);
  const active = activeIndex >= 0 ? items[activeIndex] : null;
  const activeTone = activeIndex >= 0 ? CUBE_TONES[activeIndex % CUBE_TONES.length]! : null;

  useEffect(() => {
    if (allOpen) onReady();
  }, [allOpen, onReady]);

  function handleCube(index: number) {
    const item = items[index];
    if (!item) return;
    const already = opened.includes(item.id);
    const isNext = index === nextIndex;
    if (!already && !isNext) return;
    if (isNext) setOpened((current) => [...current, item.id]);
    setActiveId(item.id);
  }

  return (
    <div className="space-y-5">
      <div className="relative px-1 pt-2">
        <div className="absolute top-[2.35rem] right-6 left-6 h-1 rounded-full bg-slate-200 dark:bg-slate-700 sm:top-[2.75rem]" />
        <div
          className="absolute top-[2.35rem] left-6 h-1 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400 transition-all duration-500 sm:top-[2.75rem]"
          style={{
            width:
              items.length <= 1
                ? "0%"
                : `calc((100% - 3rem) * ${Math.max(0, opened.length - 1) / (items.length - 1)})`,
          }}
        />
        <ul
          className={`relative grid gap-1.5 sm:gap-3 ${
            items.length <= 5 ? "grid-cols-5" : "grid-cols-3 sm:grid-cols-6"
          }`}
        >
          {items.map((item, index) => {
            const tone = CUBE_TONES[index % CUBE_TONES.length]!;
            const already = opened.includes(item.id);
            const isNext = index === nextIndex;
            const locked = !already && !isNext;
            const selected = activeId === item.id;
            return (
              <li key={item.id} className="flex flex-col items-center">
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => handleCube(index)}
                  className={`group relative w-full max-w-[5.5rem] disabled:cursor-not-allowed ${
                    isNext ? "cube-nudge" : ""
                  }`}
                  aria-label={locked ? `${item.date}, verrouillé` : `${item.date}, ${already ? "rouvert" : "cliquer"}`}
                >
                  <span
                    className={`absolute inset-x-1 top-2 h-full rounded-xl ${tone.side} opacity-80 ${
                      locked ? "grayscale" : ""
                    }`}
                    aria-hidden
                  />
                  <span
                    className={`relative flex aspect-square w-full flex-col items-center justify-center rounded-xl border-2 px-1 shadow-lg transition ${
                      tone.face
                    } ${tone.glow} ${locked ? "grayscale opacity-45" : "hover:-translate-y-1"} ${
                      selected ? "ring-2 ring-offset-2 ring-slate-900/20 dark:ring-white/30" : ""
                    }`}
                  >
                    {already ? (
                      <Check className="mb-0.5 h-4 w-4 sm:h-5 sm:w-5" />
                    ) : locked ? (
                      <Lock className="mb-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : null}
                    <span className="text-center text-[10px] font-bold leading-tight sm:text-xs">{item.shortDate}</span>
                    {isNext && (
                      <span className="mt-1 rounded-full bg-white/85 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-slate-900 uppercase sm:text-[10px]">
                        Cliquez
                      </span>
                    )}
                    {already && !selected && (
                      <span className="mt-1 text-[9px] font-semibold opacity-80 sm:text-[10px]">Vu</span>
                    )}
                  </span>
                </button>
                <span className="mt-2 line-clamp-2 min-h-8 text-center text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:text-[11px]">
                  {already || isNext ? item.label : "···"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {active && activeTone && (
        <div className="mx-auto flex max-w-lg flex-col items-center gap-2">
          <div className={`rounded-xl border px-3 py-1.5 ${activeTone.panel}`}>
            <p className="text-center text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
              Date
            </p>
            <p className={`text-center text-sm font-bold ${activeTone.accent}`}>{active.date}</p>
          </div>
          <div className={`w-full rounded-xl border px-4 py-3 ${activeTone.panel}`}>
            <p className="text-center text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
              Texte de loi
            </p>
            <p className="mt-1 text-center text-sm font-semibold text-slate-900 dark:text-white">{active.law}</p>
          </div>
          <div className={`w-full rounded-xl border-2 px-4 py-3 ${activeTone.panel}`}>
            <p className="text-center text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
              En clair
            </p>
            <p className="mt-1 text-center text-sm leading-relaxed text-slate-700 dark:text-slate-200">{active.detail}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const TETRIS_COLS = 10;
const TETRIS_ROWS = 16;
const TETRIS_FALL_MS = 1500;
const TETRIS_CELL_MAX = 34;
const TETRIS_CELL_MIN = 26;

/** Les 7 tétrominos classiques, un par réflexe */
const TETRIS_SHAPES: number[][][] = [
  [[1, 1, 1, 1]], // I
  [
    [1, 1],
    [1, 1],
  ], // O
  [
    [0, 1, 0],
    [1, 1, 1],
  ], // T
  [
    [1, 0],
    [1, 0],
    [1, 1],
  ], // L
  [
    [0, 1],
    [0, 1],
    [1, 1],
  ], // J
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // S
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // Z
];

const TETRIS_TONES = [
  "border-cyan-600 bg-cyan-400",
  "border-amber-500 bg-amber-300",
  "border-violet-600 bg-violet-400",
  "border-orange-600 bg-orange-400",
  "border-blue-700 bg-blue-500",
  "border-emerald-600 bg-emerald-400",
  "border-rose-600 bg-rose-400",
];

type TetrisCell = { tone: number; label: string; id: string };
type TetrisPiece = {
  id: string;
  label: string;
  tone: number;
  shape: number[][];
  x: number;
  y: number;
};

function rotateShape(shape: number[][]) {
  const h = shape.length;
  const w = shape[0]?.length ?? 0;
  const next: number[][] = Array.from({ length: w }, () => Array.from({ length: h }, () => 0));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      next[x]![h - 1 - y] = shape[y]![x]!;
    }
  }
  return next;
}

function pieceCells(piece: Pick<TetrisPiece, "shape" | "x" | "y">) {
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < (piece.shape[y]?.length ?? 0); x++) {
      if (piece.shape[y]![x]) cells.push({ x: piece.x + x, y: piece.y + y });
    }
  }
  return cells;
}

function pieceBounds(piece: Pick<TetrisPiece, "shape" | "x" | "y">) {
  const cells = pieceCells(piece);
  const xs = cells.map((cell) => cell.x);
  const ys = cells.map((cell) => cell.y);
  return {
    left: Math.min(...xs),
    top: Math.min(...ys),
    right: Math.max(...xs) + 1,
    bottom: Math.max(...ys) + 1,
  };
}

function emptyBoard(): (TetrisCell | null)[][] {
  return Array.from({ length: TETRIS_ROWS }, () => Array.from({ length: TETRIS_COLS }, () => null));
}

function collides(piece: TetrisPiece, board: (TetrisCell | null)[][]) {
  return pieceCells(piece).some(
    (cell) =>
      cell.x < 0 ||
      cell.x >= TETRIS_COLS ||
      cell.y >= TETRIS_ROWS ||
      (cell.y >= 0 && board[cell.y]![cell.x]),
  );
}

function clearLines(board: (TetrisCell | null)[][]) {
  const kept = board.filter((row) => row.some((cell) => !cell));
  const cleared = TETRIS_ROWS - kept.length;
  if (cleared === 0) return board;
  const blank = Array.from({ length: cleared }, () => Array.from({ length: TETRIS_COLS }, () => null));
  return [...blank, ...kept];
}

function useTetrisCellSize() {
  const [cell, setCell] = useState(TETRIS_CELL_MAX);
  useEffect(() => {
    function measure() {
      const available = Math.min(window.innerWidth - 40, 360);
      setCell(Math.max(TETRIS_CELL_MIN, Math.min(TETRIS_CELL_MAX, Math.floor(available / TETRIS_COLS))));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return cell;
}

function TetrisActivity({
  activity,
  onReady,
}: {
  activity: Extract<Activity, { kind: "tetris" }>;
  onReady: () => void;
}) {
  const queue = activity.blocks.slice(0, 7);
  const cell = useTetrisCellSize();
  const [started, setStarted] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [board, setBoard] = useState<(TetrisCell | null)[][]>(() => emptyBoard());
  const [current, setCurrent] = useState<TetrisPiece | null>(null);
  const [lockedIds, setLockedIds] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const boardRef = useRef(board);
  const currentRef = useRef(current);
  const cursorRef = useRef(cursor);
  const finishedRef = useRef(finished);
  const lockedRef = useRef(lockedIds);
  const startedRef = useRef(started);
  boardRef.current = board;
  currentRef.current = current;
  cursorRef.current = cursor;
  finishedRef.current = finished;
  lockedRef.current = lockedIds;
  startedRef.current = started;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  function makePiece(index: number): TetrisPiece | null {
    const block = queue[index];
    const shape = TETRIS_SHAPES[index % TETRIS_SHAPES.length];
    if (!block || !shape) return null;
    return {
      id: block.id,
      label: block.label,
      tone: index % TETRIS_TONES.length,
      shape,
      x: Math.max(0, Math.floor((TETRIS_COLS - (shape[0]?.length ?? 1)) / 2)),
      y: 0,
    };
  }

  function lockPiece(piece: TetrisPiece) {
    let nextBoard = boardRef.current.map((row) => [...row]);
    for (const cell of pieceCells(piece)) {
      if (cell.y < 0) continue;
      nextBoard[cell.y]![cell.x] = { tone: piece.tone, label: piece.label, id: piece.id };
    }
    nextBoard = clearLines(nextBoard);
    setBoard(nextBoard);
    boardRef.current = nextBoard;

    const nextLocked = lockedRef.current.includes(piece.id)
      ? lockedRef.current
      : [...lockedRef.current, piece.id];
    lockedRef.current = nextLocked;
    setLockedIds(nextLocked);

    const nextIndex = cursorRef.current + 1;
    if (nextIndex >= queue.length) {
      setCurrent(null);
      currentRef.current = null;
      setFinished(true);
      onReadyRef.current();
      return;
    }

    setCursor(nextIndex);
    cursorRef.current = nextIndex;
    const spawned = makePiece(nextIndex);
    if (!spawned || collides(spawned, nextBoard)) {
      setCurrent(null);
      currentRef.current = null;
      setFinished(true);
      onReadyRef.current();
      return;
    }
    setCurrent(spawned);
    currentRef.current = spawned;
  }

  function startGame() {
    const first = makePiece(0);
    setStarted(true);
    startedRef.current = true;
    setCursor(0);
    cursorRef.current = 0;
    setBoard(emptyBoard());
    boardRef.current = emptyBoard();
    setLockedIds([]);
    lockedRef.current = [];
    setFinished(false);
    finishedRef.current = false;
    setCurrent(first);
    currentRef.current = first;
  }

  function tryMove(dx: number, dy: number) {
    const piece = currentRef.current;
    if (!startedRef.current || !piece || finishedRef.current) return;
    const next = { ...piece, x: piece.x + dx, y: piece.y + dy };
    if (collides(next, boardRef.current)) {
      if (dy > 0) lockPiece(piece);
      return;
    }
    setCurrent(next);
    currentRef.current = next;
  }

  function tryRotate() {
    const piece = currentRef.current;
    if (!startedRef.current || !piece || finishedRef.current) return;
    const shape = rotateShape(piece.shape);
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      const next = { ...piece, shape, x: piece.x + kick };
      if (!collides(next, boardRef.current)) {
        setCurrent(next);
        currentRef.current = next;
        return;
      }
    }
  }

  function hardDrop() {
    const piece = currentRef.current;
    if (!startedRef.current || !piece || finishedRef.current) return;
    let next = piece;
    for (;;) {
      const down = { ...next, y: next.y + 1 };
      if (collides(down, boardRef.current)) break;
      next = down;
    }
    setCurrent(next);
    currentRef.current = next;
    lockPiece(next);
  }

  useEffect(() => {
    if (!started || finished) return;
    const timer = window.setInterval(() => tryMove(0, 1), TETRIS_FALL_MS);
    return () => window.clearInterval(timer);
  }, [started, finished, cursor]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!startedRef.current || finishedRef.current) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        tryMove(-1, 0);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        tryMove(1, 0);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        tryMove(0, 1);
      } else if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        tryRotate();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const ghost = (() => {
    if (!current) return null;
    let next = current;
    for (;;) {
      const down = { ...next, y: next.y + 1 };
      if (collides(down, board)) break;
      next = down;
    }
    return next.y === current.y ? null : next;
  })();

  function renderPiece(piece: TetrisPiece, ghostMode = false) {
    const bounds = pieceBounds(piece);
    const gap = Math.max(2, Math.round(cell * 0.08));
    return (
      <Fragment key={`${piece.id}-${ghostMode ? "g" : "c"}-${piece.x}-${piece.y}-${piece.shape.length}`}>
        {pieceCells(piece).map((spot) =>
          spot.y < 0 ? null : (
            <div
              key={`${spot.x}-${spot.y}`}
              className={`absolute rounded-md border-2 shadow-sm ${TETRIS_TONES[piece.tone]!} ${
                ghostMode ? "opacity-25" : ""
              }`}
              style={{
                left: spot.x * cell,
                top: spot.y * cell,
                width: cell - gap,
                height: cell - gap,
              }}
            />
          ),
        )}
        {!ghostMode && (
          <div
            className="pointer-events-none absolute z-10 flex items-center justify-center px-0.5"
            style={{
              left: bounds.left * cell,
              top: bounds.top * cell,
              width: (bounds.right - bounds.left) * cell,
              height: (bounds.bottom - bounds.top) * cell,
            }}
          >
            <span className="line-clamp-3 rounded bg-white/90 px-1 py-0.5 text-center text-[9px] font-bold leading-tight text-slate-900 shadow-sm sm:px-1.5 sm:text-[11px]">
              {piece.label}
            </span>
          </div>
        )}
      </Fragment>
    );
  }

  const controlBtn =
    "flex h-14 w-14 touch-manipulation items-center justify-center rounded-2xl border-2 border-slate-300 bg-white text-slate-900 shadow-sm active:scale-95 dark:border-slate-600 dark:bg-slate-900 dark:text-white sm:h-12 sm:w-12 sm:rounded-xl";

  if (!started) {
    return (
      <div className="mx-auto w-full max-w-md space-y-5 px-1">
        <p className="whitespace-pre-line text-center text-base font-semibold leading-snug text-slate-900 dark:text-white">
          {activity.intro}
        </p>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-center text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Comment jouer
          </p>
          <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            <li>
              <span className="font-semibold text-slate-900 dark:text-white">← →</span> déplacer
            </li>
            <li>
              <span className="font-semibold text-slate-900 dark:text-white">Tourner</span> : bouton, Espace
              ou Entrée
            </li>
            <li>
              <span className="font-semibold text-slate-900 dark:text-white">↓</span> accélérer ·{" "}
              <span className="font-semibold text-slate-900 dark:text-white">Poser</span> pour la chute
              rapide
            </li>
            <li>7 pièces = les 7 réflexes. Lisez chaque phrase avant de poser.</li>
          </ul>
        </div>
        <div className="flex justify-center pb-2">
          <button
            type="button"
            onClick={startGame}
            className="w-full max-w-xs touch-manipulation rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] sm:w-auto sm:py-3.5 sm:text-sm"
          >
            Départ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-3 sm:space-y-4">
      <div className="flex items-center justify-center gap-1.5">
        {queue.map((block, index) => (
          <span
            key={block.id}
            className={`h-2.5 w-2.5 rounded-full border ${TETRIS_TONES[index]!} ${
              lockedIds.includes(block.id)
                ? "opacity-100"
                : index === cursor
                  ? "ring-2 ring-blue-400 ring-offset-1 dark:ring-offset-slate-950"
                  : "opacity-35"
            }`}
            aria-label={`Réflexe ${index + 1}${lockedIds.includes(block.id) ? ", posé" : ""}`}
          />
        ))}
      </div>

      {current && !finished && (
        <div
          className={`rounded-2xl border-2 px-3 py-2.5 text-center shadow-sm sm:px-4 sm:py-3 ${TETRIS_TONES[current.tone]!}`}
        >
          <p className="text-[10px] font-bold tracking-wide text-slate-900/70 uppercase">
            Pièce {cursor + 1} / {queue.length}
          </p>
          <p className="mt-1 text-[13px] font-bold leading-snug text-slate-950 sm:text-sm">{current.label}</p>
        </div>
      )}

      <div className="mx-auto w-fit max-w-full overflow-hidden rounded-2xl border-2 border-slate-400 bg-slate-200 p-1.5 shadow-inner sm:rounded-3xl sm:p-2 dark:border-slate-600 dark:bg-slate-950">
        <div
          className="relative touch-none bg-slate-800"
          style={{ width: TETRIS_COLS * cell, height: TETRIS_ROWS * cell }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(148 163 184 / 0.45) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184 / 0.45) 1px, transparent 1px)",
              backgroundSize: `${cell}px ${cell}px`,
            }}
          />
          {board.map((row, y) =>
            row.map((spot, x) =>
              spot ? (
                <div
                  key={`b-${x}-${y}`}
                  className={`absolute rounded-md border-2 shadow-sm ${TETRIS_TONES[spot.tone]!}`}
                  style={{
                    left: x * cell,
                    top: y * cell,
                    width: cell - Math.max(2, Math.round(cell * 0.08)),
                    height: cell - Math.max(2, Math.round(cell * 0.08)),
                  }}
                />
              ) : null,
            ),
          )}
          {ghost && renderPiece(ghost, true)}
          {current && renderPiece(current)}
        </div>
      </div>

      {!finished && (
        <div className="sticky bottom-2 z-20 mx-auto grid max-w-sm grid-cols-5 gap-1.5 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 sm:static sm:max-w-md sm:shadow-sm">
          <button type="button" onClick={() => tryMove(-1, 0)} className={controlBtn} aria-label="Gauche">
            <ArrowLeft className="h-6 w-6 sm:h-5 sm:w-5" />
          </button>
          <button type="button" onClick={tryRotate} className={controlBtn} aria-label="Tourner">
            <RotateCw className="h-6 w-6 sm:h-5 sm:w-5" />
          </button>
          <button type="button" onClick={() => tryMove(0, 1)} className={controlBtn} aria-label="Descendre">
            <ArrowDown className="h-6 w-6 sm:h-5 sm:w-5" />
          </button>
          <button type="button" onClick={() => tryMove(1, 0)} className={controlBtn} aria-label="Droite">
            <ArrowRight className="h-6 w-6 sm:h-5 sm:w-5" />
          </button>
          <button
            type="button"
            onClick={hardDrop}
            className="flex h-14 touch-manipulation items-center justify-center rounded-2xl bg-blue-600 px-1 text-xs font-bold text-white active:scale-95 sm:h-12 sm:rounded-xl sm:text-sm"
          >
            Poser
          </button>
        </div>
      )}

      {finished && (
        <>
          <Feedback text="Les 7 réflexes sont en place. Posez-vous ces questions avant chaque usage d'IA." />
          <ul className="grid gap-1.5">
            {queue.map((block, index) => (
              <li
                key={block.id}
                className="flex items-center gap-2 rounded-xl border border-emerald-400 bg-emerald-50 px-3 py-2 text-left text-xs font-medium text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100"
              >
                <span className={`h-3 w-3 shrink-0 rounded-sm border ${TETRIS_TONES[index]!}`} />
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>{block.label}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function ActivityPlayer({
  activity,
  duration,
  onReady,
}: {
  activity: Activity;
  duration: string;
  onReady: () => void;
}) {
  if (activity.kind === "video") {
    return (
      <>
        <VideoScript format={activity.format} duration={duration} script={activity.script} />
        <ReadyOnce onReady={onReady} />
      </>
    );
  }
  if (activity.kind === "text" || activity.kind === "fiche") {
    return <TextActivity activity={activity} onReady={onReady} />;
  }
  if (activity.kind === "quiz") return <QuizActivity questions={activity.questions} onReady={onReady} />;
  if (activity.kind === "sort") return <SortActivity activity={activity} onReady={onReady} />;
  if (activity.kind === "stamp") return <StampActivity activity={activity} onReady={onReady} />;
  if (activity.kind === "scenario") return <ScenarioActivity steps={activity.steps} onReady={onReady} />;
  if (activity.kind === "checklist") {
    return <ChecklistActivity intro={activity.intro} items={activity.items} centered={activity.centered} onReady={onReady} />;
  }
  if (activity.kind === "predict") return <PredictActivity activity={activity} onReady={onReady} />;
  if (activity.kind === "spot") return <SpotActivity activity={activity} onReady={onReady} />;
  if (activity.kind === "redact") return <RedactActivity activity={activity} onReady={onReady} />;
  if (activity.kind === "traffic") return <TrafficActivity items={activity.items} onReady={onReady} />;
  if (activity.kind === "tetris") return <TetrisActivity activity={activity} onReady={onReady} />;
  return <TimelineActivity items={activity.items} onReady={onReady} />;
}
