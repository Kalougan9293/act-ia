import type { Activity } from "@/lib/formation/activity";

export function parseDurationMs(duration: string): number {
  const min = duration.match(/(\d+)\s*min/);
  // "1 min 30" ou "45 s" / "45s"
  const secExplicit = duration.match(/(\d+)\s*s\b/);
  const secAfterMin =
    !secExplicit && min
      ? duration.match(/min(?:ute)?s?\s+(\d+)\b/)
      : null;
  const sec = secExplicit ?? secAfterMin;
  return (min ? Number(min[1]) * 60_000 : 0) + (sec ? Number(sec[1]) * 1000 : 0);
}

export function isPassiveKind(kind: Activity["kind"]): boolean {
  return kind === "text" || kind === "fiche" || kind === "video";
}

export function isGameKind(kind: Activity["kind"]): boolean {
  return (
    kind === "sort" ||
    kind === "spot" ||
    kind === "redact" ||
    kind === "traffic" ||
    kind === "predict" ||
    kind === "scenario" ||
    kind === "timeline" ||
    kind === "stamp" ||
    kind === "tetris"
  );
}

/** Délai depuis l'ouverture pour les contenus à lire / script vidéo placeholder. */
export function mountDwellMs(kind: Activity["kind"], duration: string): number {
  if (!isPassiveKind(kind)) return 0;
  const total = parseDurationMs(duration) || 60_000;
  // Vidéo placeholder : court délai visible (le script se déroule), pas toute la durée.
  if (kind === "video") {
    return Math.min(6_000, Math.max(3_000, Math.round(total * 0.12)));
  }
  // Alertes / textes très courts : juste un souffle, pas un examen.
  if (total <= 45_000) return Math.min(3_000, Math.max(1_500, Math.round(total * 0.4)));
  if (kind === "text") {
    return Math.min(12_000, Math.max(4_000, Math.round(total * 0.25)));
  }
  return Math.min(10_000, Math.max(4_000, Math.round(total * 0.3)));
}

/** Après validation d'un jeu / quiz : forcer à voir la correction. */
export function feedbackHoldMs(kind: Activity["kind"]): number {
  if (kind === "stamp" || kind === "traffic" || kind === "predict") return 0;
  if (isGameKind(kind)) return 2_800;
  if (kind === "quiz") return 1_600;
  if (kind === "checklist") return 1_000;
  return 0;
}

/** Confirmation « J'ai compris » : textes/fiches un peu longs seulement (pas les vidéos). */
export function needsAck(kind: Activity["kind"], _chapterId: string, duration = ""): boolean {
  if (kind === "video") return false;
  if (kind !== "text" && kind !== "fiche") return false;
  const total = parseDurationMs(duration);
  if (total > 0 && total <= 45_000) return false;
  return true;
}
