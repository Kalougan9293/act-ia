"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Check, Eye, EyeOff, GraduationCap } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { validatePassword } from "@/lib/auth/password";
import { acceptInvite, getInvite, type InviteRecord } from "@/lib/firebase/invites";

function passwordRules(password: string) {
  return [
    { label: "8 caractères min.", ok: password.length >= 8 },
    { label: "1 majuscule", ok: /[A-Z]/.test(password) },
    { label: "1 caractère spécial", ok: /[^A-Za-z0-9]/.test(password) },
  ];
}

export default function InvitationPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;

  const [invite, setInvite] = useState<InviteRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await getInvite(token);
        if (!cancelled) setInvite(next);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Invitation introuvable");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const check = validatePassword(password);
    if (!check.ok) {
      setError(check.message);
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setBusy(true);
    try {
      const { role } = await acceptInvite({ token, password });
      if (role === "rh") router.replace("/rh");
      else router.replace("/utilisateur");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Activation impossible");
    } finally {
      setBusy(false);
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
          <h1 className="text-2xl font-bold tracking-tight">Activer mon compte</h1>
          <p className="mt-2 text-sm text-slate-500">
            Choisissez votre mot de passe pour démarrer la formation.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Chargement…</p>
        ) : !invite ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {error || "Invitation invalide ou déjà utilisée."}
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3 text-center">
            <p className="text-sm font-medium">{invite.name}</p>
            <p className="text-xs text-slate-500">{invite.email}</p>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-500">Mot de passe</span>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 pr-10 text-sm text-center"
                  autoComplete="new-password"
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

            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-500">Confirmer</span>
              <div className="relative">
                <input
                  required
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 pr-10 text-sm text-center"
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

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? "…" : "Activer mon compte"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
