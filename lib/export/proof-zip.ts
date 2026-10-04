import {
  AI_USE_CASE_STATUS_LABELS,
  type CompanyModuleContent,
} from "@/lib/admin/types";
import type { Employee } from "@/components/demo/data";
import { formatProofDate } from "@/lib/formation/proof";

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]!) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dosDate(date: Date) {
  const year = Math.max(date.getFullYear(), 1980);
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

/** ZIP non compressé (méthode store), suffisant pour un dossier JSON/PDF. */
export function buildStoredZip(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const now = dosDate(new Date());
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name);
    const crc = crc32(file.data);
    const local = new Uint8Array(30 + nameBytes.length + file.data.length);
    const view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, now.time, true);
    view.setUint16(12, now.day, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, file.data.length, true);
    view.setUint32(22, file.data.length, true);
    view.setUint16(26, nameBytes.length, true);
    local.set(nameBytes, 30);
    local.set(file.data, 30 + nameBytes.length);
    locals.push(local);

    const central = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(12, now.time, true);
    centralView.setUint16(14, now.day, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, file.data.length, true);
    centralView.setUint32(24, file.data.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint32(42, offset, true);
    central.set(nameBytes, 46);
    centrals.push(central);
    offset += local.length;
  }

  const centralSize = centrals.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);

  const total = offset + centralSize + end.length;
  const zip = new Uint8Array(total);
  let cursor = 0;
  for (const part of [...locals, ...centrals, end]) {
    zip.set(part, cursor);
    cursor += part.length;
  }
  return zip;
}

const WIN_ANSI: Record<string, number> = {
  "€": 0x80,
  "‚": 0x82,
  "ƒ": 0x83,
  "„": 0x84,
  "…": 0x85,
  "†": 0x86,
  "‡": 0x87,
  "ˆ": 0x88,
  "‰": 0x89,
  "Š": 0x8a,
  "‹": 0x8b,
  "Œ": 0x8c,
  "Ž": 0x8e,
  "‘": 0x91,
  "’": 0x92,
  "“": 0x93,
  "”": 0x94,
  "•": 0x95,
  "–": 0x96,
  "—": 0x97,
  "˜": 0x98,
  "™": 0x99,
  "š": 0x9a,
  "›": 0x9b,
  "œ": 0x9c,
  "ž": 0x9e,
  "Ÿ": 0x9f,
  " ": 0xa0,
  "¡": 0xa1,
  "¢": 0xa2,
  "£": 0xa3,
  "¥": 0xa5,
  "¦": 0xa6,
  "§": 0xa7,
  "¨": 0xa8,
  "©": 0xa9,
  "ª": 0xaa,
  "«": 0xab,
  "¬": 0xac,
  "®": 0xae,
  "¯": 0xaf,
  "°": 0xb0,
  "±": 0xb1,
  "²": 0xb2,
  "³": 0xb3,
  "´": 0xb4,
  "µ": 0xb5,
  "¶": 0xb6,
  "·": 0xb7,
  "¸": 0xb8,
  "¹": 0xb9,
  "º": 0xba,
  "»": 0xbb,
  "¼": 0xbc,
  "½": 0xbd,
  "¾": 0xbe,
  "¿": 0xbf,
  À: 0xc0,
  Á: 0xc1,
  Â: 0xc2,
  Ã: 0xc3,
  Ä: 0xc4,
  Å: 0xc5,
  Æ: 0xc6,
  Ç: 0xc7,
  È: 0xc8,
  É: 0xc9,
  Ê: 0xca,
  Ë: 0xcb,
  Ì: 0xcc,
  Í: 0xcd,
  Î: 0xce,
  Ï: 0xcf,
  Ñ: 0xd1,
  Ò: 0xd2,
  Ó: 0xd3,
  Ô: 0xd4,
  Õ: 0xd5,
  Ö: 0xd6,
  "×": 0xd7,
  Ø: 0xd8,
  Ù: 0xd9,
  Ú: 0xda,
  Û: 0xdb,
  Ü: 0xdc,
  Ý: 0xdd,
  Þ: 0xde,
  ß: 0xdf,
  à: 0xe0,
  á: 0xe1,
  â: 0xe2,
  ã: 0xe3,
  ä: 0xe4,
  å: 0xe5,
  æ: 0xe6,
  ç: 0xe7,
  è: 0xe8,
  é: 0xe9,
  ê: 0xea,
  ë: 0xeb,
  ì: 0xec,
  í: 0xed,
  î: 0xee,
  ï: 0xef,
  ñ: 0xf1,
  ò: 0xf2,
  ó: 0xf3,
  ô: 0xf4,
  õ: 0xf5,
  ö: 0xf6,
  "÷": 0xf7,
  ø: 0xf8,
  ù: 0xf9,
  ú: 0xfa,
  û: 0xfb,
  ü: 0xfc,
  ý: 0xfd,
  þ: 0xfe,
  ÿ: 0xff,
};

function pdfEscape(text: string): string {
  let out = "";
  for (const ch of text) {
    if (ch === "\\") {
      out += "\\\\";
      continue;
    }
    if (ch === "(" || ch === ")") {
      out += `\\${ch}`;
      continue;
    }
    const code = ch.charCodeAt(0);
    if (code >= 32 && code <= 126) {
      out += ch;
      continue;
    }
    const win = WIN_ANSI[ch];
    if (win) out += `\\${win.toString(8).padStart(3, "0")}`;
    else out += "?";
  }
  return out;
}

function wrapLine(text: string, width = 88): string[] {
  if (!text) return [""];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildSimplePdf(lines: string[]): Uint8Array {
  const pageHeight = 842;
  const pageWidth = 595;
  const pages: string[][] = [[]];
  let y = 800;
  for (const line of lines.flatMap((item) => wrapLine(item))) {
    if (y < 48) {
      pages.push([]);
      y = 800;
    }
    pages[pages.length - 1]!.push(`1 0 0 1 40 ${y} Tm (${pdfEscape(line)}) Tj`);
    y -= 14;
  }

  const objects: string[] = [];
  const pageIds: number[] = [];
  let nextId = 3;
  const fontId = 3 + pages.length * 2;
  for (const commands of pages) {
    const contentId = nextId++;
    const pageId = nextId++;
    pageIds.push(pageId);
    const stream = `BT /F1 10 Tf\n${commands.join("\n")}\nET`;
    objects.push(`${contentId} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`);
    objects.push(
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>\nendobj\n`,
    );
  }
  const catalog = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const kids = pageIds.map((id) => `${id} 0 R`).join(" ");
  const pageTree = `2 0 obj\n<< /Type /Pages /Count ${pageIds.length} /Kids [${kids}] >>\nendobj\n`;
  const font = `${fontId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`;
  const body = catalog + pageTree + objects.join("") + font;

  const xrefOffset = body.length + "%PDF-1.4\n".length;
  const maxId = fontId;
  const offsets = new Map<number, number>();
  let scan = "%PDF-1.4\n".length;
  const chunks = [catalog, pageTree, ...objects, font];
  const chunkIds = [1, 2];
  for (let i = 0; i < pages.length; i++) {
    chunkIds.push(3 + i * 2, 4 + i * 2);
  }
  chunkIds.push(fontId);
  chunks.forEach((chunk, index) => {
    offsets.set(chunkIds[index]!, scan);
    scan += chunk.length;
  });

  let xref = `xref\n0 ${maxId + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= maxId; id++) {
    const pos = offsets.get(id) ?? 0;
    xref += `${String(pos).padStart(10, "0")} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(`%PDF-1.4\n${body}${xref}${trailer}`);
}

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "entreprise";
}

function attestationRows(employees: Employee[]) {
  return employees.map((employee) => ({
    nom: employee.name,
    email: employee.email,
    fonction: employee.role,
    avancement: employee.percent,
    attestation: employee.certificateId ?? null,
    emisLe: employee.certifiedAt ? formatProofDate(employee.certifiedAt).date : null,
    scoreQcm: employee.quizScore ?? null,
  }));
}

export function downloadProofZip(companyName: string, employees: Employee[], module: CompanyModuleContent) {
  const exportedAt = new Date().toISOString();
  const attestations = attestationRows(employees);
  const dossier = {
    entreprise: companyName,
    exporteLe: exportedAt,
    mention:
      "Dossier d'aide à la documentation. Il ne constitue pas un conseil juridique et ne garantit pas à lui seul la conformité.",
    dureePedagogique: "1 h 00",
    moduleEntreprise: {
      outils: module.tools,
      charte: module.charter,
      contacts: module.contacts,
      declaration: module.declaration,
    },
    registre: module.useCases.map((row) => ({
      ...row,
      statut: AI_USE_CASE_STATUS_LABELS[row.status],
    })),
    attestations,
    historique: module.revisions,
  };

  const pdfLines = [
    "ConformAI — Dossier de preuve",
    companyName,
    `Export : ${exportedAt}`,
    "Aide a la documentation. Ne constitue pas un conseil juridique.",
    "Duree pedagogique prevue : 1 h 00",
    "",
    "Attestations de suivi",
    ...attestations.map(
      (row) =>
        `${row.nom} — ${row.attestation ?? "sans attestation"} — ${row.emisLe ?? "—"} — score ${row.scoreQcm ?? "—"}`,
    ),
    "",
    "Registre des usages IA",
    ...(module.useCases.length
      ? module.useCases.map(
          (row) =>
            `${row.tool || "Usage"} — ${AI_USE_CASE_STATUS_LABELS[row.status]} — ${row.purpose || "finalite non renseignee"}`,
        )
      : ["Aucune fiche pour le moment."]),
    "",
    "Historique",
    ...(module.revisions.length
      ? module.revisions.map((row) => `${row.at} — ${row.summary}`)
      : ["Aucune modification enregistree."]),
  ];

  const encoder = new TextEncoder();
  const zip = buildStoredZip([
    { name: "dossier.json", data: encoder.encode(JSON.stringify(dossier, null, 2)) },
    { name: "registre.json", data: encoder.encode(JSON.stringify(dossier.registre, null, 2)) },
    { name: "attestations.json", data: encoder.encode(JSON.stringify(attestations, null, 2)) },
    { name: "historique.json", data: encoder.encode(JSON.stringify(module.revisions, null, 2)) },
    { name: "dossier.pdf", data: buildSimplePdf(pdfLines) },
  ]);

  const copy = new ArrayBuffer(zip.byteLength);
  new Uint8Array(copy).set(zip);
  const blob = new Blob([copy], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dossier-preuve-${slug(companyName)}.zip`;
  link.click();
  URL.revokeObjectURL(url);
}
