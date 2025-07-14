import { BACKEND_URL, fetchWithTimeout } from './common';

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
  return fetchWithTimeout(`${BACKEND_URL}/api/chat/stream`, {
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
}

export async function stopChatStream(streamId: string) {
  return fetchWithTimeout(`${BACKEND_URL}/api/chat/stop`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ stream_id: streamId }),
  });
}
