import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { deleteAuthAccount } from "@/lib/firebase/delete-auth-account";
import type { ModuleRevision, PlatformUser, Structure } from "@/lib/admin/types";
import { emptyCompanyModule, normalizeAiUseCase } from "@/lib/admin/types";

function requireDb() {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");
  return db;
}

function toIsoDate(value: unknown): string {
  if (typeof value === "string") return value.slice(0, 10);
  if (value && typeof value === "object" && "toDate" in value) {
    const d = (value as { toDate: () => Date }).toDate();
    return d.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

export function mapStructure(id: string, data: Record<string, unknown>): Structure {
  const billing = (data.billing ?? {}) as Record<string, unknown>;
  const company = (data.companyModule ?? {}) as Record<string, unknown>;
  const rawCases = Array.isArray(company.useCases) ? company.useCases : [];
  const useCases = rawCases.map((row, index) => normalizeAiUseCase(row, index));
  const rawRevisions = Array.isArray(company.revisions) ? company.revisions : [];
  const revisions: ModuleRevision[] = rawRevisions
    .map((row) => {
      const item = (row ?? {}) as Record<string, unknown>;
      return { at: String(item.at ?? ""), summary: String(item.summary ?? "") };
    })
    .filter((row) => row.at && row.summary);
  return {
    id,
    name: String(data.name ?? ""),
    createdAt: toIsoDate(data.createdAt),
    status: (data.status as Structure["status"]) ?? "active",
    archivedAt: data.archivedAt ? toIsoDate(data.archivedAt) : null,
    inviteToken: data.inviteToken ? String(data.inviteToken) : null,
    companyModule: {
      ...emptyCompanyModule(),
      tools: String(company.tools ?? ""),
      charter: String(company.charter ?? ""),
      contacts: String(company.contacts ?? ""),
      declaration: String(company.declaration ?? ""),
      useCases,
      revisions,
    },
    billing: {
      companyName: String(billing.companyName ?? data.name ?? ""),
      siret: String(billing.siret ?? ""),
      billingEmail: String(billing.billingEmail ?? ""),
      address: String(billing.address ?? ""),
      phone: String(billing.phone ?? ""),
      plan: (billing.plan as Structure["billing"]["plan"]) ?? "starter",
      seats: Number(billing.seats ?? 1),
      priceMonthlyEur: Number(billing.priceMonthlyEur ?? 0),
      nextInvoiceAt: toIsoDate(billing.nextInvoiceAt),
    },
  };
}

export function mapUser(id: string, data: Record<string, unknown>): PlatformUser {
  return {
    id,
    email: String(data.email ?? ""),
    name: String(data.name ?? ""),
    role: data.role as PlatformUser["role"],
    structureId: (data.structureId as string | null) ?? null,
    status: (data.status as PlatformUser["status"]) ?? "active",
    jobTitle: data.jobTitle ? String(data.jobTitle) : null,
    lastLoginAt: data.lastLoginAt ? toIsoDate(data.lastLoginAt) : null,
    createdAt: toIsoDate(data.createdAt),
    progressPercent:
      data.progressPercent === null || data.progressPercent === undefined
        ? null
        : Number(data.progressPercent),
    certificateId: (data.certificateId as string | null) ?? null,
    certifiedAt: data.certifiedAt ? toIsoDate(data.certifiedAt) : null,
    quizScore:
      data.quizScore === null || data.quizScore === undefined
        ? null
        : Number(data.quizScore),
    formationEnrolled: Boolean(data.formationEnrolled),
  };
}

export async function listStructures(): Promise<Structure[]> {
  const db = requireDb();
  const snap = await getDocs(collection(db, "structures"));
  return snap.docs.map((d) => mapStructure(d.id, d.data() as Record<string, unknown>));
}

export async function listUsers(): Promise<PlatformUser[]> {
  const db = requireDb();
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => mapUser(d.id, d.data() as Record<string, unknown>));
}

export async function getUserById(userId: string): Promise<PlatformUser | null> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return null;
  return mapUser(snap.id, snap.data() as Record<string, unknown>);
}

export async function getStructureById(structureId: string): Promise<Structure | null> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "structures", structureId));
  if (!snap.exists()) return null;
  return mapStructure(snap.id, snap.data() as Record<string, unknown>);
}

export async function saveStructure(structure: Structure): Promise<void> {
  const db = requireDb();
  await setDoc(
    doc(db, "structures", structure.id),
    {
      name: structure.name,
      createdAt: structure.createdAt,
      status: structure.status,
      archivedAt: structure.archivedAt,
      inviteToken: structure.inviteToken,
      billing: structure.billing,
      companyModule: structure.companyModule,
    },
    { merge: true },
  );
}

export async function saveUser(user: PlatformUser): Promise<void> {
  const db = requireDb();
  await setDoc(
    doc(db, "users", user.id),
    {
      email: user.email,
      name: user.name,
      role: user.role,
      structureId: user.structureId,
      status: user.status,
      jobTitle: user.jobTitle ?? null,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      progressPercent: user.progressPercent,
      certificateId: user.certificateId,
      certifiedAt: user.certifiedAt,
      quizScore: user.quizScore,
      ...(user.formationEnrolled !== undefined
        ? { formationEnrolled: user.formationEnrolled }
        : {}),
    },
    { merge: true },
  );
}

export async function deleteStructureAndUsers(
  structureId: string,
  userIds: string[],
): Promise<void> {
  const db = requireDb();

  // Auth d'abord (profils encore présents pour l'autorisation serveur)
  for (const userId of userIds) {
    const snap = await getDoc(doc(db, "users", userId));
    const email = snap.exists()
      ? String(snap.data()?.email ?? "")
          .trim()
          .toLowerCase()
      : "";
    await deleteAuthAccount({ uid: userId, email });
  }

  const batch = writeBatch(db);
  batch.delete(doc(db, "structures", structureId));
  for (const userId of userIds) {
    batch.delete(doc(db, "users", userId));
  }
  await batch.commit();
}

export async function deleteUser(userId: string): Promise<void> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "users", userId));
  const email = snap.exists()
    ? String(snap.data()?.email ?? "")
        .trim()
        .toLowerCase()
    : "";
  await deleteAuthAccount({ uid: userId, email });
  await deleteDoc(doc(db, "users", userId));
}
