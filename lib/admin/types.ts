/** Rôles plateforme — mappés plus tard sur Firebase Auth custom claims */
export type UserRole = "super_admin" | "partner" | "rh" | "employee";

/** Organisme de formation / partenaire revendeur */
export interface Partner {
  id: string;
  name: string;
  /** E-mail de contact / facturation partenaire */
  email: string;
  siret: string;
  status: AccountStatus;
  createdAt: string;
  /** ISO date si révoqué / archivé — null = actif */
  archivedAt: string | null;
  /** Quota global d'accès stagiaires allouables à ses entreprises */
  seatsMax: number;
  /** Fin de licence partenaire (AAAA-MM-JJ), null = pas de date */
  licenseExpiresAt: string | null;
  /** Notes internes admin */
  notes?: string | null;
}

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

/** Statuts du workflow Shadow AI (CDC) */
export type AiUseCaseStatus = "draft" | "analysis" | "pending" | "conditional" | "forbidden";

/** Fiche du registre des usages IA */
export type AiUseCaseEntry = {
  id: string;
  service: string;
  owner: string;
  population: string;
  tool: string;
  vendor: string;
  purpose: string;
  data: string;
  legalBasis: string;
  article22: string;
  aiAct: string;
  aiActJustification: string;
  aipd: string;
  dpa: string;
  transfers: string;
  /** Prochaine réévaluation, AAAA-MM-JJ */
  reviewAt: string;
  status: AiUseCaseStatus;
};

export type ModuleRevision = {
  at: string;
  summary: string;
};

export const AI_USE_CASE_STATUS_LABELS: Record<AiUseCaseStatus, string> = {
  draft: "Brouillon",
  analysis: "En analyse",
  pending: "En attente",
  conditional: "Autorisé sous conditions",
  forbidden: "Interdit",
};

const LEGACY_USE_CASE_STATUS: Record<string, AiUseCaseStatus> = {
  authorized: "conditional",
  review: "analysis",
  forbidden: "forbidden",
  draft: "draft",
  analysis: "analysis",
  pending: "pending",
  conditional: "conditional",
};

const USE_CASE_TEXT_KEYS = [
  "service",
  "owner",
  "population",
  "tool",
  "vendor",
  "purpose",
  "data",
  "legalBasis",
  "article22",
  "aiAct",
  "aiActJustification",
  "aipd",
  "dpa",
  "transfers",
  "reviewAt",
] as const;

/** Contenu du module « Votre entreprise » vu par les collaborateurs */
export type CompanyModuleContent = {
  /** Affiché aux collaborateurs. Défaut : masqué. */
  visible: boolean;
  tools: string;
  charter: string;
  contacts: string;
  declaration: string;
  /** Registre structuré des outils / usages IA */
  useCases: AiUseCaseEntry[];
  /** Historique horodaté des enregistrements du module */
  revisions: ModuleRevision[];
};

export function emptyCompanyModule(): CompanyModuleContent {
  return {
    visible: false,
    tools: "",
    charter: "",
    contacts: "",
    declaration: "",
    useCases: [],
    revisions: [],
  };
}

/** Base minimale affichée quand le RH active le module. */
export function defaultCompanyModuleMinimum(): CompanyModuleContent {
  return {
    visible: true,
    tools:
      "Outils courants (à adapter par votre RH) :\n- ChatGPT / Copilot : usage pro sans données personnelles ni secrets\n\nInterdit :\n- Coller CV, salaires, données clients ou secrets dans une IA grand public\n- Extensions navigateur non validées",
    charter:
      "Règles d'usage :\n1. Je n'y mets jamais de données personnelles ou confidentielles sans validation.\n2. Je vérifie toujours le résultat avant de l'envoyer.\n3. Je reste responsable de ce que je publie ou décide.\n4. En cas de doute, je demande au référent IA.",
    contacts:
      "Référent IA : à compléter par votre RH\nEn cas de doute : contactez votre manager ou le service RH.",
    declaration:
      "Pour déclarer un nouvel outil ou usage IA :\n1. En informer le référent IA / RH\n2. Attendre le feu vert avant un usage large\n3. Ne pas brancher d'extension non validée",
    useCases: [],
    revisions: [],
  };
}

export function emptyAiUseCase(): AiUseCaseEntry {
  return {
    id: `uc_${Math.random().toString(36).slice(2, 10)}`,
    service: "",
    owner: "",
    population: "",
    tool: "",
    vendor: "",
    purpose: "",
    data: "",
    legalBasis: "",
    article22: "",
    aiAct: "",
    aiActJustification: "",
    aipd: "",
    dpa: "",
    transfers: "",
    reviewAt: "",
    status: "draft",
  };
}

export function normalizeAiUseCase(raw: unknown, index = 0): AiUseCaseEntry {
  const item = (raw ?? {}) as Record<string, unknown>;
  const blank = emptyAiUseCase();
  const next: AiUseCaseEntry = { ...blank, id: String(item.id ?? `uc_${index}`) };
  for (const key of USE_CASE_TEXT_KEYS) {
    next[key] = String(item[key] ?? "");
  }
  next.status = LEGACY_USE_CASE_STATUS[String(item.status ?? "")] ?? "draft";
  return next;
}

export function isAiUseCaseFilled(row: AiUseCaseEntry): boolean {
  return USE_CASE_TEXT_KEYS.some((key) => key !== "reviewAt" && row[key].trim().length > 0);
}

export function isCompanyModuleFilled(module: CompanyModuleContent | null | undefined): boolean {
  if (!module) return false;
  const hasUseCase = module.useCases?.some((row) => isAiUseCaseFilled(row));
  return Boolean(
    module.tools.trim() ||
      module.charter.trim() ||
      module.contacts.trim() ||
      module.declaration.trim() ||
      hasUseCase,
  );
}

/** Synthèse / rapport de suivi Art. 4 — figé & versionné côté structure */
export interface Article4ReportRecord {
  /** Première fois où le suivi est complet (tous attestés) — ISO, figé */
  firstIssuedAt: string | null;
  /** Dernier export PDF — ISO */
  lastExportedAt: string | null;
  /** Incrémenté à chaque export PDF */
  version: number;
  fingerprint: string;
  trainedCount: number;
  certifiedCount: number;
  totalCount: number;
  hours: number;
  status: "preview" | "complete";
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
  /** Identifiant de suivi Article 4 (REG-LIA-YYYY-XXXXX) — figé à la création */
  registryId: string;
  /** Module entreprise renseigné par le RH */
  companyModule: CompanyModuleContent;
  /** Partenaire OF propriétaire — null = client direct LockinIA */
  partnerId: string | null;
  /** Synthèse Art. 4 (dates figées, versions d'export) */
  article4Report: Article4ReportRecord | null;
}

export interface PlatformUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  structureId: string | null;
  /** Compte partenaire OF — null sauf role === "partner" */
  partnerId: string | null;
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
  /** Score du test de positionnement (entrée) */
  positioningScore?: number | null;
  /** Note satisfaction à chaud (1–5) */
  satisfactionRating?: number | null;
  satisfactionComment?: string | null;
  /** Réclamation éventuelle (texte libre) */
  satisfactionComplaint?: string | null;
  satisfactionAt?: string | null;
  /** Temps de connexion figé à l'émission de l'attestation (secondes) */
  attestationTimeSpentSec?: number | null;
  /** Modules validés figés à l'émission de l'attestation */
  attestationModulesCompleted?: number | null;
  /**
   * RH inscrit à la formation via le lien structure (consomme un accès).
   * Les collaborateurs sont toujours considérés inscrits.
   */
  formationEnrolled?: boolean;
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
  starter: 390,
  pro: 790,
  pme: 1290,
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
  partner: "Partenaire",
  rh: "RH",
  employee: "Collaborateur",
};

export const STATUS_LABELS: Record<AccountStatus, string> = {
  active: "Actif",
  invited: "Invité",
  suspended: "Suspendu",
};
