"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "L'article 4 de l'AI Act s'applique-t-il à mon entreprise ?",
    answer:
      "Oui, si vos équipes utilisent une IA pour le compte de l'entreprise. Depuis le 2 février 2025, vous devez prendre des mesures pour développer leur maîtrise. Aucun niveau individuel n'est exigé. Les contrôles commencent le 2 août 2026.",
  },
  {
    question: "Que se passe-t-il si aucune mesure n'est documentée ?",
    answer:
      "L'article 4 demande des mesures, pas un score à atteindre. Ce site n'affiche aucun montant d'amende : cela se vérifie avec un avocat. Le registre et les attestations montrent ce que vous avez mis en place.",
  },
  {
    question: "Combien de temps dure la formation pour mes salariés ?",
    answer:
      "Parcours complet : 1h00. Peut être suivi en plusieurs sessions.",
  },
  {
    question: "L'attestation de suivi vaut-elle diplôme ou certification officielle ?",
    answer:
      "Non. C'est une attestation au nom du salarié, avec la date et un identifiant. Elle reste dans le dossier de l'entreprise pendant le contrat, puis 12 mois après. Ce n'est pas un diplôme.",
  },
  {
    question: "Comment vous assurez-vous que les salariés ne trichent pas lors des évaluations ?",
    answer:
      "Le copier-coller est limité, les quiz sont chronométrés et l'inactivité est détectée. Cela rend le suivi plus fiable. Cela ne suffit pas, à soi seul, à lui donner une valeur juridique.",
  },
  {
    question: "Faut-il former tous les salariés, même ceux qui n'utilisent pas l'IA ?",
    answer:
      "Non. Il vise les personnes qui utilisent l'IA pour l'entreprise. Formez-les en priorité, et notez-le dans le registre.",
  },
  {
    question: "Puis-je gérer la formation en interne sans ConformAI ?",
    answer:
      "Oui. Il faut alors le contenu, les attestations et le registre. ConformAI réunit les trois.",
  },
  {
    question: "Mes données et celles de mes salariés sont-elles sécurisées ?",
    answer:
      "Oui. Hébergement en France, données chiffrées, aucun transfert hors de l'Union européenne.",
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
          className={`text-sm sm:text-base font-semibold leading-snug transition-colors duration-200 ${
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
