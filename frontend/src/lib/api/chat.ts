// src/lib/api/chat.ts
// Centralized chat API logic for streaming and stopping chat

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function streamChat({
  content,
  attachments,
  selectedModel,
  streamId,
  selectedAction,
  knowledgeFilename,
}: {
  content: string;
  attachments?: Array<{ type: "file" | "image"; name: string; url?: string; content?: string; size?: number }>;
  selectedModel: string;
  streamId: string;
  selectedAction?: string;
  knowledgeFilename?: string;
}) {
  // Prepare attachments for backend
  const processedAttachments = attachments || [];
  const response = await fetch(`${BACKEND_URL}/api/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: content,
      attachments: processedAttachments,
      model: selectedModel,
      stream_id: streamId,
      selected_action: selectedAction,
      knowledge_filename: knowledgeFilename,
    }),
  });
  return response;
}

export async function stopChatStream(streamId: string) {
  const response = await fetch(`${BACKEND_URL}/api/chat/stop`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ stream_id: streamId }),
  });
  return response;
}
