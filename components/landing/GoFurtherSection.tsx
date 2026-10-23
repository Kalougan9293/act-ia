"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CONTACT_EMAIL = "contact@lockin-web.online";

export default function GoFurtherSection() {
  const [showEmail, setShowEmail] = useState(false);

  return (
    <section className="border-y border-slate-200 bg-white py-12 dark:border-slate-700/60 dark:bg-slate-900">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Besoin d&apos;aller{" "}
            <span className="text-blue-600 dark:text-blue-400">plus loin</span> ?
          </h2>
          <p className="mx-auto max-w-xl text-center text-base leading-relaxed text-slate-700 dark:text-slate-200">
            Ateliers, automatisation, process : faites de l&apos;IA un vrai outil de
            travail pour vos équipes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/interventions"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
            >
              Voir l&apos;accompagnement
              <ArrowRight className="h-4 w-4" />
            </Link>
            {showEmail ? (
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-blue-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
              >
                {CONTACT_EMAIL}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setShowEmail(true)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Contact
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
