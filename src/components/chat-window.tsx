'use client';

import { useState, useEffect, type FormEvent, type ReactNode } from 'react';
import { type UIMessage, DefaultChatTransport, generateId } from 'ai';
import { useChat } from '@ai-sdk/react';
import { toast } from 'sonner';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';
import { ArrowDown, ArrowUpIcon, LoaderCircle, Trash2 } from 'lucide-react';
import { useInterruptions } from '@auth0/ai-vercel/react';
import { useSearchParams } from 'next/navigation';

import { TokenVaultInterruptHandler } from '@/components/auth0-ai/TokenVault/TokenVaultInterruptHandler';
import { ChatMessageBubble } from '@/components/chat-message-bubble';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { StepUpAuthModal } from '@/components/step-up-auth-modal';

function TypingIndicator(props: { aiEmoji?: string }) {
  return (
    <div className="max-w-[80%] mb-8 flex mr-auto">
      <div className="mr-4 -mt-2 mt-1 border-2 border-console bg-pale w-10 h-10 flex-shrink-0 flex items-center justify-center">
        {props.aiEmoji}
      </div>
      <div className="bg-pale border-2 border-console px-6 py-4">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

function ChatMessages(props: {
  messages: UIMessage[];
  emptyStateComponent: ReactNode;
  aiEmoji?: string;
  className?: string;
  isLoading?: boolean;
}) {
  return (
    <div className="flex flex-col max-w-[768px] mx-auto pb-12 w-full">
      {props.messages.map((m, i) => {
        return <ChatMessageBubble key={m.id} message={m} aiEmoji={props.aiEmoji} />;
      })}
      {props.isLoading && <TypingIndicator aiEmoji={props.aiEmoji} />}
    </div>
  );
}

function ScrollToBottom(props: { className?: string }) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  if (isAtBottom) return null;
  return (
    <Button 
      variant="outline" 
      className={cn("border-2 border-console bg-pale hover:bg-mint font-ibm-plex-mono text-xs", props.className)} 
      onClick={() => scrollToBottom()}
    >
      <ArrowDown className="w-4 h-4" />
      <span>Scroll to bottom</span>
    </Button>
  );
}

function ChatInput(props: {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  onStop?: () => void;
  placeholder?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.stopPropagation();
        e.preventDefault();
        props.onSubmit(e);
      }}
      className={cn('flex w-full flex-col', props.className)}
    >
      <div className="border-2 border-console bg-pale flex flex-col gap-2 max-w-[768px] w-full mx-auto">
        <input
          value={props.value}
          placeholder={props.placeholder}
          onChange={props.onChange}
          className="border-none outline-none bg-transparent p-4 focus:ring-0 font-ibm-plex-mono text-console placeholder:text-console/50"
          disabled={props.loading}
        />

        <div className="flex justify-between ml-4 mr-2 mb-2">
          <div className="flex gap-3">{props.children}</div>

          <div className="flex gap-2">
            {props.loading && props.onStop && (
              <Button
                className="border-2 border-console px-3 py-1.5 h-fit bg-pale text-console hover:bg-mint font-ibm-plex-mono text-xs"
                type="button"
                onClick={props.onStop}
              >
                Stop
              </Button>
            )}
            <Button
              className="border-2 border-console p-1.5 h-fit bg-console text-pale hover:bg-console/90"
              type="submit"
              disabled={props.loading}
            >
              {props.loading ? <LoaderCircle className="animate-spin" /> : <ArrowUpIcon size={14} />}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function StickyToBottomContent(props: {
  content: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const context = useStickToBottomContext();

  // scrollRef will also switch between overflow: unset to overflow: auto
  return (
    <div
      ref={context.scrollRef}
      style={{ width: '100%', height: '100%' }}
      className={cn('grid grid-rows-[1fr,auto]', props.className)}
    >
      <div ref={context.contentRef} className={props.contentClassName}>
        {props.content}
      </div>

      {props.footer}
    </div>
  );
}

function getToolDisplayName(toolName: string): string {
  const names: Record<string, string> = {
    gmailSearchTool: '📧 Searching Gmail',
    gmailDraftTool: '📧 Drafting Email',
    getCalendarEventsTool: '📅 Checking Calendar',
    createCalendarEventTool: '📅 Creating Calendar Event',
    exaSearchTool: '🔍 Searching Web',
    shopOnlineTool: '🛒 Shopping',
    getContextDocumentsTool: '📄 Searching Documents',
    getUserInfoTool: '👤 Getting User Info',
  };
  return names[toolName] || '⚙️ Running tool';
}

export function ChatWindow(props: {
  endpoint: string;
  emptyStateComponent: ReactNode;
  placeholder?: string;
  emoji?: string;
}) {
  const searchParams = useSearchParams();
  const threadId = searchParams.get('thread') || 'assistant0-chat';
  
  const { messages, sendMessage, status, toolInterrupt, stop, setMessages } = useInterruptions((handler) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useChat({
      id: threadId,
      transport: new DefaultChatTransport({ api: props.endpoint }),
      generateId,
      onError: handler((e: Error) => {
        console.error('Error: ', e);
        toast.error(`Error while processing your request`, { description: e.message });
      }),
      onToolCall: ({ toolCall }) => {
        // Show real-time tool execution feedback
        const toolDisplayName = getToolDisplayName(toolCall.toolName);
        toast.info(toolDisplayName, {
          duration: 2000,
          icon: '⚙️',
        });
      },
    }),
  );

  // State for step-up authentication modal
  const [showStepUp, setShowStepUp] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ action: string; riskScore: string } | null>(null);

  // Disabled auto-continuation to prevent role ordering errors
  // The AI will respond naturally after tool execution without manual continuation

  // Check for step-up requirement in messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      // Check tool results in message parts for step-up requirement
      const parts = (lastMessage as any).parts;
      console.log('Checking message for step-up:', { parts, lastMessage });
      if (Array.isArray(parts)) {
        for (const part of parts) {
          // Check if this is a tool result that requires step-up
          if (part?.type?.includes('tool-result') || part?.output) {
            const output = part.output || part.result || part;
            const outputStr = JSON.stringify(output).toLowerCase();
            
            if (outputStr.includes('requires_step_up') || outputStr.includes('requiresstepup')) {
              setShowStepUp(true);
              setPendingAction({
                action: part.toolName || 'High-risk operation',
                riskScore: output.riskLevel || 'HIGH',
              });
              return;
            }
          }
          
          // Also check text content for Guardian mentions
          const text = typeof part === 'string' ? part : (part?.text || part?.content || '');
          if (typeof text === 'string') {
            const textLower = text.toLowerCase();
            if (textLower.includes('auth0 guardian') || 
                textLower.includes('requires step-up') || 
                textLower.includes('high risk') ||
                textLower.includes('guardian verification')) {
              console.log('Step-up detected in text:', text);
              setShowStepUp(true);
              setPendingAction({
                action: 'High-risk operation',
                riskScore: 'HIGH',
              });
              return;
            }
          }
        }
      }
    }
  }, [messages]);

  // Load messages from database on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        // Try loading from database for current thread
        const response = await fetch(`/api/chat/history?thread=${threadId}`);
        if (response.ok) {
          const dbMessages = await response.json();
          if (Array.isArray(dbMessages) && dbMessages.length > 0) {
            // Extract content from DB format
            const messages = dbMessages.map((msg: any) => msg.content);
            setMessages(messages);
            console.log('Loaded', messages.length, 'messages from database for thread:', threadId);
            return;
          }
        }
        
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(`chat-${threadId}`);
          if (stored) {
            const parsed = JSON.parse(stored) as UIMessage[];
            if (parsed && parsed.length > 0) {
              setMessages(parsed);
              console.log('Loaded', parsed.length, 'messages from localStorage');
            }
          }
        }
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
    
    loadHistory();
  }, [threadId, setMessages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem(`chat-${threadId}`, JSON.stringify(messages));
    }
  }, [messages, threadId]);

  const [input, setInput] = useState('');

  const isChatLoading = status === 'streaming';

  // Clear chat history function
  async function handleClearChat() {
    if (confirm('Clear all chat history? This cannot be undone.')) {
      setMessages([]);
      localStorage.removeItem(`chat-${threadId}`);
      
      // Also delete from database
      try {
        await fetch(`/api/chat/conversations/${threadId}`, {
          method: 'DELETE',
        });
        toast.success('Chat history cleared');
      } catch (error) {
        console.error('Failed to delete from database:', error);
        toast.success('Chat history cleared from browser');
      }
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim() || isChatLoading) return;
    await sendMessage({ text: input });
    setInput('');
  }

  function handleStop() {
    stop();
    toast.info('Response stopped');
  }

  return (
    <>
      <StepUpAuthModal
        isOpen={showStepUp}
        onClose={() => setShowStepUp(false)}
        onApprove={() => {
          setShowStepUp(false);
          toast.success('✅ Action approved! (In production, this would use Auth0 Guardian)');
        }}
        action={pendingAction?.action || 'High-risk operation'}
        riskScore={pendingAction?.riskScore || 'HIGH'}
      />
      
      <StickToBottom>
        <StickyToBottomContent
          className="absolute inset-0"
          contentClassName="py-8 px-2"
          content={
          messages.length === 0 ? (
            <div>{props.emptyStateComponent}</div>
          ) : (
            <>
              <ChatMessages 
                aiEmoji={props.emoji} 
                messages={messages} 
                emptyStateComponent={props.emptyStateComponent}
                isLoading={isChatLoading}
              />
              <div className="flex flex-col max-w-[768px] mx-auto pb-12 w-full">
                <TokenVaultInterruptHandler 
                  interrupt={toolInterrupt}
                  onFinish={() => {
                    console.log('TokenVault auth completed, sending continuation message');
                    toast.success('✅ Google account connected! Retrying your request...');
                  }}
                />
              </div>
            </>
          )
        }
        footer={
          <div className="sticky bottom-8 px-2">
            <ScrollToBottom className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4" />
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="absolute bottom-full right-2 mb-4 border-2 border-console bg-pale hover:bg-red-100 px-3 py-1.5 font-ibm-plex-mono text-xs text-console hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear Chat
              </button>
            )}
            <ChatInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onSubmit={onSubmit}
              loading={isChatLoading}
              onStop={handleStop}
              placeholder={props.placeholder ?? 'What can I help you with?'}
            ></ChatInput>
          </div>
        }
      ></StickyToBottomContent>
      </StickToBottom>
    </>
  );
}
