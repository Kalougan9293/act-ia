"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, RefreshCw } from "lucide-react";
import {
  listContactLeads,
  markContactLeadContacted,
  type ContactLead,
} from "@/lib/firebase/contact-leads";

const NEED_LABELS: Record<string, string> = {
  formation: "Formation",
  automatisation: "Automatisation",
  processus: "Processus",
  autre: "Autre",
};

function formatWhen(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ContactLeadsPanel() {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLeads(await listContactLeads());
    } catch {
      setError("Impossible de charger les demandes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markDone(id: string) {
    setBusyId(id);
    try {
      await markContactLeadContacted(id);
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: "contacted" } : l)),
      );
    } catch {
      setError("Mise à jour impossible.");
    } finally {
      setBusyId(null);
    }
  }

  const newCount = leads.filter((l) => l.status === "new").length;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Demandes interventions
          </h2>
          {newCount > 0 ? (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
              {newCount} nouvelle{newCount > 1 ? "s" : ""}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {error ? (
        <p className="px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {loading && leads.length === 0 ? (
        <p className="px-4 py-6 text-sm text-slate-500">Chargement…</p>
      ) : leads.length === 0 ? (
        <p className="px-4 py-6 text-sm text-slate-500">
          Aucune demande pour le moment.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {leads.map((lead) => (
            <li
              key={lead.id}
              className={`px-4 py-3 text-left ${
                lead.status === "new"
                  ? "bg-blue-50/40 dark:bg-blue-950/20"
                  : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {lead.name}
                    {lead.company ? (
                      <span className="font-normal text-slate-500">
                        {" "}
                        · {lead.company}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {lead.email}
                    </a>
                    {" · "}
                    {NEED_LABELS[lead.need] ?? lead.need}
                    {" · "}
                    {formatWhen(lead.createdAt)}
                  </p>
                </div>
                {lead.status === "new" ? (
                  <button
                    type="button"
                    disabled={busyId === lead.id}
                    onClick={() => void markDone(lead.id)}
                    className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-white disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Marquer traité
                  </button>
                ) : (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Traité
                  </span>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {lead.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
