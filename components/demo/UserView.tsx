"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Check,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  MessageSquareWarning,
  FileText,
  Landmark,
  Mail,
  Lightbulb,
} from "lucide-react";
import { curriculum, pathSteps } from "./data";

function Journey({ active, percent }: { active: number; percent: number }) {
  return (
    <div className="mx-auto flex w-full max-w-lg items-start gap-3">
      <div className="relative flex flex-1 items-start justify-between">
        <div className="absolute left-5 right-5 top-4 border-t-2 border-dashed border-violet-200 dark:border-violet-900" />
        {pathSteps.map((item, index) => {
          const diploma = item.state === "diploma";
          const done = index < active;
          const current = index === active;
          return (
            <div key={item.label} className="relative flex w-14 flex-col items-center gap-1.5">
              <span
                title={item.title}
                className={`relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? "bg-emerald-500 text-white"
                    : current
                      ? "bg-violet-600 text-white ring-4 ring-violet-200 dark:ring-violet-900"
                      : diploma
                        ? "border-2 border-dashed border-amber-300 bg-amber-50 text-amber-500 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        : "border-2 border-slate-200 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800"
                }`}
              >
                {current ? <span className="absolute inset-0 animate-ping rounded-full bg-violet-400/40" /> : null}
                {done ? <Check className="h-3.5 w-3.5" /> : diploma ? <Award className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span className={`text-[11px] font-semibold ${current ? "text-violet-700 dark:text-violet-300" : done ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
      <span className="flex h-8 shrink-0 items-center text-sm font-bold tabular-nums text-violet-700 dark:text-violet-300">
        {percent} %
      </span>
    </div>
  );
}

const promptCards = [
  { id: "mail", label: "Réécris ce mail en plus clair", ok: true, icon: Mail },
  { id: "rib", label: "Le RIB du client Dupont", ok: false, icon: Landmark },
  { id: "guide", label: "Résume notre guide public", ok: true, icon: FileText },
  { id: "marge", label: "Marge du contrat Martin : 18 %", ok: false, icon: ShieldAlert },
];

const checkChoices = [
  { label: "Je le copie tel quel dans le devis", ok: false },
  { label: "Je vérifie la source avant de m'en servir", ok: true },
  { label: "Je l'envoie au client : l'IA ne se trompe jamais", ok: false },
];

function Fireworks() {
  const bursts = [
    { x: "18%", y: "28%", color: "#a78bfa", delay: 0 },
    { x: "78%", y: "22%", color: "#34d399", delay: 0.12 },
    { x: "52%", y: "18%", color: "#fbbf24", delay: 0.05 },
    { x: "32%", y: "55%", color: "#60a5fa", delay: 0.2 },
    { x: "68%", y: "50%", color: "#f472b6", delay: 0.15 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {bursts.map((burst, i) => (
        <span key={i} className="absolute" style={{ left: burst.x, top: burst.y }}>
          {Array.from({ length: 8 }).map((_, j) => {
            const angle = (j / 8) * Math.PI * 2;
            return (
              <motion.span
                key={j}
                className="absolute h-2 w-2 rounded-full"
                style={{ backgroundColor: burst.color }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(angle) * 56,
                  y: Math.sin(angle) * 56,
                  opacity: 0,
                  scale: 0.3,
                }}
                transition={{ duration: 0.9, delay: burst.delay, ease: "easeOut" }}
              />
            );
          })}
        </span>
      ))}
    </div>
  );
}

function LessonPhase({
  moduleId,
  title,
  summary,
  onContinue,
}: {
  moduleId: string;
  title: string;
  summary: string;
  onContinue: () => void;
}) {
  return (
    <motion.div
      key="lesson"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="mt-6 overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-b from-violet-50/80 to-white dark:border-violet-900/50 dark:from-violet-950/40 dark:to-slate-900"
    >
      <div className="relative border-b border-violet-100 px-5 py-5 text-center dark:border-violet-900/40 sm:px-7 sm:py-6">
        <div className="pointer-events-none absolute -right-6 -top-10 h-36 w-36 rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-600/20" />
        <div className="relative flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-violet-600 px-2.5 py-1 text-[11px] font-bold text-white">
            Leçon {moduleId}
          </span>
          <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-200 dark:bg-slate-800 dark:text-violet-300 dark:ring-violet-800">
            ~2 min
          </span>
        </div>
        <h3 className="relative mt-3 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          {title}
        </h3>
        <p className="relative mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {summary}
        </p>
      </div>

      <div className="space-y-4 px-5 py-5 text-center sm:px-7 sm:py-6">
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3.5 dark:border-amber-800/50 dark:bg-amber-950/30">
          <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300">
            <Lightbulb className="h-5 w-5 shrink-0" />
            <p className="text-xs font-bold uppercase tracking-wider">L&apos;idée clé</p>
          </div>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-100">
            Tout ce que vous collez dans une IA peut sortir de l&apos;entreprise. Anonymisez d&apos;abord, générez ensuite.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900/50 dark:bg-rose-950/25">
            <div className="flex items-center justify-center gap-2 text-rose-700 dark:text-rose-300">
              <ShieldAlert className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wider">À éviter</p>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <li className="flex items-center justify-center gap-2">
                <span className="font-bold text-rose-500">×</span>
                Noms, RIB, emails clients
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="font-bold text-rose-500">×</span>
                Marges, contrats, secrets
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="font-bold text-rose-500">×</span>
                Documents internes bruts
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/25">
            <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wider">Autorisé</p>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <li className="flex items-center justify-center gap-2">
                <span className="font-bold text-emerald-500">✓</span>
                Textes anonymisés
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="font-bold text-emerald-500">✓</span>
                Contenu déjà public
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="font-bold text-emerald-500">✓</span>
                Idées &amp; reformulations
              </li>
            </ul>
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-700 sm:w-auto"
        >
          Passer à l&apos;exercice
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </button>
      </div>
    </motion.div>
  );
}

function GamePhase({
  picked,
  setPicked,
  gameNote,
  success,
  score,
  onValidate,
}: {
  picked: string[];
  setPicked: Dispatch<SetStateAction<string[]>>;
  gameNote: string;
  success: boolean;
  score: number;
  onValidate: () => void;
}) {
  const selected = promptCards.filter((card) => picked.includes(card.id));

  return (
    <motion.div
      key="game"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="relative mt-6 space-y-4"
    >
      <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-600 to-indigo-700 px-5 py-5 text-center text-white shadow-lg shadow-violet-600/20 dark:from-violet-700 dark:to-indigo-900 sm:px-6">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
          <Sparkles className="h-5 w-5" />
        </span>
        <p className="mt-3 pl-[0.2em] text-xs font-bold uppercase tracking-[0.2em] text-violet-100">
          Exercice interactif
        </p>
        <h3 className="mt-1 text-lg font-bold">Composez un prompt sans risque</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-violet-100/90">
          Sélectionnez uniquement ce qui peut être envoyé à une IA. Les données sensibles restent dehors.
        </p>
      </div>

      <div className="relative">
        <div className={`space-y-4 transition ${success ? "pointer-events-none select-none blur-[2px] opacity-40" : ""}`}>
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-center shadow-inner dark:border-slate-700">
            <div className="mb-2 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Votre prompt
            </div>
            <div className="min-h-[4.5rem] rounded-xl border border-slate-700 bg-slate-950/80 p-3">
              {selected.length === 0 ? (
                <p className="text-sm text-slate-500">Touchez les cartes ci-dessous pour construire votre prompt…</p>
              ) : (
                <div className="flex flex-wrap justify-center gap-2">
                  {selected.map((card) => (
                    <span
                      key={card.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/40"
                    >
                      {card.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {promptCards.map((card, index) => {
              const on = picked.includes(card.id);
              const Icon = card.icon;
              return (
                <motion.button
                  key={card.id}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() =>
                    setPicked((current) =>
                      current.includes(card.id) ? current.filter((id) => id !== card.id) : [...current, card.id],
                    )
                  }
                  className={`group rounded-2xl border p-4 text-center transition ${
                    on
                      ? "border-violet-500 bg-violet-50 shadow-md shadow-violet-500/10 dark:border-violet-400 dark:bg-violet-950/40"
                      : "border-slate-200 bg-white hover:border-violet-300 hover:shadow-sm dark:border-slate-600 dark:bg-slate-900 dark:hover:border-violet-700"
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        on
                          ? "bg-violet-600 text-white"
                          : "bg-slate-100 text-slate-500 group-hover:bg-violet-100 group-hover:text-violet-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{card.label}</p>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        on
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {on ? <Check className="h-3 w-3" /> : null}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {gameNote ? (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
            >
              {gameNote}
            </motion.p>
          ) : null}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={onValidate}
              disabled={picked.length === 0 || success}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              Valider mon prompt
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-10 flex items-center justify-center p-3"
            >
              <div className="relative flex w-full max-w-sm flex-col items-center overflow-hidden rounded-2xl border border-emerald-200 bg-white/95 px-6 py-8 text-center shadow-xl backdrop-blur dark:border-emerald-800 dark:bg-slate-900/95">
                <Fireworks />
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                >
                  <Check className="h-7 w-7" strokeWidth={2.5} />
                </motion.div>
                <p className="relative mt-3 w-full text-center text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300" style={{ paddingLeft: "0.2em" }}>
                  Bravo !
                </p>
                <p className="relative mt-2 w-full text-center text-4xl font-black tabular-nums text-slate-900 dark:text-white">
                  {score}&nbsp;%
                </p>
                <p className="relative mt-2 w-full text-center text-sm text-slate-500 dark:text-slate-400">Prompt sécurisé validé</p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function EvalPhase({
  answerNote,
  success,
  onAnswer,
}: {
  answerNote: string;
  success: boolean;
  onAnswer: (ok: boolean) => void;
}) {
  return (
    <motion.div
      key="eval"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="relative mt-6"
    >
      <div
        className={`rounded-2xl border border-slate-200 bg-white p-5 text-center transition dark:border-slate-700 dark:bg-slate-900 sm:p-6 ${
          success ? "pointer-events-none select-none blur-[2px] opacity-40" : ""
        }`}
      >
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300">
          <MessageSquareWarning className="h-4 w-4" />
          Mini-évaluation
        </div>
        <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
          L&apos;IA vous sort un chiffre pour un devis. Vous…
        </h3>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Réponse de l&apos;IA</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            « D&apos;après mes estimations, le devis devrait se situer autour de{" "}
            <span className="font-bold text-violet-600 dark:text-violet-300">4 280 €</span> HT. »
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {checkChoices.map((choice) => (
            <button
              key={choice.label}
              type="button"
              onClick={() => onAnswer(choice.ok)}
              disabled={success}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-center text-sm font-medium text-slate-700 transition hover:border-violet-400 hover:bg-violet-50 hover:text-violet-900 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-violet-500 dark:hover:bg-violet-950/40"
            >
              {choice.label}
            </button>
          ))}
        </div>

        {answerNote ? (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {answerNote}
          </p>
        ) : null}
      </div>

      <AnimatePresence>
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-10 flex items-center justify-center p-3"
          >
            <div className="relative flex w-full max-w-sm flex-col items-center overflow-hidden rounded-2xl border border-emerald-200 bg-white/95 px-6 py-8 text-center shadow-xl backdrop-blur dark:border-emerald-800 dark:bg-slate-900/95">
              <Fireworks />
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
              >
                <Check className="h-7 w-7" strokeWidth={2.5} />
              </motion.div>
              <p className="relative mt-3 w-full text-center text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300" style={{ paddingLeft: "0.2em" }}>
                Succès !
              </p>
              <p className="relative mt-2 w-full text-center text-sm text-slate-500 dark:text-slate-400">Bonne réponse — on continue</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export default function UserView() {
  const [chapter, setChapter] = useState(1);
  const [moduleIndex, setModuleIndex] = useState(1);
  const [quizDone, setQuizDone] = useState(false);
  const [phase, setPhase] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [gameNote, setGameNote] = useState("");
  const [gameSuccess, setGameSuccess] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [answerNote, setAnswerNote] = useState("");
  const [evalSuccess, setEvalSuccess] = useState(false);

  const contentDone = chapter >= curriculum.length;
  const active = quizDone ? pathSteps.length - 1 : contentDone ? 3 : chapter;
  const doneModules = Math.min(chapter, curriculum.length) * 3 + (contentDone ? 0 : moduleIndex);
  const percent = quizDone ? 100 : Math.round((doneModules / 10) * 100);
  const currentChapter = curriculum[chapter];

  useEffect(() => {
    if (!gameSuccess) return;
    const timer = window.setTimeout(() => {
      setGameSuccess(false);
      setPhase(2);
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [gameSuccess]);

  useEffect(() => {
    if (!evalSuccess) return;
    const timer = window.setTimeout(() => {
      setEvalSuccess(false);
      finishModule();
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [evalSuccess]);

  function finishModule() {
    if (!currentChapter) return;
    setPhase(0);
    setPicked([]);
    setGameNote("");
    setGameSuccess(false);
    setGameScore(0);
    setAnswerNote("");
    setEvalSuccess(false);
    if (moduleIndex < currentChapter.modules.length - 1) {
      setModuleIndex((value) => value + 1);
      return;
    }
    setChapter((value) => value + 1);
    setModuleIndex(0);
  }

  function checkGame() {
    const expected = promptCards.filter((card) => card.ok).map((card) => card.id);
    const same = expected.length === picked.length && expected.every((id) => picked.includes(id));
    if (!same) {
      setGameNote("Presque ! Les données clients et les marges ne doivent jamais entrer dans un prompt.");
      return;
    }
    setGameNote("");
    setGameScore(100);
    setGameSuccess(true);
  }

  function checkAnswer(ok: boolean) {
    if (!ok) {
      setAnswerNote("Pas celle-là. L'IA peut inventer un chiffre — toujours vérifier.");
      return;
    }
    setAnswerNote("");
    setEvalSuccess(true);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 text-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bonjour Camille</h1>
        <p className="mt-1 text-center text-sm text-slate-600 dark:text-slate-300">
          Votre parcours AI Act et RGPD · Atelier Lumière
        </p>
      </div>

      <Journey active={active} percent={percent} />

      <div className="space-y-3">
        {curriculum.map((item, index) => {
          if (index < chapter) {
            return (
              <div
                key={item.title}
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/20"
              >
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="font-semibold text-slate-800 dark:text-slate-100">{item.title}</span>
                <span className="text-emerald-700 dark:text-emerald-400">Terminé</span>
              </div>
            );
          }

          if (index > chapter) {
            return (
              <div
                key={item.title}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800"
              >
                <Lock className="h-3.5 w-3.5 shrink-0" />
                <span>{item.title}</span>
              </div>
            );
          }

          return (
            <article
              key={item.title}
              className="overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm dark:border-violet-800 dark:bg-slate-800"
            >
              <div className="border-b border-violet-100 px-5 py-4 dark:border-violet-900/40 sm:px-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h2>
                <p className="mt-0.5 text-sm text-violet-600 dark:text-violet-300">{item.theme}</p>
                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold">
                  {["Leçon", "Exercice", "Éval."].map((label, stepIndex) => (
                    <span
                      key={label}
                      className={`rounded-full px-3 py-1 transition ${
                        stepIndex === phase
                          ? "bg-violet-600 text-white shadow-sm"
                          : stepIndex < phase
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-400 dark:bg-slate-900"
                      }`}
                    >
                      {stepIndex < phase ? "✓ " : ""}
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-4 pb-5 sm:px-5">
                <AnimatePresence mode="wait">
                  {phase === 0 && (
                    <LessonPhase
                      moduleId={item.modules[moduleIndex].id}
                      title={item.modules[moduleIndex].title}
                      summary={item.modules[moduleIndex].summary}
                      onContinue={() => setPhase(1)}
                    />
                  )}
                  {phase === 1 && (
                    <GamePhase
                      picked={picked}
                      setPicked={setPicked}
                      gameNote={gameNote}
                      success={gameSuccess}
                      score={gameScore}
                      onValidate={checkGame}
                    />
                  )}
                  {phase === 2 && (
                    <EvalPhase answerNote={answerNote} success={evalSuccess} onAnswer={checkAnswer} />
                  )}
                </AnimatePresence>
              </div>
            </article>
          );
        })}

        {quizDone ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/20">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="font-semibold text-slate-800 dark:text-slate-100">Quiz de validation</span>
            <span className="text-emerald-700 dark:text-emerald-400">Terminé</span>
          </div>
        ) : contentDone ? (
          <article className="rounded-xl border border-violet-200 bg-white p-5 dark:border-violet-800 dark:bg-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quiz de validation</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">10 à 15 questions. 80 % pour réussir.</p>
            <button
              type="button"
              onClick={() => setQuizDone(true)}
              className="mt-4 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Passer le quiz
            </button>
          </article>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span>Quiz de validation</span>
          </div>
        )}
      </div>
    </div>
  );
}
