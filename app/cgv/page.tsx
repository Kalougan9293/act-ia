import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "CGV — ConformAI",
};

export default function CgvPage() {
  return (
    <LegalShell title="Conditions générales de vente">
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Vendeur</h2>
        <p>
          Les abonnements ConformAI sont vendus par FITOPS AI, micro-entreprise, 119 rue Jules
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
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Prix</h2>
        <p>
          Le prix est celui affiché sur le site au jour de la commande, pour douze mois : Micro
          290 €, TPE 590 €, PME 990 €. L&apos;offre ETI est établie sur devis. La marque
          blanche pour un organisme de formation ou un cabinet RH va de 2&nbsp;000 à 5&nbsp;000&nbsp;€
          par an et par partenaire, plus un montant par apprenant. Il n&apos;y a pas
          encore de paiement en ligne : la facture est envoyée par e-mail et se règle par virement
          ou par carte.
        </p>
        <p>Le prix est dû à réception de la facture. TVA non applicable, article 293 B du CGI.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Durée et reconduction</h2>
        <p>
          L&apos;abonnement est conclu pour douze mois. Il se reconduit tacitement pour un an, aux
          conditions de prix alors affichées, sauf résiliation par e-mail au moins trente jours
          avant l&apos;échéance. Sans résiliation, une nouvelle facture annuelle est émise.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Impayé</h2>
        <p>
          À défaut de paiement dans les trente jours de la facture, une relance est envoyée.
          L&apos;accès peut ensuite être suspendu jusqu&apos;au règlement, puis résilié si
          l&apos;impayé demeure. Les sommes déjà facturées restent dues.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Fin de contrat</h2>
        <p>
          À l&apos;échéance, les accès sont fermés. Pour les offres PME et ETI, les preuves de
          formation sont conservées douze mois pour l&apos;entreprise cliente, puis supprimées.
          Cette conservation n&apos;est pas incluse dans les offres Micro et TPE. Les factures sont
          conservées dix
          ans. La fermeture anticipée se demande par e-mail ; la période déjà payée n&apos;est pas
          remboursée.
        </p>
      </section>
    </LegalShell>
  );
}
