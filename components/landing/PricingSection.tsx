"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Plan {
  name: string;
  seats: string;
  price: string;
  priceLabel?: string;
  highlight: boolean;
  features: string[];
  cta: string;
}

const plans: Plan[] = [
  {
    name: "Micro",
    seats: "1 à 5 salariés",
    price: "290 €",
    priceLabel: "/ an",
    highlight: false,
    features: [
      "Jusqu'à 5 accès utilisateurs",
      "Abonnement annuel, sans frais cachés",
      "Socle commun et parcours métiers",
      "Attestations nominatives",
      "Preuves conservées 12 mois après le contrat",
      "Tableau de bord RH, registre et export",
      "Veille incluse : le parcours suit l'actualité",
      "Support par email",
    ],
    cta: "Démarrer maintenant",
  },
  {
    name: "TPE",
    seats: "6 à 20 salariés",
    price: "590 €",
    priceLabel: "/ an",
    highlight: false,
    features: [
      "Jusqu'à 20 accès utilisateurs",
      "Tout le plan Micro inclus",
      "Module sur mesure, à la demande",
      "Support prioritaire",
    ],
    cta: "Démarrer maintenant",
  },
  {
    name: "PME",
    seats: "21 à 50 salariés",
    price: "990 €",
    priceLabel: "/ an",
    highlight: true,
    features: [
      "Jusqu'à 50 accès utilisateurs",
      "Tout le plan TPE inclus",
    ],
    cta: "Constituer le dossier de preuve",
  },
  {
    name: "ETI",
    seats: "+50 salariés",
    price: "Sur devis",
    highlight: false,
    features: [
      "Plus de 50 accès",
      "Tout le plan PME inclus",
      "Intégrations sur devis",
      "Contrat et support dédié",
    ],
    cta: "Contacter l'équipe",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-12 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Un <span className="text-blue-600 dark:text-blue-400">prix</span> fixe, un{" "}
            <span className="text-blue-600 dark:text-blue-400">registre</span> à jour
          </h2>
        </motion.div>

        <p className="mx-auto mb-4 max-w-6xl text-center text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:whitespace-nowrap sm:text-2xl">
          Prise en charge{" "}
          <span className="text-blue-600 dark:text-blue-400">OPCO</span> possible
          via un organisme de formation partenaire Qualiopi, selon éligibilité.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative flex flex-col hover:z-20"
            >
              <motion.div
                whileHover={{ scale: 1.03, y: -8 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`relative flex flex-col h-full rounded-2xl border bg-white p-6 text-center transition-shadow duration-300 dark:bg-slate-800 hover:shadow-2xl ${
                  plan.highlight
                    ? "border-blue-600 shadow-md hover:shadow-blue-200/80 dark:border-blue-500 dark:hover:shadow-blue-900/40"
                    : "border-slate-200 shadow-sm hover:shadow-slate-300/70 dark:border-slate-700 dark:hover:shadow-slate-950/50"
                }`}
              >
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-center text-sm text-black dark:text-white mt-1">{plan.seats}</p>
                </div>

                <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                  {plan.priceLabel && plan.price !== "Sur devis" ? (
                    <div className="flex items-end justify-center gap-2">
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-sm mb-1">{plan.priceLabel}</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="block text-3xl font-extrabold text-slate-900 dark:text-white">
                        {plan.price}
                      </span>
                      {plan.priceLabel && (
                        <span className="block text-xs text-slate-500 dark:text-slate-400">
                          {plan.priceLabel}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <ul className="flex-1 space-y-3 mb-7 w-fit mx-auto text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-900 dark:text-slate-100">
                      <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href={
                    plan.name === "ETI"
                      ? "mailto:contact@conformai.fr?subject=ConformAI%20ETI%20-%20devis"
                      : "mailto:contact@conformai.fr?subject=ConformAI%20-%20demarrer"
                  }
                  className={`w-full text-center px-5 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                    plan.highlight
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {plan.cta}
                </a>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <div className="mx-auto mt-4 flex max-w-3xl flex-col items-center gap-1 text-center text-base leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            Option{" "}
            <span className="font-medium text-blue-600 dark:text-blue-400">marque blanche</span>{" "}
            disponible.
          </p>
        </div>
      </div>
    </section>
  );
}
