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
    name: "TPE",
    seats: "1 à 10 salariés",
    price: "490 €",
    priceLabel: "/ an HT",
    highlight: false,
    features: [
      "Jusqu'à 10 accès collaborateurs",
      "Formations complètes IA Act & RGPD",
      "Attestations PDF nominatives automatiques",
      "Tableau de bord RH de suivi",
      "Support par email",
    ],
    cta: "Démarrer maintenant",
  },
  {
    name: "PME",
    seats: "11 à 50 salariés",
    price: "990 €",
    priceLabel: "/ an HT",
    highlight: true,
    features: [
      "Jusqu'à 50 accès collaborateurs",
      "Tout le plan TPE inclus",
      "Dashboard RH avancé + Relances auto",
      "Exports de conformité en 1 clic (PDF/CSV)",
      "Archivage légal 5 ans & Support prioritaire",
    ],
    cta: "Mettre ma PME en conformité",
  },
  {
    name: "Entreprise",
    seats: "+50 salariés",
    price: "Sur devis",
    highlight: false,
    features: [
      "Nombre de comptes sur-mesure",
      "Intégration SSO & API dédiées",
      "Accompagnement DPO & Marque blanche",
      "Création de modules et cas pratiques sur-mesure",
      "Contrat SLA 99,9% garanti",
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
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Un <span className="text-blue-600 dark:text-blue-400">prix</span> fixe, une{" "}
            <span className="text-blue-600 dark:text-blue-400">conformité</span> totale
          </h2>
          <p className="text-center text-slate-900 dark:text-slate-100 max-w-xl mx-auto text-lg">
            Abonnement annuel sans frais cachés. Mises à jour réglementaires incluses.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative flex flex-col hover:z-20 ${plan.highlight ? "md:-translate-y-3 z-10" : ""}`}
            >
              <motion.div
                whileHover={{ scale: 1.045, y: -10 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`relative flex flex-col h-full rounded-2xl border bg-white p-7 text-center transition-shadow duration-300 dark:bg-slate-800 hover:shadow-2xl ${
                  plan.highlight
                    ? "border-blue-600 shadow-md hover:shadow-blue-200/80 dark:border-blue-500 dark:hover:shadow-blue-900/40"
                    : "border-slate-200 shadow-sm hover:shadow-slate-300/70 dark:border-slate-700 dark:hover:shadow-slate-950/50"
                }`}
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-left text-sm text-black dark:text-white mt-1">{plan.seats}</p>
                </div>

                <div className="mb-7 pb-7 border-b border-slate-100 dark:border-slate-700">
                  {plan.priceLabel ? (
                    <div className="flex items-end justify-center gap-2">
                      <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-sm mb-1.5">{plan.priceLabel}</span>
                    </div>
                  ) : (
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                  )}
                </div>

                <ul className="flex-1 space-y-3 mb-8 w-fit mx-auto text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-900 dark:text-slate-100">
                      <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="#"
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

        <p className="text-center text-sm text-slate-600 dark:text-slate-300 mt-10">
          Besoin d&apos;un module spécifique à votre métier ? On l&apos;ajoute au parcours, sur devis.{" "}
          <a href="#" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Demander du sur-mesure
          </a>
        </p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4"
        >
          Paiement annuel par carte ou virement • Facture avec TVA • Mises à jour légales incluses.
        </motion.p>
      </div>
    </section>
  );
}
