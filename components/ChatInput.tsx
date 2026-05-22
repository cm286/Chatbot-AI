import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { ArrowUp, Loader2, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="relative flex flex-col w-full bg-white/95 rounded-[26px] py-2 px-3 focus-within:bg-white focus-within:shadow-[0_0_18px_rgba(0,0,0,0.12)] transition-all duration-200 border border-transparent focus-within:border-slate-300">
      <div className="flex items-end w-full">
        {/* Dummy attachment button */}
        <button 
          className="flex items-center justify-center h-10 w-10 shrink-0 rounded-full hover:bg-slate-200 text-slate-700 transition-colors mb-0.5"
          disabled={isLoading}
        >
          <Paperclip size={20} />
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          disabled={isLoading}
          className="w-full max-h-[200px] bg-white text-[15px] resize-none outline-none py-[10px] px-4 scrollbar-thin text-slate-900 placeholder:text-slate-500 disabled:opacity-50"
          style={{ backgroundColor: "#ffffff", color: "#111827" }}
          rows={1}
        />
        
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={cn(
            "flex items-center justify-center h-8 w-8 shrink-0 rounded-full transition-all mb-1.5 ml-2",
            input.trim() && !isLoading
              ? "bg-black text-white hover:bg-black/80"
              : "bg-[#e5e5e5] text-white"
          )}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin text-black/50" />
          ) : (
            <ArrowUp size={18} strokeWidth={3} />
          )}
        </button>
      </div>
    </div>
  );
}
