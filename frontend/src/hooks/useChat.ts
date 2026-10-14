import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import type { Message } from '@/types/chat.types';

export function useChat(context?: Record<string, any>) {
  const [messages, setMessages] = useState<Message[]>([]);

  const { mutate: sendMessage, isPending: isTyping } = useMutation({
    mutationFn: (newMessages: Message[]) => chatService.sendMessage(newMessages, context),
    onMutate: (newMessages) => {
      setMessages(newMessages); // Optimistic update
    },
    onSuccess: (responseMessage) => {
      setMessages((prev) => [...prev, responseMessage]);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      // Could add an error message to the chat here
    },
  });

  const appendUserMessage = useCallback((content: string) => {
    const newMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    sendMessage([...messages, newMessage]);
  }, [messages, sendMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isTyping,
    appendUserMessage,
    clearChat,
  };
}
