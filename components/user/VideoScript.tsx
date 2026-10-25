"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Film, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { LexiconInlineTerm } from "@/components/user/LexiconTip";

function parseDurationSeconds(duration?: string): number {
  if (!duration) return 120;
  const lower = duration.toLowerCase();
  const min = Number(lower.match(/(\d+)\s*min/)?.[1] ?? 0);
  const sec = Number(lower.match(/(\d+)\s*s/)?.[1] ?? 0);
  const total = min * 60 + sec;
  return total > 0 ? total : 120;
}

function renderWithLexicon(text: string): ReactNode {
  if (!text) return null;
  const parts = text.split(/(DPO)/g);
  return parts.map((part, index) =>
    part === "DPO" ? (
      <LexiconInlineTerm key={`dpo-${index}`} id="dpo" />
    ) : (
      <Fragment key={`t-${index}`}>{part}</Fragment>
    )
  );
}

/** Hauteur de repli mobile quand la vidéo n'est pas encore mesurée. */
const SCRIPT_FALLBACK_MAX = "min(42dvh, 22rem)";

/** Vidéo verticale (9:16) à gauche + script synchronisé à droite (cadre fixe, texte qui défile). */
export default function VideoScript({
  format,
  duration,
  script,
  src,
  onComplete,
}: {
  format: string;
  duration?: string;
  script: string;
  src?: string;
  onComplete?: () => void;
}) {
  const [charIndex, setCharIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);

  const mediaColRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const charIndexRef = useRef(0);
  const completedRef = useRef(false);
  const lastTimeRef = useRef(0);
  const progressRef = useRef(0);
  const lastUiProgressRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const totalChars = script.length;

  const markComplete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setEnded(true);
    onCompleteRef.current?.();
  };

  const paintProgress = (ratio: number) => {
    const clamped = Math.min(1, Math.max(0, ratio));
    progressRef.current = clamped;
    // MAJ visuelle directe (60 fps) — sans re-render React à chaque frame
    if (progressFillRef.current) {
      progressFillRef.current.style.transform = `scaleX(${clamped})`;
    }
    return clamped;
  };

  const applyProgress = (ratio: number) => {
    const clamped = paintProgress(ratio);
    const next = Math.min(totalChars, Math.floor(clamped * totalChars));
    // État React ~ tous les 2,5 % pour aria-valuenow (la barre elle-même est peinte via ref)
    if (Math.abs(clamped - lastUiProgressRef.current) >= 0.025 || clamped >= 1 || clamped <= 0) {
      lastUiProgressRef.current = clamped;
      setProgress(clamped);
    }
    if (next === charIndexRef.current) return;
    charIndexRef.current = next;
    setCharIndex(next);
  };

  useEffect(() => {
    let raf = 0;
    let placeholderStarted: number | null = null;
    completedRef.current = false;
    lastTimeRef.current = 0;
    charIndexRef.current = 0;
    progressRef.current = 0;
    lastUiProgressRef.current = 0;
    setCharIndex(0);
    setProgress(0);
    setEnded(false);
    setPlaying(false);
    paintProgress(0);

    const syncFromVideo = (video: HTMLVideoElement) => {
      const videoDuration = video.duration;
      if (!videoDuration || !Number.isFinite(videoDuration) || videoDuration <= 0) return;
      // Bloque le seek avant (clavier / gestes) : on n'autorise pas d'avancer
      if (video.currentTime > lastTimeRef.current + 0.35) {
        video.currentTime = lastTimeRef.current;
      } else {
        lastTimeRef.current = video.currentTime;
      }
      applyProgress(video.currentTime / videoDuration);
      const isPlaying = !video.paused && !video.ended;
      setPlaying((prev) => (prev === isPlaying ? prev : isPlaying));
    };

    const tick = (now: number) => {
      const video = videoRef.current;
      if (src && video) {
        syncFromVideo(video);
      } else if (!src) {
        if (placeholderStarted == null) placeholderStarted = now;
        const seconds = parseDurationSeconds(duration);
        const ratio = (now - placeholderStarted) / (seconds * 1000);
        applyProgress(ratio);
        if (ratio >= 1) markComplete();
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [script, src, duration, totalChars]);

  // Cadre script = hauteur vidéo en desktop ; plafond fixe en mobile (ne s'allonge jamais).
  useEffect(() => {
    const col = mediaColRef.current;
    if (!col) return;

    const sync = () => {
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      const mediaH = Math.round(col.getBoundingClientRect().height);
      if (desktop && mediaH > 0) {
        setPanelHeight(mediaH);
        return;
      }
      // Mobile / tablette : cadre borné, le texte défile à l'intérieur.
      const cap = Math.round(Math.min(window.innerHeight * 0.42, 22 * 16));
      setPanelHeight(cap);
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(col);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [src]);

  // Suit le curseur : dès qu'il arrive en bas, le texte défile vers le haut.
  useEffect(() => {
    const panel = containerRef.current;
    const cursor = cursorRef.current;
    if (!panel || !cursor) return;

    const panelRect = panel.getBoundingClientRect();
    const cursorRect = cursor.getBoundingClientRect();
    const bottomMargin = 48;
    const topMargin = 28;

    if (cursorRect.bottom > panelRect.bottom - bottomMargin) {
      panel.scrollTop += cursorRect.bottom - panelRect.bottom + bottomMargin;
    } else if (cursorRect.top < panelRect.top + topMargin) {
      panel.scrollTop -= panelRect.top + topMargin - cursorRect.top;
    }
  }, [charIndex, panelHeight]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
  }, [volume, muted]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.ended) {
      video.currentTime = 0;
      lastTimeRef.current = 0;
      setEnded(false);
    }
    if (video.paused) {
      try {
        await video.play();
      } catch {
        /* autoplay / user gesture */
      }
    } else {
      video.pause();
    }
  };

  const restart = async () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    lastTimeRef.current = 0;
    setEnded(false);
    charIndexRef.current = 0;
    setCharIndex(0);
    lastUiProgressRef.current = 0;
    paintProgress(0);
    setProgress(0);
    if (containerRef.current) containerRef.current.scrollTop = 0;
    try {
      await video.play();
    } catch {
      /* ignore */
    }
  };

  const revealed = script.slice(0, charIndex);
  const done = charIndex >= totalChars;

  const scriptPanel = (
    <div
      ref={containerRef}
      className="h-full touch-pan-y overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm sm:px-5 sm:py-4 dark:border-slate-700 dark:bg-slate-900"
      style={{
        height: panelHeight ?? undefined,
        maxHeight: panelHeight ?? SCRIPT_FALLBACK_MAX,
      }}
    >
      <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400 lg:text-left">
        À écouter / lire
      </p>
      <p className="whitespace-pre-wrap text-center text-[0.95rem] leading-relaxed text-slate-800 sm:text-base sm:leading-7 lg:text-left dark:text-slate-100">
        {renderWithLexicon(revealed)}
        {done ? (
          <span ref={cursorRef} className="inline-block h-0 w-0" />
        ) : (
          <span
            ref={cursorRef}
            className="ml-0.5 inline-block h-4 w-1.5 animate-pulse align-middle bg-blue-500"
          />
        )}
      </p>
    </div>
  );

  return (
    <div className="grid items-start gap-3 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-5">
      {src ? (
        <div
          ref={mediaColRef}
          className="mx-auto flex w-full max-w-[min(100%,16.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-lg dark:border-slate-700"
        >
          <video
            ref={videoRef}
            className="max-h-[calc(100dvh-14rem)] w-full object-contain"
            style={{ aspectRatio: "9 / 16" }}
            playsInline
            preload="metadata"
            src={src}
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            onContextMenu={(event) => event.preventDefault()}
            onEnded={() => {
              setPlaying(false);
              setEnded(true);
              applyProgress(1);
              markComplete();
            }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            Votre navigateur ne lit pas la vidéo.
          </video>

          {/* Barre de progression = rythme réel de la vidéo (non cliquable) */}
          <div
            className="h-1.5 bg-white/15"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-label="Progression de la vidéo"
          >
            <div
              ref={progressFillRef}
              className="h-full origin-left bg-blue-500 will-change-transform"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-2">
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white transition hover:bg-white/10"
              aria-label={playing ? "Pause" : ended ? "Relancer" : "Lecture"}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={restart}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/10"
              aria-label="Remettre au début"
              title="Remettre au début"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setMuted((value) => !value)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/10"
              aria-label={muted || volume === 0 ? "Activer le son" : "Couper le son"}
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(event) => {
                const next = Number(event.target.value);
                setVolume(next);
                setMuted(next === 0);
              }}
              className="h-1 w-16 cursor-pointer accent-blue-500 sm:w-20"
              aria-label="Volume"
            />
          </div>
        </div>
      ) : (
        <div
          ref={mediaColRef}
          className="relative mx-auto flex w-full max-w-[16.5rem] flex-col overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white shadow-lg dark:border-blue-800"
        >
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,#3b82f6,transparent_45%),radial-gradient(circle_at_80%_70%,#1d4ed8,transparent_40%)]" />
          <div className="relative flex aspect-[9/16] max-h-[calc(100dvh-11rem)] flex-col items-center justify-center gap-2 px-5 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase backdrop-blur">
              <Film className="h-3.5 w-3.5" />
              VIDEO
            </span>
            <p className="text-sm text-blue-100/90">{format}</p>
            {duration ? <p className="text-xs text-slate-300">{duration}</p> : null}
          </div>
        </div>
      )}

      <div className="min-h-0 w-full overflow-hidden lg:h-auto" style={{ height: panelHeight ?? undefined, maxHeight: panelHeight ?? SCRIPT_FALLBACK_MAX }}>
        {scriptPanel}
      </div>
    </div>
  );
}
