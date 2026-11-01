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

export const PARTNER_TOUR_STEPS = [
  {
    id: "add",
    selector: "#partner-tour-add",
    label: "Ajouter",
    comment: "Ajoutez ici vos entreprises clientes.",
    placement: "below" as const,
  },
  {
    id: "companies",
    selector: "#partner-tour-companies",
    label: "Entreprises",
    comment: "Le nombre de vos clients (entreprises) suivis.",
    placement: "below" as const,
  },
  {
    id: "limit",
    selector: "#partner-tour-limit",
    label: "Limite",
    comment: "Le volume d'accès que vous avez acquis auprès de LockinIA.",
    placement: "below" as const,
  },
  {
    id: "enrolled",
    selector: "#partner-tour-enrolled",
    label: "Inscrits",
    comment: "Nombre total d'apprenants inscrits dans vos entreprises.",
    placement: "below" as const,
  },
  {
    id: "progress",
    selector: "#partner-tour-progress",
    label: "En cours",
    comment: "Ceux qui ont commencé la formation.",
    placement: "below" as const,
  },
  {
    id: "done",
    selector: "#partner-tour-done",
    label: "Terminés",
    comment: "Ceux qui ont terminé la formation.",
    placement: "below" as const,
  },
  {
    id: "col-company",
    selector: "#partner-tour-col-company",
    label: "Entreprise",
    comment: "Cliquez une entreprise pour voir le détail de ses apprenants.",
    placement: "below" as const,
  },
  {
    id: "col-seats",
    selector: "#partner-tour-col-seats",
    label: "Limite max",
    comment:
      "Ajustez la limite max pour répartir les places. Attention : un apprenant qui a commencé consomme une place.",
    placement: "below" as const,
  },
  {
    id: "col-sat",
    selector: "#partner-tour-col-sat",
    label: "Sat. moy.",
    comment: "Satisfaction moyenne des apprenants de l'entreprise.",
    placement: "below" as const,
  },
  {
    id: "col-rh",
    selector: "#partner-tour-col-rh",
    label: "RH",
    comment: "Contact RH de l'entreprise (nom et e-mail).",
    placement: "below" as const,
  },
  {
    id: "col-link",
    selector: "#partner-tour-col-link",
    label: "Lien",
    comment:
      "Copiez le lien et envoyez-le à vos clients pour qu'ils se connectent à la plateforme. Ils cliquent sur « Première connexion ? », puis accèdent à leur propre tableau de bord (avec tutoriel, etc.).",
    placement: "below" as const,
  },
];

type PartnerTourStep = Omit<(typeof PARTNER_TOUR_STEPS)[number], "placement"> & {
  placement: "below" | "above";
};
type PartnerPhase = "idle" | "ready" | "running";

type PartnerTutorialContextValue = {
  phase: PartnerPhase;
  stepIndex: number;
  openTutorial: () => void;
  closeTutorial: () => void;
};

const PartnerTutorialContext =
  createContext<PartnerTutorialContextValue | null>(null);

export function usePartnerTutorial() {
  const ctx = useContext(PartnerTutorialContext);
  if (!ctx) {
    throw new Error(
      "usePartnerTutorial doit être utilisé dans PartnerTutorialProvider",
    );
  }
  return ctx;
}

export function usePartnerTutorialOptional() {
  return useContext(PartnerTutorialContext);
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
  preferred: PartnerTourStep["placement"],
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

export function PartnerTutorialProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<PartnerPhase>("idle");
  const [stepIndex, setStepIndex] = useState(0);

  const step = PARTNER_TOUR_STEPS[stepIndex] ?? null;
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
    if (stepIndex >= PARTNER_TOUR_STEPS.length - 1) {
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
  const isLastStep = stepIndex >= PARTNER_TOUR_STEPS.length - 1;
  const callout =
    step && highlightRect
      ? calloutPosition(highlightRect, pad, step.placement)
      : null;

  return (
    <PartnerTutorialContext.Provider value={value}>
      {children}

      {phase === "ready" && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="partner-tour-ready-title"
          onClick={closeTutorial}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900"
          >
            <h2
              id="partner-tour-ready-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              Tutoriel Pilotage partenaire
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
                  Étape {stepIndex + 1}/{PARTNER_TOUR_STEPS.length} · {step.label}
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
    </PartnerTutorialContext.Provider>
  );
}

export function PartnerTutorialButton({ className }: { className?: string }) {
  const tutorial = usePartnerTutorialOptional();
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
