/**
 * Chat and Message Types
 * Used in ChatInterface and other messaging components
 */

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  attachments?: Array<{
    type: "file" | "image";
    name: string;
    url?: string;
  }>;
  thinkingProcess?: string;
}

export interface AttachmentItem {
  type: 'file' | 'image';
  name: string;
  url?: string;
}
