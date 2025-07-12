
import ChatInterface from '@/components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Chat</h2>
          <p className="text-muted-foreground">
            Start a conversation with your AI assistant
          </p>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
}
