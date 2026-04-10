import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Conversation } from "@/types/chat";

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

interface ConversationListItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationListItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: ConversationListItemProps) {
  return (
    <div
      className={cn(
        "relative group cursor-pointer transition-colors border-l-2",
        isActive
          ? "bg-blue-50 border-blue-600"
          : "border-transparent hover:bg-slate-50"
      )}
      onClick={() => onSelect(conversation.id)}
    >
      <div className="px-3 py-3">
        <p className="text-sm font-medium text-slate-800 truncate">
          {conversation.title || "New conversation"}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-400">{formatDate(conversation.created_at)}</span>
          {conversation.message_count > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {conversation.message_count}
            </Badge>
          )}
        </div>
        {conversation.last_message && (
          <p className="text-xs text-slate-400 mt-1 truncate">
            {conversation.last_message}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(conversation.id);
        }}
        title="Delete conversation"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
