"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Eye, EyeOff, GraduationCap } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { validatePassword } from "@/lib/auth/password";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { UserRole } from "@/lib/admin/types";
import { isAllowedSuperAdminEmail } from "@/lib/auth/super-admin";
import { completeFirstConnection } from "@/lib/firebase/first-connection";

function passwordRules(password: string) {
  return [
    { label: "8 caractères min.", ok: password.length >= 8 },
    { label: "1 majuscule", ok: /[A-Z]/.test(password) },
    { label: "1 caractère spécial", ok: /[^A-Za-z0-9]/.test(password) },
  ];
}

function defaultPathForRole(role: UserRole) {
  if (role === "super_admin") return "/admin";
  if (role === "rh") return "/rh";
  return "/utilisateur";
}

function pathAllowedForRole(
  path: string,
  role: UserRole,
  formationEnrolled?: boolean,
) {
  if (path.startsWith("/admin")) return role === "super_admin";
  if (path.startsWith("/rh")) return role === "rh";
  // Formation : collaborateurs, ou RH seulement s'il est inscrit dans la liste
  if (path.startsWith("/utilisateur")) {
    if (role === "employee") return true;
    if (role === "rh") return Boolean(formationEnrolled);
    return false;
  }
  return true;
}

export default function ConnexionClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const superAdminLogin = nextParam?.startsWith("/admin") ?? false;
  const {
    ready,
    configured,
    user,
    profile,
    signInWithPassword,
    refreshProfile,
    error,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mode, setMode] = useState<"login" | "first">("login");
  const [busy, setBusy] = useState(false);
  const [holdRedirect, setHoldRedirect] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (holdRedirect || !ready || !user || !profile) return;

    const next =
      nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
        ? nextParam
        : null;

    // Mauvais espace demandé (ex. collaborateur sur /rh) → son espace, sans déconnecter
    const dest =
      next && pathAllowedForRole(next, profile.role, profile.formationEnrolled)
        ? next
        : defaultPathForRole(profile.role);
    router.replace(dest);
  }, [holdRedirect, ready, user, profile, nextParam, router]);

  function showLogin() {
    setMode("login");
    setLocalError(null);
    setPassword("");
    setConfirm("");
    setShowPassword(false);
    setShowConfirm(false);
  }

  function showFirst() {
    setMode("first");
    setLocalError(null);
    setPassword("");
    setConfirm("");
    setShowPassword(false);
    setShowConfirm(false);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    setBusy(true);
    try {
      await signInWithPassword(email, password);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Connexion impossible";
      setLocalError(message);
    } finally {
      setBusy(false);
    }
  }

  async function onFirstConnection(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    const check = validatePassword(password);
    if (!check.ok) {
      setLocalError(check.message);
      return;
    }
    if (password !== confirm) {
      setLocalError("Les mots de passe ne correspondent pas");
      return;
    }
    if (isAllowedSuperAdminEmail(email) || superAdminLogin) {
      setLocalError("Le super admin se connecte avec son mot de passe, sans première connexion.");
      return;
    }
    setHoldRedirect(true);
    setBusy(true);
    try {
      await completeFirstConnection(email, password);
      await refreshProfile();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Première connexion impossible";
      setLocalError(message);
    } finally {
      setBusy(false);
      setHoldRedirect(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-1.5 font-bold text-lg tracking-tight">
            Conform<span className="text-blue-600 dark:text-blue-400">AI</span>
            <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-12 text-center space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "first"
              ? "Première connexion"
              : nextParam?.startsWith("/rh")
                ? "Connexion espace RH"
                : "Connexion"}
          </h1>
          <p className="mt-2 text-sm text-slate-500 text-center">
            {!configured
              ? "Firebase non configuré (.env.local manquant)"
              : mode === "first"
                ? "Indiquez votre e-mail et le mot de passe que vous choisissez."
                : "E-mail et mot de passe"}
          </p>
        </div>

        {!ready ? (
          <p className="text-sm text-slate-500">Chargement…</p>
        ) : (
          <form
            onSubmit={mode === "first" ? onFirstConnection : onSubmit}
            className="space-y-3 text-center"
          >
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-500">E-mail</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-center"
                placeholder="rh@entreprise.fr"
                autoComplete="email"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-500">
                {mode === "first" ? "Mot de passe à choisir" : "Mot de passe"}
              </span>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={mode === "first" ? 8 : 6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 pr-10 text-sm text-center"
                  placeholder="••••••••"
                  autoComplete={mode === "first" ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            {mode === "first" && (
              <ul className="mx-auto w-fit space-y-1.5 text-left">
                {passwordRules(password).map((rule) => (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                      rule.ok
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                        rule.ok
                          ? "border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-slate-950"
                          : "border-slate-300 bg-transparent dark:border-slate-600"
                      }`}
                    >
                      <Check
                        className={`h-2.5 w-2.5 transition-opacity duration-200 ${rule.ok ? "opacity-100" : "opacity-0"}`}
                        strokeWidth={3}
                      />
                    </span>
                    {rule.label}
                  </li>
                ))}
              </ul>
            )}
            {mode === "first" && (
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-500">Confirmer le mot de passe</span>
                <div className="relative">
                  <input
                    required
                    type={showConfirm ? "text" : "password"}
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 pr-10 text-sm text-center"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((value) => !value)}
                    aria-label={showConfirm ? "Masquer la confirmation" : "Afficher la confirmation"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
            )}

            {(localError || error) && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {localError || error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || !configured}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? "…" : mode === "first" ? "Activer mon compte" : "Se connecter"}
            </button>

            {mode === "login" ? (
              superAdminLogin ? null : (
              <button
                type="button"
                onClick={showFirst}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                Première connexion ?
              </button>
              )
            ) : (
              <button
                type="button"
                onClick={showLogin}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                Déjà un mot de passe ? Se connecter
              </button>
            )}
          </form>
        )}
      </main>
    </div>
  );
}
