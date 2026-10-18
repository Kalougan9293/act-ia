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
    <section id="deploy" className="border-y border-slate-200 bg-slate-50 py-12 dark:border-slate-700/60 dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 space-y-3 text-center"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Déploiement en{" "}
            <span className="text-blue-600 dark:text-blue-400">5 minutes</span>
          </h2>
          <p className="mx-auto max-w-2xl text-center text-lg text-slate-900 dark:text-slate-100">
            Pas d&apos;usine à gaz technique. Vous lancez, vos équipes se connectent.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-center"
            >
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {step.n}
              </span>
              <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
