import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";
import { ASSISTANCE } from "@/lib/formation/assistance";
import { PLAN_LABELS, PLAN_PRICES, PLAN_SEATS } from "@/lib/admin/types";

export const metadata: Metadata = {
  title: "CGV — LockinIA",
  description:
    "Conditions générales de vente des abonnements et prestations LockinIA.",
};

export default function CgvPage() {
  return (
    <LegalShell title="Conditions générales de vente">
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Vendeur</h2>
        <p>
          Les abonnements LockinIA sont vendus par FITOPS AI, micro-entreprise, 119 rue Jules
          Parent, Rueil-Malmaison (92500), SIRET 853 780 906 00063. TVA non applicable, article
          293 B du CGI.
        </p>
        <p>
          Contact :{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="mailto:contact@lockin-web.online">
            contact@lockin-web.online
          </a>
          {" · "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="tel:+33662288656">
            06.62.28.86.56
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Champ d&apos;application</h2>
        <p>
          Les présentes CGV s&apos;appliquent à toute commande d&apos;abonnement, de partenariat
          (organisme de formation / revendeur) ou de prestation LockinIA passée par un
          professionnel. Elles prévalent sur tout document du client, sauf accord écrit contraire.
          Les{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="/cgu">
            CGU
          </a>{" "}
          régissent l&apos;usage de la plateforme ; l&apos;
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="/dpa">
            accord de sous-traitance (DPA)
          </a>{" "}
          encadre le traitement des données des collaborateurs.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Commande</h2>
        <p>
          La commande se forme par e-mail, devis accepté ou confirmation écrite (y compris après
          un échange téléphonique). FITOPS AI confirme la mise en service et ouvre les accès
          (compte RH, espace partenaire le cas échéant, invitations, sièges selon l&apos;offre).
          Le client garantit l&apos;exactitude des informations de facturation fournies.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Partenariats (OF / revendeurs)
        </h2>
        <p>
          Les modalités partenaires (tarif partenaire, marque blanche, quota de sièges, durée de
          licence) sont fixées par devis ou conditions particulières. Le partenaire peut créer
          des entreprises clientes dans la limite de son quota. Les stagiaires et suivis restent
          hébergés sur la plateforme LockinIA opérée par FITOPS AI. Sauf cession écrite du
          contenu, le partenaire reçoit une licence d&apos;usage / de commercialisation, sans
          transfert de propriété intellectuelle sur le parcours.
        </p>
        <p>
          Le partenaire reste responsable de sa relation avec ses clients finaux et, le cas
          échéant, de son statut d&apos;organisme de formation. FITOPS AI fournit la plateforme,
          le contenu pédagogique sous licence et l&apos;hébergement technique.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Prix</h2>
        <p>
          Le prix est celui affiché sur le site au jour de la commande, pour douze mois :
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            {PLAN_LABELS.starter} : {PLAN_PRICES.starter}&nbsp;€ / an — jusqu&apos;à{" "}
            {PLAN_SEATS.starter} sièges.
          </li>
          <li>
            {PLAN_LABELS.pro} : {PLAN_PRICES.pro}&nbsp;€ / an — jusqu&apos;à {PLAN_SEATS.pro}{" "}
            sièges.
          </li>
          <li>
            {PLAN_LABELS.pme} : {PLAN_PRICES.pme.toLocaleString("fr-FR")}&nbsp;€ / an — jusqu&apos;à{" "}
            {PLAN_SEATS.pme} sièges.
          </li>
          <li>{PLAN_LABELS.enterprise} : sur devis.</li>
        </ul>
        <p>
          Hors abonnement : le module métier sur mesure au format standard est facturé 690&nbsp;€
          par module (texte, cas pratique et idée d&apos;usage intégrés au parcours) ; une
          demande plus large est établie sur devis ; l&apos;atelier usages et automatisation
          (visio ou présentiel) est établi sur devis. La marque blanche et les partenariats
          organismes de formation / cabinets RH sont établis sur devis (forfait et/ou sièges).
        </p>
        <p>
          Il n&apos;y a pas encore de paiement en ligne : la facture est envoyée par e-mail et se
          règle par virement ou par carte. TVA non applicable, article 293 B du CGI.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Prestations incluses
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Accès à la plateforme selon le nombre de sièges de l&apos;offre.</li>
          <li>
            Parcours de formation socle, attestations de suivi nominatives, synthèse de suivi
            Article&nbsp;4 (écran et export PDF versionné) et espace RH de pilotage.
          </li>
          <li>
            Module entreprise (outils, charte, cas d&apos;usage) renseigné par le RH, visible
            dans le parcours lorsque activé.
          </li>
          <li>
            Exports de preuves à usage interne (attestation individuelle, synthèse, archive
            groupée le cas échéant).
          </li>
          <li>
            Assistance pédagogique et technique nommée (voir ci-dessous), délai de réponse{" "}
            {ASSISTANCE.responseDelay}.
          </li>
        </ul>
        <p>
          Sauf mention contraire sur devis : LockinIA ne fournit pas de conseil juridique, d&apos;audit
          de conformité, ni de certification officielle de l&apos;entreprise. L&apos;attestation
          documente le parcours suivi ; la synthèse Article&nbsp;4 consigne le suivi des
          attestations. Ni l&apos;une ni l&apos;autre ne constitue un diplôme ni une
          certification de l&apos;entreprise.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Modalités de formation à distance (FOAD)
        </h2>
        <p>
          Le parcours LockinIA est dispensé à distance, en asynchrone. Conformément au Code du
          travail, les modalités suivantes s&apos;appliquent. La{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="/programme">
            fiche programme
          </a>{" "}
          détaille objectifs, public, prérequis, déroulé, accessibilité et tarifs.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Activités à distance</strong> : {ASSISTANCE.remoteActivities}
          </li>
          <li>
            <strong>Durée moyenne</strong> : {ASSISTANCE.averageDuration} (socle).
          </li>
          <li>
            <strong>Évaluations</strong> : {ASSISTANCE.evaluation}
          </li>
          <li>
            <strong>{ASSISTANCE.referentPedagogique.role}</strong> :{" "}
            {ASSISTANCE.referentPedagogique.name} — {ASSISTANCE.referentPedagogique.mission}
          </li>
          <li>
            <strong>{ASSISTANCE.referentTechnique.role}</strong> :{" "}
            {ASSISTANCE.referentTechnique.name} — {ASSISTANCE.referentTechnique.mission}
          </li>
          <li>
            <strong>Contact</strong> :{" "}
            <a
              className="text-blue-600 hover:underline dark:text-blue-400"
              href={`mailto:${ASSISTANCE.email}`}
            >
              {ASSISTANCE.email}
            </a>
            {" · "}
            <a
              className="text-blue-600 hover:underline dark:text-blue-400"
              href={ASSISTANCE.phoneHref}
            >
              {ASSISTANCE.phone}
            </a>
          </li>
          <li>
            <strong>Délai de réponse</strong> : {ASSISTANCE.responseDelay}.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Paiement</h2>
        <p>
          Le prix est dû à réception de la facture, sauf délai différent indiqué sur la facture
          ou le devis. Le règlement s&apos;effectue par virement bancaire ou par carte, selon les
          modalités communiquées avec la facture.
        </p>
        <p>
          En cas de retard de paiement, et conformément aux articles L.441-10 et D.441-5 du code
          de commerce : pénalités de retard au taux de trois fois le taux d&apos;intérêt légal, et
          indemnité forfaitaire de recouvrement de 40&nbsp;€. FITOPS AI se réserve le droit de
          réclamer une indemnité complémentaire si les frais de recouvrement dépassent ce montant.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Durée et reconduction</h2>
        <p>
          L&apos;abonnement est conclu pour douze mois à compter de la mise en service. Il se
          reconduit tacitement pour un an, aux conditions de prix alors affichées, sauf
          résiliation par e-mail au moins trente jours avant l&apos;échéance. Sans résiliation, une
          nouvelle facture annuelle est émise.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Impayé</h2>
        <p>
          À défaut de paiement dans les trente jours de la facture, une relance est envoyée.
          L&apos;accès peut ensuite être suspendu jusqu&apos;au règlement, puis résilié si
          l&apos;impayé demeure. Les sommes déjà facturées restent dues, y compris pénalités et
          indemnité forfaitaire le cas échéant.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Fin de contrat</h2>
        <p>
          À l&apos;échéance, les accès sont fermés. Les preuves de formation (attestations,
          résultats par module, relevés de connexion liés au parcours, synthèses Article&nbsp;4
          encore dues) restent disponibles pour l&apos;entreprise cliente pendant l&apos;année
          civile de réalisation de l&apos;action et les trois années civiles suivantes, puis sont
          supprimées. Un rappel est adressé avant reconduction tacite. Les factures sont
          conservées dix ans. La fermeture anticipée se demande par e-mail ; la période déjà
          payée n&apos;est pas remboursée.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Rétractation
        </h2>
        <p>
          Les présentes CGV s&apos;adressent à des professionnels. Le droit de rétractation prévu
          pour les consommateurs ne s&apos;applique pas.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Responsabilité
        </h2>
        <p>
          FITOPS AI est tenu à une obligation de moyens. Sa responsabilité globale au titre d&apos;un
          abonnement ou d&apos;une prestation est plafonnée aux montants effectivement versés par
          le client au cours des douze derniers mois, sauf faute lourde ou dol. LockinIA ne
          garantit pas à elle seule la conformité réglementaire de l&apos;entreprise.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Force majeure
        </h2>
        <p>
          Aucune partie n&apos;est responsable d&apos;un manquement dû à un événement de force
          majeure au sens de l&apos;article 1218 du code civil (y compris panne majeure
          d&apos;infrastructure hors de son contrôle raisonnable).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Données personnelles
        </h2>
        <p>
          Les données sont hébergées de façon mutualisée chez FITOPS AI, avec isolation logique
          par entreprise et, le cas échéant, par partenaire. FITOPS AI agit en sous-traitant :
          pas de revente ni d&apos;usage marketing des données clients. Les indicateurs agrégés
          (volumes, sièges, complétion) sont consultables pour le pilotage ; l&apos;accès
          nominatif par FITOPS AI est limité au support, à la sécurité, à la facturation, aux
          obligations légales et à la maintenance.
        </p>
        <p>
          Ce cadre est détaillé dans l&apos;
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="/dpa">
            accord de sous-traitance (DPA)
          </a>{" "}
          et la{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="/confidentialite">
            politique de confidentialité
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Modification des CGV
        </h2>
        <p>
          FITOPS AI peut modifier les CGV. Le contact RH en est informé par e-mail au moins
          trente jours avant. Le changement s&apos;applique à la reconduction suivante, sauf
          correction exigée par la loi, qui peut s&apos;appliquer dès l&apos;information. En cas
          de refus, le client résilie avant l&apos;échéance dans les conditions ci-dessus.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Droit applicable</h2>
        <p>
          Droit français. En cas de litige, et à défaut d&apos;accord amiable, les tribunaux
          compétents seront saisis selon les règles en vigueur.
        </p>
      </section>
    </LegalShell>
  );
}
