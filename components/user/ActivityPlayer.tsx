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
  User,
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
      <p className="mt-3 text-center text-lg font-semibold leading-relaxed text-slate-900 sm:text-xl dark:text-white">
        {text}
      </p>
    </div>
  );
}

/** Feedback Oui/Non selon la réponse (les textes stockés commencent souvent par « Oui »). */
function matchFeedback(right: boolean, explanation: string) {
  if (right) return explanation;
  const stripped = explanation.replace(/^(Oui|Vrai|Faux)[,.]?\s*/i, "").trim();
  if (!stripped) return "Non.";
  return `Non. ${stripped.charAt(0).toUpperCase()}${stripped.slice(1)}`;
}

function SceneFrame({
  badge,
  badgeTone,
  icon: Icon,
  iconTone,
  shell,
  hideIcon = false,
  children,
}: {
  badge: string;
  badgeTone: string;
  icon: LucideIcon;
  iconTone: string;
  shell: string;
  hideIcon?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border-2 px-5 py-7 shadow-md sm:px-7 sm:py-8 ${shell}`}>
      <div className="mb-5 flex items-center justify-center">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide uppercase ${badgeTone}`}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/90" />
          {badge}
        </span>
      </div>
      {!hideIcon && (
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white/70 bg-white/70 shadow-sm dark:border-white/10 dark:bg-slate-950/40">
          <Icon className={`h-7 w-7 ${iconTone}`} />
        </div>
      )}
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
      <ul className="mx-auto grid w-full max-w-2xl gap-3">
        {choices.map((choice, index) => (
          <li key={choice.label}>
            <button
              type="button"
              disabled={reveal}
              onClick={() => {
                setPicked(index);
                onPick(choice);
              }}
              className={`flex w-full items-center gap-3.5 rounded-2xl border-2 px-4 py-4 text-left text-base transition duration-300 enabled:hover:-translate-y-0.5 enabled:hover:shadow-md disabled:cursor-default sm:gap-4 sm:px-5 sm:text-[1.05rem] ${choiceStyle(
                reveal,
                choice.correct,
                picked === index,
              )}`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  reveal && (choice.correct || picked === index)
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {reveal && choice.correct ? <Check className="h-4 w-4" /> : String.fromCharCode(65 + index)}
              </span>
              <span className="font-medium leading-relaxed">{choice.label}</span>
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
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white px-5 py-6 dark:border-slate-700 dark:bg-slate-900 sm:px-7 sm:py-7">
      {activity.kind === "fiche" && (
        <div className="text-center">
          <p className="text-center text-xs font-bold tracking-[0.16em] text-blue-700 uppercase dark:text-blue-300">
            À retenir
          </p>
          <div className="mt-8">
            <p className="text-center text-base font-semibold text-slate-900 dark:text-white">
              Avant d&apos;écrire à l&apos;IA
            </p>
            <ul className="mt-2 space-y-1.5 text-center text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {activity.items
                .filter((item) => item.startsWith("🛑"))
                .map((item) => (
                  <li key={item} className="text-center">
                    {item}
                  </li>
                ))}
            </ul>
          </div>
          <div className="mt-8">
            <p className="text-center text-base font-semibold text-slate-900 dark:text-white">
              Après la réponse :
            </p>
            <ul className="mt-2 space-y-1.5 text-center text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {activity.items
                .filter((item) => item.startsWith("✅"))
                .map((item) => (
                  <li key={item} className="text-center">
                    {item}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
      {activity.kind === "text" && (
        <div className="space-y-4">
          {activity.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="text-center text-[1.125rem] leading-8 text-slate-800 [font-family:var(--font-reading),Georgia,serif] dark:text-slate-100 sm:leading-9"
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
      <p className="mx-auto max-w-2xl text-center text-lg font-semibold leading-snug text-slate-900 dark:text-white sm:text-xl">
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
  green: {
    idle: "border-emerald-400 bg-emerald-50/80 dark:border-emerald-600 dark:bg-emerald-950/35",
    over: "border-emerald-500 bg-emerald-100 dark:border-emerald-400 dark:bg-emerald-950/55",
    title: "text-emerald-700 dark:text-emerald-300",
  },
  orange: {
    idle: "border-orange-400 bg-orange-50/80 dark:border-orange-600 dark:bg-orange-950/35",
    over: "border-orange-500 bg-orange-100 dark:border-orange-400 dark:bg-orange-950/55",
    title: "text-orange-700 dark:text-orange-300",
  },
  red: {
    idle: "border-red-400 bg-red-50/80 dark:border-red-600 dark:bg-red-950/35",
    over: "border-red-500 bg-red-100 dark:border-red-400 dark:bg-red-950/55",
    title: "text-red-700 dark:text-red-300",
  },
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
  const row3 = activity.bins.length === 3;
  const row4 = activity.bins.length === 4;
  const compact = row3 || row4;

  function hitBin(x: number, y: number) {
    for (const bin of activity.bins) {
      const el = binRefs.current[bin.id];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return bin.id;
    }
    return null;
  }

  function startDrag(event: React.PointerEvent, cardId: string) {
    if (checked) return;
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    let dragging = false;

    function move(moveEvent: PointerEvent) {
      if (moveEvent.pointerId !== pointerId) return;
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (!dragging) {
        if (Math.hypot(dx, dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          cleanup();
          return;
        }
        dragging = true;
        dragId.current = cardId;
      }
      moveEvent.preventDefault();
      setDrag({ id: cardId, x: moveEvent.clientX, y: moveEvent.clientY });
      setOverBin(hitBin(moveEvent.clientX, moveEvent.clientY));
    }

    function up(upEvent: PointerEvent) {
      if (upEvent.pointerId !== pointerId) return;
      if (dragging && dragId.current) {
        const bin = hitBin(upEvent.clientX, upEvent.clientY);
        setPlaced((current) => {
          const next = { ...current };
          if (bin) next[cardId] = bin;
          else delete next[cardId];
          return next;
        });
      }
      dragId.current = null;
      setDrag(null);
      setOverBin(null);
      cleanup();
    }

    function cleanup() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }

  const guideCorrection = compact;
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
    return `touch-pan-y select-none border-2 text-center font-semibold shadow-sm transition ${
      compact
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
          row4
            ? "grid-cols-4 gap-1.5 sm:gap-2"
            : row3
              ? "grid-cols-3 gap-1.5 sm:gap-2"
              : "grid-cols-1 gap-3 sm:grid-cols-2"
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
                compact
                  ? "min-h-32 rounded-xl p-1.5 sm:min-h-36 sm:rounded-2xl sm:p-2"
                  : "min-h-36 rounded-3xl p-3"
              } ${hot ? tone.over : tone.idle} ${isTarget ? "sort-target border-emerald-500" : ""}`}
            >
              <p
                className={`text-center font-semibold uppercase tracking-wide ${
                  compact ? "mb-1.5 text-[10px] leading-tight sm:text-[11px]" : "mb-3 text-xs"
                } ${tone.title}`}
              >
                {bin.label}
              </p>
              <div className={`flex flex-col items-center ${compact ? "gap-1.5" : "gap-2"}`}>
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

function MeetingRecPreview() {
  const bars = [28, 48, 36, 62, 42, 70, 34, 56, 40, 64, 32, 50, 38, 58, 30];
  return (
    <div className="mx-auto mb-5 w-full max-w-sm overflow-hidden rounded-2xl border border-violet-200/80 bg-white/90 shadow-sm dark:border-violet-800 dark:bg-slate-950/70">
      <div className="flex items-center gap-2 border-b border-violet-100 px-3 py-2 dark:border-violet-900/60">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inset-0 animate-ping rounded-full bg-rose-400 opacity-70" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-rose-500" />
        </span>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Enregistrement</span>
        <span className="ml-auto font-mono text-[11px] tabular-nums text-slate-400">00:42</span>
      </div>
      <div className="flex h-16 items-center justify-center gap-[3px] px-4 py-3" aria-hidden>
        {bars.map((height, index) => (
          <span
            key={index}
            className="audio-bar w-1 rounded-full bg-violet-500/80 dark:bg-violet-400/80"
            style={{
              height: `${height}%`,
              animationDelay: `${index * 0.07}s`,
              animationDuration: `${0.75 + (index % 4) * 0.12}s`,
            }}
          />
        ))}
      </div>
      <p className="px-3 pb-2.5 text-center text-[11px] text-slate-500 dark:text-slate-400">
        Réunion · résumé IA en cours…
      </p>
    </div>
  );
}

function ChatbotLivePreview() {
  return (
    <div className="mx-auto mb-5 grid w-full max-w-xl gap-3 sm:grid-cols-2">
      <ChatbotWindow
        name="Assistant"
        message="Bonjour, en quoi puis-je vous aider ?"
      />
      <ChatbotWindow
        name="MegaBoT"
        message="Bonjour, je suis MegaBoT, l'IA pour vous aider."
        disclosed
      />
    </div>
  );
}

function ChatbotWindow({
  name,
  message,
  disclosed = false,
  delay = 220,
}: {
  name: string;
  message: string;
  disclosed?: boolean;
  delay?: number;
}) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setCount(message.length);
      setDone(true);
      return;
    }

    setCount(0);
    setDone(false);
    let index = 0;
    let interval = 0;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        index += 1;
        setCount(index);
        if (index >= message.length) {
          window.clearInterval(interval);
          setDone(true);
        }
      }, 34);
    }, delay);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [message, delay]);

  const typed = message.slice(0, count);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-700 dark:bg-slate-950/70">
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-70" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <span className="truncate text-xs font-semibold text-slate-600 dark:text-slate-300">{name}</span>
        {disclosed && (
          <span className="ml-auto shrink-0 rounded bg-cyan-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-cyan-800 uppercase dark:bg-cyan-950 dark:text-cyan-200">
            IA
          </span>
        )}
      </div>
      <div className="px-3 py-3.5">
        <div className="w-fit max-w-full rounded-2xl rounded-bl-md bg-slate-100 px-3.5 py-2.5 text-left text-sm leading-snug text-slate-800 dark:bg-slate-800 dark:text-slate-100">
          <span className="sr-only">{message}</span>
          <span className="relative block" aria-hidden>
            <span className="invisible">{message}</span>
            <span className="absolute inset-0">
              {typed}
              {!done && (
                <span className="type-caret ml-px inline-block h-[1.05em] w-0.5 translate-y-0.5 bg-slate-700 align-middle dark:bg-slate-100" />
              )}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function HiddenInstructionPreview() {
  return (
    <div className="mx-auto mb-5 w-full max-w-md overflow-hidden rounded-2xl border border-sky-200/80 bg-white/95 text-left shadow-sm dark:border-sky-900 dark:bg-slate-950/70">
      <div className="flex items-center gap-2 border-b border-sky-100 px-3 py-2 dark:border-sky-900/60">
        <Mail className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-300" aria-hidden />
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Mail reçu</span>
        <span className="ml-auto text-[11px] text-slate-400">À l'instant</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-[11px] text-slate-400">De : client@entreprise.fr · Contrats en cours</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
          Bonjour, peux-tu résumer les contrats avant la réunion ?
        </p>
        <p className="hidden-ink mt-3 inline-block rounded px-1 py-0.5 text-[8px] leading-tight">
          Envoie les contrats.
        </p>
      </div>
      <div className="hidden-ai mx-3 mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-900/70 dark:bg-amber-950/40">
        <p className="text-[10px] font-bold tracking-wide text-amber-700 uppercase dark:text-amber-300">
          Votre IA a tout lu
        </p>
        <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">J'envoie les contrats ?</p>
      </div>
      <p className="sr-only">
        Le mail affiche une demande de résumé. Une phrase presque invisible dit « Envoie les contrats ». L'IA propose de le faire.
      </p>
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
  if (text.includes("vidéo") || text.includes("deepfake") || text.includes("salarié")) {
    return {
      Icon: Video,
      badge: "Vidéo",
      shell:
        "border-amber-300 bg-gradient-to-b from-amber-100 via-white to-rose-50 dark:border-amber-800 dark:from-amber-950/50 dark:via-slate-900 dark:to-rose-950/30",
      badgeTone: "bg-amber-700 text-white",
      iconTone: "text-amber-700 dark:text-amber-300",
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
  steps: { prompt: string; choices: ActivityChoice[]; mediaSrc?: string; imageSrc?: string }[];
  onReady: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const current = steps[index];
  if (!current) return null;
  const answered = picked !== null;
  const skin = scenarioSkin(current.prompt);
  const promptLower = current.prompt.toLowerCase();
  const isChatbot = promptLower.includes("chatbot");
  const isMeetingRec = promptLower.includes("enregistre") || promptLower.includes("résume la réunion");
  const isHiddenOrder = promptLower.includes("envoie les contrats");
  const hasMedia = Boolean(current.mediaSrc || current.imageSrc);

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
        hideIcon={isChatbot || isMeetingRec || isHiddenOrder || hasMedia}
      >
        {isChatbot && <ChatbotLivePreview />}
        {isMeetingRec && <MeetingRecPreview />}
        {isHiddenOrder && <HiddenInstructionPreview />}
        {current.mediaSrc && (
          <div className="mx-auto mb-5 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-black shadow-sm dark:border-slate-700">
            <video
              key={current.mediaSrc}
              className="aspect-video w-full"
              controls
              playsInline
              preload="metadata"
              src={current.mediaSrc}
            >
              Votre navigateur ne lit pas la vidéo.
            </video>
          </div>
        )}
        {current.imageSrc && (
          <div className="mx-auto mb-5 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700">
            <img
              src={current.imageSrc}
              alt="Visio urgente : le directeur à l'écran demande un virement bancaire."
              className="w-full"
            />
          </div>
        )}
        <p className="mx-auto max-w-2xl text-center text-lg font-semibold leading-snug text-slate-900 dark:text-white sm:text-xl">
          {current.prompt}
        </p>
      </SceneFrame>

      <ul className="mx-auto grid w-full max-w-2xl gap-3">
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
                className={`flex w-full items-center gap-3.5 rounded-2xl border-2 px-4 py-4 text-left text-base transition duration-300 enabled:hover:-translate-y-0.5 enabled:hover:shadow-md disabled:cursor-default sm:gap-4 sm:px-5 sm:text-[1.05rem] ${tone}`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
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
      <p className="mx-auto max-w-2xl text-center text-lg font-semibold leading-snug text-slate-900 dark:text-white sm:text-xl">
        {intro}
      </p>
      <ul className="mx-auto max-w-2xl space-y-3">
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
                className={`flex w-full gap-3 rounded-2xl border-2 px-4 py-4 text-base transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-md disabled:cursor-default sm:px-5 sm:text-[1.05rem] ${
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
                  className={`h-5 w-5 shrink-0 ${
                    allGood && on ? "text-white" : on ? "text-emerald-600" : "text-slate-300"
                  } ${centered ? "" : "mt-0.5"}`}
                />
                <span className="font-medium leading-relaxed">{item}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {centered && !validated && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            disabled={checked.length === 0}
            onClick={() => {
              setValidated(true);
              onReady();
            }}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
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
  const [cursor, setCursor] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const round = activity.rounds[cursor];
  const open = picked !== null;
  const last = cursor >= activity.rounds.length - 1;
  const top = round ? Math.max(...round.options.map((option) => option.percent)) : 0;
  const hint = round?.hint ?? activity.hint;

  function goNext() {
    if (last) {
      onReady();
      setFinished(true);
      return;
    }
    setCursor((value) => value + 1);
    setPicked(null);
  }

  if (!round) return null;

  return (
    <div className="space-y-4">
      {activity.rounds.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {activity.rounds.map((_, index) => (
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
      )}
      <div className="mx-auto max-w-lg space-y-1.5 text-center">
        {hint && (
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{hint}</p>
        )}
        <p className="text-base font-bold leading-snug text-slate-900 dark:text-white sm:text-lg">
          {round.lead}
        </p>
      </div>
      <ul className="mx-auto grid w-full max-w-lg gap-2">
        {round.options.map((option, index) => {
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
                className={`flex w-full items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition disabled:cursor-default sm:gap-3 sm:px-3.5 sm:text-[0.95rem] ${tone}`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    open && (correct || mine)
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {open && correct ? <Check className="h-3.5 w-3.5" /> : String.fromCharCode(65 + index)}
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
          <p className="mx-auto max-w-lg text-center text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Ce pourcentage n&apos;est pas un chiffre de votre entreprise. Il dit seulement quelle suite est la plus courante.
          </p>
          <Feedback text={round.message} />
          {!finished && !last && (
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
          {last && (
            <ReadyOnce
              onReady={() => {
                onReady();
                setFinished(true);
              }}
            />
          )}
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
            const replacement = token.replacement;
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
                        ? "bg-emerald-100 font-semibold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                        : missed
                          ? "bg-red-600 font-semibold text-white"
                          : extra
                            ? "bg-red-200 font-semibold text-red-900 line-through"
                            : "text-slate-700 dark:text-slate-200"
                      : on
                        ? "bg-amber-100 text-slate-700 dark:bg-amber-950/50 dark:text-amber-50"
                        : "text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {on && token.redact ? (
                    <>
                      <span className="line-through opacity-60">{token.text}</span>
                      {replacement ? <span className="ml-1 no-underline opacity-100">{replacement}</span> : null}
                    </>
                  ) : (
                    token.text
                  )}
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
    idle: "border-emerald-400 bg-emerald-100 text-emerald-950 hover:bg-emerald-200 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-100 dark:hover:bg-emerald-900 dark:hover:text-emerald-50",
    active: "border-emerald-600 bg-emerald-500 text-white",
  },
  {
    id: "orange",
    label: "Orange",
    hint: "L'IA aide, l'humain décide",
    idle: "border-orange-400 bg-orange-100 text-orange-950 hover:bg-orange-200 dark:border-orange-500 dark:bg-orange-950/50 dark:text-orange-100 dark:hover:bg-orange-900 dark:hover:text-orange-50",
    active: "border-orange-600 bg-orange-500 text-white",
  },
  {
    id: "red",
    label: "Rouge",
    hint: "On s'arrête",
    idle: "border-red-400 bg-red-100 text-red-950 hover:bg-red-200 dark:border-red-500 dark:bg-red-950/50 dark:text-red-100 dark:hover:bg-red-900 dark:hover:text-red-50",
    active: "border-red-600 bg-red-500 text-white",
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
            <p className="mt-4 text-center text-sm font-medium leading-relaxed text-white/95">
              {matchFeedback(right, item.explanation)}
            </p>
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
              className={`flex flex-col items-center justify-center rounded-xl border-2 px-2.5 py-2 text-center shadow-sm transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-md disabled:cursor-default sm:px-3 sm:py-2.5 ${
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
                {revealed && isAnswer ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
                {level.label}
              </span>
              <span className="mt-1 block text-[11px] font-medium leading-snug normal-case opacity-90 sm:text-xs">
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
    idle: "border-sky-400 bg-sky-100 text-sky-950 hover:bg-sky-200 dark:border-sky-500 dark:bg-sky-950/50 dark:text-sky-100 dark:hover:bg-sky-900 dark:hover:text-sky-50",
    active: "border-sky-600 bg-sky-500 text-white",
  },
  llm: {
    idle: "border-sky-400 bg-sky-100 text-sky-950 hover:bg-sky-200 dark:border-sky-500 dark:bg-sky-950/50 dark:text-sky-100 dark:hover:bg-sky-900 dark:hover:text-sky-50",
    active: "border-sky-600 bg-sky-500 text-white",
  },
  prompt: {
    idle: "border-violet-400 bg-violet-100 text-violet-950 hover:bg-violet-200 dark:border-violet-500 dark:bg-violet-950/50 dark:text-violet-100 dark:hover:bg-violet-900 dark:hover:text-violet-50",
    active: "border-violet-600 bg-violet-500 text-white",
  },
  hallu: {
    idle: "border-amber-400 bg-amber-100 text-amber-950 hover:bg-amber-200 dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-100 dark:hover:bg-amber-900 dark:hover:text-amber-50",
    active: "border-amber-600 bg-amber-500 text-white",
  },
  deep: {
    idle: "border-rose-400 bg-rose-100 text-rose-950 hover:bg-rose-200 dark:border-rose-500 dark:bg-rose-950/50 dark:text-rose-100 dark:hover:bg-rose-900 dark:hover:text-rose-50",
    active: "border-rose-600 bg-rose-500 text-white",
  },
  ctx: {
    idle: "border-emerald-400 bg-emerald-100 text-emerald-950 hover:bg-emerald-200 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-100 dark:hover:bg-emerald-900 dark:hover:text-emerald-50",
    active: "border-emerald-600 bg-emerald-500 text-white",
  },
  sens: {
    idle: "border-rose-400 bg-rose-100 text-rose-950 hover:bg-rose-200 dark:border-rose-500 dark:bg-rose-950/50 dark:text-rose-100 dark:hover:bg-rose-900 dark:hover:text-rose-50",
    active: "border-rose-600 bg-rose-500 text-white",
  },
  conf: {
    idle: "border-amber-400 bg-amber-100 text-amber-950 hover:bg-amber-200 dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-100 dark:hover:bg-amber-900 dark:hover:text-amber-50",
    active: "border-amber-600 bg-amber-500 text-white",
  },
  vrai: {
    idle: "border-emerald-400 bg-emerald-100 text-emerald-950 hover:bg-emerald-200 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-100 dark:hover:bg-emerald-900 dark:hover:text-emerald-50",
    active: "border-emerald-600 bg-emerald-500 text-white",
  },
  faux: {
    idle: "border-rose-400 bg-rose-100 text-rose-950 hover:bg-rose-200 dark:border-rose-500 dark:bg-rose-950/50 dark:text-rose-100 dark:hover:bg-rose-900 dark:hover:text-rose-50",
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

      <p className="text-center text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
        Lisez la situation
        <br />
        puis choisissez le mot
      </p>

      <div className="flex justify-center">
        <div
          className={`flex w-full max-w-lg flex-col justify-center rounded-2xl border-2 px-5 py-5 shadow-lg transition duration-300 sm:px-6 sm:py-6 ${
            revealed
              ? right
                ? "sort-pop border-emerald-600 bg-emerald-500 text-white"
                : "sort-shake border-red-900 bg-red-800 text-white"
              : "border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-900"
          }`}
        >
          <p
            className={`text-center text-lg font-bold leading-snug sm:text-xl ${
              revealed ? "text-white" : "text-slate-900 dark:text-white"
            }`}
          >
            {card.label}
          </p>
          {revealed && (
            <p className="mt-3 text-center text-sm font-medium leading-relaxed text-white/95">
              {matchFeedback(right, card.explanation)}
            </p>
          )}
        </div>
      </div>

      <div
        className={`mx-auto grid w-full max-w-lg gap-2 ${
          activity.stamps.length % 2 === 0 ? "grid-cols-2" : "grid-cols-3"
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
              className={`flex flex-col items-center justify-center rounded-xl border-2 px-2.5 py-2 text-center shadow-sm transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-md disabled:cursor-default sm:px-3 sm:py-2.5 ${
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
                {revealed && isAnswer ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
                {stamp.label}
              </span>
              {stamp.hint ? (
                <span className="mt-1 block text-[10px] font-medium leading-snug normal-case opacity-90 sm:text-xs">
                  {stamp.hint}
                </span>
              ) : null}
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
  const nextIndex = opened.length;
  const allOpen = opened.length === items.length;

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
  }

  const activeId = opened[opened.length - 1];
  const active = items.find((item) => item.id === activeId);
  const activeTone = active
    ? CUBE_TONES[items.findIndex((item) => item.id === active.id) % CUBE_TONES.length]!
    : null;

  return (
    <div className="space-y-4 px-1 pt-2">
      <ul className="grid grid-cols-5 items-start gap-1.5 sm:gap-2">
        {items.map((item, index) => {
          const tone = CUBE_TONES[index % CUBE_TONES.length]!;
          const already = opened.includes(item.id);
          const isNext = index === nextIndex;
          const locked = !already && !isNext;
          return (
            <li key={item.id} className="flex min-w-0 flex-col items-center">
              <button
                type="button"
                disabled={locked || already}
                onClick={() => handleCube(index)}
                className={`group relative w-full disabled:cursor-default ${isNext ? "cube-nudge" : ""}`}
                aria-label={
                  locked
                    ? `${item.date}, verrouillé`
                    : already
                      ? `${item.date}, ouvert`
                      : `${item.date}, cliquer`
                }
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
                  } ${tone.glow} ${locked ? "grayscale opacity-45" : isNext ? "hover:-translate-y-1" : ""}`}
                >
                  {already ? (
                    <Check className="mb-0.5 h-3.5 w-3.5 sm:h-5 sm:w-5" />
                  ) : locked ? (
                    <Lock className="mb-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  ) : null}
                  <span className="text-center text-[10px] font-bold leading-tight sm:text-xs">{item.shortDate}</span>
                  {isNext && (
                    <span className="mt-1 rounded-full bg-white/85 px-1.5 py-0.5 text-[8px] font-extrabold tracking-wide text-slate-900 uppercase sm:text-[10px]">
                      Cliquez
                    </span>
                  )}
                </span>
              </button>
              <span className="mt-2 flex h-8 items-start justify-center text-center text-[10px] font-semibold leading-tight text-slate-700 sm:text-[11px] dark:text-slate-200">
                {already || isNext ? item.label : "···"}
              </span>
            </li>
          );
        })}
      </ul>
      <div
        className={`flex min-h-40 flex-col justify-center rounded-xl border px-4 py-4 text-center sm:min-h-44 sm:px-5 ${
          activeTone ? activeTone.panel : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
        }`}
      >
        {active && activeTone ? (
          <div className="space-y-2">
            <p className={`text-sm font-bold sm:text-base ${activeTone.accent}`}>{active.date}</p>
            <p className="text-sm font-semibold text-slate-900 sm:text-base dark:text-white">{active.law}</p>
            <p className="text-sm leading-relaxed text-slate-700 sm:text-base dark:text-slate-200">{active.detail}</p>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-slate-500">
            Ouvrez les dates dans l&apos;ordre. L&apos;explication s&apos;affiche ici, toujours au même endroit.
          </p>
        )}
      </div>
    </div>
  );
}

const TETRIS_COLS = 8;
const TETRIS_ROWS = 12;
const TETRIS_FALL_MS = 1100;
const TETRIS_CELL_MAX = 28;
const TETRIS_CELL_MIN = 22;

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

const NEUTRAL_SHAPE = [
  [1, 1],
  [1, 1],
];
const NEUTRAL_TONE = "border-slate-500 bg-slate-400";

function tetrisToneClass(neutral: boolean, tone: number) {
  return neutral ? NEUTRAL_TONE : TETRIS_TONES[tone]!;
}

type TetrisCell = { tone: number; label: string; id: string; neutral: boolean };
type TetrisPiece = {
  id: string;
  label: string;
  tone: number;
  neutral: boolean;
  reflexIndex: number;
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
      const gutter = window.innerWidth < 640 ? 176 : 48;
      const available = Math.min(window.innerWidth - gutter, 240);
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
  const reflexes = activity.blocks.slice(0, 7);
  const drops = reflexes.map((block, index) => ({
    id: block.id,
    label: block.label,
    neutral: false,
    reflexIndex: index,
  }));
  const cell = useTetrisCellSize();
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameWidth, setFrameWidth] = useState(0);
  const [started, setStarted] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [board, setBoard] = useState<(TetrisCell | null)[][]>(() => emptyBoard());
  const [current, setCurrent] = useState<TetrisPiece | null>(null);
  const [lockedIds, setLockedIds] = useState<string[]>([]);
  const [sideLabels, setSideLabels] = useState<string[]>([]);
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
    const block = drops[index];
    if (!block) return null;
    const shape = block.neutral ? NEUTRAL_SHAPE : TETRIS_SHAPES[block.reflexIndex % TETRIS_SHAPES.length];
    if (!shape) return null;
    return {
      id: block.id,
      label: block.label,
      tone: block.neutral ? 0 : block.reflexIndex % TETRIS_TONES.length,
      neutral: block.neutral,
      reflexIndex: block.reflexIndex,
      shape,
      x: Math.max(0, Math.floor((TETRIS_COLS - (shape[0]?.length ?? 1)) / 2)),
      y: 0,
    };
  }

  function lockPiece(piece: TetrisPiece) {
    let nextBoard = boardRef.current.map((row) => [...row]);
    for (const cell of pieceCells(piece)) {
      if (cell.y < 0) continue;
      nextBoard[cell.y]![cell.x] = {
        tone: piece.tone,
        label: piece.label,
        id: piece.id,
        neutral: piece.neutral,
      };
    }
    nextBoard = clearLines(nextBoard);
    setBoard(nextBoard);
    boardRef.current = nextBoard;

    const nextLocked = lockedRef.current.includes(piece.id)
      ? lockedRef.current
      : [...lockedRef.current, piece.id];
    lockedRef.current = nextLocked;
    setLockedIds(nextLocked);
    if (!piece.neutral && piece.label) {
      setSideLabels((prev) => (prev.includes(piece.label) ? prev : [...prev, piece.label]));
    }

    const nextIndex = cursorRef.current + 1;
    if (nextIndex >= drops.length) {
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
    setSideLabels([]);
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

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => setFrameWidth(frame.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [cell, started]);

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
      } else if (event.key === "ArrowUp" || event.key === " " || event.key === "Enter") {
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
              className={`absolute rounded-md border-2 shadow-sm ${tetrisToneClass(piece.neutral, piece.tone)} ${
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
          <button
            type="button"
            aria-label="Tourner la pièce"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              tryRotate();
            }}
            className="absolute z-10 touch-manipulation"
            style={{
              left: bounds.left * cell,
              top: bounds.top * cell,
              width: (bounds.right - bounds.left) * cell,
              height: (bounds.bottom - bounds.top) * cell,
            }}
          />
        )}
      </Fragment>
    );
  }

  const controlBtn =
    "flex h-12 w-full touch-manipulation items-center justify-center rounded-xl border-2 border-slate-300 bg-white text-slate-900 shadow-sm active:scale-95 dark:border-slate-600 dark:bg-slate-900 dark:text-white";

  if (!started) {
    return (
      <div className="mx-auto w-full max-w-md space-y-5 px-1">
        <p className="text-center text-base font-semibold leading-snug text-slate-900 dark:text-white">
          Objectif : ranger le tableau proprement !
        </p>
        <div className="mx-auto w-fit max-w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-center text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Comment jouer
          </p>
          <ul className="mt-2.5 space-y-1.5 text-center text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            <li className="flex items-center justify-center gap-1.5">
              <span className="font-semibold text-slate-900 dark:text-white">Déplacer :</span>
              <ArrowLeft className="h-5 w-5 shrink-0 text-slate-900 dark:text-white" aria-hidden />
              <ArrowRight className="h-5 w-5 shrink-0 text-slate-900 dark:text-white" aria-hidden />
            </li>
            <li className="flex items-center justify-center gap-1.5">
              <span className="font-semibold text-slate-900 dark:text-white">Tourner :</span>
              <RotateCw className="h-5 w-5 shrink-0 text-slate-900 dark:text-white" aria-hidden />
              <span>ou Entrée ou Espace</span>
            </li>
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

  const sideItem =
    "flex items-start gap-1 rounded-lg border border-emerald-400 bg-emerald-50 px-1.5 py-1 text-left text-[10px] font-medium leading-snug break-words text-emerald-900 sm:text-[11px] dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-100";
  const playWidth = frameWidth || TETRIS_COLS * cell + 16;
  const lastSlot = reflexes.length - 1;

  function sideStyle(index: number) {
    const top = lastSlot <= 0 ? 0 : (index / lastSlot) * 100;
    const transform = index === 0 ? "translateY(0)" : index === lastSlot ? "translateY(-100%)" : "translateY(-50%)";
    return { top: `${top}%`, transform };
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-1">
      <div className="flex h-4 items-center justify-center gap-1.5">
        {reflexes.map((block, index) => (
          <span
            key={block.id}
            className={`h-2.5 w-2.5 rounded-full border ${TETRIS_TONES[index]!} ${
              lockedIds.includes(block.id)
                ? "opacity-100"
                : current && !current.neutral && current.reflexIndex === index
                  ? "ring-2 ring-blue-400 ring-offset-1 dark:ring-offset-slate-950"
                  : "opacity-35"
            }`}
            aria-label={`Réflexe ${index + 1}${lockedIds.includes(block.id) ? ", posé" : ""}`}
          />
        ))}
      </div>

      <div className="h-[4.75rem]" style={{ width: playWidth }}>
        {current && !current.neutral && !finished && (
          <div
            className={`flex h-full flex-col items-center justify-center rounded-2xl border-2 px-3 text-center shadow-sm ${TETRIS_TONES[current.tone]!}`}
          >
            <p className="text-center text-[10px] font-bold tracking-wide text-slate-900/70 uppercase">
              Pièce {current.reflexIndex + 1} / {reflexes.length}
            </p>
            <p className="mt-1 text-center text-[13px] font-bold leading-snug text-slate-950 sm:text-sm">{current.label}</p>
          </div>
        )}
      </div>

      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-2 sm:gap-3">
        <ul className="relative h-full min-w-0">
          {sideLabels.map((label, index) =>
            index % 2 === 0 ? (
              <li key={label} className={`${sideItem} absolute inset-x-0`} style={sideStyle(index)}>
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" aria-hidden />
                <span className="min-w-0">{label}</span>
              </li>
            ) : null,
          )}
        </ul>

        <div
          ref={frameRef}
          className="w-fit max-w-full shrink-0 overflow-hidden rounded-2xl border-2 border-slate-400 bg-slate-200 p-1.5 shadow-inner sm:rounded-3xl sm:p-2 dark:border-slate-600 dark:bg-slate-950"
        >
          <div
            className="relative touch-manipulation overflow-hidden bg-slate-800"
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
                    className={`absolute rounded-md border-2 shadow-sm ${tetrisToneClass(spot.neutral, spot.tone)}`}
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

        <ul className="relative h-full min-w-0">
          {sideLabels.map((label, index) =>
            index % 2 === 1 ? (
              <li key={label} className={`${sideItem} absolute inset-x-0`} style={sideStyle(index)}>
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" aria-hidden />
                <span className="min-w-0">{label}</span>
              </li>
            ) : null,
          )}
        </ul>
      </div>

      {!finished && (
        <div className="grid grid-cols-3 gap-1.5" style={{ width: playWidth }}>
          <button type="button" onClick={() => tryMove(-1, 0)} className={controlBtn} aria-label="Gauche">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => tryMove(0, 1)} className={controlBtn} aria-label="Descendre">
            <ArrowDown className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => tryMove(1, 0)} className={controlBtn} aria-label="Droite">
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

const DODGE_LANES = 5;
const DODGE_ROWS = 7;
const DODGE_CELL_W = 74;
const DODGE_CELL_H = 50;

type DodgeCube = { id: string; label: string; lane: number; y: number; good: boolean };

const DODGE_FALL = 1.65;
const DODGE_SPAWN = 1.15;
const DODGE_SLIDE = 6.2;
const DODGE_PLAYER = 34;
const DODGE_CUBE_W = 68;
const DODGE_CUBE_H = 46;

function dodgeHitsPlayer(y: number) {
  const cubeTop = y * DODGE_CELL_H + (DODGE_CELL_H - DODGE_CUBE_H) / 2;
  const playerTop = (DODGE_ROWS - 1) * DODGE_CELL_H + (DODGE_CELL_H - DODGE_PLAYER) / 2;
  return cubeTop + DODGE_CUBE_H > playerTop && cubeTop < playerTop + DODGE_PLAYER;
}

function dodgeOverlaps(playerX: number, lane: number) {
  const playerLeft = playerX * DODGE_CELL_W + (DODGE_CELL_W - DODGE_PLAYER) / 2;
  const cubeLeft = lane * DODGE_CELL_W + (DODGE_CELL_W - DODGE_CUBE_W) / 2;
  return playerLeft + DODGE_PLAYER > cubeLeft && playerLeft < cubeLeft + DODGE_CUBE_W;
}

function DodgeActivity({
  activity,
  onReady,
}: {
  activity: Extract<Activity, { kind: "dodge" }>;
  onReady: () => void;
}) {
  const [started, setStarted] = useState(false);
  const [playerX, setPlayerX] = useState(2);
  const [cubes, setCubes] = useState<DodgeCube[]>([]);
  const [caught, setCaught] = useState(0);
  const [dead, setDead] = useState(false);
  const [won, setWon] = useState(false);
  const [fail, setFail] = useState<"red" | "green" | null>(null);
  const xRef = useRef(2);
  const cubesRef = useRef<DodgeCube[]>([]);
  const caughtRef = useRef(0);
  const deckRef = useRef(activity.hazards);
  const deckIndexRef = useRef(0);
  const keys = useRef({ left: false, right: false });
  const onReadyRef = useRef(onReady);
  const greenGoal = activity.hazards.filter((item) => item.good).length;
  onReadyRef.current = onReady;

  function press(key: "left" | "right", down: boolean) {
    keys.current[key] = down;
  }

  function start() {
    const deck = [...activity.hazards];
    for (let index = deck.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      const current = deck[index]!;
      deck[index] = deck[swap]!;
      deck[swap] = current;
    }
    xRef.current = 2;
    cubesRef.current = [];
    caughtRef.current = 0;
    deckRef.current = deck;
    deckIndexRef.current = 0;
    keys.current = { left: false, right: false };
    setPlayerX(2);
    setCubes([]);
    setCaught(0);
    setFail(null);
    setDead(false);
    setWon(false);
    setStarted(true);
  }

  useEffect(() => {
    if (!started || dead || won) return;
    let last = performance.now();
    let sinceSpawn = 0.35;
    let frame = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      let x = xRef.current;
      if (keys.current.left) x -= DODGE_SLIDE * dt;
      if (keys.current.right) x += DODGE_SLIDE * dt;
      x = Math.max(0, Math.min(DODGE_LANES - 1, x));
      xRef.current = x;
      let next = cubesRef.current.map((cube) => ({ ...cube, y: cube.y + DODGE_FALL * dt }));
      const hits = next.filter((cube) => dodgeOverlaps(x, cube.lane) && dodgeHitsPlayer(cube.y));
      if (hits.some((cube) => !cube.good)) {
        cubesRef.current = next;
        setPlayerX(x);
        setCubes(next);
        setFail("red");
        setDead(true);
        return;
      }
      if (hits.length > 0) {
        const ids = new Set(hits.map((cube) => cube.id));
        next = next.filter((cube) => !ids.has(cube.id));
        caughtRef.current += hits.length;
        setCaught(caughtRef.current);
      }
      const passed = next.filter((cube) => cube.y >= DODGE_ROWS);
      if (passed.some((cube) => cube.good)) {
        cubesRef.current = next;
        setPlayerX(x);
        setCubes(next);
        setFail("green");
        setDead(true);
        return;
      }
      next = next.filter((cube) => cube.y < DODGE_ROWS);
      sinceSpawn += dt;
      const deck = deckRef.current;
      if (sinceSpawn >= DODGE_SPAWN && next.length < 3 && deckIndexRef.current < deck.length) {
        sinceSpawn = 0;
        const entry = deck[deckIndexRef.current];
        deckIndexRef.current += 1;
        if (entry) {
          const busy = new Set(next.filter((cube) => cube.y < 1.4).map((cube) => cube.lane));
          const open = Array.from({ length: DODGE_LANES }, (_, index) => index).filter((index) => !busy.has(index));
          const choices = open.length > 0 ? open : Array.from({ length: DODGE_LANES }, (_, index) => index);
          const dropLane = choices[Math.floor(Math.random() * choices.length)] ?? 0;
          next.push({
            id: `cube-${deckIndexRef.current}`,
            label: entry.label,
            lane: dropLane,
            y: -1,
            good: Boolean(entry.good),
          });
        }
      }
      cubesRef.current = next;
      setPlayerX(x);
      setCubes(next);
      if (deckIndexRef.current >= deck.length && next.length === 0 && caughtRef.current >= greenGoal) {
        setWon(true);
        onReadyRef.current();
        return;
      }
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frame);
  }, [started, dead, won]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const down = event.type === "keydown";
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      if (event.repeat) return;
      press(event.key === "ArrowLeft" ? "left" : "right", down);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, []);

  const controlBtn =
    "flex h-12 w-full touch-none items-center justify-center rounded-xl border-2 border-slate-300 bg-white text-slate-900 shadow-sm select-none active:scale-95 dark:border-slate-600 dark:bg-slate-900 dark:text-white";
  const fieldWidth = DODGE_LANES * DODGE_CELL_W;

  if (!started) {
    return (
      <div className="mx-auto w-full max-w-md space-y-5 px-1">
        <p className="whitespace-pre-line text-center text-base font-semibold leading-snug text-slate-900 dark:text-white">
          {activity.intro}
        </p>
        <div className="mx-auto w-fit max-w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-center text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Comment jouer
          </p>
          <ul className="mt-2.5 space-y-1.5 text-center text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            <li className="flex items-center justify-center gap-1.5">
              <span className="font-semibold text-slate-900 dark:text-white">Déplacer :</span>
              <ArrowLeft className="h-5 w-5 shrink-0 text-slate-900 dark:text-white" aria-hidden />
              <ArrowRight className="h-5 w-5 shrink-0 text-slate-900 dark:text-white" aria-hidden />
            </li>
            <li className="text-center">Rouge : esquiver.</li>
            <li className="text-center">Vert : attraper.</li>
          </ul>
        </div>
        <div className="flex justify-center pb-2">
          <button
            type="button"
            onClick={start}
            className="w-full max-w-xs touch-manipulation rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] sm:w-auto sm:py-3.5 sm:text-sm"
          >
            Départ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center space-y-3">
      <p className="text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
        {caught} / {greenGoal} verts
      </p>
      <div
        className="relative overflow-hidden rounded-2xl border-2 border-slate-400 bg-slate-800 shadow-inner"
        style={{ width: fieldWidth, height: DODGE_ROWS * DODGE_CELL_H }}
      >
        {cubes.map((cube) => (
          <div
            key={cube.id}
            className={`absolute flex items-center justify-center overflow-hidden rounded-md border-2 px-0.5 text-center text-[11px] leading-tight font-bold break-words will-change-transform ${
              cube.good
                ? "border-emerald-700 bg-emerald-400 text-emerald-950"
                : "border-rose-700 bg-rose-400 text-rose-950"
            }`}
            style={{
              width: DODGE_CUBE_W,
              height: DODGE_CUBE_H,
              transform: `translate3d(${cube.lane * DODGE_CELL_W + (DODGE_CELL_W - DODGE_CUBE_W) / 2}px, ${cube.y * DODGE_CELL_H + (DODGE_CELL_H - DODGE_CUBE_H) / 2}px, 0)`,
            }}
          >
            <span className="text-center">{cube.label}</span>
          </div>
        ))}
        <div
          className="absolute flex items-center justify-center rounded-full border-2 border-sky-100 bg-sky-600 text-white shadow-md will-change-transform"
          style={{
            width: DODGE_PLAYER,
            height: DODGE_PLAYER,
            transform: `translate3d(${playerX * DODGE_CELL_W + (DODGE_CELL_W - DODGE_PLAYER) / 2}px, ${(DODGE_ROWS - 1) * DODGE_CELL_H + (DODGE_CELL_H - DODGE_PLAYER) / 2}px, 0)`,
          }}
        >
          <User className="h-5 w-5" aria-label="Vous" />
        </div>
      </div>
      {!dead && !won && (
        <div className="grid grid-cols-2 gap-1.5" style={{ width: fieldWidth }}>
          <button
            type="button"
            className={controlBtn}
            aria-label="Gauche"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              press("left", true);
            }}
            onPointerUp={() => press("left", false)}
            onPointerCancel={() => press("left", false)}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className={controlBtn}
            aria-label="Droite"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              press("right", true);
            }}
            onPointerUp={() => press("right", false)}
            onPointerCancel={() => press("right", false)}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
      {dead && (
        <div className="mx-auto w-full max-w-lg space-y-3">
          <Feedback
            text={
              fail === "green"
                ? "Un vert est passé. Ce sont les réflexes à garder."
                : "Touché. Le rouge, on l'esquive."
            }
          />
          <div className="flex justify-center">
            <button
              type="button"
              onClick={start}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Recommencer
            </button>
          </div>
        </div>
      )}
      {won && (
        <div
          className="rounded-2xl border-2 border-blue-400 bg-blue-50 px-3 py-4 text-center shadow-lg shadow-blue-500/15 dark:border-blue-500 dark:bg-blue-950/60"
          style={{ width: fieldWidth }}
        >
          <p className="text-center text-xs font-bold tracking-[0.16em] text-blue-700 uppercase dark:text-blue-300">
            À retenir
          </p>
          <div className="mt-3 flex items-start gap-2 text-center text-[11px] font-semibold leading-snug">
            <ul className="grid min-w-0 flex-[1.2] grid-cols-2 gap-x-2 gap-y-1.5">
              {activity.hazards
                .filter((item) => !item.good)
                .map((item) => (
                  <li key={item.id} className="text-center text-rose-700 dark:text-rose-300">
                    {item.label}
                  </li>
                ))}
            </ul>
            <ul className="flex min-w-0 flex-1 flex-col gap-y-1.5 border-l border-blue-200 pl-2 dark:border-blue-800">
              {activity.hazards
                .filter((item) => item.good)
                .map((item) => (
                  <li key={item.id} className="text-center text-emerald-700 dark:text-emerald-300">
                    {item.label}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function GameBriefing({ text, children }: { text?: string; children: ReactNode }) {
  const [ready, setReady] = useState(!text);
  if (!text || ready) return <>{children}</>;
  return (
    <div className="mx-auto max-w-lg space-y-5 px-1 text-center">
      <p className="text-center text-xs font-bold tracking-[0.16em] text-blue-700 uppercase dark:text-blue-300">
        Avant de jouer
      </p>
      <p className="text-center text-lg font-semibold leading-relaxed text-slate-900 sm:text-xl dark:text-white">
        {text}
      </p>
      <button
        type="button"
        onClick={() => setReady(true)}
        className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        C&apos;est parti
      </button>
    </div>
  );
}

function activityBriefing(activity: Activity): string | undefined {
  switch (activity.kind) {
    case "quiz":
    case "sort":
    case "stamp":
    case "scenario":
    case "predict":
    case "spot":
    case "redact":
    case "timeline":
    case "tetris":
      return activity.briefing;
    default:
      return undefined;
  }
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
  const briefing = activityBriefing(activity);
  if (activity.kind === "video") {
    return (
      <>
        <VideoScript
          format={activity.format}
          duration={duration}
          script={activity.script}
          src={activity.src}
        />
        <ReadyOnce onReady={onReady} />
      </>
    );
  }
  if (activity.kind === "text" || activity.kind === "fiche") {
    return <TextActivity activity={activity} onReady={onReady} />;
  }
  if (activity.kind === "quiz") {
    return (
      <GameBriefing text={briefing}>
        <QuizActivity questions={activity.questions} onReady={onReady} />
      </GameBriefing>
    );
  }
  if (activity.kind === "sort") {
    return (
      <GameBriefing text={briefing}>
        <SortActivity activity={activity} onReady={onReady} />
      </GameBriefing>
    );
  }
  if (activity.kind === "stamp") {
    return (
      <GameBriefing text={briefing}>
        <StampActivity activity={activity} onReady={onReady} />
      </GameBriefing>
    );
  }
  if (activity.kind === "scenario") {
    return (
      <GameBriefing text={briefing}>
        <ScenarioActivity steps={activity.steps} onReady={onReady} />
      </GameBriefing>
    );
  }
  if (activity.kind === "checklist") {
    return <ChecklistActivity intro={activity.intro} items={activity.items} centered={activity.centered} onReady={onReady} />;
  }
  if (activity.kind === "predict") {
    return (
      <GameBriefing text={briefing}>
        <PredictActivity activity={activity} onReady={onReady} />
      </GameBriefing>
    );
  }
  if (activity.kind === "spot") {
    return (
      <GameBriefing text={briefing}>
        <SpotActivity activity={activity} onReady={onReady} />
      </GameBriefing>
    );
  }
  if (activity.kind === "redact") {
    return (
      <GameBriefing text={briefing}>
        <RedactActivity activity={activity} onReady={onReady} />
      </GameBriefing>
    );
  }
  if (activity.kind === "traffic") return <TrafficActivity items={activity.items} onReady={onReady} />;
  if (activity.kind === "tetris") {
    return (
      <GameBriefing text={briefing}>
        <TetrisActivity activity={activity} onReady={onReady} />
      </GameBriefing>
    );
  }
  if (activity.kind === "dodge") return <DodgeActivity activity={activity} onReady={onReady} />;
  return (
    <GameBriefing text={briefing}>
      <TimelineActivity items={activity.items} onReady={onReady} />
    </GameBriefing>
  );
}
