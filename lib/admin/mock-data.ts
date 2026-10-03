import type { PlatformUser, Structure } from "./types";

/** Données locales — remplacées par Firestore après branchement Firebase */
export const mockStructures: Structure[] = [
  {
    id: "str_atelier",
    name: "Atelier Lumière",
    createdAt: "2026-03-12",
    status: "active",
    archivedAt: null,
    inviteToken: "invite_atelier_demo",
    billing: {
      companyName: "Atelier Lumière SAS",
      siret: "812 456 789 00012",
      billingEmail: "facturation@atelier-lumiere.fr",
      address: "14 rue des Arts, 69001 Lyon",
      phone: "04 78 12 34 56",
      plan: "pro",
      seats: 20,
      priceMonthlyEur: 590,
      nextInvoiceAt: "2027-03-12",
    },
  },
  {
    id: "str_nova",
    name: "Nova Retail",
    createdAt: "2026-06-02",
    status: "active",
    archivedAt: null,
    inviteToken: "invite_nova_demo",
    billing: {
      companyName: "Nova Retail SA",
      siret: "521 334 110 00045",
      billingEmail: "finance@nova-retail.fr",
      address: "8 avenue de la République, 75011 Paris",
      phone: "01 44 55 66 77",
      plan: "starter",
      seats: 5,
      priceMonthlyEur: 290,
      nextInvoiceAt: "2027-06-02",
    },
  },
  {
    id: "str_green",
    name: "GreenTech Solutions",
    createdAt: "2026-08-20",
    status: "invited",
    archivedAt: null,
    inviteToken: "invite_green_demo",
    billing: {
      companyName: "GreenTech Solutions SARL",
      siret: "901 223 445 00033",
      billingEmail: "admin@greentech-solutions.fr",
      address: "22 quai de la Douane, 33000 Bordeaux",
      phone: "05 56 98 76 54",
      plan: "enterprise",
      seats: 120,
      priceMonthlyEur: 0,
      nextInvoiceAt: "2027-08-20",
    },
  },
];

export const mockUsers: PlatformUser[] = [
  {
    id: "usr_super",
    email: "admin@conformai.fr",
    name: "Super Admin",
    role: "super_admin",
    structureId: null,
    status: "active",
    lastLoginAt: "2026-10-02",
    createdAt: "2026-01-01",
    progressPercent: null,
    certificateId: null,
    certifiedAt: null,
    quizScore: null,
  },
  {
    id: "usr_rh_atelier",
    email: "rh@atelier-lumiere.fr",
    name: "Sophie Lambert",
    role: "rh",
    structureId: "str_atelier",
    status: "active",
    lastLoginAt: "2026-10-01",
    createdAt: "2026-03-12",
    progressPercent: 100,
    certificateId: "CAI-2026-AL-0042",
    certifiedAt: "2026-03-20",
    quizScore: 96,
  },
  {
    id: "usr_emp_camille",
    email: "camille.bernard@atelier-lumiere.fr",
    name: "Camille Bernard",
    role: "employee",
    structureId: "str_atelier",
    status: "active",
    lastLoginAt: "2026-09-30",
    createdAt: "2026-03-15",
    progressPercent: 40,
    certificateId: null,
    certifiedAt: null,
    quizScore: null,
  },
  {
    id: "usr_emp_marc",
    email: "marc.lefevre@atelier-lumiere.fr",
    name: "Marc Lefèvre",
    role: "employee",
    structureId: "str_atelier",
    status: "active",
    lastLoginAt: "2026-09-28",
    createdAt: "2026-03-15",
    progressPercent: 100,
    certificateId: "CAI-2026-AL-0018",
    certifiedAt: "2026-09-28",
    quizScore: 94,
  },
  {
    id: "usr_emp_ines",
    email: "ines.bernard@atelier-lumiere.fr",
    name: "Inès Bernard",
    role: "employee",
    structureId: "str_atelier",
    status: "active",
    lastLoginAt: "2026-09-22",
    createdAt: "2026-03-15",
    progressPercent: 86,
    certificateId: null,
    certifiedAt: null,
    quizScore: null,
  },
  {
    id: "usr_rh_nova",
    email: "rh@nova-retail.fr",
    name: "Julie Martin",
    role: "rh",
    structureId: "str_nova",
    status: "active",
    lastLoginAt: "2026-09-29",
    createdAt: "2026-06-02",
    progressPercent: 100,
    certificateId: "CAI-2026-NR-0007",
    certifiedAt: "2026-06-18",
    quizScore: 91,
  },
  {
    id: "usr_emp_nova",
    email: "alex.dupont@nova-retail.fr",
    name: "Alex Dupont",
    role: "employee",
    structureId: "str_nova",
    status: "invited",
    lastLoginAt: null,
    createdAt: "2026-06-05",
    progressPercent: 0,
    certificateId: null,
    certifiedAt: null,
    quizScore: null,
  },
  {
    id: "usr_emp_lea",
    email: "lea.petit@nova-retail.fr",
    name: "Léa Petit",
    role: "employee",
    structureId: "str_nova",
    status: "active",
    lastLoginAt: "2026-09-15",
    createdAt: "2026-06-08",
    progressPercent: 100,
    certificateId: "CAI-2026-NR-0012",
    certifiedAt: "2026-09-15",
    quizScore: 88,
  },
  {
    id: "usr_rh_green",
    email: "rh@greentech-solutions.fr",
    name: "Karim Benali",
    role: "rh",
    structureId: "str_green",
    status: "invited",
    lastLoginAt: null,
    createdAt: "2026-08-20",
    progressPercent: 0,
    certificateId: null,
    certifiedAt: null,
    quizScore: null,
  },
];

export function findUserById(id: string) {
  return mockUsers.find((u) => u.id === id) ?? null;
}

export function findStructureById(id: string | null) {
  if (!id) return null;
  return mockStructures.find((s) => s.id === id) ?? null;
}

export function searchCandidates(query: string, users: PlatformUser[] = mockUsers) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return users.filter((u) => {
    if (u.role === "super_admin") return false;
    const hay = [u.name, u.email, u.certificateId ?? ""]
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });
}

export function structureGraduates(structureId: string, users: PlatformUser[]) {
  const members = users.filter((u) => u.structureId === structureId);
  const graduated = members.filter((u) => u.progressPercent === 100).length;
  return { graduated, total: members.length };
}
