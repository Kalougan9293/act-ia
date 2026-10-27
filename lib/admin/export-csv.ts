import { formatDate } from "@/lib/admin/format";
import { structureGraduates } from "@/lib/admin/stats";
import {
  PLAN_LABELS,
  type PlatformUser,
  type Structure,
} from "@/lib/admin/types";
import { buildStoredZip, downloadBytes } from "@/lib/export/proof-zip";

function csvEscape(value: string | number | null | undefined): string {
  const raw =
    value === null || value === undefined
      ? ""
      : typeof value === "number"
        ? String(value)
        : value;
  if (/[",\n\r;]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

/** CSV Excel-friendly (séparateur `;`, BOM UTF-8). */
export function toCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][],
): string {
  const lines = [
    headers.map(csvEscape).join(";"),
    ...rows.map((row) => row.map(csvEscape).join(";")),
  ];
  return `\uFEFF${lines.join("\r\n")}`;
}

function structureEmail(structure: Structure, users: PlatformUser[]) {
  const rh = users.find((u) => u.structureId === structure.id && u.role === "rh");
  return rh?.email || structure.billing.billingEmail || "";
}

function structureNameById(structures: Structure[]) {
  const map = new Map<string, string>();
  for (const s of structures) map.set(s.id, s.name);
  return map;
}

export function structuresCsv(
  structures: Structure[],
  users: PlatformUser[],
): string {
  const headers = [
    "Structure",
    "Identifiant suivi",
    "SIRET",
    "E-mail",
    "Téléphone",
    "Adresse",
    "Offre",
    "Sièges",
    "Prix HT (€/an)",
    "Formés",
    "Utilisateurs formation",
    "Création",
    "Prochaine facture",
    "Archivé le",
    "Statut",
    "ID",
  ];
  const rows = [...structures]
    .sort((a, b) => a.name.localeCompare(b.name, "fr"))
    .map((s) => {
      const grads = structureGraduates(s.id, users);
      return [
        s.name,
        s.registryId,
        s.billing.siret,
        structureEmail(s, users),
        s.billing.phone,
        s.billing.address,
        PLAN_LABELS[s.billing.plan],
        s.billing.seats,
        s.billing.priceMonthlyEur,
        grads.graduated,
        grads.total,
        formatDate(s.createdAt),
        formatDate(s.billing.nextInvoiceAt),
        formatDate(s.archivedAt),
        s.archivedAt ? "Archivé" : s.status,
        s.id,
      ];
    });
  return toCsv(headers, rows);
}

export function usersCsv(
  users: PlatformUser[],
  structures: Structure[],
): string {
  const names = structureNameById(structures);
  const headers = [
    "Nom",
    "E-mail",
    "Rôle",
    "Fonction",
    "Entreprise",
    "Statut",
    "Avancement %",
    "Positionnement %",
    "QCM %",
    "Satisfaction /5",
    "Commentaire satisfaction",
    "Réclamation",
    "Satisfaction le",
    "N° attestation",
    "Attestation émise le",
    "Temps connexion (s)",
    "Modules validés",
    "Dernière connexion",
    "Créé le",
    "ID",
    "ID structure",
  ];
  const rows = [...users]
    .sort((a, b) => a.name.localeCompare(b.name, "fr"))
    .map((u) => [
      u.name,
      u.email,
      u.role,
      u.jobTitle ?? "",
      u.structureId ? names.get(u.structureId) ?? "" : "",
      u.status,
      u.progressPercent,
      u.positioningScore,
      u.quizScore,
      u.satisfactionRating,
      u.satisfactionComment ?? "",
      u.satisfactionComplaint ?? "",
      formatDate(u.satisfactionAt),
      u.certificateId ?? "",
      formatDate(u.certifiedAt),
      u.attestationTimeSpentSec,
      u.attestationModulesCompleted,
      formatDate(u.lastLoginAt),
      formatDate(u.createdAt),
      u.id,
      u.structureId ?? "",
    ]);
  return toCsv(headers, rows);
}

export function attestationsCsv(
  users: PlatformUser[],
  structures: Structure[],
): string {
  const names = structureNameById(structures);
  const headers = [
    "Nom",
    "E-mail",
    "Entreprise",
    "N° attestation",
    "Émise le",
    "Score QCM %",
    "Positionnement %",
    "Temps connexion (s)",
    "Modules validés",
    "Satisfaction /5",
    "Réclamation",
    "ID utilisateur",
  ];
  const rows = users
    .filter((u) => u.progressPercent === 100)
    .sort((a, b) => {
      const byDate = (b.certifiedAt ?? "").localeCompare(a.certifiedAt ?? "");
      return byDate || a.name.localeCompare(b.name, "fr");
    })
    .map((u) => [
      u.name,
      u.email,
      u.structureId ? names.get(u.structureId) ?? "" : "",
      u.certificateId ?? "",
      formatDate(u.certifiedAt),
      u.quizScore,
      u.positioningScore,
      u.attestationTimeSpentSec,
      u.attestationModulesCompleted,
      u.satisfactionRating,
      u.satisfactionComplaint ?? "",
      u.id,
    ]);
  return toCsv(headers, rows);
}

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

export function downloadCsv(filename: string, csv: string) {
  downloadBytes(
    filename,
    new TextEncoder().encode(csv),
    "text/csv;charset=utf-8",
  );
}

export function downloadAdminReportZip(input: {
  activeStructures: Structure[];
  archivedStructures: Structure[];
  users: PlatformUser[];
  formationUsers: PlatformUser[];
  graduatedUsers: PlatformUser[];
}) {
  const {
    activeStructures,
    archivedStructures,
    users,
    formationUsers,
    graduatedUsers,
  } = input;
  const day = stamp();
  const encoder = new TextEncoder();
  const zip = buildStoredZip([
    {
      name: `01-structures-actives-${day}.csv`,
      data: encoder.encode(structuresCsv(activeStructures, users)),
    },
    {
      name: `02-utilisateurs-${day}.csv`,
      data: encoder.encode(usersCsv(formationUsers, [
        ...activeStructures,
        ...archivedStructures,
      ])),
    },
    {
      name: `03-attestations-${day}.csv`,
      data: encoder.encode(
        attestationsCsv(graduatedUsers, [
          ...activeStructures,
          ...archivedStructures,
        ]),
      ),
    },
    {
      name: `04-structures-archivees-${day}.csv`,
      data: encoder.encode(structuresCsv(archivedStructures, users)),
    },
  ]);
  downloadBytes(
    `lockinia-rapport-admin-${day}.zip`,
    zip,
    "application/zip",
  );
}
