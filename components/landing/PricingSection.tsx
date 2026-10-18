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
    price: "390 €",
    priceLabel: "/ an",
    highlight: false,
    features: [
      "Jusqu'à 5 accès utilisateurs",
      "Abonnement annuel, sans frais cachés",
      "Socle commun et fiches métiers incluses",
      "Module entreprise (charte, outils, référent)",
      "Attestations nominatives",
      "Preuves conservées 12 mois après le contrat",
      "Tableau de bord RH, suivi et export",
      "Veille incluse : le parcours suit l'actualité",
      "Renouvellement : nouveaux arrivants + mises à jour",
      "Support par email",
    ],
    cta: "Démarrer maintenant",
  },
  {
    name: "TPE",
    seats: "6 à 20 salariés",
    price: "790 €",
    priceLabel: "/ an",
    highlight: false,
    features: [
      "Jusqu'à 20 accès utilisateurs",
      "Tout le plan Micro inclus",
      "Support prioritaire",
    ],
    cta: "Démarrer maintenant",
  },
  {
    name: "PME",
    seats: "21 à 50 salariés",
    price: "1 290 €",
    priceLabel: "/ an",
    highlight: false,
    features: [
      "Jusqu'à 50 accès utilisateurs",
      "Tout le plan TPE inclus",
    ],
    cta: "Démarrer maintenant",
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
    cta: "Démarrer maintenant",
  },
];

const addons = [
  {
    name: "Module métier sur mesure",
    tag: "Option la plus demandée",
    price: "690 €",
    detail: "/ module",
    featured: true,
    description:
      "Format standard à 690 € : texte + cas pratique + idée d'usage, rédigé pour votre métier et intégré au parcours. Demande plus large (plusieurs métiers, contenus longs) : sur devis.",
  },
  {
    name: "Marque blanche",
    tag: "Partenaires",
    price: "2 000 – 5 000 €",
    detail: "/ an + par apprenant",
    featured: false,
    description:
      "Votre logo et vos couleurs sur la plateforme — pour un organisme de formation ou un cabinet RH. Fourchette indicative ; devis selon le volume.",
  },
  {
    name: "Atelier usages & automatisation",
    tag: "Accompagnement",
    price: "Sur devis",
    detail: "",
    featured: false,
    description:
      "Session avec vos équipes (visio ou présentiel) : prioriser les usages, gagner du temps sur le quotidien, cadrer ce qui peut être automatisé. Hors abonnement, sur devis.",
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
            Un <span className="text-blue-600 dark:text-blue-400">prix</span> fixe, des{" "}
            <span className="text-blue-600 dark:text-blue-400">attestations</span> à jour
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
                      ? "mailto:contact@lockin-web.online?subject=StartIA%20ETI%20-%20devis"
                      : "mailto:contact@lockin-web.online?subject=StartIA%20-%20demarrer"
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

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mx-auto mt-10 max-w-5xl"
        >
          <h3 className="mb-2 text-center text-lg font-semibold text-slate-900 dark:text-white">
            Options
          </h3>
          <p className="mx-auto mb-5 max-w-2xl text-center text-sm text-slate-600 dark:text-slate-300">
            Le socle et les fiches métiers incluses sont dans l&apos;abonnement. Besoin d&apos;un
            contenu propre à votre métier ? Ajoutez un module sur mesure — rédigé et intégré pour vous.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {addons.map((addon) => (
              <div
                key={addon.name}
                className={`relative flex flex-col rounded-2xl border p-5 text-center ${
                  addon.featured
                    ? "border-blue-500 bg-blue-50/60 shadow-md dark:border-blue-500 dark:bg-blue-950/30 lg:scale-[1.02]"
                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                }`}
              >
                {addon.featured ? (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Sur mesure
                  </span>
                ) : null}
                <p
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    addon.featured
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {addon.tag}
                </p>
                <p className="mt-2 font-semibold text-slate-900 dark:text-white">{addon.name}</p>
                <p className="mt-3">
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {addon.price}
                  </span>
                  {addon.detail ? (
                    <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
                      {addon.detail}
                    </span>
                  ) : null}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {addon.description}
                </p>
                {addon.featured ? (
                  <a
                    href="mailto:contact@lockin-web.online?subject=StartIA%20-%20module%20metier%20sur%20mesure"
                    className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Demander un module sur mesure
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
