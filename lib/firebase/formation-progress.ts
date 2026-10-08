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
  type FormationProgress,
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
};

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

export async function loadIssuedCertificate(uid: string): Promise<IssuedCertificate | null> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data() as Record<string, unknown>;
  if (!data.certificateId) return null;
  return {
    id: String(data.certificateId),
    issuedAt: data.certifiedAt ? toIso(data.certifiedAt) : new Date().toISOString(),
    quizScore:
      data.quizScore === null || data.quizScore === undefined
        ? null
        : Number(data.quizScore),
    careerPathId: null,
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
  };

  let certificate: IssuedCertificate | null = null;

  if (isFormationComplete(progress) && !existingCert) {
    const structureId =
      typeof userData.structureId === "string" ? userData.structureId : null;
    const certId = createCertificateId(`${uid}-${Date.now()}`);
    const issuedAt = new Date().toISOString();

    await setDoc(doc(db, "users", uid, "certificates", certId), {
      id: certId,
      userId: uid,
      structureId,
      email: userData.email ?? null,
      fullName: userData.name ?? null,
      quizScore: progress.quizScore,
      careerPathId: progress.careerPathId,
      completedChapters: progress.completedChapters,
      curriculumVersion: CURRICULUM_VERSION,
      kind: "attestation_suivi",
      issuedAt,
      createdAt: serverTimestamp(),
    });

    patch.certificateId = certId;
    patch.certifiedAt = issuedAt;
    certificate = {
      id: certId,
      issuedAt,
      quizScore: progress.quizScore,
      careerPathId: progress.careerPathId,
    };
  } else if (existingCert) {
    certificate = {
      id: existingCert,
      issuedAt: userData.certifiedAt ? toIso(userData.certifiedAt) : new Date().toISOString(),
      quizScore: progress.quizScore,
      careerPathId: progress.careerPathId,
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
