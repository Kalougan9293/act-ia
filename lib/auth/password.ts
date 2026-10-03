export type PasswordCheck = {
  ok: boolean;
  message: string | null;
};

/** Au moins 8 caractères, 1 majuscule, 1 caractère spécial */
export function validatePassword(password: string): PasswordCheck {
  if (password.length < 8) {
    return { ok: false, message: "Au moins 8 caractères" };
  }
  if (!/[A-Z]/.test(password)) {
    return { ok: false, message: "Au moins une majuscule" };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { ok: false, message: "Au moins un caractère spécial" };
  }
  return { ok: true, message: null };
}

export const PASSWORD_HINT =
  "8 caractères min. · 1 majuscule · 1 caractère spécial";
