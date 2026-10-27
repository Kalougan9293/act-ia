"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Car, HelpCircle, Play, ScanFace } from "lucide-react";
import ActivityPlayer from "@/components/user/ActivityPlayer";
import type { Activity } from "@/lib/formation/activity";
import { findChapter } from "@/lib/formation/curriculum";

const DEMO = {
  firstName: "Camille",
  fullName: "Camille Bernard",
  company: "Atelier Lumière",
  email: "camille.bernard@atelier-lumiere.fr",
};

const VIDEO_CUT = "suivi le parcours.";

type SampleId = "video" | "traffic" | "quiz" | "deepfake";

const SAMPLES: {
  id: SampleId;
  title: string;
  teaser: string;
  icon: typeof Play;
  accent: string;
}[] = [
  {
    id: "video",
    title: "Vidéo",
    teaser: "Extrait — pourquoi vous êtes ici",
    icon: Play,
    accent: "from-blue-600 to-sky-500",
  },
  {
    id: "traffic",
    title: "Jeu",
    teaser: "1 feu — données sensibles",
    icon: Car,
    accent: "from-emerald-600 to-teal-500",
  },
  {
    id: "quiz",
    title: "Quiz",
    teaser: "Les 4 mots — LLM, prompt…",
    icon: HelpCircle,
    accent: "from-violet-600 to-fuchsia-500",
  },
  {
    id: "deepfake",
    title: "Vidéo",
    teaser: "Est-ce un deepfake ?",
    icon: ScanFace,
    accent: "from-rose-600 to-orange-500",
  },
];

function buildDemoActivity(id: SampleId): {
  activity: Activity;
  duration: string;
  title: string;
  videoEndRatio?: number;
} | null {
  if (id === "video") {
    const chapter = findChapter("1.1")?.chapter;
    if (!chapter || chapter.activity.kind !== "video") return null;
    const full = chapter.activity.script;
    const cutAt = full.indexOf(VIDEO_CUT);
    const script = cutAt >= 0 ? full.slice(0, cutAt + VIDEO_CUT.length) : full;
    const videoEndRatio =
      full.length > 0 ? Math.min(0.95, Math.max(0.08, script.length / full.length)) : undefined;
    return {
      activity: { ...chapter.activity, script },
      duration: "45 s",
      title: chapter.title,
      videoEndRatio,
    };
  }

  if (id === "traffic") {
    const chapter = findChapter("3.3")?.chapter;
    if (!chapter || chapter.activity.kind !== "traffic") return null;
    const item = chapter.activity.items.find((row) => row.id === "cv") ?? chapter.activity.items[0]!;
    return {
      activity: {
        ...chapter.activity,
        briefing: "Une seule info. Vert, orange ou rouge ?",
        items: [item],
      },
      duration: "30 s",
      title: "Quel niveau d'attention ?",
    };
  }

  if (id === "quiz") {
    const chapter = findChapter("1.4")?.chapter;
    if (!chapter || chapter.activity.kind !== "stamp") return null;
    const llmCard =
      chapter.activity.cards.find((card) => card.stampId === "llm") ?? chapter.activity.cards[0]!;
    return {
      activity: {
        ...chapter.activity,
        briefing:
          "On vient de nommer 4 mots : LLM, prompt, hallucination, contexte.\nChoisissez le mot qui décrit l'exemple.",
        cards: [llmCard],
      },
      duration: "45 s",
      title: chapter.title,
    };
  }

  if (id === "deepfake") {
    const chapter = findChapter("5.1")?.chapter;
    if (!chapter || chapter.activity.kind !== "truefake") return null;
    const item = chapter.activity.items[0]!;
    return {
      activity: {
        ...chapter.activity,
        briefing: "Regardez l'extrait, puis choisissez.",
        outro: "C'était généré par IA. On ne peut plus se fier seulement à l'œil.",
        items: [
          {
            ...item,
            prompt: "Est-ce un deepfake ?",
          },
        ],
      },
      duration: "45 s",
      title: "Est-ce un deepfake ?",
    };
  }

  return null;
}

export default function UserView() {
  const [active, setActive] = useState<SampleId | null>(null);

  const sample = SAMPLES.find((row) => row.id === active) ?? null;
  const demoPack = useMemo(() => (active ? buildDemoActivity(active) : null), [active]);

  function openSample(id: SampleId) {
    setActive(id);
  }

  function closeSample() {
    setActive(null);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-10">
      <div className="flex w-full flex-col items-center text-center">
        <p className="w-full text-center text-xs font-semibold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">
          Parcours salarié
        </p>
        <h1 className="mt-2 w-full text-center text-2xl font-bold text-slate-900 dark:text-white">
          Essayez un extrait
        </h1>
        <p className="mx-auto mt-2 max-w-md text-center text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Même format que la formation réelle — en version courte.
        </p>
      </div>

      {!active ? (
        <div className="mx-auto w-full max-w-xl space-y-4">
          <div className="grid gap-3 sm:grid-cols-1">
            {SAMPLES.filter((row) => row.id === "video").map((row) => {
              const Icon = row.icon;
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => openSample(row.id)}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-violet-500/40"
                >
                  <span
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${row.accent} text-white shadow-sm`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">
                      {row.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-slate-500 dark:text-slate-400">
                      {row.teaser}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-violet-600 group-hover:underline dark:text-violet-300">
                    →
                  </span>
                </button>
              );
            })}
          </div>

          <div>
            <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              3 jeux rapides
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {SAMPLES.filter((row) => row.id !== "video").map((row) => {
                const Icon = row.icon;
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => openSample(row.id)}
                    className="group flex flex-col items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-violet-500/40"
                  >
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${row.accent} text-white shadow-sm`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.2} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-900 dark:text-white">
                        {row.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-slate-500 dark:text-slate-400">
                        {row.teaser}
                      </span>
                    </span>
                    <span className="mt-auto text-xs font-semibold text-violet-600 group-hover:underline dark:text-violet-300">
                      Lancer →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-left">
          <button
            type="button"
            onClick={closeSample}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux extraits
          </button>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-4 py-3 text-center dark:border-slate-800">
              <p className="w-full text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                {sample?.title}
              </p>
              <p className="mt-0.5 w-full text-center text-sm font-bold text-slate-900 dark:text-white">
                {demoPack?.title ?? "Extrait"}
              </p>
            </div>

            <div className="p-4 sm:p-5">
              {demoPack ? (
                <ActivityPlayer
                  key={active}
                  activity={demoPack.activity}
                  duration={demoPack.duration}
                  videoEndRatio={demoPack.videoEndRatio}
                  onReady={() => {
                    /* Démo : on laisse l'activité affichée, sans écran « Bien joué ». */
                  }}
                />
              ) : (
                <p className="py-8 text-center text-sm text-slate-500">Extrait indisponible.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { DEMO as DEMO_USER };
