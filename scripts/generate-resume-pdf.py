"""Génère un PDF A–Z du site LockinIA (accueil, parcours, FOAD, offre, technique)."""

from __future__ import annotations

import os
from datetime import date

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))

OUT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "docs", "LockinIA-resume-projet.pdf")
)

W, H = A4
BLUE = HexColor("#2563eb")
BLUE_DARK = HexColor("#1e3a8a")
SLATE = HexColor("#0f172a")
MUTED = HexColor("#475569")
LIGHT = HexColor("#f1f5f9")
BORDER = HexColor("#e2e8f0")
SOFT = HexColor("#eff6ff")

MARGIN = 16 * mm
CONTENT_W = W - 2 * MARGIN
FONT = "Arial"
FONT_B = "Arial-Bold"
TODAY = date.today().isoformat()


class Doc:
    def __init__(self, path: str):
        self.path = path
        self.c = canvas.Canvas(path, pagesize=A4)
        self.page = 0
        self.y = 0
        self.c.setTitle("LockinIA — Dossier complet du site & parcours")
        self.c.setAuthor("FITOPS AI")
        self.c.setSubject(
            "Synthèse A–Z : page d'accueil, parcours utilisateurs, FOAD, offre, technique"
        )
        self.new_page(first=True)

    def new_page(self, first: bool = False):
        if not first:
            self._footer()
            self.c.showPage()
        self.page += 1
        self.c.setFillColor(BLUE_DARK)
        self.c.rect(0, H - 18 * mm, W, 18 * mm, fill=1, stroke=0)
        self.c.setFillColor(BLUE)
        self.c.rect(0, H - 18 * mm, 3.5 * mm, 18 * mm, fill=1, stroke=0)
        self.c.setFillColor(white)
        self.c.setFont(FONT_B, 14)
        self.c.drawString(MARGIN, H - 8.5 * mm, "LockinIA")
        self.c.setFont(FONT, 8)
        self.c.drawString(
            MARGIN + 28 * mm, H - 8.2 * mm, "— dossier complet (accueil & parcours)"
        )
        self.c.drawRightString(
            W - MARGIN, H - 7 * mm, "FITOPS AI · contact@lockin-web.online"
        )
        self.c.setFont(FONT, 7)
        self.c.drawRightString(
            W - MARGIN, H - 12.5 * mm, f"Généré le {TODAY} · Next.js 16 + Firebase"
        )
        self.y = H - 26 * mm

    def _footer(self):
        self.c.setStrokeColor(BORDER)
        self.c.setLineWidth(0.5)
        self.c.line(MARGIN, 12 * mm, W - MARGIN, 12 * mm)
        self.c.setFillColor(MUTED)
        self.c.setFont(FONT, 7)
        self.c.drawString(
            MARGIN,
            7 * mm,
            "Document interne de synthèse — dépôt act-platform · non contractuel",
        )
        self.c.drawRightString(W - MARGIN, 7 * mm, f"{self.page}")

    def need(self, h: float):
        if self.y - h < 18 * mm:
            self.new_page()

    def h1(self, text: str):
        self.need(14 * mm)
        self.c.setFillColor(BLUE)
        self.c.rect(MARGIN, self.y - 1.5 * mm, 3 * mm, 5 * mm, fill=1, stroke=0)
        self.c.setFillColor(SLATE)
        self.c.setFont(FONT_B, 13)
        self.c.drawString(MARGIN + 5 * mm, self.y, text)
        self.y -= 8 * mm

    def h2(self, text: str):
        self.need(10 * mm)
        self.c.setFillColor(SLATE)
        self.c.setFont(FONT_B, 10)
        self.c.drawString(MARGIN, self.y, text)
        self.y -= 5.5 * mm

    def para(self, text: str, size: float = 8.5, leading: float = 11, color=MUTED):
        lines = self._wrap(text, CONTENT_W, FONT, size)
        self.need(len(lines) * leading + 2 * mm)
        self.c.setFont(FONT, size)
        self.c.setFillColor(color)
        for ln in lines:
            self.c.drawString(MARGIN, self.y, ln)
            self.y -= leading
        self.y -= 2 * mm

    def bullet(self, text: str, size: float = 8, leading: float = 10.5):
        max_w = CONTENT_W - 5 * mm
        lines = self._wrap(text, max_w, FONT, size)
        self.need(len(lines) * leading + 1.5 * mm)
        self.c.setFillColor(BLUE)
        self.c.circle(MARGIN + 1.5 * mm, self.y + 1.8, 1.1, fill=1, stroke=0)
        self.c.setFillColor(MUTED)
        self.c.setFont(FONT, size)
        for i, ln in enumerate(lines):
            self.c.drawString(MARGIN + 5 * mm, self.y - i * leading, ln)
        self.y -= len(lines) * leading + 1.5 * mm

    def kv(self, key: str, value: str):
        self.need(6 * mm)
        self.c.setFont(FONT_B, 8)
        self.c.setFillColor(SLATE)
        self.c.drawString(MARGIN, self.y, key)
        kw = stringWidth(key + "  ", FONT_B, 8)
        lines = self._wrap(value, CONTENT_W - kw, FONT, 8)
        self.c.setFont(FONT, 8)
        self.c.setFillColor(MUTED)
        self.c.drawString(MARGIN + kw, self.y, lines[0] if lines else "")
        self.y -= 10.5
        for ln in lines[1:]:
            self.need(10.5)
            self.c.drawString(MARGIN + kw, self.y, ln)
            self.y -= 10.5
        self.y -= 1 * mm

    def box(self, title: str, lines: list[str]):
        body_lines = []
        for t in lines:
            body_lines.extend(self._wrap(t, CONTENT_W - 8 * mm, FONT, 7.5))
        h = 8 * mm + len(body_lines) * 9.5 + 4 * mm
        self.need(h)
        top = self.y
        self.c.setFillColor(SOFT)
        self.c.roundRect(MARGIN, top - h + 3 * mm, CONTENT_W, h, 3, fill=1, stroke=0)
        self.c.setFillColor(BLUE)
        self.c.setFont(FONT_B, 8.5)
        self.c.drawString(MARGIN + 3 * mm, top - 4 * mm, title)
        y = top - 9 * mm
        self.c.setFont(FONT, 7.5)
        self.c.setFillColor(MUTED)
        for ln in body_lines:
            self.c.drawString(MARGIN + 3 * mm, y, ln)
            y -= 9.5
        self.y = top - h - 2 * mm

    def table(
        self,
        headers: list[str],
        rows: list[list[str]],
        col_w: list[float] | None = None,
    ):
        n = len(headers)
        if col_w is None:
            col_w = [CONTENT_W / n] * n
        row_h = 6.5 * mm
        self.need(row_h * (len(rows) + 1) + 2 * mm)
        x = MARGIN
        self.c.setFillColor(BLUE_DARK)
        self.c.rect(MARGIN, self.y - row_h + 2 * mm, CONTENT_W, row_h, fill=1, stroke=0)
        self.c.setFillColor(white)
        self.c.setFont(FONT_B, 7.5)
        for i, h in enumerate(headers):
            self.c.drawString(x + 1.5 * mm, self.y - 3.5 * mm, h)
            x += col_w[i]
        self.y -= row_h
        for ri, row in enumerate(rows):
            self.need(row_h)
            if ri % 2 == 0:
                self.c.setFillColor(LIGHT)
                self.c.rect(
                    MARGIN, self.y - row_h + 2 * mm, CONTENT_W, row_h, fill=1, stroke=0
                )
            x = MARGIN
            self.c.setFillColor(MUTED)
            self.c.setFont(FONT, 7.2)
            for i, cell in enumerate(row):
                max_w = col_w[i] - 3 * mm
                t = cell
                while stringWidth(t, FONT, 7.2) > max_w and len(t) > 3:
                    t = t[:-2]
                if t != cell:
                    t = t[:-1] + "…"
                self.c.drawString(x + 1.5 * mm, self.y - 3.5 * mm, t)
                x += col_w[i]
            self.y -= row_h
        self.y -= 3 * mm

    def spacer(self, mm_h: float = 3):
        self.y -= mm_h * mm

    @staticmethod
    def _wrap(text: str, max_w: float, font: str, size: float) -> list[str]:
        words = text.split()
        lines: list[str] = []
        line = ""
        for w in words:
            test = (line + " " + w).strip()
            if stringWidth(test, font, size) <= max_w:
                line = test
            else:
                if line:
                    lines.append(line)
                line = w
        if line:
            lines.append(line)
        return lines or [""]

    def save(self):
        self._footer()
        self.c.save()
        print(self.path)


def build():
    d = Doc(OUT)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)

    # ——— 0. Sommaire ———
    d.h1("Sommaire")
    for t in [
        "1. Pitch & positionnement",
        "2. Page d'accueil (/) — sections détaillées",
        "3. Cartographie complète des routes",
        "4. Parcours utilisateurs (connexion → rôles)",
        "5. Parcours apprenant (/utilisateur)",
        "6. Espace RH (/rh)",
        "7. Super admin (/admin) & démo",
        "8. Formation FOAD (socle, QCM, attestation)",
        "9. Offre commerciale & options",
        "10. Accompagnement (/interventions)",
        "11. Pages légales & conformité",
        "12. FAQ (thèmes)",
        "13. Stack technique & données",
        "14. Assistance FOAD & Qualiopi",
        "15. Checklist analyse externe",
        "16. Contacts & identité",
    ]:
        d.bullet(t)

    # ——— 1. Pitch ———
    d.h1("1. Pitch & positionnement")
    d.para(
        "LockinIA est une plateforme SaaS B2B (FITOPS AI) pour former les salariés à l'IA "
        "et aux bons usages des données au travail, au titre de l'article 4 de l'AI Act "
        "(depuis le 2 février 2025 ; Omnibus 2026 : soutenir la maîtrise de l'IA). "
        "Objectif : parcours prêt, attestations nominatives, suivi RH et preuves "
        "exportables — pas un diplôme, ni une certification de conformité."
    )
    d.box(
        "Promesse produit",
        [
            "Des réflexes concrets pour utiliser l'IA sans se faire piéger ni mettre "
            "l'entreprise en danger — AI Act (art. 4) et bases du RGPD —, avec une "
            "attestation de suivi à la fin.",
            "Durée socle : 1 h 15 (examen compris), en une ou plusieurs sessions, "
            "mobile / desktop.",
            "Intitulé officiel : « Sensibilisation à la maîtrise de l'IA et aux bons "
            "usages des données au travail ».",
        ],
    )
    d.h2("Pour qui")
    for t in [
        "Micro → ETI dont les équipes utilisent ChatGPT, Copilot ou outils similaires",
        "Acheteurs typiques : RH, direction, DPO / référent IA",
        "Porte d'entrée produit = SaaS formation + preuves ; service = /interventions",
    ]:
        d.bullet(t)

    # ——— 2. Landing ———
    d.h1("2. Page d'accueil (/) — sections")
    d.para(
        "Fichier app/page.tsx. Navbar + 9 blocs de contenu + footer. "
        "JSON-LD FAQ (lib/landing/faq.ts). SEO : « À partir de 390 € par an »."
    )
    d.h2("Navbar")
    for t in [
        "Liens : Accueil, Accompagnement (/interventions), ancre tarifs (#pricing)",
        "Contact mailto ; CTA « Espace RH » → /rh (ou connexion selon session)",
    ]:
        d.bullet(t)
    d.h2("Ordre des sections")
    d.table(
        ["#", "Composant", "Contenu clé"],
        [
            ["1", "Hero", "Badge Art. 4 · H1 attestation IA+RGPD · 1 h 15 · CTA mailto + /demo"],
            ["2", "ReviewsSection", "Témoignages (formateur RS, avocat AI Act/RGPD)"],
            ["3", "TrustBanner", "Traces documentées, formateur RS, suivi RH, SaaS 1 h 15"],
            ["4", "ProblemSection", "3 risques : preuves Art. 4, fuites RGPD, charge RH"],
            ["5", "FeaturesSection", "3 piliers : salariés / entreprise / métiers"],
            ["6", "DeploySection", "Déploiement en 5 minutes (navigateur + lien + suivi)"],
            ["7", "PricingSection", "Micro 390 · TPE 790 · PME 1 290 · ETI devis + options"],
            ["8", "GoFurtherSection", "Pont vers /interventions + contact"],
            ["9", "FAQSection", "22 questions (Art. 4, RGPD, durée, OPCO, UE…)"],
            ["—", "Footer", "Liens légaux + programme + conformité"],
        ],
        [10 * mm, 32 * mm, CONTENT_W - 42 * mm],
    )
    d.h2("CTA principaux landing")
    for t in [
        "Demander un accès → mailto (sujet Demande LockinIA)",
        "Tester la démo → /demo",
        "Tarifs → #pricing ; Accompagnement → /interventions",
        "Fiche programme / OPCO → /programme",
    ]:
        d.bullet(t)

    # ——— 3. Routes ———
    d.h1("3. Cartographie complète des routes")
    d.h2("Marketing & contenus")
    d.table(
        ["Route", "Rôle"],
        [
            ["/", "Landing complète (hero → FAQ)"],
            ["/interventions", "Accompagnement : Former / Automatiser / Intégrer"],
            ["/programme", "Fiche programme FOAD + changelog contenu V1.0"],
            ["/demo", "Démo sans compte (vues RH + collaborateur)"],
            ["/ai-act", "Pédagogie article 4 / Omnibus 2026 / limites"],
            ["/rgpd", "Lien IA × RGPD (sensibilisation, renvois légaux)"],
        ],
        [36 * mm, CONTENT_W - 36 * mm],
    )
    d.h2("Application")
    d.table(
        ["Route", "Rôle"],
        [
            ["/connexion", "Auth Firebase ; redirect par rôle ; ?next="],
            ["/utilisateur", "Parcours apprenant complet"],
            ["/rh", "Espace RH : sièges, suivi %, module entreprise, export"],
            ["/admin", "Super admin : structures, users, attestations, exports"],
            ["/admin/candidats/[id]", "Fiche détail apprenant"],
            ["/invitation/[token]", "Invitation nominative (souvent RH)"],
            ["/rejoindre/[token]", "Lien permanent structure (1ère connexion si créé)"],
        ],
        [42 * mm, CONTENT_W - 42 * mm],
    )
    d.h2("Pages légales")
    d.table(
        ["Route", "Contenu clé"],
        [
            ["/cgu", "Usage plateforme, assistance FOAD nommée"],
            ["/cgv", "Prix, FOAD, délais, reconduction 12 mois"],
            ["/confidentialite", "Finalités ; preuves année + 3 ; logs 12 mois"],
            ["/dpa", "Sous-traitance Firestore UE (eur3)"],
            ["/mentions-legales", "FITOPS AI ; Vercel (front) ; Firebase UE"],
            ["/cookies", "Cookies"],
        ],
        [38 * mm, CONTENT_W - 38 * mm],
    )

    # ——— 4. Parcours utilisateurs ———
    d.h1("4. Parcours utilisateurs — connexion & rôles")
    d.h2("Rôles")
    d.table(
        ["Rôle", "Destination", "Droits principaux"],
        [
            ["employee", "/utilisateur", "Suivre le parcours, attestation PDF"],
            ["rh", "/rh", "Sièges, suivi, module entreprise, export ZIP"],
            ["super_admin", "/admin", "Toutes structures, CSV/ZIP, provision"],
        ],
        [28 * mm, 28 * mm, CONTENT_W - 56 * mm],
    )
    d.para(
        "RH peut aussi accéder à /utilisateur uniquement si formationEnrolled. "
        "Super admin : compte dédié (accès plateforme restreint)."
    )
    d.h2("Flux /connexion")
    for t in [
        "Login classique ou première connexion (compte firstLogin pending créé par RH)",
        "Mot de passe : ≥ 8 car., 1 majuscule, 1 caractère spécial",
        "Redirect : super_admin → /admin · rh → /rh · employee → /utilisateur",
        "Paramètre ?next= respecté si la cible est autorisée pour le rôle",
    ]:
        d.bullet(t)
    d.h2("Invitations")
    for t in [
        "/invitation/[token] : invite nominative (collection invites) → MDP → redirect rôle",
        "/rejoindre/[token] : lien permanent structure (structureInvites) — pas d'auto-"
        "inscription libre ; 1ère connexion seulement si le RH a créé l'accès (firstLogin)",
    ]:
        d.bullet(t)

    # ——— 5. Apprenant ———
    d.h1("5. Parcours apprenant (/utilisateur)")
    d.para(
        "Composants UserApp + FormationExperience. Auth : employee ou RH inscrit "
        "formation. Journal de connexion FOAD (useConnectionLog) pour exports Qualiopi. "
        "Lexique flottant (FloatingLexiconFab)."
    )
    d.h2("Enchaînement des écrans")
    d.table(
        ["Écran", "Rôle"],
        [
            ["intro", "Accueil : objectifs et modalités (~5 min)"],
            ["positioning", "QCM diagnostic non éliminatoire (~5 min)"],
            ["hub", "Vue des 6 blocs / chapitres (vidéos verrouillées)"],
            ["chapitres", "30 chapitres : vidéos + activités interactives"],
            ["company", "Module entreprise (bonus, hors % validation)"],
            ["quiz", "QCM final 20 Q, seuil 80 %, chrono indicatif 12 min"],
            ["satisfaction", "Note 1–5 + commentaire + canal réclamation"],
            ["career", "Fiche métier bonus (~8 min, 10 parcours)"],
        ],
        [28 * mm, CONTENT_W - 28 * mm],
    )
    d.h2("Règles de progression")
    for t in [
        "Validation attestation : intro + tous les chapitres socle + QCM réussi",
        "% barre RH : intro + chapitres + quiz (max 99 % jusqu'à QCM OK) ; "
        "module entreprise / métier n'impactent pas le 100 %",
        "Attestation PDF téléchargeable (ID type LIA-YYYY-XXXXX ; anciens SIA-/CONF- encore lus)",
        "Assistance visible : Jonathan Seroussi, e-mail + téléphone, 48 h ouvrées",
    ]:
        d.bullet(t)

    # ——— 6. RH ———
    d.h1("6. Espace RH (/rh)")
    d.para("HrView : pilotage multi-collaborateurs d'une structure (sièges).")
    for t in [
        "Liste collaborateurs (+ RH inscrits formation) : % avancement, certificats, "
        "scores QCM, temps attestation",
        "Lien permanent /rejoindre/{inviteToken} (copie presse-papier)",
        "Ajouter un collaborateur → crée firstLogin pending ; plafond seatsMax / seatsUsed",
        "Module entreprise : outils autorisés, charte, contacts, déclaration, "
        "registre usages IA (brouillon → interdit)",
        "Export dossier preuves ZIP (JSON + PDF rapport) — désactivé en mode démo",
        "Vision des retardataires / relances (barre de couleur selon %)",
    ]:
        d.bullet(t)

    # ——— 7. Admin & démo ———
    d.h1("7. Super admin (/admin) & démo (/demo)")
    d.h2("Admin")
    for t in [
        "Structures actives / archivées, utilisateurs, invites pending",
        "Facturation par plan (starter/pro/pme/enterprise), sièges, satisfaction",
        "Création structure + invite sièges, provision RH",
        "Fiche /admin/candidats/[id]",
        "CSV de la vue courante + ZIP rapport complet",
        "Suppression users / structures (Auth + Firestore)",
    ]:
        d.bullet(t)
    d.h2("Démo")
    d.para(
        "Essai sans compte : bascule Vue RH / Vue Utilisateurs (DemoApp). "
        "Données fictives ; export ZIP désactivé ; ne remplace pas les preuves production."
    )

    # ——— 8. Formation ———
    d.h1("8. Formation FOAD (socle, QCM, attestation)")
    d.kv("Modalité", "100 % à distance, asynchrone (vidéos, textes, activités, quiz)")
    d.kv("Durée socle", "1 h 15 (activités + évaluation), une ou plusieurs sessions")
    d.kv("Seuil QCM", "80 / 100 (16 bonnes réponses sur 20)")
    d.kv("Positionnement", "Non éliminatoire (banque 8 Q oui/non)")
    d.kv("Version contenu", "V1.0 — changelog content-changelog (veille tracée)")
    d.h2("6 blocs · 30 chapitres")
    d.table(
        ["Bloc", "Titre", "Durée", "Chap."],
        [
            ["1", "L'IA, c'est quoi ?", "10 min", "7"],
            ["2", "Le code de la route de l'IA", "8 min", "5"],
            ["3", "Mes données et mes secrets", "12 min", "7"],
            ["4", "C'est vous qui décidez", "10 min", "6"],
            ["5", "Le deepfake", "7 min", "3"],
            ["6", "Les 7 réflexes", "5 min", "2"],
        ],
        [14 * mm, CONTENT_W - 50 * mm, 18 * mm, 18 * mm],
    )
    d.h2("Déroulé programme (/programme)")
    d.table(
        ["Étape", "Durée", "Détail"],
        [
            ["Accueil", "≈ 5 min", "Objectifs et modalités"],
            ["Positionnement", "≈ 5 min", "QCM diagnostic"],
            ["Blocs 1–6", "52 min", "Voir tableau ci-dessus"],
            ["Évaluation finale", "≈ 10 min", "QCM 20 Q · seuil 80 % · chrono 12 min indicatif"],
            ["Attestation", "—", "PDF nominatif + snapshot preuves"],
            ["Bonus", "variable", "Module entreprise + fiche métier (hors socle)"],
        ],
        [40 * mm, 22 * mm, CONTENT_W - 62 * mm],
    )
    d.h2("Activités & bonus")
    for t in [
        "Formats : video, sort, stamp, predict, spot, text, fiche, tetris, traffic… "
        "(ActivityPlayer)",
        "Fiches métiers : 10 parcours (~8 min) — direction, rh, marketing, managers, "
        "tech, finance, support, tous, expert-comptable, immobilier",
        "Après QCM : satisfaction à chaud + réclamation intégrée",
    ]:
        d.bullet(t)
    d.h2("Preuves & exports")
    for t in [
        "Firestore users/{uid}/progress/formation : sessions, résultats modules, scores, "
        "satisfaction",
        "certificates/{id} : attestation figée (score, date, temps, modules)",
        "RH : ZIP (dossier.json, releves-connexion.json, resultats-modules.json, "
        "attestations, PDF rapport)",
        "Admin : CSV vue + ZIP rapport complet",
        "Conservation annoncée : année civile de formation + 3 années civiles",
    ]:
        d.bullet(t)
    d.h2("Jalons AI Act (contenu pédagogique)")
    for t in [
        "2 fév. 2025 — Art. 4 + pratiques interdites (Art. 5)",
        "2 août 2025 — Modèles usage général",
        "2 août 2026 — Art. 50 transparence",
        "2 déc. 2026 — Deepfakes intimes",
        "2 déc. 2027 — Haut risque Annexe III (RH/recrutement)",
        "2 août 2028 — Haut risque Annexe I",
    ]:
        d.bullet(t)

    # ——— 9. Offre ———
    d.h1("9. Offre commerciale")
    d.h2("Abonnements annuels (TVA non applicable, art. 293 B CGI)")
    d.table(
        ["Offre", "Plan admin", "Sièges", "Prix", "Inclus notable"],
        [
            ["Micro", "starter", "1–5", "390 €/an", "Socle + fiches + module entreprise + exports"],
            ["TPE", "pro", "6–20", "790 €/an", "Tout Micro + assistance prioritaire"],
            ["PME", "pme", "21–50", "1 290 €/an", "Tout TPE"],
            ["ETI", "enterprise", "+50", "Devis", "Intégrations + assistance dédiée"],
        ],
        [20 * mm, 22 * mm, 18 * mm, 22 * mm, CONTENT_W - 82 * mm],
    )
    d.h2("Options hors abonnement")
    for t in [
        "Module métier sur mesure : 690 € (texte + cas + idée d'usage) ; plus large = devis",
        "Marque blanche (OF / cabinet RH) : devis",
        "Atelier usages & automatisation (visio / présentiel) : devis → /interventions",
        "Pas de paiement en ligne (CGV) : commande email/devis, virement ou carte",
        "Abonnement 12 mois, reconduction tacite — distinct de la rétention des preuves",
    ]:
        d.bullet(t)
    d.h2("Conservation annoncée")
    d.para(
        "Preuves de formation : année civile de réalisation + 3 années civiles. "
        "Factures : 10 ans. Journaux techniques : 12 mois."
    )

    # ——— 10. Interventions ———
    d.h1("10. Accompagnement (/interventions)")
    d.para(
        "Hors abonnement SaaS. Hero : « Ne testez pas l'IA. Faites-en un outil de "
        "travail. » Vidéo plein écran. CTA mailto sujet « Accompagnement IA — LockinIA »."
    )
    for t in [
        "Former — ateliers pratiques (usages, données, prompts)",
        "Automatiser — cartographie ROI, assistants, workflows",
        "Intégrer — cas d'usage, règles, validations humaines durables",
        "CTA final : « Échanger sur mon projet »",
    ]:
        d.bullet(t)

    # ——— 11. Légal ———
    d.h1("11. Pages légales & conformité")
    for t in [
        "Mentions : FITOPS AI ; hébergeur site Vercel (US) ; données Firestore UE (eur3) ; "
        "attestation ≠ certification entreprise",
        "Confidentialité : compte, formation, registre IA ; pas de DPO désigné",
        "CGU : comptes invités ; assistance nommée (mêmes textes que ASSISTANCE)",
        "CGV : prix site ; FOAD détaillée ; pas conseil juridique ; /programme",
        "DPA : sous-traitant données salariés pour le compte client",
        "/ai-act & /rgpd : pédagogie + limites de responsabilité",
    ]:
        d.bullet(t)

    # ——— 12. FAQ ———
    d.h1("12. FAQ landing — thèmes (22 questions)")
    for t in [
        "Art. 4 & Omnibus 2026 ; qui est concerné ; pas d'amende spécifique art. 4",
        "RGPD × IA (prompts, secrets) ; pas d'audit RGPD organisationnel",
        "Soutenir la maîtrise ≠ garantir l'expertise de chaque salarié",
        "Documenter les mesures ; qui former ; parcours en ligne vs guides CNIL",
        "Pas d'organisme / heures imposés ; durée 1 h 15 ; nature de l'attestation",
        "Exports DPO/direction ; retardataires ; mises à jour loi ; renouvellement",
        "Tarifs 390/790/1290 ; marque blanche ; OPCO/Qualiopi ; /programme",
        "Module 690 € ; atelier vs module ; assistance Jonathan ; hébergement UE",
    ]:
        d.bullet(t)

    # ——— 13. Stack ———
    d.h1("13. Stack technique & données")
    d.para(
        "Next.js 16.3 · React 19 · TypeScript · Tailwind 4 · Framer Motion · Lucide · "
        "Firebase Auth + Firestore (région UE eur3) · firebase-admin · "
        "front typiquement Vercel (déploiement GitHub main). Pas de Stripe — "
        "facturation manuelle."
    )
    d.h2("Collections Firestore principales")
    for t in [
        "users/{uid} (+ progress/formation, certificates/{id})",
        "structures/{id} (module entreprise, billing, archivage)",
        "structureInvites/{token} (sièges seatsMax / seatsUsed)",
        "invites/{token} (invitations nominatives)",
        "firstLogin/{email} (pending 1ère connexion)",
        "config/initialized (bootstrap super admin)",
        "contactLeads (leads interventions — écriture admin SDK)",
    ]:
        d.bullet(t)
    d.h2("Multi-tenant")
    d.para("Rôles super_admin · rh · employee — cloisonnement par structureId.")

    # ——— 14. Assistance ———
    d.h1("14. Assistance FOAD & Qualiopi")
    d.kv("Référent pédagogique", "Jonathan Seroussi — contenu, objectifs, évaluations")
    d.kv("Référent technique", "Jonathan Seroussi — accès, bugs, plateforme")
    d.kv("Contact", "contact@lockin-web.online · 06.62.28.86.56")
    d.kv("Délai", "Sous 48 heures ouvrées")
    d.kv("Handicap", "Adaptations possibles (rythme, formats) — même référent")
    d.box(
        "Statut Qualiopi (wording site)",
        [
            "« Démarche Qualiopi en cours. LockinIA n'est pas présenté comme un organisme "
            "certifié Qualiopi tant que la certification n'est pas obtenue. »",
            "OPCO : possible sous réserve d'éligibilité et, le cas échéant, via un OF "
            "partenaire Qualiopi. Aucun financement n'est garanti.",
            "Fiche programme publique : /programme. Veille : content-changelog V1.0.",
        ],
    )

    # ——— 15. Checklist ———
    d.h1("15. Checklist pour analyse externe")
    d.table(
        ["Thème", "Statut produit", "À noter pour un OF partenaire"],
        [
            ["Fiche programme", "OK /programme", "À valider / co-branding OF"],
            ["FOAD assistance", "OK nommé + 48 h", "Convention qui porte l'action"],
            ["Positionnement", "OK", "—"],
            ["Éval. + seuil 80 %", "OK", "—"],
            ["Satisfaction / réclamations", "OK post-QCM", "Process OF à brancher"],
            ["Relevés connexion", "OK sessions + modules", "Exporter avant audit"],
            ["Attestations", "OK LIA-YYYY-…", "Qui émet « OF » vs LockinIA"],
            ["Conservation +3 ans", "OK + archive accès", "Aligner contrat OF"],
            ["Veille datée", "OK changelog", "Mettre à jour à chaque maj"],
            ["Qualiopi", "Démarche en cours", "Pas revendiqué comme certifié"],
            ["OPCO", "Mention prudent", "Montage via partenaire"],
            ["Contrat partenariat", "Hors produit", "À rédiger hors code"],
        ],
        [38 * mm, 42 * mm, CONTENT_W - 80 * mm],
    )

    # ——— 16. Contacts ———
    d.h1("16. Contacts & identité")
    d.kv("Éditeur", "FITOPS AI (micro-entreprise)")
    d.kv("SIRET", "853 780 906 00063")
    d.kv("Adresse", "119 rue Jules Parent, 92500 Rueil-Malmaison")
    d.kv("E-mail / tél.", "contact@lockin-web.online · 06.62.28.86.56")
    d.kv("Publication", "Jonathan Seroussi")
    d.spacer(4)
    d.box(
        "Limite de ce document",
        [
            "Synthèse produit dérivée du code et des pages publiques au " + TODAY + ".",
            "Ne constitue pas un conseil juridique, ni une garantie Qualiopi / OPCO.",
            "Pour une analyse fine du contenu pédagogique : /demo ou /utilisateur.",
        ],
    )

    d.save()


if __name__ == "__main__":
    build()
