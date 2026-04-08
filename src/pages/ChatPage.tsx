import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ChatLayout } from "@/components/chatbot/ChatLayout";

export default function ChatPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/olvo-logo.png"
              alt="Olvo"
              className="h-8 object-contain cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/flows")}
            />
            <div className="hidden sm:block">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                Chat Workspace
              </p>
              <h1 className="text-lg font-semibold text-slate-800 -mt-0.5">
                AI Assistant
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-slate-500 hidden sm:inline">
                {user.username}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 md:px-6 py-4">
        <ChatLayout />
      </main>
    </div>
  );
}
