"use client";

import Link from "next/link";
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
      "Preuves (attestations + relevés) : année + 3 ans",
      "Tableau de bord RH, relevés de connexion et export",
      "Veille incluse : le parcours suit l'actualité",
      "Renouvellement : nouveaux arrivants + mises à jour",
      "Référents pédagogique & technique nommés (48 h)",
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
      "Assistance prioritaire : réponse sous 24 h ouvrées (mêmes référents)",
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
      "Assistance dédiée (référents nommés)",
    ],
    cta: "Démarrer maintenant",
  },
];

const addons: {
  name: string;
  tag: string;
  price: string;
  detail: string;
  featured: boolean;
  description: string;
  href?: string;
  cta?: string;
}[] = [
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
    name: "Atelier usages & automatisation",
    tag: "Accompagnement",
    price: "Sur devis",
    detail: "",
    featured: false,
    href: "/interventions",
    cta: "Voir l'accompagnement",
    description:
      "Session avec vos équipes (visio ou présentiel) : prioriser les usages, gagner du temps sur le quotidien, cadrer ce qui peut être automatisé. Hors abonnement, sur devis.",
  },
];

const whiteLabelTiers = [
  { seats: "20–99", price: "40 €" },
  { seats: "100–249", price: "35 €" },
  { seats: "250+", price: "30 €" },
] as const;

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

        <p className="mx-auto mb-4 max-w-6xl text-center text-lg font-semibold tracking-tight text-slate-900 dark:text-white sm:text-xl">
          Prise en charge{" "}
          <span className="text-blue-600 dark:text-blue-400">OPCO</span> possible
          sous réserve d&apos;éligibilité{" "}
          <span className="font-normal text-slate-600 dark:text-slate-300">
            (dossier Qualiopi en préparation)
          </span>
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
                      ? "mailto:contact@lockin-web.online?subject=LockinIA%20ETI%20-%20devis"
                      : "mailto:contact@lockin-web.online?subject=LockinIA%20-%20demarrer"
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
            {addons
              .filter((addon) => addon.featured)
              .map((addon) => (
                <div
                  key={addon.name}
                  className="relative flex flex-col rounded-2xl border border-blue-500 bg-blue-50/60 p-5 text-center shadow-md dark:border-blue-500 dark:bg-blue-950/30 lg:scale-[1.02]"
                >
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Sur mesure
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
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
                  <a
                    href="mailto:contact@lockin-web.online?subject=LockinIA%20-%20module%20metier%20sur%20mesure"
                    className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Demander un module sur mesure
                  </a>
                </div>
              ))}

            <div className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Partenaires
              </p>
              <p className="mt-2 font-semibold text-slate-900 dark:text-white">
                Marque blanche
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Organismes de formation
              </p>

              <div className="mt-4 flex-1 space-y-3 text-left">
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-600">
                  {whiteLabelTiers.map((tier, i) => (
                    <div
                      key={tier.seats}
                      className={`flex items-center justify-between px-3 py-2 text-sm ${
                        i > 0 ? "border-t border-slate-200 dark:border-slate-600" : ""
                      }`}
                    >
                      <span className="text-slate-600 dark:text-slate-300">
                        {tier.seats}{" "}
                        <span className="text-xs text-slate-400">apprenants</span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {tier.price}
                      </span>
                    </div>
                  ))}
                </div>

                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex justify-between gap-2">
                    <span>Installation</span>
                    <span>
                      <span className="text-slate-400 line-through">500 €</span>{" "}
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        offert
                      </span>
                    </span>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span>Logo + nom OF</span>
                    <span>
                      <span className="text-slate-400 line-through">500 €</span>{" "}
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        offert
                      </span>
                    </span>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span>Personnalisation avancée</span>
                    <span className="font-semibold text-slate-900 dark:text-white">500 €</span>
                  </li>
                </ul>
              </div>
            </div>

            {addons
              .filter((addon) => !addon.featured)
              .map((addon) => (
                <div
                  key={addon.name}
                  className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 text-center dark:border-slate-700 dark:bg-slate-800"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
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
                  {addon.href && addon.cta ? (
                    <Link
                      href={addon.href}
                      className="mt-4 inline-flex items-center justify-center rounded-xl border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
                    >
                      {addon.cta}
                    </Link>
                  ) : null}
                </div>
              ))}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-slate-600 dark:text-slate-300">
            Besoin d&apos;un accompagnement personnalisé ou d&apos;automatiser vos
            processus ?{" "}
            <Link
              href="/interventions"
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Découvrir l&apos;accompagnement
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </section>
  );
}
