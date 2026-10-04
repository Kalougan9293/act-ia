"use client";

import { useCallback, useEffect, useState } from "react";
import { allChapterIds } from "@/lib/formation/curriculum";
import {
  computeFormationPercent,
  emptyProgress,
  type FormationProgress,
} from "@/lib/formation/proof";
import {
  loadIssuedCertificate,
  migrateLocalProgressIfNeeded,
  saveFormationProgress,
  type IssuedCertificate,
} from "@/lib/firebase/formation-progress";

export type { FormationProgress };

function storageKey(uid: string) {
  return `conformai:formation:${uid}`;
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

export function useFormationProgress(uid: string | null) {
  const [progress, setProgress] = useState<FormationProgress>(emptyProgress());
  const [certificate, setCertificate] = useState<IssuedCertificate | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

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
    void persist({ ...progress, introDone: true });
  }, [persist, progress]);

  const markPositioning = useCallback(
    (score: number) => {
      void persist({ ...progress, positioningDone: true, positioningScore: score });
    },
    [persist, progress],
  );

  const markChapterDone = useCallback(
    (chapterId: string) => {
      if (progress.completedChapters.includes(chapterId)) return;
      void persist({
        ...progress,
        completedChapters: [...progress.completedChapters, chapterId],
      });
    },
    [persist, progress],
  );

  const markCompanyDone = useCallback(() => {
    void persist({ ...progress, companyModuleDone: true });
  }, [persist, progress]);

  const markQuiz = useCallback(
    (score: number, passed: boolean, quizAttempts: number) => {
      void persist({ ...progress, quizScore: score, quizPassed: passed, quizAttempts });
    },
    [persist, progress],
  );

  const markCareer = useCallback(
    (careerPathId: string) => {
      void persist({ ...progress, careerPathId });
    },
    [persist, progress],
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
  };
}
