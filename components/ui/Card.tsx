import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  accent?: "blue" | "red" | "amber" | "none";
}

const accentStyles: Record<string, string> = {
  blue:   "hover:border-blue-200 hover:shadow-blue-100/60",
  red:    "hover:border-red-200 hover:shadow-red-100/60",
  amber:  "hover:border-amber-200 hover:shadow-amber-100/60",
  none:   "",
};

export default function Card({
  children,
  className,
  hover = false,
  accent = "none",
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-6",
        hover && "transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
        accent !== "none" && accentStyles[accent],
        className
      )}
    >
      {children}
    </div>
  );
}
