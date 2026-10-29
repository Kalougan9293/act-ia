"use client";

import {
  createContext,
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const DEMO_CODE = "9293";

export const DEMO_TOUR_STEPS = [
  {
    id: "hero-pitch",
    selector: "#demo-tour-hero-pitch",
    label: "Le besoin Art. 4",
    /** Commentaire présenté sous / près du cadre, avec flèche */
    comment: "L'AI Act demande des mesures pour soutenir la maîtrise de l'IA.",
    /** Préférence de placement du cartouche */
    placement: "below" as const,
  },
  {
    id: "problem-intro",
    selector: "#demo-tour-problem-intro",
    label: "Les risques",
    comment: "Là où ça fait mal — et pourquoi ils cherchent une solution.",
    placement: "below" as const,
  },
  {
    id: "problem-card-1",
    selector: "#demo-tour-problem-card-1",
    label: "AI Act · Article 4",
    comment: "Il ne suffit pas d'agir : il faut pouvoir le prouver.",
    placement: "below" as const,
  },
  {
    id: "problem-card-2",
    selector: "#demo-tour-problem-card-2",
    label: "Données & sécurité",
    comment: "Fuite de données : le risque est réel, et fréquent.",
    placement: "below" as const,
  },
  {
    id: "problem-card-3",
    selector: "#demo-tour-problem-card-3",
    label: "Charge RH",
    comment: "Sans outil, le RH n'a ni temps ni vision claire.",
    placement: "below" as const,
  },
  {
    id: "hero-solution",
    selector: "#demo-tour-hero-solution",
    label: "La solution",
    comment: "Voici la réponse : une plateforme clé en main.",
    placement: "below" as const,
  },
  {
    id: "hero-expertise",
    selector: "#demo-tour-hero-expertise",
    label: "Expertise",
    comment: "Contenu relu : formateur + juriste AI Act / RGPD.",
    placement: "below" as const,
  },
  {
    id: "trust-banner",
    selector: "#demo-tour-trust-banner",
    label: "Preuves & pilotage",
    comment: "Preuves, suivi, veille : le dossier est carré.",
    placement: "below" as const,
  },
  {
    id: "feature-salaries",
    selector: "#demo-tour-feature-1",
    label: "Pour les salariés",
    comment: "Côté salarié : des réflexes concrets au quotidien.",
    placement: "below" as const,
  },
  {
    id: "feature-entreprises",
    selector: "#demo-tour-feature-2",
    label: "Pour les entreprises",
    comment: "Côté entreprise : l'attestation de suivi, nominative.",
    placement: "below" as const,
  },
  {
    id: "feature-suivi",
    selector: "#demo-tour-feature-3",
    label: "Suivi RH",
    comment: "Côté RH : un suivi clair, en un coup d'œil.",
    placement: "below" as const,
  },
  {
    id: "deploy-steps",
    selector: "#demo-tour-deploy-steps",
    label: "Déploiement",
    comment: "En place en quelques minutes — sans installation.",
    placement: "below" as const,
  },
  {
    id: "cta-demo",
    selector: "#demo-tour-cta-demo",
    label: "Tester la démo",
    comment: "Et maintenant : on ouvre le parcours.",
    placement: "below" as const,
  },
];

type DemoTourStep = Omit<(typeof DEMO_TOUR_STEPS)[number], "placement"> & {
  placement: "below" | "above";
};

type DemoPhase = "idle" | "code" | "ready" | "running";

type DemoTourContextValue = {
  phase: DemoPhase;
  stepIndex: number;
  openDemo: () => void;
  closeDemo: () => void;
};

const DemoTourContext = createContext<DemoTourContextValue | null>(null);

export function useDemoTour() {
  const ctx = useContext(DemoTourContext);
  if (!ctx) {
    throw new Error("useDemoTour doit être utilisé dans DemoTourProvider");
  }
  return ctx;
}

/** Version safe pour Navbar hors home (pas de provider) */
export function useDemoTourOptional() {
  return useContext(DemoTourContext);
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

export function DemoTourProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const step = DEMO_TOUR_STEPS[stepIndex] ?? null;
  const highlightRect = useHighlightRect(
    phase === "running" && Boolean(step),
    step?.selector ?? null,
  );

  const openDemo = useCallback(() => {
    setCode("");
    setCodeError(false);
    setStepIndex(0);
    setPhase("code");
    // Naviguer vers la zone de la 1ʳᵉ étape pendant la saisie du code
    window.requestAnimationFrame(() => {
      scrollToSelector(DEMO_TOUR_STEPS[0].selector);
    });
  }, []);

  const closeDemo = useCallback(() => {
    setPhase("idle");
    setStepIndex(0);
    setCode("");
    setCodeError(false);
  }, []);

  useEffect(() => {
    if (phase !== "code") return;
    const id = window.setTimeout(() => codeInputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "idle") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDemo();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, closeDemo]);

  useEffect(() => {
    if (phase !== "running" || !step) return;
    scrollToSelector(step.selector);
  }, [phase, step]);

  function submitCode(e: FormEvent) {
    e.preventDefault();
    if (code.trim() !== DEMO_CODE) {
      setCodeError(true);
      return;
    }
    setCode("");
    setCodeError(false);
    setPhase("ready");
  }

  function launchTour() {
    setStepIndex(0);
    setPhase("running");
  }

  function goNext() {
    if (stepIndex >= DEMO_TOUR_STEPS.length - 1) {
      closeDemo();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  const value = useMemo(
    () => ({ phase, stepIndex, openDemo, closeDemo }),
    [phase, stepIndex, openDemo, closeDemo],
  );

  const pad = 10;
  const isLastStep = stepIndex >= DEMO_TOUR_STEPS.length - 1;
  const callout = step && highlightRect
    ? calloutPosition(highlightRect, pad, step.placement)
    : null;

  return (
    <DemoTourContext.Provider value={value}>
      {children}

      {phase === "code" && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-24 backdrop-blur-sm sm:items-center sm:py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-code-title"
          onClick={closeDemo}
        >
          <form
            onSubmit={submitCode}
            onClick={(e) => e.stopPropagation()}
            className="my-auto w-full max-w-xs rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
          >
            <h2
              id="demo-code-title"
              className="text-center text-sm font-semibold text-slate-900 dark:text-white"
            >
              Code démo
            </h2>
            <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
              Entrez le code pour lancer la présentation.
            </p>
            <input
              ref={codeInputRef}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setCodeError(false);
              }}
              className={cn(
                "mt-4 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-center text-sm tracking-[0.35em] text-slate-900 outline-none focus:ring-2 dark:bg-slate-800 dark:text-white",
                codeError
                  ? "border-red-400 focus:ring-red-300 dark:border-red-500"
                  : "border-slate-200 focus:ring-blue-300 dark:border-slate-600",
              )}
              placeholder="••••"
              aria-invalid={codeError}
            />
            {codeError && (
              <p className="mt-2 text-center text-xs font-medium text-red-600 dark:text-red-400">
                Code incorrect
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={closeDemo}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Valider
              </button>
            </div>
          </form>
        </div>
      )}

      {phase === "ready" && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-ready-title"
          onClick={closeDemo}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900"
          >
            <h2
              id="demo-ready-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              Prêt pour la présentation&nbsp;?
            </h2>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={closeDemo}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={launchTour}
                className="flex-1 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Lancez&nbsp;!
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
                  Étape {stepIndex + 1}/{DEMO_TOUR_STEPS.length}
                </p>
                <p className="mt-1.5 text-center text-sm font-semibold leading-snug text-slate-900 dark:text-white">
                  {step.comment}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={closeDemo}
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
    </DemoTourContext.Provider>
  );
}

function calloutPosition(
  rect: DOMRect,
  pad: number,
  preferred: DemoTourStep["placement"],
) {
  const gap = 14;
  const calloutW = Math.min(320, window.innerWidth - 32);
  const estimatedH = 140;
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
