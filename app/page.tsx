"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Sidebar } from "@/components/Sidebar";
import { Sparkles, Zap, Code, BookOpen, PenTool } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const STORAGE_KEY = "gpt_oss_sessions_v1";
  const ACTIVE_KEY = "gpt_oss_active_v1";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load sessions and active session from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const rawActive = localStorage.getItem(ACTIVE_KEY);
      if (raw) {
        const parsed: ChatSession[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSessions(parsed);
          if (rawActive) {
            setActiveSessionId(rawActive);
            const sel = parsed.find((s) => s.id === rawActive);
            if (sel) setMessages(sel.messages ?? []);
          } else if (parsed.length > 0) {
            setActiveSessionId(parsed[0].id);
            setMessages(parsed[0].messages ?? []);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load sessions from localStorage", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist sessions when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error("Failed to save sessions to localStorage", e);
    }
  }, [sessions]);

  // Persist active session id
  useEffect(() => {
    try {
      if (activeSessionId) {
        localStorage.setItem(ACTIVE_KEY, activeSessionId);
      } else {
        localStorage.removeItem(ACTIVE_KEY);
      }
    } catch (e) {
      console.error("Failed to save activeSessionId", e);
    }
  }, [activeSessionId]);

  const createSession = (title = "Cuộc trò chuyện mới") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const session = { id, title, messages: [] };
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(id);
    return id;
  };

  const persistCurrentSession = (sessionId: string, updatedMessages: Message[]) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              messages: updatedMessages,
              title:
                session.title === "Cuộc trò chuyện mới" && updatedMessages[0]?.role === "user"
                  ? `${updatedMessages[0].content.slice(0, 40)}...`
                  : session.title,
            }
          : session
      )
    );
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const currentRequestId = ++requestIdRef.current;
    const sessionId = activeSessionId ?? createSession();
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setIsLoading(true);
    persistCurrentSession(sessionId, newMessages);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (data.result && data.result.content) {
        const assistantMessages = [...newMessages, { role: "assistant", content: data.result.content }];
        setMessages(assistantMessages);
        persistCurrentSession(sessionId, assistantMessages);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Xin lỗi, tôi gặp sự cố. Vui lòng thử lại sau." },
      ]);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  const suggestions = [
    { icon: <Code size={18} />, text: "Viết một React hook để gọi API lấy dữ liệu" },
    { icon: <Zap size={18} />, text: "Giải thích điện toán lượng tử một cách đơn giản" },
    { icon: <PenTool size={18} />, text: "Soạn email xin việc chuyên nghiệp" },
    { icon: <BookOpen size={18} />, text: "Tóm tắt cốt truyện phim Inception" },
  ];

  const handleSelectSession = (sessionId: string) => {
    if (sessionId === activeSessionId) return;

    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId ? { ...session, messages } : session
      )
    );

    const selectedSession = sessions.find((session) => session.id === sessionId);
    if (selectedSession) {
      setActiveSessionId(sessionId);
      setMessages(selectedSession.messages);
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    if (activeSessionId) {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === activeSessionId ? { ...session, messages } : session
        )
      );
    }
    createSession();
    setMessages([]);
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#10121d] text-slate-200 font-sans selection:bg-indigo-400 overflow-hidden">
      <Sidebar
        onNewChat={handleNewChat}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
      />
      
      <main className="flex-1 flex flex-col h-full relative text-slate-100">
        {/* Header - Glassmorphism */}
        <header className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-10 bg-white/70 backdrop-blur-md border-b border-slate-100/50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-lg tracking-tight">GPT-OSS 120B</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold tracking-wider uppercase ml-1 shadow-sm shadow-indigo-100">
              Pro
            </span>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 w-full flex flex-col items-center overflow-y-auto pt-16 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="w-full max-w-3xl flex flex-col px-4 min-h-full">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center w-full py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mb-8 shadow-xl shadow-purple-500/20">
                  <Sparkles size={32} className="text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300 tracking-tight text-center">
                  Tôi có thể giúp gì cho bạn hôm nay?
                </h2>
                <p className="text-slate-300 mb-12 text-center max-w-md text-lg">
                  Tôi là trợ lý AI thông minh. Hãy hỏi tôi bất cứ điều gì, hoặc thử một ví dụ bên dưới.
                </p>

                {/* Suggestion Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl px-4">
                  {suggestions.map((item, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSendMessage(item.text)}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/10 border border-white/10 shadow-sm hover:border-indigo-300 hover:shadow-indigo-500/10 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-100 group-hover:bg-indigo-500 group-hover:text-white transition-colors shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium text-slate-100 group-hover:text-white line-clamp-2">
                        {item.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col py-6 pb-32">
                {messages.map((message, index) => (
                  <ChatMessage key={index} role={message.role} content={message.content} />
                ))}
                
                {isLoading && (
                  <div className="flex w-full py-6 px-2 md:px-4 justify-start animate-pulse">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-4 mt-1 shadow-md">
                      <Sparkles size={16} className="text-white" />
                    </div>
                    <div className="flex flex-col gap-2 w-full max-w-[75%] items-start justify-center pt-2.5">
                      <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
                      <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 w-full flex flex-col items-center bg-gradient-to-t from-white via-white to-transparent pt-6 pb-6 px-4">
          <div className="w-full max-w-3xl">
            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            <p className="text-center text-xs text-slate-400 mt-3 font-medium">
              GPT-OSS Pro có thể sai. Hãy kiểm tra thông tin quan trọng.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
