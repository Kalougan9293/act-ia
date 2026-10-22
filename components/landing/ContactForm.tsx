"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

const NEEDS = [
  { value: "formation", label: "Formation / ateliers" },
  { value: "automatisation", label: "Automatisation" },
  { value: "processus", label: "Mise en place de processus" },
  { value: "autre", label: "Autre / à définir ensemble" },
] as const;

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [need, setNeed] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          need,
          message,
          website: honeypot,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Envoi impossible. Réessayez.");
        return;
      }
      setDone(true);
      setName("");
      setEmail("");
      setCompany("");
      setNeed("");
      setMessage("");
    } catch {
      setError(
        "Réseau indisponible. Réessayez ou écrivez à contact@lockin-web.online.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-6 py-10 text-center dark:border-emerald-800 dark:bg-emerald-950/30">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          Demande envoyée
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Merci. On revient vers vous rapidement pour caler un premier échange.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-6 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-4 text-left">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Nom *
          </span>
          <input
            required
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
            placeholder="Camille Dupont"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            E-mail *
          </span>
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
            placeholder="camille@entreprise.fr"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Entreprise
          </span>
          <input
            name="company"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={fieldClass}
            placeholder="Nom de la société"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Besoin principal *
          </span>
          <select
            required
            name="need"
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            className={fieldClass}
          >
            <option value="" disabled>
              Choisir…
            </option>
            {NEEDS.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Votre contexte *
        </span>
        <textarea
          required
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${fieldClass} resize-y min-h-[6.5rem]`}
          placeholder="Taille de l'équipe, outils déjà utilisés, ce que vous voulez gagner…"
        />
      </label>

      {/* Honeypot anti-bot */}
      <div className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          Site web
          <input
            tabIndex={-1}
            autoComplete="off"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {submitting ? "Envoi…" : "Envoyer ma demande"}
      </button>
    </form>
  );
}
