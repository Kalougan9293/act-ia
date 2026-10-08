export const faqs = [
  {
    question: "L'article 4 de l'AI Act concerne-t-il mon entreprise ?",
    answer:
      "Oui, dès que des personnes utilisent une IA pour le travail de l'entreprise. Cette obligation s'applique depuis le 2 février 2025. Le 2 décembre 2026, de nouvelles interdictions arrivent.",
  },
  {
    question: "Que risque une entreprise qui ne forme pas ses équipes ?",
    answer:
      "Au contrôle, sans dossier, les équipes sont considérées comme non formées. ConformAI prépare les attestations et le registre avant le 2 décembre 2026.",
  },
  {
    question: "Faut-il former tous les salariés à l'IA ?",
    answer:
      "Non. Seulement les personnes qui utilisent l'IA pour l'entreprise. Le registre indique qui est concerné.",
  },
  {
    question: "Combien de temps dure la formation IA ?",
    answer:
      "Max 1h30, en une fois ou en plusieurs fois. Elle se suit sur téléphone, tablette ou ordinateur, sans rien installer.",
  },
  {
    question: "ConformAI est-il un diplôme ou une certification ?",
    answer:
      "C'est une attestation nominative : la preuve, pour chaque personne, que le parcours a été suivi. Au contrôle, c'est cette preuve qui est demandée, pas un diplôme.",
  },
  {
    question: "Que reçoit le DPO ou la direction ?",
    answer:
      "Une attestation générale pour l'entreprise, les attestations de chaque personne, leur avancement et le registre des usages, y compris les outils hors charte. Le dossier s'exporte en ZIP et en JSON.",
  },
  {
    question: "Comment voir qui n'a pas terminé ?",
    answer:
      "Le tableau de bord montre les personnes en retard, équipe par équipe. La direction voit tout de suite qui doit encore suivre la formation.",
  },
  {
    question: "La formation est-elle mise à jour si la loi change ?",
    answer:
      "Oui. Les modules sont mis à jour selon l'actualité, et vous êtes informés. Les équipes ne repartent pas de zéro.",
  },
  {
    question: "Combien coûte ConformAI ?",
    answer:
      "290 € par an jusqu'à 5 salariés, 590 € jusqu'à 20, 990 € jusqu'à 50. Au-delà, l'offre est sur devis. La TVA ne s'applique pas.",
  },
  {
    question: "Un OPCO peut-il financer la formation ?",
    answer:
      "Une prise en charge est possible via un organisme de formation partenaire Qualiopi, selon l'éligibilité.",
  },
  {
    question: "Peut-on ajouter un module propre à notre métier ?",
    answer:
      "Oui, à la demande, à partir de l'offre TPE. Ce module s'ajoute au parcours, sur devis.",
  },
  {
    question: "Où sont hébergées les données ?",
    answer:
      "Les comptes, la formation et le registre sont stockés dans l'Union européenne. Le détail est dans la politique de confidentialité.",
  },
] as const;

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
