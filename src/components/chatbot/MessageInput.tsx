import { useState, useCallback } from "react";
import { Send, Loader2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  onSend: (content: string) => void;
  onStop?: () => void;
  isStreaming: boolean;
  placeholder?: string;
}

export function MessageInput({ onSend, onStop, isStreaming, placeholder }: MessageInputProps) {
  const [input, setInput] = useState("");

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput("");
  }, [input, isStreaming, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="border-t bg-white px-6 py-4">
      <div className="flex items-end gap-3">
        <Textarea
          className="flex-1 min-h-[44px] max-h-[160px] resize-none text-sm"
          placeholder={placeholder || "Ask about underwriting guidelines..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          rows={1}
        />
        {isStreaming ? (
          <Button
            className="bg-red-500 hover:bg-red-600 h-11 w-11 flex-shrink-0"
            size="icon"
            onClick={onStop}
            title="Stop generating"
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="bg-blue-600 hover:bg-blue-700 h-11 w-11 flex-shrink-0"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
