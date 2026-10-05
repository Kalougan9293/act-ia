import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { Structure, UserRole } from "@/lib/admin/types";

function requireDb() {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");
  return db;
}

/** Collaborateur, ou RH inscrit à la formation via le lien. */
export function userConsumesSeat(data: {
  role?: string | null;
  formationEnrolled?: boolean | null;
}): boolean {
  if (data.role === "employee") return true;
  return data.role === "rh" && Boolean(data.formationEnrolled);
}

/** @deprecated préférer userConsumesSeat */
export function roleConsumesSeat(role: string | null | undefined): boolean {
  return role === "employee";
}

/** Compte les accès formation consommés dans une structure. */
export async function countEmployeeSeats(structureId: string): Promise<number> {
  const db = requireDb();
  const snap = await getDocs(
    query(collection(db, "users"), where("structureId", "==", structureId)),
  );
  return snap.docs.filter((d) => {
    const data = d.data();
    return userConsumesSeat({
      role: String(data.role ?? ""),
      formationEnrolled: Boolean(data.formationEnrolled),
    });
  }).length;
}

/**
 * Aligne seatsMax (plafond admin) sur le lien d'invitation.
 * Ne réécrit pas seatsUsed ici — évite qu'un RH baisse le compteur.
 * Le super admin peut forcer un recalcul via `recountUsed`.
 */
export async function syncStructureInviteSeats(
  structure: Structure,
  options?: { recountUsed?: boolean },
): Promise<{ seatsMax: number; seatsUsed: number | null }> {
  const db = requireDb();
  const seatsMax = Math.max(1, Number(structure.billing.seats) || 1);
  if (!structure.inviteToken) return { seatsMax, seatsUsed: null };

  const payload: Record<string, unknown> = {
    structureId: structure.id,
    name: structure.name,
    seatsMax,
  };

  let seatsUsed: number | null = null;
  if (options?.recountUsed) {
    seatsUsed = await countEmployeeSeats(structure.id);
    payload.seatsUsed = seatsUsed;
  }

  await writeBatch(db)
    .set(doc(db, "structureInvites", structure.inviteToken), payload, { merge: true })
    .commit();

  return { seatsMax, seatsUsed };
}

/** Libère un siège après départ d'un utilisateur formation. */
export async function releaseSeatIfEmployee(
  structure: Structure | null | undefined,
  removedRole?: UserRole | string | null,
  formationEnrolled?: boolean | null,
): Promise<void> {
  if (!structure?.inviteToken) return;
  if (!userConsumesSeat({ role: removedRole, formationEnrolled })) return;
  const db = requireDb();
  const ref = doc(db, "structureInvites", structure.inviteToken);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const used = Number(snap.data().seatsUsed ?? 0);
  if (used <= 0) return;
  await updateDoc(ref, { seatsUsed: increment(-1) });
}

export async function getInviteSeatInfo(token: string): Promise<{
  seatsMax: number;
  seatsUsed: number;
  full: boolean;
} | null> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "structureInvites", token));
  if (!snap.exists()) return null;
  const data = snap.data();
  const structureId = String(data.structureId ?? "");
  let seatsMax = Math.max(1, Number(data.seatsMax ?? 1));
  if (structureId) {
    const structureSnap = await getDoc(doc(db, "structures", structureId));
    const billing = structureSnap.data()?.billing as { seats?: number } | undefined;
    if (billing?.seats != null) {
      seatsMax = Math.max(1, Number(billing.seats) || 1);
    }
  }
  const seatsUsed = Math.max(0, Number(data.seatsUsed ?? 0));
  return { seatsMax, seatsUsed, full: seatsUsed >= seatsMax };
}

/** Capacité offre (billing) + sièges utilisés — source de vérité pour le plafond. */
export async function getStructureSeatStatus(structureId: string): Promise<{
  seatsMax: number;
  seatsUsed: number;
  full: boolean;
  inviteToken: string | null;
}> {
  const db = requireDb();
  const structureSnap = await getDoc(doc(db, "structures", structureId));
  if (!structureSnap.exists()) {
    throw new Error("Structure introuvable");
  }
  const data = structureSnap.data();
  const billing = data.billing as { seats?: number } | undefined;
  const seatsMax = Math.max(1, Number(billing?.seats ?? 1) || 1);
  const inviteToken = data.inviteToken ? String(data.inviteToken) : null;

  let seatsUsed = 0;
  if (inviteToken) {
    const seatSnap = await getDoc(doc(db, "structureInvites", inviteToken));
    seatsUsed = Math.max(0, Number(seatSnap.data()?.seatsUsed ?? 0));
  } else {
    seatsUsed = await countEmployeeSeats(structureId);
  }

  return { seatsMax, seatsUsed, full: seatsUsed >= seatsMax, inviteToken };
}
