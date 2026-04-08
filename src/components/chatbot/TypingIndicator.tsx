import { Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TypingIndicatorProps {
  streamingContent?: string;
}

export function TypingIndicator({ streamingContent }: TypingIndicatorProps) {
  return (
    <div className="flex justify-start">
      <div className="flex gap-3 max-w-[80%]">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mt-1">
          <Bot className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <Card className="bg-white border shadow-sm">
            <CardContent className="p-4">
              {streamingContent ? (
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {streamingContent}
                  <span className="inline-block w-2 h-4 bg-blue-600 ml-0.5 animate-pulse" />
                </div>
              ) : (
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
