import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin-server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NEEDS = new Set(["formation", "automatisation", "processus", "autre"]);

/** Anti-spam léger en mémoire (par instance). */
const recentByIp = new Map<string, number>();
const COOLDOWN_MS = 45_000;

type Body = {
  name?: string;
  email?: string;
  company?: string;
  need?: string;
  message?: string;
  website?: string; // honeypot
};

function clientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Honeypot : les bots remplissent souvent ce champ
  if (body.website && String(body.website).trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const company = String(body.company ?? "").trim();
  const need = String(body.need ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json(
      { error: "Indiquez votre nom (2 à 120 caractères)." },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email) || email.length > 180) {
    return NextResponse.json({ error: "E-mail invalide." }, { status: 400 });
  }
  if (company.length > 160) {
    return NextResponse.json(
      { error: "Nom d'entreprise trop long." },
      { status: 400 },
    );
  }
  if (!NEEDS.has(need)) {
    return NextResponse.json(
      { error: "Choisissez un type de besoin." },
      { status: 400 },
    );
  }
  if (message.length < 10 || message.length > 4000) {
    return NextResponse.json(
      { error: "Le message doit faire entre 10 et 4000 caractères." },
      { status: 400 },
    );
  }

  const ip = clientIp(req);
  const now = Date.now();
  const last = recentByIp.get(ip) ?? 0;
  if (now - last < COOLDOWN_MS) {
    return NextResponse.json(
      { error: "Patientez quelques secondes avant de renvoyer." },
      { status: 429 },
    );
  }
  recentByIp.set(ip, now);

  try {
    await getAdminDb().collection("contactLeads").add({
      name,
      email,
      company: company || null,
      need,
      message,
      source: "interventions",
      status: "new",
      createdAt: FieldValue.serverTimestamp(),
      ip,
      userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const lower = msg.toLowerCase();
    const status = lower.includes("admin firebase non configuré") ? 503 : 500;
    return NextResponse.json(
      {
        error:
          status === 503
            ? "Service temporairement indisponible. Écrivez à contact@lockin-web.online."
            : "Impossible d'enregistrer votre demande. Réessayez ou écrivez à contact@lockin-web.online.",
      },
      { status },
    );
  }

  return NextResponse.json({ ok: true });
}
