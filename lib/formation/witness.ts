import type { IssuedCertificate } from "@/lib/firebase/formation-progress";

/**
 * Compte témoin exclusif — démo commerciale.
 * TOUS les cadenas ouverts, AUCUNE validation syncée (local only).
 * Ne jamais élargir cette liste sans revue produit.
 */
const WITNESS_DEMO_EMAILS = new Set(["c@gmail.com"]);

/** Attestation figée — affichage local uniquement, jamais écrite en base. */
const WITNESS_SPECIMEN_CERTIFICATE: IssuedCertificate = {
  id: "CAI-2026-WITNESS-0001",
  issuedAt: "2026-10-15T14:30:00.000Z",
  quizScore: 92,
  careerPathId: null,
  timeSpentSec: 78 * 60,
  modulesCompleted: 18,
};

export function isWitnessDemoAccount(email: string | null | undefined): boolean {
  if (!email) return false;
  return WITNESS_DEMO_EMAILS.has(email.trim().toLowerCase());
}

/** Attestation de démo pour l’espace témoin (spécimen local). */
export function witnessDemoCertificate(): IssuedCertificate {
  return { ...WITNESS_SPECIMEN_CERTIFICATE };
}
