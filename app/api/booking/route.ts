import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  bookingInterestLabel,
  isBookingInterest,
} from "@/lib/booking/interests";
import { formatSlotLabel, isValidSlotId } from "@/lib/booking/slots";

const TO_EMAIL = process.env.BOOKING_TO_EMAIL?.trim() || "contact@lockin-web.online";
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL?.trim() || "LockinIA <onboarding@resend.dev>";

type Body = {
  email?: string;
  company?: string;
  interest?: string;
  slotId?: string;
  website?: string; // honeypot
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  // Bot honeypot — accepter silencieusement
  if (String(body.website ?? "").trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const company = String(body.company ?? "").trim();
  const interestRaw = String(body.interest ?? "").trim();
  const slotId = String(body.slotId ?? "").trim();

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "E-mail invalide" }, { status: 400 });
  }
  if (!company || company.length > 200) {
    return NextResponse.json({ error: "Société invalide" }, { status: 400 });
  }
  if (!isBookingInterest(interestRaw)) {
    return NextResponse.json({ error: "Objet invalide" }, { status: 400 });
  }
  const interest = bookingInterestLabel(interestRaw);
  if (!isValidSlotId(slotId)) {
    return NextResponse.json(
      { error: "Ce créneau n'est plus disponible. Choisissez une autre date." },
      { status: 400 },
    );
  }

  const slotLabel = formatSlotLabel(slotId);
  if (!slotLabel) {
    return NextResponse.json({ error: "Créneau invalide" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("[booking] RESEND_API_KEY manquant");
    return NextResponse.json(
      { error: "Envoi indisponible pour le moment. Réessayez plus tard." },
      { status: 503 },
    );
  }

  const subject = `Demande RDV LockinIA — ${company}`;
  const text = [
    `${email} (${company}) est intéressé par : ${interest}`,
    "",
    `Créneau demandé : ${slotLabel}`,
    "",
    "Envoie le lien de visio manuellement en répondant à cet e-mail.",
  ].join("\n");

  const html = `
    <p><strong>${escapeHtml(email)}</strong> (<strong>${escapeHtml(company)}</strong>) est intéressé par&nbsp;: <strong>${escapeHtml(interest)}</strong></p>
    <p>Créneau demandé&nbsp;: <strong>${escapeHtml(slotLabel)}</strong></p>
    <p style="color:#64748b;font-size:14px">Envoie le lien de visio manuellement en répondant à cet e-mail.</p>
  `;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      replyTo: email,
      subject,
      text,
      html,
    });

    if (error) {
      console.error("[booking] Resend error", error);
      return NextResponse.json(
        { error: "Impossible d'envoyer la demande. Réessayez." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[booking]", error);
    return NextResponse.json(
      { error: "Impossible d'envoyer la demande. Réessayez." },
      { status: 500 },
    );
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
