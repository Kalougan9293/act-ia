/**
 * PDF A4 calqué sur CertificatePreview (« Voir mon attestation »).
 */

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN_X = 44;
const MARGIN_TOP = 36;
const MARGIN_BOTTOM = 32;
const CONTENT_W = PAGE_W - MARGIN_X * 2;
const LEFT = MARGIN_X;
const RIGHT = PAGE_W - MARGIN_X;

const BLUE = "0.145 0.388 0.922";
const SLATE = "0.118 0.161 0.224";
const MUTED = "0.392 0.455 0.545";
const LINE = "0.886 0.910 0.941";
const AMBER = "0.706 0.337 0.039";
const ROW_BG = "0.973 0.980 0.988";
const WHITE = "1 1 1";

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
  "§": 0xa7,
  "©": 0xa9,
  "«": 0xab,
  "®": 0xae,
  "°": 0xb0,
  "±": 0xb1,
  "²": 0xb2,
  "³": 0xb3,
  "µ": 0xb5,
  "·": 0xb7,
  "¹": 0xb9,
  "»": 0xbb,
  "À": 0xc0,
  "Á": 0xc1,
  "Â": 0xc2,
  "Ã": 0xc3,
  "Ä": 0xc4,
  "Å": 0xc5,
  "Æ": 0xc6,
  "Ç": 0xc7,
  "È": 0xc8,
  "É": 0xc9,
  "Ê": 0xca,
  "Ë": 0xcb,
  "Ì": 0xcc,
  "Í": 0xcd,
  "Î": 0xce,
  "Ï": 0xcf,
  "Ñ": 0xd1,
  "Ò": 0xd2,
  "Ó": 0xd3,
  "Ô": 0xd4,
  "Õ": 0xd5,
  "Ö": 0xd6,
  "Ù": 0xd9,
  "Ú": 0xda,
  "Û": 0xdb,
  "Ü": 0xdc,
  "Ý": 0xdd,
  "ß": 0xdf,
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
  ù: 0xf9,
  ú: 0xfa,
  û: 0xfb,
  ü: 0xfc,
  ý: 0xfd,
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

function approxWidth(text: string, size: number, bold = false): number {
  return text.length * size * (bold ? 0.54 : 0.49);
}

function wrapText(text: string, maxWidth: number, size: number, bold = false): string[] {
  if (!text) return [""];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (approxWidth(next, size, bold) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export type AttestationPdfInput = {
  first: string;
  last: string;
  companyName: string;
  certificateId: string;
  curriculumLabel: string;
  courseTitle: string;
  durationLabel: string;
  quizScore: number;
  dateLabel: string;
  timeLabel: string;
  issuedAtLabel: string;
  utcLabel: string | null;
  hash: string;
  specimen?: boolean;
  timeSpentLabel?: string | null;
  modulesCompletedLabel?: string | null;
};

class PageBuilder {
  cmds: string[] = [];
  y: number;

  constructor(startY = PAGE_H - MARGIN_TOP) {
    this.y = startY;
  }

  ensure(space: number) {
    return this.y - space >= MARGIN_BOTTOM + 20;
  }

  text(
    x: number,
    y: number,
    text: string,
    opts: { size?: number; bold?: boolean; color?: string } = {},
  ) {
    const size = opts.size ?? 10;
    const font = opts.bold ? "/F2" : "/F1";
    const color = opts.color ?? SLATE;
    this.cmds.push(
      "BT",
      `${color} rg`,
      `${font} ${size} Tf`,
      `1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm`,
      `(${pdfEscape(text)}) Tj`,
      "ET",
    );
  }

  centerText(
    y: number,
    text: string,
    opts: { size?: number; bold?: boolean; color?: string; maxWidth?: number } = {},
  ): number {
    const size = opts.size ?? 10;
    const bold = opts.bold ?? false;
    const maxWidth = opts.maxWidth ?? CONTENT_W;
    const lines = wrapText(text, maxWidth, size, bold);
    let yy = y;
    for (const line of lines) {
      const w = approxWidth(line, size, bold);
      this.text((PAGE_W - w) / 2, yy, line, { size, bold, color: opts.color });
      yy -= size + 4;
    }
    return yy;
  }

  line(x1: number, y1: number, x2: number, y2: number, color = LINE, width = 0.8) {
    this.cmds.push(
      `${color} RG`,
      `${width} w`,
      `${x1.toFixed(2)} ${y1.toFixed(2)} m`,
      `${x2.toFixed(2)} ${y2.toFixed(2)} l`,
      "S",
    );
  }

  rect(
    x: number,
    y: number,
    w: number,
    h: number,
    opts: { stroke?: string; fill?: string; width?: number } = {},
  ) {
    if (opts.fill) this.cmds.push(`${opts.fill} rg`, `${x} ${y} ${w} ${h} re`, "f");
    if (opts.stroke) {
      this.cmds.push(
        `${opts.stroke} RG`,
        `${opts.width ?? 0.8} w`,
        `${x} ${y} ${w} ${h} re`,
        "S",
      );
    }
  }

  fakeQr(x: number, y: number, size = 48) {
    const cells = [
      "111011101",
      "100010001",
      "101110101",
      "101010101",
      "111011101",
      "000100010",
      "110101011",
      "101000101",
      "111011101",
    ];
    const n = 9;
    const cell = size / n;
    this.rect(x - 2, y - 2, size + 4, size + 4, { stroke: LINE, fill: WHITE, width: 0.9 });
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        if (cells[row]![col] !== "1") continue;
        this.rect(
          x + col * cell,
          y + (n - 1 - row) * cell,
          cell * 0.88,
          cell * 0.88,
          { fill: SLATE },
        );
      }
    }
  }

  stream() {
    return this.cmds.join("\n");
  }
}

function assemblePdf(pageStreams: string[]): Uint8Array {
  const objects: string[] = [];
  const pageIds: number[] = [];
  let nextId = 3;
  const fontRegularId = 3 + pageStreams.length * 2;
  const fontBoldId = fontRegularId + 1;

  for (const streamBody of pageStreams) {
    const contentId = nextId++;
    const pageId = nextId++;
    pageIds.push(pageId);
    objects.push(
      `${contentId} 0 obj\n<< /Length ${streamBody.length} >>\nstream\n${streamBody}\nendstream\nendobj\n`,
    );
    objects.push(
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> >>\nendobj\n`,
    );
  }

  const catalog = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const kids = pageIds.map((id) => `${id} 0 R`).join(" ");
  const pageTree = `2 0 obj\n<< /Type /Pages /Count ${pageIds.length} /Kids [${kids}] >>\nendobj\n`;
  const fontRegular = `${fontRegularId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`;
  const fontBold = `${fontBoldId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n`;
  const body = catalog + pageTree + objects.join("") + fontRegular + fontBold;

  const header = "%PDF-1.4\n";
  const xrefOffset = header.length + body.length;
  const maxId = fontBoldId;
  const offsets = new Map<number, number>();
  let scan = header.length;
  const chunks = [catalog, pageTree, ...objects, fontRegular, fontBold];
  const chunkIds = [1, 2];
  for (let i = 0; i < pageStreams.length; i++) chunkIds.push(3 + i * 2, 4 + i * 2);
  chunkIds.push(fontRegularId, fontBoldId);
  chunks.forEach((chunk, index) => {
    offsets.set(chunkIds[index]!, scan);
    scan += chunk.length;
  });

  let xref = `xref\n0 ${maxId + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= maxId; id++) {
    xref += `${String(offsets.get(id) ?? 0).padStart(10, "0")} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(`${header}${body}${xref}${trailer}`);
}

export function buildLearnerAttestationPdf(input: AttestationPdfInput): Uint8Array {
  /**
   * Une page A4 remplie : on mesure le contenu « naturel »,
   * puis on répartit l’espace restant entre les sections (plus de vide en bas).
   */
  const startY = PAGE_H - MARGIN_TOP;
  const endY = MARGIN_BOTTOM + 8;
  const available = startY - endY;

  const rows: [string, string][] = [
    ["Durée pédagogique prévue (socle)", input.durationLabel],
  ];
  if (input.timeSpentLabel) {
    rows.push(["Temps de connexion enregistré", input.timeSpentLabel]);
  }
  if (input.modulesCompletedLabel) {
    rows.push(["Modules / étapes validés", input.modulesCompletedLabel]);
  }
  rows.push(
    ["Parcours complété", "100 %"],
    ["Résultat de l'évaluation", `${input.quizScore} / 100 — Réussite`],
    ["Seuil de réussite défini pour ce parcours", "80 / 100"],
    ["Date de finalisation", input.dateLabel],
    ["Heure de finalisation", `${input.timeLabel} Europe/Paris`],
  );
  if (input.utcLabel) rows.push(["Horodatage UTC", input.utcLabel]);

  const intro =
    "Nous attestons que la personne identifiée ci-dessus a suivi le parcours de sensibilisation indiqué et satisfait aux critères de validation définis par l'organisme émetteur.";
  const bullets = [
    "Comprendre les principes liés à l'utilisation de l'IA et à la AI literacy.",
    "Identifier les principaux risques, notamment pour les données personnelles.",
    "Adopter des pratiques responsables avec les outils d'IA générative.",
    "Repérer les situations qui relèvent des règles internes de l'entreprise.",
  ];
  const referentiel =
    "Règlement européen sur l'intelligence artificielle (AI Act), notamment son article 4 relatif à la maîtrise de l'IA ; bonnes pratiques de protection des données personnelles et d'utilisation responsable de l'IA.";
  const durationNote =
    "Le temps de connexion enregistré peut être inférieur à la durée pédagogique prévue (sessions fractionnées, onglet en arrière-plan).";
  const disclaimer =
    "Ce document constitue un justificatif de suivi délivré à l'entreprise pour documenter sa démarche de maîtrise de l'IA. Il ne constitue ni une certification officielle de conformité à l'AI Act ou au RGPD, ni une certification délivrée par l'Union européenne.";
  const issuerLines = [
    "LockinIA — édité par FITOPS AI (micro-entreprise)",
    "119 rue Jules Parent, 92500 Rueil-Malmaison — SIRET 853 780 906 00063",
    "contact@lockin-web.online — lockin-web.online",
  ];

  const titleLines = wrapText(
    "Attestation de suivi de formation et de sensibilisation",
    CONTENT_W,
    13,
    true,
  );
  const courseLines = wrapText(input.courseTitle, CONTENT_W, 10, true);
  const introLines = wrapText(intro, CONTENT_W, 9);
  const referentielLines = wrapText(referentiel, CONTENT_W, 9);
  const durationNoteLines = wrapText(durationNote, CONTENT_W, 7.5);
  const disclaimerLines = wrapText(disclaimer, CONTENT_W, 7.5);
  const hashLines = wrapText(input.hash, CONTENT_W - 8, 8, true);

  const rowH = 14;

  // Hauteurs de blocs (sans les respirations inter-sections)
  const hHeader =
    11 +
    16 +
    titleLines.length * 17 +
    12 +
    12 +
    10 +
    10;
  const h01 = 14 + 36;
  const h02 =
    13 +
    introLines.length * 11 +
    4 +
    11 +
    courseLines.length * 12 +
    3 +
    11 +
    referentielLines.length * 11 +
    12 +
    bullets.reduce((sum, b) => sum + wrapText(b, CONTENT_W - 12, 9).length * 11, 0);
  const h03 =
    16 +
    rows.length * rowH +
    10 +
    12 +
    durationNoteLines.length * 9;
  const h04 =
    12 +
    12 +
    14 +
    4 * (9 + 9 + 3) +
    hashLines.length * 9;
  const hFooter =
    4 +
    issuerLines.length * 11 +
    4 +
    disclaimerLines.length * 9 +
    3 +
    10;

  const solid =
    hHeader + h01 + h02 + h03 + h04 + hFooter;
  // 5 respirations : après header, 01, 02, 03, 04
  const gapCount = 5;
  const leftover = Math.max(0, available - solid);
  const baseGap = leftover / gapCount;
  // Un peu plus d’air au milieu de page
  const gaps = [
    baseGap * 0.85,
    baseGap * 1.05,
    baseGap * 1.15,
    baseGap * 1.1,
    baseGap * 0.85,
  ];

  const page = new PageBuilder(startY);
  page.rect(22, 22, PAGE_W - 44, PAGE_H - 44, { stroke: LINE, width: 1.15 });

  // —— En-tête ——
  page.centerText(page.y, "LockinIA", { size: 11, bold: true, color: BLUE });
  page.y -= 16;
  for (const line of titleLines) {
    const w = approxWidth(line, 13, true);
    page.text((PAGE_W - w) / 2, page.y, line, { size: 13, bold: true });
    page.y -= 17;
  }
  page.centerText(page.y, "Sensibilisation à la maîtrise de l'IA (AI Act, art. 4)", {
    size: 9,
    color: MUTED,
  });
  page.y -= 12;
  const meta = [
    `Attestation n° ${input.certificateId}`,
    `Version ${input.curriculumLabel}`,
    ...(input.specimen ? ["Spécimen de démonstration"] : []),
  ].join("   ·   ");
  page.centerText(page.y, meta, {
    size: 8,
    color: input.specimen ? AMBER : MUTED,
    bold: Boolean(input.specimen),
  });
  page.y -= 10;
  page.line(LEFT, page.y, RIGHT, page.y);
  page.y -= gaps[0]!;

  // —— 01 ——
  page.text(LEFT, page.y, "01 — BÉNÉFICIAIRE", { size: 9, bold: true, color: BLUE });
  page.y -= 14;
  const colW = CONTENT_W / 2;
  const fieldTop = page.y;
  (
    [
      ["Nom et prénom", `${input.first} ${input.last}`.trim()],
      ["Entreprise", input.companyName],
    ] as [string, string][]
  ).forEach(([label, value], i) => {
    const x = LEFT + i * colW;
    page.text(x, fieldTop, label, { size: 8, color: MUTED });
    let yy = fieldTop - 12;
    for (const line of wrapText(value, colW - 6, 10, true)) {
      page.text(x, yy, line, { size: 10, bold: true });
      yy -= 12;
    }
  });
  page.y = fieldTop - 36;
  page.y -= gaps[1]!;

  // —— 02 ——
  page.text(LEFT, page.y, "02 — PARCOURS SUIVI", { size: 9, bold: true, color: BLUE });
  page.y -= 13;
  for (const line of introLines) {
    page.text(LEFT, page.y, line, { size: 9 });
    page.y -= 11;
  }
  page.y -= 4;
  page.text(LEFT, page.y, "Intitulé du parcours", { size: 8, color: MUTED });
  page.y -= 11;
  for (const line of courseLines) {
    page.text(LEFT, page.y, line, { size: 10, bold: true });
    page.y -= 12;
  }
  page.y -= 3;
  page.text(LEFT, page.y, "Référentiel pédagogique", { size: 8, color: MUTED });
  page.y -= 11;
  for (const line of referentielLines) {
    page.text(LEFT, page.y, line, { size: 9 });
    page.y -= 11;
  }
  page.y -= 2;
  for (const bullet of bullets) {
    const lines = wrapText(bullet, CONTENT_W - 12, 9);
    page.text(LEFT, page.y, "•", { size: 9, color: BLUE });
    lines.forEach((line, idx) => {
      page.text(LEFT + 10, page.y, line, { size: 9 });
      if (idx < lines.length - 1) page.y -= 10;
    });
    page.y -= 11;
  }
  page.y -= gaps[2]!;

  // —— 03 ——
  page.text(LEFT, page.y, "03 — VALIDATION", { size: 9, bold: true, color: BLUE });
  page.y -= 16;
  const tableH = rows.length * rowH;
  page.rect(LEFT, page.y - tableH + 10, CONTENT_W, tableH + 1, {
    stroke: LINE,
    width: 0.95,
  });
  rows.forEach(([label, value], i) => {
    const y = page.y;
    if (i % 2 === 1) page.rect(LEFT, y - 2, CONTENT_W, rowH, { fill: ROW_BG });
    if (i > 0) page.line(LEFT, y + 10, RIGHT, y + 10, LINE, 0.4);
    page.text(LEFT + 8, y, label, { size: 8.5, color: MUTED });
    page.text(LEFT + CONTENT_W / 2, y, value, { size: 8.5, bold: true });
    page.y -= rowH;
  });
  page.y -= 8;
  for (const line of durationNoteLines) {
    page.text(LEFT, page.y, line, { size: 7.5, color: MUTED });
    page.y -= 9;
  }
  page.y -= 6;
  page.text(
    LEFT,
    page.y,
    `Résultat de l'évaluation : ${input.quizScore}/100 — Réussite`,
    { size: 10, bold: true },
  );
  page.y -= 12;
  page.y -= gaps[3]!;

  // —— 04 ——
  page.text(LEFT, page.y, "04 — TRAÇABILITÉ", { size: 9, bold: true, color: BLUE });
  page.y -= 12;
  page.text(
    LEFT,
    page.y,
    "Attestation générée par LockinIA à partir des données de suivi enregistrées.",
    { size: 8.5 },
  );
  page.y -= 14;

  let ty = page.y;
  const traceItems: [string, string][] = [
    ["Identifiant unique", input.certificateId],
    ["Empreinte documentaire", input.hash],
    ["Émise le", input.issuedAtLabel],
    ["Version du parcours", input.curriculumLabel],
  ];
  for (const [label, value] of traceItems) {
    page.text(LEFT, ty, label, { size: 7.5, color: MUTED });
    ty -= 9;
    for (const line of wrapText(value, CONTENT_W - 8, 8, true)) {
      page.text(LEFT, ty, line, { size: 8, bold: true });
      ty -= 9;
    }
    ty -= 3;
  }
  page.y = ty;
  page.y -= gaps[4]!;

  // —— Pied ——
  const footerNeed =
    4 +
    issuerLines.length * 11 +
    4 +
    disclaimerLines.length * 9 +
    3 +
    10;
  if (page.y - footerNeed > endY) {
    page.y = endY + footerNeed;
  }

  page.line(LEFT, page.y, RIGHT, page.y);
  page.y -= 13;
  if (input.specimen) {
    page.text(LEFT, page.y, "Spécimen de démonstration — non opposable", {
      size: 9,
      bold: true,
      color: AMBER,
    });
    page.y -= 11;
  }
  for (const line of issuerLines) {
    page.text(LEFT, page.y, line, {
      size: line.startsWith("LockinIA") ? 9.5 : 8,
      bold: line.startsWith("LockinIA"),
      color: line.startsWith("LockinIA") ? SLATE : MUTED,
    });
    page.y -= 11;
  }
  page.y -= 2;
  for (const line of disclaimerLines) {
    page.text(LEFT, page.y, line, { size: 7.5, color: MUTED });
    page.y -= 9;
  }
  page.y -= 3;
  page.text(
    LEFT,
    page.y,
    `Référence ${input.certificateId}  ·  Document ${input.hash.slice(-8)}`,
    { size: 7.5, color: MUTED },
  );

  return assemblePdf([page.stream()]);
}

export type CompanyArticle4PdfPerson = {
  name: string;
  certificateId: string | null;
  certifiedAtLabel: string | null;
  quizScore: number | null;
  complete: boolean;
};

export type CompanyArticle4PdfInput = {
  companyName: string;
  registryId: string;
  fingerprint: string;
  version: number;
  statusComplete: boolean;
  trained: number;
  certified: number;
  total: number;
  hours: number;
  durationLabel: string;
  issuedAtLabel: string;
  utcLabel: string | null;
  firstIssuedLabel: string | null;
  /** Uniquement les collaborateurs attestés (pas toute la liste RH). */
  people: CompanyArticle4PdfPerson[];
  /** Collaborateurs encore sans attestation — compteur, pas de noms. */
  pendingCount: number;
};

/** PDF synthèse entreprise — suivi Art. 4 (multi-pages si besoin). */
export function buildCompanyArticle4Pdf(input: CompanyArticle4PdfInput): Uint8Array {
  const EMERALD = "0.024 0.463 0.341";
  const rate =
    input.total === 0 ? 0 : Math.round((input.trained / input.total) * 100);
  const streams: string[] = [];
  let page = new PageBuilder();
  let pageIndex = 1;

  const paintHeader = (p: PageBuilder, continued: boolean) => {
    p.rect(0, PAGE_H - 28, PAGE_W, 28, { fill: EMERALD });
    p.centerText(
      PAGE_H - 18,
      continued
        ? `LockinIA  ·  SYNTHÈSE DE SUIVI  ·  Suite (p.${pageIndex})`
        : "LockinIA  ·  SYNTHÈSE DE SUIVI  ·  ARTICLE 4",
      { size: 9, bold: true, color: WHITE },
    );
    p.y = PAGE_H - 52;
  };

  const newContinuedPage = () => {
    streams.push(page.stream());
    pageIndex += 1;
    page = new PageBuilder();
    paintHeader(page, true);
    page.text(LEFT, page.y, `${input.companyName} — récapitulatif (suite)`, {
      size: 10,
      bold: true,
    });
    page.y -= 16;
  };

  paintHeader(page, false);
  page.centerText(page.y, "Synthèse de suivi — Article 4", {
    size: 18,
    bold: true,
  });
  page.y -= 22;
  page.centerText(page.y, "Attestations de suivi · AI Act (article 4)", {
    size: 10,
    color: MUTED,
  });
  page.y -= 18;

  if (!input.statusComplete) {
    page.centerText(page.y, "DOCUMENT EN COURS — suivi incomplet", {
      size: 9,
      bold: true,
      color: AMBER,
    });
    page.y -= 16;
  }

  page.centerText(page.y, "Raison sociale", { size: 8, color: MUTED });
  page.y -= 14;
  page.centerText(page.y, input.companyName, { size: 16, bold: true });
  page.y -= 22;

  page.rect(LEFT, page.y - 28, CONTENT_W, 36, {
    fill: "0.925 0.973 0.953",
    stroke: EMERALD,
    width: 1,
  });
  page.centerText(page.y - 8, `${input.trained}/${input.total} collaborateurs formés · ${rate} %`, {
    size: 11,
    bold: true,
    color: EMERALD,
  });
  page.centerText(
    page.y - 22,
    `${input.hours} h de formation · ${input.certified} attestation${input.certified > 1 ? "s" : ""} émise${input.certified > 1 ? "s" : ""}`,
    { size: 9, color: MUTED },
  );
  page.y -= 48;

  const meta: [string, string][] = [
    ["Identifiant suivi", input.registryId],
    ["Empreinte", input.fingerprint],
    ["Version document", `v${Math.max(1, input.version)}`],
    [
      "Périmètre",
      "Usage des IA génératives, protection des données et cadre EU AI Act (article 4).",
    ],
    [
      "Volume d'heures",
      `${input.hours} h — ${input.durationLabel} par collaborateur au parcours validé (100 %).`,
    ],
    ["Émis / exporté le", input.issuedAtLabel],
  ];
  if (input.utcLabel) meta.push(["Horodatage UTC", input.utcLabel]);
  if (input.firstIssuedLabel) {
    meta.push(["Première complétion", input.firstIssuedLabel]);
  }

  for (const [label, value] of meta) {
    if (!page.ensure(40)) newContinuedPage();
    page.text(LEFT, page.y, label.toUpperCase(), { size: 7.5, color: MUTED });
    page.y -= 11;
    for (const line of wrapText(value, CONTENT_W, 9.5)) {
      if (!page.ensure(14)) newContinuedPage();
      page.text(LEFT, page.y, line, { size: 9.5 });
      page.y -= 12;
    }
    page.y -= 4;
  }

  page.y -= 4;
  if (!page.ensure(50)) newContinuedPage();
  page.line(LEFT, page.y, RIGHT, page.y);
  page.y -= 16;
  page.text(LEFT, page.y, "Attestations émises (nominatif)", {
    size: 11,
    bold: true,
  });
  page.y -= 12;
  page.text(
    LEFT,
    page.y,
    "Liste des collaborateurs ayant une attestation de suivi. Les parcours en cours figurent uniquement en compteur.",
    { size: 8, color: MUTED },
  );
  page.y -= 14;

  if (input.people.length === 0) {
    page.text(LEFT, page.y, "Aucune attestation émise pour le moment.", {
      size: 9,
      color: MUTED,
    });
    page.y -= 12;
  } else {
    for (const person of input.people) {
      if (!page.ensure(36)) newContinuedPage();
      const when = person.certifiedAtLabel ?? "—";
      const score =
        person.quizScore != null ? `Score ${person.quizScore}` : "Score —";
      page.text(LEFT, page.y, person.name, { size: 9.5, bold: true });
      page.y -= 11;
      page.text(
        LEFT,
        page.y,
        `Attestation ${person.certificateId ?? "—"}  ·  ${when}  ·  ${score}`,
        { size: 8, color: MUTED },
      );
      page.y -= 14;
    }
  }

  if (input.pendingCount > 0) {
    if (!page.ensure(28)) newContinuedPage();
    page.text(
      LEFT,
      page.y,
      `${input.pendingCount} collaborateur${input.pendingCount > 1 ? "s" : ""} encore sans attestation (non listé${input.pendingCount > 1 ? "s" : ""} ici).`,
      { size: 9, color: AMBER },
    );
    page.y -= 12;
  }

  if (!page.ensure(70)) newContinuedPage();
  page.y = Math.min(page.y, MARGIN_BOTTOM + 70);
  page.line(LEFT, page.y, RIGHT, page.y);
  page.y -= 12;
  const disclaimer = [
    "Document émis par LockinIA et conservé dans le suivi des parcours.",
    "Il consigne les attestations de suivi des collaborateurs.",
    "Il ne certifie pas l'entreprise et ne constitue pas un conseil juridique.",
    `Réf. ${input.registryId} · v${Math.max(1, input.version)} · ${input.fingerprint.slice(-8)}`,
  ];
  for (const line of disclaimer) {
    page.text(LEFT, page.y, line, { size: 7.5, color: MUTED });
    page.y -= 9;
  }

  streams.push(page.stream());
  return assemblePdf(streams);
}
