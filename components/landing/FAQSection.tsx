"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { faqs } from "@/lib/landing/faq";

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
        className="relative w-full px-12 py-5 text-center group"
        aria-expanded={isOpen}
      >
        <span
          className={`block text-center text-sm sm:text-base font-semibold leading-snug transition-colors duration-200 ${
            isOpen
              ? "text-blue-700 dark:text-blue-400"
              : "text-slate-900 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white"
          }`}
        >
          {faq.question}
        </span>
        <span
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors duration-200 ${
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
            <p className="px-6 pb-5 text-center text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
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
      <div className="mx-auto w-fit max-w-full px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <h2 className="text-balance text-3xl font-bold text-slate-900 sm:w-max sm:whitespace-nowrap sm:text-4xl dark:text-white">
            Tout ce que vous voulez{" "}
            <span className="text-blue-600 dark:text-blue-400">savoir</span>
          </h2>
        </motion.div>

        <div className="w-0 min-w-full space-y-2.5">
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
