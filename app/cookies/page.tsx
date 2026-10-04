import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Cookies — ConformAI",
};

export default function CookiesPage() {
  return (
    <LegalShell title="Cookies et stockage local">
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">En bref</h2>
        <p>
          ConformAI n&apos;utilise <strong>pas</strong> de cookies publicitaires ni de traceurs
          analytics tiers. Aucun bandeau de consentement n&apos;est requis pour les seuls éléments
          techniques indispensables au service.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Ce qui est utilisé</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Authentification Firebase</strong> : session nécessaire pour rester connecté
            (mécanismes techniques du fournisseur d&apos;auth).
          </li>
          <li>
            <strong>Préférence de thème</strong> (clair / sombre) enregistrée dans le navigateur
            (<code className="rounded bg-slate-100 px-1 text-xs dark:bg-slate-800">localStorage</code>
            ).
          </li>
          <li>
            <strong>Cache de progression formation</strong> en local pour éviter une perte en cas
            de coupure réseau, synchronisé ensuite avec le serveur.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Gestion</h2>
        <p>
          Vous pouvez effacer les données du site via les paramètres de votre navigateur. La
          déconnexion met fin à la session active.
        </p>
        <p>
          Contact :{" "}
          <a className="text-blue-600 hover:underline dark:text-blue-400" href="mailto:contact@lockin-web.online">
            contact@lockin-web.online
          </a>
          .
        </p>
      </section>
    </LegalShell>
  );
}
