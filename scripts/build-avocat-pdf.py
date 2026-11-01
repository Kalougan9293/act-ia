#!/usr/bin/env python3
"""Génère le PDF dossier avocat LockinIA à partir du JSON exporté."""

from __future__ import annotations

import json
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "docs" / "formation-avocat-contenu.json"
OUT_PATH = ROOT / "docs" / "LockinIA-Contenu-Formation-Dossier-Avocat.pdf"

BLUE = HexColor("#1d4ed8")
SLATE = HexColor("#0f172a")
MUTED = HexColor("#475569")
LIGHT = HexColor("#f1f5f9")
BORDER = HexColor("#cbd5e1")


def esc(text: str | None) -> str:
    if not text:
        return ""
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\n", "<br/>")
    )


def build_styles():
    base = getSampleStyleSheet()
    styles = {
        "cover_title": ParagraphStyle(
            "cover_title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=28,
            textColor=SLATE,
            alignment=TA_CENTER,
            spaceAfter=12,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=11,
            leading=16,
            textColor=MUTED,
            alignment=TA_CENTER,
            spaceAfter=8,
        ),
        "h1": ParagraphStyle(
            "h1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=BLUE,
            spaceBefore=18,
            spaceAfter=10,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=17,
            textColor=SLATE,
            spaceBefore=14,
            spaceAfter=6,
        ),
        "h3": ParagraphStyle(
            "h3",
            parent=base["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=SLATE,
            spaceBefore=10,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13.5,
            textColor=SLATE,
            alignment=TA_JUSTIFY,
            spaceAfter=6,
        ),
        "body_left": ParagraphStyle(
            "body_left",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13.5,
            textColor=SLATE,
            alignment=TA_LEFT,
            spaceAfter=4,
        ),
        "small": ParagraphStyle(
            "small",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=11.5,
            textColor=MUTED,
            spaceAfter=4,
        ),
        "meta": ParagraphStyle(
            "meta",
            parent=base["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=8.5,
            leading=11,
            textColor=MUTED,
            spaceAfter=8,
        ),
        "bullet": ParagraphStyle(
            "bullet",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            textColor=SLATE,
            leftIndent=8,
            spaceAfter=2,
        ),
    }
    return styles


def add_header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(2 * cm, 1.2 * cm, "LockinIA — Dossier avocat — Confidentiel")
    canvas.drawRightString(
        A4[0] - 2 * cm,
        1.2 * cm,
        f"Page {doc.page}",
    )
    canvas.setStrokeColor(BORDER)
    canvas.line(2 * cm, 1.6 * cm, A4[0] - 2 * cm, 1.6 * cm)
    canvas.restoreState()


def section_banner(title: str, styles) -> list:
    data = [[Paragraph(esc(title), ParagraphStyle(
        "banner",
        fontName="Helvetica-Bold",
        fontSize=11,
        textColor=white,
        leading=14,
    ))]]
    t = Table(data, colWidths=[16.5 * cm])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), BLUE),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return [Spacer(1, 8), t, Spacer(1, 10)]


def bullets(items: list[str], styles) -> ListFlowable:
    return ListFlowable(
        [ListItem(Paragraph(esc(i), styles["bullet"]), leftIndent=12, bulletColor=BLUE) for i in items],
        bulletType="bullet",
        start="•",
        leftIndent=10,
        bulletFontSize=9,
    )


def main():
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    styles = build_styles()
    story: list = []

    meta = data["meta"]

    # ——— Couverture ———
    story.append(Spacer(1, 3.5 * cm))
    story.append(Paragraph(esc(meta["title"]), styles["cover_title"]))
    story.append(Paragraph(esc(meta["courseTitle"]), styles["cover_sub"]))
    story.append(
        Paragraph(
            esc(
                f"Version {meta['version']} · Durée socle {meta['duration']} · "
                f"Généré le {meta['generatedAt'][:10]}"
            ),
            styles["cover_sub"],
        )
    )
    story.append(Spacer(1, 1 * cm))
    story.append(
        Paragraph(
            esc(
                "Document destiné à une revue juridique du contenu pédagogique diffusé "
                "aux apprenants, ainsi qu’à une description simple de l’usage des données "
                "sur la plateforme (RH, partenaires OF, Superadmin)."
            ),
            styles["body"],
        )
    )
    story.append(
        Paragraph(
            esc(meta["purpose"]),
            styles["meta"],
        )
    )
    story.append(PageBreak())

    # ——— Sommaire textuel ———
    story += section_banner("Sommaire", styles)
    toc = [
        "1. Présentation du parcours et fiche programme",
        "2. Promesse, réflexes et assistance FOAD",
        "3. Positionnement (début de parcours)",
        "4. Socle pédagogique — blocs 1 à 6 (contenu textuel intégral)",
        "5. Lexique",
        "6. Examen final (banque de questions)",
        "7. Module « Votre entreprise » (modèle par défaut)",
        "8. Bonus — fiches métiers",
        "9. Attestation et satisfaction (libellés)",
        "10. Traitement des données et rôles techniques (lecture simple)",
    ]
    for line in toc:
        story.append(Paragraph(esc(line), styles["body_left"]))
    story.append(PageBreak())

    # ——— 1 Programme ———
    story += section_banner("1. Présentation du parcours et fiche programme", styles)
    p = data["programme"]
    story.append(Paragraph(esc(f"<b>Intitulé :</b> {p['intitule']}"), styles["body"]))
    story.append(Paragraph(esc(f"<b>Organisme :</b> {p['organisme']}"), styles["body"]))
    story.append(Paragraph(esc(f"<b>Modalité :</b> {p['modalite']}"), styles["body"]))
    story.append(Paragraph(esc(f"<b>Durée :</b> {p['duree']} — {p['dureeDetail']}"), styles["body"]))
    story.append(Paragraph(esc(f"<b>Public :</b> {p['public']}"), styles["body"]))
    story.append(Paragraph(esc(f"<b>Qualiopi / statut :</b> {p['statutQualiopi']}"), styles["body"]))
    story.append(Paragraph("<b>Objectifs</b>", styles["h3"]))
    for obj in p["objectifs"]:
        story.append(Paragraph(esc(f"• {obj['label']}"), styles["body_left"]))
        story.append(Paragraph(esc(f"  Évaluable : {obj['evaluable']}"), styles["small"]))
    story.append(Paragraph("<b>Prérequis</b>", styles["h3"]))
    story.append(bullets(p["prerequis"], styles))
    story.append(Paragraph("<b>Méthodes</b>", styles["h3"]))
    story.append(bullets(p["methodes"], styles))
    story.append(Paragraph("<b>Évaluation</b>", styles["h3"]))
    story.append(bullets(p["evaluation"], styles))
    story.append(Paragraph("<b>Accessibilité</b>", styles["h3"]))
    story.append(bullets(p["accessibilite"], styles))
    if p.get("tarifs"):
        story.append(Paragraph("<b>Tarifs (fiche programme)</b>", styles["h3"]))
        story.append(bullets(p["tarifs"], styles))

    # ——— 2 Réflexes ———
    story += section_banner("2. Promesse, réflexes et assistance FOAD", styles)
    story.append(Paragraph(esc(f"<b>Promesse :</b> {meta['promise']}"), styles["body"]))
    story.append(Paragraph("<b>Les 7 réflexes — Avant d’écrire à l’IA</b>", styles["h3"]))
    story.append(bullets(data["reflexes"]["before"], styles))
    story.append(Paragraph("<b>Les 7 réflexes — Après la réponse de l’IA</b>", styles["h3"]))
    story.append(bullets(data["reflexes"]["after"], styles))
    a = data["assistance"]
    story.append(Paragraph("<b>Assistance FOAD</b>", styles["h3"]))
    story.append(
        Paragraph(
            esc(
                f"{a['referentPedagogique']['name']} — {a['referentPedagogique']['role']} : "
                f"{a['referentPedagogique']['mission']}"
            ),
            styles["body"],
        )
    )
    story.append(
        Paragraph(
            esc(
                f"{a['referentTechnique']['name']} — {a['referentTechnique']['role']} : "
                f"{a['referentTechnique']['mission']}"
            ),
            styles["body"],
        )
    )
    story.append(
        Paragraph(
            esc(
                f"Contact : {a['email']} · {a['phone']} · réponse {a['responseDelay']}. "
                f"{a['remoteActivities']} Évaluation : {a['evaluation']}"
            ),
            styles["body"],
        )
    )
    if data.get("milestones"):
        story.append(Paragraph("<b>Jalons AI Act (présentés dans le parcours)</b>", styles["h3"]))
        for m in data["milestones"]:
            label = m.get("label") or m.get("title") or m.get("date") or ""
            detail = m.get("detail") or m.get("description") or m.get("essence") or ""
            date = m.get("date") or m.get("shortDate") or ""
            story.append(
                Paragraph(esc(f"• {date} — {label}"), styles["body_left"])
            )
            if detail:
                story.append(Paragraph(esc(str(detail)), styles["small"]))

    # ——— 3 Positionnement ———
    story.append(PageBreak())
    story += section_banner("3. Positionnement (début de parcours)", styles)
    story.append(
        Paragraph(
            esc(
                "Questionnaire non éliminatoire (Oui / Non). Sert à situer l’apprenant ; "
                "n’entre pas dans le score d’attestation."
            ),
            styles["meta"],
        )
    )
    for i, q in enumerate(data["positioning"], 1):
        block = [
            Paragraph(esc(f"<b>Q{i}. {q['prompt']}</b>"), styles["body_left"]),
        ]
        for c in q["choices"]:
            mark = "✓" if c.get("correct") else "○"
            block.append(Paragraph(esc(f"{mark} {c['label']}"), styles["small"]))
        if q.get("explanation"):
            block.append(Paragraph(esc(f"Explication : {q['explanation']}"), styles["small"]))
        story.append(KeepTogether(block + [Spacer(1, 4)]))

    # ——— 4 Blocs ———
    story.append(PageBreak())
    story += section_banner(
        "4. Socle pédagogique — contenu textuel intégral (blocs 1 à 6)", styles
    )
    story.append(
        Paragraph(
            esc(
                "Ci-dessous : scripts vidéo, consignes de jeux, feedbacks et textes affichés "
                "aux apprenants, exportés depuis le code source pédagogique (socle V1.0)."
            ),
            styles["meta"],
        )
    )

    for block in data["blocks"]:
        story.append(
            Paragraph(
                esc(
                    f"Bloc {block['number']} — {block['title']} "
                    f"({block['duration']})"
                ),
                styles["h1"],
            )
        )
        story.append(Paragraph(esc(f"<b>Objectif :</b> {block['goal']}"), styles["body"]))
        for ch in block["chapters"]:
            story.append(
                Paragraph(
                    esc(
                        f"{ch['id']} · {ch['title']} "
                        f"[{ch['format']} / {ch['kind']}] · {ch['duration']}"
                    ),
                    styles["h2"],
                )
            )
            for line in ch["text"]:
                story.append(Paragraph(esc(line), styles["body"]))

    # ——— 5 Lexique ———
    story.append(PageBreak())
    story += section_banner("5. Lexique", styles)
    for entry in data["lexicon"]:
        term = entry.get("term") or entry.get("label") or entry.get("id")
        definition = entry.get("definition") or entry.get("text") or ""
        example = entry.get("example") or ""
        story.append(Paragraph(esc(f"<b>{term}</b> — {definition}"), styles["body"]))
        if example:
            story.append(Paragraph(esc(f"Exemple : {example}"), styles["small"]))

    # ——— 6 Examen ———
    story.append(PageBreak())
    story += section_banner("6. Examen final (banque de questions)", styles)
    exam = data["exam"]
    story.append(
        Paragraph(
            esc(
                f"Tirage : {exam['drawSize']} questions parmi {len(exam['bank'])}. "
                f"Seuil : {exam['passPercent']} % ({exam['passCount']}/{exam['drawSize']}). "
                f"Chrono indicatif : {exam['timerSeconds'] // 60} min (ne coupe pas l’examen)."
            ),
            styles["meta"],
        )
    )
    for q in exam["bank"]:
        block = [
            Paragraph(
                esc(f"<b>{q['id']}</b> [{q.get('blockId') or '—'}] — {q['prompt']}"),
                styles["body_left"],
            )
        ]
        for c in q["choices"]:
            mark = "✓" if c.get("correct") else "○"
            block.append(Paragraph(esc(f"{mark} {c['label']}"), styles["small"]))
        if q.get("explanation"):
            block.append(Paragraph(esc(f"Pourquoi ? {q['explanation']}"), styles["small"]))
        story.append(KeepTogether(block + [Spacer(1, 3)]))

    # ——— 7 Module entreprise ———
    story.append(PageBreak())
    story += section_banner("7. Module « Votre entreprise » (modèle par défaut)", styles)
    story.append(
        Paragraph(
            esc(
                "Ce module n’entre pas dans le QCM. Son contenu est renseigné par le RH. "
                "Ci-dessous : texte minimal proposé à l’activation."
            ),
            styles["meta"],
        )
    )
    cm_mod = data["companyModuleDefault"]
    for key, label in [
        ("tools", "Outils / interdits"),
        ("charter", "Charte"),
        ("contacts", "Contacts"),
        ("declaration", "Procédure de déclaration"),
    ]:
        if cm_mod.get(key):
            story.append(Paragraph(esc(f"<b>{label}</b>"), styles["h3"]))
            story.append(Paragraph(esc(cm_mod[key]), styles["body"]))

    # ——— 8 Métiers ———
    story.append(PageBreak())
    story += section_banner("8. Bonus — fiches métiers", styles)
    story.append(
        Paragraph(
            esc(
                "Parcours optionnels (~5–8 min) après attestation. "
                "Contenu textuel complet ci-dessous."
            ),
            styles["meta"],
        )
    )
    for career in data["careers"]:
        story.append(
            Paragraph(
                esc(f"{career['title']} ({career['duration']}) — {career.get('focus', '')}"),
                styles["h2"],
            )
        )
        story.append(Paragraph(esc(f"<b>Pourquoi exposé :</b> {career['whyExposed']}"), styles["body"]))
        story.append(Paragraph("<b>Jamais dans une IA grand public</b>", styles["h3"]))
        story.append(bullets(career["neverList"], styles))
        story.append(Paragraph("<b>Feu tricolore</b>", styles["h3"]))
        for t in career["traffic"]:
            level = {"green": "Vert", "orange": "Orange", "red": "Rouge"}.get(t["level"], t["level"])
            story.append(
                Paragraph(
                    esc(f"• [{level}] {t['situation']} — {t['explanation']}"),
                    styles["body_left"],
                )
            )
        story.append(Paragraph("<b>Cas pratiques</b>", styles["h3"]))
        for case in career["cases"]:
            story.append(Paragraph(esc(f"Situation : {case['situation']}"), styles["body_left"]))
            story.append(Paragraph(esc(f"Réponse : {case['answer']}"), styles["small"]))
        story.append(Paragraph("<b>Idées d’usage</b>", styles["h3"]))
        story.append(bullets(career["tips"], styles))
        story.append(Paragraph("<b>Quiz métier</b>", styles["h3"]))
        for qi, q in enumerate(career["quiz"], 1):
            story.append(Paragraph(esc(f"Q{qi}. {q['prompt']}"), styles["body_left"]))
            for c in q["choices"]:
                mark = "✓" if c.get("correct") else "○"
                story.append(Paragraph(esc(f"{mark} {c['label']}"), styles["small"]))
            story.append(Paragraph(esc(f"Pourquoi ? {q['why']}"), styles["small"]))

    # ——— 9 Attestation ———
    story.append(PageBreak())
    story += section_banner("9. Attestation et satisfaction (libellés)", styles)
    story.append(
        Paragraph(
            esc(
                f"Intitulé porté sur l’attestation : « {meta['courseTitle']} ». "
                "Document : « Attestation de suivi de formation et de sensibilisation — "
                "Maîtrise de l’IA — EU AI Act (article 4) ». "
                "Mention de bas de page (esprit) : justificatif de suivi ; "
                "ni certification officielle de conformité AI Act/RGPD, "
                "ni certification délivrée par l’Union européenne."
            ),
            styles["body"],
        )
    )
    story.append(
        Paragraph(
            esc(
                "Satisfaction à chaud : note 1–5, commentaire optionnel, "
                "réclamation optionnelle (canal contact@lockin-web.online). "
                "Collectée après réussite du QCM."
            ),
            styles["body"],
        )
    )

    # ——— 10 Données ———
    story.append(PageBreak())
    story += section_banner(
        "10. Traitement des données et rôles techniques (lecture simple)", styles
    )
    story.append(
        Paragraph(
            esc(
                "Cette dernière partie ne reprend pas le détail technique du code. "
                "Elle décrit, en langage clair, qui voit quoi et à quelles fins, "
                "pour faciliter l’analyse RGPD / contrat."
            ),
            styles["meta"],
        )
    )
    story.append(Paragraph("<b>Finalité principale</b>", styles["h3"]))
    story.append(
        Paragraph(
            esc(
                "LockinIA est une plateforme SaaS B2B qui permet à une entreprise "
                "(ou à un organisme de formation partenaire) de faire suivre à ses "
                "collaborateurs un parcours de sensibilisation à l’IA et aux bons usages "
                "des données, de suivre la progression, et de conserver une attestation "
                "nominative de suivi (AI Act art. 4)."
            ),
            styles["body"],
        )
    )
    story.append(Paragraph("<b>Données typiquement traitées</b>", styles["h3"]))
    story.append(
        bullets(
            [
                "Identité de compte : nom, e-mail professionnel, rôle (apprenant, RH, partenaire OF, Superadmin).",
                "Rattachement organisationnel : entreprise (structure), éventuellement organisme partenaire.",
                "Suivi pédagogique : progression, scores de positionnement et de QCM, temps passé, modules complétés, date de certification, identifiant d’attestation.",
                "Avis à chaud : note, commentaire, éventuelle réclamation.",
                "Données de facturation / sièges : quotas, consommation de places, informations de structure (raison sociale, SIRET, e-mail de facturation) selon le compte.",
                "Contenu « module entreprise » saisi par le RH (charte, outils autorisés, contacts) : données d’organisation, pas le cœur du parcours pédagogique individuel.",
            ],
            styles,
        )
    )
    story.append(Paragraph("<b>Qui voit quoi (isolement)</b>", styles["h3"]))
    story.append(
        Paragraph(
            esc(
                "<b>Apprenant</b> : voit uniquement son parcours, sa progression et son attestation. "
                "Il ne voit pas les autres collaborateurs ni les données d’autres entreprises."
            ),
            styles["body"],
        )
    )
    story.append(
        Paragraph(
            esc(
                "<b>RH / entreprise</b> : voit les collaborateurs de <i>sa</i> structure "
                "(avancement, Avant/Après, avis, réclamations éventuelles, attestations). "
                "N’accède pas aux données d’une autre entreprise."
            ),
            styles["body"],
        )
    )
    story.append(
        Paragraph(
            esc(
                "<b>Partenaire (organisme de formation)</b> : voit uniquement les entreprises "
                "qu’il a rattachées à son compte, avec un suivi pédagogique "
                "(progression, scores Avant/Après, notes d’avis et commentaires). "
                "Les réclamations détaillées restent plutôt côté entreprise et Superadmin. "
                "Un OF ne voit pas les clients d’un autre OF."
            ),
            styles["body"],
        )
    )
    story.append(
        Paragraph(
            esc(
                "<b>Superadmin (opérateur LockinIA)</b> : accès transverse nécessaire à "
                "l’exploitation du service (support, facturation, sécurité, conformité, "
                "pilotage qualité). Peut consulter structures, partenaires, utilisateurs "
                "et indicateurs de suivi. Cet accès doit être cadré contractuellement "
                "(finalités limitées, pas de revente ni de partage des portefeuilles entre clients)."
            ),
            styles["body"],
        )
    )
    story.append(Paragraph("<b>Hébergement et sécurité (principes)</b>", styles["h3"]))
    story.append(
        Paragraph(
            esc(
                "L’application s’appuie sur Firebase (Authentification, Firestore) pour "
                "l’identité et le stockage des fiches. Les règles de sécurité côté base "
                "isolent les lectures/écritures selon le rôle et le rattachement "
                "(structureId / partnerId). Les mots de passe ne sont pas stockés en clair "
                "par LockinIA (gestion via le prestataire d’authentification). "
                "Les exports d’attestations / preuves sont destinés au client (RH) pour "
                "documenter le suivi interne."
            ),
            styles["body"],
        )
    )
    story.append(Paragraph("<b>Points d’attention pour la revue</b>", styles["h3"]))
    story.append(
        bullets(
            [
                "Base légale et finalités à formaliser (exécution du contrat B2B / intérêt légitime support, etc.).",
                "Durées de conservation (comptes, progressions, attestations, avis, archives) à fixer avec le client.",
                "Sous-traitance (Firebase / Google Cloud) et localisation : à confirmer dans le DPA.",
                "Le contenu pédagogique ci-dessus est une sensibilisation pratique ; l’attestation n’est pas une certification officielle de conformité.",
                "Le module entreprise et le registre d’usages IA sont saisis par le client : LockinIA héberge ce que le RH renseigne.",
            ],
            styles,
        )
    )
    story.append(Spacer(1, 12))
    story.append(
        Paragraph(
            esc(
                "Fin du document. Pour toute précision technique complémentaire "
                "(schéma de données, règles Firestore, flux d’invitation), "
                "un annexe technique pourra être fourni séparément."
            ),
            styles["meta"],
        )
    )

    doc = SimpleDocTemplate(
        str(OUT_PATH),
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=1.8 * cm,
        bottomMargin=2.2 * cm,
        title=meta["title"],
        author="LockinIA",
        subject="Dossier avocat — contenu formation et usage des données",
    )
    doc.build(story, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
    print(f"OK {OUT_PATH} ({OUT_PATH.stat().st_size // 1024} Ko)")


if __name__ == "__main__":
    main()
