"""Plaquette commerciale LockinIA — offre partenaires OF (1 page A4 paysage)."""

from pathlib import Path

from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

OUT = Path(__file__).with_name("LockinIA-Offre-Partenaires-OF.pdf")

BG = (0.043, 0.071, 0.125)
CARD = (0.067, 0.094, 0.153)
BLUE_DK = (0.118, 0.227, 0.541)
ICE = (0.576, 0.773, 0.992)
WHITE = (1, 1, 1)
MUTED = (0.850, 0.880, 0.920)
SLATE = (0.640, 0.700, 0.780)
GREEN = (0.204, 0.827, 0.600)
ROW_A = (0.059, 0.090, 0.165)
ROW_B = (0.100, 0.140, 0.220)
SITE = "www.lockin-ia.fr"
EMAIL = "contact@lockin-web.online"


def set_fill(c, rgb):
    c.setFillColorRGB(*rgb)


def rounded_rect(c, x, y, w, h, r, fill):
    set_fill(c, fill)
    c.setStrokeColorRGB(*fill)
    c.roundRect(x, y, w, h, r, fill=1, stroke=0)


def draw():
    W, H = landscape(A4)
    c = canvas.Canvas(str(OUT), pagesize=landscape(A4))
    c.setTitle("LockinIA — Tarifs & modalités de partenariat")
    c.setAuthor("LockinIA / FITOPS AI")

    set_fill(c, BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    c.saveState()
    c.setFillColorRGB(0.114, 0.306, 0.847, alpha=0.18)
    c.circle(35 * mm, H - 18 * mm, 60 * mm, fill=1, stroke=0)
    c.setFillColorRGB(0.055, 0.647, 0.914, alpha=0.12)
    c.circle(W - 15 * mm, 22 * mm, 55 * mm, fill=1, stroke=0)
    c.restoreState()

    m = 7 * mm

    # Brand row
    set_fill(c, WHITE)
    c.setFont("Helvetica-Bold", 30)
    c.drawString(m, H - 13 * mm, "LockinIA")
    set_fill(c, ICE)
    c.setFont("Helvetica", 14)
    c.drawString(m + 46 * mm, H - 12.5 * mm, "Formation IA  ·  Organismes de formation")

    # Site pill top-right
    site_w = 48 * mm
    site_h = 10 * mm
    site_x = W - m - site_w
    site_y = H - 16 * mm
    rounded_rect(c, site_x, site_y, site_w, site_h, 2.5 * mm, BLUE_DK)
    set_fill(c, WHITE)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(site_x + site_w / 2, site_y + 3.2 * mm, SITE)

    set_fill(c, MUTED)
    c.setFont("Helvetica", 11)
    c.drawRightString(W - m, H - 21 * mm, EMAIL)

    set_fill(c, WHITE)
    c.setFont("Helvetica-Bold", 32)
    c.drawString(m, H - 34 * mm, "Tarifs & modalités de partenariat")
    set_fill(c, MUTED)
    c.setFont("Helvetica", 14)
    c.drawString(
        m,
        H - 42 * mm,
        "Intégrez LockinIA à votre catalogue ou déployez-le en marque blanche. Prix HT / apprenant selon le volume commandé.",
    )

    content_top = H - 47 * mm
    footer_h = 26 * mm
    footer_y = 5 * mm
    content_bottom = footer_y + footer_h + 3.5 * mm
    content_h = content_top - content_bottom

    # Left pricing — wider
    card_x = m
    card_w = 145 * mm
    card_y = content_bottom
    card_h = content_h
    rounded_rect(c, card_x, card_y, card_w, card_h, 4.5 * mm, CARD)

    set_fill(c, ICE)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(card_x + 7 * mm, card_y + card_h - 10 * mm, "GRILLE TARIFAIRE")
    set_fill(c, WHITE)
    c.setFont("Helvetica", 15)
    c.drawString(
        card_x + 7 * mm,
        card_y + card_h - 19 * mm,
        "Volume commandé  →  prix HT / apprenant",
    )

    th_h = 13 * mm
    th_y = card_y + card_h - 34 * mm
    rounded_rect(c, card_x + 5 * mm, th_y, card_w - 10 * mm, th_h, 2.5 * mm, BLUE_DK)
    set_fill(c, WHITE)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(card_x + 10 * mm, th_y + 4.2 * mm, "Offre")
    c.drawString(card_x + 55 * mm, th_y + 4.2 * mm, "Volume")
    c.drawRightString(card_x + card_w - 10 * mm, th_y + 4.2 * mm, "Prix HT")

    tiers = [
        ("Découverte", "1 à 19 apprenants", "35 €"),
        ("Essentielle", "20 à 49 apprenants", "30 €"),
        ("Partenaire", "50 à 149 apprenants", "24 €"),
        ("Volume", "150 à 499 apprenants", "19 €"),
        ("Grand compte", "500 et +", "Sur devis"),
    ]

    rows_top = th_y - 2 * mm
    rows_bottom = card_y + 5 * mm
    row_h = (rows_top - rows_bottom) / len(tiers)

    for i, (offer, vol, price) in enumerate(tiers):
        y = rows_top - (i + 1) * row_h
        rounded_rect(
            c,
            card_x + 5 * mm,
            y + 1.2 * mm,
            card_w - 10 * mm,
            row_h - 2.4 * mm,
            2.2 * mm,
            ROW_A if i % 2 == 0 else ROW_B,
        )
        text_y = y + row_h * 0.34
        set_fill(c, WHITE)
        c.setFont("Helvetica-Bold", 17)
        c.drawString(card_x + 10 * mm, text_y, offer)
        set_fill(c, SLATE)
        c.setFont("Helvetica", 15)
        c.drawString(card_x + 55 * mm, text_y, vol)
        set_fill(c, ICE if price == "Sur devis" else WHITE)
        c.setFont("Helvetica-Bold", 20)
        c.drawRightString(card_x + card_w - 10 * mm, text_y, price)

    # Right modalities
    gap = 4.5 * mm
    mx = card_x + card_w + gap
    mw = W - m - mx
    card_gap = 4 * mm
    c_h = (content_h - card_gap) / 2

    def modality_card(y, label_color, label, title, bullets):
        rounded_rect(c, mx, y, mw, c_h, 4.5 * mm, CARD)
        set_fill(c, label_color)
        c.setFont("Helvetica-Bold", 13)
        c.drawString(mx + 6 * mm, y + c_h - 11 * mm, label)
        set_fill(c, WHITE)
        c.setFont("Helvetica-Bold", 19)
        c.drawString(mx + 6 * mm, y + c_h - 23 * mm, title)

        set_fill(c, MUTED)
        c.setFont("Helvetica", 15)
        line_gap = 9 * mm
        by = y + c_h - 37 * mm
        for line in bullets:
            c.drawString(mx + 6 * mm, by, "•  " + line)
            by -= line_gap

    modality_card(
        content_bottom + c_h + card_gap,
        GREEN,
        "1  ·  INTÉGRATION CATALOGUE",
        "Co-branding inclus",
        [
            "Ajoutez LockinIA à votre catalogue (nom + logo).",
            "Espace partenaire : clients, quotas et suivi.",
            "Licence de commercialisation (sans transfert de PI).",
            "Installation et mise en place incluses.",
        ],
    )
    modality_card(
        content_bottom,
        ICE,
        "2  ·  MARQUE BLANCHE",
        "Option one-shot — 500 € HT",
        [
            "Plateforme à votre image : couleurs, pages, charte.",
            "Vos clients voient votre marque (hébergement LockinIA).",
            "Données isolées par client — CGU, CGV et DPA.",
            "Idéal pour un catalogue 100 % white-label.",
        ],
    )

    # Footer
    rounded_rect(c, m, footer_y, W - 2 * m, footer_h, 3.5 * mm, BLUE_DK)
    set_fill(c, ICE)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(m + 5 * mm, footer_y + 17.5 * mm, "INCLUS DANS LE PARTENARIAT")
    set_fill(c, WHITE)
    c.setFont("Helvetica", 13)
    c.drawString(
        m + 5 * mm,
        footer_y + 10 * mm,
        "Installation  ·  Co-branding (logo + nom OF)  ·  Espace partenaire  ·  Attestations & preuves  ·  Parcours IA à jour",
    )
    set_fill(c, ICE)
    c.setFont("Helvetica", 11.5)
    c.drawString(
        m + 5 * mm,
        footer_y + 3.2 * mm,
        "TVA non applicable — art. 293 B du CGI   ·   Devis au-delà de 500 accès",
    )

    set_fill(c, WHITE)
    c.setFont("Helvetica-Bold", 15)
    c.drawRightString(W - m - 5 * mm, footer_y + 15 * mm, "Réponse sous 24 h")
    set_fill(c, ICE)
    c.setFont("Helvetica-Bold", 14)
    c.drawRightString(W - m - 5 * mm, footer_y + 5 * mm, SITE)

    c.showPage()
    c.save()
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    draw()
