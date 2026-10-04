"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Lock,
  Play,
  Timer,
  Trophy,
} from "lucide-react";
import VideoScript from "@/components/user/VideoScript";
import ActivityPlayer from "@/components/user/ActivityPlayer";
import { useFormationProgress } from "@/components/user/useFormationProgress";
import CertificatePreview from "@/components/demo/CertificatePreview";
import type { IssuedCertificate } from "@/lib/firebase/formation-progress";
import { formatProofDate } from "@/lib/formation/proof";
import { CAREER_PATHS } from "@/lib/formation/careers";
import {
  BLOCKS,
  FORMATION_PROMISE,
  SEVEN_REFLEXES,
  findChapter,
  type Block,
} from "@/lib/formation/curriculum";
import {
  QUIZ_DRAW_SIZE,
  QUIZ_PASS_PERCENT,
  QUIZ_TIMER_SECONDS,
  drawPositioningQuiz,
  drawSocleQuiz,
  type QuizQuestion,
} from "@/lib/formation/evaluation";
import {
  feedbackHoldMs,
  mountDwellMs,
  needsAck,
} from "@/lib/formation/pace";
import {
  AI_USE_CASE_STATUS_LABELS,
  emptyCompanyModule,
  isAiUseCaseFilled,
  isCompanyModuleFilled,
  type CompanyModuleContent,
} from "@/lib/admin/types";
import { PlainText } from "@/lib/format/plain-text";

type Screen =
  | { kind: "intro" }
  | { kind: "positioning" }
  | { kind: "hub" }
  | { kind: "block"; blockId: string }
  | { kind: "chapter"; chapterId: string }
  | { kind: "company" }
  | { kind: "quiz" }
  | { kind: "career" };

type ShuffledQuestion = {
  q: QuizQuestion;
  options: { text: string; index: number }[];
};

function shuffleChoices(question: QuizQuestion) {
  const indexed = question.choices.map((text, index) => ({ text, index }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j]!, indexed[i]!];
  }
  return indexed;
}

function toRound(questions: QuizQuestion[]): ShuffledQuestion[] {
  return questions.map((q) => ({ q, options: shuffleChoices(q) }));
}

export default function FormationExperience({
  uid,
  firstName,
  fullName,
  companyName,
  companyModule = emptyCompanyModule(),
}: {
  uid: string;
  firstName: string;
  fullName: string;
  companyName: string;
  companyModule?: CompanyModuleContent;
}) {
  const {
    ready,
    progress,
    percent,
    doneChapters,
    totalChapters,
    certificate,
    markIntroDone,
    markPositioning,
    markChapterDone,
    markCompanyDone,
    markQuiz,
    markCareer,
  } = useFormationProgress(uid);

  const [screen, setScreen] = useState<Screen | null>(null);
  const [positioningRound] = useState(() => toRound(drawPositioningQuiz()));
  const [positioningIndex, setPositioningIndex] = useState(0);
  const [positioningAnswers, setPositioningAnswers] = useState<(number | null)[]>(() =>
    Array.from({ length: positioningRound.length }, () => null),
  );
  const [positioningReveal, setPositioningReveal] = useState(false);
  const [positioningFinished, setPositioningFinished] = useState(false);
  const [positioningScore, setPositioningScore] = useState<number | null>(null);
  const [positioningCorrect, setPositioningCorrect] = useState<number | null>(null);
  const [quizRound, setQuizRound] = useState<ShuffledQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([]);
  const [quizReveal, setQuizReveal] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [quizBriefed, setQuizBriefed] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [shownAttempts, setShownAttempts] = useState(0);
  const [quizReturn, setQuizReturn] = useState<"intro" | "hub">("intro");

  const active: Screen = screen ?? { kind: "intro" };

  function openFinalQuiz(from: "intro" | "hub") {
    setQuizReturn(from);
    if (progress.quizPassed) {
      setQuizRound([]);
      setQuizDone(true);
      setQuizBriefed(true);
      setLastScore(progress.quizScore);
      setShownAttempts(progress.quizAttempts);
      setScreen({ kind: "quiz" });
      return;
    }
    const round = toRound(drawSocleQuiz());
    setQuizRound(round);
    setQuizIndex(0);
    setQuizAnswers(round.map(() => null));
    setQuizReveal(false);
    setQuizDone(false);
    setQuizBriefed(false);
    setLastScore(null);
    setShownAttempts(progress.quizAttempts);
    setScreen({ kind: "quiz" });
  }

  if (!ready) {
    return <p className="text-center text-sm text-slate-500 py-16">Chargement…</p>;
  }

  if (active.kind === "intro") {
    return (
      <IntroScreen
        firstName={firstName}
        companyName={companyName}
        completedChapters={progress.completedChapters}
        positioningDone={progress.positioningDone}
        quizPassed={progress.quizPassed}
        companyDone={progress.companyModuleDone}
        careerPathId={progress.careerPathId}
        positioningCount={positioningRound.length}
        onOpenPositioning={() => {
          if (!progress.introDone) markIntroDone();
          setScreen({ kind: "positioning" });
        }}
        onOpenBlock={(blockId) => {
          if (!progress.positioningDone) return;
          if (!progress.introDone) markIntroDone();
          setScreen({ kind: "block", blockId });
        }}
        onOpenCompany={() => setScreen({ kind: "company" })}
        onOpenQuiz={() => openFinalQuiz("intro")}
        onOpenCareer={() => setScreen({ kind: "career" })}
      />
    );
  }

  if (active.kind === "positioning") {
    return (
      <QuizScreen
        variant="positioning"
        shuffled={positioningRound}
        index={positioningIndex}
        answers={positioningAnswers}
        reveal={positioningReveal}
        done={positioningFinished}
        score={positioningScore}
        correctCount={positioningCorrect}
        questionCount={positioningRound.length}
        attempts={1}
        onBack={() => setScreen({ kind: "intro" })}
        onSelect={(choiceOriginalIndex) => {
          if (positioningReveal) return;
          const next = [...positioningAnswers];
          next[positioningIndex] = choiceOriginalIndex;
          setPositioningAnswers(next);
          setPositioningReveal(true);
        }}
        onNext={() => {
          if (positioningIndex < positioningRound.length - 1) {
            setPositioningIndex((i) => i + 1);
            setPositioningReveal(false);
            return;
          }
          const score = positioningAnswers.reduce<number>((acc, answer, i) => {
            return acc + (answer === positioningRound[i]!.q.correctIndex ? 1 : 0);
          }, 0);
          const pct = Math.round((score / positioningRound.length) * 100);
          setPositioningCorrect(score);
          setPositioningScore(pct);
          setPositioningFinished(true);
        }}
        onFinish={() => {
          markPositioning(positioningScore ?? 0);
          setScreen({ kind: "intro" });
        }}
      />
    );
  }

  if (active.kind === "hub") {
    return (
      <HubScreen
        firstName={firstName}
        fullName={fullName}
        companyName={companyName}
        percent={percent}
        doneChapters={doneChapters}
        totalChapters={totalChapters}
        progress={progress}
        certificate={certificate}
        onOpenBlock={(blockId) => setScreen({ kind: "block", blockId })}
        onOpenCompany={() => setScreen({ kind: "company" })}
        onOpenQuiz={() => openFinalQuiz("hub")}
        onOpenCareer={() => setScreen({ kind: "career" })}
      />
    );
  }

  if (active.kind === "block") {
    const block = BLOCKS.find((b) => b.id === active.blockId);
    if (!block) return null;
    return (
      <BlockScreen
        block={block}
        completed={progress.completedChapters}
        onBack={() => setScreen({ kind: "intro" })}
        onOpenChapter={(chapterId) => setScreen({ kind: "chapter", chapterId })}
      />
    );
  }

  if (active.kind === "chapter") {
    const found = findChapter(active.chapterId);
    if (!found) return null;
    const { block, chapter, index } = found;
    const next = block.chapters[index + 1];
    return (
      <ChapterScreen
        block={block}
        chapter={chapter}
        done={progress.completedChapters.includes(chapter.id)}
        onBack={() => setScreen({ kind: "block", blockId: block.id })}
        onComplete={() => {
          markChapterDone(chapter.id);
          if (next) setScreen({ kind: "chapter", chapterId: next.id });
          else setScreen({ kind: "intro" });
        }}
      />
    );
  }

  if (active.kind === "company") {
    return (
      <CompanyScreen
        companyName={companyName}
        companyModule={companyModule}
        done={progress.companyModuleDone}
        onBack={() => setScreen({ kind: "intro" })}
        onComplete={() => {
          markCompanyDone();
          setScreen({
            kind: progress.quizPassed && !progress.careerPathId ? "career" : "intro",
          });
        }}
      />
    );
  }

  if (active.kind === "quiz") {
    return (
      <QuizScreen
        variant="final"
        shuffled={quizRound}
        index={quizIndex}
        answers={quizAnswers}
        reveal={quizReveal}
        done={quizDone}
        briefed={quizBriefed}
        score={lastScore ?? progress.quizScore}
        attempts={shownAttempts}
        onBack={() => setScreen({ kind: quizReturn })}
        onBriefingDone={() => setQuizBriefed(true)}
        onSelect={(choiceOriginalIndex) => {
          if (quizReveal) return;
          const next = [...quizAnswers];
          next[quizIndex] = choiceOriginalIndex;
          setQuizAnswers(next);
        }}
        onValidate={() => {
          if (quizReveal || quizAnswers[quizIndex] === null) return;
          setQuizReveal(true);
        }}
        onNext={() => {
          if (quizIndex < quizRound.length - 1) {
            setQuizIndex((i) => i + 1);
            setQuizReveal(false);
            return;
          }
          const score = quizAnswers.reduce<number>((acc, answer, i) => {
            return acc + (answer === quizRound[i]!.q.correctIndex ? 1 : 0);
          }, 0);
          const pct = Math.round((score / quizRound.length) * 100);
          const attempts = progress.quizAttempts + 1;
          const passed = pct >= QUIZ_PASS_PERCENT;
          setLastScore(pct);
          setShownAttempts(attempts);
          markQuiz(pct, passed, attempts);
          setQuizDone(true);
        }}
        onRetry={() => {
          const round = toRound(drawSocleQuiz());
          setQuizRound(round);
          setQuizIndex(0);
          setQuizAnswers(round.map(() => null));
          setQuizReveal(false);
          setQuizDone(false);
          setQuizBriefed(false);
          setLastScore(null);
        }}
        onContinueCareer={
          !progress.companyModuleDone || !progress.careerPathId
            ? () =>
                setScreen({
                  kind: !progress.companyModuleDone ? "company" : "career",
                })
            : undefined
        }
        continueCareerLabel={
          !progress.companyModuleDone
            ? "Continuer : Votre entreprise"
            : !progress.careerPathId
              ? "Continuer le parcours métier"
              : undefined
        }
        continueCareerHint={
          !progress.companyModuleDone
            ? "Examen réussi — 100 % atteint. Pour l'attestation : module entreprise, puis parcours métier."
            : !progress.careerPathId
              ? "Plus qu'une étape pour l'attestation : le parcours métier (~10 min)."
              : undefined
        }
        onFinish={() => setScreen({ kind: quizReturn })}
      />
    );
  }

  if (active.kind === "career") {
    return (
      <CareerScreen
        selected={progress.careerPathId}
        onBack={() => setScreen({ kind: "intro" })}
        onSelect={(id) => {
          markCareer(id);
          setScreen({ kind: "intro" });
        }}
      />
    );
  }

  return null;
}

function blockMenuState(
  block: Block,
  completed: string[],
  positioningDone: boolean,
): "done" | "current" | "locked" {
  const done = block.chapters.every((chapter) => completed.includes(chapter.id));
  if (done) return "done";
  if (!positioningDone) return "locked";
  const previous = BLOCKS.find((item) => item.number === block.number - 1);
  const previousDone =
    !previous || previous.chapters.every((chapter) => completed.includes(chapter.id));
  return previousDone ? "current" : "locked";
}

function PathCard({
  label,
  title,
  meta,
  state,
  denied,
  onClick,
  lockedHint,
  doneHint,
}: {
  label: string;
  title: string;
  meta: string;
  state: "done" | "current" | "locked";
  denied: boolean;
  onClick: () => void;
  lockedHint: string;
  doneHint: string;
}) {
  const current = state === "current";
  const done = state === "done";
  const locked = state === "locked";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full cursor-pointer rounded-xl border-0 bg-transparent p-[2px] text-left shadow-sm shadow-slate-200/80 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/20 dark:shadow-slate-950/50 ${
        current ? "shadow-blue-500/25" : ""
      } ${done ? "shadow-emerald-500/15" : ""} ${denied ? "block-deny shadow-red-500/40" : ""}`}
    >
      {current ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl" aria-hidden>
          <div className="border-orbit" />
        </div>
      ) : (
        <div
          className={`pointer-events-none absolute inset-0 rounded-xl border ${
            denied
              ? "border-red-500"
              : done
                ? "border-emerald-400 dark:border-emerald-500"
                : "border-slate-200 dark:border-slate-700"
          }`}
          aria-hidden
        />
      )}
      <div
        className={`relative overflow-hidden rounded-[10px] px-4 py-3 text-center transition-colors duration-150 ${
          denied
            ? "bg-red-50 dark:bg-red-950/50"
            : done
              ? "bg-emerald-50 dark:bg-emerald-950/50"
              : "bg-white dark:bg-slate-900"
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b to-transparent ${
            done
              ? "from-emerald-100/90 via-emerald-50/40 dark:from-emerald-400/15"
              : "from-white via-blue-50/70 dark:from-white/10 dark:via-blue-400/5"
          }`}
          aria-hidden
        />
        {(locked || done) && (
          <span
            className={`absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full shadow-sm ${
              done
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {done ? <Check className="h-3 w-3" aria-hidden /> : <Lock className="h-3 w-3" aria-hidden />}
            <span className="sr-only">{done ? doneHint : lockedHint}</span>
          </span>
        )}
        <p
          className={`relative text-center text-xs font-semibold leading-none ${
            done ? "text-emerald-700 dark:text-emerald-300" : "text-blue-600 dark:text-blue-400"
          }`}
        >
          {label}
        </p>
        <h2
          className={`relative mt-1.5 text-center text-sm font-bold leading-tight ${
            done ? "text-emerald-950 dark:text-emerald-50" : "text-slate-900 dark:text-white"
          }`}
        >
          {title}
        </h2>
        <p
          className={`relative mt-1.5 text-center text-xs leading-none ${
            done ? "text-emerald-800/80 dark:text-emerald-200/80" : "text-slate-500"
          }`}
        >
          {meta}
        </p>
      </div>
    </button>
  );
}

function IntroScreen({
  firstName,
  companyName,
  completedChapters,
  positioningDone,
  quizPassed,
  companyDone,
  careerPathId,
  positioningCount,
  onOpenPositioning,
  onOpenBlock,
  onOpenCompany,
  onOpenQuiz,
  onOpenCareer,
}: {
  firstName: string;
  companyName: string;
  completedChapters: string[];
  positioningDone: boolean;
  quizPassed: boolean;
  companyDone: boolean;
  careerPathId: string | null;
  positioningCount: number;
  onOpenPositioning: () => void;
  onOpenBlock: (blockId: string) => void;
  onOpenCompany: () => void;
  onOpenQuiz: () => void;
  onOpenCareer: () => void;
}) {
  const [deniedId, setDeniedId] = useState<string | null>(null);
  const chaptersDone = BLOCKS.every((block) =>
    block.chapters.every((chapter) => completedChapters.includes(chapter.id)),
  );
  const quizState: "done" | "current" | "locked" = quizPassed
    ? "done"
    : positioningDone && chaptersDone
      ? "current"
      : "locked";
  const companyState: "done" | "current" | "locked" = companyDone
    ? "done"
    : quizPassed
      ? "current"
      : "locked";
  const careerState: "done" | "current" | "locked" = careerPathId
    ? "done"
    : quizPassed && companyDone
      ? "current"
      : "locked";
  const careerTitle = careerPathId
    ? CAREER_PATHS.find((path) => path.id === careerPathId)?.title ?? "Parcours choisi"
    : null;

  function openOrDeny(id: string, locked: boolean, onOpen: () => void) {
    if (!locked) {
      onOpen();
      return;
    }
    setDeniedId(id);
    window.setTimeout(() => {
      setDeniedId((current) => (current === id ? null : current));
    }, 420);
  }

  const needsCompanyAfterQuiz = quizPassed && !companyDone;
  const needsCareer = quizPassed && companyDone && !careerPathId;

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-4 text-center">
      <div className="space-y-4">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
          ConformAI Academy
        </p>
        <h1 className="text-center text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Bienvenue{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mx-auto max-w-3xl text-justify text-base leading-relaxed text-slate-600 dark:text-slate-300">
          {FORMATION_PROMISE}
        </p>
        <p className="text-center text-sm text-slate-500">
          Parcours pour <span className="font-semibold text-slate-700 dark:text-slate-200">{companyName}</span>
        </p>
      </div>

      {needsCompanyAfterQuiz && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-800 dark:bg-amber-950/40">
          <p className="text-sm font-semibold text-amber-950 dark:text-amber-50">
            Suite recommandée — attestation
          </p>
          <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-200/80">
            Examen réussi (100 %). Consultez « Votre entreprise », puis le parcours métier pour obtenir l&apos;attestation.
          </p>
          <button
            type="button"
            onClick={onOpenCompany}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
          >
            Ouvrir Votre entreprise
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {needsCareer && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 dark:border-blue-800 dark:bg-blue-950/40">
          <p className="text-sm font-semibold text-blue-950 dark:text-blue-50">
            Dernière étape pour l&apos;attestation
          </p>
          <p className="mt-1 text-xs text-blue-800/80 dark:text-blue-200/80">
            Choisissez votre parcours métier (~10 min) pour finaliser l&apos;attestation.
          </p>
          <button
            type="button"
            onClick={onOpenCareer}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Continuer le parcours métier
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mx-auto w-full max-w-3xl">
        <button
          type="button"
          onClick={() => {
            if (!positioningDone) onOpenPositioning();
          }}
          className={`relative mx-auto mb-8 flex w-fit max-w-full rounded-full border-0 bg-transparent p-[2px] text-center text-sm leading-snug transition duration-300 ${
            positioningDone
              ? "cursor-default text-emerald-700 dark:text-emerald-300"
              : "cursor-pointer font-semibold text-blue-700 hover:-translate-y-0.5 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
          }`}
        >
          {!positioningDone && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full" aria-hidden>
              <div className="border-orbit-line" />
            </div>
          )}
          <span className="relative flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 dark:bg-slate-950">
            {positioningDone ? (
              <Check className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" aria-hidden />
            )}
            <span>
              {positioningDone
                ? "Niveau situé"
                : `Avant de commencer, situez votre niveau · ${positioningCount} questions, sans enjeu`}
            </span>
          </span>
          <span className="sr-only">
            {positioningDone ? "Test de positionnement terminé" : "Ouvrir le test de positionnement"}
          </span>
        </button>

        <div className="grid w-full items-start gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {BLOCKS.map((block) => {
            const state = blockMenuState(block, completedChapters, positioningDone);
            return (
              <PathCard
                key={block.id}
                label={`Bloc ${block.number} · ${block.duration}`}
                title={block.title}
                meta={`${block.chapters.length} chapitre${block.chapters.length > 1 ? "s" : ""}`}
                state={state}
                denied={deniedId === block.id}
                onClick={() => openOrDeny(block.id, state === "locked", () => onOpenBlock(block.id))}
                lockedHint={
                  positioningDone
                    ? "Disponible une fois le bloc précédent terminé"
                    : "Disponible après le test de positionnement"
                }
                doneHint="Bloc terminé"
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => openOrDeny("quiz", quizState === "locked", onOpenQuiz)}
          className={`group relative mx-auto mt-3 flex w-fit cursor-pointer rounded-2xl border-0 bg-transparent p-[2px] text-center shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md ${
            quizState === "done"
              ? "shadow-emerald-500/20 hover:shadow-emerald-500/30"
              : "shadow-rose-500/20 hover:shadow-rose-500/35"
          } ${deniedId === "quiz" ? "block-deny shadow-red-500/40" : ""}`}
        >
          {quizState === "current" ? (
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
              <div className="border-orbit-rose" />
            </div>
          ) : (
            <div
              className={`pointer-events-none absolute inset-0 rounded-2xl border ${
                deniedId === "quiz"
                  ? "border-red-500"
                  : quizState === "done"
                    ? "border-emerald-400 dark:border-emerald-500"
                    : "border-rose-200 dark:border-rose-800"
              }`}
              aria-hidden
            />
          )}
          <div
            className={`relative flex items-center gap-3 rounded-[14px] px-4 py-2.5 ${
              deniedId === "quiz"
                ? "bg-red-50 dark:bg-red-950/50"
                : quizState === "done"
                  ? "bg-emerald-50 dark:bg-emerald-950/40"
                  : "bg-rose-50 dark:bg-rose-950/40"
            }`}
          >
            <span
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm ${
                quizState === "done"
                  ? "bg-emerald-500 text-white"
                  : quizState === "current"
                    ? "bg-rose-600 text-white shadow-rose-500/40"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200"
              }`}
            >
              {quizState === "done" ? (
                <Check className="h-4 w-4" aria-hidden />
              ) : (
                <Trophy className="h-4 w-4" aria-hidden />
              )}
              {quizState === "locked" && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                  <Lock className="h-2.5 w-2.5" aria-hidden />
                </span>
              )}
            </span>
            <span className="text-left">
              <span
                className={`block text-sm font-bold leading-tight ${
                  quizState === "done"
                    ? "text-emerald-950 dark:text-emerald-50"
                    : "text-rose-950 dark:text-rose-50"
                }`}
              >
                Examen final
              </span>
              <span
                className={`mt-0.5 block text-xs leading-none ${
                  quizState === "done"
                    ? "text-emerald-800/80 dark:text-emerald-200/80"
                    : "text-rose-700/80 dark:text-rose-200/80"
                }`}
              >
                {QUIZ_DRAW_SIZE} questions · {QUIZ_PASS_PERCENT} %
              </span>
            </span>
            <span className="sr-only">
              {quizState === "done"
                ? "Examen final réussi"
                : quizState === "locked"
                  ? "Disponible une fois les 6 blocs terminés"
                  : "Ouvrir l'examen final"}
            </span>
          </div>
        </button>

        <div className="mx-auto mt-4 grid w-full max-w-xl gap-2.5 sm:grid-cols-2">
          <PathCard
            label="Entreprise"
            title="Votre entreprise"
            meta={companyDone ? "Consulté" : "Après l'examen"}
            state={companyState}
            denied={deniedId === "company"}
            onClick={() => openOrDeny("company", companyState === "locked", onOpenCompany)}
            lockedHint="Disponible après la réussite de l'examen final"
            doneHint="Module consulté"
          />
          <PathCard
            label="Spécialisation"
            title="Parcours métier"
            meta={careerTitle ?? (companyDone ? "Pour l'attestation" : "Après Votre entreprise")}
            state={careerState}
            denied={deniedId === "career"}
            onClick={() => openOrDeny("career", careerState === "locked", onOpenCareer)}
            lockedHint={
              quizPassed
                ? "Consultez d'abord le module Votre entreprise"
                : "Disponible après la réussite de l'examen final"
            }
            doneHint="Parcours métier validé"
          />
        </div>
      </div>

      <p className="mx-auto w-full max-w-3xl pt-6 text-justify text-sm font-normal leading-relaxed text-slate-500 hyphens-auto dark:text-slate-400">
        L&apos;avancement passe à 100 % dès la réussite de l&apos;examen (≥ {QUIZ_PASS_PERCENT} %).
        L&apos;attestation est délivrée après le module entreprise et le parcours métier.
      </p>

      <p className="text-justify text-xs text-slate-400 hyphens-auto">
        Parcours complet : 1h00. Peut être suivi en plusieurs sessions.
      </p>
      {careerPathId && (
        <p className="text-justify text-sm text-slate-600 hyphens-auto dark:text-slate-300">
          On peut évidemment aller très loin en IA, n&apos;hésitez pas à vous renseigner.
        </p>
      )}
    </div>
  );
}

function HubScreen({
  firstName,
  fullName,
  companyName,
  percent,
  doneChapters,
  totalChapters,
  progress,
  certificate,
  onOpenBlock,
  onOpenCompany,
  onOpenQuiz,
  onOpenCareer,
}: {
  firstName: string;
  fullName: string;
  companyName: string;
  percent: number;
  doneChapters: number;
  totalChapters: number;
  progress: ReturnType<typeof useFormationProgress>["progress"];
  certificate: IssuedCertificate | null;
  onOpenBlock: (id: string) => void;
  onOpenCompany: () => void;
  onOpenQuiz: () => void;
  onOpenCareer: () => void;
}) {
  const blocksReady = doneChapters >= totalChapters;
  const [showAttestation, setShowAttestation] = useState(false);
  const proof = certificate
    ? (() => {
        const { date, time } = formatProofDate(certificate.issuedAt);
        return {
          score: certificate.quizScore ?? progress.quizScore ?? 80,
          date,
          time,
          serial: certificate.id.replace(/^CONF-\d+-/, ""),
          certificateId: certificate.id,
          specimen: false as const,
        };
      })()
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 text-center">
      <div className="space-y-2">
        <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">
          Votre parcours{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-center text-sm text-slate-500">
          {doneChapters}/{totalChapters} chapitres · progression {percent} %
        </p>
        <div className="mx-auto h-2 max-w-md overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
      </div>

      {progress.quizPassed && !progress.companyModuleDone && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-800 dark:bg-amber-950/40">
          <p className="text-center text-sm font-semibold text-amber-950 dark:text-amber-50">
            Suite pour l&apos;attestation
          </p>
          <p className="mt-1 text-center text-xs text-amber-900/80 dark:text-amber-200/80">
            100 % atteints. Consultez « Votre entreprise », puis le parcours métier.
          </p>
          <button
            type="button"
            onClick={onOpenCompany}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Ouvrir Votre entreprise
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {progress.quizPassed && progress.companyModuleDone && !progress.careerPathId && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 dark:border-blue-800 dark:bg-blue-950/40">
          <p className="text-center text-sm font-semibold text-blue-950 dark:text-blue-50">
            Dernière étape pour l&apos;attestation
          </p>
          <p className="mt-1 text-center text-xs text-blue-800/80 dark:text-blue-200/80">
            Validez votre parcours métier (~10 min).
          </p>
          <button
            type="button"
            onClick={onOpenCareer}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Continuer le parcours métier
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {certificate && proof && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-800 dark:bg-emerald-950/30">
          <p className="text-center text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            Attestation de suivi émise · {certificate.id}
          </p>
          <p className="mt-1 text-center text-xs text-emerald-800/80 dark:text-emerald-200/80">
            Conservée dans le dossier de preuve de votre entreprise (Art. 4).
          </p>
          <p className="mt-2 text-justify text-sm text-slate-600 hyphens-auto dark:text-emerald-100/90">
            On peut évidemment aller très loin en IA, n&apos;hésitez pas à vous renseigner.
          </p>
          <button
            type="button"
            onClick={() => setShowAttestation(true)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            <GraduationCap className="h-4 w-4" />
            Voir mon attestation
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {BLOCKS.map((block) => {
          const done = block.chapters.every((c) =>
            progress.completedChapters.includes(c.id),
          );
          const started = block.chapters.some((c) =>
            progress.completedChapters.includes(c.id),
          );
          return (
            <button
              key={block.id}
              type="button"
              onClick={() => onOpenBlock(block.id)}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-600 dark:hover:bg-blue-950/30"
            >
              <div className="flex flex-col items-center gap-3">
                <div>
                  <p className="text-center text-xs font-semibold text-blue-600 transition-colors group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
                    Bloc {block.number} · {block.duration}
                  </p>
                  <h2 className="mt-1 text-center text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-950 dark:text-white dark:group-hover:text-blue-50">
                    {block.title}
                  </h2>
                  <p className="mt-1 text-justify text-xs text-slate-500 leading-relaxed transition-colors group-hover:text-slate-600">
                    {block.goal}
                  </p>
                </div>
                {done ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 transition-transform duration-300 group-hover:scale-110" />
                ) : started ? (
                  <Play className="h-5 w-5 shrink-0 text-blue-500 transition-transform duration-300 group-hover:scale-110" />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <HubAction
          icon={<ClipboardList className="h-5 w-5" />}
          title="QCM final"
          subtitle={
            progress.quizPassed
              ? `Score ${progress.quizScore} % · 100 % atteints`
              : progress.quizAttempts > 0
                ? `${progress.quizAttempts} tentative${progress.quizAttempts > 1 ? "s" : ""} · ${progress.quizScore} %`
                : blocksReady
                  ? `${QUIZ_DRAW_SIZE} questions · seuil ${QUIZ_PASS_PERCENT} %`
                  : "Terminez d'abord le socle"
          }
          done={progress.quizPassed}
          disabled={!blocksReady}
          onClick={onOpenQuiz}
        />
        <HubAction
          icon={<Building2 className="h-5 w-5" />}
          title="Votre entreprise"
          subtitle={
            progress.companyModuleDone
              ? "Consulté"
              : progress.quizPassed
                ? "Pour l'attestation"
                : "Après l'examen"
          }
          done={progress.companyModuleDone}
          disabled={!progress.quizPassed}
          onClick={onOpenCompany}
        />
        <HubAction
          icon={<GraduationCap className="h-5 w-5" />}
          title="Parcours métier"
          subtitle={
            progress.careerPathId
              ? CAREER_PATHS.find((p) => p.id === progress.careerPathId)?.title ?? "Choisi"
              : progress.companyModuleDone
                ? "Pour l'attestation · ~10 min"
                : "Après Votre entreprise"
          }
          done={!!progress.careerPathId}
          disabled={!progress.quizPassed || !progress.companyModuleDone}
          onClick={onOpenCareer}
        />
      </div>

      {showAttestation && proof && (
        <CertificatePreview
          employee={{
            id: "self",
            name: fullName,
            email: "",
            role: CAREER_PATHS.find((p) => p.id === progress.careerPathId)?.title ?? "Collaborateur",
            path: "IA + RGPD",
            status: "done",
            percent: 100,
            lastSeen: proof.date,
            certificateId: proof.certificateId,
            certifiedAt: certificate?.issuedAt ?? null,
            quizScore: proof.score,
            companyName,
          }}
          companyName={companyName}
          proof={proof}
          onClose={() => setShowAttestation(false)}
        />
      )}
    </div>
  );
}

function HubAction({
  icon,
  title,
  subtitle,
  done,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  done?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition duration-300 ease-out enabled:hover:-translate-y-0.5 enabled:hover:border-blue-300 enabled:hover:bg-blue-50/50 enabled:hover:shadow-md disabled:opacity-45 dark:border-slate-700 dark:bg-slate-900 dark:enabled:hover:border-blue-600 dark:enabled:hover:bg-blue-950/30"
    >
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition duration-300 group-hover:scale-105 group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:group-hover:bg-blue-900">
        {done ? <Check className="h-5 w-5 text-emerald-500" /> : icon}
      </div>
      <p className="text-center text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-950 dark:text-white dark:group-hover:text-blue-50">
        {title}
      </p>
      <p className="mt-0.5 text-center text-xs text-slate-500">{subtitle}</p>
    </button>
  );
}

function chapterTeaser(chapter: Block["chapters"][number]): string {
  const teasers: Record<string, string> = {
    "1.1": "Ce que l'IA change déjà dans votre quotidien",
    "1.2": "IA classique vs générative, en clair",
    "1.3": "Classez les bons exemples",
    "1.4": "Pourquoi le modèle peut inventer",
    "1.5": "Un chiffre qui surprend",
    "1.6": "Repérez les inventions dans un texte",
    "1.7": "Les 4 contrôles avant d'utiliser une réponse",
    "2.1": "Ce que vous croyez déjà savoir",
    "2.2": "Pourquoi ce parcours existe",
    "2.3": "Qui vend l'IA, qui l'utilise",
    "2.4": "Interdit, haut risque, transparence…",
    "2.5": "Les dates clés à retenir",
    "2.6": "Chatbots, deepfakes : que dire ?",
    "2.7": "Deux situations concrètes",
    "3.1": "Personnelle, sensible ou confidentielle ?",
    "3.2": "Ce qu'on peut mettre dans un prompt",
    "3.3": "Masquez ce qui ne doit pas partir",
    "3.4": "Trois questions avant d'utiliser un outil",
    "3.5": "Enregistrer une réunion sans se tromper",
    "3.6": "Que faire en cas d'erreur",
    "4.1": "Trouvez ce que l'IA a inventé",
    "4.2": "Quand l'outil reproduit des biais",
    "4.3": "Droits, images et contenus générés",
    "4.4": "Ne faites pas confiance aux apparences",
    "4.5": "Un deepfake qui demande un virement",
    "4.6": "Quand l'assistant obéit à un piège",
    "5.1": "Pourquoi l'humain garde la main",
    "5.2": "IA seule, humain aux commandes, ou stop ?",
    "6.1": "Empilez les 7 réflexes",
    "6.2": "La checklist à garder sous la main",
  };
  return teasers[chapter.id] ?? chapter.format;
}

function activityTone(format: string) {
  switch (format) {
    case "Pré-quiz":
    case "Quiz":
      return {
        card: "border-sky-200/80 bg-sky-50/80 hover:border-sky-300 hover:bg-sky-50 dark:border-sky-800/50 dark:bg-sky-950/25 dark:hover:bg-sky-950/40",
        meta: "text-sky-700/90 dark:text-sky-300",
        icon: "text-sky-500",
      };
    case "Vidéo":
      return {
        card: "border-violet-200/80 bg-violet-50/80 hover:border-violet-300 hover:bg-violet-50 dark:border-violet-800/50 dark:bg-violet-950/25 dark:hover:bg-violet-950/40",
        meta: "text-violet-700/90 dark:text-violet-300",
        icon: "text-violet-500",
      };
    case "Jeu":
      return {
        card: "border-amber-200/80 bg-amber-50/80 hover:border-amber-300 hover:bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/25 dark:hover:bg-amber-950/40",
        meta: "text-amber-800/90 dark:text-amber-200",
        icon: "text-amber-500",
      };
    case "Animation":
    case "Frise":
      return {
        card: "border-cyan-200/80 bg-cyan-50/80 hover:border-cyan-300 hover:bg-cyan-50 dark:border-cyan-800/50 dark:bg-cyan-950/25 dark:hover:bg-cyan-950/40",
        meta: "text-cyan-800/90 dark:text-cyan-200",
        icon: "text-cyan-500",
      };
    case "Scénario":
      return {
        card: "border-rose-200/80 bg-rose-50/80 hover:border-rose-300 hover:bg-rose-50 dark:border-rose-800/50 dark:bg-rose-950/25 dark:hover:bg-rose-950/40",
        meta: "text-rose-700/90 dark:text-rose-300",
        icon: "text-rose-500",
      };
    case "Checklist":
    case "Fiche":
      return {
        card: "border-emerald-200/80 bg-emerald-50/70 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-950/25 dark:hover:bg-emerald-950/40",
        meta: "text-emerald-800/90 dark:text-emerald-200",
        icon: "text-emerald-500",
      };
    case "Alerte":
      return {
        card: "border-orange-200/80 bg-orange-50/80 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-800/50 dark:bg-orange-950/25 dark:hover:bg-orange-950/40",
        meta: "text-orange-800/90 dark:text-orange-200",
        icon: "text-orange-500",
      };
    default:
      return {
        card: "border-slate-200/90 bg-slate-50/80 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-900",
        meta: "text-slate-500",
        icon: "text-slate-400",
      };
  }
}

function BlockScreen({
  block,
  completed,
  onBack,
  onOpenChapter,
}: {
  block: Block;
  completed: string[];
  onBack: () => void;
  onOpenChapter: (id: string) => void;
}) {
  const [deniedId, setDeniedId] = useState<string | null>(null);

  function openOrDeny(id: string, locked: boolean) {
    if (!locked) {
      onOpenChapter(id);
      return;
    }
    setDeniedId(id);
    window.setTimeout(() => {
      setDeniedId((current) => (current === id ? null : current));
    }, 420);
  }

  return (
    <div className="mx-auto max-w-md space-y-5 text-center md:max-w-2xl">
      <button
        type="button"
        onClick={onBack}
        className="mx-auto inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-200 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au parcours
      </button>
      <div>
        <p className="text-center text-xs font-semibold text-blue-600 dark:text-blue-400">
          Bloc {block.number} · {block.duration}
        </p>
        <h1 className="mt-1 text-center text-2xl font-bold text-slate-900 dark:text-white">{block.title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-justify text-sm text-slate-500 hyphens-auto">{block.goal}</p>
      </div>
      <ul className="mx-auto grid max-w-2xl grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
        {block.chapters.map((chapter, index) => {
          const done = completed.includes(chapter.id);
          const previous = block.chapters[index - 1];
          const locked = !done && !!previous && !completed.includes(previous.id);
          const denied = deniedId === chapter.id;
          const tone = activityTone(chapter.format);
          const centered = index === block.chapters.length - 1 && block.chapters.length % 2 === 1;
          const teaser = chapterTeaser(chapter);
          return (
            <li key={chapter.id} className={centered ? "sm:col-span-2 sm:flex sm:justify-center" : undefined}>
              <button
                type="button"
                onClick={() => openOrDeny(chapter.id, locked)}
                className={`group relative flex min-h-[5.5rem] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border px-5 py-4 text-center shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md ${
                  centered ? "sm:w-[calc(50%-0.5rem)]" : ""
                } ${
                  denied
                    ? "block-deny border-red-500 bg-red-50 dark:bg-red-950/40"
                    : done
                      ? "border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-500"
                      : tone.card
                }`}
              >
                {locked && (
                  <Lock className="absolute top-3 right-3 h-3.5 w-3.5 text-slate-400" aria-hidden />
                )}
                <span className="flex items-center justify-center gap-2">
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-white transition-transform duration-300 group-hover:scale-110" />
                  ) : (
                    <Play
                      className={`h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                        locked ? "text-slate-300" : tone.icon
                      }`}
                    />
                  )}
                  <span
                    className={`text-center text-base font-semibold leading-snug ${
                      done ? "text-white" : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {chapter.id} · {chapter.title}
                  </span>
                </span>
                <span
                  className={`text-center text-xs leading-snug ${
                    locked ? "text-slate-400" : done ? "text-emerald-50/90" : tone.meta
                  }`}
                >
                  {teaser}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function printReflexSheet() {
  const items = SEVEN_REFLEXES.map(
    (reflex, index) => `<li style="margin:0.7rem 0">${index + 1}. ${reflex}</li>`,
  ).join("");
  const popup = window.open("", "_blank", "noopener,noreferrer,width=720,height=900");
  if (!popup) return;
  popup.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Les 7 réflexes IA</title>
    <style>body{font-family:Georgia,serif;max-width:640px;margin:2.5rem auto;color:#0f172a;padding:0 1.5rem}h1{font-size:1.35rem}p{line-height:1.45}</style>
    </head><body><p>ConformAI</p><h1>Checklist — Avant de mettre quelque chose dans une IA, je me demande…</h1><ol>${items}</ol>
    <p><strong>En cas de doute :</strong> je ne devine pas, je demande à mon manager ou au référent IA avant d'utiliser l'outil.</p></body></html>`);
  popup.document.close();
  popup.focus();
  popup.print();
}

function ChapterScreen({
  block,
  chapter,
  done,
  onBack,
  onComplete,
}: {
  block: Block;
  chapter: (typeof BLOCKS)[number]["chapters"][number];
  done: boolean;
  onBack: () => void;
  onComplete: () => void;
}) {
  const kind = chapter.activity.kind;
  const ackRequired = needsAck(kind, chapter.id, chapter.duration);
  const [activityComplete, setActivityComplete] = useState(done);
  const [mountReady, setMountReady] = useState(done || mountDwellMs(kind, chapter.duration) <= 0);
  const [holdReady, setHoldReady] = useState(done);
  const [acked, setAcked] = useState(done || !ackRequired);

  useEffect(() => {
    const mountMs = mountDwellMs(kind, chapter.duration);
    setActivityComplete(done);
    setMountReady(done || mountMs <= 0);
    setHoldReady(done);
    setAcked(done || !needsAck(kind, chapter.id, chapter.duration));
    if (done || mountMs <= 0) return;
    const timer = window.setTimeout(() => setMountReady(true), mountMs);
    return () => window.clearTimeout(timer);
  }, [chapter.id, chapter.duration, done, kind]);

  useEffect(() => {
    if (done || !activityComplete) return;
    const holdMs = feedbackHoldMs(kind);
    if (holdMs <= 0) {
      setHoldReady(true);
      return;
    }
    setHoldReady(false);
    const timer = window.setTimeout(() => setHoldReady(true), holdMs);
    return () => window.clearTimeout(timer);
  }, [activityComplete, chapter.id, done, kind]);

  const canContinue =
    done || (activityComplete && mountReady && holdReady && (!ackRequired || acked));
  const waitForActivity =
    (kind === "quiz" || (kind === "checklist" && chapter.activity.centered)) &&
    !activityComplete &&
    !done;
  const showAck =
    !done && ackRequired && activityComplete && mountReady && holdReady && !acked;
  const stepIndex = Math.max(0, block.chapters.findIndex((item) => item.id === chapter.id));
  const stepCount = block.chapters.length;
  const progress = stepCount <= 1 ? 100 : (stepIndex / (stepCount - 1)) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="px-1">
        <ol className="flex justify-between">
          {block.chapters.map((item, index) => {
            const current = item.id === chapter.id;
            const reached = index <= stepIndex;
            return (
              <li
                key={item.id}
                className={`text-center text-[11px] leading-none ${
                  current
                    ? "font-semibold text-slate-700 dark:text-slate-200"
                    : reached
                      ? "text-slate-400 dark:text-slate-500"
                      : "text-slate-300 dark:text-slate-600"
                }`}
              >
                {item.id}
              </li>
            );
          })}
        </ol>
        <div className="relative mt-2 h-px bg-slate-200 dark:bg-slate-700">
          <div
            className="absolute inset-y-0 left-0 bg-slate-400/80 dark:bg-slate-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-200 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Bloc {block.number}
      </button>

      <div className="space-y-1 text-center">
        <h1
          className={`text-center text-2xl text-slate-900 dark:text-white ${
            kind === "text"
              ? "font-semibold [font-family:var(--font-reading),Georgia,serif]"
              : "font-bold"
          }`}
        >
          {chapter.id} · {chapter.title}
        </h1>
      </div>

      <ActivityPlayer
        key={chapter.id}
        activity={chapter.activity}
        duration={chapter.duration}
        onReady={() => setActivityComplete(true)}
      />

      {kind === "fiche" && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={printReflexSheet}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            Imprimer la fiche des 7 réflexes
          </button>
        </div>
      )}

      {showAck && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setAcked(true)}
            className="rounded-xl border-2 border-blue-400 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-950/50 dark:text-blue-100 dark:hover:bg-blue-950"
          >
            J&apos;ai compris
          </button>
        </div>
      )}

      {!waitForActivity && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            disabled={!canContinue}
            onClick={onComplete}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            Continuer
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function CompanyScreen({
  companyName,
  companyModule,
  done,
  onBack,
  onComplete,
}: {
  companyName: string;
  companyModule: CompanyModuleContent;
  done: boolean;
  onBack: () => void;
  onComplete: () => void;
}) {
  const filled = isCompanyModuleFilled(companyModule);
  const useCases = (companyModule.useCases ?? []).filter((row) => isAiUseCaseFilled(row));
  const cards = [
    {
      title: "Précisions / interdits",
      body: companyModule.tools.trim(),
      fallback:
        "Complément au registre : règles transverses et données interdites. À renseigner par votre RH.",
    },
    {
      title: "Charte IA",
      body: companyModule.charter.trim(),
      fallback:
        "Politique d'usage de l'IA à lire et accepter. Un modèle peut s'afficher si votre entreprise n'a pas encore de charte.",
    },
    {
      title: "Référent IA & DPO",
      body: companyModule.contacts.trim(),
      fallback:
        "Contacts pour poser une question ou signaler une erreur. En cas de doute : demandez avant d'utiliser un outil.",
    },
    {
      title: "Procédure de déclaration",
      body: companyModule.declaration.trim(),
      fallback:
        "Comment déclarer un nouvel outil ou usage : formulaire, délai, statut « en analyse ».",
    },
  ];

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
        <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">Votre entreprise</h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          {filled ? `Consignes internes · ${companyName}` : `En attente de votre RH · ${companyName}`}
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="text-center text-sm font-semibold text-slate-900 dark:text-white">
          Registre des usages IA
        </p>
        {useCases.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {useCases.map((row) => {
              const details = [
                ["Service", row.service],
                ["Propriétaire", row.owner],
                ["Population", row.population],
                ["Fournisseur", row.vendor],
                ["Finalité", row.purpose],
                ["Données", row.data],
                ["Base légale", row.legalBasis],
                ["Art. 22", row.article22],
                ["AI Act", row.aiAct],
                ["Justification", row.aiActJustification],
                ["AIPD", row.aipd],
                ["DPA", row.dpa],
                ["Transferts", row.transfers],
                ["Réévaluation", row.reviewAt],
              ].filter(([, value]) => value.trim());
              return (
                <li
                  key={row.id}
                  className="rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {row.tool || "Usage"} · {AI_USE_CASE_STATUS_LABELS[row.status]}
                  </p>
                  {details.length > 0 && (
                    <dl className="mt-1.5 space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
                      {details.map(([label, value]) => (
                        <div key={label}>
                          <dt className="inline font-medium text-slate-500">{label} : </dt>
                          <dd className="inline">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-center text-xs italic text-slate-400">
            Votre RH n&apos;a pas encore renseigné le registre des outils IA.
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-600 dark:hover:bg-blue-950/30"
          >
            <p className="text-center text-sm font-semibold text-slate-900 dark:text-white">{card.title}</p>
            <div className="mt-2">
              {card.body ? (
                <PlainText text={card.body} compact />
              ) : (
                <p className="text-justify text-xs italic leading-relaxed text-slate-400 hyphens-auto">{card.fallback}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-justify text-xs text-slate-400 hyphens-auto">
        Ce module n&apos;entre pas dans le QCM : son contenu est renseigné par votre RH.
      </p>
      <button
        type="button"
        onClick={onComplete}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 active:translate-y-0 active:scale-[0.98]"
      >
        {done ? "Retour au parcours" : "J'ai pris connaissance"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function formatExamTimer(secondsLeft: number) {
  const overdue = secondsLeft < 0;
  const abs = Math.abs(secondsLeft);
  const minutes = Math.floor(abs / 60);
  const seconds = abs % 60;
  const body = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  return overdue ? `+${body}` : body;
}

function useExamCountdown(active: boolean) {
  const [secondsLeft, setSecondsLeft] = useState(QUIZ_TIMER_SECONDS);
  useEffect(() => {
    if (!active) return;
    setSecondsLeft(QUIZ_TIMER_SECONDS);
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => value - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active]);
  return secondsLeft;
}

function ExamTimer({ secondsLeft }: { secondsLeft: number }) {
  const overdue = secondsLeft < 0;
  const urgent = !overdue && secondsLeft <= 120;
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-sm font-semibold tabular-nums ${
        overdue
          ? "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
          : urgent
            ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
            : "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
      }`}
      title="Chronomètre indicatif — l'examen continue même après 0:00"
    >
      <Timer className="h-3.5 w-3.5" />
      <span>{formatExamTimer(secondsLeft)}</span>
    </div>
  );
}

function QuizScreen({
  variant,
  shuffled,
  index,
  answers,
  reveal,
  done,
  briefed = true,
  onBack,
  onBriefingDone,
  onSelect,
  onValidate,
  onNext,
  onRetry,
  onContinueCareer,
  continueCareerLabel,
  continueCareerHint,
  onFinish,
  score,
  correctCount,
  questionCount,
  attempts,
}: {
  variant: "final" | "positioning";
  shuffled: ShuffledQuestion[];
  index: number;
  answers: (number | null)[];
  reveal: boolean;
  done: boolean;
  briefed?: boolean;
  onBack: () => void;
  onBriefingDone?: () => void;
  onSelect: (originalIndex: number) => void;
  onValidate?: () => void;
  onNext: () => void;
  onRetry?: () => void;
  onContinueCareer?: () => void;
  continueCareerLabel?: string;
  continueCareerHint?: string;
  onFinish: () => void;
  score: number | null;
  correctCount?: number | null;
  questionCount?: number;
  attempts: number;
}) {
  const timerActive = variant === "final" && briefed && !done;
  const secondsLeft = useExamCountdown(timerActive);
  const nextLabel = continueCareerLabel ?? "Continuer le parcours métier";
  const nextHint =
    continueCareerHint ??
    "Seuil atteint. Il reste une dernière étape pour débloquer l'attestation : le parcours métier (~10 min).";

  if (done && variant === "final" && shuffled.length === 0) {
    const goNext = Boolean(onContinueCareer);
    return (
      <div className="mx-auto max-w-lg space-y-6 py-8 text-center">
        <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">Examen final</h1>
        <p className="text-center text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">
          {score ?? "—"} %
        </p>
        <p className="mx-auto max-w-md text-center text-sm text-slate-500">
          {goNext ? nextHint : "Examen validé. Votre parcours est déjà complété."}
        </p>
        <div className="flex flex-col items-center gap-3">
          {goNext ? (
            <button
              type="button"
              onClick={onContinueCareer}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {nextLabel}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onFinish}
            className="text-sm font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline dark:hover:text-slate-300"
          >
            Retour au menu
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    const passed = variant === "final" && (score ?? 0) >= QUIZ_PASS_PERCENT;
    const canRetry = variant === "final" && !passed && Boolean(onRetry);
    const goNext = passed && Boolean(onContinueCareer);
    return (
      <div className="mx-auto max-w-lg space-y-6 py-8 text-center">
        <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">
          {variant === "positioning" ? "Votre profil de départ" : "Résultat de l'examen"}
        </h1>
        {variant === "positioning" ? (
          <p className="text-center text-xl font-semibold text-slate-900 dark:text-white">
            {correctCount ?? 0}/{questionCount ?? 0} réponses correctes
          </p>
        ) : (
          <p
            className={`text-center text-4xl font-extrabold ${
              passed ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white"
            }`}
          >
            {score} %
          </p>
        )}
        <p className="mx-auto max-w-md text-center text-sm text-slate-500">
          {variant === "positioning"
            ? "Ce résultat sert uniquement à mesurer votre progression pendant la formation."
            : passed
              ? goNext
                ? nextHint
                : "Examen validé. Votre parcours est déjà complété."
              : `Vous avez fait ${attempts} tentative${attempts > 1 ? "s" : ""}. Retentez votre chance.`}
        </p>
        <div className="flex flex-col items-center gap-3">
          {canRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              Retenter
            </button>
          )}
          {goNext ? (
            <button
              type="button"
              onClick={onContinueCareer}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {nextLabel}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onFinish}
            className={
              goNext || canRetry
                ? "text-sm font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline dark:hover:text-slate-300"
                : "rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            }
          >
            {variant === "positioning"
              ? "Continuer le socle"
              : goNext
                ? "Plus tard"
                : "Retour au parcours"}
          </button>
        </div>
      </div>
    );
  }

  if (variant === "final" && !briefed) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="rounded-2xl border border-slate-300 bg-white px-5 py-6 dark:border-slate-600 dark:bg-slate-900 sm:px-7">
          <p className="text-center text-[11px] font-bold tracking-[0.18em] text-slate-500 uppercase">
            Examen de validation
          </p>
          <h1 className="mt-2 text-center text-2xl font-bold text-slate-900 dark:text-white">
            Avant de commencer
          </h1>
          <p className="mx-auto mt-3 max-w-md text-justify text-sm leading-relaxed text-slate-600 hyphens-auto dark:text-slate-300">
            Ce QCM est noté. Dès la réussite, votre avancement passe à 100 %. L&apos;attestation
            demande ensuite le module entreprise et le parcours métier.
          </p>

          <ul className="mx-auto mt-6 max-w-md space-y-3 text-justify text-sm leading-relaxed text-slate-700 hyphens-auto dark:text-slate-200">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-400 text-[11px] font-bold text-slate-600 dark:border-slate-500 dark:text-slate-300">
                1
              </span>
              <span>
                <span className="block">
                  <strong className="font-semibold text-slate-900 dark:text-white">
                    {QUIZ_DRAW_SIZE} questions
                  </strong>
                  , tirées parmi l&apos;ensemble du socle.
                </span>
                <span className="mt-1 block">
                  Seuil de réussite :{" "}
                  <strong className="font-semibold text-slate-900 dark:text-white">
                    {QUIZ_PASS_PERCENT} %
                  </strong>
                  .
                </span>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-400 text-[11px] font-bold text-slate-600 dark:border-slate-500 dark:text-slate-300">
                2
              </span>
              <span>
                Sélectionnez une réponse via le{" "}
                <strong className="font-semibold text-slate-900 dark:text-white">point à gauche</strong>,
                puis validez. Vous pouvez changer d&apos;avis avant validation.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-500 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                !
              </span>
              <span>
                Lisez chaque question entièrement.
              </span>
            </li>
          </ul>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onBriefingDone}
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            Commencer l&apos;examen
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const current = shuffled[index];
  if (!current) return null;
  const selected = answers[index];
  const isFinal = variant === "final";

  return (
    <div className={`mx-auto space-y-6 ${isFinal ? "max-w-xl" : "max-w-2xl"}`}>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-200 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          {variant === "positioning" ? "Retour" : "Quitter l'examen"}
        </button>
        {timerActive && <ExamTimer secondsLeft={secondsLeft} />}
      </div>

      <div className="text-center">
        <p
          className={`text-xs font-semibold tracking-wide uppercase ${
            isFinal ? "text-slate-500" : "text-blue-600 dark:text-blue-400"
          }`}
        >
          {variant === "positioning"
            ? "Positionnement · "
            : `Examen final · Tentative n°${attempts + 1} · `}
          Question {index + 1} / {shuffled.length}
        </p>
        <h1 className="mt-3 text-center text-lg font-bold leading-snug text-slate-900 dark:text-white sm:text-xl">
          {current.q.prompt}
        </h1>
        {variant === "positioning" && index === 0 && !reveal && (
          <p className="mx-auto mt-3 max-w-md text-center text-sm text-slate-500">
            Ce n&apos;est pas un examen de droit : on apprend des réflexes pour utiliser l&apos;IA sans risque.
          </p>
        )}
      </div>

      <ul className="space-y-2">
        {current.options.map((opt) => {
          const isSelected = selected === opt.index;
          const isCorrect = opt.index === current.q.correctIndex;

          if (isFinal) {
            let row =
              "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900";
            let radio = "border-slate-400 dark:border-slate-500";
            let label = "text-slate-800 dark:text-slate-100";
            if (reveal && isCorrect) {
              row = "border-emerald-600 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40";
              radio = "border-emerald-600 bg-emerald-600";
              label = "text-emerald-950 dark:text-emerald-50";
            } else if (reveal && isSelected && !isCorrect) {
              row = "border-red-700 bg-red-50 dark:border-red-800 dark:bg-red-950/40";
              radio = "border-red-700 bg-red-700";
              label = "text-red-950 dark:text-red-50";
            } else if (isSelected) {
              row = "border-slate-800 bg-slate-50 dark:border-slate-300 dark:bg-slate-800";
              radio = "border-slate-900 dark:border-white";
              label = "text-slate-900 dark:text-white";
            }
            return (
              <li key={opt.text}>
                <button
                  type="button"
                  disabled={reveal}
                  onClick={() => onSelect(opt.index)}
                  className={`flex w-full items-start gap-3 rounded-lg border px-3.5 py-3.5 text-left transition enabled:hover:border-slate-500 disabled:cursor-default sm:px-4 ${row}`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${radio}`}
                    aria-hidden
                  >
                    {(isSelected || (reveal && isCorrect)) && (
                      <span
                        className={`h-2 w-2 rounded-full ${
                          reveal && isCorrect
                            ? "bg-white"
                            : reveal && isSelected && !isCorrect
                              ? "bg-white"
                              : "bg-slate-900 dark:bg-white"
                        }`}
                      />
                    )}
                  </span>
                  <span className={`text-sm leading-snug ${label}`}>{opt.text}</span>
                </button>
              </li>
            );
          }

          let style =
            "border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:border-blue-600 dark:hover:bg-blue-950/30";
          if (reveal && isCorrect) style = "border-emerald-700 bg-emerald-600 font-semibold text-white";
          else if (reveal && isSelected && !isCorrect) style = "border-red-900 bg-red-800 font-semibold text-white";
          else if (isSelected) style = "border-blue-400 bg-blue-50 text-slate-800 dark:bg-blue-950/30 dark:text-slate-100";
          return (
            <li key={opt.text}>
              <button
                type="button"
                disabled={reveal}
                onClick={() => onSelect(opt.index)}
                className={`w-full rounded-xl border px-4 py-3 text-center text-sm transition duration-300 ease-out enabled:hover:-translate-y-1 enabled:hover:border-blue-400 enabled:hover:bg-blue-50 enabled:hover:shadow-lg enabled:hover:shadow-blue-500/25 disabled:cursor-default dark:enabled:hover:border-blue-500 dark:enabled:hover:bg-blue-950/40 ${style}`}
              >
                {opt.text}
              </button>
            </li>
          );
        })}
      </ul>

      {isFinal && !reveal && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            disabled={selected === null}
            onClick={onValidate}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:enabled:hover:bg-slate-100"
          >
            Valider la réponse
          </button>
        </div>
      )}

      {reveal && (
        <div
          className={
            isFinal
              ? "rounded-lg border border-slate-300 bg-slate-50 px-4 py-4 dark:border-slate-600 dark:bg-slate-900/80"
              : "rounded-2xl border-2 border-blue-400 bg-blue-50 px-6 py-6 text-center shadow-lg shadow-blue-500/15 dark:border-blue-500 dark:bg-blue-950/60"
          }
        >
          <p
            className={
              isFinal
                ? "text-xs font-bold tracking-wide text-slate-500 uppercase"
                : "text-center text-xs font-bold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300"
            }
          >
            {isFinal ? "Correction" : "À retenir"}
          </p>
          <p
            className={
              isFinal
                ? "mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-100"
                : "mt-3 text-justify text-base font-semibold leading-relaxed text-slate-900 hyphens-auto dark:text-white"
            }
          >
            {current.q.explanation}
          </p>
        </div>
      )}

      {reveal && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onNext}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${
              isFinal
                ? "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                : "bg-blue-600 shadow-md shadow-blue-600/20 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 active:translate-y-0 active:scale-[0.98]"
            }`}
          >
            {index < shuffled.length - 1 ? "Question suivante" : "Voir le résultat"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

const CAREER_CARD_STYLE: Record<
  string,
  { emoji: string; card: string; selected: string }
> = {
  direction: {
    emoji: "🏛️",
    card: "border-violet-200 bg-violet-50/80 hover:border-violet-400 hover:bg-violet-100/80 dark:border-violet-800 dark:bg-violet-950/30 dark:hover:border-violet-600",
    selected: "border-violet-500 bg-violet-100 ring-2 ring-violet-300/60 dark:border-violet-400 dark:bg-violet-950/50 dark:ring-violet-700",
  },
  rh: {
    emoji: "🤝",
    card: "border-rose-200 bg-rose-50/80 hover:border-rose-400 hover:bg-rose-100/80 dark:border-rose-800 dark:bg-rose-950/30 dark:hover:border-rose-600",
    selected: "border-rose-500 bg-rose-100 ring-2 ring-rose-300/60 dark:border-rose-400 dark:bg-rose-950/50 dark:ring-rose-700",
  },
  marketing: {
    emoji: "📣",
    card: "border-orange-200 bg-orange-50/80 hover:border-orange-400 hover:bg-orange-100/80 dark:border-orange-800 dark:bg-orange-950/30 dark:hover:border-orange-600",
    selected: "border-orange-500 bg-orange-100 ring-2 ring-orange-300/60 dark:border-orange-400 dark:bg-orange-950/50 dark:ring-orange-700",
  },
  managers: {
    emoji: "🧭",
    card: "border-sky-200 bg-sky-50/80 hover:border-sky-400 hover:bg-sky-100/80 dark:border-sky-800 dark:bg-sky-950/30 dark:hover:border-sky-600",
    selected: "border-sky-500 bg-sky-100 ring-2 ring-sky-300/60 dark:border-sky-400 dark:bg-sky-950/50 dark:ring-sky-700",
  },
  tech: {
    emoji: "💻",
    card: "border-emerald-200 bg-emerald-50/80 hover:border-emerald-400 hover:bg-emerald-100/80 dark:border-emerald-800 dark:bg-emerald-950/30 dark:hover:border-emerald-600",
    selected: "border-emerald-500 bg-emerald-100 ring-2 ring-emerald-300/60 dark:border-emerald-400 dark:bg-emerald-950/50 dark:ring-emerald-700",
  },
  tous: {
    emoji: "✨",
    card: "border-slate-200 bg-slate-50/90 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-slate-500",
    selected: "border-slate-500 bg-slate-100 ring-2 ring-slate-300/60 dark:border-slate-400 dark:bg-slate-800 dark:ring-slate-600",
  },
};

function CareerScreen({
  selected,
  onBack,
  onSelect,
}: {
  selected: string | null;
  onBack: () => void;
  onSelect: (id: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [caseRevealed, setCaseRevealed] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizReveal, setQuizReveal] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const path = CAREER_PATHS.find((item) => item.id === openId) ?? null;
  const careerChoices = [...CAREER_PATHS].sort((a, b) =>
    a.id === "tous" ? 1 : b.id === "tous" ? -1 : 0,
  );

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
          <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">Parcours métier</h1>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-500">
            Choisissez le parcours le plus proche de votre métier. Un seul suffit : vidéo, cas pratique, puis 3 questions.
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
                  onClick={() => {
                    setOpenId(item.id);
                    setCaseRevealed(false);
                    setQuizIndex(0);
                    setQuizReveal(false);
                    setPicked(null);
                  }}
                  className={`w-full rounded-xl border px-4 py-3.5 text-center shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md ${
                    isSelected ? style.selected : style.card
                  }`}
                >
                  <span className="mb-1 block text-lg leading-none" aria-hidden>
                    {style.emoji}
                  </span>
                  <p className="text-center text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const question = path.questions[quizIndex]!;
  const options = question.choices.map((text, index) => ({ text, index }));
  const finished = quizReveal && quizIndex === path.questions.length - 1;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button
        type="button"
        onClick={() => setOpenId(null)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-200 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Tous les parcours
      </button>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{path.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{path.focus}</p>
      </div>
      <VideoScript format="vidéo métier" duration={path.duration} script={path.script} />
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cas pratique</p>
        <p className="mt-2 text-justify text-sm text-slate-800 dark:text-slate-100">{path.casePrompt}</p>
        {!caseRevealed ? (
          <button
            type="button"
            onClick={() => setCaseRevealed(true)}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Voir la correction expliquée
          </button>
        ) : (
          <p className="mt-4 text-justify text-sm text-emerald-900 dark:text-emerald-100">{path.caseCorrection}</p>
        )}
      </div>
      {caseRevealed && (
        <div className="space-y-3">
          <p className="text-center text-xs font-semibold text-blue-600 dark:text-blue-400">
            Question {quizIndex + 1} / {path.questions.length}
          </p>
          <h2 className="text-center text-base font-bold text-slate-900 dark:text-white">{question.prompt}</h2>
          <ul className="space-y-2">
            {options.map((opt) => {
              const isSelected = picked === opt.index;
              const isCorrect = opt.index === question.correctIndex;
              let style = "border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";
              if (quizReveal && isCorrect) style = "border-emerald-700 bg-emerald-600 font-semibold text-white";
              else if (quizReveal && isSelected && !isCorrect) style = "border-red-900 bg-red-800 font-semibold text-white";
              else if (isSelected) style = "border-blue-400 bg-blue-50 text-slate-800 dark:bg-blue-950/30 dark:text-slate-100";
              return (
                <li key={opt.text}>
                  <button
                    type="button"
                    disabled={quizReveal}
                    onClick={() => {
                      setPicked(opt.index);
                      setQuizReveal(true);
                    }}
                    className={`w-full rounded-xl border px-4 py-3 text-center text-sm ${style}`}
                  >
                    {opt.text}
                  </button>
                </li>
              );
            })}
          </ul>
          {quizReveal && (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-justify text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {question.explanation}
            </p>
          )}
          {quizReveal && !finished && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setQuizIndex((i) => i + 1);
                  setQuizReveal(false);
                  setPicked(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Question suivante
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
          {finished && !selected && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onSelect(path.id)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Valider et obtenir l&apos;attestation
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
          {finished && (
            <p className="text-justify text-sm text-slate-600 hyphens-auto dark:text-slate-300">
              On peut évidemment aller très loin en IA, n&apos;hésitez pas à vous renseigner.
            </p>
          )}
          {finished && selected === path.id && (
            <p className="text-center text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Parcours déjà validé.
            </p>
          )}
          {finished && selected && selected !== path.id && (
            <p className="text-center text-sm text-slate-500">
              Un parcours est déjà validé. Le socle ne se complète qu&apos;avec un seul métier.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
