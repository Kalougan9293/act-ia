"""Convertit exports/lockinia-projet-complet.txt en PDF."""
from pathlib import Path

from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

ROOT = Path(__file__).resolve().parents[1]
TXT = ROOT / "exports" / "lockinia-projet-complet.txt"
PDF = ROOT / "exports" / "lockinia-projet-complet.pdf"

pdfmetrics.registerFont(TTFont("ArialFR", r"C:\Windows\Fonts\arial.ttf"))
pdfmetrics.registerFont(TTFont("ArialFR-Bold", r"C:\Windows\Fonts\arialbd.ttf"))


def esc(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\t", "    ")
    )


def main() -> None:
    raw = TXT.read_text(encoding="utf-8")
    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "TitleFR",
        parent=styles["Title"],
        fontName="ArialFR-Bold",
        fontSize=14,
        leading=18,
        alignment=TA_CENTER,
        spaceAfter=10,
    )
    h1 = ParagraphStyle(
        "H1FR",
        parent=styles["Heading1"],
        fontName="ArialFR-Bold",
        fontSize=12,
        leading=16,
        spaceBefore=14,
        spaceAfter=6,
    )
    h2 = ParagraphStyle(
        "H2FR",
        parent=styles["Heading2"],
        fontName="ArialFR-Bold",
        fontSize=10.5,
        leading=14,
        spaceBefore=10,
        spaceAfter=4,
    )
    body = ParagraphStyle(
        "BodyFR",
        parent=styles["Normal"],
        fontName="ArialFR",
        fontSize=9,
        leading=12,
        alignment=TA_JUSTIFY,
        spaceAfter=2,
    )
    mono = ParagraphStyle(
        "MonoFR",
        parent=body,
        fontName="ArialFR",
        fontSize=8.5,
        leading=11,
        alignment=TA_LEFT,
        leftIndent=8,
    )

    doc = SimpleDocTemplate(
        str(PDF),
        pagesize=A4,
        leftMargin=1.6 * cm,
        rightMargin=1.6 * cm,
        topMargin=1.4 * cm,
        bottomMargin=1.4 * cm,
        title="LockinIA — Résumé projet complet",
        author="LockinIA",
    )

    story = []
    for i, line in enumerate(raw.splitlines()):
        s = line.rstrip()
        if not s:
            story.append(Spacer(1, 4))
            continue
        if i == 0 or s.startswith("LockinIA") or s.startswith("LOCKINIA"):
            story.append(Paragraph(esc(s), title))
            continue
        if (
            s.startswith("####")
            or s.startswith("PARTIE ")
            or (s.startswith("BLOC ") and "—" in s)
            or s.startswith("PRÉBLOC")
            or s.startswith("EXAMEN")
            or s.startswith("LES 7")
            or s.startswith("FAISONS CONNAISSANCE")
            or s.startswith("PARCOURS MÉTIERS")
        ):
            if s.startswith("####"):
                continue
            story.append(Paragraph(esc(s), h1))
            continue
        if s.startswith("----") or (len(s) > 3 and s[0].isdigit() and " · " in s):
            if s.startswith("----"):
                continue
            story.append(Paragraph(esc(s), h2))
            continue
        if (
            s.startswith("HERO")
            or s.startswith("PROBLÈMES")
            or s.startswith("CONFIANCE")
            or s.startswith("FONCTIONNALITÉS")
            or s.startswith("TARIFS")
            or s.startswith("OPTIONS")
            or s.startswith("FAQ")
        ):
            story.append(Paragraph(esc(s), h2))
            continue
        if s.startswith("   ") or s.startswith("  •") or s.startswith("  →") or s.startswith("     →") or s.startswith("  -"):
            story.append(Paragraph(esc(s), mono))
        else:
            story.append(Paragraph(esc(s), body))

    doc.build(story)
    print(f"OK PDF: {PDF} ({PDF.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
