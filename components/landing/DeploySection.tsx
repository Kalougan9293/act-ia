"use client";

import { motion } from "framer-motion";

const steps = [
  {
    n: "1",
    title: "Rien à installer",
    text: "Accessible sur navigateur — ordinateur, tablette ou téléphone.",
  },
  {
    n: "2",
    title: "Vous envoyez un lien",
    text: "Invitation permanente : vos salariés rejoignent leur parcours seuls.",
  },
  {
    n: "3",
    title: "Prêt en quelques minutes",
    text: "Le RH suit l'avancement tout de suite. Pas de projet IT.",
  },
];

export default function DeploySection() {
  return (
    <section
      id="deploy"
      className="border-y border-slate-200 bg-slate-50 py-6 dark:border-slate-700/60 dark:bg-slate-900/50 sm:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-center sm:mb-8"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Déploiement en{" "}
            <span className="text-blue-600 dark:text-blue-400">5 minutes</span>
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-4xl gap-2.5 sm:grid-cols-3 sm:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-start gap-2.5 sm:mx-auto sm:max-w-xs sm:flex-col sm:items-center sm:gap-0 sm:text-center"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-sm">
                {step.n}
              </span>
              <div className="min-w-0 flex-1 sm:w-full sm:flex-none">
                <h3 className="text-sm font-bold leading-snug text-slate-900 dark:text-white sm:mt-3 sm:text-center sm:text-base">
                  {step.title}
                </h3>
                <p className="mt-0.5 text-xs leading-snug text-slate-600 dark:text-slate-300 sm:mt-2 sm:text-center sm:text-sm sm:leading-relaxed">
                  {step.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
