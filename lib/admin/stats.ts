import type { PlatformUser } from "./types";

export function structureGraduates(structureId: string, users: PlatformUser[]) {
  const members = users.filter((u) => u.structureId === structureId);
  const graduated = members.filter((u) => u.progressPercent === 100).length;
  return { graduated, total: members.length };
}
