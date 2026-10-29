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

/** Un siège déjà démarré (≥ 1 %) n'est pas récupérable à la suppression. */
export function seatIsRecoverable(progressPercent?: number | null): boolean {
  return (progressPercent ?? 0) <= 0;
}

/** @deprecated préférer userConsumesSeat */
export function roleConsumesSeat(role: string | null | undefined): boolean {
  return role === "employee";
}

/** Compte les accès formation encore présents dans une structure. */
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
 * Le recalcul (`recountUsed`) ne peut jamais baisser seatsUsed :
 * les sièges consommés après démarrage (≥1 %) restent comptés.
 */
export async function syncStructureInviteSeats(
  structure: Structure,
  options?: { recountUsed?: boolean },
): Promise<{ seatsMax: number; seatsUsed: number | null }> {
  const db = requireDb();
  const seatsMax = Math.max(1, Number(structure.billing.seats) || 1);
  if (!structure.inviteToken) return { seatsMax, seatsUsed: null };

  const ref = doc(db, "structureInvites", structure.inviteToken);
  const existing = await getDoc(ref);
  const currentUsed = existing.exists()
    ? Math.max(0, Number(existing.data()?.seatsUsed ?? 0))
    : 0;

  const payload: Record<string, unknown> = {
    structureId: structure.id,
    name: structure.name,
    seatsMax,
  };

  let seatsUsed: number | null = null;
  if (options?.recountUsed) {
    const active = await countEmployeeSeats(structure.id);
    // Ne jamais libérer des sièges déjà consommés (départs après démarrage)
    seatsUsed = Math.max(active, currentUsed);
    payload.seatsUsed = seatsUsed;
  }

  await writeBatch(db).set(ref, payload, { merge: true }).commit();

  return { seatsMax, seatsUsed };
}

/**
 * Libère un siège après départ — uniquement si la progression est à 0 %.
 * Dès 1 % d'avancement, le siège reste consommé (facturation / capacité).
 */
export async function releaseSeatIfEmployee(
  structure: Structure | null | undefined,
  removedRole?: UserRole | string | null,
  formationEnrolled?: boolean | null,
  progressPercent?: number | null,
): Promise<{ released: boolean }> {
  if (!structure?.inviteToken) return { released: false };
  if (!userConsumesSeat({ role: removedRole, formationEnrolled })) {
    return { released: false };
  }
  if (!seatIsRecoverable(progressPercent)) {
    return { released: false };
  }
  const db = requireDb();
  const ref = doc(db, "structureInvites", structure.inviteToken);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { released: false };
  const used = Number(snap.data().seatsUsed ?? 0);
  if (used <= 0) return { released: false };
  await updateDoc(ref, { seatsUsed: increment(-1) });
  return { released: true };
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
  seatsActive: number;
  seatsRetained: number;
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

  const seatsActive = await countEmployeeSeats(structureId);
  let seatsUsed = seatsActive;
  if (inviteToken) {
    const seatSnap = await getDoc(doc(db, "structureInvites", inviteToken));
    seatsUsed = Math.max(
      seatsActive,
      Math.max(0, Number(seatSnap.data()?.seatsUsed ?? 0)),
    );
  }

  return {
    seatsMax,
    seatsUsed,
    seatsActive,
    seatsRetained: Math.max(0, seatsUsed - seatsActive),
    full: seatsUsed >= seatsMax,
    inviteToken,
  };
}

/**
 * Map structureId → sièges consommés (pour Superadmin).
 * Lit chaque invite par token (get) — pas de list collection (rules).
 */
export async function listSeatsUsedByStructure(
  structures: Array<{ id: string; inviteToken: string | null }>,
): Promise<Record<string, number>> {
  const entries = await Promise.all(
    structures.map(async (s) => {
      if (!s.inviteToken) return [s.id, 0] as const;
      const info = await getInviteSeatInfo(s.inviteToken);
      return [s.id, info?.seatsUsed ?? 0] as const;
    }),
  );
  return Object.fromEntries(entries);
}
