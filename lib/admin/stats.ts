import type { PlatformUser } from "./types";

/**
 * Formés / utilisateurs / (capacité affichée à part).
 * Collaborateurs + RH inscrits via le lien (formationEnrolled).
 * À la création : 0/0/N (le RH seul ne compte pas).
 */
export function structureGraduates(structureId: string, users: PlatformUser[]) {
  const members = users.filter(
    (u) =>
      u.structureId === structureId &&
      u.status !== "invited" &&
      !u.id.startsWith("invite:") &&
      (u.role === "employee" || (u.role === "rh" && u.formationEnrolled)),
  );
  const graduated = members.filter(
    (u) => u.progressPercent === 100 || Boolean(u.certificateId),
  ).length;
  return { graduated, total: members.length };
}
