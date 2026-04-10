import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConversationListItem } from "./ConversationListItem";
import type { ChatMode, Conversation } from "@/types/chat";

interface ConversationSidebarProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isLoading: boolean;
}

export function ConversationSidebar({
  mode,
  onModeChange,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isLoading,
}: ConversationSidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.last_message?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-80 border-r border-slate-200 bg-white flex flex-col h-full">
      {/* Mode tabs */}
      <div className="px-3 pt-4 pb-2">
        <Tabs value={mode} onValueChange={(v) => onModeChange(v as ChatMode)}>
          <TabsList className="w-full">
            <TabsTrigger value="underwriting" className="flex-1 text-xs">
              Underwriting
            </TabsTrigger>
            <TabsTrigger value="policy" className="flex-1 text-xs">
              Policy
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* New conversation button */}
      <div className="px-3 pb-2">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
          onClick={onNewConversation}
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9 h-9 text-sm"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="px-3 py-8 text-center text-sm text-slate-400">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-slate-400">
            {search ? "No matching conversations" : "No conversations yet"}
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationListItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              onSelect={onSelectConversation}
              onDelete={onDeleteConversation}
            />
          ))
        )}
      </div>
    </div>
  );
}
