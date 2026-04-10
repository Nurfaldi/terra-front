import { apiRequest } from "@/lib/api";
import type { Conversation, ConversationDetail, ChatMessage } from "@/types/chat";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// ── Conversations ──

export async function createConversation(
  chatbot_type: string,
  userId?: string
): Promise<Conversation> {
  const params = userId ? `?user_id=${userId}` : "";
  return apiRequest<Conversation>(`/chatbot/conversations${params}`, {
    method: "POST",
    body: JSON.stringify({ chatbot_type }),
  });
}

export async function listConversations(
  userId?: string,
  chatbot_type?: string
): Promise<Conversation[]> {
  const params = new URLSearchParams();
  if (userId) params.append("user_id", userId);
  if (chatbot_type) params.append("chatbot_type", chatbot_type);
  const qs = params.toString();
  return apiRequest<Conversation[]>(`/chatbot/conversations${qs ? `?${qs}` : ""}`);
}

export async function getConversation(
  conversationId: string,
  userId?: string
): Promise<ConversationDetail> {
  const params = userId ? `?user_id=${userId}` : "";
  return apiRequest<ConversationDetail>(`/chatbot/conversations/${conversationId}${params}`);
}

export async function deleteConversation(
  conversationId: string,
  userId?: string
): Promise<void> {
  const params = userId ? `?user_id=${userId}` : "";
  return apiRequest<void>(`/chatbot/conversations/${conversationId}${params}`, {
    method: "DELETE",
  });
}

// ── Messages (non-streaming) ──

export async function sendMessage(
  conversationId: string,
  content: string,
  userId?: string
): Promise<ChatMessage> {
  const params = userId ? `?user_id=${userId}` : "";
  return apiRequest<ChatMessage>(
    `/chatbot/conversations/${conversationId}/messages${params}`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    }
  );
}

// ── SSE Streaming ──

export function streamMessage(
  conversationId: string,
  content: string,
  userId?: string
): { reader: ReadableStreamDefaultReader<Uint8Array>; abort: () => void } {
  const controller = new AbortController();
  const params = userId ? `?user_id=${userId}` : "";

  const fetchPromise = fetch(
    `${API_BASE_URL}/chatbot/conversations/${conversationId}/messages/stream${params}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
      signal: controller.signal,
    }
  );

  // Create a pass-through stream
  let readerRef: ReadableStreamDefaultReader<Uint8Array> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    async start(streamController) {
      try {
        const response = await fetchPromise;
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.detail || `Stream error: ${response.statusText}`);
        }
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");
        readerRef = reader;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          streamController.enqueue(value);
        }
        streamController.close();
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          streamController.error(err);
        }
      }
    },
  });

  return {
    reader: stream.getReader(),
    abort: () => controller.abort(),
  };
}

// ── Policy chatbot ──

export async function sendPolicyMessage(
  conversationId: string,
  content: string,
  company: string,
  insurer: string,
  userId?: string
): Promise<ChatMessage> {
  const params = userId ? `?user_id=${userId}` : "";
  return apiRequest<ChatMessage>(
    `/chatbot/conversations/${conversationId}/policy-message${params}`,
    {
      method: "POST",
      body: JSON.stringify({ content, company, insurer }),
    }
  );
}

export async function pollPolicyMessage(
  conversationId: string,
  messageId: string,
  userId?: string
): Promise<{ status: string; content: string }> {
  const params = userId ? `?user_id=${userId}` : "";
  return apiRequest<{ status: string; content: string }>(
    `/chatbot/conversations/${conversationId}/messages/${messageId}/poll${params}`
  );
}
