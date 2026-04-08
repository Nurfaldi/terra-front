import { Bot, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ChatMessage } from "@/types/chat";

function formatTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%]">
          <div className="bg-blue-600 text-white rounded-lg rounded-br-sm px-4 py-3 shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <p className="text-xs text-slate-400 mt-1 text-right">{formatTime(message.created_at)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex gap-3 max-w-[80%]">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mt-1">
          <Bot className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-4">
              {message.status === "failed" ? (
                <p className="text-sm text-red-600">{message.content || "Failed to get response"}</p>
              ) : message.status === "pending" ? (
                <p className="text-sm text-amber-600 italic">Waiting for response...</p>
              ) : (
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
              )}
            </CardContent>
          </Card>
          <p className="text-xs text-slate-400 mt-1">{formatTime(message.created_at)}</p>
        </div>
      </div>
    </div>
  );
}
