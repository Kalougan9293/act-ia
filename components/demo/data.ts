export type EmployeeStatus = "done" | "progress" | "todo";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  path: string;
  status: EmployeeStatus;
  percent: number;
  lastSeen: string;
  dueDate?: string;
}

export const employees: Employee[] = [
  { id: "1", name: "Camille Bernard", email: "camille.bernard@atelier-lumiere.fr", role: "Commerce", path: "IA + RGPD", status: "progress", percent: 40, lastSeen: "30/09/2026", dueDate: "15/10/2026" },
  { id: "2", name: "Marc Lefèvre", email: "marc.lefevre@atelier-lumiere.fr", role: "Atelier", path: "IA + RGPD", status: "done", percent: 100, lastSeen: "28/09/2026" },
  { id: "3", name: "Inès Bernard", email: "ines.bernard@atelier-lumiere.fr", role: "Comptabilité", path: "IA + RGPD", status: "progress", percent: 86, lastSeen: "22/09/2026", dueDate: "15/10/2026" },
  { id: "4", name: "Paul Garnier", email: "paul.garnier@atelier-lumiere.fr", role: "Commerce", path: "IA + RGPD", status: "todo", percent: 0, lastSeen: "04/08/2026", dueDate: "15/10/2026" },
  { id: "5", name: "Sophie Lambert", email: "sophie.lambert@atelier-lumiere.fr", role: "Direction", path: "IA + RGPD", status: "done", percent: 100, lastSeen: "29/09/2026" },
  { id: "6", name: "Yanis Cohen", email: "yanis.cohen@atelier-lumiere.fr", role: "Support", path: "IA + RGPD", status: "progress", percent: 18, lastSeen: "01/10/2026", dueDate: "20/10/2026" },
];

export const statusLabel: Record<EmployeeStatus, string> = {
  done: "Terminé",
  progress: "En cours",
  todo: "Non commencé",
};

export const rgdpSteps = [
  "Les données que vous manipulez",
  "Les bons réflexes au quotidien",
  "Que faire en cas de doute",
  "Quiz de validation",
];

export const curriculum = [
  {
    title: "EU AI Act & Article 4",
    theme: "La réglementation",
    modules: [
      { id: "1.1", title: "Pourquoi cette loi ?", summary: "Qu'est-ce que l'AI Act et pourquoi l'Europe encadre l'IA." },
      { id: "1.2", title: "L'Article 4 et la littératie IA", summary: "L'obligation légale pour chaque salarié d'être formé et responsable." },
      { id: "1.3", title: "La classification des risques", summary: "Niveaux de risque : interdit, haut risque, risque limité et IA générative, et ce que ça change au quotidien." },
    ],
  },
  {
    title: "RGPD & Protection des données",
    theme: "La sécurité",
    modules: [
      { id: "2.1", title: "Les pièges des IA génératives", summary: "Ne jamais entrer de données personnelles, de secrets d'affaires ou de données clients dans un prompt." },
      { id: "2.2", title: "Les principes fondamentaux du RGPD", summary: "Confidentialité, consentement, droits des personnes et fuites de données." },
      { id: "2.3", title: "Hallucinations et responsabilité humaine", summary: "Ne pas faire aveuglément confiance à une IA : vérification des faits, droits d'auteur, biais." },
    ],
  },
  {
    title: "Bonnes pratiques & Usages au travail",
    theme: "L'application métier",
    modules: [
      { id: "3.1", title: "La charte IA interne", summary: "Les règles du jeu dans l'entreprise : outils autorisés ou interdits." },
      { id: "3.2", title: "Rédiger des prompts sécurisés", summary: "Utiliser l'IA efficacement sans compromettre les données." },
      { id: "3.3", title: "Les réflexes cybersécurité", summary: "Reconnaître le phishing et les deepfakes générés par IA, et signaler un incident." },
    ],
  },
] as const;

export const pathSteps = [
  { label: "AI Act", title: "Chapitre 1 — EU AI Act & Article 4", state: "done" },
  { label: "RGPD", title: "Chapitre 2 — RGPD & Protection des données", state: "current" },
  { label: "Usages", title: "Chapitre 3 — Bonnes pratiques & Usages au travail", state: "todo" },
  { label: "Quiz", title: "Quiz de validation · 10 à 15 questions · 80 % pour réussir", state: "todo" },
  { label: "Diplôme", title: "Attestation individuelle horodatée", state: "diploma" },
] as const;
