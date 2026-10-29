/**
 * Archive les preuves FOAD avant retrait d'un accès, pour respecter
 * la rétention « année civile + 3 ans » annoncée au client.
 */
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

function requireDb() {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");
  return db;
}

export type ArchivedProofSnapshot = {
  userId: string;
  structureId: string;
  email: string;
  name: string;
  role: string;
  certificateId: string | null;
  certifiedAt: string | null;
  quizScore: number | null;
  progressPercent: number | null;
  /** true = siège non récupéré (démarrage ≥ 1 %) */
  seatConsumed: boolean;
  certificates: Record<string, unknown>[];
  progress: Record<string, unknown>[];
  archivedAt: ReturnType<typeof serverTimestamp>;
  reason: string;
};

/** Copie progress + certificates sous structures/{id}/archivedProofs/{userId}. */
export async function archiveUserProofs(params: {
  userId: string;
  structureId: string;
  email?: string;
  name?: string;
  role?: string;
  certificateId?: string | null;
  certifiedAt?: string | null;
  quizScore?: number | null;
  progressPercent?: number | null;
  reason: string;
  seatConsumed?: boolean;
}): Promise<boolean> {
  if (!params.structureId) return false;
  const db = requireDb();

  const [progressSnap, certsSnap] = await Promise.all([
    getDocs(collection(db, "users", params.userId, "progress")),
    getDocs(collection(db, "users", params.userId, "certificates")),
  ]);

  const seatConsumed =
    params.seatConsumed ?? (params.progressPercent ?? 0) > 0;
  const hasProof =
    certsSnap.size > 0 ||
    Boolean(params.certificateId) ||
    progressSnap.size > 0 ||
    seatConsumed;
  if (!hasProof) return false;

  const payload: ArchivedProofSnapshot = {
    userId: params.userId,
    structureId: params.structureId,
    email: (params.email ?? "").trim().toLowerCase(),
    name: params.name ?? "",
    role: params.role ?? "",
    certificateId: params.certificateId ?? null,
    certifiedAt: params.certifiedAt ?? null,
    quizScore: params.quizScore ?? null,
    progressPercent: params.progressPercent ?? null,
    seatConsumed,
    certificates: certsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    progress: progressSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    archivedAt: serverTimestamp(),
    reason: params.reason,
  };

  await setDoc(
    doc(db, "structures", params.structureId, "archivedProofs", params.userId),
    payload,
    { merge: true },
  );
  return true;
}
