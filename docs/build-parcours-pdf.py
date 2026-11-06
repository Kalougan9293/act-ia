#!/usr/bin/env python3
"""Génère le PDF de revue : tous les parcours utilisateurs LockinIA."""

from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parent
JSON_PATH = ROOT / "parcours-utilisateurs-contenu.json"
OUT_PATH = ROOT / "LockinIA-Parcours-Utilisateurs-Revue-Complete.pdf"

FONT = "Helvetica"
FONT_B = "Helvetica-Bold"
for candidate in (
    r"C:\Windows\Fonts\arial.ttf",
    r"C:\Windows\Fonts\calibri.ttf",
):
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
LIGHT = colors.HexColor("#f1f5f9")
OK = colors.HexColor("#047857")
WARN = colors.HexColor("#b45309")
BAD = colors.HexColor("#be123c")


def esc(text: object) -> str:
    if text is None:
        return ""
    s = str(text)
    return (
        s.replace("&", "&amp;")
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
            fontName=FONT_B,
            fontSize=22,
            leading=28,
            textColor=BLUE,
            alignment=TA_CENTER,
            spaceAfter=12,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=11,
            leading=16,
            textColor=SLATE,
            alignment=TA_CENTER,
            spaceAfter=6,
        ),
        "h1": ParagraphStyle(
            "h1",
            parent=base["Heading1"],
            fontName=FONT_B,
            fontSize=16,
            leading=20,
            textColor=BLUE,
            spaceBefore=8,
            spaceAfter=10,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName=FONT_B,
            fontSize=13,
            leading=17,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=10,
            spaceAfter=6,
        ),
        "h3": ParagraphStyle(
            "h3",
            parent=base["Heading3"],
            fontName=FONT_B,
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#1e293b"),
            spaceBefore=8,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=9.5,
            leading=13,
            textColor=SLATE,
            alignment=TA_JUSTIFY,
            spaceAfter=4,
        ),
        "meta": ParagraphStyle(
            "meta",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=8.5,
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
            spaceBefore=4,
            spaceAfter=2,
        ),
        "bullet": ParagraphStyle(
            "bullet",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=9,
            leading=12,
            textColor=SLATE,
            leftIndent=8,
        ),
        "toc": ParagraphStyle(
            "toc",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=10,
            leading=14,
            textColor=SLATE,
            spaceAfter=3,
        ),
        "footer": ParagraphStyle(
            "footer",
            parent=base["Normal"],
            fontName=FONT,
            fontSize=8,
            textColor=colors.HexColor("#94a3b8"),
            alignment=TA_CENTER,
        ),
    }
    return styles


def add_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont(FONT, 8)
    canvas.setFillColor(colors.HexColor("#94a3b8"))
    canvas.drawString(1.8 * cm, 1.1 * cm, "LockinIA — Revue parcours utilisateurs — Confidentiel")
    canvas.drawRightString(A4[0] - 1.8 * cm, 1.1 * cm, f"Page {doc.page}")
    canvas.restoreState()


def p(styles, key, text):
    return Paragraph(esc(text), styles[key])


def bullets(styles, items):
    flow = []
    for item in items:
        flow.append(Paragraph(f"• {esc(item)}", styles["bullet"]))
    return flow


def section_box(title: str, body_paras, styles):
    data = [[Paragraph(esc(title), styles["label"])]] + [[x] for x in body_paras]
    t = Table(data, colWidths=[16.5 * cm])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), LIGHT),
                ("BOX", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return t


def render_activity(act: dict, styles, story):
    kind = act.get("kind", "?")
    story.append(p(styles, "meta", f"Type d'activité : {kind}"))

    def add_label(label, value=None):
        story.append(p(styles, "label", label))
        if value is not None:
            story.append(p(styles, "body", value))

    if act.get("briefing"):
        add_label("Briefing (avant le jeu)", act["briefing"])
    if act.get("instruction"):
        add_label("Consigne", act["instruction"])
    if act.get("intro"):
        add_label("Intro", act["intro"])
    if act.get("hint"):
        add_label("Indice", act["hint"])
    if act.get("script"):
        add_label("Script vidéo (texte intégral)", act["script"])
    if act.get("paragraphs"):
        add_label("Texte")
        for para in act["paragraphs"]:
            story.append(p(styles, "body", para))
    if act.get("points"):
        add_label("Points")
        story.extend(bullets(styles, act["points"]))
    if act.get("beforeAfter"):
        ba = act["beforeAfter"]
        add_label(ba.get("beforeTitle") or "Avant")
        story.extend(bullets(styles, ba.get("before") or []))
        add_label(ba.get("afterTitle") or "Après")
        story.extend(bullets(styles, ba.get("after") or []))
    if act.get("takeaway"):
        add_label("À retenir", act["takeaway"])
    if act.get("outro"):
        add_label("Conclusion", act["outro"])
    if act.get("explanation"):
        add_label("Explication", act["explanation"])
    if act.get("items") and kind in {"fiche", "checklist"}:
        add_label("Éléments")
        story.extend(bullets(styles, act["items"]))
    if act.get("bins") and act.get("cards"):
        add_label("Catégories")
        story.extend(bullets(styles, [f"{b['id']} — {b['label']}" for b in act["bins"]]))
        add_label("Cartes à classer")
        for c in act["cards"]:
            story.append(
                p(
                    styles,
                    "body",
                    f"• [{c.get('binId')}] {c.get('label')} — {c.get('explanation')}",
                )
            )
    if kind == "slash" and act.get("items"):
        add_label("Bulles")
        for it in act["items"]:
            tag = "DONNÉE PERSO" if it.get("personal") else "pas perso"
            story.append(
                p(
                    styles,
                    "body",
                    f"• [{tag}] {it.get('label')} — {it.get('explanation')}",
                )
            )
    if kind == "stamp":
        add_label("Tampons")
        for s in act.get("stamps") or []:
            story.append(p(styles, "body", f"• {s.get('label')} — {s.get('hint')}"))
        add_label("Cartes")
        for c in act.get("cards") or []:
            story.append(
                p(
                    styles,
                    "body",
                    f"• → {c.get('stampId')} | {c.get('label')} — {c.get('explanation')}",
                )
            )
    if kind == "swipe":
        story.append(
            p(
                styles,
                "body",
                f"Gauche : {act['left']['label']} | Droite : {act['right']['label']}",
            )
        )
        add_label("Cartes")
        for c in act.get("cards") or []:
            story.append(
                p(
                    styles,
                    "body",
                    f"• → {c.get('zoneId')} | {c.get('label')} — {c.get('explanation')}",
                )
            )
    if kind == "match":
        add_label("Paires")
        for pair in act.get("pairs") or []:
            story.append(
                p(
                    styles,
                    "body",
                    f"• {pair.get('left')} ↔ {pair.get('right')} — {pair.get('explanation')}",
                )
            )
    if kind == "quiz" and act.get("questions"):
        for i, q in enumerate(act["questions"], 1):
            add_label(f"Question {i}", q.get("prompt"))
            for ch in q.get("choices") or []:
                mark = "✓" if ch.get("correct") else "·"
                story.append(
                    p(
                        styles,
                        "body",
                        f"{mark} {ch.get('label')} — {ch.get('explanation')}",
                    )
                )
    if kind == "scenario" and act.get("steps"):
        for i, step in enumerate(act["steps"], 1):
            add_label(f"Étape {i}", step.get("prompt"))
            if step.get("mediaLabel"):
                story.append(p(styles, "meta", f"Bandeau média : {step['mediaLabel']}"))
            for ch in step.get("choices") or []:
                mark = "✓" if ch.get("correct") else "·"
                story.append(
                    p(
                        styles,
                        "body",
                        f"{mark} {ch.get('label')} — {ch.get('explanation')}",
                    )
                )
    if kind == "truefake" and act.get("items"):
        for it in act["items"]:
            story.append(
                p(
                    styles,
                    "body",
                    f"• [{it.get('answer')}] {it.get('prompt')} — placeholder : {it.get('mediaPlaceholder')}",
                )
            )
    if kind == "tetris" and act.get("blocks"):
        add_label("Blocs")
        story.extend(bullets(styles, [b.get("label") for b in act["blocks"]]))
    if kind == "dodge" and act.get("hazards"):
        add_label(f"Objectif : {act.get('goal')} ; obstacles")
        for h in act["hazards"]:
            tag = "ATTRAPER" if h.get("good") else "ESQUIVER"
            story.append(p(styles, "body", f"• [{tag}] {h.get('label')}"))
    if kind == "predict" and act.get("rounds"):
        for i, rnd in enumerate(act["rounds"], 1):
            add_label(f"Manche {i}", f"« {rnd.get('lead')} »")
            for opt in rnd.get("options") or []:
                story.append(
                    p(styles, "body", f"• {opt.get('label')} — {opt.get('percent')} %")
                )
            story.append(p(styles, "body", rnd.get("message")))
    if kind == "spot" and act.get("fragments"):
        add_label("Fragments")
        for fr in act["fragments"]:
            tags = []
            if fr.get("trap"):
                tags.append("PIÈGE")
            if fr.get("veiled"):
                tags.append("VOILÉ")
            tag = f"[{'/'.join(tags)}] " if tags else ""
            story.append(
                p(
                    styles,
                    "body",
                    f"• {tag}{fr.get('text')} — {fr.get('explanation') or ''}",
                )
            )
    if kind == "redact" and act.get("tokens"):
        add_label("Tokens")
        for tok in act["tokens"]:
            tag = "À MASQUER" if tok.get("redact") else "garder"
            rep = tok.get("replacement")
            extra = f" → « {rep} »" if rep is not None and tok.get("redact") else ""
            story.append(p(styles, "body", f"• [{tag}] {tok.get('text')}{extra}"))
    if kind == "label" and act.get("items"):
        story.append(p(styles, "meta", f"Sticker : {act.get('sticker')}"))
        for it in act["items"]:
            tag = "À ÉTIQUETER" if it.get("needsLabel") else "sans sticker"
            story.append(
                p(
                    styles,
                    "body",
                    f"• [{tag}] {it.get('caption')} — {it.get('explanation')}",
                )
            )
    if kind == "send" and act.get("items"):
        for it in act["items"]:
            action = "Entrée OK" if it.get("send") else "Corriger d'abord"
            story.append(p(styles, "body", f"• [{action}] Prompt : {it.get('prompt')}"))
            if it.get("fixedPrompt"):
                story.append(p(styles, "body", f"  Version corrigée : {it['fixedPrompt']}"))
            story.append(p(styles, "body", f"  {it.get('explanation')}"))
    if kind == "traffic" and act.get("items"):
        for it in act["items"]:
            story.append(
                p(
                    styles,
                    "body",
                    f"• [{it.get('level')}] {it.get('label')} — {it.get('explanation')}",
                )
            )
    if kind == "timeline" and act.get("items"):
        for it in act["items"]:
            story.append(
                p(
                    styles,
                    "body",
                    f"• {it.get('date')} — {it.get('label')} ({it.get('law')}) — {it.get('detail')}",
                )
            )


def main():
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    styles = build_styles()
    story = []

    meta = data["meta"]
    story.append(Spacer(1, 2.2 * cm))
    story.append(p(styles, "cover_title", meta["title"]))
    story.append(p(styles, "cover_sub", meta["courseTitle"]))
    story.append(p(styles, "cover_sub", f"Durée socle : {meta['duration']}"))
    story.append(Spacer(1, 0.6 * cm))
    story.append(p(styles, "cover_sub", meta["purpose"]))
    story.append(Spacer(1, 0.4 * cm))
    story.append(
        p(
            styles,
            "cover_sub",
            f"Généré le {datetime.fromisoformat(meta['generatedAt'].replace('Z', '+00:00')).strftime('%d/%m/%Y %H:%M')} UTC",
        )
    )
    story.append(p(styles, "cover_sub", f"Source : {meta.get('source', '')}"))
    story.append(PageBreak())

    # Sommaire
    story.append(p(styles, "h1", "Sommaire"))
    story.append(p(styles, "toc", "1. Cadre programme & assistance"))
    story.append(p(styles, "toc", "2. Les 7 réflexes & jalons AI Act"))
    story.append(p(styles, "toc", "3. Socle — tous les blocs et chapitres (contenu intégral)"))
    for block in data["blocks"]:
        story.append(
            p(
                styles,
                "toc",
                f"    Bloc {block['number']} — {block['title']} ({block['duration']})",
            )
        )
    story.append(p(styles, "toc", "4. Fiches métiers (parcours optionnels)"))
    for career in data["careers"]:
        story.append(p(styles, "toc", f"    {career['title']} ({career['duration']})"))
    story.append(
        p(
            styles,
            "toc",
            f"5. Banque QCM d'évaluation ({data['evaluationRules']['bankSize']} questions)",
        )
    )
    story.append(PageBreak())

    # 1. Programme
    story.append(p(styles, "h1", "1. Cadre programme & assistance"))
    prog = data["programme"]
    story.append(p(styles, "body", meta["promise"]))
    story.append(p(styles, "label", "Intitulé"))
    story.append(p(styles, "body", prog.get("intitule")))
    story.append(p(styles, "label", "Modalité"))
    story.append(p(styles, "body", prog.get("modalite")))
    story.append(p(styles, "label", "Public"))
    story.append(p(styles, "body", prog.get("public")))
    story.append(p(styles, "label", "Objectifs"))
    for obj in prog.get("objectifs") or []:
        story.append(p(styles, "body", f"• {obj.get('label')} — Évaluable : {obj.get('evaluable')}"))
    story.append(p(styles, "label", "Prérequis"))
    story.extend(bullets(styles, prog.get("prerequis") or []))
    story.append(p(styles, "label", "Méthodes"))
    story.extend(bullets(styles, prog.get("methodes") or []))
    story.append(p(styles, "label", "Évaluation"))
    story.extend(bullets(styles, prog.get("evaluation") or []))
    story.append(p(styles, "label", "Accessibilité"))
    story.extend(bullets(styles, prog.get("accessibilite") or []))
    story.append(p(styles, "label", "Déroulement"))
    for step in prog.get("deroule") or []:
        story.append(
            p(
                styles,
                "body",
                f"• {step.get('etape')} ({step.get('duree')}) — {step.get('detail')}",
            )
        )

    rules = data["evaluationRules"]
    story.append(p(styles, "h2", "Règles d'évaluation (moteur)"))
    story.append(
        p(
            styles,
            "body",
            f"Tirage : {rules['quizDrawSize']} questions — seuil {rules['passPercent']}% "
            f"({rules['passCount']}/{rules['quizDrawSize']}) — chrono indicatif "
            f"{rules['timerSeconds'] // 60} min — positionnement {rules['positioningMin']}–"
            f"{rules['positioningMax']} questions — banque {rules['bankSize']} items.",
        )
    )

    asst = data["assistance"]
    story.append(p(styles, "h2", "Assistance"))
    story.append(
        p(
            styles,
            "body",
            f"Pédagogique : {asst['referentPedagogique']['name']} — {asst['referentPedagogique']['mission']}",
        )
    )
    story.append(
        p(
            styles,
            "body",
            f"Technique : {asst['referentTechnique']['name']} — {asst['referentTechnique']['mission']}",
        )
    )
    story.append(
        p(
            styles,
            "body",
            f"Contact : {asst['email']} / {asst['phone']} — délai {asst['responseDelay']}",
        )
    )
    story.append(PageBreak())

    # 2. Réflexes
    story.append(p(styles, "h1", "2. Les 7 réflexes & jalons AI Act"))
    story.append(p(styles, "h2", "Avant d'écrire à l'IA"))
    story.extend(bullets(styles, data["reflexes"]["before"]))
    story.append(p(styles, "h2", "Après la réponse"))
    story.extend(bullets(styles, data["reflexes"]["after"]))
    story.append(p(styles, "h2", "Jalons AI Act (présentés dans le parcours)"))
    for m in data["milestones"]:
        story.append(
            p(styles, "body", f"• {m['date']} — {m['label']} — {m['detail']}")
        )
    story.append(PageBreak())

    # 3. Socle
    story.append(p(styles, "h1", "3. Socle — contenu intégral"))
    story.append(
        p(
            styles,
            "meta",
            "Ci-dessous : chaque chapitre tel qu'il est proposé à l'apprenant "
            "(textes, scripts vidéo, consignes, bonnes réponses, explications).",
        )
    )

    for block in data["blocks"]:
        story.append(PageBreak())
        story.append(
            p(
                styles,
                "h1",
                f"Bloc {block['number']} — {block['title']} ({block['duration']})",
            )
        )
        story.append(p(styles, "body", f"Objectif : {block['goal']}"))
        for chapter in block["chapters"]:
            bits = [
                p(
                    styles,
                    "h2",
                    f"{chapter['id']} — {chapter['title']} ({chapter['duration']} · {chapter['format']})",
                )
            ]
            if chapter.get("subtitle"):
                bits.append(p(styles, "meta", chapter["subtitle"]))
            story.append(KeepTogether(bits))
            render_activity(chapter["activity"], styles, story)
            story.append(Spacer(1, 0.25 * cm))

    # 4. Careers
    story.append(PageBreak())
    story.append(p(styles, "h1", "4. Fiches métiers (parcours optionnels)"))
    story.append(
        p(
            styles,
            "meta",
            "Hors validation obligatoire du socle. Chaque apprenant choisit une fiche.",
        )
    )

    for career in data["careers"]:
        story.append(PageBreak())
        story.append(p(styles, "h1", f"Métier — {career['title']}"))
        story.append(p(styles, "meta", f"{career['duration']} — {career['focus']}"))
        story.append(p(styles, "label", "Pourquoi ce métier est exposé"))
        story.append(p(styles, "body", career["whyExposed"]))
        story.append(p(styles, "label", "Ne jamais coller dans une IA"))
        story.extend(bullets(styles, career["neverList"]))
        story.append(p(styles, "label", "Feu tricolore"))
        for item in career["traffic"]:
            story.append(
                p(
                    styles,
                    "body",
                    f"• [{item['level']}] {item['situation']} — {item['explanation']}",
                )
            )
        story.append(p(styles, "label", "Cas pratiques"))
        for i, case in enumerate(career["cases"], 1):
            story.append(p(styles, "body", f"Situation {i} : {case['situation']}"))
            story.append(p(styles, "body", f"Réponse attendue : {case['answer']}"))
        story.append(p(styles, "label", "Astuces"))
        story.extend(bullets(styles, career["tips"]))
        story.append(p(styles, "label", "Mini-QCM de la fiche"))
        for i, q in enumerate(career["quiz"], 1):
            story.append(p(styles, "body", f"Q{i}. {q['prompt']}"))
            for j, choice in enumerate(q["choices"]):
                mark = "✓" if j == q["correctIndex"] else "·"
                story.append(p(styles, "body", f"  {mark} {choice}"))
            story.append(p(styles, "body", f"  Pourquoi : {q['why']}"))

    # 5. QCM bank
    story.append(PageBreak())
    story.append(p(styles, "h1", "5. Banque QCM d'évaluation (intégrale)"))
    story.append(
        p(
            styles,
            "meta",
            "Banque source du tirage d'examen et du positionnement. "
            "Les bonnes réponses sont marquées ✓.",
        )
    )
    for q in data["questionBank"]:
        story.append(
            KeepTogether(
                [
                    p(
                        styles,
                        "h3",
                        f"{q['id']} — bloc {q.get('blockId')} — thème {q.get('theme') or '—'} — famille {q.get('famille') or '—'}",
                    ),
                    p(styles, "body", q["prompt"]),
                ]
            )
        )
        for j, choice in enumerate(q["choices"]):
            mark = "✓" if j == q["correctIndex"] else "·"
            story.append(p(styles, "body", f"{mark} {choice}"))
        story.append(p(styles, "body", f"Explication : {q['explanation']}"))
        if q.get("explanations"):
            for j, exp in enumerate(q["explanations"]):
                story.append(p(styles, "meta", f"Si choix {j + 1} : {exp}"))

    doc = SimpleDocTemplate(
        str(OUT_PATH),
        pagesize=A4,
        leftMargin=1.8 * cm,
        rightMargin=1.8 * cm,
        topMargin=1.6 * cm,
        bottomMargin=1.8 * cm,
        title=meta["title"],
        author="LockinIA",
        subject="Revue contenu parcours utilisateurs",
    )
    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    print(f"OK → {OUT_PATH}")


if __name__ == "__main__":
    main()
