import { type UIMessage } from 'ai';
import { MemoizedMarkdown } from './memoized-markdown';
import { cn } from '@/utils/cn';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

function uiMessageToText(message: UIMessage): string {
  if (Array.isArray((message as any).parts)) {
    return (message as any).parts
      .map((p: any) => {
        if (typeof p === 'string') return p;
        if (typeof p?.text === 'string') return p.text;
        if (typeof p?.content === 'string') return p.content;
        return '';
      })
      .join('');
  }
  return (message as any).content ?? '';
}

function getToolCallsFromMessage(message: UIMessage): Array<{
  toolCallId: string;
  toolName: string;
  args: any;
  result?: any;
  status: 'pending' | 'complete' | 'error';
}> {
  const parts = (message as any).parts;
  if (!Array.isArray(parts)) return [];

  const toolCalls: Array<{
    toolCallId: string;
    toolName: string;
    args: any;
    result?: any;
    status: 'pending' | 'complete' | 'error';
  }> = [];

  parts.forEach((part: any) => {
    // Check if this part is a tool call (starts with "tool-")
    if (part?.type && part.type.startsWith('tool-') && part.toolCallId) {
      const toolName = part.type.replace('tool-', '');
      
      // Determine status based on available information
      let status: 'pending' | 'complete' | 'error' = 'pending';
      if (part.state === 'output-available' || part.output !== undefined) {
        status = 'complete';
      } else if (part.state === 'error' || part.isError) {
        status = 'error';
      }
      
      toolCalls.push({
        toolCallId: part.toolCallId,
        toolName,
        args: part.input || part.args || {},
        result: part.output || part.result,
        status
      });
    }
  });

  return toolCalls;
}

function ToolCallDisplay({ toolCall }: { 
  toolCall: {
    toolCallId: string;
    toolName: string;
    args: any;
    result?: any;
    status: 'pending' | 'complete' | 'error';
  }
}) {
  const { toolName, args, result, status } = toolCall;

  return (
    <div className="border-2 border-console p-3 mb-2 bg-pale hover:bg-mint transition-colors">
      <div className="flex items-center gap-2 mb-2">
        {status === 'pending' && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
        {status === 'complete' && <CheckCircle className="w-4 h-4 text-green-500" />}
        {status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
        <span className="font-ibm-plex-mono font-bold text-xs text-console">
          {status === 'pending' && `Calling ${toolName}...`}
          {status === 'complete' && `Called ${toolName}`}
          {status === 'error' && `Error calling ${toolName}`}
        </span>
      </div>

      {/* Show tool arguments/input */}
      {args && Object.keys(args).length > 0 && (
        <div className="mb-2">
          <div className="font-ibm-plex-mono text-xs text-console/70 mb-1 font-bold">INPUT:</div>
          <div className="bg-mint border-2 border-console px-3 py-2 font-ibm-plex-mono text-xs">
            {Object.entries(args).map(([key, value]) => (
              <div key={key} className="mb-1 last:mb-0">
                <span className="text-console font-bold">{key}:</span>{' '}
                <span className="text-console/80">
                  {typeof value === 'string' ? `"${value}"` : JSON.stringify(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show tool result/output */}
      {result !== undefined && (
        <div>
          <div className="font-ibm-plex-mono text-xs text-console/70 mb-1 font-bold">OUTPUT:</div>
          <div className="bg-mint border-2 border-console px-3 py-2 font-ibm-plex-mono text-xs">
            <span className="text-console">
              {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function ChatMessageBubble(props: { message: UIMessage; aiEmoji?: string }) {
  const { message, aiEmoji } = props;
  const text = uiMessageToText(message);
  const toolCalls = getToolCallsFromMessage(message);

  return (
    <div
      className={cn(
        'max-w-[80%] mb-8 flex transition-colors',
        message.role === 'user' ? 'bg-console text-pale border-2 border-console px-4 py-2 hover:bg-console/90 font-ibm-plex-mono' : null,
        message.role === 'user' ? 'ml-auto' : 'mr-auto',
      )}
    >
      {message.role !== 'user' && (
        <div className="mr-4 -mt-2 mt-1 border-2 border-console bg-pale w-10 h-10 flex-shrink-0 flex items-center justify-center">
          {aiEmoji}
        </div>
      )}

      <div className="chat-message-bubble whitespace-pre-wrap flex flex-col prose dark:prose-invert max-w-none font-ibm-plex-mono text-sm">
        {/* Render tool calls if present */}
        {toolCalls.length > 0 && (
          <div className="mb-3">
            {toolCalls.map((toolCall, index) => (
              <ToolCallDisplay key={`${toolCall.toolCallId}-${index}`} toolCall={toolCall} />
            ))}
          </div>
        )}
        
        {/* Render text content if present */}
        {text && <MemoizedMarkdown content={text} id={message.id as any} />}
      </div>
    </div>
  );
}