import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth-context';
import { ChatService, ChatMessage, ChatSession } from '../../services/chat-service';

interface ChatContextType {
  isChatOpen: boolean;
  toggleChat: () => void;
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: React.ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Initialize chat session when component mounts
  useEffect(() => {
    initializeChat();
  }, [user]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get or create session
      const session = await ChatService.getOrCreateSession(
        user?.id,
        sessionId || undefined
      );
      
      setCurrentSession(session);
      setSessionId(session.session_id);

      // Load existing messages if any
      if (session) {
        const existingMessages = await ChatService.getMessages(session.id);
        setMessages(existingMessages);
      }
    } catch (err: any) {
      console.error('Failed to initialize chat:', err);
      setError(err.message || 'Failed to initialize chat');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  const sendMessage = async (text: string) => {
    if (!currentSession || !text.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      // Save user message
      const userMessage = await ChatService.saveMessage(
        currentSession.id,
        text,
        'user'
      );

      setMessages(prev => [...prev, userMessage]);

      // Generate and save bot response
      const botResponse = ChatService.generateBotResponse(text);
      
      // Simulate typing delay
      setTimeout(async () => {
        try {
          const botMessage = await ChatService.saveMessage(
            currentSession.id,
            botResponse.response,
            'bot',
            botResponse.quickReplies
          );

          setMessages(prev => [...prev, botMessage]);
        } catch (err: any) {
          console.error('Failed to save bot message:', err);
          setError(err.message || 'Failed to save bot message');
        }
      }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds

    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const value: ChatContextType = {
    isChatOpen,
    toggleChat,
    currentSession,
    messages,
    sendMessage,
    isLoading,
    error
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}