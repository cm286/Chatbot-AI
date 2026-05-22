import { MessageSquare, Plus, Settings, Sparkles, User } from "lucide-react";

interface ChatSession {
  id: string;
  title: string;
}

interface SidebarProps {
  onNewChat: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
}

export function Sidebar({ onNewChat, sessions, activeSessionId, onSelectSession }: SidebarProps) {
  const hasSessions = sessions.length > 0;

  return (
    <div className="hidden md:flex w-[280px] bg-[#090b14] border-r border-slate-800 flex-col h-screen p-5 transition-all duration-300 glass">
      {/* Brand */}
      <div className="flex items-center gap-2 px-2 py-3 mb-6 cursor-pointer text-slate-100">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <Sparkles size={18} className="text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">GPT-OSS Pro</span>
      </div>

      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="flex items-center gap-2 bg-[#111827] border border-slate-700 hover:border-indigo-400 hover:shadow-sm hover:text-indigo-300 w-full px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-medium text-slate-100 mb-6 glass-hover"
      >
        <Plus size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
        Cuộc trò chuyện mới
      </button>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto pr-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
          Lịch sử
        </h3>
        <ul className="space-y-2">
          {hasSessions ? (
            sessions.map((session) => (
              <li key={session.id}>
                <button
                  onClick={() => onSelectSession(session.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl transition-all text-sm text-left truncate ${
                    activeSessionId === session.id
                      ? "bg-[#111827] border border-indigo-400 text-indigo-100"
                      : "bg-[#0f172a] border border-transparent text-slate-300 hover:bg-[#111827] hover:border-slate-700"
                  }`}
                >
                  <MessageSquare size={16} className="text-slate-400 shrink-0" />
                  <span className="truncate">{session.title}</span>
                </button>
              </li>
            ))
          ) : (
            <li>
              <div className="rounded-2xl bg-[#0f172a] border border-dashed border-slate-700 p-4 text-sm text-slate-400">
                Chưa có cuộc trò chuyện gần đây. Nhấn "Cuộc trò chuyện mới" để bắt đầu.
              </div>
            </li>
          )}
        </ul>
      </div>

      {/* Bottom Section */}
      <div className="pt-4 mt-2 border-t border-slate-800 space-y-2">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl hover:bg-white/10 text-sm text-slate-200 transition-all border border-transparent hover:border-slate-700">
          <Settings size={18} className="text-slate-400" />
          Cài đặt
        </button>
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl hover:bg-white/10 text-sm text-slate-200 font-medium transition-all border border-transparent hover:border-slate-700">
          <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-300 shrink-0">
            <User size={14} />
          </div>
          Người dùng quản trị
        </button>
      </div>
    </div>
  );
}
