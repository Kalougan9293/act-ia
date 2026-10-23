"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { allChapterIds, findChapter } from "@/lib/formation/curriculum";
import {
  computeFormationPercent,
  emptyProgress,
  upsertConnectionSession,
  upsertModuleResult,
  type ConnectionSession,
  type FormationProgress,
  type SatisfactionFeedback,
} from "@/lib/formation/proof";
import {
  loadIssuedCertificate,
  migrateLocalProgressIfNeeded,
  saveFormationProgress,
  type IssuedCertificate,
} from "@/lib/firebase/formation-progress";

export type { FormationProgress };

function storageKey(uid: string) {
  return `startia:formation:${uid}`;
}

function readLocal(uid: string): FormationProgress | null {
  try {
    const raw = localStorage.getItem(storageKey(uid));
    if (!raw) return null;
    return { ...emptyProgress(), ...(JSON.parse(raw) as FormationProgress) };
  } catch {
    return null;
  }
}

function writeLocal(uid: string, progress: FormationProgress) {
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(progress));
  } catch {
    /* ignore */
  }
}

function nowIso() {
  return new Date().toISOString();
}

export function useFormationProgress(uid: string | null) {
  const [progress, setProgress] = useState<FormationProgress>(emptyProgress());
  const [certificate, setCertificate] = useState<IssuedCertificate | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    if (!uid) {
      setProgress(emptyProgress());
      setCertificate(null);
      setReady(true);
      return;
    }

    let cancelled = false;
    setReady(false);

    (async () => {
      try {
        const local = readLocal(uid);
        const next = await migrateLocalProgressIfNeeded(uid, local);
        const cert = await loadIssuedCertificate(uid);
        if (cancelled) return;
        setProgress(next);
        writeLocal(uid, next);
        if (cert) {
          setCertificate({ ...cert, careerPathId: next.careerPathId });
        }
        // Recalcule le % RH (100 dès l'examen) pour les progressions déjà en base.
        if (next.quizPassed && computeFormationPercent(next) === 100) {
          void saveFormationProgress(uid, next).then((result) => {
            if (!cancelled && result.certificate) {
              setCertificate(result.certificate);
            }
          });
        }
      } catch {
        const local = readLocal(uid);
        if (!cancelled) setProgress(local ?? emptyProgress());
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid]);

  const persist = useCallback(
    async (next: FormationProgress) => {
      setProgress(next);
      progressRef.current = next;
      if (!uid) return;
      writeLocal(uid, next);
      setSaving(true);
      try {
        const result = await saveFormationProgress(uid, next);
        if (result.certificate) setCertificate(result.certificate);
      } catch {
        /* local garde la progression ; sync cloud au prochain save */
      } finally {
        setSaving(false);
      }
    },
    [uid],
  );

  const markIntroDone = useCallback(() => {
    const base = { ...progressRef.current, introDone: true };
    void persist(
      upsertModuleResult(base, {
        id: "intro",
        label: "Introduction",
        kind: "intro",
        completedAt: nowIso(),
        score: null,
      }),
    );
  }, [persist]);

  const markPositioning = useCallback(
    (score: number) => {
      const base = {
        ...progressRef.current,
        positioningDone: true,
        positioningScore: score,
      };
      void persist(
        upsertModuleResult(base, {
          id: "positioning",
          label: "Test de positionnement",
          kind: "positioning",
          completedAt: nowIso(),
          score,
        }),
      );
    },
    [persist],
  );

  const markChapterDone = useCallback(
    (chapterId: string) => {
      if (progressRef.current.completedChapters.includes(chapterId)) return;
      const found = findChapter(chapterId);
      const base = {
        ...progressRef.current,
        completedChapters: [...progressRef.current.completedChapters, chapterId],
      };
      void persist(
        upsertModuleResult(base, {
          id: chapterId,
          label: found?.chapter.title ?? chapterId,
          kind: "chapter",
          completedAt: nowIso(),
          score: null,
        }),
      );
    },
    [persist],
  );

  const markCompanyDone = useCallback(() => {
    const base = { ...progressRef.current, companyModuleDone: true };
    void persist(
      upsertModuleResult(base, {
        id: "company",
        label: "Module entreprise",
        kind: "company",
        completedAt: nowIso(),
        score: null,
      }),
    );
  }, [persist]);

  const markQuiz = useCallback(
    (score: number, passed: boolean, quizAttempts: number) => {
      const base = {
        ...progressRef.current,
        quizScore: score,
        quizPassed: passed,
        quizAttempts,
      };
      void persist(
        upsertModuleResult(base, {
          id: "quiz-final",
          label: "Évaluation finale (QCM)",
          kind: "quiz",
          completedAt: nowIso(),
          score,
        }),
      );
    },
    [persist],
  );

  const markCareer = useCallback(
    (careerPathId: string) => {
      const base = { ...progressRef.current, careerPathId };
      void persist(
        upsertModuleResult(base, {
          id: `career:${careerPathId}`,
          label: "Fiche métier",
          kind: "career",
          completedAt: nowIso(),
          score: null,
        }),
      );
    },
    [persist],
  );

  const recordSession = useCallback(
    (session: ConnectionSession) => {
      const next = upsertConnectionSession(progressRef.current, session);
      void persist(next);
    },
    [persist],
  );

  const markSatisfaction = useCallback(
    (input: Omit<SatisfactionFeedback, "submittedAt">) => {
      const satisfaction: SatisfactionFeedback = {
        rating: input.rating,
        comment: input.comment.trim(),
        complaint: input.complaint.trim(),
        submittedAt: nowIso(),
      };
      void persist({ ...progressRef.current, satisfaction });
    },
    [persist],
  );

  const totalChapters = allChapterIds().length;
  const doneChapters = progress.completedChapters.length;
  const percent = computeFormationPercent(progress);

  return {
    ready,
    saving,
    progress,
    percent,
    totalChapters,
    doneChapters,
    certificate,
    markIntroDone,
    markPositioning,
    markChapterDone,
    markCompanyDone,
    markQuiz,
    markCareer,
    recordSession,
    markSatisfaction,
  };
}
