export type PendingFirstLogin = {
  pending: true;
  role: string | null;
  structureId: string | null;
  partnerId: string | null;
  name: string;
  createdAt: unknown;
  legacyUserId: string | null;
};

/** Statut première connexion via Admin SDK (pas de lecture publique Firestore). */
export async function fetchFirstLoginStatus(
  emailRaw: string,
): Promise<PendingFirstLogin | { pending: false }> {
  const email = emailRaw.trim().toLowerCase();
  if (!email) return { pending: false };

  const res = await fetch("/api/auth/first-login-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error ?? "Vérification impossible");
  }

  const data = (await res.json()) as {
    pending?: boolean;
    role?: string | null;
    structureId?: string | null;
    partnerId?: string | null;
    name?: string;
    createdAt?: unknown;
    legacyUserId?: string | null;
  };

  if (!data.pending) return { pending: false };
  return {
    pending: true,
    role: data.role ?? null,
    structureId: data.structureId ?? null,
    partnerId: data.partnerId ?? null,
    name: data.name ?? "",
    createdAt: data.createdAt ?? null,
    legacyUserId: data.legacyUserId ?? null,
  };
}
