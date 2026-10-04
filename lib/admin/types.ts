/** Rôles plateforme — mappés plus tard sur Firebase Auth custom claims */
export type UserRole = "super_admin" | "rh" | "employee";

export type AccountStatus = "active" | "invited" | "suspended";

export type PlanId = "starter" | "pro" | "pme" | "enterprise";

export interface BillingInfo {
  companyName: string;
  siret: string;
  billingEmail: string;
  address: string;
  phone: string;
  plan: PlanId;
  seats: number;
  /** Prix abonnement annuel HT (€) — nom historique conservé */
  priceMonthlyEur: number;
  nextInvoiceAt: string;
}

/** Contenu du module « Votre entreprise » vu par les collaborateurs */
export type CompanyModuleContent = {
  tools: string;
  charter: string;
  contacts: string;
  declaration: string;
};

export function emptyCompanyModule(): CompanyModuleContent {
  return { tools: "", charter: "", contacts: "", declaration: "" };
}

export function isCompanyModuleFilled(module: CompanyModuleContent | null | undefined): boolean {
  if (!module) return false;
  return Boolean(
    module.tools.trim() ||
      module.charter.trim() ||
      module.contacts.trim() ||
      module.declaration.trim(),
  );
}

export interface Structure {
  id: string;
  name: string;
  billing: BillingInfo;
  createdAt: string;
  status: AccountStatus;
  /** ISO date si archivée — null = active */
  archivedAt: string | null;
  /** Lien permanent d'invitation collaborateurs */
  inviteToken: string | null;
  /** Module entreprise renseigné par le RH */
  companyModule: CompanyModuleContent;
}

export interface PlatformUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  structureId: string | null;
  status: AccountStatus;
  /** Fonction métier (Commerce, RH…) — distincte du rôle plateforme */
  jobTitle?: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  /** Avancement formation 0–100 — null si non concerné (ex. admin) */
  progressPercent: number | null;
  /** N° d'attestation de suivi une fois le parcours validé — pour support / audit */
  certificateId: string | null;
  /** Date d'émission de l'attestation (ISO) */
  certifiedAt: string | null;
  /** Score quiz final — null si le parcours n'est pas validé */
  quizScore: number | null;
}

export interface StructureFormValues {
  name: string;
  siret: string;
  billingEmail: string;
  address: string;
  plan: PlanId;
  seats: number;
  rhName: string;
  rhEmail: string;
  phone: string;
  createdAt: string;
  nextInvoiceAt: string;
}

export const PLAN_LABELS: Record<PlanId, string> = {
  starter: "Micro",
  pro: "TPE",
  pme: "PME",
  enterprise: "ETI",
};

export const PLAN_PRICES: Record<PlanId, number> = {
  starter: 290,
  pro: 590,
  pme: 990,
  enterprise: 0,
};

export const PLAN_SEATS: Record<PlanId, number> = {
  starter: 5,
  pro: 20,
  pme: 50,
  enterprise: 100,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super admin",
  rh: "RH",
  employee: "Collaborateur",
};

export const STATUS_LABELS: Record<AccountStatus, string> = {
  active: "Actif",
  invited: "Invité",
  suspended: "Suspendu",
};
