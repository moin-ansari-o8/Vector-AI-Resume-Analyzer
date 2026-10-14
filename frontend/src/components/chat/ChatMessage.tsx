import { Bot, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Message } from '@/types/chat.types';

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "shrink-0 w-8 h-8 rounded-full flex items-center justify-center border",
        isUser 
          ? "bg-bg-hover border-border-hover text-text-primary" 
          : "bg-accent-primary/10 border-accent-primary/20 text-accent-primary"
      )}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      
      <div className={cn(
        "max-w-[85%] rounded-lg p-3 text-sm",
        isUser 
          ? "bg-bg-hover text-text-primary border border-border-default rounded-tr-none" 
          : "bg-transparent text-text-secondary border border-border-default rounded-tl-none"
      )}>
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        <span className="block text-[10px] text-text-muted mt-2 text-right">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
