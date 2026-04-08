import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import type { ChatMode, ChatMessage, Conversation, ConversationDetail } from "@/types/chat";
import {
  listConversations,
  getConversation,
  createConversation,
  deleteConversation,
  streamMessage,
  sendMessage,
  sendPolicyMessage,
} from "@/lib/chatApi";

export function useChat(mode: ChatMode) {
  const { user } = useAuth();
  const userId = user?.username;
  const queryClient = useQueryClient();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<(() => void) | null>(null);

  // List conversations
  const conversationsQuery = useQuery({
    queryKey: ["chat-conversations", userId, mode],
    queryFn: () => listConversations(userId, mode),
    refetchInterval: 30000,
  });

  // Active conversation detail
  const conversationQuery = useQuery({
    queryKey: ["chat-conversation", activeConversationId, userId],
    queryFn: () => getConversation(activeConversationId!, userId),
    enabled: !!activeConversationId,
  });

  // Create conversation
  const createMutation = useMutation({
    mutationFn: () => createConversation(mode, userId),
    onSuccess: (conv: Conversation) => {
      setActiveConversationId(conv.id);
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    },
  });

  // Delete conversation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteConversation(id, userId),
    onSuccess: (_: void, id: string) => {
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      queryClient.removeQueries({ queryKey: ["chat-conversation", id] });
    },
  });

  // Send message (streaming for underwriting, non-streaming for policy)
  const send = useCallback(
    async (content: string, company?: string, insurer?: string) => {
      let convId = activeConversationId;

      // Auto-create conversation if none active
      if (!convId) {
        const conv = await createConversation(mode, userId);
        convId = conv.id;
        setActiveConversationId(convId);
        queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      }

      // Optimistically add user message
      const userMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: convId,
        role: "user",
        content,
        metadata: {},
        status: "completed",
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<ConversationDetail>(
        ["chat-conversation", convId, userId],
        (old) => {
          if (!old) return old;
          return { ...old, messages: [...old.messages, userMsg] };
        }
      );

      if (mode === "underwriting") {
        // SSE streaming
        setIsStreaming(true);
        setStreamingContent("");

        try {
          const { reader, abort } = streamMessage(convId, content, userId);
          abortRef.current = abort;

          const decoder = new TextDecoder();
          let buffer = "";
          let fullResponse = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              try {
                const event = JSON.parse(line.slice(6));
                if (event.type === "token") {
                  fullResponse += event.data;
                  setStreamingContent(fullResponse);
                } else if (event.type === "done") {
                  // Streaming complete
                } else if (event.type === "error") {
                  fullResponse += `\n\nError: ${event.data}`;
                  setStreamingContent(fullResponse);
                }
              } catch {
                // Skip unparseable lines
              }
            }
          }
        } catch (err) {
          if ((err as Error).name !== "AbortError") {
            console.error("Stream error:", err);
          }
        } finally {
          setIsStreaming(false);
          setStreamingContent("");
          abortRef.current = null;
          // Refresh the conversation to get persisted messages
          queryClient.invalidateQueries({ queryKey: ["chat-conversation", convId] });
          queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
        }
      } else {
        // Policy chatbot — non-streaming
        try {
          if (company && insurer) {
            await sendPolicyMessage(convId, content, company, insurer, userId);
          } else {
            await sendMessage(convId, content, userId);
          }
        } catch (err) {
          console.error("Send error:", err);
        }
        queryClient.invalidateQueries({ queryKey: ["chat-conversation", convId] });
        queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      }
    },
    [activeConversationId, mode, userId, queryClient]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.();
    setIsStreaming(false);
    setStreamingContent("");
  }, []);

  const newConversation = useCallback(() => {
    setActiveConversationId(null);
    setStreamingContent("");
    setIsStreaming(false);
  }, []);

  return {
    // State
    mode,
    activeConversationId,
    streamingContent,
    isStreaming,

    // Data
    conversations: conversationsQuery.data ?? [],
    conversationDetail: conversationQuery.data ?? null,
    isLoadingConversations: conversationsQuery.isLoading,
    isLoadingDetail: conversationQuery.isLoading,

    // Actions
    send,
    stopStreaming,
    newConversation,
    selectConversation: setActiveConversationId,
    createConversation: createMutation.mutate,
    deleteConversation: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
