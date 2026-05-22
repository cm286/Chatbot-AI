import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Copy, Check } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const bubbleStyle = isUser
    ? "bg-gradient-to-br from-indigo-500/20 to-pink-500/20 text-slate-100 border border-white/10 shadow-[0_20px_50px_rgba(15,23,42,0.25)]"
    : "bg-slate-900/95 text-slate-100 border border-slate-700/90 shadow-[0_24px_65px_rgba(15,23,42,0.45)]";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  // Sanitize content: remove bold markers and convert separator lines (---, ***, ___) into empty lines
  const sanitizedContent = content
    // remove bold markers like **text** and __text__
    .replace(/\*\*(.*?)\*\*/gs, "$1")
    .replace(/__([^_]+)__/gs, "$1")
    // split into lines and clear lines that are only separators (---, ***, ___, or repeated -_* chars)
    .split("\n")
    .map((line) => (/^\s*([-*_]){3,}\s*$/.test(line) ? "" : line))
    .join("\n");

  return (
    <div
      className={cn(
        "flex w-full py-4 md:py-6 animate-in fade-in duration-300",
        isUser ? "justify-end px-4" : "justify-start px-2 md:px-4"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center mr-4 mt-1 bg-slate-900">
          <Sparkles size={16} className="text-indigo-300" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] md:max-w-[75%]",
          isUser ? "flex justify-end" : "flex flex-col"
        )}
      >
        <div className="relative">
          {!isUser && (
            <button
              type="button"
              onClick={handleCopy}
              className="absolute top-2 right-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/90 border border-white/10 text-slate-300 transition hover:bg-slate-900"
              title={copied ? "Đã sao chép" : "Sao chép"
              }
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span className="sr-only">{copied ? "Đã sao chép" : "Sao chép"}</span>
            </button>
          )}

          <div
            className={cn(
              "text-[15px] leading-relaxed whitespace-pre-wrap rounded-3xl px-5 py-4",
              bubbleStyle
            )}
          >
            {sanitizedContent}
          </div>
        </div>
      </div>
    </div>
  );
}
