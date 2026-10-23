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
}

export const employees: Employee[] = [
  { id: "1", name: "Camille Bernard", email: "camille.bernard@atelier-lumiere.fr", role: "Commerce", path: "Socle IA", status: "progress", percent: 40, lastSeen: "30/09/2026", dueDate: "15/10/2026" },
  { id: "2", name: "Marc Lefèvre", email: "marc.lefevre@atelier-lumiere.fr", role: "Atelier", path: "Socle IA", status: "done", percent: 100, lastSeen: "28/09/2026" },
  { id: "3", name: "Inès Bernard", email: "ines.bernard@atelier-lumiere.fr", role: "Comptabilité", path: "Socle IA", status: "progress", percent: 86, lastSeen: "22/09/2026", dueDate: "15/10/2026" },
  { id: "4", name: "Paul Garnier", email: "paul.garnier@atelier-lumiere.fr", role: "Commerce", path: "Socle IA", status: "todo", percent: 0, lastSeen: "04/08/2026", dueDate: "15/10/2026" },
  { id: "5", name: "Sophie Lambert", email: "sophie.lambert@atelier-lumiere.fr", role: "Direction", path: "Socle IA", status: "done", percent: 100, lastSeen: "29/09/2026" },
  { id: "6", name: "Yanis Cohen", email: "yanis.cohen@atelier-lumiere.fr", role: "Support", path: "Socle IA", status: "progress", percent: 18, lastSeen: "01/10/2026", dueDate: "20/10/2026" },
];

export const statusLabel: Record<EmployeeStatus, string> = {
  done: "Terminé",
  progress: "En cours",
  todo: "Non commencé",
};
