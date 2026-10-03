"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const stats = [
  {
    value: "Dossier de preuve Art. 4",
    label: "Attestations de suivi et registre des usages",
  },
  {
    value: "RS6776 & RS6601",
    label: "Parcours alignés, avec nos partenaires certificateurs",
  },
  {
    value: "Attestation de suivi",
    label: "Nominative et horodatée",
  },
  {
    value: "Registre pour le DPO",
    label: "Traçabilité des mesures et des usages couverts",
  },
  {
    value: "Prise en main immédiate",
    label: "100 % SaaS, aucune installation",
  },
];

export default function TrustBanner() {
  return (
    <section className="bg-slate-50 dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-700/60 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-fit max-w-5xl flex-col gap-6 sm:w-full sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.value}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex items-start gap-3 sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]"
            >
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
