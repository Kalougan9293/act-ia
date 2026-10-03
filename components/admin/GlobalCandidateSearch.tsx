"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchCandidates } from "@/lib/admin/mock-data";
import type { PlatformUser } from "@/lib/admin/types";

export default function GlobalCandidateSearch({ users }: { users: PlatformUser[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchCandidates(query, users).slice(0, 8), [query, users]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function goTo(id: string) {
    setOpen(false);
    setQuery("");
    router.push(`/admin/candidats/${id}`);
  }

  return (
    <div ref={rootRef} className="relative mx-auto w-full max-w-xl">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) {
              e.preventDefault();
              goTo(results[0].id);
            }
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Recherche globale : nom, e-mail ou n° attestation"
          className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-sm text-center placeholder:text-slate-400 shadow-sm"
        />
      </div>

      {open && query.trim() && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg text-left">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500 text-center">Aucun candidat trouvé</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => goTo(user.id)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  >
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {user.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{user.email}</div>
                    {user.certificateId && (
                      <div className="mt-0.5 font-mono text-[11px] text-blue-600 dark:text-blue-400">
                        {user.certificateId}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
