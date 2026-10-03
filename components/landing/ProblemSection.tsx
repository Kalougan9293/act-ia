"use client";

import { motion } from "framer-motion";

const problems = [
  {
    tag: "AI Act • Article 4",
    title: "Contraintes en cas de contrôle",
    description:
      "L'article 4 demande des mesures pour les équipes qui utilisent l'IA. L'absence de preuve documentée ne laisse rien à montrer en cas de contrôle.",
    stat: "En vigueur depuis le 2 février 2025",
    statLabel: "Contrôles dès le 2 août 2026",
    statClass: "text-base",
    card: "bg-blue-50/80 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900",
  },
  {
    tag: "RGPD & Sécurité",
    title: "Fuites de données clients & PI",
    description:
      "Sans directives claires, l'usage non encadré de ChatGPT ou Copilot par vos salariés peut faire sortir des données confidentielles ou à caractère personnel.",
    stat: "Sans cadre",
    statLabel: "un usage peut sortir du registre",
    statClass: "text-xl",
    card: "bg-sky-50/90 border-sky-200 dark:bg-sky-950/30 dark:border-sky-900",
  },
  {
    tag: "Charge RH",
    title: "Gestion manuelle & chronophage",
    description:
      "Coordonner des formations externes et collecter manuellement les preuves de présence mobilise inutilement vos équipes RH.",
    stat: "40h+ perdues",
    statLabel: "par an en gestion administrative",
    statClass: "text-xl",
    card: "bg-indigo-50/80 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-900",
  },
];

export default function ProblemSection() {
  return (
    <section id="problem" className="py-12 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 space-y-3"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Ce que{" "}
            <span className="text-blue-600 dark:text-blue-400">
              l&apos;absence de formation
            </span>{" "}
            fait risquer à votre entreprise
          </h2>
          <p className="text-center text-slate-900 dark:text-slate-100 max-w-2xl mx-auto text-lg">
            L&apos;article 4 demande des mesures pour les équipes qui utilisent l&apos;IA.
            Les attestations et le registre les rendent visibles.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((problem, i) => (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`flex flex-col gap-5 rounded-xl border shadow-sm px-6 pt-6 pb-4 ${problem.card}`}
              >
                <div className="space-y-2 flex-1">
                  <p className="text-center text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {problem.tag}
                  </p>
                  <h3 className="text-center text-base font-bold text-slate-900 dark:text-white">{problem.title}</h3>
                  <p className="text-center text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
                    {problem.description}
                  </p>
                </div>

                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 text-center">
                  <p className={`text-center font-extrabold text-slate-900 dark:text-slate-100 ${problem.statClass}`}>
                    {problem.stat}
                  </p>
                  <p className="text-center text-sm text-black dark:text-white mt-0.5">
                    {problem.statLabel}
                  </p>
                </div>
              </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
