"use client";

import { motion } from "framer-motion";

const problems = [
  {
    tag: "AI Act • Article 4",
    title: "Agir sans pouvoir le prouver",
    description:
      "Comme pour le RGPD, le risque n'est pas seulement d'avoir agi : c'est de pouvoir le montrer. L'article 4 impose déjà des mesures pour les équipes qui utilisent l'IA. En cas de contrôle, d'incident ou d'audit client, sans preuves de suivi, votre démarche ne tient pas.",
    stat: "Depuis le 2 février 2025",
    statLabel: "L'obligation s'applique déjà",
    card: "bg-blue-50/80 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900",
  },
  {
    tag: "Données & sécurité",
    title: "Fuites d'informations sensibles",
    description:
      "Sans cadre clair, un salarié peut saisir dans une IA des données personnelles protégées par le RGPD, ou des secrets d'entreprise. Une seule fuite suffit à exposer l'organisation.",
    stat: "Sans cadre d'usage",
    statLabel: "Chacun improvise avec l'IA au quotidien",
    card: "bg-sky-50/90 border-sky-200 dark:bg-sky-950/30 dark:border-sky-900",
  },
  {
    tag: "Charge RH",
    title: "Des heures perdues à former",
    description:
      "Multiplier les formations externes pour chaque personne coûte cher en organisation. Les RH y laissent du temps, sans vision claire de qui a vraiment suivi.",
    stat: "Suivi à la main",
    statLabel: "Relances, tableaux, rappels…",
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
              l&apos;absence de mesures
            </span>{" "}
            fait risquer à votre entreprise
          </h2>
          <p className="mx-auto max-w-2xl text-center text-lg text-slate-900 dark:text-slate-100">
            L&apos;article 4 demande des mesures pour les équipes qui utilisent l&apos;IA,
            et il faut pouvoir le montrer — comme pour le RGPD. Sans preuves, le risque
            reste entier.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:items-stretch">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`grid h-full grid-rows-[1fr_auto] rounded-xl border px-6 pb-4 pt-6 shadow-sm ${problem.card}`}
            >
              <div className="space-y-2">
                <p className="text-center text-sm font-semibold text-blue-700 dark:text-blue-300">
                  {problem.tag}
                </p>
                <h3 className="min-h-[2.75rem] text-center text-base font-bold leading-snug text-slate-900 dark:text-white">
                  {problem.title}
                </h3>
                <p className="text-justify text-sm leading-relaxed text-slate-900 hyphens-auto dark:text-slate-100">
                  {problem.description}
                </p>
              </div>

              <div className="mt-5 flex h-[4.5rem] flex-col justify-center space-y-0.5 border-t border-slate-100 pt-3 text-center dark:border-slate-700">
                <p className="text-center text-base font-extrabold leading-snug text-slate-900 dark:text-slate-100">
                  {problem.stat}
                </p>
                <p className="text-center text-sm leading-snug text-black dark:text-white">
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
