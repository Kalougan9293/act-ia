"use client";

import { motion } from "framer-motion";
import { Award, Check, Download } from "lucide-react";

const features = [
  {
    number: "01",
    title: "Des formations opérationnelles",
    subtitle: "Sans bloquer la journée",
    description:
      "Vos équipes avancent seules, à leur rythme, sur l'IA et le RGPD.",
    points: [
      "Un parcours selon le métier",
      "Sur mobile, tablette ou ordinateur",
      "Rien à installer",
    ],
    preview: "course" as const,
  },
  {
    number: "02",
    title: "Une attestation, un dossier",
    subtitle: "Article 4",
    description:
      "Chaque parcours validé produit une attestation nominative. Le dossier indique qui a suivi quoi, et quand.",
    points: [
      "PDF dès la validation",
      "Conservée pendant le contrat, puis 12 mois",
      "Visible par la direction et le DPO",
    ],
    preview: "diploma" as const,
  },
  {
    number: "03",
    title: "Un registre pour le DPO",
    subtitle: "Gouvernance",
    description:
      "Avancement et usages couverts au même endroit. Y compris les outils utilisés hors charte.",
    points: [
      "Suivi par équipe",
      "Personnes en retard visibles",
      "Export ZIP / JSON et attestations",
    ],
    preview: "admin" as const,
  },
];

const previewRows = [
  { name: "Camille Bernard", percent: 40 },
  { name: "Inès Bernard", percent: 86 },
  { name: "Marc Lefèvre", percent: 100 },
  { name: "Paul Garnier", percent: 0 },
  { name: "Sophie Lambert", percent: 100 },
  { name: "Yanis Cohen", percent: 18 },
];

function barColor(value: number) {
  if (value >= 100) return "bg-lime-400";
  if (value >= 80) return "bg-emerald-500";
  if (value > 20) return "bg-yellow-400";
  if (value > 0) return "bg-orange-500";
  return "bg-red-500";
}

function CoursePreview() {
  const steps = [
    { label: "AI Act", state: "done" },
    { label: "RGPD", state: "current" },
    { label: "Usages", state: "todo" },
    { label: "Quiz", state: "todo" },
    { label: "Preuve", state: "diploma" },
  ];

  return (
    <div className="flex h-full min-h-72 flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-950 sm:p-7">
      <div className="relative mx-auto flex w-full max-w-lg items-start justify-between px-1">
        <div className="absolute left-6 right-6 top-5 border-t-2 border-dashed border-violet-200 dark:border-violet-900" />
        {steps.map((step, index) => (
          <div key={step.label} className="relative flex w-14 flex-col items-center gap-2 sm:w-16">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${
                step.state === "done"
                  ? "bg-emerald-500 text-white"
                  : step.state === "current"
                    ? "bg-violet-600 text-white ring-4 ring-violet-200 dark:ring-violet-900"
                    : step.state === "diploma"
                      ? "border-2 border-dashed border-amber-300 bg-amber-50 text-amber-500 dark:border-amber-700 dark:bg-amber-950/40"
                      : "border-2 border-slate-200 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800"
              }`}
            >
              {step.state === "done" ? <Check className="h-4 w-4" /> : step.state === "diploma" ? <Award className="h-4 w-4" /> : index + 1}
            </span>
            <span className={`text-[11px] font-semibold ${step.state === "current" ? "text-violet-700 dark:text-violet-300" : step.state === "done" ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 grid w-full max-w-lg grid-cols-3 gap-3">
        <div className="rounded-2xl border border-violet-200 bg-white p-4 dark:border-violet-800 dark:bg-slate-800">
          <p className="text-xs font-bold text-violet-700 dark:text-violet-300">Cours</p>
          <div className="mt-3 space-y-2">
            <span className="block h-2 w-full rounded-full bg-violet-200 dark:bg-violet-900" />
            <span className="block h-2 w-4/5 rounded-full bg-slate-200 dark:bg-slate-700" />
            <span className="block h-2 w-3/5 rounded-full bg-slate-200 dark:bg-slate-700" />
            <span className="block h-2 w-2/3 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs font-bold text-slate-500">Jeu</p>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <span className="h-5 rounded-md bg-violet-500" />
            <span className="h-5 rounded-md bg-slate-200 dark:bg-slate-700" />
            <span className="h-5 rounded-md bg-violet-500" />
            <span className="h-5 rounded-md bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs font-bold text-slate-500">Éval.</p>
          <div className="mt-3 space-y-2">
            <span className="block h-4 rounded-md bg-emerald-400" />
            <span className="block h-4 rounded-md bg-slate-200 dark:bg-slate-700" />
            <span className="block h-4 rounded-md bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DiplomaPreview() {
  return (
    <div className="relative flex h-full min-h-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 shadow-sm dark:border-slate-700 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Soft glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(37,99,235,0.12),transparent_60%)]" />
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-500/10" />
      <div className="pointer-events-none absolute -bottom-10 -left-6 h-36 w-36 rounded-full bg-blue-300/25 blur-3xl dark:bg-blue-500/10" />

      <div className="relative flex flex-col items-center px-6 py-8 text-center">
        <div className="relative mb-5">
          <span className="absolute inset-0 scale-150 rounded-full bg-amber-300/20 blur-xl" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 shadow-lg shadow-amber-500/25 ring-4 ring-white dark:ring-slate-900">
            <Award className="h-8 w-8 text-white" strokeWidth={2} />
          </div>
        </div>

        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-400">
          Dossier de preuve Article 4
        </p>
        <h3 className="mt-2 max-w-[16rem] text-xl font-bold leading-snug text-slate-900 dark:text-white">
          Une attestation de suivi nominative
        </h3>
        <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Horodatée, versée au registre.
        </p>

        <div className="mt-6 flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
          <Check className="h-3.5 w-3.5" />
          Validée &amp; archivée
        </div>
      </div>
    </div>
  );
}

function AdminPreview() {
  return (
    <div className="flex h-full min-h-56 flex-col rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-950 sm:p-4">
      <p className="text-center text-sm font-bold text-slate-900 dark:text-white">Pilotage RH</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          ["2/6", "Formés"],
          ["33 %", "Suivi"],
          ["90 j", "Échéance"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-center dark:border-slate-700 dark:bg-slate-800">
            <div className="text-sm font-bold text-slate-900 dark:text-white">{value}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">{label}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-slate-700">
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">Collaborateurs</span>
          <span className="rounded-md bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white">Ajouter</span>
        </div>
        <ul>
          {previewRows.map((row) => (
            <li key={row.name} className="flex items-center gap-2 border-t border-slate-100 px-3 py-2 first:border-t-0 dark:border-slate-700">
              <span className="w-28 shrink-0 truncate text-left text-[11px] font-medium text-slate-800 dark:text-slate-100">{row.name}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <span
                  className={`block h-full rounded-full ${barColor(row.percent)}`}
                  style={{ width: row.percent === 0 ? "8px" : `${row.percent}%` }}
                />
              </span>
              <span className="w-9 shrink-0 text-right text-[11px] font-semibold tabular-nums text-slate-900 dark:text-white">{row.percent}%</span>
              <span className="flex w-3.5 justify-center text-blue-600 dark:text-blue-400">
                {row.percent >= 100 ? <Download className="h-3 w-3" /> : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="py-12 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white hyphens-none">
            Former, attester,{" "}
            <span className="text-blue-600 dark:text-blue-400">exporter</span>
          </h2>
          <p className="mx-auto max-w-2xl text-center text-lg text-slate-900 dark:text-slate-100">
            Trois fonctions. Un seul dossier pour la direction et le DPO.
          </p>
        </motion.div>

        <div className="space-y-16">
          {features.map((feature, i) => {
            const isEven = i % 2 === 1;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.05 }}
                className="grid md:grid-cols-2 gap-12 items-stretch"
              >
                <div className={`space-y-5 text-center md:text-left ${isEven ? "md:order-2" : ""}`}>
                  <span className="block text-5xl font-black text-blue-600 dark:text-blue-400 tabular-nums leading-none select-none">
                    {feature.number}
                  </span>
                  <div>
                    <p className="text-center inline-block text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 px-3 py-1 rounded-full mb-2 hyphens-none">
                      {feature.subtitle}
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white hyphens-none">{feature.title}</h3>
                  </div>
                  <p className="text-justify text-slate-900 dark:text-slate-100 leading-relaxed hyphens-auto">{feature.description}</p>
                  <ul className="space-y-2.5 w-fit mx-auto md:mx-0 text-left">
                    {feature.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm text-slate-900 dark:text-slate-100 hyphens-none">
                        <Check className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`h-full ${isEven ? "md:order-1" : ""}`}>
                  {feature.preview === "course" ? <CoursePreview /> : feature.preview === "diploma" ? <DiplomaPreview /> : <AdminPreview />}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
