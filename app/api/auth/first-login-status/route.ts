import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin-server";

type Body = {
  email?: string;
};

/**
 * Lecture serveur de firstLogin (plus de get public Firestore).
 * Réponse minimale pour l'UI ; détail utile uniquement si pending.
 */
export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  if (!email || !email.includes("@") || email.length > 254) {
    return NextResponse.json({ error: "E-mail invalide" }, { status: 400 });
  }

  try {
    const snap = await getAdminDb().collection("firstLogin").doc(email).get();
    if (!snap.exists) {
      return NextResponse.json({ pending: false });
    }
    const data = snap.data() ?? {};
    if (String(data.status ?? "") !== "pending") {
      return NextResponse.json({ pending: false });
    }
    return NextResponse.json({
      pending: true,
      role: data.role != null ? String(data.role) : null,
      structureId: data.structureId != null ? String(data.structureId) : null,
      partnerId: data.partnerId != null ? String(data.partnerId) : null,
      name: data.name != null ? String(data.name) : "",
      createdAt: data.createdAt != null ? data.createdAt : null,
      legacyUserId:
        data.legacyUserId != null ? String(data.legacyUserId) : null,
    });
  } catch (error) {
    console.error("[first-login-status]", error);
    return NextResponse.json(
      { error: "Vérification impossible" },
      { status: 500 },
    );
  }
}
