import type { PlatformUser, Structure, UserRole } from "@/lib/admin/types";
import type { Employee, EmployeeStatus } from "@/components/demo/data";
import { findStructureById, mockStructures, mockUsers } from "@/lib/admin/mock-data";

/** Session applicative — remplacée par Firebase Auth + custom claims */
export interface AppSession {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  structureId: string | null;
  /** RH : true seulement si inscrit à la formation (créé dans la liste RH). */
  formationEnrolled?: boolean;
}

export const DEMO_RH_SESSION: AppSession = {
  uid: "usr_rh_atelier",
  email: "rh@atelier-lumiere.fr",
  name: "Sophie Lambert",
  role: "rh",
  structureId: "str_atelier",
};

export const DEMO_USER_SESSION: AppSession = {
  uid: "usr_emp_camille",
  email: "camille.bernard@atelier-lumiere.fr",
  name: "Camille Bernard",
  role: "employee",
  structureId: "str_atelier",
};

export function getStructureForSession(session: AppSession): Structure | null {
  return findStructureById(session.structureId);
}

/** Uniquement les membres de LA structure du session (jamais cross-tenant) */
export function getMembersForStructure(structureId: string | null): PlatformUser[] {
  if (!structureId) return [];
  return mockUsers.filter(
    (u) => u.structureId === structureId && u.role !== "super_admin",
  );
}

function toStatus(percent: number | null): EmployeeStatus {
  if (percent == null || percent <= 0) return "todo";
  if (percent >= 100) return "done";
  return "progress";
}

function formatLastSeen(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** Mapping RH view — filtré strictement par structureId */
export function employeesForRh(session: AppSession): Employee[] {
  if (session.role !== "rh" || !session.structureId) return [];
  return getMembersForStructure(session.structureId)
    .filter((u) => u.role === "employee" || u.role === "rh")
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role === "rh" ? "RH" : "Collaborateur",
      path: "IA + RGPD",
      status: toStatus(u.progressPercent),
      percent: u.progressPercent ?? 0,
      lastSeen: formatLastSeen(u.lastLoginAt),
    }));
}

export function assertSameStructure(
  actor: AppSession,
  targetStructureId: string | null,
): boolean {
  if (actor.role === "super_admin") return true;
  if (!actor.structureId || !targetStructureId) return false;
  return actor.structureId === targetStructureId;
}

export function listStructuresSafe(actor: AppSession): Structure[] {
  if (actor.role === "super_admin") return mockStructures;
  if (!actor.structureId) return [];
  const s = findStructureById(actor.structureId);
  return s ? [s] : [];
}
