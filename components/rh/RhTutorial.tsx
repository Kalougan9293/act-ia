"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export const RH_TOUR_STEPS = [
  {
    id: "enrolled",
    selector: "#rh-tour-enrolled",
    label: "Inscrits",
    comment: "Nombre total de collaborateurs inscrits à la formation.",
    placement: "below" as const,
  },
  {
    id: "progress",
    selector: "#rh-tour-progress",
    label: "En cours",
    comment: "Ceux qui ont commencé la formation.",
    placement: "below" as const,
  },
  {
    id: "done",
    selector: "#rh-tour-done",
    label: "Terminés",
    comment: "Ceux qui ont terminé la formation.",
    placement: "below" as const,
  },
  {
    id: "seats",
    selector: "#rh-tour-seats",
    label: "Limite",
    comment:
      "Plafond d'accès autorisé. Attention : dès qu'une personne a démarré la formation, la place reste comptée.",
    placement: "below" as const,
  },
  {
    id: "module",
    selector: "#rh-tour-module",
    label: "Module entreprise",
    comment:
      "Renseignez vos usages IA : vos apprenants les verront dans leur parcours.",
    placement: "below" as const,
  },
  {
    id: "link",
    selector: "#rh-tour-link",
    label: "Lien",
    comment:
      "Envoyez ce lien par e-mail. À la première visite, ils cliquent sur « Première connexion ? » pour créer leur accès.",
    placement: "below" as const,
  },
  {
    id: "col-name",
    selector: "#rh-tour-col-name",
    label: "Collaborateur",
    comment: "Vos apprenants : la liste des collaborateurs suivis.",
    placement: "below" as const,
  },
  {
    id: "col-progress",
    selector: "#rh-tour-col-progress",
    label: "Avancement",
    comment:
      "Leur état d'avancement. À 100 %, l'attestation nominative sera accessible ici.",
    placement: "below" as const,
  },
  {
    id: "col-scores",
    selector: "#rh-tour-col-scores",
    label: "Avant / Après",
    comment: "Niveau avant la formation, puis après le QCM final.",
    placement: "below" as const,
  },
  {
    id: "col-lastseen",
    selector: "#rh-tour-col-lastseen",
    label: "Dernière connexion",
    comment: "Pour vérifier qu'ils se sont bien connectés.",
    placement: "below" as const,
  },
  {
    id: "article4",
    selector: "#rh-tour-article4",
    label: "Synthèse Article 4",
    comment:
      "Votre attestation d'entreprise : elle documente le suivi de vos salariés au titre de l'Article 4.",
    placement: "below" as const,
  },
  {
    id: "add",
    selector: "#rh-tour-add",
    label: "Ajouter",
    comment: "Ici, pour ajouter manuellement vos apprenants.",
    placement: "below" as const,
  },
];

type RhTourStep = (typeof RH_TOUR_STEPS)[number];
type RhPhase = "idle" | "ready" | "running";

type RhTutorialContextValue = {
  phase: RhPhase;
  stepIndex: number;
  openTutorial: () => void;
  closeTutorial: () => void;
};

const RhTutorialContext = createContext<RhTutorialContextValue | null>(null);

export function useRhTutorial() {
  const ctx = useContext(RhTutorialContext);
  if (!ctx) {
    throw new Error("useRhTutorial doit être utilisé dans RhTutorialProvider");
  }
  return ctx;
}

export function useRhTutorialOptional() {
  return useContext(RhTutorialContext);
}

function scrollToSelector(selector: string) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
}

function useHighlightRect(active: boolean, selector: string | null) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const measure = useCallback(() => {
    if (!active || !selector) {
      setRect(null);
      return;
    }
    const el = document.querySelector(selector);
    if (!el) {
      setRect(null);
      return;
    }
    setRect(el.getBoundingClientRect());
  }, [active, selector]);

  useEffect(() => {
    measure();
    if (!active) return;
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    const id = window.setInterval(measure, 200);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      window.clearInterval(id);
    };
  }, [active, measure]);

  return rect;
}

function calloutPosition(
  rect: DOMRect,
  pad: number,
  preferred: RhTourStep["placement"],
) {
  const gap = 14;
  const calloutW = Math.min(320, window.innerWidth - 32);
  const estimatedH = 150;
  const frameTop = rect.top - pad;
  const frameBottom = rect.bottom + pad;
  const frameCenterX = rect.left + rect.width / 2;

  let side: "below" | "above" = preferred;
  const spaceBelow = window.innerHeight - frameBottom;
  const spaceAbove = frameTop;
  if (preferred === "below" && spaceBelow < estimatedH + gap && spaceAbove > spaceBelow) {
    side = "above";
  } else if (preferred === "above" && spaceAbove < estimatedH + gap && spaceBelow > spaceAbove) {
    side = "below";
  }

  let left = frameCenterX - calloutW / 2;
  left = Math.max(16, Math.min(left, window.innerWidth - calloutW - 16));

  const top =
    side === "below"
      ? frameBottom + gap
      : Math.max(16, frameTop - gap - estimatedH);

  return { top, left, side, width: calloutW };
}

export function RhTutorialProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<RhPhase>("idle");
  const [stepIndex, setStepIndex] = useState(0);

  const step = RH_TOUR_STEPS[stepIndex] ?? null;
  const highlightRect = useHighlightRect(
    phase === "running" && Boolean(step),
    step?.selector ?? null,
  );

  const openTutorial = useCallback(() => {
    setStepIndex(0);
    setPhase("ready");
  }, []);

  const closeTutorial = useCallback(() => {
    setPhase("idle");
    setStepIndex(0);
  }, []);

  const launchTour = useCallback(() => {
    setStepIndex(0);
    setPhase("running");
  }, []);

  useEffect(() => {
    if (phase === "idle") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeTutorial();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, closeTutorial]);

  useEffect(() => {
    if (phase !== "running" || !step) return;
    scrollToSelector(step.selector);
  }, [phase, step]);

  function goNext() {
    if (stepIndex >= RH_TOUR_STEPS.length - 1) {
      closeTutorial();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  const value = useMemo(
    () => ({ phase, stepIndex, openTutorial, closeTutorial }),
    [phase, stepIndex, openTutorial, closeTutorial],
  );

  const pad = 10;
  const isLastStep = stepIndex >= RH_TOUR_STEPS.length - 1;
  const callout =
    step && highlightRect
      ? calloutPosition(highlightRect, pad, step.placement)
      : null;

  return (
    <RhTutorialContext.Provider value={value}>
      {children}

      {phase === "ready" && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rh-tour-ready-title"
          onClick={closeTutorial}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900"
          >
            <h2
              id="rh-tour-ready-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              Tutoriel Pilotage RH
            </h2>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={closeTutorial}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={launchTour}
                className="flex-1 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "running" && (
        <div className="pointer-events-none fixed inset-0 z-[55]">
          {highlightRect ? (
            <div
              className="demo-tour-glow absolute rounded-xl border-2 border-red-500"
              style={{
                top: highlightRect.top - pad,
                left: highlightRect.left - pad,
                width: highlightRect.width + pad * 2,
                height: highlightRect.height + pad * 2,
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-slate-950/45" />
          )}

          {step && callout && (
            <div
              className="pointer-events-auto absolute z-[56] w-[min(20rem,calc(100vw-2rem))]"
              style={{ top: callout.top, left: callout.left }}
            >
              {callout.side === "below" ? (
                <div
                  className="mx-auto mb-1 h-0 w-0 border-x-8 border-b-8 border-x-transparent border-b-white dark:border-b-slate-900"
                  aria-hidden
                />
              ) : null}
              <div className="rounded-2xl border border-red-200 bg-white p-3.5 shadow-xl dark:border-red-500/40 dark:bg-slate-900">
                <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                  Étape {stepIndex + 1}/{RH_TOUR_STEPS.length} · {step.label}
                </p>
                <p className="mt-1.5 text-center text-sm font-semibold leading-snug text-slate-900 dark:text-white">
                  {step.comment}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={closeTutorial}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Quitter
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                  >
                    {isLastStep ? "Terminer" : "Suivant"}
                  </button>
                </div>
              </div>
              {callout.side === "above" ? (
                <div
                  className="mx-auto mt-1 h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-white dark:border-t-slate-900"
                  aria-hidden
                />
              ) : null}
            </div>
          )}
        </div>
      )}
    </RhTutorialContext.Provider>
  );
}

export function RhTutorialButton({ className }: { className?: string }) {
  const tutorial = useRhTutorialOptional();
  if (!tutorial) return null;
  const tourActive =
    tutorial.phase === "ready" || tutorial.phase === "running";

  return (
    <button
      type="button"
      onClick={() => tutorial.openTutorial()}
      className={cn(
        "rounded-lg px-4 py-1 text-[11px] font-semibold transition-colors",
        tourActive
          ? "bg-blue-600 text-white"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
        className,
      )}
    >
      Tutoriel
    </button>
  );
}
