import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onNewConversation: () => void;
  mode: string;
}

export function EmptyState({ onNewConversation, mode }: EmptyStateProps) {
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
        <Button
          className="mt-4 bg-blue-600 hover:bg-blue-700 gap-2"
          onClick={onNewConversation}
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>
    </div>
  );
}
