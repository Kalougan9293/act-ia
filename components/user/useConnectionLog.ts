"use client";

import { useEffect, useRef } from "react";
import type { ConnectionSession } from "@/lib/formation/proof";

const TICK_MS = 15_000;
const FLUSH_EVERY_TICKS = 4; // ~60 s

function newSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Relevé de connexion FOAD : mesure le temps de présence active sur le parcours
 * (onglet visible) et persiste les sessions pour l'export Qualiopi.
 */
export function useConnectionLog(
  enabled: boolean,
  onFlush: (session: ConnectionSession) => void,
) {
  const onFlushRef = useRef(onFlush);
  onFlushRef.current = onFlush;

  useEffect(() => {
    if (!enabled) return;

    const sessionId = newSessionId();
    const startedAt = new Date().toISOString();
    let durationSec = 0;
    let ticksSinceFlush = 0;
    let alive = true;

    function flush() {
      if (!alive || durationSec <= 0) return;
      onFlushRef.current({
        id: sessionId,
        startedAt,
        endedAt: new Date().toISOString(),
        durationSec,
      });
      ticksSinceFlush = 0;
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      durationSec += TICK_MS / 1000;
      ticksSinceFlush += 1;
      if (ticksSinceFlush >= FLUSH_EVERY_TICKS) flush();
    }, TICK_MS);

    function onVisibility() {
      if (document.visibilityState === "hidden") flush();
    }

    function onPageHide() {
      flush();
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      alive = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      flush();
    };
  }, [enabled]);
}
