"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import VideoPlaceholder from "./VideoPlaceholder";

const ease = [0.22, 1, 0.36, 1] as const;

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease },
  };
}

export default function Hero() {
  return (
    <section className="relative bg-white dark:bg-slate-900 overflow-hidden pt-16">
      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(219,234,254,0.5),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(30,58,138,0.2),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-14 xl:gap-20 items-center">

          {/* LEFT — Copy */}
          <div className="space-y-6">

            {/* Top pill */}
            <motion.div {...fadeUp(0)}>
              <Badge variant="pill">
                EU AI Act &amp; RGPD · Article 4 obligatoire
              </Badge>
            </motion.div>

            {/* H1 */}
            <motion.div {...fadeUp(0.1)}>
              <h1 className="text-[1.85rem] sm:text-[2.15rem] lg:text-[2.55rem] font-extrabold text-slate-900 dark:text-white leading-[1.2] tracking-tight text-justify hyphens-auto">
                La plateforme clé en main pour{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  attester la formation
                </span>{" "}
                de vos salariés à l&apos;IA et au RGPD en continu
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              {...fadeUp(0.2)}
              className="text-base sm:text-[1.0625rem] text-slate-700 dark:text-slate-200 leading-relaxed text-justify hyphens-auto"
            >
              Mettez votre entreprise en mesure de répondre à l&apos;AI Act
              (article 4) et suivez l&apos;avancement RH sans effort.
            </motion.p>

            {/* CTAs */}
            <motion.div {...fadeUp(0.3)} className="flex flex-wrap items-center gap-4 pt-1">
              <motion.div
                whileHover={{ scale: 1.08, y: -8 }}
                transition={{ type: "spring", stiffness: 380, damping: 15 }}
              >
                <a
                  href="mailto:contact@conformai.fr?subject=Demande%20ConformAI"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-[0_18px_40px_-8px_rgba(37,99,235,0.85)] transition-shadow duration-300 group"
                >
                  Constituer mon dossier de preuve
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </a>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.08, y: -8 }}
                transition={{ type: "spring", stiffness: 380, damping: 15 }}
              >
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 border border-blue-600 rounded-xl shadow-md hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:shadow-[0_18px_40px_-8px_rgba(37,99,235,0.55)] transition-shadow duration-300"
                >
                  <Play className="w-4 h-4" fill="currentColor" />
                  Tester la démo
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* RIGHT — Video */}
          <div className="w-full">
            <VideoPlaceholder />
          </div>
        </div>
      </div>
    </section>
  );
}
