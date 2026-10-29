/**
 * Identité juridique de l'émetteur des attestations de suivi LockinIA.
 * Aligné sur mentions légales / CGU.
 */

export const ATTESTATION_ISSUER = {
  brand: "LockinIA",
  legalName: "FITOPS AI",
  address: "119 rue Jules Parent, 92500 Rueil-Malmaison",
  siret: "853 780 906 00063",
  email: "contact@lockin-web.online",
  site: "https://lockin-web.online",
  siteHost: "lockin-web.online",
} as const;

export const ATTESTATION_HEADER_TAGLINE =
  "Sensibilisation à la maîtrise de l'IA (AI Act, art. 4)";

export const ATTESTATION_REFERENTIEL =
  "Règlement européen sur l'intelligence artificielle (AI Act), notamment son article 4 relatif à la maîtrise de l'IA ; bonnes pratiques de protection des données personnelles et d'utilisation responsable de l'IA.";

export const ATTESTATION_INTRO =
  "Nous attestons que la personne identifiée ci-dessus a suivi le parcours de sensibilisation indiqué et satisfait aux critères de validation définis par l'organisme émetteur.";

export const QUIZ_PASS_THRESHOLD = 80;
