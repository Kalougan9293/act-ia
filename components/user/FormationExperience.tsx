"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Play,
  Sparkles,
} from "lucide-react";
import VideoScript from "@/components/user/VideoScript";
import { useFormationProgress } from "@/components/user/useFormationProgress";
import CertificatePreview from "@/components/demo/CertificatePreview";
import type { IssuedCertificate } from "@/lib/firebase/formation-progress";
import { formatProofDate } from "@/lib/formation/proof";
import {
  BLOCKS,
  CAREER_PATHS,
  FORMATION_PROMISE,
  QUIZ_QUESTIONS,
  SEVEN_REFLEXES,
  findChapter,
  type Block,
} from "@/lib/formation/curriculum";

type Screen =
  | { kind: "intro" }
  | { kind: "hub" }
  | { kind: "block"; blockId: string }
  | { kind: "chapter"; chapterId: string }
  | { kind: "company" }
  | { kind: "quiz" }
  | { kind: "career" };

function shuffleChoices(question: (typeof QUIZ_QUESTIONS)[number]) {
  const indexed = question.choices.map((text, index) => ({ text, index }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j]!, indexed[i]!];
  }
  return indexed;
}

export default function FormationExperience({
  uid,
  firstName,
  fullName,
  companyName,
}: {
  uid: string;
  firstName: string;
  fullName: string;
  companyName: string;
}) {
  const {
    ready,
    progress,
    percent,
    doneChapters,
    totalChapters,
    certificate,
    markIntroDone,
    markChapterDone,
    markCompanyDone,
    markQuiz,
    markCareer,
  } = useFormationProgress(uid);

  const [screen, setScreen] = useState<Screen | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(
    () => QUIZ_QUESTIONS.map(() => null),
  );
  const [quizReveal, setQuizReveal] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);

  const shuffled = useMemo(
    () => QUIZ_QUESTIONS.map((q) => ({ q, options: shuffleChoices(q) })),
    [],
  );

  const active: Screen =
    screen ?? (progress.introDone ? { kind: "hub" } : { kind: "intro" });

  if (!ready) {
    return <p className="text-center text-sm text-slate-500 py-16">Chargement…</p>;
  }

  if (active.kind === "intro") {
    return (
      <IntroScreen
        firstName={firstName}
        companyName={companyName}
        onStart={() => {
          markIntroDone();
          setScreen({ kind: "hub" });
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
        onOpenQuiz={() => {
          setQuizIndex(0);
          setQuizAnswers(QUIZ_QUESTIONS.map(() => null));
          setQuizReveal(false);
          setQuizDone(false);
          setLastScore(null);
          setScreen({ kind: "quiz" });
        }}
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
        onBack={() => setScreen({ kind: "hub" })}
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
          else setScreen({ kind: "block", blockId: block.id });
        }}
      />
    );
  }

  if (active.kind === "company") {
    return (
      <CompanyScreen
        companyName={companyName}
        done={progress.companyModuleDone}
        onBack={() => setScreen({ kind: "hub" })}
        onComplete={() => {
          markCompanyDone();
          setScreen({ kind: "hub" });
        }}
      />
    );
  }

  if (active.kind === "quiz") {
    return (
      <QuizScreen
        shuffled={shuffled}
        index={quizIndex}
        answers={quizAnswers}
        reveal={quizReveal}
        done={quizDone}
        onBack={() => setScreen({ kind: "hub" })}
        onSelect={(choiceOriginalIndex) => {
          if (quizReveal) return;
          const next = [...quizAnswers];
          next[quizIndex] = choiceOriginalIndex;
          setQuizAnswers(next);
          setQuizReveal(true);
        }}
        onNext={() => {
          if (quizIndex < QUIZ_QUESTIONS.length - 1) {
            setQuizIndex((i) => i + 1);
            setQuizReveal(false);
            return;
          }
          const score = quizAnswers.reduce<number>((acc, answer, i) => {
            return acc + (answer === QUIZ_QUESTIONS[i]!.correctIndex ? 1 : 0);
          }, 0);
          const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
          const passed = pct >= 80;
          setLastScore(pct);
          markQuiz(pct, passed);
          setQuizDone(true);
        }}
        onFinish={() => setScreen({ kind: "hub" })}
        score={lastScore ?? progress.quizScore}
      />
    );
  }

  if (active.kind === "career") {
    return (
      <CareerScreen
        selected={progress.careerPathId}
        onBack={() => setScreen({ kind: "hub" })}
        onSelect={(id) => {
          markCareer(id);
          setScreen({ kind: "hub" });
        }}
      />
    );
  }

  return null;
}

function IntroScreen({
  firstName,
  companyName,
  onStart,
}: {
  firstName: string;
  companyName: string;
  onStart: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-10 text-center py-4">
      <div className="space-y-4">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
          ConformAI Academy
        </p>
        <h1 className="text-center text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Bienvenue{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-justify text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {FORMATION_PROMISE}
        </p>
        <p className="text-center text-sm text-slate-500">
          Parcours pour <span className="font-semibold text-slate-700 dark:text-slate-200">{companyName}</span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BLOCKS.map((block) => (
          <div
            key={block.id}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-600 dark:hover:bg-blue-950/30"
          >
            <p className="text-center text-xs font-semibold text-blue-600 transition-colors group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
              Bloc {block.number} · {block.duration}
            </p>
            <h2 className="mt-1 text-center text-base font-bold text-slate-900 transition-colors group-hover:text-blue-950 dark:text-white dark:group-hover:text-blue-50">
              {block.title}
            </h2>
            <p className="mt-2 text-center text-xs text-slate-500 transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-400">
              {block.chapters.length} chapitre{block.chapters.length > 1 ? "s" : ""}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-950 transition duration-300 hover:border-blue-300 hover:bg-blue-100/80 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100 dark:hover:border-blue-600 dark:hover:bg-blue-950/60">
        <p className="text-center font-medium">
          À la fin du parcours, vous obtenez une <strong>attestation de suivi</strong> qui
          confirme votre sensibilisation à l&apos;AI Act et au RGPD, en ligne avec les attentes
          légales de maîtrise de l&apos;IA en entreprise.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onStart}
          className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 active:translate-y-0 active:scale-[0.98]"
        >
          <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
          Commencer le parcours
        </button>
        <p className="text-center text-xs text-slate-400">
          Environ 1&nbsp;h au total en moyenne — à découper en plusieurs fois si besoin
        </p>
      </div>
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

      {certificate && proof && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-800 dark:bg-emerald-950/30">
          <p className="text-center text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            Attestation de suivi émise · {certificate.id}
          </p>
          <p className="mt-1 text-center text-xs text-emerald-800/80 dark:text-emerald-200/80">
            Conservée dans le dossier de preuve de votre entreprise (Art. 4).
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
          icon={<Building2 className="h-5 w-5" />}
          title="Votre entreprise"
          subtitle={progress.companyModuleDone ? "Consulté" : "5 min · outils & référent"}
          done={progress.companyModuleDone}
          onClick={onOpenCompany}
        />
        <HubAction
          icon={<ClipboardList className="h-5 w-5" />}
          title="QCM final"
          subtitle={
            progress.quizScore != null
              ? `Score ${progress.quizScore} %${progress.quizPassed ? " · réussi" : ""}`
              : blocksReady
                ? "12 questions · seuil 80 %"
                : "Terminez d'abord le socle"
          }
          done={progress.quizPassed}
          disabled={!blocksReady}
          onClick={onOpenQuiz}
        />
        <HubAction
          icon={<GraduationCap className="h-5 w-5" />}
          title="Parcours métier"
          subtitle={
            progress.careerPathId
              ? CAREER_PATHS.find((p) => p.id === progress.careerPathId)?.title ?? "Choisi"
              : "Après le QCM"
          }
          done={!!progress.careerPathId}
          disabled={!progress.quizPassed}
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
  return (
    <div className="mx-auto max-w-2xl space-y-6 text-center">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-200 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au parcours
      </button>
      <div>
        <p className="text-center text-xs font-semibold text-blue-600 dark:text-blue-400">
          Bloc {block.number} · {block.duration}
        </p>
        <h1 className="mt-1 text-center text-2xl font-bold text-slate-900 dark:text-white">{block.title}</h1>
        <p className="mt-2 text-justify text-sm text-slate-500 max-w-lg mx-auto">{block.goal}</p>
      </div>
      <ul className="space-y-2">
        {block.chapters.map((chapter) => {
          const done = completed.includes(chapter.id);
          return (
            <li key={chapter.id}>
              <button
                type="button"
                onClick={() => onOpenChapter(chapter.id)}
                className="group flex w-full flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-600 dark:hover:bg-blue-950/30 sm:flex-row sm:justify-between sm:text-left"
              >
                <div className="min-w-0">
                  <p className="text-center text-sm font-semibold text-slate-900 dark:text-white sm:text-left">
                    {chapter.id} · {chapter.title}
                  </p>
                  <p className="text-center text-xs text-slate-500 sm:text-left">{chapter.duration}</p>
                </div>
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <Play className="h-5 w-5 text-blue-500 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
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
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-200 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Bloc {block.number}
      </button>

      <div className="text-center space-y-1">
        <p className="text-center text-xs font-semibold text-blue-600 dark:text-blue-400">
          Chapitre {chapter.id}
        </p>
        <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">{chapter.title}</h1>
      </div>

      <VideoScript format={chapter.format} duration={chapter.duration} script={chapter.script} />

      {chapter.takeaways && chapter.takeaways.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-800 dark:bg-emerald-950/30">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-3">
            À retenir
          </p>
          <ul className="space-y-2">
            {chapter.takeaways.map((item) => (
              <li key={item} className="flex gap-2 text-justify text-sm text-emerald-950 dark:text-emerald-100">
                <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                <span className="text-justify">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onComplete}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 active:translate-y-0 active:scale-[0.98]"
        >
          {done ? "Continuer" : "Marquer comme vu"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function CompanyScreen({
  companyName,
  done,
  onBack,
  onComplete,
}: {
  companyName: string;
  done: boolean;
  onBack: () => void;
  onComplete: () => void;
}) {
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
          Module paramétrable · {companyName}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            title: "Outils autorisés",
            body: "Liste des outils d'IA validés par votre entreprise (usages permis / données interdites). À renseigner par votre RH.",
          },
          {
            title: "Charte IA",
            body: "Politique d'usage de l'IA à lire et accepter. Un modèle peut s'afficher si votre entreprise n'a pas encore de charte.",
          },
          {
            title: "Référent IA & DPO",
            body: "Contacts pour poser une question ou signaler une erreur. En cas de doute : demandez avant d'utiliser un outil.",
          },
          {
            title: "Procédure de déclaration",
            body: "Comment déclarer un nouvel outil ou usage : formulaire, délai, statut « en analyse ».",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-600 dark:hover:bg-blue-950/30"
          >
            <p className="text-center text-sm font-semibold text-slate-900 dark:text-white">{card.title}</p>
            <p className="mt-1 text-justify text-xs text-slate-500 leading-relaxed">{card.body}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-slate-400">
        Ce module n&apos;entre pas dans le QCM : son contenu varie selon l&apos;entreprise.
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

function QuizScreen({
  shuffled,
  index,
  answers,
  reveal,
  done,
  onBack,
  onSelect,
  onNext,
  onFinish,
  score,
}: {
  shuffled: { q: (typeof QUIZ_QUESTIONS)[number]; options: { text: string; index: number }[] }[];
  index: number;
  answers: (number | null)[];
  reveal: boolean;
  done: boolean;
  onBack: () => void;
  onSelect: (originalIndex: number) => void;
  onNext: () => void;
  onFinish: () => void;
  score: number | null;
}) {
  if (done) {
    const passed = (score ?? 0) >= 80;
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center py-8">
        <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">Résultat du QCM</h1>
        <p className="text-center text-4xl font-extrabold text-blue-600 dark:text-blue-400">{score} %</p>
        <p className="text-justify text-sm text-slate-500 max-w-md mx-auto">
          {passed
            ? "Seuil atteint (80 %). Vous pouvez choisir votre parcours métier."
            : "Seuil non atteint. Relisez les blocs concernés puis retentez (jusqu'à 3 tentatives)."}
        </p>
        <button
          type="button"
          onClick={onFinish}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]"
        >
          Retour au parcours
        </button>
      </div>
    );
  }

  const current = shuffled[index]!;
  const selected = answers[index];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-200 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Quitter le QCM
      </button>
      <div className="text-center">
        <p className="text-center text-xs font-semibold text-blue-600 dark:text-blue-400">
          Question {index + 1} / {QUIZ_QUESTIONS.length}
        </p>
        <h1 className="mt-2 text-center text-lg font-bold text-slate-900 dark:text-white leading-snug">
          {current.q.prompt}
        </h1>
      </div>
      <ul className="space-y-2">
        {current.options.map((opt) => {
          const isSelected = selected === opt.index;
          const isCorrect = opt.index === current.q.correctIndex;
          let style =
            "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:border-blue-600 dark:hover:bg-blue-950/30";
          if (reveal && isCorrect) style = "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40";
          else if (reveal && isSelected && !isCorrect)
            style = "border-red-300 bg-red-50 dark:bg-red-950/30";
          else if (isSelected) style = "border-blue-400 bg-blue-50 dark:bg-blue-950/30";
          return (
            <li key={opt.text}>
              <button
                type="button"
                disabled={reveal}
                onClick={() => onSelect(opt.index)}
                className={`w-full rounded-xl border px-4 py-3 text-center text-sm text-slate-800 transition duration-300 ease-out enabled:hover:-translate-y-0.5 enabled:hover:shadow-md dark:text-slate-100 ${style}`}
              >
                {opt.text}
              </button>
            </li>
          );
        })}
      </ul>
      {reveal && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-justify text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {current.q.explanation}
        </div>
      )}
      {reveal && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 active:translate-y-0 active:scale-[0.98]"
          >
            {index < QUIZ_QUESTIONS.length - 1 ? "Question suivante" : "Voir le résultat"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function CareerScreen({
  selected,
  onBack,
  onSelect,
}: {
  selected: string | null;
  onBack: () => void;
  onSelect: (id: string) => void;
}) {
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
        <p className="mt-2 text-justify text-sm text-slate-500 max-w-lg mx-auto">
          Choisissez un parcours (10–15 min). Le contenu détaillé vidéo + cas pratique se peaufine ensuite.
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {CAREER_PATHS.map((path) => (
          <li key={path.id}>
            <button
              type="button"
              onClick={() => onSelect(path.id)}
              className={`w-full rounded-xl border px-4 py-3 text-center shadow-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md ${
                selected === path.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-600 dark:hover:bg-blue-950/30"
              }`}
            >
              <p className="text-center text-sm font-semibold text-slate-900 dark:text-white">{path.title}</p>
              <p className="text-center text-xs text-slate-500">{path.duration}</p>
            </button>
          </li>
        ))}
      </ul>
      <p className="text-center text-xs text-slate-400">
        Rappel des 7 réflexes : {SEVEN_REFLEXES.slice(0, 3).join(" · ")}…
      </p>
    </div>
  );
}
