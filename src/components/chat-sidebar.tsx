'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Conversation {
  threadId: string;
  title: string;
  lastMessage: string;
  createdAt: Date;
  messageCount: number;
}

export function ChatSidebar({ className }: { className?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentThreadId = searchParams.get('thread') || 'assistant0-chat';

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      const response = await fetch('/api/chat/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleNewChat() {
    router.push('/');
    window.location.reload();
  }

  function handleSelectConversation(threadId: string) {
    router.push(`/?thread=${threadId}`);
    window.location.reload();
  }

  async function handleDeleteConversation(threadId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;

    try {
      const response = await fetch(`/api/chat/conversations/${threadId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Conversation deleted');
        loadConversations();
        if (currentThreadId === threadId) {
          handleNewChat();
        }
      }
    } catch (error) {
      toast.error('Failed to delete conversation');
    }
  }

  return (
    <div className={className}>
      <div className="h-full flex flex-col border-r-2 border-console bg-pale">
        {/* Header */}
        <div className="p-4 border-b-2 border-console">
          <Button
            onClick={handleNewChat}
            className="w-full border-2 border-console bg-console text-pale hover:bg-mint hover:text-console font-ibm-plex-mono text-xs"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-console/50 font-ibm-plex-mono text-xs">
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-console/50 font-ibm-plex-mono text-xs">
              No conversations yet
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((conv) => (
                <button
                  key={conv.threadId}
                  onClick={() => handleSelectConversation(conv.threadId)}
                  className={`w-full text-left p-3 mb-2 border-2 hover:bg-mint transition-colors group ${
                    currentThreadId === conv.threadId
                      ? 'border-console bg-mint'
                      : 'border-console/30 bg-pale'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-3 h-3 flex-shrink-0" />
                        <p className="font-ibm-plex-mono text-xs font-semibold truncate">
                          {conv.title || 'Untitled'}
                        </p>
                      </div>
                      <p className="font-ibm-plex-mono text-xs text-console/60 truncate">
                        {conv.lastMessage}
                      </p>
                      <p className="font-ibm-plex-mono text-xs text-console/40 mt-1">
                        {conv.messageCount} messages
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(conv.threadId, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
