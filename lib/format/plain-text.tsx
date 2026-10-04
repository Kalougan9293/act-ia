import type { ReactNode } from "react";

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const URL_RE = /https?:\/\/[^\s<>"')\]]+/gi;
const LIST_RE = /^(?:[-*•▪‣]|(\d+)[.)])\s+(.+)$/;

function linkify(text: string, keyPrefix: string): ReactNode[] {
  const pattern = new RegExp(`(${URL_RE.source}|${EMAIL_RE.source})`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, index) => {
    if (!part) return null;
    const key = `${keyPrefix}-${index}`;
    if (/^https?:\/\//i.test(part)) {
      return (
        <a
          key={key}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
        >
          {part.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
        </a>
      );
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part)) {
      return (
        <a
          key={key}
          href={`mailto:${part}`}
          className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
        >
          {part}
        </a>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

function parseBlocks(raw: string): Block[] {
  const lines = raw.replace(/\r\n/g, "\n").trim().split("\n");
  const blocks: Block[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  function flushList() {
    if (!list || !list.items.length) {
      list = null;
      return;
    }
    blocks.push(list);
    list = null;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    const listMatch = trimmed.match(LIST_RE);
    if (listMatch) {
      const nextType: "ul" | "ol" = listMatch[1] ? "ol" : "ul";
      const item = (listMatch[2] ?? "").trim();
      if (!list || list.type !== nextType) {
        flushList();
        list = { type: nextType, items: [] };
      }
      if (item) list.items.push(item);
      continue;
    }

    flushList();
    blocks.push({ type: "p", text: trimmed });
  }

  flushList();
  return blocks;
}

/** Rend un texte RH brut en paragraphes, listes et liens cliquables. */
export function PlainText({
  text,
  className = "",
  compact = false,
}: {
  text: string;
  className?: string;
  compact?: boolean;
}) {
  const blocks = parseBlocks(text);
  if (!blocks.length) return null;

  const gap = compact ? "space-y-2" : "space-y-3";
  const textSize = compact ? "text-xs" : "text-sm";

  return (
    <div className={`${gap} ${textSize} leading-relaxed text-slate-600 dark:text-slate-300 ${className}`}>
      {blocks.map((block, index) => {
        if (block.type === "p") {
          return (
            <p key={`p-${index}`} className="text-left whitespace-pre-wrap">
              {linkify(block.text, `p-${index}`)}
            </p>
          );
        }
        const ListTag = block.type === "ol" ? "ol" : "ul";
        return (
          <ListTag
            key={`${block.type}-${index}`}
            className={`text-left ${
              block.type === "ol" ? "list-decimal" : "list-disc"
            } space-y-1 pl-5 marker:text-blue-500`}
          >
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{linkify(item, `${block.type}-${index}-${itemIndex}`)}</li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}
