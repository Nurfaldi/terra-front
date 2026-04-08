export type ChatMode = "underwriting" | "policy";

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown>;
  status: "completed" | "pending" | "failed" | "streaming";
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string | null;
  chatbot_type: ChatMode;
  title: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string | null;
  message_count: number;
  last_message: string | null;
}

export interface ConversationDetail {
  id: string;
  user_id: string | null;
  chatbot_type: ChatMode;
  title: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string | null;
  messages: ChatMessage[];
}

export interface ChatStreamEvent {
  type: "token" | "sources" | "done" | "error";
  data: string | Record<string, unknown> | null;
}

export const COMPANY_INSURER_MAPPING: Record<string, string[]> = {
  "Aditya Birla": ["Aditya Birla Health Insurance"],
  "General Takaful": ["General Takaful Indonesia"],
  "PT. KYORAKU KANTO MOULD INDONESIA": ["Rey Health Insurance"],
};
