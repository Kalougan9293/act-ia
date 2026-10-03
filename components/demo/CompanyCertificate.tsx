"use client";

import { useState } from "react";
import { Award, Copy, ShieldCheck, X } from "lucide-react";

function Seal() {
  return (
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-emerald-600 bg-emerald-50 text-emerald-700 shadow-[0_0_0_6px_rgba(16,185,129,0.15)]">
      <Award className="h-9 w-9" strokeWidth={1.75} />
    </div>
  );
}

export default function CompanyCertificate({
  company,
  done,
  total,
  onClose,
}: {
  company: string;
  done: number;
  total: number;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const unlocked = total > 0 && done === total;
  const issued = new Date();
  const date = issued.toLocaleDateString("fr-FR");
  const time = issued.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const badgeText = `${company} — attestations de suivi à jour pour l'article 4 et le RGPD. Registre ConformAI REG-CONF-2026-89A4.`;

  async function copyBadge() {
    try {
      await navigator.clipboard.writeText(badgeText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 px-4 py-8" onClick={onClose}>
      <div className="relative w-full max-w-2xl" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 rounded-full bg-white p-2 text-slate-500 shadow hover:text-slate-900"
          aria-label="Fermer l'attestation"
        >
          <X className="h-5 w-5" />
        </button>

        <article className="overflow-hidden rounded-sm bg-[#fbf8f1] text-slate-900 shadow-2xl">
          <div className="bg-emerald-800 px-8 py-3 text-center text-xs font-semibold tracking-[0.28em] text-emerald-50">
            CONFORMAI · REGISTRE 2026
          </div>
          <div className="border-[10px] border-emerald-800/90 px-6 py-8 sm:px-10">
            <div className="border border-emerald-700/30 px-6 py-8 text-center">
              {!unlocked && (
                <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-amber-700">
                  Aperçu — disponible lorsque chaque collaborateur a une attestation de suivi
                </div>
              )}
              <Seal />
              <h2 className="mt-5 text-xl font-bold tracking-tight sm:text-2xl">
                Dossier de preuve employeur — article 4
              </h2>
              <p className="mt-2 text-sm text-slate-600">Attestations de suivi · AI Act (article 4) &amp; RGPD</p>

              <p className="mt-8 text-xs uppercase tracking-[0.2em] text-slate-500">Raison sociale</p>
              <p className="mt-1 text-3xl font-semibold">{company}</p>

              <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-1.5 text-sm font-semibold text-white">
                <ShieldCheck className="h-4 w-4" />
                {done}/{total} collaborateurs formés · {total === 0 ? 0 : Math.round((done / total) * 100)} %
              </div>

              <dl className="mx-auto mt-8 max-w-md space-y-3 text-left text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Identifiant registre</dt>
                  <dd className="font-mono text-sm">REG-CONF-2026-89A4</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Empreinte</dt>
                  <dd className="font-mono text-xs">c4e9a1b27890f3d6</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Périmètre validé</dt>
                  <dd>Usage des IA génératives, protection des données et cadre EU AI Act &amp; RGPD.</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">Émis le</dt>
                  <dd>{date} à {time} (Europe/Paris)</dd>
                </div>
              </dl>

              <p className="mx-auto mt-8 max-w-md text-xs leading-relaxed text-slate-500">
                Document émis par ConformAI et conservé dans le registre de suivi. Il consigne les attestations de suivi des collaborateurs. Il ne certifie pas l&apos;entreprise et ne constitue pas un conseil juridique.
              </p>
            </div>
          </div>
        </article>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Badge pour le site web</p>
          <div className={`mx-auto mt-3 inline-flex items-center gap-3 rounded-2xl border px-4 py-3 ${unlocked ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50 opacity-60"}`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="text-left">
              <span className="block text-sm font-bold text-emerald-900">{company}</span>
              <span className="block text-xs text-emerald-800">Suivi à jour · AI Act &amp; RGPD · 2026</span>
            </span>
          </div>
          <button
            type="button"
            onClick={copyBadge}
            disabled={!unlocked}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Badge copié" : "Copier le badge de conformité pour notre site web"}
          </button>
        </div>
      </div>
    </div>
  );
}
