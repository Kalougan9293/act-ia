import { getFirebaseAuth } from "@/lib/firebase/client";

/** UID provisoire Firestore (pas encore de compte Auth). */
export function isProvisionalUserId(userId: string) {
  return (
    userId.startsWith("pending_") ||
    userId.startsWith("invite:") ||
    userId.startsWith("usr_")
  );
}

/**
 * Supprime le compte Firebase Auth (uid et/ou e-mail).
 * Nécessite une session RH / super admin + Admin SDK côté serveur.
 */
export async function deleteAuthAccount(params: {
  uid?: string | null;
  email?: string | null;
}): Promise<void> {
  const uid = params.uid?.trim() || "";
  const email = params.email?.trim().toLowerCase() || "";
  if (!uid && !email) return;
  if (uid && isProvisionalUserId(uid) && !email) return;

  const auth = getFirebaseAuth();
  const token = await auth?.currentUser?.getIdToken();
  if (!token) throw new Error("Session expirée — reconnectez-vous");

  const res = await fetch("/api/auth/delete-account", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uid: uid && !isProvisionalUserId(uid) ? uid : undefined,
      email: email || undefined,
    }),
  });

  const payload = (await res.json().catch(() => null)) as {
    error?: string;
  } | null;

  if (!res.ok) {
    throw new Error(payload?.error || "Suppression Auth impossible");
  }
}
