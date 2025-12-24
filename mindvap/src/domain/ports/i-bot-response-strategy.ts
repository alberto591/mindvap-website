export interface BotResponseResult {
    response: string;
    quickReplies?: string[];
    confidence: number; // 0-1 confidence score
}

/**
 * Strategy interface for bot response generation (OCP)
 * Each strategy handles a specific type of user inquiry
 */
export interface IBotResponseStrategy {
    /**
     * Check if this strategy can handle the given message
     */
    canHandle(message: string): boolean;

    /**
     * Generate a response for the message
     */
    generateResponse(message: string): BotResponseResult;

    /**
     * Get the priority of this strategy (higher = checked first)
     */
    getPriority(): number;
}
