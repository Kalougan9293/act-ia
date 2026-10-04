import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "AI Act — ConformAI",
};

export default function AiActPage() {
  return (
    <LegalShell title="AI Act">
      <p>
        ConformAI aide les organisations à documenter des mesures de maîtrise de l&apos;IA au titre
        de l&apos;article 4 du règlement européen sur l&apos;intelligence artificielle (AI Act),
        applicable depuis le 2 février 2025.
      </p>
      <p>
        La plateforme propose une formation courte, des attestations de suivi et un suivi RH. Elle
        ne remplace pas un accompagnement juridique.
      </p>
    </LegalShell>
  );
}
