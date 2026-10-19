"use client";

import { useState } from "react";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { CAREER_PATHS } from "@/lib/formation/careers";

const CAREER_CARD_STYLE: Record<
  string,
  { emoji: string; card: string; selected: string }
> = {
  direction: {
    emoji: "🏛️",
    card: "border-violet-200 bg-violet-50/80 hover:border-violet-400 hover:bg-violet-100/80 dark:border-violet-800 dark:bg-violet-950/30 dark:hover:border-violet-600",
    selected:
      "border-violet-500 bg-violet-100 ring-2 ring-violet-300/60 dark:border-violet-400 dark:bg-violet-950/50 dark:ring-violet-700",
  },
  rh: {
    emoji: "🤝",
    card: "border-rose-200 bg-rose-50/80 hover:border-rose-400 hover:bg-rose-100/80 dark:border-rose-800 dark:bg-rose-950/30 dark:hover:border-rose-600",
    selected:
      "border-rose-500 bg-rose-100 ring-2 ring-rose-300/60 dark:border-rose-400 dark:bg-rose-950/50 dark:ring-rose-700",
  },
  marketing: {
    emoji: "📣",
    card: "border-orange-200 bg-orange-50/80 hover:border-orange-400 hover:bg-orange-100/80 dark:border-orange-800 dark:bg-orange-950/30 dark:hover:border-orange-600",
    selected:
      "border-orange-500 bg-orange-100 ring-2 ring-orange-300/60 dark:border-orange-400 dark:bg-orange-950/50 dark:ring-orange-700",
  },
  managers: {
    emoji: "🧭",
    card: "border-sky-200 bg-sky-50/80 hover:border-sky-400 hover:bg-sky-100/80 dark:border-sky-800 dark:bg-sky-950/30 dark:hover:border-sky-600",
    selected:
      "border-sky-500 bg-sky-100 ring-2 ring-sky-300/60 dark:border-sky-400 dark:bg-sky-950/50 dark:ring-sky-700",
  },
  tech: {
    emoji: "💻",
    card: "border-emerald-200 bg-emerald-50/80 hover:border-emerald-400 hover:bg-emerald-100/80 dark:border-emerald-800 dark:bg-emerald-950/30 dark:hover:border-emerald-600",
    selected:
      "border-emerald-500 bg-emerald-100 ring-2 ring-emerald-300/60 dark:border-emerald-400 dark:bg-emerald-950/50 dark:ring-emerald-700",
  },
  finance: {
    emoji: "💶",
    card: "border-teal-200 bg-teal-50/80 hover:border-teal-400 hover:bg-teal-100/80 dark:border-teal-800 dark:bg-teal-950/30 dark:hover:border-teal-600",
    selected:
      "border-teal-500 bg-teal-100 ring-2 ring-teal-300/60 dark:border-teal-400 dark:bg-teal-950/50 dark:ring-teal-700",
  },
  support: {
    emoji: "🎧",
    card: "border-cyan-200 bg-cyan-50/80 hover:border-cyan-400 hover:bg-cyan-100/80 dark:border-cyan-800 dark:bg-cyan-950/30 dark:hover:border-cyan-600",
    selected:
      "border-cyan-500 bg-cyan-100 ring-2 ring-cyan-300/60 dark:border-cyan-400 dark:bg-cyan-950/50 dark:ring-cyan-700",
  },
  tous: {
    emoji: "✨",
    card: "border-slate-200 bg-slate-50/90 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-slate-500",
    selected:
      "border-slate-500 bg-slate-100 ring-2 ring-slate-300/60 dark:border-slate-400 dark:bg-slate-800 dark:ring-slate-600",
  },
  "expert-comptable": {
    emoji: "📊",
    card: "border-indigo-200 bg-indigo-50/80 hover:border-indigo-400 hover:bg-indigo-100/80 dark:border-indigo-800 dark:bg-indigo-950/30 dark:hover:border-indigo-600",
    selected:
      "border-indigo-500 bg-indigo-100 ring-2 ring-indigo-300/60 dark:border-indigo-400 dark:bg-indigo-950/50 dark:ring-indigo-700",
  },
  immobilier: {
    emoji: "🏠",
    card: "border-amber-200 bg-amber-50/80 hover:border-amber-400 hover:bg-amber-100/80 dark:border-amber-800 dark:bg-amber-950/30 dark:hover:border-amber-600",
    selected:
      "border-amber-500 bg-amber-100 ring-2 ring-amber-300/60 dark:border-amber-400 dark:bg-amber-950/50 dark:ring-amber-700",
  },
};

const TRAFFIC_STYLE = {
  green: {
    label: "Vert",
    box: "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40",
    tag: "bg-emerald-500 text-white",
  },
  orange: {
    label: "Orange",
    box: "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40",
    tag: "bg-amber-500 text-white",
  },
  red: {
    label: "Rouge",
    box: "border-rose-300 bg-rose-50 dark:border-rose-700 dark:bg-rose-950/40",
    tag: "bg-rose-500 text-white",
  },
} as const;

export default function CareerScreen({
  selected,
  onBack,
  onSelect,
}: {
  selected: string | null;
  onBack: () => void;
  onSelect: (id: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [openCases, setOpenCases] = useState<Record<number, boolean>>({});
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([null, null, null]);
  const [quizRevealed, setQuizRevealed] = useState<boolean[]>([false, false, false]);
  const path = CAREER_PATHS.find((item) => item.id === openId) ?? null;
  const quizDone = quizAnswers.every((answer) => answer !== null);
  const quizScore = quizAnswers.reduce<number>((score, answer, index) => {
    if (answer === null || !path) return score;
    return score + (answer === path.quiz[index]?.correctIndex ? 1 : 0);
  }, 0);

  const careerChoices = (() => {
    const others = CAREER_PATHS.find((item) => item.id === "tous");
    const immo = CAREER_PATHS.find((item) => item.id === "immobilier");
    const main = CAREER_PATHS.filter(
      (item) => item.id !== "tous" && item.id !== "immobilier",
    );
    const tail = [immo, others].filter(Boolean) as typeof CAREER_PATHS;
    return [...main, ...tail];
  })();

  function openPath(id: string) {
    setOpenId(id);
    setOpenCases({});
    setQuizAnswers([null, null, null]);
    setQuizRevealed([false, false, false]);
  }

  if (!path) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-200 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <div>
          <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">
            Fiches métiers
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-500">
            Choisissez le module le plus proche de votre métier : environ 5 minutes, avec
            situations, cas pratiques et un mini-quiz.
          </p>
        </div>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {careerChoices.map((item) => {
            const style = CAREER_CARD_STYLE[item.id] ?? CAREER_CARD_STYLE.tous!;
            const isSelected = selected === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => openPath(item.id)}
                  className={`w-full rounded-xl border px-4 py-3.5 text-center shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md ${
                    isSelected ? style.selected : style.card
                  }`}
                >
                  <span className="mb-1 block text-lg leading-none" aria-hidden>
                    {style.emoji}
                  </span>
                  <p className="text-center text-sm font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mx-auto flex max-w-sm flex-col items-center rounded-xl border border-teal-300 bg-teal-50/80 px-4 py-3 text-center dark:border-teal-700 dark:bg-teal-950/40">
          <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
            <Sparkles className="h-3 w-3" aria-hidden />
            Option
          </p>
          <p className="mt-1 w-full text-center text-sm font-semibold leading-snug text-slate-900 dark:text-white">
            Module métier sur mesure, propre à votre fonction
          </p>
          <p className="mt-1 w-full text-center text-xs leading-snug text-slate-600 dark:text-slate-300">
            Texte, cas pratique et idée d&apos;usage rédigés pour votre métier, si votre entreprise le
            propose.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <button
        type="button"
        onClick={() => {
          setOpenId(null);
          setOpenCases({});
          setQuizAnswers([null, null, null]);
          setQuizRevealed([false, false, false]);
        }}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-200 hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Tous les parcours
      </button>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{path.title}</h1>
        <p className="mt-1 text-center text-sm text-slate-500">{path.focus}</p>
      </div>

      <section className="rounded-2xl border border-amber-200/80 bg-amber-50/60 px-5 py-4 dark:border-amber-800/60 dark:bg-amber-950/25">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
          1 · Pourquoi ce métier est exposé
        </p>
        <p className="mt-3 text-center text-sm leading-relaxed text-slate-800 dark:text-slate-100">
          {path.whyExposed}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
          2 · Ce qui ne va jamais dans une IA grand public
        </p>
        <p className="mt-1 text-center text-[11px] italic text-slate-400 dark:text-slate-500">
          Liste non exhaustive
        </p>
        <ul className="mt-3 space-y-2">
          {path.neverList.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2 text-left text-sm text-slate-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-slate-100"
            >
              <span className="mt-0.5 font-bold text-rose-600 dark:text-rose-400" aria-hidden>
                ✕
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
          3 · Feu tricolore
        </p>
        <ul className="mt-3 space-y-2.5">
          {path.traffic.map((item) => {
            const style = TRAFFIC_STYLE[item.level];
            return (
              <li key={item.situation} className={`rounded-xl border px-3 py-3 ${style.box}`}>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.tag}`}
                >
                  {style.label}
                </span>
                <p className="mt-2 text-sm font-semibold leading-snug text-slate-900 dark:text-white">
                  {item.situation}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {item.explanation}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
          4 · Trois cas pratiques
        </p>
        <ul className="mt-3 space-y-2.5">
          {path.cases.map((item, index) => {
            const open = openCases[index] === true;
            return (
              <li
                key={item.situation}
                className="rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <button
                  type="button"
                  onClick={() => setOpenCases((current) => ({ ...current, [index]: !open }))}
                  className="w-full px-3 py-3 text-left"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300">
                    Cas {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-medium leading-snug text-slate-900 dark:text-white">
                    {item.situation}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {open ? "Masquer la bonne conduite" : "Voir la bonne conduite"}
                  </p>
                </button>
                {open && (
                  <p className="border-t border-slate-200 px-3 py-3 text-sm leading-relaxed text-slate-700 dark:border-slate-700 dark:text-slate-200">
                    {item.answer}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-2xl border-2 border-teal-300 bg-teal-50 px-5 py-4 dark:border-teal-600 dark:bg-teal-950/40">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
          5 · Trois idées d&apos;usage
        </p>
        <ul className="mt-3 space-y-2">
          {path.tips.map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-2 text-left text-sm leading-relaxed text-slate-800 dark:text-slate-100"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-300"
                aria-hidden
              />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
          6 · Quiz validé
        </p>
        <p className="mt-1 text-center text-xs text-slate-500">
          3 questions · le score figure sur le suivi
        </p>
        <ul className="mt-4 space-y-4">
          {path.quiz.map((question, qIndex) => {
            const picked = quizAnswers[qIndex];
            const revealed = quizRevealed[qIndex];
            return (
              <li
                key={question.prompt}
                className="rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-700"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Q{qIndex + 1}. {question.prompt}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {question.choices.map((choice, cIndex) => {
                    const isPicked = picked === cIndex;
                    const isCorrect = cIndex === question.correctIndex;
                    let optionClass =
                      "border-slate-200 bg-slate-50 hover:border-teal-400 dark:border-slate-600 dark:bg-slate-800";
                    if (revealed) {
                      if (isCorrect) {
                        optionClass =
                          "border-teal-500 bg-teal-50 dark:border-teal-400 dark:bg-teal-950/50";
                      } else if (isPicked) {
                        optionClass =
                          "border-rose-400 bg-rose-50 dark:border-rose-500 dark:bg-rose-950/40";
                      } else {
                        optionClass =
                          "border-slate-200 bg-slate-50 opacity-50 dark:border-slate-700 dark:bg-slate-800";
                      }
                    } else if (isPicked) {
                      optionClass =
                        "border-teal-500 bg-teal-50 dark:border-teal-400 dark:bg-teal-950/40";
                    }
                    return (
                      <li key={choice}>
                        <button
                          type="button"
                          disabled={revealed}
                          onClick={() => {
                            setQuizAnswers((current) => {
                              const next = [...current];
                              next[qIndex] = cIndex;
                              return next;
                            });
                            setQuizRevealed((current) => {
                              const next = [...current];
                              next[qIndex] = true;
                              return next;
                            });
                          }}
                          className={`w-full rounded-lg border px-3 py-2 text-left text-sm leading-snug text-slate-800 transition disabled:cursor-default dark:text-slate-100 ${optionClass}`}
                        >
                          <span className="mr-1.5 font-bold text-slate-500">
                            {String.fromCharCode(65 + cIndex)}.
                          </span>
                          {choice}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {revealed && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {picked === question.correctIndex ? "Bien vu. " : "Pas celle-là. "}
                    {question.why}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        {quizDone && (
          <p className="mt-4 text-center text-sm font-semibold text-teal-700 dark:text-teal-300">
            Score : {quizScore}/3
          </p>
        )}
      </section>

      {quizDone && (
        <div className="space-y-3 pb-4">
          {!selected && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onSelect(path.id)}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Valider le parcours
                <Check className="h-4 w-4" />
              </button>
            </div>
          )}
          {selected === path.id && (
            <p className="text-center text-sm font-medium text-teal-700 dark:text-teal-300">
              Parcours validé — la carte est verte sur l&apos;accueil.
            </p>
          )}
          {selected && selected !== path.id && (
            <p className="text-center text-sm text-slate-500">
              Un parcours est déjà validé. Le socle ne se complète qu&apos;avec un seul métier.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
