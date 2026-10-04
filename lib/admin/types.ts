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

/** Ligne du registre des usages IA (AI Use Case Register) */
export type AiUseCaseEntry = {
  id: string;
  tool: string;
  purpose: string;
  owner: string;
  status: "authorized" | "review" | "forbidden";
};

export const AI_USE_CASE_STATUS_LABELS: Record<AiUseCaseEntry["status"], string> = {
  authorized: "Autorisé",
  review: "En revue",
  forbidden: "Interdit",
};

/** Contenu du module « Votre entreprise » vu par les collaborateurs */
export type CompanyModuleContent = {
  tools: string;
  charter: string;
  contacts: string;
  declaration: string;
  /** Registre structuré des outils / usages IA */
  useCases: AiUseCaseEntry[];
};

export function emptyCompanyModule(): CompanyModuleContent {
  return { tools: "", charter: "", contacts: "", declaration: "", useCases: [] };
}

export function emptyAiUseCase(): AiUseCaseEntry {
  return {
    id: `uc_${Math.random().toString(36).slice(2, 10)}`,
    tool: "",
    purpose: "",
    owner: "",
    status: "authorized",
  };
}

export function isCompanyModuleFilled(module: CompanyModuleContent | null | undefined): boolean {
  if (!module) return false;
  const hasUseCase = module.useCases?.some(
    (row) => row.tool.trim() || row.purpose.trim() || row.owner.trim(),
  );
  return Boolean(
    module.tools.trim() ||
      module.charter.trim() ||
      module.contacts.trim() ||
      module.declaration.trim() ||
      hasUseCase,
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
