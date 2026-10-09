"use client";

import { useEffect, useRef, useState } from "react";
import { Film } from "lucide-react";

/** Vidéo (fichier ou placeholder) + script qui se déroule progressivement */
export default function VideoScript({
  format,
  duration,
  script,
  src,
}: {
  format: string;
  duration?: string;
  script: string;
  src?: string;
}) {
  const [revealed, setRevealed] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const words = script.split(/(\s+)/);

  useEffect(() => {
    setRevealed(0);
    const total = words.length;
    let i = 0;
    const id = window.setInterval(() => {
      i += 3;
      setRevealed(Math.min(i, total));
      if (i >= total) window.clearInterval(id);
    }, 45);
    return () => window.clearInterval(id);
  }, [script]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [revealed]);

  return (
    <div className="space-y-4">
      {src ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-lg dark:border-slate-700">
          <video
            className="aspect-video w-full"
            controls
            playsInline
            preload="metadata"
            src={src}
          >
            Votre navigateur ne lit pas la vidéo.
          </video>
          <p className="bg-slate-900 px-4 py-2 text-center text-xs text-slate-300">
            Exemple · {format}
            {duration ? ` · ${duration}` : ""}
          </p>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white shadow-lg dark:border-blue-800">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,#3b82f6,transparent_45%),radial-gradient(circle_at_80%_70%,#1d4ed8,transparent_40%)]" />
          <div className="relative flex flex-col items-center justify-center gap-3 px-6 py-16 text-center sm:py-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase backdrop-blur">
              <Film className="h-3.5 w-3.5" />
              VIDEO
            </span>
            <p className="max-w-md text-sm text-blue-100/90">{format}</p>
            {duration ? <p className="text-xs text-slate-300">{duration}</p> : null}
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="max-h-[min(70vh,36rem)] touch-pan-y overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          À écouter / lire
        </p>
        <p className="whitespace-pre-wrap text-center text-base leading-relaxed text-slate-800 sm:text-lg sm:leading-8 dark:text-slate-100">
          {words.slice(0, revealed).join("")}
          {revealed < words.length && (
            <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse align-middle bg-blue-500" />
          )}
        </p>
      </div>
    </div>
  );
}
