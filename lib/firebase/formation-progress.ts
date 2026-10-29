import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import {
  computeFormationPercent,
  createCertificateId,
  CURRICULUM_VERSION,
  emptyProgress,
  isFormationComplete,
  type ConnectionSession,
  type FormationProgress,
  type ModuleResult,
  type SatisfactionFeedback,
} from "@/lib/formation/proof";
function requireDb() {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");
  return db;
}

export type IssuedCertificate = {
  id: string;
  issuedAt: string;
  quizScore: number | null;
  careerPathId: string | null;
  /** Temps de connexion mesuré au moment de l'émission (secondes). */
  timeSpentSec: number | null;
  /** Nombre de modules / étapes horodatées au moment de l'émission. */
  modulesCompleted: number | null;
};

function parseModuleResults(raw: unknown): ModuleResult[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const data = row as Record<string, unknown>;
      const id = data.id ? String(data.id) : "";
      if (!id) return null;
      const kind = String(data.kind ?? "chapter");
      const allowed = new Set([
        "intro",
        "positioning",
        "chapter",
        "company",
        "quiz",
        "career",
      ]);
      return {
        id,
        label: String(data.label ?? id),
        kind: (allowed.has(kind) ? kind : "chapter") as ModuleResult["kind"],
        completedAt: String(data.completedAt ?? ""),
        score:
          data.score === null || data.score === undefined
            ? null
            : Number(data.score),
      } satisfies ModuleResult;
    })
    .filter((row): row is ModuleResult => Boolean(row?.completedAt));
}

function parseSessions(raw: unknown): ConnectionSession[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const data = row as Record<string, unknown>;
      const id = data.id ? String(data.id) : "";
      if (!id) return null;
      return {
        id,
        startedAt: String(data.startedAt ?? ""),
        endedAt: String(data.endedAt ?? ""),
        durationSec: Math.max(0, Number(data.durationSec ?? 0) || 0),
      } satisfies ConnectionSession;
    })
    .filter((row): row is ConnectionSession => Boolean(row?.startedAt));
}

function parseSatisfaction(raw: unknown): SatisfactionFeedback | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const rating = Number(data.rating ?? 0);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return null;
  return {
    rating,
    comment: String(data.comment ?? "").trim(),
    complaint: String(data.complaint ?? "").trim(),
    submittedAt: String(data.submittedAt ?? ""),
  };
}

function parseProgress(data: Record<string, unknown> | undefined): FormationProgress {
  if (!data) return emptyProgress();
  const chapters = Array.isArray(data.completedChapters)
    ? data.completedChapters.map(String)
    : [];
  return {
    introDone: Boolean(data.introDone),
    positioningDone: Boolean(data.positioningDone),
    positioningScore:
      data.positioningScore === null || data.positioningScore === undefined
        ? null
        : Number(data.positioningScore),
    completedChapters: chapters,
    companyModuleDone: Boolean(data.companyModuleDone),
    quizScore:
      data.quizScore === null || data.quizScore === undefined
        ? null
        : Number(data.quizScore),
    quizPassed: Boolean(data.quizPassed),
    quizAttempts: Number(data.quizAttempts ?? 0) || 0,
    careerPathId: data.careerPathId ? String(data.careerPathId) : null,
    moduleResults: parseModuleResults(data.moduleResults),
    sessions: parseSessions(data.sessions),
    totalTimeSpentSec: Math.max(0, Number(data.totalTimeSpentSec ?? 0) || 0),
    satisfaction: parseSatisfaction(data.satisfaction),
  };
}

function toIso(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

export async function loadFormationProgress(uid: string): Promise<FormationProgress> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "users", uid, "progress", "formation"));
  if (!snap.exists()) return emptyProgress();
  return parseProgress(snap.data() as Record<string, unknown>);
}

/** Charge les progressions de plusieurs apprenants (export RH / preuves). */
export async function loadFormationProgressMany(
  uids: string[],
): Promise<Map<string, FormationProgress>> {
  const unique = [...new Set(uids.filter(Boolean))];
  const entries = await Promise.all(
    unique.map(async (uid) => {
      try {
        return [uid, await loadFormationProgress(uid)] as const;
      } catch {
        return [uid, emptyProgress()] as const;
      }
    }),
  );
  return new Map(entries);
}

export async function loadIssuedCertificate(uid: string): Promise<IssuedCertificate | null> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data() as Record<string, unknown>;
  if (!data.certificateId) return null;
  const certSnap = await getDoc(
    doc(db, "users", uid, "certificates", String(data.certificateId)),
  );
  const cert = certSnap.exists()
    ? (certSnap.data() as Record<string, unknown>)
    : null;
  return {
    id: String(data.certificateId),
    issuedAt: data.certifiedAt ? toIso(data.certifiedAt) : new Date().toISOString(),
    quizScore:
      data.quizScore === null || data.quizScore === undefined
        ? null
        : Number(data.quizScore),
    careerPathId: null,
    timeSpentSec:
      cert?.timeSpentSec === null || cert?.timeSpentSec === undefined
        ? data.attestationTimeSpentSec === null ||
          data.attestationTimeSpentSec === undefined
          ? null
          : Number(data.attestationTimeSpentSec)
        : Number(cert.timeSpentSec),
    modulesCompleted:
      cert?.modulesCompleted === null || cert?.modulesCompleted === undefined
        ? data.attestationModulesCompleted === null ||
          data.attestationModulesCompleted === undefined
          ? null
          : Number(data.attestationModulesCompleted)
        : Number(cert.modulesCompleted),
  };
}

export async function saveFormationProgress(
  uid: string,
  progress: FormationProgress,
): Promise<{ percent: number; certificate: IssuedCertificate | null }> {
  const db = requireDb();
  const percent = computeFormationPercent(progress);
  const progressRef = doc(db, "users", uid, "progress", "formation");
  const userRef = doc(db, "users", uid);

  await setDoc(
    progressRef,
    {
      ...progress,
      percent,
      curriculumVersion: CURRICULUM_VERSION,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  const userSnap = await getDoc(userRef);
  const userData = (userSnap.data() ?? {}) as Record<string, unknown>;
  const existingCert =
    typeof userData.certificateId === "string" ? userData.certificateId : null;

  const patch: Record<string, unknown> = {
    progressPercent: percent,
    quizScore: progress.quizScore,
    positioningScore: progress.positioningScore,
    totalTimeSpentSec: progress.totalTimeSpentSec,
    satisfactionRating: progress.satisfaction?.rating ?? null,
    satisfactionComment: progress.satisfaction?.comment ?? null,
    satisfactionComplaint: progress.satisfaction?.complaint || null,
    satisfactionAt: progress.satisfaction?.submittedAt ?? null,
  };

  let certificate: IssuedCertificate | null = null;

  if (isFormationComplete(progress) && !existingCert) {
    const structureId =
      typeof userData.structureId === "string" ? userData.structureId : null;
    const certId = createCertificateId(`${uid}-${Date.now()}`);
    const issuedAt = new Date().toISOString();

    const timeSpentSec = progress.totalTimeSpentSec;
    const modulesCompleted = progress.moduleResults.length;

    await setDoc(doc(db, "users", uid, "certificates", certId), {
      id: certId,
      userId: uid,
      structureId,
      email: userData.email ?? null,
      fullName: userData.name ?? null,
      quizScore: progress.quizScore,
      careerPathId: progress.careerPathId,
      completedChapters: progress.completedChapters,
      moduleResults: progress.moduleResults,
      sessions: progress.sessions,
      timeSpentSec,
      modulesCompleted,
      curriculumVersion: CURRICULUM_VERSION,
      kind: "attestation_suivi",
      issuedAt,
      createdAt: serverTimestamp(),
    });

    patch.certificateId = certId;
    patch.certifiedAt = issuedAt;
    patch.attestationTimeSpentSec = timeSpentSec;
    patch.attestationModulesCompleted = modulesCompleted;
    certificate = {
      id: certId,
      issuedAt,
      quizScore: progress.quizScore,
      careerPathId: progress.careerPathId,
      timeSpentSec,
      modulesCompleted,
    };
  } else if (existingCert) {
    const existing = await loadIssuedCertificate(uid);
    certificate = {
      id: existingCert,
      issuedAt: userData.certifiedAt
        ? toIso(userData.certifiedAt)
        : new Date().toISOString(),
      quizScore: progress.quizScore,
      careerPathId: progress.careerPathId,
      timeSpentSec: existing?.timeSpentSec ?? progress.totalTimeSpentSec,
      modulesCompleted: existing?.modulesCompleted ?? progress.moduleResults.length,
    };
  }

  await updateDoc(userRef, patch);
  return { percent, certificate };
}

/** Migre une progression locale (localStorage) vers Firestore si le cloud est vide. */
export async function migrateLocalProgressIfNeeded(
  uid: string,
  local: FormationProgress | null,
): Promise<FormationProgress> {
  const db = requireDb();
  const progressRef = doc(db, "users", uid, "progress", "formation");
  const snap = await getDoc(progressRef);
  const raw = snap.exists() ? (snap.data() as Record<string, unknown>) : undefined;

  // Remise à zéro demandée : le cache local ne doit pas réécrire l'ancien parcours.
  if (raw?.clearedAt) {
    const empty = emptyProgress();
    await setDoc(progressRef, {
      ...empty,
      percent: 0,
      curriculumVersion: CURRICULUM_VERSION,
      updatedAt: serverTimestamp(),
    });
    return empty;
  }

  const remote = parseProgress(raw);
  const remoteEmpty =
    !remote.introDone &&
    remote.completedChapters.length === 0 &&
    !remote.companyModuleDone &&
    !remote.quizPassed &&
    !remote.careerPathId;

  if (remoteEmpty && local && (local.introDone || local.completedChapters.length > 0)) {
    await saveFormationProgress(uid, local);
    return local;
  }
  return remote;
}
