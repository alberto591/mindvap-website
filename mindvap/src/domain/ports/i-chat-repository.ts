export interface ChatSession {
    id: string;
    user_id?: string;
    status: 'active' | 'closed';
    started_at: string;
    ended_at?: string;
    metadata?: Record<string, any>;
}

export interface ChatMessage {
    id: string;
    session_id: string;
    sender: 'user' | 'bot';
    message: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

export interface ChatStats {
    totalSessions: number;
    activeSessions: number;
    totalMessages: number;
    averageMessagesPerSession: number;
    averageSessionDuration: number;
}

export interface IChatRepository {
    // Session management
    createSession(userId?: string): Promise<ChatSession>;
    getSession(sessionId: string): Promise<ChatSession | null>;
    updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<void>;
    closeSession(sessionId: string): Promise<void>;

    // Message management
    saveMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage>;
    getMessages(sessionId: string): Promise<ChatMessage[]>;

    // Analytics
    getChatStats(startDate?: string, endDate?: string): Promise<ChatStats>;
}
