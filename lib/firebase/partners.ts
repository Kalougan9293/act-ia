import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import {
  getUserById,
  mapStructure,
  mapUser,
  saveStructure,
  saveUser,
} from "@/lib/firebase/admin-data";
import { createRegistryId } from "@/lib/export/attestations";
import {
  emptyCompanyModule,
  PLAN_PRICES,
  PLAN_SEATS,
  type Partner,
  type PlanId,
  type PlatformUser,
  type Structure,
} from "@/lib/admin/types";
import { provisionTenantUser } from "@/lib/firebase/provision-user";
import { syncStructureInviteSeats } from "@/lib/firebase/seats";

function requireDb() {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");
  return db;
}

/**
 * Isolation OF : un partenaire ne peut cibler que son propre partnerId.
 * Super admin : passe. Autre rôle / autre OF : refus.
 */
async function assertPartnerScope(partnerId: string): Promise<void> {
  const auth = getFirebaseAuth();
  const uid = auth?.currentUser?.uid;
  if (!uid) throw new Error("Non authentifié");
  const me = await getUserById(uid);
  if (!me) throw new Error("Profil introuvable");
  if (me.role === "super_admin") return;
  if (me.role !== "partner" || me.partnerId !== partnerId) {
    throw new Error("Accès réservé à votre espace partenaire");
  }
}

function toIsoDate(value: unknown): string {
  if (typeof value === "string") return value.slice(0, 10);
  if (value && typeof value === "object" && "toDate" in value) {
    const d = (value as { toDate: () => Date }).toDate();
    return d.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

export function mapPartner(id: string, data: Record<string, unknown>): Partner {
  return {
    id,
    name: String(data.name ?? ""),
    email: String(data.email ?? "").trim().toLowerCase(),
    siret: String(data.siret ?? ""),
    status: (data.status as Partner["status"]) ?? "active",
    createdAt: toIsoDate(data.createdAt),
    seatsMax: Math.max(1, Number(data.seatsMax ?? 1) || 1),
    licenseExpiresAt: data.licenseExpiresAt ? toIsoDate(data.licenseExpiresAt) : null,
    notes: data.notes ? String(data.notes) : null,
  };
}

export async function listPartners(): Promise<Partner[]> {
  const db = requireDb();
  const snap = await getDocs(collection(db, "partners"));
  return snap.docs.map((d) => mapPartner(d.id, d.data() as Record<string, unknown>));
}

export async function getPartner(partnerId: string): Promise<Partner | null> {
  await assertPartnerScope(partnerId);
  const db = requireDb();
  const snap = await getDoc(doc(db, "partners", partnerId));
  if (!snap.exists()) return null;
  return mapPartner(snap.id, snap.data() as Record<string, unknown>);
}

export async function savePartner(partner: Partner): Promise<void> {
  const db = requireDb();
  await setDoc(
    doc(db, "partners", partner.id),
    {
      name: partner.name,
      email: partner.email.trim().toLowerCase(),
      siret: partner.siret,
      status: partner.status,
      createdAt: partner.createdAt,
      seatsMax: partner.seatsMax,
      licenseExpiresAt: partner.licenseExpiresAt,
      notes: partner.notes ?? null,
    },
    { merge: true },
  );
}

/**
 * Révoque l'accès OF : partenaire + comptes partner suspendus, firstLogin nettoyé.
 * Les entreprises clientes restent (à archiver séparément si besoin).
 */
export async function revokePartner(partnerId: string): Promise<void> {
  const partner = await getPartner(partnerId);
  if (!partner) throw new Error("Partenaire introuvable");

  await savePartner({ ...partner, status: "suspended" });

  const db = requireDb();
  const usersSnap = await getDocs(
    query(collection(db, "users"), where("partnerId", "==", partnerId)),
  );
  await Promise.all(
    usersSnap.docs.map(async (d) => {
      const user = mapUser(d.id, d.data() as Record<string, unknown>);
      if (user.role !== "partner") return;
      await saveUser({ ...user, status: "suspended" });
    }),
  );

  const loginRef = doc(db, "firstLogin", partner.email.trim().toLowerCase());
  const loginSnap = await getDoc(loginRef);
  if (loginSnap.exists()) {
    await deleteDoc(loginRef);
  }
}

/** Compte partenaire : première connexion via /connexion (comme RH). */
export async function provisionPartnerUser(params: {
  email: string;
  name: string;
  partnerId: string;
}): Promise<PlatformUser> {
  const db = requireDb();
  const email = params.email.trim().toLowerCase();
  const name = params.name.trim();
  if (!email || !name) throw new Error("Nom et e-mail requis");

  const existingLogin = await getDoc(doc(db, "firstLogin", email));
  if (existingLogin.exists() && existingLogin.data()?.status === "pending") {
    throw new Error("Un accès est déjà en attente pour cet e-mail.");
  }

  const provisionalId = `pending_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const today = new Date().toISOString().slice(0, 10);
  const user: PlatformUser = {
    id: provisionalId,
    email,
    name,
    role: "partner",
    structureId: null,
    partnerId: params.partnerId,
    status: "invited",
    lastLoginAt: null,
    createdAt: today,
    progressPercent: null,
    certificateId: null,
    certifiedAt: null,
    quizScore: null,
  };

  await saveUser(user);
  await setDoc(doc(db, "firstLogin", email), {
    email,
    name: user.name,
    role: "partner",
    structureId: null,
    partnerId: params.partnerId,
    status: "pending",
    legacyUserId: provisionalId,
    createdAt: today,
  });

  return user;
}

export async function listStructuresByPartner(partnerId: string): Promise<Structure[]> {
  await assertPartnerScope(partnerId);
  const db = requireDb();
  const snap = await getDocs(
    query(collection(db, "structures"), where("partnerId", "==", partnerId)),
  );
  return snap.docs.map((d) => mapStructure(d.id, d.data() as Record<string, unknown>));
}

export async function listUsersForStructures(
  structureIds: string[],
  partnerId?: string,
): Promise<PlatformUser[]> {
  if (structureIds.length === 0) return [];
  if (partnerId) await assertPartnerScope(partnerId);
  const db = requireDb();
  const results: PlatformUser[] = [];
  // Firestore `in` limité à 30 — on découpe
  for (let i = 0; i < structureIds.length; i += 30) {
    const chunk = structureIds.slice(i, i + 30);
    const snap = await getDocs(
      query(collection(db, "users"), where("structureId", "in", chunk)),
    );
    results.push(...snap.docs.map((d) => mapUser(d.id, d.data() as Record<string, unknown>)));
  }
  return results;
}

export function partnerSeatsAllocated(structures: Structure[]): number {
  return structures
    .filter((s) => s.status === "active" && !s.archivedAt)
    .reduce((sum, s) => sum + Math.max(0, Number(s.billing.seats) || 0), 0);
}

export type PartnerLearnerStats = {
  companies: number;
  enrolled: number;
  inProgress: number;
  done: number;
  invited: number;
};

export function computePartnerLearnerStats(
  structures: Structure[],
  users: PlatformUser[],
): PartnerLearnerStats {
  const activeIds = new Set(
    structures.filter((s) => s.status === "active" && !s.archivedAt).map((s) => s.id),
  );
  const learners = users.filter(
    (u) =>
      u.structureId &&
      activeIds.has(u.structureId) &&
      (u.role === "employee" || (u.role === "rh" && Boolean(u.formationEnrolled))),
  );
  return {
    companies: activeIds.size,
    enrolled: learners.length,
    inProgress: learners.filter(
      (u) => (u.progressPercent ?? 0) > 0 && (u.progressPercent ?? 0) < 100,
    ).length,
    done: learners.filter((u) => (u.progressPercent ?? 0) >= 100).length,
    invited: learners.filter((u) => u.status === "invited").length,
  };
}

function billingDateFromCreation(createdAt: string) {
  const [y, m, d] = createdAt.split("-").map(Number);
  if (!y || !m || !d) return createdAt;
  return `${y + 1}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Plan interne dérivé du volume de sièges (l'OF ne choisit pas d'offre). */
function planForPartnerSeats(seats: number): PlanId {
  if (seats <= PLAN_SEATS.starter) return "starter";
  if (seats <= PLAN_SEATS.pro) return "pro";
  if (seats <= PLAN_SEATS.pme) return "pme";
  return "enterprise";
}

/** Crée une entreprise rattachée au partenaire + compte RH. */
export async function createPartnerStructure(params: {
  partnerId: string;
  partnerSeatsMax: number;
  existingStructures: Structure[];
  name: string;
  seats: number;
  rhName: string;
  rhEmail: string;
  siret?: string;
  billingEmail?: string;
  phone?: string;
}): Promise<{ structure: Structure; rh: PlatformUser }> {
  await assertPartnerScope(params.partnerId);
  const db = requireDb();
  const name = params.name.trim();
  const rhEmail = params.rhEmail.trim().toLowerCase();
  const rhName = params.rhName.trim() || name;
  if (!name || !rhEmail) throw new Error("Nom d'entreprise et e-mail RH requis");

  const seats = Math.max(1, Number(params.seats) || 1);
  const plan = planForPartnerSeats(seats);

  const allocated = partnerSeatsAllocated(params.existingStructures);
  if (allocated + seats > params.partnerSeatsMax) {
    throw new Error(
      `Quota partenaire dépassé : ${allocated}/${params.partnerSeatsMax} sièges déjà alloués, +${seats} demandé.`,
    );
  }

  const createdAt = new Date().toISOString().slice(0, 10);
  const id = `str_${crypto.randomUUID().slice(0, 8)}`;
  const inviteToken = crypto.randomUUID().replace(/-/g, "");
  const structure: Structure = {
    id,
    name,
    createdAt,
    status: "active",
    archivedAt: null,
    inviteToken,
    registryId: createRegistryId(id),
    partnerId: params.partnerId,
    companyModule: emptyCompanyModule(),
    billing: {
      companyName: name,
      siret: (params.siret ?? "").trim(),
      billingEmail: (params.billingEmail ?? rhEmail).trim().toLowerCase(),
      address: "",
      phone: (params.phone ?? "").trim(),
      plan,
      seats,
      priceMonthlyEur: plan === "enterprise" ? 0 : PLAN_PRICES[plan],
      nextInvoiceAt: billingDateFromCreation(createdAt),
    },
  };

  await saveStructure(structure);
  await setDoc(doc(db, "structureInvites", inviteToken), {
    structureId: id,
    name: structure.name,
    seatsMax: seats,
    seatsUsed: 0,
    createdAt: serverTimestamp(),
  });

  const rh = await provisionTenantUser({
    email: rhEmail,
    name: rhName,
    role: "rh",
    structureId: id,
  });

  await syncStructureInviteSeats(structure, { recountUsed: true }).catch(() => undefined);

  return { structure, rh };
}
