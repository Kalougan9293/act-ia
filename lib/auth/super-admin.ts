/** E-mails autorisés en super admin — seul accès /admin */
export const SUPER_ADMIN_EMAILS = (
  process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS ??
  "jonathan.seroussi.92100@gmail.com"
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAllowedSuperAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
