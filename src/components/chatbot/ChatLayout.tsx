import { useState } from "react";
import type { ChatMode } from "@/types/chat";
import { useChat } from "@/hooks/useChat";
import { ConversationSidebar } from "./ConversationSidebar";
import { ChatArea } from "./ChatArea";

export function ChatLayout() {
  const [mode, setMode] = useState<ChatMode>("underwriting");

  const {
    conversations,
    conversationDetail,
    activeConversationId,
    streamingContent,
    isStreaming,
    isLoadingConversations,
    send,
    stopStreaming,
    newConversation,
    selectConversation,
    deleteConversation,
  } = useChat(mode);

  const messages = conversationDetail?.messages ?? [];

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <ConversationSidebar
        mode={mode}
        onModeChange={(m) => {
          setMode(m);
          newConversation();
        }}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onNewConversation={newConversation}
        onDeleteConversation={deleteConversation}
        isLoading={isLoadingConversations}
      />
      <ChatArea
        mode={mode}
        messages={messages}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
        hasActiveConversation={!!activeConversationId}
        onSend={send}
        onStop={stopStreaming}
        onNewConversation={newConversation}
      />
    </div>
  );
}
