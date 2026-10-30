"use client";

import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { BookOpen, X } from "lucide-react";
import { LEXICON, type LexiconEntry } from "@/lib/formation/lexicon";

function TipPanel({
  entry,
  panelId,
  onClose,
  className,
}: {
  entry: LexiconEntry;
  panelId: string;
  onClose: () => void;
  className?: string;
}) {
  return (
    <span
      id={panelId}
      role="tooltip"
      className={
        className ??
        "absolute bottom-full left-1/2 z-30 mb-2 w-60 -translate-x-1/2 rounded-xl border border-blue-200 bg-white px-3.5 py-3 text-left shadow-lg dark:border-blue-700 dark:bg-slate-900 sm:w-72"
      }
    >
      <span className="flex items-start justify-between gap-2">
        <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{entry.term}</span>
        <button
          type="button"
          aria-label="Fermer"
          onClick={onClose}
          className="rounded p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </span>
      <span className="mt-1.5 block text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[0.8125rem]">
        {entry.definition}
      </span>
      {entry.example && (
        <span className="mt-2 block text-xs italic leading-relaxed text-slate-500 dark:text-slate-400">
          Ex. : {entry.example}
        </span>
      )}
    </span>
  );
}

function useTipOpen() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return { open, setOpen, rootRef };
}

function TipChip({ entry }: { entry: LexiconEntry }) {
  const { open, setOpen, rootRef } = useTipOpen();
  const panelId = useId();

  return (
    <span ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-blue-950/40 dark:hover:text-blue-100"
      >
        {entry.term}
      </button>
      {open && <TipPanel entry={entry} panelId={panelId} onClose={() => setOpen(false)} />}
    </span>
  );
}

/** Mot dans une phrase : survol (desktop) ou tap (mobile) pour la définition. */
export function LexiconInlineTerm({ id }: { id: string }) {
  const entry = LEXICON.find((item) => item.id === id);
  const { open, setOpen, rootRef } = useTipOpen();
  const panelId = useId();

  if (!entry) return null;

  return (
    <span
      ref={rootRef}
      className="group/tip relative inline"
      onMouseEnter={() => {
        if (window.matchMedia("(hover: hover)").matches) setOpen(true);
      }}
      onMouseLeave={() => {
        if (window.matchMedia("(hover: hover)").matches) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="font-semibold text-blue-700 underline decoration-blue-400 decoration-dotted underline-offset-2 hover:text-blue-800 dark:text-blue-300 dark:decoration-blue-500 dark:hover:text-blue-200"
      >
        {entry.term}
      </button>
      {open && (
        <TipPanel
          entry={entry}
          panelId={panelId}
          onClose={() => setOpen(false)}
          className="absolute bottom-full left-1/2 z-30 mb-1 w-56 -translate-x-1/2 rounded-xl border border-blue-200 bg-white px-3.5 py-3 text-left shadow-lg dark:border-blue-700 dark:bg-slate-900 sm:w-64"
        />
      )}
    </span>
  );
}

const INLINE_TERMS: Record<string, string> = {
  DPO: "dpo",
  Omnibus: "omnibus",
};

/** Remplace **gras**, et les termes connus (DPO, Omnibus…) par un mot cliquable / survolable. */
export function withLexiconTips(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|DPO|Omnibus)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`bold-${index}`} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const id = INLINE_TERMS[part];
    if (id) return <LexiconInlineTerm key={`${id}-${index}`} id={id} />;
    return <Fragment key={`text-${index}`}>{part}</Fragment>;
  });
}

/** Bandeau lexique — mots cliquables, définition au clic. */
export default function LexiconBar({
  ids,
  label = "Lexique",
}: {
  ids?: string[];
  label?: string;
}) {
  const entries = ids
    ? LEXICON.filter((e) => ids.includes(e.id))
    : LEXICON;

  if (entries.length === 0) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        <BookOpen className="h-3.5 w-3.5" aria-hidden />
        {label}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {entries.map((entry) => (
          <TipChip key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

const FAB_CORE = [
  "ai-act",
  "art4",
  "art5",
  "art50",
  "haut-risque",
  "ia-generative",
  "llm",
  "prompt",
  "contexte",
  "hallucination",
  "deepfake",
  "deployeur",
  "donnee-perso",
  "shadow-ai",
  "referent",
  "dpo",
  "omnibus",
  "supervision-humaine",
];

/** Bouton « Les mots de l'IA » — flottant, ou inline sous le rail desktop. */
export function FloatingLexiconFab({
  variant = "fixed",
}: {
  variant?: "fixed" | "inline";
} = {}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const entries = LEXICON.filter((e) => FAB_CORE.includes(e.id)).sort((a, b) =>
    a.term.localeCompare(b.term, "fr", { sensitivity: "base" }),
  );

  const inline = variant === "inline";

  return (
    <div
      ref={panelRef}
      className={
        inline
          ? "relative z-50 flex w-full flex-col items-center"
          : "formation-fab-fixed fixed right-4 z-50 bottom-[max(1.25rem,env(safe-area-inset-bottom))] lg:bottom-[max(1.5rem,env(safe-area-inset-bottom))] lg:right-6"
      }
    >
      {open && (
        <div
          className={`mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-600 dark:bg-slate-900 ${
            inline
              ? "absolute bottom-full w-full max-w-[calc(100vw-2rem)]"
              : "w-[min(100vw-2rem,20rem)]"
          }`}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-center text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
              Les mots de l&apos;IA
            </p>
            <button
              type="button"
              aria-label="Fermer le lexique"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ul className="max-h-64 space-y-2.5 overflow-y-auto text-left">
            {entries.map((entry) => (
              <li key={entry.id}>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{entry.term}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {entry.definition}
                </p>
                {entry.example && (
                  <p className="mt-1 text-[11px] italic text-slate-500 dark:text-slate-400">
                    Ex. : {entry.example}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-label="Ouvrir le lexique"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 font-semibold text-white shadow-lg transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 ${
          inline ? "w-full px-3 py-2.5 text-xs" : "px-4 py-3 text-sm"
        }`}
      >
        <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Les mots de l&apos;IA
      </button>
    </div>
  );
}
