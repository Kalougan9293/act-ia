export const faqs = [
  {
    question: "L'article 4 de l'AI Act concerne-t-il mon entreprise ?",
    answer:
      "Oui, dès que des personnes utilisent une IA pour le travail de l'entreprise, y compris ChatGPT ou Copilot. Depuis le 2 février 2025, vous devez prendre des mesures pour développer la maîtrise de l'IA. Il n'y a pas de seuil de taille : même une TPE est concernée, avec un effort proportionné à ses usages.",
  },
  {
    question: "Quel lien entre l'IA et le RGPD dans la formation ?",
    answer:
      "Dès qu'un salarié colle un nom, un e-mail, une voix ou un fichier client dans ChatGPT, Copilot ou un outil similaire, le RGPD s'applique. Le parcours StartIA rappelle les réflexes concrets : quoi saisir ou ne pas saisir, données personnelles, secrets d'entreprise, et quand alerter le DPO ou le référent. Ce n'est pas un audit RGPD de votre organisation : c'est la sensibilisation utile au quotidien face à l'IA.",
  },
  {
    question: "Faut-il garantir que chaque salarié « maîtrise » l'IA ?",
    answer:
      "Non. La loi ne vous demande pas de prouver que chaque salarié est expert en IA. Elle vous demande de prendre des mesures concrètes, adaptées à vos usages, et de pouvoir les documenter. Sans mesures documentées, il devient difficile de montrer que vous avez agi en cas de contrôle.",
  },
  {
    question: "Que se passe-t-il si on n'a rien documenté ?",
    answer:
      "En cas de contrôle, d'incident ou d'audit client, il devient très difficile de prouver que vous avez agi. StartIA constitue pour vous un suivi clair : attestations nominatives et avancement des parcours, pour documenter concrètement votre démarche Article 4.",
  },
  {
    question: "Faut-il former tous les salariés ?",
    answer:
      "Non. Priorité à celles et ceux qui utilisent l'IA pour le travail de l'entreprise, y compris intérimaires ou prestataires qui s'en servent pour votre compte. Pas besoin de former toute l'organisation si une partie n'utilise pas l'IA.",
  },
  {
    question: "Un parcours en ligne suffit-il ?",
    answer:
      "Oui, si le parcours est adapté aux usages et documenté. Une vidéo générique seule ne suffit pas. StartIA combine un socle commun, des modules selon le métier et des preuves de suivi, pour répondre concrètement à l'obligation.",
  },
  {
    question: "Faut-il un organisme certifié ou un volume d'heures imposé ?",
    answer:
      "Non. Le texte n'impose ni organisme, ni label, ni durée. Une formation bien documentée peut répondre à l'obligation. Si vous visez une prise en charge OPCO, un partenaire Qualiopi reste possible.",
  },
  {
    question: "Combien de temps dure la formation ?",
    answer:
      "Le socle tient 1 h 00, examen compris, en une fois ou en plusieurs sessions. Accessible sur téléphone, tablette ou ordinateur, sans rien installer. Des modules métier courts s'ajoutent ensuite en bonus.",
  },
  {
    question: "StartIA est-il un diplôme ou une certification ?",
    answer:
      "Non. C'est une attestation nominative de suivi : qui a suivi le parcours, quand, avec quel résultat. Elle documente votre démarche Article 4. Ce n'est ni un diplôme, ni une certification officielle de conformité à l'AI Act.",
  },
  {
    question: "Que reçoit le DPO ou la direction ?",
    answer:
      "Les attestations individuelles, l'avancement en temps réel, le suivi des parcours, et un rapport d'engagement quand le suivi est à jour. Tout est exportable en ZIP et JSON pour vos audits.",
  },
  {
    question: "Comment voir qui n'a pas terminé ?",
    answer:
      "Le tableau de bord met en évidence chaque personne en retard. La direction sait immédiatement qui doit encore suivre le parcours, sans relancer à l'aveugle.",
  },
  {
    question: "La formation est-elle mise à jour si la loi change ?",
    answer:
      "Oui. Les modules suivent l'actualité réglementaire et vous êtes informés des changements. Vos équipes avancent sur le nouveau contenu, sans tout recommencer.",
  },
  {
    question: "Combien coûte StartIA ?",
    answer:
      "290 € par an jusqu'à 5 salariés, 590 € jusqu'à 20, 990 € jusqu'à 50. Au-delà, l'offre est sur devis. La TVA ne s'applique pas. Des attestations claires, sans budget formation externe à chaque équipe.",
  },
  {
    question: "Qu'est-ce que l'option marque blanche ?",
    answer:
      "Une version de la plateforme à l'image de votre entreprise : votre logo et vos couleurs. Vos équipes voient votre marque, le fonctionnement reste le même. Disponible sur devis.",
  },
  {
    question: "Un OPCO peut-il financer la formation ?",
    answer:
      "Oui, une prise en charge est possible via un organisme de formation partenaire Qualiopi, selon votre éligibilité. StartIA peut s'inscrire dans ce montage pour alléger le reste à charge.",
  },
  {
    question: "Peut-on ajouter un module propre à notre métier ?",
    answer:
      "Oui, à la demande, dès l'offre TPE. Le module s'ajoute à votre parcours pour coller à vos usages réels, sur devis.",
  },
  {
    question: "Où sont hébergées les données ?",
    answer:
      "Les comptes, la formation et le suivi sont stockés dans l'Union européenne. Vos données restent sous cadre européen ; le détail figure dans la politique de confidentialité.",
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
