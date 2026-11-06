#!/usr/bin/env python3
"""PDF de revue : plateforme LockinIA (hors parcours apprenant, hors super-admin)."""

from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

ROOT = Path(__file__).resolve().parent
JSON_PATH = ROOT / "plateforme-contenu.json"
OUT_PATH = ROOT / "LockinIA-Plateforme-Espaces-Revue.pdf"

FONT = "Helvetica"
FONT_B = "Helvetica-Bold"
for candidate in (r"C:\Windows\Fonts\arial.ttf", r"C:\Windows\Fonts\calibri.ttf"):
    if os.path.exists(candidate):
        pdfmetrics.registerFont(TTFont("Body", candidate))
        bold = candidate.replace("arial.ttf", "arialbd.ttf").replace(
            "calibri.ttf", "calibrib.ttf"
        )
        if os.path.exists(bold):
            pdfmetrics.registerFont(TTFont("BodyBold", bold))
            FONT, FONT_B = "Body", "BodyBold"
        else:
            FONT = FONT_B = "Body"
        break

BLUE = colors.HexColor("#1d4ed8")
SLATE = colors.HexColor("#334155")


def esc(text: object) -> str:
    if text is None:
        return ""
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\n", "<br/>")
    )


def styles():
    base = getSampleStyleSheet()
    return {
        "cover": ParagraphStyle(
            "cover",
            parent=base["Title"],
            fontName=FONT_B,
            fontSize=20,
            leading=26,
            textColor=BLUE,
            alignment=TA_CENTER,
            spaceAfter=10,
        ),
        "sub": ParagraphStyle(
            "sub",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=10.5,
            leading=15,
            textColor=SLATE,
            alignment=TA_CENTER,
            spaceAfter=6,
        ),
        "h1": ParagraphStyle(
            "h1",
            parent=base["Heading1"],
            fontName=FONT_B,
            fontSize=15,
            leading=19,
            textColor=BLUE,
            spaceBefore=6,
            spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName=FONT_B,
            fontSize=12,
            leading=15,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=8,
            spaceAfter=4,
        ),
        "h3": ParagraphStyle(
            "h3",
            parent=base["Heading3"],
            fontName=FONT_B,
            fontSize=10.5,
            leading=13,
            textColor=colors.HexColor("#1e293b"),
            spaceBefore=6,
            spaceAfter=3,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=9.2,
            leading=12.5,
            textColor=SLATE,
            alignment=TA_JUSTIFY,
            spaceAfter=3,
        ),
        "meta": ParagraphStyle(
            "meta",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=8.2,
            leading=11,
            textColor=colors.HexColor("#64748b"),
            spaceAfter=3,
        ),
        "label": ParagraphStyle(
            "label",
            parent=base["Normal"],
            fontName=FONT_B,
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=3,
            spaceAfter=2,
        ),
        "bullet": ParagraphStyle(
            "bullet",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=9,
            leading=12,
            textColor=SLATE,
            leftIndent=6,
            spaceAfter=1,
        ),
        "toc": ParagraphStyle(
            "toc",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=10,
            leading=14,
            textColor=SLATE,
            spaceAfter=2,
        ),
    }


def P(S, key, text):
    return Paragraph(esc(text), S[key])


def bullets(S, items):
    return [P(S, "bullet", f"• {item}") for item in items]


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont(FONT, 8)
    canvas.setFillColor(colors.HexColor("#94a3b8"))
    canvas.drawString(
        1.8 * cm, 1.1 * cm, "LockinIA — Revue plateforme (hors parcours) — Confidentiel"
    )
    canvas.drawRightString(A4[0] - 1.8 * cm, 1.1 * cm, f"Page {doc.page}")
    canvas.restoreState()


def main():
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    S = styles()
    story = []
    meta = data["meta"]

    story.append(Spacer(1, 2 * cm))
    story.append(P(S, "cover", meta["title"]))
    story.append(P(S, "sub", meta["purpose"]))
    story.append(Spacer(1, 0.4 * cm))
    story.append(P(S, "sub", meta["promise"]))
    story.append(
        P(
            S,
            "sub",
            f"Généré le {datetime.fromisoformat(meta['generatedAt'].replace('Z','+00:00')).strftime('%d/%m/%Y %H:%M')} UTC",
        )
    )
    story.append(P(S, "label", "Exclu de ce document"))
    story.extend(bullets(S, meta["excluded"]))
    story.append(PageBreak())

    story.append(P(S, "h1", "Sommaire"))
    for line in [
        "1. Carte des routes",
        "2. Page d'accueil & prise de rendez-vous",
        "3. Tarifs & accompagnement",
        "4. FAQ publique",
        "5. Fiche programme (cadre, hors contenu pédagogique détaillé)",
        "6. Authentification & invitations",
        "7. Espace RH",
        "8. Espace partenaire",
        "9. Démo publique",
        "10. Isolation des données & rôles",
        "11. Pages légales & AI Act (texte extrait)",
    ]:
        story.append(P(S, "toc", line))
    story.append(PageBreak())

    # 1 Routes
    story.append(P(S, "h1", "1. Carte des routes"))
    for r in data["routes"]:
        story.append(
            P(
                S,
                "body",
                f"• {r['path']} — {r['label']} (auth: {r['auth']}, rôle: {r['role']})",
            )
        )
    story.append(PageBreak())

    # 2 Landing
    story.append(P(S, "h1", "2. Page d'accueil & prise de rendez-vous"))
    land = data["landing"]
    story.append(P(S, "h2", "Hero"))
    story.append(P(S, "body", f"Badge : {land['hero']['badge']}"))
    story.append(P(S, "body", land["hero"]["h1"]))
    story.append(P(S, "label", "CTA"))
    story.extend(bullets(S, land["hero"]["ctas"]))
    story.append(P(S, "label", "Bandeau de confiance"))
    story.extend(bullets(S, land["trust"]))
    story.append(P(S, "label", "Sections"))
    story.extend(bullets(S, land["sections"]))
    b = land["booking"]
    story.append(P(S, "h2", "Prise de rendez-vous (modale)"))
    story.append(P(S, "body", f"Destinataire : {b['to']}"))
    story.append(P(S, "body", f"Règles créneaux : {b['rules']}"))
    story.append(P(S, "body", b["note"]))
    story.append(P(S, "label", "Champs"))
    story.extend(bullets(S, b["fields"]))
    story.append(P(S, "label", "Objets proposés"))
    story.extend(bullets(S, [f"{i['value']} — {i['label']}" for i in b["interests"]]))
    story.append(PageBreak())

    # 3 Pricing
    story.append(P(S, "h1", "3. Tarifs & accompagnement"))
    for plan in data["pricing"]["plans"]:
        story.append(P(S, "h2", f"{plan['name']} — {plan['price']} ({plan['seats']})"))
        story.extend(bullets(S, plan["features"]))
    story.append(P(S, "h2", "Options"))
    for opt in data["pricing"]["options"]:
        story.append(P(S, "body", f"• {opt['name']} — {opt['price']}"))
        story.append(P(S, "meta", opt["detail"]))
    inter = data["interventions"]
    story.append(P(S, "h2", inter["title"]))
    story.append(P(S, "body", inter["pitch"]))
    story.extend(bullets(S, inter["offerings"]))
    story.append(P(S, "label", "CTA"))
    story.extend(bullets(S, inter["ctas"]))
    story.append(PageBreak())

    # 4 FAQ
    story.append(P(S, "h1", "4. FAQ publique"))
    for faq in data["faq"]:
        story.append(
            KeepTogether(
                [
                    P(S, "h3", faq["question"]),
                    P(S, "body", faq["answer"]),
                ]
            )
        )
    story.append(PageBreak())

    # 5 Programme
    story.append(P(S, "h1", "5. Fiche programme (cadre)"))
    story.append(
        P(
            S,
            "meta",
            "Synthèse de /programme — le détail pédagogique des chapitres est dans l'autre PDF.",
        )
    )
    prog = data["programme"]
    story.append(P(S, "body", f"Intitulé : {prog.get('intitule')}"))
    story.append(P(S, "body", f"Modalité : {prog.get('modalite')}"))
    story.append(P(S, "body", f"Organisme : {prog.get('organisme')}"))
    story.append(P(S, "body", f"Qualiopi : {prog.get('statutQualiopi')}"))
    story.append(P(S, "body", f"Public : {prog.get('public')}"))
    story.append(P(S, "body", f"Durée : {prog.get('duree')} — {prog.get('dureeDetail')}"))
    story.append(P(S, "label", "Objectifs"))
    for obj in prog.get("objectifs") or []:
        story.append(P(S, "body", f"• {obj.get('label')} — {obj.get('evaluable')}"))
    story.append(P(S, "label", "Prérequis"))
    story.extend(bullets(S, prog.get("prerequis") or []))
    story.append(P(S, "label", "Méthodes"))
    story.extend(bullets(S, prog.get("methodes") or []))
    story.append(P(S, "label", "Évaluation"))
    story.extend(bullets(S, prog.get("evaluation") or []))
    story.append(P(S, "label", "Accessibilité"))
    story.extend(bullets(S, prog.get("accessibilite") or []))
    story.append(P(S, "label", "Tarifs (fiche)"))
    story.extend(bullets(S, prog.get("tarifs") or []))
    story.append(P(S, "label", "Financements"))
    story.extend(bullets(S, prog.get("financements") or []))
    story.append(P(S, "label", "Déroulement"))
    for step in prog.get("deroule") or []:
        story.append(
            P(
                S,
                "body",
                f"• {step.get('etape')} ({step.get('duree')}) — {step.get('detail')}",
            )
        )
    asst = data["assistance"]
    story.append(P(S, "h2", "Assistance"))
    story.append(
        P(
            S,
            "body",
            f"Pédagogique / technique : {asst['referentPedagogique']['name']} — "
            f"{asst['email']} — {asst['phone']} — {asst['responseDelay']}",
        )
    )
    story.append(PageBreak())

    # 6 Auth
    story.append(P(S, "h1", "6. Authentification & invitations"))
    auth = data["auth"]
    story.append(P(S, "label", "Modes"))
    story.extend(bullets(S, auth["modes"]))
    story.append(P(S, "label", "Règles mot de passe"))
    story.extend(bullets(S, auth["passwordRules"]))
    story.append(P(S, "label", "Redirections après login"))
    for k, v in auth["redirects"].items():
        if k != "note":
            story.append(P(S, "body", f"• {k} → {v}"))
    story.append(P(S, "meta", auth["redirects"]["note"]))
    story.append(P(S, "h2", "Lien structure /rejoindre"))
    story.append(P(S, "body", auth["joinFlow"]["description"]))
    story.append(P(S, "h2", "Invitation /invitation"))
    story.append(P(S, "body", auth["inviteFlow"]["description"]))
    story.append(PageBreak())

    # 7 RH
    story.append(P(S, "h1", "7. Espace RH"))
    rh = data["rh"]
    story.append(P(S, "body", f"Route : {rh['route']} — {rh['title']}"))
    story.append(P(S, "label", "KPI"))
    story.extend(bullets(S, rh["kpis"]))
    story.append(P(S, "label", "Colonnes du tableau"))
    story.extend(bullets(S, rh["tableColumns"]))
    story.append(P(S, "label", "Actions disponibles"))
    story.extend(bullets(S, rh["actions"]))
    story.append(P(S, "label", "Règle des sièges"))
    story.append(P(S, "body", rh["seatsRule"]))
    cm_ = rh["companyModule"]
    story.append(P(S, "h2", cm_["title"]))
    story.append(P(S, "body", f"Option : {cm_['toggle']}"))
    story.append(P(S, "label", "Champs"))
    story.extend(bullets(S, cm_["fields"]))
    story.append(P(S, "label", "Colonnes du registre usages IA"))
    story.extend(bullets(S, cm_["registreColumns"]))
    story.append(P(S, "meta", cm_["note"]))
    story.append(P(S, "h2", rh["article4"]["title"]))
    story.extend(bullets(S, rh["article4"]["outputs"]))
    story.append(P(S, "h2", "Contenu du ZIP de preuves"))
    story.extend(bullets(S, rh["proofZip"]))
    story.append(P(S, "label", "Non disponible"))
    story.extend(bullets(S, rh["notAvailable"]))
    story.append(PageBreak())

    # 8 Partner
    story.append(P(S, "h1", "8. Espace partenaire"))
    partner = data["partner"]
    story.append(P(S, "body", f"Route : {partner['route']} — {partner['title']}"))
    story.append(P(S, "label", "KPI"))
    story.extend(bullets(S, partner["kpis"]))
    story.append(P(S, "label", "Colonnes"))
    story.extend(bullets(S, partner["tableColumns"]))
    story.append(P(S, "label", "Actions"))
    story.extend(bullets(S, partner["actions"]))
    story.append(P(S, "label", "Non disponible côté partenaire"))
    story.extend(bullets(S, partner["notAvailable"]))
    story.append(PageBreak())

    # 9 Demo
    story.append(P(S, "h1", "9. Démo publique"))
    story.append(P(S, "body", f"Route : {data['demo']['route']}"))
    story.append(P(S, "body", data["demo"]["description"]))
    story.append(PageBreak())

    # 10 Isolation
    story.append(P(S, "h1", "10. Isolation des données & rôles"))
    iso = data["isolation"]
    story.append(P(S, "body", f"Rôles couverts ici : {', '.join(iso['roles'])}"))
    story.append(P(S, "meta", iso["noteExcluded"]))
    story.extend(bullets(S, iso["rules"]))
    story.append(P(S, "h2", "Jalons AI Act (rappel marketing / page /ai-act)"))
    for m in data["milestones"]:
        story.append(P(S, "body", f"• {m['date']} — {m['label']} — {m['detail']}"))
    story.append(PageBreak())

    # 11 Legal
    story.append(P(S, "h1", "11. Pages légales & AI Act (texte extrait)"))
    story.append(
        P(
            S,
            "meta",
            "Extraction automatique depuis les pages Next.js. "
            "Pour une relecture juridique fine, se référer aussi aux pages live. "
            "Le balisage React a été retiré ; la rédaction peut contenir des artefacts mineurs.",
        )
    )
    for slug, text in data["legalPages"].items():
        story.append(PageBreak())
        story.append(P(S, "h1", f"/{slug}"))
        if not text:
            story.append(P(S, "body", "(page vide ou introuvable)"))
            continue
        # Découper en paquets pour éviter les paragraphes monstrueux
        chunk = 1600
        for i in range(0, len(text), chunk):
            story.append(P(S, "body", text[i : i + chunk]))

    doc = SimpleDocTemplate(
        str(OUT_PATH),
        pagesize=A4,
        leftMargin=1.8 * cm,
        rightMargin=1.8 * cm,
        topMargin=1.6 * cm,
        bottomMargin=1.8 * cm,
        title=meta["title"],
        author="LockinIA",
        subject="Revue plateforme hors parcours",
    )
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(f"OK → {OUT_PATH}")


if __name__ == "__main__":
    main()
