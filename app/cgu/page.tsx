import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "CGU — ConformAI",
};

export default function CguPage() {
  return (
    <LegalShell title="Conditions générales d'utilisation">
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Éditeur</h2>
        <p>
          ConformAI est édité par FITOPS AI, 119 rue Jules Parent, Rueil-Malmaison (92500),
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
          Les présentes CGU régissent l&apos;accès à ConformAI : formation, attestations de suivi et
          outils de pilotage RH associés.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Compte</h2>
        <p>
          L&apos;abonnement est souscrit par l&apos;entreprise cliente. L&apos;accès des salariés est
          réservé aux personnes invitées ou rattachées à cette structure. Chacun est responsable
          de la confidentialité de ses identifiants.
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
          Les contenus pédagogiques, la marque ConformAI et l&apos;interface appartiennent à FITOPS
          AI. L&apos;entreprise cliente reste propriétaire de ses données : liste des salariés,
          registre des usages et attestations. FITOPS AI ne les revend pas et ne les réutilise pas
          pour un autre client.
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
          de formation restent disponibles pour l&apos;employeur pendant douze mois après la fin du
          contrat, et les factures pendant dix ans.
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
          ConformAI est tenue à une obligation de moyens dans la fourniture de ses services de
          sensibilisation, de cartographie et d&apos;aide à la documentation. Ces services ne
          constituent pas un conseil juridique et ne garantissent pas à eux seuls la conformité
          réglementaire. Chaque fiche d&apos;usage doit être validée par le DPO ou le référent
          juridique de l&apos;entreprise.
        </p>
        <p>
          La responsabilité globale de ConformAI au titre de ces services est plafonnée aux
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
          .
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
