import { defaultCompanyModuleMinimum, type CompanyModuleContent } from "@/lib/admin/types";

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
  /** Token d'invitation pending — si présent, le compte n'est pas encore activé */
  inviteToken?: string;
  certificateId?: string | null;
  certifiedAt?: string | null;
  quizScore?: number | null;
  timeSpentSec?: number | null;
  modulesCompleted?: number | null;
  companyName?: string;
  /** Avis à chaud (1–5) */
  satisfactionRating?: number | null;
  satisfactionComment?: string | null;
  satisfactionComplaint?: string | null;
  satisfactionAt?: string | null;
}

/** Jeu de données générique (exemples / tests). */
export const employees: Employee[] = [
  {
    id: "1",
    name: "Camille Bernard",
    email: "camille.bernard@atelier-lumiere.fr",
    role: "Commerce",
    path: "Socle IA",
    status: "progress",
    percent: 25,
    lastSeen: "30/09/2026",
    dueDate: "15/10/2026",
  },
  {
    id: "2",
    name: "Marc Lefèvre",
    email: "marc.lefevre@atelier-lumiere.fr",
    role: "Atelier",
    path: "Socle IA",
    status: "done",
    percent: 100,
    lastSeen: "28/09/2026",
  },
  {
    id: "3",
    name: "Inès Bernard",
    email: "ines.bernard@atelier-lumiere.fr",
    role: "Comptabilité",
    path: "Socle IA",
    status: "progress",
    percent: 86,
    lastSeen: "22/09/2026",
    dueDate: "15/10/2026",
  },
  {
    id: "4",
    name: "Paul Garnier",
    email: "paul.garnier@atelier-lumiere.fr",
    role: "Commerce",
    path: "Socle IA",
    status: "todo",
    percent: 0,
    lastSeen: "04/08/2026",
    dueDate: "15/10/2026",
  },
  {
    id: "5",
    name: "Sophie Lambert",
    email: "sophie.lambert@atelier-lumiere.fr",
    role: "Direction",
    path: "Socle IA",
    status: "done",
    percent: 100,
    lastSeen: "29/09/2026",
  },
  {
    id: "6",
    name: "Yanis Cohen",
    email: "yanis.cohen@atelier-lumiere.fr",
    role: "Support",
    path: "Socle IA",
    status: "progress",
    percent: 18,
    lastSeen: "01/10/2026",
    dueDate: "20/10/2026",
  },
];

/**
 * Roster démo publique : avancements variés, quelques attestations + avis.
 * Le rapport Article 4 reste consultable (aperçu si le suivi n'est pas à 100 %).
 */
export const demoEmployees: Employee[] = [
  {
    id: "d1",
    name: "Camille Bernard",
    email: "camille.bernard@atelier-lumiere.fr",
    role: "Commerce",
    path: "Socle IA",
    status: "done",
    percent: 100,
    lastSeen: "26/10/2026",
    certificateId: "LIA-2026-CAM01",
    certifiedAt: "2026-10-26T09:12:00.000Z",
    quizScore: 92,
    timeSpentSec: 4680,
    modulesCompleted: 33,
    companyName: "Atelier Lumière",
    satisfactionRating: 5,
    satisfactionComment: "Clair et concret, utile dès le lendemain.",
    satisfactionComplaint: null,
    satisfactionAt: "2026-10-26T09:18:00.000Z",
  },
  {
    id: "d2",
    name: "Marc Lefèvre",
    email: "marc.lefevre@atelier-lumiere.fr",
    role: "Atelier",
    path: "Socle IA",
    status: "done",
    percent: 100,
    lastSeen: "25/10/2026",
    certificateId: "LIA-2026-MAR02",
    certifiedAt: "2026-10-25T14:40:00.000Z",
    quizScore: 85,
    timeSpentSec: 5100,
    modulesCompleted: 33,
    companyName: "Atelier Lumière",
    satisfactionRating: 4,
    satisfactionComment: "Les jeux aident vraiment à retenir.",
    satisfactionComplaint: null,
    satisfactionAt: "2026-10-25T14:45:00.000Z",
  },
  {
    id: "d3",
    name: "Inès Bernard",
    email: "ines.bernard@atelier-lumiere.fr",
    role: "Comptabilité",
    path: "Socle IA",
    status: "progress",
    percent: 72,
    lastSeen: "27/10/2026",
    companyName: "Atelier Lumière",
  },
  {
    id: "d4",
    name: "Sophie Lambert",
    email: "sophie.lambert@atelier-lumiere.fr",
    role: "Direction",
    path: "Socle IA",
    status: "done",
    percent: 100,
    lastSeen: "23/10/2026",
    certificateId: "LIA-2026-SOP04",
    certifiedAt: "2026-10-23T16:20:00.000Z",
    quizScore: 96,
    timeSpentSec: 3900,
    modulesCompleted: 33,
    companyName: "Atelier Lumière",
    satisfactionRating: 5,
    satisfactionComment: "Parfait pour documenter notre démarche Art. 4.",
    satisfactionComplaint: null,
    satisfactionAt: "2026-10-23T16:25:00.000Z",
  },
  {
    id: "d5",
    name: "Paul Garnier",
    email: "paul.garnier@atelier-lumiere.fr",
    role: "Commerce",
    path: "Socle IA",
    status: "todo",
    percent: 0,
    lastSeen: "18/10/2026",
    companyName: "Atelier Lumière",
  },
];

export const demoCompanyModule: CompanyModuleContent = {
  ...defaultCompanyModuleMinimum(),
  visible: true,
  contacts:
    "Référent IA : Sophie Lambert\nRH : rh@atelier-lumiere.fr\nEn cas de doute : manager ou référent IA.",
  useCases: [
    {
      id: "uc_demo_copilot",
      service: "Commerce",
      owner: "Camille Bernard",
      population: "Équipe commerciale",
      tool: "Microsoft Copilot",
      vendor: "Microsoft",
      purpose: "Aide à la rédaction de mails clients (sans données sensibles)",
      data: "Formulations génériques, pas de coordonnées clients",
      legalBasis: "Intérêt légitime",
      article22: "Décision humaine conservée",
      aiAct: "Transparence / usage interne",
      aiActJustification: "Assistant rédactionnel encadré",
      aipd: "Non requise à ce stade",
      dpa: "Contrat Microsoft en place",
      transfers: "Hébergement UE selon contrat",
      reviewAt: "2027-01-15",
      status: "conditional",
    },
  ],
  revisions: [
    {
      at: "2026-10-20T10:00:00.000Z",
      summary: "Activation du module entreprise + 1 usage Copilot",
    },
  ],
};

export const statusLabel: Record<EmployeeStatus, string> = {
  done: "Terminé",
  progress: "En cours",
  todo: "Non commencé",
};
