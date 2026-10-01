import { cn } from "@/lib/utils";

type BadgeVariant = "pill" | "urgent" | "info" | "success" | "subtle";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  // Light institutional pill — primary use for hero/landing
  pill: "bg-blue-50 border border-blue-200 text-blue-700",
  // Dark-theme variants (kept for sections that remain dark)
  urgent: "bg-red-500/10 border border-red-500/30 text-red-400",
  info: "bg-indigo-500/10 border border-indigo-500/30 text-indigo-300",
  success: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400",
  subtle: "bg-slate-800/80 border border-slate-700/50 text-slate-400",
};

export default function Badge({
  children,
  variant = "pill",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
