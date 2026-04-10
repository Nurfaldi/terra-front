import { MessageSquare } from "lucide-react";

interface EmptyStateProps {
  onNewConversation: () => void;
  mode: string;
}

export function EmptyState({ mode }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
          <MessageSquare className="h-8 w-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">Start a conversation</h3>
        <p className="text-sm text-slate-500 mt-2">
          {mode === "underwriting"
            ? "Ask Hypatia about medical underwriting guidelines, ratings, and insurance assessments."
            : "Ask Nastenka about insurance policies, coverage details, and claims procedures."}
        </p>
        <p className="text-xs text-slate-400 mt-3">
          Type your message below to begin.
        </p>
      </div>
    </div>
  );
}
