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

/** Seuls les collaborateurs consomment un accès. Le RH n'en consomme jamais. */
export function roleConsumesSeat(role: string | null | undefined): boolean {
  return role === "employee";
}

/** Compte les collaborateurs (hors RH) d'une structure. */
export async function countEmployeeSeats(structureId: string): Promise<number> {
  const db = requireDb();
  const snap = await getDocs(
    query(collection(db, "users"), where("structureId", "==", structureId)),
  );
  return snap.docs.filter((d) =>
    roleConsumesSeat(String(d.data().role ?? "")),
  ).length;
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

/** Libère un siège après suppression d'un collaborateur (pas pour un RH). */
export async function releaseSeatIfEmployee(
  structure: Structure | null | undefined,
  removedRole?: UserRole | string | null,
): Promise<void> {
  if (!structure?.inviteToken) return;
  if (!roleConsumesSeat(removedRole)) return;
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
  const seatsMax = Math.max(1, Number(data.seatsMax ?? 1));
  const seatsUsed = Math.max(0, Number(data.seatsUsed ?? 0));
  return { seatsMax, seatsUsed, full: seatsUsed >= seatsMax };
}
