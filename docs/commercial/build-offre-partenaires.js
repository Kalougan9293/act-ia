const PptxGenJS = require("pptxgenjs");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const outDir = __dirname;
const pptxPath = path.join(outDir, "LockinIA-Offre-Partenaires-OF.pptx");

async function main() {
  const pres = new PptxGenJS();
  pres.defineLayout({ name: "A4L", width: 11.69, height: 8.27 });
  pres.layout = "A4L";
  pres.author = "LockinIA";
  pres.title = "LockinIA — Offre partenaires OF";
  pres.subject = "Tarifs et modalités de partenariat";

  const slide = pres.addSlide();
  slide.background = { color: "0B1220" };

  // Soft glow accents
  slide.addShape(pres.shapes.OVAL, {
    x: -1.2,
    y: -1.4,
    w: 4.2,
    h: 4.2,
    fill: { color: "1D4ED8", transparency: 78 },
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 8.8,
    y: 5.2,
    w: 4,
    h: 4,
    fill: { color: "0EA5E9", transparency: 82 },
  });

  // Header
  slide.addText("LockinIA", {
    x: 0.45,
    y: 0.28,
    w: 3.2,
    h: 0.38,
    fontFace: "Arial",
    fontSize: 22,
    bold: true,
    color: "FFFFFF",
    margin: 0,
    isTextBox: true,
  });
  slide.addText("Formation IA · Organismes de formation", {
    x: 0.45,
    y: 0.64,
    w: 5.5,
    h: 0.28,
    fontFace: "Arial",
    fontSize: 11,
    color: "93C5FD",
    margin: 0,
    isTextBox: true,
  });
  slide.addText("contact@lockin-web.online", {
    x: 7.2,
    y: 0.35,
    w: 4,
    h: 0.28,
    fontFace: "Arial",
    fontSize: 11,
    color: "BFDBFE",
    align: "right",
    margin: 0,
    isTextBox: true,
  });
  slide.addText("lockin-web.online", {
    x: 7.2,
    y: 0.62,
    w: 4,
    h: 0.24,
    fontFace: "Arial",
    fontSize: 10,
    color: "64748B",
    align: "right",
    margin: 0,
    isTextBox: true,
  });

  slide.addText("Tarifs & modalités de partenariat", {
    x: 0.45,
    y: 1.05,
    w: 10.8,
    h: 0.42,
    fontFace: "Arial",
    fontSize: 26,
    bold: true,
    color: "FFFFFF",
    margin: 0,
    isTextBox: true,
  });
  slide.addText(
    "Intégrez LockinIA à votre catalogue ou déployez-le en marque blanche. Prix HT / apprenant selon le volume commandé.",
    {
      x: 0.45,
      y: 1.48,
      w: 10.8,
      h: 0.36,
      fontFace: "Arial",
      fontSize: 12,
      color: "CBD5E1",
      margin: 0,
      isTextBox: true,
    }
  );

  // Pricing card
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.4,
    y: 2.0,
    w: 5.55,
    h: 4.55,
    fill: { color: "111827" },
    rectRadius: 0.12,
    shadow: { type: "outer", color: "000000", blur: 18, offset: 4, opacity: 0.35 },
  });

  slide.addText("GRILLE TARIFAIRE", {
    x: 0.65,
    y: 2.18,
    w: 5,
    h: 0.26,
    fontFace: "Arial",
    fontSize: 10,
    bold: true,
    color: "60A5FA",
    charSpacing: 2,
    margin: 0,
    isTextBox: true,
  });
  slide.addText("Volume commandé → prix HT / apprenant", {
    x: 0.65,
    y: 2.44,
    w: 5,
    h: 0.26,
    fontFace: "Arial",
    fontSize: 12,
    color: "E2E8F0",
    margin: 0,
    isTextBox: true,
  });

  const tiers = [
    ["Découverte", "1 à 19", "35 €"],
    ["Essentielle", "20 à 49", "30 €"],
    ["Partenaire", "50 à 149", "24 €"],
    ["Volume", "150 à 499", "19 €"],
    ["Grand compte", "500 et +", "Sur devis"],
  ];

  // Table header
  const tableY = 2.85;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.65,
    y: tableY,
    w: 5.05,
    h: 0.36,
    fill: { color: "1E3A8A" },
    rectRadius: 0.06,
  });
  slide.addText(
    [
      { text: "Offre", options: { bold: true } },
      { text: "          Volume", options: { bold: true } },
      { text: "                    Prix HT", options: { bold: true } },
    ],
    {
      x: 0.8,
      y: tableY + 0.05,
      w: 4.8,
      h: 0.28,
      fontFace: "Arial",
      fontSize: 11,
      color: "FFFFFF",
      margin: 0,
      isTextBox: true,
    }
  );

  tiers.forEach((row, i) => {
    const y = 3.3 + i * 0.52;
    const bg = i % 2 === 0 ? "0F172A" : "162033";
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.65,
      y,
      w: 5.05,
      h: 0.46,
      fill: { color: bg },
      rectRadius: 0.05,
    });
    slide.addText(row[0], {
      x: 0.8,
      y: y + 0.08,
      w: 1.7,
      h: 0.3,
      fontFace: "Arial",
      fontSize: 12,
      bold: true,
      color: "F8FAFC",
      margin: 0,
      isTextBox: true,
    });
    slide.addText(row[1] + " apprenants", {
      x: 2.5,
      y: y + 0.08,
      w: 1.7,
      h: 0.3,
      fontFace: "Arial",
      fontSize: 11,
      color: "94A3B8",
      margin: 0,
      isTextBox: true,
    });
    slide.addText(row[2], {
      x: 4.25,
      y: y + 0.08,
      w: 1.3,
      h: 0.3,
      fontFace: "Arial",
      fontSize: 14,
      bold: true,
      color: row[2] === "Sur devis" ? "93C5FD" : "FFFFFF",
      align: "right",
      margin: 0,
      isTextBox: true,
    });
  });

  // Modalities column
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.15,
    y: 2.0,
    w: 5.1,
    h: 2.15,
    fill: { color: "111827" },
    rectRadius: 0.12,
    shadow: { type: "outer", color: "000000", blur: 18, offset: 4, opacity: 0.35 },
  });
  slide.addText("1 · INTÉGRATION CATALOGUE", {
    x: 6.4,
    y: 2.18,
    w: 4.6,
    h: 0.26,
    fontFace: "Arial",
    fontSize: 10,
    bold: true,
    color: "34D399",
    charSpacing: 1.5,
    margin: 0,
    isTextBox: true,
  });
  slide.addText("Co-branding inclus", {
    x: 6.4,
    y: 2.48,
    w: 4.6,
    h: 0.28,
    fontFace: "Arial",
    fontSize: 15,
    bold: true,
    color: "FFFFFF",
    margin: 0,
    isTextBox: true,
  });
  slide.addText(
    [
      {
        text: "Ajoutez LockinIA à votre offre sous votre nom et logo.",
        options: { breakLine: true },
      },
      {
        text: "Espace partenaire dédié : entreprises clientes, quotas, suivi.",
        options: { breakLine: true },
      },
      {
        text: "Licence de commercialisation (sans transfert de propriété).",
        options: { breakLine: true },
      },
      { text: "Installation & mise en place incluses." },
    ],
    {
      x: 6.4,
      y: 2.85,
      w: 4.6,
      h: 1.15,
      fontFace: "Arial",
      fontSize: 11,
      color: "CBD5E1",
      paraSpaceAfter: 4,
      margin: 0,
      isTextBox: true,
    }
  );

  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.15,
    y: 4.35,
    w: 5.1,
    h: 2.2,
    fill: { color: "111827" },
    rectRadius: 0.12,
    shadow: { type: "outer", color: "000000", blur: 18, offset: 4, opacity: 0.35 },
  });
  slide.addText("2 · MARQUE BLANCHE", {
    x: 6.4,
    y: 4.53,
    w: 4.6,
    h: 0.26,
    fontFace: "Arial",
    fontSize: 10,
    bold: true,
    color: "60A5FA",
    charSpacing: 1.5,
    margin: 0,
    isTextBox: true,
  });
  slide.addText("Option one-shot — 500 € HT", {
    x: 6.4,
    y: 4.83,
    w: 4.6,
    h: 0.28,
    fontFace: "Arial",
    fontSize: 15,
    bold: true,
    color: "FFFFFF",
    margin: 0,
    isTextBox: true,
  });
  slide.addText(
    [
      {
        text: "Plateforme à votre image : couleurs, pages, charte.",
        options: { breakLine: true },
      },
      {
        text: "Vos clients voient votre marque ; hébergement LockinIA.",
        options: { breakLine: true },
      },
      {
        text: "Données isolées par client. Cadre : CGU, CGV et DPA.",
        options: { breakLine: true },
      },
      { text: "Idéal pour un déploiement catalogue 100 % white-label." },
    ],
    {
      x: 6.4,
      y: 5.2,
      w: 4.6,
      h: 1.15,
      fontFace: "Arial",
      fontSize: 11,
      color: "CBD5E1",
      paraSpaceAfter: 4,
      margin: 0,
      isTextBox: true,
    }
  );

  // Footer strip
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.4,
    y: 6.75,
    w: 10.85,
    h: 1.15,
    fill: { color: "1E3A8A" },
    rectRadius: 0.1,
  });
  slide.addText("Inclus dans le partenariat", {
    x: 0.65,
    y: 6.9,
    w: 4,
    h: 0.25,
    fontFace: "Arial",
    fontSize: 11,
    bold: true,
    color: "BFDBFE",
    margin: 0,
    isTextBox: true,
  });
  slide.addText(
    "Installation  ·  Co-branding (logo + nom OF)  ·  Espace partenaire  ·  Attestations & preuves  ·  Parcours IA à jour",
    {
      x: 0.65,
      y: 7.18,
      w: 7.2,
      h: 0.28,
      fontFace: "Arial",
      fontSize: 11,
      color: "FFFFFF",
      margin: 0,
      isTextBox: true,
    }
  );
  slide.addText("TVA non applicable — art. 293 B du CGI  ·  Devis sur demande au-delà de 500 accès", {
    x: 0.65,
    y: 7.48,
    w: 7.2,
    h: 0.24,
    fontFace: "Arial",
    fontSize: 10,
    color: "93C5FD",
    margin: 0,
    isTextBox: true,
  });
  slide.addText("Réponse sous 24 h", {
    x: 8.2,
    y: 7.05,
    w: 2.7,
    h: 0.28,
    fontFace: "Arial",
    fontSize: 12,
    bold: true,
    color: "FFFFFF",
    align: "right",
    margin: 0,
    isTextBox: true,
  });
  slide.addText("contact@lockin-web.online", {
    x: 8.2,
    y: 7.35,
    w: 2.7,
    h: 0.28,
    fontFace: "Arial",
    fontSize: 11,
    color: "BFDBFE",
    align: "right",
    margin: 0,
    isTextBox: true,
  });

  await pres.writeFile({ fileName: pptxPath });
  console.log("Wrote", pptxPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
