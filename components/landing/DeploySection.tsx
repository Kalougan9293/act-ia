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
    text: "Parcours toujours ouvert, vos salariés font leur parcours seuls.",
  },
  {
    n: "3",
    title: "Prêt en quelques minutes",
    text: "Le RH suit l'avancement tout de suite.",
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

        <div
          id="demo-tour-deploy-steps"
          className="scroll-mt-28 mx-auto grid max-w-4xl gap-6 sm:grid-cols-3 sm:gap-8"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="mx-auto w-full max-w-xs text-center"
            >
              <div className="mb-2 flex justify-center sm:mb-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-sm">
                  {step.n}
                </span>
              </div>
              <h3 className="text-center text-sm font-bold leading-snug text-slate-900 dark:text-white sm:text-base">
                {step.title}
              </h3>
              <p className="mt-1 text-center text-xs leading-snug text-slate-600 dark:text-slate-300 sm:mt-2 sm:text-sm sm:leading-relaxed">
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
