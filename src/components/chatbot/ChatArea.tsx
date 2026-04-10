import { useState } from "react";
import type { ChatMessage, ChatMode } from "@/types/chat";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { PolicyModeSelector } from "./PolicyModeSelector";
import { EmptyState } from "./EmptyState";

interface ChatAreaProps {
  mode: ChatMode;
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;
  hasActiveConversation: boolean;
  onSend: (content: string, company?: string, insurer?: string) => void;
  onStop: () => void;
  onNewConversation: () => void;
}

export function ChatArea({
  mode,
  messages,
  isStreaming,
  streamingContent,
  hasActiveConversation,
  onSend,
  onStop,
  onNewConversation,
}: ChatAreaProps) {
  const [company, setCompany] = useState("");
  const [insurer, setInsurer] = useState("");

  const handleSend = (content: string) => {
    if (mode === "policy") {
      onSend(content, company, insurer);
    } else {
      onSend(content);
    }
  };

  const showEmpty = !hasActiveConversation && messages.length === 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      {mode === "policy" && (
        <PolicyModeSelector
          company={company}
          insurer={insurer}
          onCompanyChange={setCompany}
          onInsurerChange={setInsurer}
        />
      )}
      {showEmpty ? (
        <EmptyState onNewConversation={() => {}} mode={mode} />
      ) : (
        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
        />
      )}
      <MessageInput
        onSend={handleSend}
        onStop={onStop}
        isStreaming={isStreaming}
        placeholder={
          mode === "underwriting"
            ? "Ask about underwriting guidelines..."
            : "Ask about insurance policies..."
        }
      />
    </div>
  );
}
