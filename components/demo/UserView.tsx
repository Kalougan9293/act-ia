"use client";

import {
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Play,
} from "lucide-react";
import { BLOCKS, allChapterIds } from "@/lib/formation/curriculum";
import { QUIZ_DRAW_SIZE, QUIZ_PASS_PERCENT } from "@/lib/formation/evaluation";

/** Snapshot figé — Camille Bernard à ~40 %, comme dans la vue RH démo. */
const DEMO = {
  firstName: "Camille",
  fullName: "Camille Bernard",
  company: "Atelier Lumière",
  email: "camille.bernard@atelier-lumiere.fr",
  percent: 40,
};

function DemoAction({
  icon,
  title,
  subtitle,
  done,
  locked,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  done?: boolean;
  locked?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900 ${
        locked ? "opacity-45" : ""
      }`}
    >
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
        {done ? <Check className="h-5 w-5 text-emerald-500" /> : icon}
      </div>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

export default function UserView() {
  const chapterIds = allChapterIds();
  const totalChapters = chapterIds.length;
  const doneChapters = Math.min(
    totalChapters,
    Math.max(1, Math.round((DEMO.percent / 100) * totalChapters)),
  );
  const completed = new Set(chapterIds.slice(0, doneChapters));
  const blocksReady = doneChapters >= totalChapters;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center dark:border-amber-800/60 dark:bg-amber-950/30">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          Aperçu démonstration
        </p>
        <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-300/80">
          Vue synthétique du parcours collaborateur — rien n&apos;est cliquable.
        </p>
      </div>

      <div
        className="pointer-events-none select-none space-y-8 text-center"
        aria-label="Aperçu figé du parcours collaborateur"
      >
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {DEMO.fullName}
          </p>
          <p className="text-xs text-slate-400">
            {DEMO.company} · {DEMO.email}
          </p>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Votre parcours, {DEMO.firstName}
          </h1>
          <p className="text-sm text-slate-500">
            {doneChapters}/{totalChapters} chapitres · progression {DEMO.percent} %
          </p>
          <div className="mx-auto h-2 max-w-md overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${Math.min(100, DEMO.percent)}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {BLOCKS.map((block) => {
            const done = block.chapters.every((c) => completed.has(c.id));
            const started = block.chapters.some((c) => completed.has(c.id));
            return (
              <div
                key={block.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex flex-col items-center gap-3">
                  <div>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      Bloc {block.number} · {block.duration}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                      {block.title}
                    </h2>
                    <p className="mt-1 text-justify text-xs leading-relaxed text-slate-500">
                      {block.goal}
                    </p>
                  </div>
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : started ? (
                    <Play className="h-5 w-5 shrink-0 text-blue-500" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <DemoAction
            icon={<ClipboardList className="h-5 w-5" />}
            title="QCM final"
            subtitle={
              blocksReady
                ? `${QUIZ_DRAW_SIZE} questions · seuil ${QUIZ_PASS_PERCENT} %`
                : "Terminez d'abord le socle"
            }
            locked={!blocksReady}
          />
          <DemoAction
            icon={<Building2 className="h-5 w-5" />}
            title="Votre entreprise"
            subtitle="Après le quiz"
            locked
          />
          <DemoAction
            icon={<GraduationCap className="h-5 w-5" />}
            title="Fiche métier"
            subtitle="Après le quiz"
            locked
          />
        </div>
      </div>
    </div>
  );
}
