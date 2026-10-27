/** Cadenas LockinIA — hérite de `currentColor` (bleu site). */
export default function BrandMark({
  className = "h-5 w-5",
  title = "LockinIA",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      {/* Anse */}
      <path
        d="M8 11V8.2C8 5.9 9.8 4 12 4s4 1.9 4 4.2V11"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
        opacity="0.72"
      />
      {/* Corps */}
      <rect
        x="5.5"
        y="10.5"
        width="13"
        height="10"
        rx="3.2"
        fill="currentColor"
      />
      {/* Serrure */}
      <circle cx="12" cy="14.6" r="1.35" fill="#fff" />
      <path d="M12 15.5v2.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
