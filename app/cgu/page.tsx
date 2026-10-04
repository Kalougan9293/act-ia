import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "CGU — ConformAI",
};

export default function CguPage() {
  return (
    <LegalShell title="Conditions générales d'utilisation">
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
          L&apos;accès est réservé aux personnes invitées ou rattachées à une structure cliente.
          Vous êtes responsable de la confidentialité de vos identifiants.
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
          le parcours suivi ; elle ne constitue ni diplôme ni certification officielle AI Act /
          RGPD.
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
