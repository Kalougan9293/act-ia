"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  Download,
  GraduationCap,
  Lock,
  Play,
  Smartphone,
  Timer,
  Trophy,
} from "lucide-react";
import ActivityPlayer from "@/components/user/ActivityPlayer";
import CareerScreen from "@/components/user/CareerScreen";
import LexiconBar, { FloatingLexiconFab } from "@/components/user/LexiconTip";
import { useConnectionLog } from "@/components/user/useConnectionLog";
import { useFormationProgress } from "@/components/user/useFormationProgress";
import CertificatePreview from "@/components/demo/CertificatePreview";
import { downloadLearnerAttestation } from "@/lib/export/attestations";
import type { IssuedCertificate } from "@/lib/firebase/formation-progress";
import {
  certificateSerialFromId,
  formatProofDate,
  type FormationProgress,
} from "@/lib/formation/proof";
import { CAREER_PATHS } from "@/lib/formation/careers";
import { ASSISTANCE } from "@/lib/formation/assistance";
import {
  BLOCKS,
  FORMATION_PROMISE,
  REFLEXES_AFTER,
  REFLEXES_BEFORE,
  SOCLE_DURATION_LABEL,
  findChapter,
  type Block,
} from "@/lib/formation/curriculum";
import { witnessDemoCertificate } from "@/lib/formation/witness";
import {
  QUIZ_DRAW_SIZE,
  QUIZ_PASS_COUNT,
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
  | { kind: "satisfaction" }
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

function toRound(
  questions: QuizQuestion[],
  { shuffleOptions = true }: { shuffleOptions?: boolean } = {},
): ShuffledQuestion[] {
  return questions.map((q) => ({
    q,
    options: shuffleOptions
      ? shuffleChoices(q)
      : q.choices.map((text, index) => ({ text, index })),
  }));
}

export default function FormationExperience({
  uid,
  firstName,
  fullName,
  companyName,
  companyModule = emptyCompanyModule(),
  demo = false,
  demoSeed,
  /** Compte témoin exclusif (ex. c@gmail.com) : cadenas ouverts, rien n'est validé en base. */
  witnessDemo = false,
}: {
  uid: string;
  firstName: string;
  fullName: string;
  companyName: string;
  companyModule?: CompanyModuleContent;
  /** Mode démo publique : pas de Firestore, progression seedée. */
  demo?: boolean;
  demoSeed?: FormationProgress;
  witnessDemo?: boolean;
}) {
  const companyVisible = Boolean(companyModule.visible);
  const sandbox = demo || witnessDemo;
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
    recordSession,
    markSatisfaction,
  } = useFormationProgress(uid, {
    localOnly: sandbox,
    skipValidation: witnessDemo,
    seed: demoSeed,
  });

  useConnectionLog(ready && Boolean(uid) && !sandbox, recordSession);

  const [screen, setScreen] = useState<Screen | null>(null);
  const [positioningRound] = useState(() =>
    toRound(drawPositioningQuiz(), { shuffleOptions: false }),
  );
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
  /** Encadré d’accueil : masqué dès « Faisons connaissance » terminé (ou module 1.1). */
  const [firstModuleLaunched, setFirstModuleLaunched] = useState(false);

  const active: Screen = screen ?? { kind: "intro" };
  const hideWelcomePitch =
    progress.positioningDone ||
    firstModuleLaunched ||
    progress.completedChapters.includes("1.1");

  function openChapter(chapterId: string) {
    if (chapterId === "1.1") setFirstModuleLaunched(true);
    setScreen({ kind: "chapter", chapterId });
  }

  function withDesign(node: ReactNode) {
    return (
      <div data-design="v2" className="formation-shell relative my-auto w-full">
        {node}
      </div>
    );
  }

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
    return <p className="my-auto py-16 text-center text-sm text-slate-500">Chargement…</p>;
  }

  if (active.kind === "intro") {
    return withDesign(
      <IntroScreen
        firstName={firstName}
        fullName={fullName}
        companyName={companyName}
        certificate={certificate}
        quizScore={progress.quizScore}
        completedChapters={progress.completedChapters}
        positioningDone={progress.positioningDone}
        quizPassed={progress.quizPassed}
        companyDone={progress.companyModuleDone}
        companyVisible={companyVisible}
        careerPathId={progress.careerPathId}
        positioningCount={positioningRound.length}
        showWelcomePitch={!hideWelcomePitch}
        witnessDemo={witnessDemo}
        onOpenPositioning={() => {
          if (!progress.introDone) markIntroDone();
          setScreen({ kind: "positioning" });
        }}
        onOpenBlock={(blockId) => {
          if (!witnessDemo && !progress.positioningDone) return;
          if (!progress.introDone) markIntroDone();
          setScreen({ kind: "block", blockId });
        }}
        onOpenCompany={() => setScreen({ kind: "company" })}
        onOpenQuiz={() => openFinalQuiz("intro")}
        onOpenCareer={() => setScreen({ kind: "career" })}
        needsSatisfaction={progress.quizPassed && !progress.satisfaction}
        onOpenSatisfaction={() => setScreen({ kind: "satisfaction" })}
      />,
    );
  }

  if (active.kind === "positioning") {
    return withDesign(
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
          // Profil = nombre de « Oui » (index 0), pas un score de bonnes réponses.
          const yesCount = positioningAnswers.reduce<number>(
            (acc, answer) => acc + (answer === 0 ? 1 : 0),
            0,
          );
          const pct = Math.round((yesCount / positioningRound.length) * 100);
          setPositioningCorrect(yesCount);
          setPositioningScore(pct);
          setPositioningFinished(true);
        }}
        onFinish={() => {
          markPositioning(positioningScore ?? 0);
          setScreen({ kind: "intro" });
        }}
      />,
    );
  }

  if (active.kind === "hub") {
    return withDesign(
      <HubScreen
        firstName={firstName}
        fullName={fullName}
        companyName={companyName}
        percent={percent}
        doneChapters={doneChapters}
        totalChapters={totalChapters}
        progress={progress}
        certificate={certificate}
        companyVisible={companyVisible}
        onOpenBlock={(blockId) => setScreen({ kind: "block", blockId })}
        onOpenCompany={() => setScreen({ kind: "company" })}
        onOpenQuiz={() => openFinalQuiz("hub")}
        onOpenCareer={() => setScreen({ kind: "career" })}
        onOpenSatisfaction={() => setScreen({ kind: "satisfaction" })}
      />,
    );
  }

  if (active.kind === "block") {
    const block = BLOCKS.find((b) => b.id === active.blockId);
    if (!block) return null;
    return withDesign(
      <BlockScreen
        block={block}
        completed={progress.completedChapters}
        unlockAll={witnessDemo}
        onBack={() => setScreen({ kind: "intro" })}
        onOpenChapter={openChapter}
      />,
    );
  }

  if (active.kind === "chapter") {
    const found = findChapter(active.chapterId);
    if (!found) return null;
    const { block, chapter, index } = found;
    const next = block.chapters[index + 1];
    return withDesign(
      <ChapterScreen
        block={block}
        chapter={chapter}
        done={progress.completedChapters.includes(chapter.id)}
        onBack={() => setScreen({ kind: "block", blockId: block.id })}
        onComplete={() => {
          markChapterDone(chapter.id);
          if (next) openChapter(next.id);
          else setScreen({ kind: "intro" });
        }}
      />,
    );
  }

  if (active.kind === "company") {
    if (!companyVisible) {
      return withDesign(
        <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
          <p className="text-sm text-slate-500">Ce module n&apos;est pas activé pour votre entreprise.</p>
          <button
            type="button"
            onClick={() => setScreen({ kind: "intro" })}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Retour au parcours
          </button>
        </div>,
      );
    }
    return withDesign(
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
      />,
    );
  }

  if (active.kind === "quiz") {
    return withDesign(
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
        onContinueCareer={() => {
          const passed =
            progress.quizPassed ||
            (lastScore != null && lastScore >= QUIZ_PASS_PERCENT);
          if (passed && !progress.satisfaction) {
            setScreen({ kind: "satisfaction" });
            return;
          }
          setScreen({ kind: "career" });
        }}
        continueCareerLabel="Bonus : l'IA dans mon métier"
        continueCareerHint="Bravo ! Vous savez utiliser l'IA sans vous faire piéger. Attestation Art. 4 disponible. Les bonus restent facultatifs."
        onOpenCompany={
          companyVisible
            ? () => {
                const passed =
                  progress.quizPassed ||
                  (lastScore != null && lastScore >= QUIZ_PASS_PERCENT);
                if (passed && !progress.satisfaction) {
                  setScreen({ kind: "satisfaction" });
                  return;
                }
                setScreen({ kind: "company" });
              }
            : undefined
        }
        onFinish={() => {
          const passed =
            progress.quizPassed ||
            (lastScore != null && lastScore >= QUIZ_PASS_PERCENT);
          if (passed && !progress.satisfaction) {
            setScreen({ kind: "satisfaction" });
            return;
          }
          setScreen({ kind: quizReturn });
        }}
      />,
    );
  }

  if (active.kind === "satisfaction") {
    return withDesign(
      <SatisfactionScreen
        onSubmit={(payload) => {
          markSatisfaction(payload);
          setScreen({ kind: "intro" });
        }}
      />,
    );
  }

  if (active.kind === "career") {
    return withDesign(
      <CareerScreen
        selected={progress.careerPathId}
        onBack={() => setScreen({ kind: "intro" })}
        onSelect={(id) => {
          markCareer(id);
          setScreen({ kind: "intro" });
        }}
      />,
    );
  }

  return null;
}

function blockMenuState(
  block: Block,
  completed: string[],
  positioningDone: boolean,
  unlockAll = false,
): "done" | "current" | "locked" {
  const done = block.chapters.every((chapter) => completed.includes(chapter.id));
  if (done) return "done";
  if (unlockAll) return "current";
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
  /** Faisceau lumineux (défaut : oui si « current »). Désactivable ex. compte témoin. */
  orbit,
}: {
  label: string;
  title: string;
  meta: string;
  state: "done" | "current" | "locked";
  denied: boolean;
  onClick: () => void;
  lockedHint: string;
  doneHint: string;
  orbit?: boolean;
}) {
  const current = state === "current";
  const done = state === "done";
  const locked = state === "locked";
  const showOrbit = orbit ?? current;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full cursor-pointer rounded-xl border-0 bg-transparent p-[2px] text-left shadow-sm shadow-slate-200/80 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/20 dark:shadow-slate-950/50 ${
        showOrbit ? "shadow-blue-500/25" : ""
      } ${done ? "shadow-emerald-500/15" : ""} ${denied ? "block-deny shadow-red-500/40" : ""}`}
    >
      {showOrbit ? (
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
  fullName,
  companyName,
  certificate,
  quizScore,
  completedChapters,
  positioningDone,
  quizPassed,
  companyDone,
  companyVisible = false,
  careerPathId,
  positioningCount,
  showWelcomePitch,
  witnessDemo = false,
  onOpenPositioning,
  onOpenBlock,
  onOpenCompany,
  onOpenQuiz,
  onOpenCareer,
  needsSatisfaction,
  onOpenSatisfaction,
}: {
  firstName: string;
  fullName: string;
  companyName: string;
  certificate: IssuedCertificate | null;
  quizScore: number | null;
  completedChapters: string[];
  positioningDone: boolean;
  quizPassed: boolean;
  companyDone: boolean;
  companyVisible?: boolean;
  careerPathId: string | null;
  positioningCount: number;
  showWelcomePitch: boolean;
  witnessDemo?: boolean;
  onOpenPositioning: () => void;
  onOpenBlock: (blockId: string) => void;
  onOpenCompany: () => void;
  onOpenQuiz: () => void;
  onOpenCareer: () => void;
  needsSatisfaction: boolean;
  onOpenSatisfaction: () => void;
}) {
  const [deniedId, setDeniedId] = useState<string | null>(null);
  const chaptersDone = BLOCKS.every((block) =>
    block.chapters.every((chapter) => completedChapters.includes(chapter.id)),
  );
  const quizState: "done" | "current" | "locked" = quizPassed
    ? "done"
    : witnessDemo || (positioningDone && chaptersDone)
      ? "current"
      : "locked";
  const companyState: "done" | "current" | "locked" = companyDone
    ? "done"
    : witnessDemo || quizPassed
      ? "current"
      : "locked";
  const careerState: "done" | "current" | "locked" = careerPathId
    ? "done"
    : witnessDemo || quizPassed
      ? "current"
      : "locked";
  /** Témoin : attestation spécimen locale, jamais en base — affichée à droite de l’examen. */
  const displayCertificate = witnessDemo
    ? certificate ?? witnessDemoCertificate()
    : certificate;

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

  return (
    <div className="mx-auto max-w-3xl space-y-7 py-6 text-center sm:space-y-8">
      <div className="space-y-4 sm:space-y-5">
        <p className="formation-kicker text-center text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400 sm:text-sm">
          LockinIA Academy
        </p>
        <h1 className="formation-title text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Bienvenue{firstName ? `, ${firstName}` : ""}
        </h1>
        {showWelcomePitch && (
          <div className="mx-auto max-w-xl rounded-2xl border border-blue-200 bg-blue-50/70 px-5 py-4 dark:border-blue-800 dark:bg-blue-950/40">
            <p className="text-center text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-100 sm:text-base sm:leading-7">
              L&apos;IA peut vraiment vous faire gagner du temps. Cette formation sert à
              l&apos;utiliser{" "}
              <span className="text-blue-700 dark:text-blue-300">
                sans mettre en danger l&apos;entreprise ou vous-même
              </span>
              .
            </p>
          </div>
        )}
        <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
          {FORMATION_PROMISE}
        </p>
        <p className="text-center text-sm text-slate-500 sm:text-base">
          Parcours pour <span className="font-semibold text-slate-700 dark:text-slate-200">{companyName}</span>
        </p>
      </div>

      {needsSatisfaction && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
            Questionnaire de satisfaction
          </p>
          <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-200/80">
            Donnez votre avis à chaud — et une réclamation si besoin.
          </p>
          <button
            type="button"
            onClick={onOpenSatisfaction}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Répondre
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {displayCertificate && !witnessDemo && (
        <LearnerAttestation
          fullName={fullName}
          companyName={companyName}
          careerPathId={careerPathId}
          quizScore={quizScore}
          certificate={displayCertificate}
        />
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
          <span
            className={`relative flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full px-3 py-1.5 ${
              positioningDone
                ? "bg-emerald-50 dark:bg-emerald-950/40"
                : "bg-slate-50 dark:bg-slate-900"
            }`}
          >
            {positioningDone ? (
              <Check className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" aria-hidden />
            )}
            <span>
              {positioningDone
                ? "Faisons connaissance — terminé"
                : `Faisons connaissance · ${positioningCount} questions rapides`}
            </span>
          </span>
          <span className="sr-only">
            {positioningDone ? "Positionnement terminé" : "Ouvrir le positionnement"}
          </span>
        </button>

        <div className="grid w-full items-start gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {BLOCKS.map((block) => {
            const state = blockMenuState(
              block,
              completedChapters,
              positioningDone,
              witnessDemo,
            );
            return (
              <PathCard
                key={block.id}
                label={`Bloc ${block.number} · ${block.duration}`}
                title={block.title}
                meta={`${block.chapters.length} chapitre${block.chapters.length > 1 ? "s" : ""}`}
                state={state}
                orbit={witnessDemo ? false : undefined}
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

        <div className="relative mx-auto mt-3 w-fit">
          <button
            type="button"
            onClick={() => openOrDeny("quiz", quizState === "locked", onOpenQuiz)}
            className={`group relative flex w-fit cursor-pointer rounded-2xl border-0 bg-transparent p-[2px] text-center shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md ${
              quizState === "done"
                ? "shadow-emerald-500/20 hover:shadow-emerald-500/30"
                : "shadow-rose-500/20 hover:shadow-rose-500/35"
            } ${deniedId === "quiz" ? "block-deny shadow-red-500/40" : ""}`}
          >
            {quizState === "current" && !witnessDemo ? (
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
                  {QUIZ_DRAW_SIZE} questions
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

          {witnessDemo && displayCertificate ? (
            <div className="absolute left-full top-1/2 z-10 ml-2 hidden -translate-y-1/2 sm:block">
              <LearnerAttestation
                fullName={fullName}
                companyName={companyName}
                careerPathId={careerPathId}
                quizScore={displayCertificate.quizScore ?? quizScore}
                certificate={displayCertificate}
                beside
              />
            </div>
          ) : null}
        </div>

        {witnessDemo && displayCertificate ? (
          <div className="mx-auto mt-2 w-fit sm:hidden">
            <LearnerAttestation
              fullName={fullName}
              companyName={companyName}
              careerPathId={careerPathId}
              quizScore={displayCertificate.quizScore ?? quizScore}
              certificate={displayCertificate}
              beside
            />
          </div>
        ) : null}

        <div
          className={`mx-auto mt-4 grid w-full max-w-xl gap-2.5 ${
            companyVisible ? "sm:grid-cols-2" : ""
          }`}
        >
          {companyVisible && (
            <PathCard
              label="Bonus"
              title="Votre entreprise"
              meta={companyDone ? "Consulté" : "Optionnel"}
              state={companyState}
              orbit={witnessDemo ? false : undefined}
              denied={deniedId === "company"}
              onClick={() => openOrDeny("company", companyState === "locked", onOpenCompany)}
              lockedHint="Disponible après l'attestation"
              doneHint="Module consulté"
            />
          )}
          <PathCard
            label="Bonus"
            title="Fiche métier"
            meta={careerPathId ? "Validé" : "Optionnel"}
            state={careerState}
            orbit={witnessDemo ? false : undefined}
            denied={deniedId === "career"}
            onClick={() => openOrDeny("career", careerState === "locked", onOpenCareer)}
            lockedHint="Disponible après l'attestation"
            doneHint="Fiche métier validée"
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-xl space-y-1.5 pt-6 text-center text-xs text-slate-400">
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span>À faire en une ou plusieurs fois · {SOCLE_DURATION_LABEL}</span>
          <span className="inline-flex items-center gap-1">
            <Smartphone className="h-4 w-4 shrink-0" aria-hidden />
            Compatible téléphone
          </span>
        </p>
        <p className="mx-auto max-w-md text-center leading-relaxed">
          Assistance : {ASSISTANCE.referentPedagogique.name} (péda & technique) ·
          réponse {ASSISTANCE.responseDelay} ·{" "}
          <a
            href={`mailto:${ASSISTANCE.email}`}
            className="underline decoration-slate-300 underline-offset-2 hover:text-slate-500 dark:decoration-slate-600 dark:hover:text-slate-300"
          >
            {ASSISTANCE.email}
          </a>
          {" · "}
          <a
            href={ASSISTANCE.phoneHref}
            className="underline decoration-slate-300 underline-offset-2 hover:text-slate-500 dark:decoration-slate-600 dark:hover:text-slate-300"
          >
            {ASSISTANCE.phone}
          </a>
        </p>
      </div>
      {careerPathId && (
        <p className="text-center text-sm text-slate-600 dark:text-slate-300">
          On peut évidemment aller très loin en IA, n&apos;hésitez pas à vous renseigner.
        </p>
      )}
    </div>
  );
}

const SATISFACTION_LEVELS = [
  {
    value: 1,
    label: "Tiède",
    height: "h-10",
    idle: "border-slate-300 bg-slate-200 group-hover:border-slate-400 group-hover:bg-slate-300 dark:border-slate-600 dark:bg-slate-700",
    fill: "border-slate-500 bg-gradient-to-t from-slate-500 to-slate-300 dark:border-slate-400 dark:from-slate-500 dark:to-slate-300",
    exact:
      "border-slate-600 bg-gradient-to-t from-slate-600 to-slate-300 shadow-md shadow-slate-400/30 dark:border-slate-300",
    text: "text-slate-600 dark:text-slate-300",
    anim: "rate-anim-1",
  },
  {
    value: 2,
    label: "Correct",
    height: "h-14",
    idle: "border-sky-200 bg-sky-50 group-hover:border-sky-300 group-hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/40",
    fill: "border-sky-400 bg-gradient-to-t from-sky-600 to-sky-300 dark:border-sky-400",
    exact:
      "border-sky-600 bg-gradient-to-t from-sky-700 to-sky-300 shadow-md shadow-sky-400/30 dark:border-sky-300",
    text: "text-sky-700 dark:text-sky-300",
    anim: "rate-anim-2",
  },
  {
    value: 3,
    label: "Bien",
    height: "h-[4.5rem]",
    idle: "border-emerald-200 bg-emerald-50 group-hover:border-emerald-300 group-hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40",
    fill: "border-emerald-400 bg-gradient-to-t from-emerald-600 to-emerald-300 dark:border-emerald-400",
    exact:
      "border-emerald-600 bg-gradient-to-t from-emerald-700 to-emerald-300 shadow-md shadow-emerald-400/35 dark:border-emerald-300",
    text: "text-emerald-700 dark:text-emerald-300",
    anim: "rate-anim-3",
  },
  {
    value: 4,
    label: "Très bien",
    height: "h-24",
    idle: "border-amber-200 bg-amber-50 group-hover:border-amber-300 group-hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40",
    fill: "border-amber-400 bg-gradient-to-t from-amber-600 to-amber-300 dark:border-amber-400",
    exact:
      "border-amber-500 bg-gradient-to-t from-amber-600 to-yellow-300 shadow-md shadow-amber-400/40 dark:border-amber-300",
    text: "text-amber-700 dark:text-amber-300",
    anim: "rate-anim-4",
  },
  {
    value: 5,
    label: "Au top",
    height: "h-28",
    idle: "border-orange-200 bg-orange-50 group-hover:border-orange-300 group-hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950/40",
    fill: "border-orange-500 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-300 dark:border-orange-400",
    exact:
      "border-orange-400 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-300 shadow-lg shadow-orange-500/50 dark:border-yellow-300",
    text: "text-orange-600 dark:text-orange-300",
    anim: "rate-anim-5",
  },
] as const;

function SatisfactionScreen({
  onSubmit,
}: {
  onSubmit: (payload: {
    rating: number;
    comment: string;
    complaint: string;
  }) => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [complaint, setComplaint] = useState("");
  const selected = SATISFACTION_LEVELS.find((level) => level.value === rating);

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Votre avis à chaud
      </h1>

      <div className="mx-auto flex w-full max-w-md flex-col items-center space-y-3 text-center">
        <div
          className="flex w-full items-end justify-center gap-2.5 sm:gap-3"
          role="radiogroup"
          aria-label="Note de 1 à 5"
        >
          {SATISFACTION_LEVELS.map((level) => {
            const active = rating >= level.value;
            const exact = rating === level.value;
            return (
              <button
                key={level.value}
                type="button"
                role="radio"
                aria-checked={exact}
                aria-label={`${level.value} sur 5 — ${level.label}`}
                onClick={() => setRating(level.value)}
                className="group relative flex w-12 flex-col items-center gap-2 sm:w-14"
              >
                <span className="relative w-full">
                  {exact && level.value === 5 && (
                    <span className="pointer-events-none absolute inset-x-0 -top-4 z-10 flex justify-center gap-0.5" aria-hidden>
                      <span
                        className="rate-flame h-4 w-2.5 rounded-full bg-gradient-to-t from-red-600 via-orange-500 to-yellow-300"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="rate-flame h-5 w-3 rounded-full bg-gradient-to-t from-red-500 via-orange-400 to-yellow-200"
                        style={{ animationDelay: "90ms" }}
                      />
                      <span
                        className="rate-flame h-3.5 w-2 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-200"
                        style={{ animationDelay: "160ms" }}
                      />
                    </span>
                  )}
                  <span
                    className={`relative block w-full rounded-t-xl rounded-b-md border-2 transition duration-300 ${level.height} ${
                      active ? (exact ? level.exact : level.fill) : level.idle
                    } ${exact ? level.anim : ""}`}
                  />
                </span>
                <span
                  className={`text-[11px] font-bold tabular-nums transition ${
                    exact
                      ? level.text
                      : active
                        ? "text-slate-600 dark:text-slate-300"
                        : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {level.value}
                </span>
              </button>
            );
          })}
        </div>
        <p
          className={`mx-auto min-h-[1.25rem] w-full text-center text-sm font-semibold transition ${
            selected ? selected.text : "text-transparent"
          }`}
          aria-live="polite"
        >
          {selected?.label ?? "Choisissez"}
        </p>
      </div>

      <label className="mx-auto block w-full max-w-md space-y-1.5 text-center">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Commentaire (optionnel)
        </span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-2.5 text-center text-sm font-medium text-slate-900 placeholder:text-slate-500 dark:border-slate-500 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400"
          placeholder="Ce qui vous a aidé, ce qui manque…"
        />
      </label>

      <label className="mx-auto block w-full max-w-md space-y-1.5 text-center">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Réclamation (optionnel)
        </span>
        <textarea
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          rows={3}
          className="w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-2.5 text-center text-sm font-medium text-slate-900 placeholder:text-slate-500 dark:border-slate-500 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-400"
          placeholder="Décrivez le problème rencontré…"
        />
      </label>

      <p className="text-center text-xs text-slate-400">
        Canal réclamations :{" "}
        <a
          href={`mailto:${ASSISTANCE.email}?subject=${encodeURIComponent("Réclamation formation LockinIA")}`}
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          {ASSISTANCE.email}
        </a>
        {" · "}
        <a
          href={ASSISTANCE.phoneHref}
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          {ASSISTANCE.phone}
        </a>
      </p>

      <div className="flex justify-center">
        <button
          type="button"
          disabled={rating < 1}
          onClick={() => onSubmit({ rating, comment, complaint })}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          Envoyer
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function LearnerAttestation({
  fullName,
  companyName,
  careerPathId,
  quizScore,
  certificate,
  beside = false,
}: {
  fullName: string;
  companyName: string;
  careerPathId: string | null;
  quizScore: number | null;
  certificate: IssuedCertificate;
  /** Compacte à droite de l’examen final (compte témoin). */
  beside?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { date, time } = formatProofDate(certificate.issuedAt);
  const proof = {
    score: certificate.quizScore ?? quizScore ?? 80,
    date,
    time,
    serial: certificateSerialFromId(certificate.id),
    certificateId: certificate.id,
    specimen: false as const,
    issuedAt: certificate.issuedAt,
  };
  const role = CAREER_PATHS.find((path) => path.id === careerPathId)?.title ?? "Collaborateur";

  function download() {
    downloadLearnerAttestation({
      fullName,
      role,
      companyName,
      certificateId: certificate.id,
      quizScore: proof.score,
      issuedAt: certificate.issuedAt,
      dateLabel: date,
      timeLabel: time,
      timeSpentSec: certificate.timeSpentSec,
      modulesCompleted: certificate.modulesCompleted,
    });
  }

  return (
    <>
      <div
        className={
          beside
            ? "flex w-max max-w-[13.5rem] items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-left shadow-sm dark:border-emerald-800 dark:bg-emerald-950/30"
            : "rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-800 dark:bg-emerald-950/30"
        }
      >
        {beside ? (
          <>
            <GraduationCap
              className="h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-300"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold leading-tight text-emerald-900 dark:text-emerald-100">
                Attestation
              </p>
              <p className="truncate font-mono text-[9px] leading-tight text-emerald-800/75 dark:text-emerald-200/75">
                {certificate.id}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-md bg-emerald-600 px-1.5 py-1 text-[10px] font-semibold leading-none text-white transition hover:bg-emerald-700"
              >
                Voir
              </button>
              <button
                type="button"
                onClick={download}
                aria-label="Télécharger l'attestation"
                className="inline-flex items-center justify-center rounded-md border border-emerald-300 bg-white p-1 text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100"
              >
                <Download className="h-3 w-3" />
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-center text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              Attestation de suivi · {certificate.id}
            </p>
            <p className="mt-1 text-center text-xs text-emerald-800/80 dark:text-emerald-200/80">
              Examen validé. Vous pouvez la consulter ou la télécharger.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <GraduationCap className="h-4 w-4" />
                Voir mon attestation
              </button>
              <button
                type="button"
                onClick={download}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100"
              >
                <Download className="h-4 w-4" />
                Télécharger
              </button>
            </div>
          </>
        )}
      </div>
      {open && (
        <CertificatePreview
          employee={{
            id: "self",
            name: fullName,
            email: "",
            role,
            path: "Socle IA",
            status: "done",
            percent: 100,
            lastSeen: proof.date,
            certificateId: proof.certificateId,
            certifiedAt: certificate.issuedAt,
            quizScore: proof.score,
            companyName,
          }}
          companyName={companyName}
          proof={{
            ...proof,
            timeSpentSec: certificate.timeSpentSec,
            modulesCompleted: certificate.modulesCompleted,
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
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
  companyVisible = false,
  onOpenBlock,
  onOpenCompany,
  onOpenQuiz,
  onOpenCareer,
  onOpenSatisfaction,
}: {
  firstName: string;
  fullName: string;
  companyName: string;
  percent: number;
  doneChapters: number;
  totalChapters: number;
  progress: ReturnType<typeof useFormationProgress>["progress"];
  certificate: IssuedCertificate | null;
  companyVisible?: boolean;
  onOpenBlock: (id: string) => void;
  onOpenCompany: () => void;
  onOpenQuiz: () => void;
  onOpenCareer: () => void;
  onOpenSatisfaction: () => void;
}) {
  const blocksReady = doneChapters >= totalChapters;

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

      {progress.quizPassed && !progress.satisfaction && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">
            Questionnaire de satisfaction
          </p>
          <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-200/80">
            Avant de poursuivre, merci de donner votre avis à chaud (et une
            réclamation si besoin).
          </p>
          <button
            type="button"
            onClick={onOpenSatisfaction}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Répondre
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {certificate && (
        <LearnerAttestation
          fullName={fullName}
          companyName={companyName}
          careerPathId={progress.careerPathId}
          quizScore={progress.quizScore}
          certificate={certificate}
        />
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

      <div
        className={`grid gap-3 ${companyVisible ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
      >
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
        {companyVisible && (
          <HubAction
            icon={<Building2 className="h-5 w-5" />}
            title="Votre entreprise"
            subtitle={
              progress.companyModuleDone
                ? "Consulté"
                : progress.quizPassed
                  ? "Optionnel"
                  : "Après le quiz"
            }
            done={progress.companyModuleDone}
            disabled={!progress.quizPassed}
            onClick={onOpenCompany}
          />
        )}
        <HubAction
          icon={<GraduationCap className="h-5 w-5" />}
          title="Fiche métier"
          subtitle={
            progress.careerPathId
              ? CAREER_PATHS.find((p) => p.id === progress.careerPathId)?.title ?? "Choisi"
              : progress.quizPassed
                ? "Optionnel"
                : "Après le quiz"
          }
          done={!!progress.careerPathId}
          disabled={!progress.quizPassed}
          onClick={onOpenCareer}
        />
      </div>

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
    "1.1": "Pourquoi vous êtes ici",
    "1.2": "Comment elle écrit",
    "1.3": "IA classique ou Générative ?",
    "1.4": "Quatre mots, sans la définition écrite",
    "1.5": "Quelle suite l'IA choisirait-elle ?",
    "1.6": "Repérez ce qu'il ne faut pas reprendre",
    "1.7": "Avant d'utiliser une réponse",
    "2.1": "La loi, votre rôle, les quatre niveaux",
    "2.2": "Depuis quand l'article 4 s'applique ?",
    "2.3": "J'utilise ou je vends ?",
    "2.4": "Quel niveau de risque ?",
    "2.5": "Cinq dates, pour fermer le bloc",
    "3.1": "Ce que vous pouvez saisir",
    "3.2": "OK, prudence, interdit",
    "3.3": "Feu vert, orange ou rouge",
    "3.4": "Gardez une demande utile",
    "3.5": "Trois questions avant d'ouvrir l'outil",
    "3.6": "La réunion, y compris les externes",
    "3.7": "Si vous avez mis ce qu'il ne fallait pas",
    "4.1": "L'IA propose, vous décidez",
    "4.2": "Qui valide vraiment ?",
    "4.3": "Reliez la bonne règle",
    "4.4": "Avant de publier ou d'agir",
    "4.5": "Je publie, ou je vérifie ?",
    "4.6": "Ce qui pourrait faire agir l'IA",
    "5.1": "Ce qu'est un deepfake, et les deux gestes",
    "5.2": "Le faux directeur, puis la publication",
    "6.1": "Les sept questions, expliquées",
    "6.2": "Relisez-les dans le jeu",
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

const BLOCK_RECAPS: Record<string, string[]> = {
  "bloc-1": [
    "Je suis ici parce que l'entreprise doit prendre des mesures pour que je sache utiliser l'IA. L'attestation le prouve.",
    "L'outil choisit la suite la plus probable. Ce n'est pas forcément vrai.",
    "Je vérifie les chiffres, les noms et les sources avant de les reprendre.",
  ],
  "bloc-2": [
    "Presque tout le monde utilise un outil déjà en vente (ChatGPT, Copilot). Si mon entreprise fabrique une IA et la vend sous son nom, les règles sont plus lourdes.",
    "Risque limité : on dit clairement que c'est une IA. Risque inacceptable : émotions ou religion d'après une photo, on ne le fait pas.",
    "Je sais ce qui est déjà en vigueur, et ce que change décembre 2026.",
  ],
  "bloc-3": [
    "L'outil n'est pas un carnet privé. OK, prudence, ou interdit.",
    "Santé et secrets : interdit. Si je me trompe, je préviens tout de suite.",
  ],
  "bloc-4": [
    "L'IA prépare. C'est moi qui décide, surtout quand une personne est concernée.",
    "Score, envoi, paiement, publication : un humain doit toujours garder la main.",
  ],
  "bloc-5": [
    "Une vidéo nette ne prouve plus que la personne a vraiment parlé.",
    "Face à un message trop urgent, je rappelle sur un numéro que je connais déjà.",
    "Si j'en publie une, je dis clairement qu'elle est générée.",
  ],
};

function BlockScreen({
  block,
  completed,
  unlockAll = false,
  onBack,
  onOpenChapter,
}: {
  block: Block;
  completed: string[];
  /** Compte témoin : tous les chapitres accessibles */
  unlockAll?: boolean;
  onBack: () => void;
  onOpenChapter: (id: string) => void;
}) {
  const [deniedId, setDeniedId] = useState<string | null>(null);
  const blockDone = block.chapters.every((chapter) => completed.includes(chapter.id));
  const recap = BLOCK_RECAPS[block.id] ?? [];
  const lexiconIds =
    block.id === "bloc-1"
      ? ["ia-generative", "prompt", "hallucination", "llm", "contexte", "ai-act", "art4"]
      : block.id === "bloc-2"
        ? ["ai-act", "art4", "art5", "art50", "haut-risque", "deployeur"]
        : block.id === "bloc-3"
          ? ["donnee-perso", "shadow-ai", "referent", "dpo"]
          : block.id === "bloc-4"
            ? ["supervision-humaine", "referent"]
            : block.id === "bloc-5"
              ? ["deepfake", "art50"]
              : block.id === "bloc-6"
                ? ["referent", "shadow-ai"]
                : undefined;

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
    <div className="mx-auto max-w-2xl space-y-7 text-center sm:space-y-8">
      <button
        type="button"
        onClick={onBack}
        className="mx-auto inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-200 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au parcours
      </button>
      <div className="space-y-3">
        <p className="text-center text-sm font-semibold text-blue-600 dark:text-blue-400">
          Bloc {block.number} · {block.duration}
        </p>
        <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {block.title}
        </h1>
        <p className="mx-auto max-w-xl text-center text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[1.05rem] sm:leading-7">
          {block.goal}
        </p>
      </div>
      {lexiconIds && <LexiconBar ids={lexiconIds} label="Mots à connaître" />}
      <ul className="mx-auto grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 sm:gap-3.5">
        {block.chapters.map((chapter, index) => {
          const done = completed.includes(chapter.id);
          const previous = block.chapters[index - 1];
          const locked =
            !unlockAll &&
            !done &&
            !!previous &&
            !completed.includes(previous.id);
          const denied = deniedId === chapter.id;
          const tone = activityTone(chapter.format);
          const teaser = chapterTeaser(chapter);
          const lastOdd =
            block.chapters.length % 2 === 1 &&
            index === block.chapters.length - 1;
          return (
            <li
              key={chapter.id}
              className={
                lastOdd
                  ? "min-h-0 sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-[calc((100%-0.875rem)/2)]"
                  : "min-h-0"
              }
            >
              <button
                type="button"
                onClick={() => openOrDeny(chapter.id, locked)}
                className={`group relative flex h-full min-h-[5rem] w-full flex-col items-center justify-center gap-1 rounded-2xl border px-4 py-3.5 text-center shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md ${
                  denied
                    ? "block-deny border-red-500 bg-red-50 dark:bg-red-950/40"
                    : done
                      ? "border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-500"
                      : tone.card
                }`}
              >
                {locked && (
                  <Lock className="absolute top-2.5 right-2.5 h-3.5 w-3.5 text-slate-400" aria-hidden />
                )}
                <span className="flex items-center justify-center gap-2 px-2">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-white transition-transform duration-300 group-hover:scale-110" />
                  ) : (
                    <Play
                      className={`h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                        locked ? "text-slate-300" : tone.icon
                      }`}
                    />
                  )}
                  <span
                    className={`line-clamp-2 text-center text-[0.95rem] font-semibold leading-snug sm:text-base ${
                      done ? "text-white" : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {chapter.id} · {chapter.title}
                  </span>
                </span>
                <span
                  className={`line-clamp-2 px-2 text-center text-xs leading-relaxed sm:text-[0.8125rem] ${
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

      {blockDone && recap.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-5 text-center dark:border-emerald-800 dark:bg-emerald-950/40">
          <p className="text-center text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-300 sm:text-sm">
            Ce que je retiens
          </p>
          <ul className="mt-4 space-y-2.5">
            {recap.map((line) => (
              <li
                key={line}
                className="text-center text-sm font-medium leading-relaxed text-emerald-950 dark:text-emerald-50 sm:text-base"
              >
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function printReflexSheet() {
  const before = REFLEXES_BEFORE.map(
    (reflex, index) => `<li style="margin:0.55rem 0">${index + 1}. ${reflex}</li>`,
  ).join("");
  const after = REFLEXES_AFTER.map(
    (reflex, index) =>
      `<li style="margin:0.55rem 0">${REFLEXES_BEFORE.length + index + 1}. ${reflex}</li>`,
  ).join("");
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;width:0;height:0;border:0;right:0;bottom:0";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) {
    frame.remove();
    return;
  }
  doc.open();
  doc.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Les 7 réflexes IA</title>
    <style>body{font-family:Georgia,serif;max-width:640px;margin:2.5rem auto;color:#0f172a;padding:0 1.5rem;text-align:center}h1{font-size:1.35rem}h2{font-size:1.05rem;margin-top:1.6rem}p,li{line-height:1.45}ol{list-style:none;padding:0;margin:0}</style>
    </head><body><p>LockinIA · AI Act Art. 4</p><h1>Les 7 réflexes</h1>
    <h2>Avant d'écrire à l'IA</h2><ol>${before}</ol>
    <h2>Après la réponse de l'IA</h2><ol>${after}</ol>
    <p><strong>Un doute ?</strong> Je ne devine pas. Je demande à mon manager ou au référent IA.</p></body></html>`);
  doc.close();
  const cleanup = () => frame.remove();
  win.addEventListener("afterprint", cleanup);
  window.setTimeout(() => {
    win.focus();
    win.print();
  }, 150);
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
  const mountMs = mountDwellMs(kind, chapter.duration, chapter.id);
  const holdMs = feedbackHoldMs(kind);
  // Texte / fiche : prêts dès l'ouverture (le dwell gère l'attente).
  // Vidéo : Continuer seulement à la fin (onReady / onComplete).
  const instantActivity = kind === "text" || kind === "fiche";
  const [activityComplete, setActivityComplete] = useState(done || instantActivity);
  const [mountReady, setMountReady] = useState(done || mountMs <= 0);
  const [holdReady, setHoldReady] = useState(done || holdMs <= 0);
  const [acked, setAcked] = useState(done || !ackRequired);
  const [cooldownSec, setCooldownSec] = useState(() =>
    done || mountMs <= 0 ? 0 : Math.ceil(mountMs / 1000),
  );

  // Dwell à l'ouverture (lecture / script vidéo)
  useEffect(() => {
    const nextMount = mountDwellMs(kind, chapter.duration, chapter.id);
    const nextHold = feedbackHoldMs(kind);
    const nextInstant = kind === "text" || kind === "fiche";
    setActivityComplete(done || nextInstant);
    setHoldReady(done || nextHold <= 0);
    setAcked(done || !needsAck(kind, chapter.id, chapter.duration));
    if (done || nextMount <= 0) {
      setMountReady(true);
      setCooldownSec(0);
      return;
    }
    setMountReady(false);
    const endsAt = Date.now() + nextMount;
    const tick = () => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setCooldownSec(left);
      if (left <= 0) {
        setMountReady(true);
        setCooldownSec(0);
      }
    };
    tick();
    const timer = window.setInterval(tick, 200);
    return () => window.clearInterval(timer);
  }, [chapter.id, chapter.duration, done, kind]);

  // Hold après validation d'un jeu (correction)
  useEffect(() => {
    if (done || !activityComplete) return;
    const nextHold = feedbackHoldMs(kind);
    if (nextHold <= 0) {
      setHoldReady(true);
      return;
    }
    setHoldReady(false);
    const endsAt = Date.now() + nextHold;
    const tick = () => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setCooldownSec(left);
      if (left <= 0) {
        setHoldReady(true);
        setCooldownSec(0);
      }
    };
    tick();
    const timer = window.setInterval(tick, 200);
    return () => window.clearInterval(timer);
  }, [activityComplete, chapter.id, done, kind]);

  const canContinue =
    done || (activityComplete && mountReady && holdReady && (!ackRequired || acked));
  // Jeux / quiz / checklist : pas de Continuer tant que l'exo n'est pas fini
  const waitForActivity = !instantActivity && !activityComplete && !done;
  const showAck =
    !done && ackRequired && activityComplete && mountReady && holdReady && !acked;
  const waitingTimer = !canContinue && cooldownSec > 0;
  const continueLabel = waitingTimer ? `Continuer (${cooldownSec} s)` : "Continuer";
  const stepIndex = Math.max(0, block.chapters.findIndex((item) => item.id === chapter.id));
  const stepCount = block.chapters.length;
  const progress = stepCount <= 1 ? 100 : (stepIndex / (stepCount - 1)) * 100;

  useEffect(() => {
    document.documentElement.classList.add("formation-desktop-rail");
    return () => document.documentElement.classList.remove("formation-desktop-rail");
  }, []);

  const railTip =
    chapter.id === "1.3" ? (
      <>
        <span className="font-semibold">IA classique</span> : trie, calcule, range.
        <br />
        <span className="font-semibold">IA générative</span> : crée un texte ou une image.
      </>
    ) : (
      block.goal
    );
  const railTipLabel = chapter.id === "1.3" ? "Rappel" : "Objectif";

  const progressBar = (
    <div className="px-1 xl:hidden">
      <ol className="flex justify-between gap-1">
        {block.chapters.map((item, index) => {
          const current = item.id === chapter.id;
          const reached = index <= stepIndex;
          return (
            <li
              key={item.id}
              className={`text-center text-xs leading-none sm:text-sm ${
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
      <div className="relative mt-2.5 h-0.5 rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-slate-400/80 dark:bg-slate-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Contenu centré — rail à droite en xl+ */}
      <div className="mx-auto w-full max-w-3xl space-y-7 sm:space-y-8 xl:max-w-4xl">
        {progressBar}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-200 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Bloc {block.number}
        </button>

        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-3 -inset-y-2 -z-10 hidden rounded-[1.75rem] bg-[radial-gradient(ellipse_at_50%_20%,rgba(99,102,241,0.12),transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(ellipse_at_20%_90%,rgba(167,139,250,0.1),transparent_45%)] xl:block dark:bg-[radial-gradient(ellipse_at_50%_20%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(ellipse_at_80%_80%,rgba(59,130,246,0.12),transparent_50%)]"
          />
          <div className="space-y-6 xl:rounded-3xl xl:border xl:border-blue-100/70 xl:bg-gradient-to-b xl:from-white/70 xl:via-slate-50/55 xl:to-blue-50/40 xl:px-10 xl:py-9 xl:shadow-[0_12px_40px_-24px_rgba(15,23,42,0.28)] xl:backdrop-blur-[3px] dark:xl:border-slate-700/80 dark:xl:from-slate-900/55 dark:xl:via-slate-900/45 dark:xl:to-blue-950/30">
            <div className="space-y-2 text-center">
              <h1
                className={`text-center text-2xl text-slate-900 dark:text-white sm:text-[1.75rem] ${
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
          </div>
        </div>

        {(kind === "fiche" || chapter.id === "6.1") && (
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
              className={`inline-flex min-w-[12rem] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-md transition duration-300 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
                waitingTimer
                  ? "bg-blue-600/80 text-white shadow-blue-600/10"
                  : "bg-blue-600 text-white shadow-blue-600/20 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 disabled:opacity-40"
              }`}
            >
              {continueLabel}
              {canContinue ? <ArrowRight className="h-4 w-4" /> : null}
            </button>
          </div>
        )}
      </div>

      <aside
        className="pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 top-24 z-30 hidden w-72 xl:right-6 xl:flex xl:flex-col 2xl:w-80"
        aria-label="Progression du bloc"
      >
        <div className="pointer-events-auto flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 text-center shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
            <div className="space-y-2">
              <p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
                Bloc {block.number}
              </p>
              <p className="text-center text-base font-semibold leading-snug text-slate-900 dark:text-white">
                {block.title}
              </p>
              <p className="text-center text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {chapter.format} · {chapter.duration}
              </p>
            </div>

            <ol className="mt-5 border-t border-slate-100 pt-5 text-left dark:border-slate-800">
              {block.chapters.map((item, index) => {
                const current = item.id === chapter.id;
                const done = index < stepIndex;
                const isLast = index === block.chapters.length - 1;
                return (
                  <li key={item.id} className="relative flex gap-3.5 pb-5 last:pb-0">
                    <span className="relative flex w-3 shrink-0 flex-col items-center">
                      <span
                        className={`relative z-10 mt-1.5 h-3 w-3 rounded-full ring-[3px] ${
                          done
                            ? "bg-emerald-500 ring-emerald-100 dark:ring-emerald-950"
                            : current
                              ? "bg-blue-600 ring-blue-100 dark:ring-blue-950"
                              : "bg-slate-300 ring-slate-100 dark:bg-slate-600 dark:ring-slate-800"
                        }`}
                        aria-hidden
                      />
                      {!isLast ? (
                        <span
                          className={`absolute top-[1.35rem] bottom-[-1.25rem] left-1/2 w-0.5 -translate-x-1/2 ${
                            done ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"
                          }`}
                          aria-hidden
                        />
                      ) : null}
                    </span>
                    <span
                      className={`min-w-0 flex-1 pt-1 text-[13px] leading-relaxed ${
                        current
                          ? "font-semibold text-blue-800 dark:text-blue-200"
                          : done
                            ? "font-medium text-slate-600 dark:text-slate-300"
                            : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      <span className="font-semibold">{item.id}</span>
                      {" · "}
                      {item.title}
                    </span>
                  </li>
                );
              })}
            </ol>

            <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50/80 px-4 py-4 text-center dark:border-violet-900/50 dark:bg-violet-950/30">
              <p className="text-center text-[11px] font-bold uppercase tracking-[0.14em] text-violet-700 dark:text-violet-300">
                {railTipLabel}
              </p>
              <p className="mt-2 text-center text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                {railTip}
              </p>
            </div>
          </div>

          <div className="pointer-events-auto shrink-0 border-t border-slate-100 p-4 dark:border-slate-800">
            <FloatingLexiconFab variant="inline" />
          </div>
        </div>
      </aside>
    </>
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
      <p className="text-center text-xs text-slate-400">
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

function useExamCountdown(active: boolean, paused: boolean) {
  const [secondsLeft, setSecondsLeft] = useState(QUIZ_TIMER_SECONDS);
  const started = useRef(false);
  useEffect(() => {
    if (!active) {
      started.current = false;
      setSecondsLeft(QUIZ_TIMER_SECONDS);
      return;
    }
    if (!started.current) {
      started.current = true;
      setSecondsLeft(QUIZ_TIMER_SECONDS);
    }
    if (paused) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => value - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active, paused]);
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
  onOpenCompany,
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
  onOpenCompany?: () => void;
  onFinish: () => void;
  score: number | null;
  correctCount?: number | null;
  questionCount?: number;
  attempts: number;
}) {
  const timerActive = variant === "final" && briefed && !done;
  const secondsLeft = useExamCountdown(timerActive, reveal);
  const nextLabel = continueCareerLabel ?? "Bonus : l'IA dans mon métier";
  const nextHint =
    continueCareerHint ??
    "Bravo ! Vous savez utiliser l'IA sans vous faire piéger. Attestation Art. 4 disponible.";

  function positioningProfile(yes: number) {
    if (yes <= 3) {
      return {
        title: "Pas d'inquiétude",
        text: "Vous partez de zéro, et c'est tout à fait normal : la formation vous guide étape par étape.",
      };
    }
    if (yes <= 6) {
      return {
        title: "Bonne nouvelle !",
        text: "Vous avez déjà des bases : la formation va les préciser et les renforcer.",
      };
    }
    return {
      title: "Bonne nouvelle !",
      text: "La formation va se dérouler facilement pour vous.",
    };
  }

  if (done && variant === "final" && shuffled.length === 0) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-8 text-center">
        <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">Examen validé</h1>
        <p className="text-center text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">
          {score ?? "—"} %
        </p>
        <p className="mx-auto max-w-md text-center text-sm text-slate-500">{nextHint}</p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          {onOpenCompany && (
            <button
              type="button"
              onClick={onOpenCompany}
              className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Bonus : règles de votre entreprise
              </p>
              <p className="mt-1 text-xs text-slate-500">Facultatif</p>
            </button>
          )}
          {onContinueCareer && (
            <button
              type="button"
              onClick={onContinueCareer}
              className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{nextLabel}</p>
              <p className="mt-1 text-xs text-slate-500">Facultatif</p>
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onFinish}
          className="text-sm font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline dark:hover:text-slate-300"
        >
          Retour au menu
        </button>
      </div>
    );
  }

  if (done) {
    const passed = variant === "final" && (score ?? 0) >= QUIZ_PASS_PERCENT;
    const canRetry = variant === "final" && !passed && Boolean(onRetry);
    const goNext = passed && Boolean(onContinueCareer || onOpenCompany);
    const yes = correctCount ?? 0;
    const total = questionCount ?? 8;
    const profile = positioningProfile(yes);
    const goodCount =
      score != null && questionCount
        ? Math.round((score / 100) * questionCount)
        : null;
    return (
      <div className="mx-auto max-w-lg space-y-6 py-8 text-center">
        <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">
          {variant === "positioning" ? profile.title : "Résultat de l'examen"}
        </h1>
        {variant === "positioning" ? (
          <div className="space-y-3">
            <p className="text-center text-xl font-semibold leading-snug text-slate-900 sm:text-2xl dark:text-white">
              {profile.text}
            </p>
            <p className="text-center text-base text-slate-600 dark:text-slate-300">
              {yes} « oui » sur {total}
            </p>
          </div>
        ) : (
          <p
            className={`text-center text-4xl font-extrabold ${
              passed ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white"
            }`}
          >
            {goodCount != null ? `${goodCount} / ${questionCount}` : `${score} %`}
          </p>
        )}
        <p className="mx-auto max-w-md text-center text-base leading-relaxed text-slate-700 dark:text-slate-200">
          {variant === "positioning"
            ? "On part de là où vous en êtes."
            : passed
              ? nextHint
              : `Presque ! ${
                  goodCount != null
                    ? `Vous avez ${goodCount} bonnes réponses sur ${questionCount}.`
                    : `Score : ${score} %.`
                } Il en faut ${QUIZ_PASS_COUNT} sur ${QUIZ_DRAW_SIZE}. Revoyez un ou deux blocs, puis retentez : les questions seront différentes.`}
        </p>
        {passed && (
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            {onOpenCompany && (
              <button
                type="button"
                onClick={onOpenCompany}
                className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Bonus : règles de votre entreprise
                </p>
                <p className="mt-1 text-xs text-slate-500">Facultatif</p>
              </button>
            )}
            {onContinueCareer && (
              <button
                type="button"
                onClick={onContinueCareer}
                className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{nextLabel}</p>
                <p className="mt-1 text-xs text-slate-500">Facultatif</p>
              </button>
            )}
          </div>
        )}
        <div className="flex flex-col items-center gap-3">
          {canRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              Retenter l&apos;examen
            </button>
          )}
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
              ? "C'est parti !"
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
          <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Objectif : {QUIZ_PASS_COUNT}/{QUIZ_DRAW_SIZE} minimum pour votre
            attestation AI Act (Art. 4).
          </p>

          <ul className="mx-auto mt-6 max-w-md space-y-3 text-center text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            <li>
              <strong className="font-semibold text-slate-900 dark:text-white">
                {QUIZ_DRAW_SIZE} questions
              </strong>{" "}
              tirées sur tout le parcours.
            </li>
            <li>
              Choisissez une réponse, puis{" "}
              <strong className="font-semibold text-slate-900 dark:text-white">Valider</strong>.
              Le chrono se met en pause pendant l&apos;explication.
            </li>
            <li className="text-amber-800 dark:text-amber-300">
              Lisez bien chaque question. Pas de piège tordu.
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
  const retainText =
    selected != null && current.q.explanations
      ? (current.q.explanations[selected] ?? current.q.explanation)
      : current.q.explanation;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
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
          className={`text-center text-xs font-semibold tracking-wide uppercase sm:text-sm ${
            isFinal ? "text-slate-500" : "text-blue-600 dark:text-blue-400"
          }`}
        >
          {variant === "positioning"
            ? `Faisons connaissance · Question ${index + 1} / ${shuffled.length}`
            : `Examen final · Tentative n°${attempts + 1} · Question ${index + 1} / ${shuffled.length}`}
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl text-center text-xl font-bold leading-snug text-slate-900 dark:text-white sm:text-2xl">
          {current.q.prompt}
        </h1>
        {variant === "positioning" && index === 0 && !reveal && (
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-500 sm:text-base">
            8 questions rapides.
          </p>
        )}
      </div>

      <ul className="mx-auto max-w-3xl space-y-3">
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
                  className={`flex w-full items-start gap-3.5 rounded-xl border px-4 py-4 text-left transition enabled:hover:border-slate-500 disabled:cursor-default sm:gap-4 sm:px-5 sm:py-5 ${row}`}
                >
                  <span
                    className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${radio}`}
                    aria-hidden
                  >
                    {(isSelected || (reveal && isCorrect)) && (
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          reveal && isCorrect
                            ? "bg-white"
                            : reveal && isSelected && !isCorrect
                              ? "bg-white"
                              : "bg-slate-900 dark:bg-white"
                        }`}
                      />
                    )}
                  </span>
                  <span className={`text-base leading-relaxed sm:text-[1.05rem] ${label}`}>{opt.text}</span>
                </button>
              </li>
            );
          }

          // Positionnement : pas de « bonne / mauvaise » réponse (questions d'expérience).
          let style =
            "border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:border-blue-600 dark:hover:bg-blue-950/30";
          if (reveal && isSelected) {
            style =
              "border-blue-500 bg-blue-600 font-semibold text-white dark:border-blue-400 dark:bg-blue-600";
          } else if (isSelected) {
            style =
              "border-blue-400 bg-blue-50 text-slate-800 dark:bg-blue-950/30 dark:text-slate-100";
          }
          return (
            <li key={opt.text}>
              <button
                type="button"
                disabled={reveal}
                onClick={() => onSelect(opt.index)}
                className={`w-full rounded-xl border px-4 py-4 text-center text-base leading-relaxed transition duration-300 ease-out enabled:hover:-translate-y-1 enabled:hover:border-blue-400 enabled:hover:bg-blue-50 enabled:hover:shadow-lg enabled:hover:shadow-blue-500/25 disabled:cursor-default sm:px-5 sm:text-[1.05rem] dark:enabled:hover:border-blue-500 dark:enabled:hover:bg-blue-950/40 ${style}`}
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
                ? "mt-2 text-center text-base leading-relaxed text-slate-800 dark:text-slate-100"
                : `mt-3 text-lg font-semibold leading-relaxed text-slate-900 sm:text-xl dark:text-white ${
                    retainText.length > 160 ? "text-justify" : "text-center"
                  }`
            }
          >
            {retainText}
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
