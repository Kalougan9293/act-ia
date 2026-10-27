"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  GraduationCap,
  Pause,
  Play,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import Badge from "@/components/ui/Badge";

const CONTACT_EMAIL = "contact@lockin-web.online";
const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  "Accompagnement IA — LockinIA",
)}`;

const offerings = [
  {
    label: "Formation",
    icon: GraduationCap,
    title: "Vos équipes opérationnelles dès demain",
    summary:
      "Ateliers concrets : bons usages, données sensibles, prompts efficaces. Vos collaborateurs repartent avec des méthodes applicables immédiatement.",
    side: "left" as const,
  },
  {
    label: "Automatisation",
    icon: Workflow,
    title: "On coupe le travail inutile",
    summary:
      "On cartographie ce qui vous fait perdre du temps, on priorise le ROI, on déploie assistants et workflows — sans usine à gaz.",
    side: "right" as const,
  },
  {
    label: "Intégration",
    icon: ShieldCheck,
    title: "L’IA devient un process, pas un gadget",
    summary:
      "Cas d’usage, règles, validations humaines : on ancre l’IA dans le quotidien pour qu’elle tienne dans la durée.",
    side: "left" as const,
  },
];

function GlowLabel({ label }: { label: string }) {
  return (
    <div className="relative flex h-[5.5rem] w-full max-w-[15rem] flex-col items-center justify-center rounded-2xl bg-slate-950 px-5 text-center sm:h-[6rem]">
      {/* Contour lumineux (statique) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-blue-400/80"
        style={{
          boxShadow:
            "0 0 0 1px rgba(147,197,253,0.35), 0 0 18px 2px rgba(37,99,235,0.75), 0 0 42px 6px rgba(56,189,248,0.35), inset 0 0 20px rgba(37,99,235,0.25)",
        }}
      />
      <span className="relative text-lg font-black uppercase tracking-[0.14em] text-white sm:text-xl">
        {label}
      </span>
    </div>
  );
}

function DetailCard({ item }: { item: (typeof offerings)[number] }) {
  const Icon = item.icon;
  return (
    <div className="relative w-full rounded-2xl border border-blue-500/25 bg-white p-5 shadow-[0_16px_40px_-18px_rgba(37,99,235,0.5)] dark:border-blue-400/20 dark:bg-slate-900 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/35">
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 text-left">
          <h3 className="text-base font-extrabold leading-snug text-slate-900 dark:text-white sm:text-lg">
            {item.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {item.summary}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Trace horizontale propre : pad → jog PCB → flèche */
function CircuitHorizontal({ reverse = false }: { reverse?: boolean }) {
  return (
    <div
      className={`hidden h-full items-center justify-center lg:flex ${
        reverse ? "scale-x-[-1]" : ""
      }`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 96 32"
        className="h-8 w-full max-w-[6rem] text-blue-400"
        fill="none"
      >
        {/* ligne principale avec un seul décrochement */}
        <path
          d="M6 16 H34 V10 H62 V16 H82"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <circle cx="6" cy="16" r="3" fill="currentColor" />
        <circle cx="34" cy="10" r="2" fill="currentColor" opacity="0.65" />
        <circle cx="62" cy="16" r="2" fill="currentColor" opacity="0.65" />
        {/* pointe de flèche nette */}
        <path d="M90 16 L80 10.5 V21.5 Z" fill="currentColor" />
      </svg>
    </div>
  );
}

/** Trace verticale : pointe collée au haut du titre suivant */
function CircuitDown({ toSide }: { toSide: "left" | "right" }) {
  return (
    <div
      className={
        toSide === "left"
          ? "grid grid-cols-1 lg:grid-cols-[15rem_5.5rem_minmax(0,1fr)]"
          : "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_5.5rem_15rem]"
      }
      aria-hidden="true"
    >
      <div
        className={`flex justify-center leading-none ${
          toSide === "left" ? "lg:col-start-1" : "lg:col-start-3"
        }`}
      >
        <svg
          viewBox="0 0 32 64"
          className="mb-0 block h-12 w-8 text-blue-400 sm:h-14"
          preserveAspectRatio="xMidYMax meet"
          fill="none"
        >
          <path
            d="M16 2 V24 H22 V38 H16 V50"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
          <circle cx="16" cy="2" r="2.5" fill="currentColor" />
          <circle cx="22" cy="24" r="1.8" fill="currentColor" opacity="0.65" />
          {/* Pointe jusqu'au bord bas du SVG = touche le titre */}
          <path d="M16 64 L9 50 H23 Z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

const ease = [0.22, 1, 0.36, 1] as const;

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease },
  };
}

function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [hovered, setHovered] = useState(false);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.muted = false;
      void video.play();
      setPlaying(true);
      setStarted(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-lg dark:border-slate-700"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <video
        ref={videoRef}
        src="/media/interventions-hero.mp4"
        className="aspect-video h-auto w-full object-cover"
        loop
        playsInline
        preload="metadata"
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
        }}
        onPause={() => setPlaying(false)}
        aria-label="Accompagnement IA en entreprise"
      />
      <button
        type="button"
        onClick={toggle}
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${
          !started || !playing || hovered ? "opacity-100" : "opacity-0"
        }`}
        aria-label={playing ? "Mettre en pause" : "Lire la vidéo"}
      >
        {!started && (
          <div className="absolute inset-0 bg-slate-950/25 pointer-events-none" />
        )}
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ring-4 ring-white/80 sm:h-16 sm:w-16">
          {playing ? (
            <Pause className="h-7 w-7" fill="currentColor" strokeWidth={0} />
          ) : (
            <Play className="h-7 w-7 translate-x-0.5" fill="currentColor" strokeWidth={0} />
          )}
        </span>
      </button>
    </div>
  );
}

export default function InterventionsContent() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white pt-16 dark:bg-slate-900">
        <div className="pointer-events-none absolute inset-0 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(219,234,254,0.55),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(30,58,138,0.25),transparent)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 lg:px-8 lg:pb-16 lg:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="space-y-6 text-center">
              <motion.div {...fadeUp(0)} className="flex justify-center">
                <Badge variant="pill">Accompagnement IA</Badge>
              </motion.div>

              <motion.h1
                {...fadeUp(0.08)}
                className="text-center text-[1.85rem] font-extrabold leading-[1.15] tracking-tight text-slate-900 dark:text-white sm:text-[2.2rem] lg:text-[2.6rem]"
              >
                Ne testez pas l&apos;IA.{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  Faites-en un outil de travail.
                </span>
              </motion.h1>

              <motion.p
                {...fadeUp(0.16)}
                className="mx-auto max-w-xl text-center text-base leading-relaxed text-slate-700 dark:text-slate-200 sm:text-[1.0625rem]"
              >
                Gagner du temps, former vos équipes, automatiser le répétitif —
                sans exposer vos données ni empiler les outils inutiles.
              </motion.p>

              <motion.div
                {...fadeUp(0.24)}
                className="flex justify-center pt-1"
              >
                <a
                  href={mailtoHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
                >
                  Parlons de vos besoins
                  <ArrowRight className="h-4 w-4" />
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease }}
              className="relative mx-auto w-full max-w-lg lg:max-w-none"
            >
              <HeroVideo />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Parcours zigzag aligné */}
      <section className="relative overflow-hidden bg-slate-950 py-16 text-white sm:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_10%,rgba(37,99,235,0.45),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_70%,rgba(56,189,248,0.2),transparent)]" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(148,163,184,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.45) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center text-xs font-bold uppercase tracking-[0.35em] text-blue-300/90"
          >
            Ce que l&apos;on livre
          </motion.p>
          <h2 className="sr-only">Formation, Automatisation, Intégration</h2>

          <div className="flex flex-col">
            {offerings.map((item, i) => {
              const labelLeft = item.side === "left";
              return (
                <div key={item.label}>
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: 0.04, ease }}
                    className={
                      labelLeft
                        ? "grid items-center gap-3 lg:grid-cols-[15rem_5.5rem_minmax(0,1fr)] lg:gap-0"
                        : "grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_5.5rem_15rem] lg:gap-0"
                    }
                  >
                    {labelLeft ? (
                      <>
                        <div className="flex justify-center lg:justify-start">
                          <GlowLabel label={item.label} />
                        </div>
                        <CircuitHorizontal />
                        <DetailCard item={item} />
                      </>
                    ) : (
                      <>
                        <div className="order-1 flex justify-center lg:order-3 lg:justify-end">
                          <GlowLabel label={item.label} />
                        </div>
                        <div className="order-2 hidden lg:order-2 lg:block">
                          <CircuitHorizontal reverse />
                        </div>
                        <div className="order-3 lg:order-1">
                          <DetailCard item={item} />
                        </div>
                      </>
                    )}
                  </motion.div>

                  {i < offerings.length - 1 ? (
                    <CircuitDown toSide={offerings[i + 1]!.side} />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Une tâche à automatiser, une équipe à former ?
          </h2>
          <a
            href={mailtoHref}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
          >
            Échanger sur mon projet
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  );
}
