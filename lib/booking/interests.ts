/** Motifs de prise de contact — libellés B2B. */

export const BOOKING_INTERESTS = [
  { value: "acces", label: "Accès plateforme / formation" },
  { value: "devis", label: "Devis entreprise" },
  { value: "module", label: "Module métier sur mesure" },
  { value: "marque-blanche", label: "Marque blanche" },
  { value: "partenaire", label: "Partenariat (organisme de formation)" },
  { value: "accompagnement", label: "Accompagnement & automatisation" },
  { value: "question", label: "Une question" },
] as const;

export type BookingInterestValue = (typeof BOOKING_INTERESTS)[number]["value"];

export const DEFAULT_BOOKING_INTEREST: BookingInterestValue = "acces";

export function isBookingInterest(value: string): value is BookingInterestValue {
  return BOOKING_INTERESTS.some((item) => item.value === value);
}

export function bookingInterestLabel(value: string): string {
  return BOOKING_INTERESTS.find((item) => item.value === value)?.label ?? value;
}
