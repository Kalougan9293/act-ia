"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "L'Article 4 de l'AI Act est-il vraiment obligatoire pour mon entreprise ?",
    answer:
      "Oui. L'Article 4 du Règlement (UE) 2024/1689 (EU AI Act) impose à tous les déployeurs et fournisseurs de systèmes d'IA de s'assurer que leur personnel dispose d'un niveau suffisant de littératie en matière d'IA. Cette obligation est entrée en vigueur le 2 août 2025 et s'applique à toutes les entreprises établies ou opérant dans l'Union Européenne, quelle que soit leur taille.",
  },
  {
    question: "Que risque mon entreprise en cas de contrôle sans attestations de formation ?",
    answer:
      "En l'absence de preuves documentées de formation, votre entreprise s'expose à des sanctions administratives pouvant atteindre 7% du chiffre d'affaires mondial annuel pour les violations les plus graves. Même pour les infractions mineures, des amendes de plusieurs dizaines de milliers d'euros sont prévues. La conservation des attestations nominatives horodatées constitue votre meilleure défense lors d'un audit.",
  },
  {
    question: "Combien de temps dure la formation pour mes salariés ?",
    answer:
      "Le parcours complet (AI Act + RGPD) est conçu pour être finalisé en 2 heures maximum. Il est découpé en micro-modules de 10 à 15 minutes chacun, que vos collaborateurs peuvent répartir sur plusieurs sessions. Il n'y a aucune contrainte de connexion simultanée ni de durée minimale par session.",
  },
  {
    question: "Les attestations générées ont-elles une vraie valeur légale ?",
    answer:
      "Oui. Chaque attestation est nominative, horodatée et générée avec un identifiant unique vérifiable. Elles sont conformes aux exigences de preuve documentaire posées par l'Article 4 de l'AI Act. L'archivage est assuré pendant 5 ans sur nos serveurs (hébergés en France, conformément au RGPD).",
  },
  {
    question: "Comment vous assurez-vous que les salariés ne trichent pas lors des évaluations ?",
    answer:
      "Notre plateforme intègre des contrôles anti-triche natifs : désactivation du copier-coller, quiz chronométrés, cas pratiques sous forme de scénarios visuels et détection d'inactivité. Nous garantissons aux RH et aux auditeurs la validité juridique absolue des attestations délivrées.",
  },
  {
    question: "Doit-on former tous les salariés, même ceux qui n'utilisent pas l'IA ?",
    answer:
      "L'Article 4 vise les entreprises qui déploient des systèmes d'IA — ce qui inclut l'utilisation d'outils comme ChatGPT, Copilot, ou tout assistant IA dans le cadre professionnel. Nous recommandons de former l'ensemble du personnel pour une couverture juridique complète.",
  },
  {
    question: "Puis-je gérer la formation en interne sans ConformAI ?",
    answer:
      "Techniquement oui, mais cela implique de concevoir un contenu pédagogique à jour sur l'AI Act et le RGPD, mettre en place un système de quiz et de validation, générer des attestations légalement valides, et maintenir un registre de suivi RH. En pratique, cela représente plusieurs semaines de travail. ConformAI vous délègue l'intégralité de cette charge pour quelques centaines d'euros par an.",
  },
  {
    question: "Mes données et celles de mes salariés sont-elles sécurisées ?",
    answer:
      "Absolument. ConformAI est hébergé sur des serveurs localisés en France (OVHcloud). Nous ne transférons aucune donnée hors de l'UE. Les données des apprenants sont chiffrées au repos et en transit. Vous disposez d'un registre de traitement complet et pouvez exercer vos droits depuis votre tableau de bord administrateur.",
  },
];

interface FAQItemProps {
  faq: { question: string; answer: string };
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function FAQItem({ faq, isOpen, onToggle, index }: FAQItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={`border rounded-xl overflow-hidden transition-colors duration-200 ${
        isOpen
          ? "border-blue-200 dark:border-blue-700/60 bg-blue-50/40 dark:bg-blue-900/10"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span
          className={`text-sm sm:text-base font-semibold leading-snug text-justify hyphens-auto transition-colors duration-200 ${
            isOpen
              ? "text-blue-700 dark:text-blue-400"
              : "text-slate-900 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white"
          }`}
        >
          {faq.question}
        </span>
        <span
          className={`shrink-0 p-1.5 rounded-lg transition-colors duration-200 mt-0.5 ${
            isOpen
              ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
              : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-600"
          }`}
        >
          {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="px-6 pb-5 text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-12 bg-white dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Tout ce que vous voulez{" "}
            <span className="text-blue-600 dark:text-blue-400">savoir</span>
          </h2>
        </motion.div>

        <div className="space-y-2.5">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
