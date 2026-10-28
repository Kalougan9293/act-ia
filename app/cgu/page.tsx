import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";
import { ASSISTANCE } from "@/lib/formation/assistance";

export const metadata: Metadata = {
  title: "CGU — LockinIA",
};

export default function CguPage() {
  return (
    <LegalShell title="Conditions générales d'utilisation">
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Éditeur</h2>
        <p>
          LockinIA est édité par FITOPS AI, 119 rue Jules Parent, Rueil-Malmaison (92500),
          SIRET 853 780 906 00063.
        </p>
        <p>
          Micro-entreprise, sans capital social. TVA non applicable, article 293 B du CGI.
          Directeur de la publication : Jonathan Seroussi.
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
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Objet</h2>
        <p>
          Les présentes CGU régissent l&apos;accès à LockinIA : formation, attestations de suivi,
          outils de pilotage RH et, le cas échéant, espace partenaire (organismes de formation ou
          revendeurs).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Compte</h2>
        <p>
          L&apos;abonnement peut être souscrit directement par l&apos;entreprise cliente, ou via un
          partenaire (organisme de formation / revendeur) disposant d&apos;un espace dédié. Dans
          tous les cas, l&apos;accès des salariés est réservé aux personnes invitées ou rattachées
          à leur structure. Chacun est responsable de la confidentialité de ses identifiants.
        </p>
        <p>
          Rôles principaux : <strong>super-administrateur</strong> LockinIA (FITOPS AI) ;{" "}
          <strong>partenaire</strong> (pilotage de ses entreprises clientes et quotas) ;{" "}
          <strong>RH</strong> (pilotage des collaborateurs de sa structure) ;{" "}
          <strong>apprenant</strong> (parcours et attestation).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Hébergement mutualisé et isolation
        </h2>
        <p>
          LockinIA est une plateforme mutualisée : les comptes, parcours et suivis sont hébergés
          sur l&apos;infrastructure de FITOPS AI (Firebase / Google Cloud en Union européenne pour
          les données de compte et de formation ; Vercel pour l&apos;affichage du site). Les
          données de chaque entreprise (et, le cas échéant, de chaque partenaire) sont isolées
          logiquement par contrôles d&apos;accès : un RH ne voit que sa structure ; un partenaire
          ne voit que ses entreprises clientes.
        </p>
        <p>
          FITOPS AI n&apos;exploite pas les données des clients à des fins commerciales propres
          (prospection, revente, profilage marketing). L&apos;accès technique ou nominatif par
          FITOPS AI est limité au support, à la sécurité, à la facturation, à la maintenance et
          aux obligations légales. Les indicateurs agrégés (volumes, sièges, taux de
          complétion) peuvent être consultés pour le pilotage du service.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Assistance pédagogique et technique
        </h2>
        <p>
          Pendant le parcours à distance, une assistance nommée est disponible :{" "}
          <strong>{ASSISTANCE.referentPedagogique.role}</strong> et{" "}
          <strong>{ASSISTANCE.referentTechnique.role}</strong> —{" "}
          {ASSISTANCE.referentPedagogique.name}. Contact :{" "}
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
          . Délai de réponse : {ASSISTANCE.responseDelay}. Les modalités FOAD (activités, durée
          moyenne, évaluations) figurent dans les{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="/cgv">
            CGV
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Usage</h2>
        <p>
          La plateforme doit être utilisée conformément à sa destination, sans détournement, sans
          tentative d&apos;accès non autorisé et sans extraction abusive des contenus.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Contenu & attestation</h2>
        <p>
          Les contenus pédagogiques sont indicatifs et évolutifs. L&apos;attestation de suivi prouve
          le parcours suivi et documente les mesures au titre de l&apos;article 4. Elle ne constitue
          ni diplôme, ni certification officielle, ni certification de l&apos;entreprise.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Propriété</h2>
        <p>
          Les contenus pédagogiques, la marque LockinIA et l&apos;interface appartiennent à FITOPS
          AI. L&apos;entreprise cliente (ou le partenaire pour le périmètre qu&apos;il gère)
          reste responsable et « propriétaire » de ses données opérationnelles : liste des
          salariés, registre des usages et attestations. FITOPS AI ne les revend pas et ne les
          réutilise pas pour un autre client. La licence d&apos;usage du contenu pédagogique
          n&apos;emporte aucun transfert de propriété intellectuelle.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Partenaires (OF / revendeurs)
        </h2>
        <p>
          Un partenaire peut créer et suivre des entreprises clientes dans les limites de son
          quota contractuel, consulter des statistiques agrégées et les contacts RH nécessaires
          au déploiement. Sauf besoin de support ou stipulation contraire au contrat, le
          partenaire n&apos;utilise pas le détail nominatif des parcours de tous les apprenants
          comme un fichier commercial. Face au client final, le partenaire demeure responsable
          de sa relation commerciale et, le cas échéant, de son statut d&apos;organisme de
          formation ; FITOPS AI fournit la plateforme et le parcours sous licence.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Durée et résiliation</h2>
        <p>
          L&apos;abonnement dure douze mois à compter de la mise en service. Il se reconduit
          tacitement pour une nouvelle période d&apos;un an, sauf résiliation par e-mail à{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="mailto:contact@lockin-web.online">
            contact@lockin-web.online
          </a>{" "}
          au moins trente jours avant l&apos;échéance. L&apos;accès reste ouvert jusqu&apos;à la fin
          de la période déjà facturée. Le temps restant n&apos;est pas remboursé.
        </p>
        <p>
          Les prix, le paiement et cette reconduction sont détaillés dans les{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="/cgv">
            conditions générales de vente
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Suspension et suppression</h2>
        <p>
          L&apos;accès peut être suspendu en cas d&apos;impayé après relance, ou d&apos;usage
          contraire aux présentes. Il reprend lorsque la situation est régularisée.
        </p>
        <p>
          La suppression du compte se demande par e-mail au même contact. L&apos;entreprise demande
          la fermeture de sa structure. Un salarié demande la suppression de son accès. Les preuves
          de formation restent disponibles pour l&apos;employeur pendant l&apos;année civile de
          réalisation de l&apos;action et les trois années civiles suivantes, et les factures
          pendant dix ans.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Modification des CGU</h2>
        <p>
          FITOPS AI peut modifier les CGU. Le contact RH en est informé par e-mail au moins trente
          jours avant. Le changement s&apos;applique à la reconduction suivante, sauf correction
          exigée par la loi ou par la sécurité du service, qui peut s&apos;appliquer dès
          l&apos;information. Si l&apos;entreprise refuse le changement, elle résilie avant
          l&apos;échéance, dans les conditions ci-dessus.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Responsabilité</h2>
        <p>
          LockinIA est tenue à une obligation de moyens dans la fourniture de ses services de
          sensibilisation, de cartographie et d&apos;aide à la documentation. Ces services ne
          constituent pas un conseil juridique et ne garantissent pas à eux seuls la conformité
          réglementaire. Chaque fiche d&apos;usage doit être validée par le DPO ou le référent
          juridique de l&apos;entreprise.
        </p>
        <p>
          La responsabilité globale de LockinIA au titre de ces services est plafonnée aux
          montants effectivement versés par l&apos;entreprise cliente au cours des douze (12)
          derniers mois, sauf en cas de faute lourde ou de dol. L&apos;entreprise cliente demeure
          responsable de ses décisions, de ses validations et de la mise en œuvre des obligations
          qui lui sont applicables.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Données</h2>
        <p>
          Le traitement des données personnelles est décrit dans la{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="/confidentialite">
            politique de confidentialité
          </a>
          . Lorsque FITOPS AI traite des données de collaborateurs pour le compte de
          l&apos;entreprise (et, le cas échéant, dans le cadre d&apos;un partenariat OF), l&apos;
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="/dpa">
            accord de sous-traitance (DPA)
          </a>{" "}
          s&apos;applique.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Disponibilité</h2>
        <p>
          Nous visons une disponibilité continue, sans garantie d&apos;absence d&apos;interruption.
          Des maintenances peuvent intervenir.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Droit applicable</h2>
        <p>Droit français. En cas de litige, les tribunaux compétents seront saisis selon les règles en vigueur.</p>
      </section>
    </LegalShell>
  );
}
