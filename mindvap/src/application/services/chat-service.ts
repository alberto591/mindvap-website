import { supabase } from '../../infrastructure/lib/supabase';
import { log } from '../../infrastructure/lib/logger';
import { moderateContent } from './security-service';

export interface ChatMessage {
  id: string;
  session_id: string;
  message_text: string;
  sender: 'user' | 'bot' | 'agent';
  quick_replies?: string[];
  metadata?: any;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id?: string;
  session_id: string;
  status: 'active' | 'closed' | 'transferred';
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export class ChatService {
  /**
   * Generate a unique session ID for guest users
   */
  private static generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get or create a chat session
   */
  static async getOrCreateSession(userId?: string, sessionId?: string): Promise<ChatSession> {
    const finalSessionId = sessionId || this.generateSessionId();

    // Check if session exists
    const { data: existingSession } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('session_id', finalSessionId)
      .single();

    if (existingSession) {
      return existingSession;
    }

    // Create new session
    const { data: newSession, error } = await supabase
      .from('chat_sessions')
      .insert({
        session_id: finalSessionId,
        user_id: userId || null,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create chat session: ${error.message} `);
    }

    return newSession;
  }

  /**
   * Save a chat message
   */
  static async saveMessage(
    sessionId: string,
    messageText: string,
    sender: 'user' | 'bot' | 'agent',
    quickReplies?: string[],
    metadata?: any
  ): Promise<ChatMessage> {
    // ADR-0012: Content Moderation via reasoning
    const moderation = await moderateContent(messageText);

    if (moderation.blocked) {
      log.warn('Message blocked by content moderation', { sessionId, messageText, reasoning: moderation.reasoning });
      throw new Error(`Message blocked: ${moderation.reasoning}`);
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        message_text: messageText,
        sender: sender,
        quick_replies: quickReplies || null,
        metadata: metadata || null
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save message: ${error.message} `);
    }

    return data;
  }

  /**
   * Get chat messages for a session
   */
  static async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message} `);
    }

    return data || [];
  }

  /**
   * Generate bot response based on user message
   */
  static generateBotResponse(userMessage: string): { response: string; quickReplies?: string[] } {
    const message = userMessage.toLowerCase();

    // 1. Master Herbalist Trigger (New)
    if (message.includes('herbalist') || message.includes('consultation') || message.includes('custom mix') || message.includes('formulate')) {
      return {
        response: 'Welcome! I am your AI Master Herbalist. I can create a custom herbal blend tailored to your specific goals (sleep, focus, mood) while respecting your health constraints. Would you like to start a consultation?',
        quickReplies: ['Start Consultation', 'Tell me more', 'View pre-made blends']
      };
    }

    // 2. Track order related queries
    if (message.includes('track') || message.includes('order') || message.includes('status')) {
      return {
        response: 'Please provide your order number and we\'ll help you track it. You can also check your order status in your account dashboard or use our guest order tracker.',
        quickReplies: ['Track my order', 'Order history', 'Guest order tracking', 'Contact support']
      };
    }

    // 3. Shipping related queries
    if (message.includes('shipping') || message.includes('delivery') || message.includes('ship')) {
      return {
        response: 'We offer standard shipping (5-7 days) and express shipping (2-3 days). Free shipping on orders over $50 (€75 in Europe). You can track your shipment once it\'s dispatched.',
        quickReplies: ['Shipping rates', 'Express shipping', 'International shipping', 'Track shipment']
      };
    }

    // 4. Return/refund queries
    if (message.includes('return') || message.includes('refund') || message.includes('exchange')) {
      return {
        response: 'Our return policy allows returns within 30 days of purchase. Items must be in original condition. Contact support@mindvap.com for return instructions.',
        quickReplies: ['Return policy', 'Refund process', 'Exchange items', 'Contact support']
      };
    }

    // 5. Payment related queries
    if (message.includes('payment') || message.includes('stripe') || message.includes('card') || message.includes('paypal')) {
      return {
        response: 'We accept all major credit cards securely through Stripe. Your payment information is encrypted and protected. We also support PayPal and other secure payment methods.',
        quickReplies: ['Payment methods', 'Security info', 'Failed payment', 'Billing questions']
      };
    }

    // 6. Product related queries
    if (message.includes('product') || message.includes('herb') || message.includes('blend') || message.includes('ingredient')) {
      return {
        response: 'Our herbal blends are carefully crafted using premium ingredients. Each product page contains detailed information about ingredients, benefits, and usage. What specific product are you interested in?',
        quickReplies: ['Product catalog', 'Ingredients', 'Benefits', 'Usage guide']
      };
    }

    // 7. Age verification
    if (message.includes('age') || message.includes('21') || message.includes('verification') || message.includes('older')) {
      return {
        response: 'Yes, you must be 21 years or older to purchase our herbal products. This is required by law and we take age verification seriously for all orders.',
        quickReplies: ['Age verification', 'Legal compliance', 'Contact support']
      };
    }

    // 8. International shipping
    if (message.includes('international') || message.includes('europe') || message.includes('global') || message.includes('outside us')) {
      return {
        response: 'Yes, we ship internationally! We currently ship to 30+ European countries with European shipping rates and VAT calculations. Delivery typically takes 3-5 business days.',
        quickReplies: ['European shipping', 'International rates', 'VAT info', 'Customs info']
      };
    }

    // 9. Contact/support
    if (message.includes('contact') || message.includes('email') || message.includes('support') || message.includes('help')) {
      return {
        response: 'You can reach our support team at support@mindvap.com or through this chat. We typically respond within 2-4 hours during business hours (Mon-Fri, 9AM-6PM EST).',
        quickReplies: ['Email support', 'Business hours', 'FAQ', 'Live chat']
      };
    }

    // 10. Pricing
    if (message.includes('price') || message.includes('cost') || message.includes('money') || message.includes('expensive') || message.includes('cheap')) {
      return {
        response: 'Our prices vary by product and quantity. You can find all pricing information on our product pages. We offer competitive rates and free shipping on orders over $50.',
        quickReplies: ['View products', 'Bulk discounts', 'Free shipping', 'Payment options']
      };
    }

    // 11. Account related
    if (message.includes('account') || message.includes('login') || message.includes('register') || message.includes('profile')) {
      return {
        response: 'You can create an account to track orders, save addresses, and get faster checkout. Guest checkout is also available. Would you like help with account creation?',
        quickReplies: ['Create account', 'Login help', 'Guest checkout', 'Account benefits']
      };
    }

    // 12. Human agent request
    if (message.includes('human') || message.includes('agent') || message.includes('representative') || message.includes('speak to someone')) {
      return {
        response: 'I\'ve connected you with our support team. An agent will join the conversation shortly. In the meantime, please describe your issue so we can assist you better.',
        quickReplies: ['Order issue', 'Product question', 'Account help', 'Technical support']
      };
    }

    // 13. Technical issues
    if (message.includes('error') || message.includes('broken') || message.includes('not working') || message.includes('problem') || message.includes('issue')) {
      return {
        response: 'I\'m sorry to hear you\'re experiencing technical difficulties. Could you please describe the specific issue you\'re facing? Our technical team will help resolve this quickly.',
        quickReplies: ['Website issue', 'Payment error', 'Login problem', 'App not working']
      };
    }

    // Default response
    return {
      response: 'Thanks for your message! I\'m here to help with any questions about our products, orders, shipping, or account. I can also connect you with our AI Master Herbalist for a custom blend.',
      quickReplies: ['Track my order', 'Consult Herbalist', 'Shipping info', 'Contact support']
    };
  }

  /**
   * Handle the specialized Herbalist Consultation
   */
  static async handleHerbalistConsultation(userMessage: string, apiKey?: string): Promise<{ response: string; metadata?: any; quickReplies?: string[] }> {
    const message = userMessage.toLowerCase();

    // Check for goal keywords
    const goals = ['sleep', 'focus', 'energy', 'calm', 'relaxation', 'mood_support', 'mind_clarity'];
    const detectedGoal = goals.find(g => message.includes(g.replace('_', ' '))) as any;

    if (detectedGoal) {
      if (!apiKey) {
        return {
          response: `I have some great ideas for a ${detectedGoal} blend! However, to generate a precise, research-backed formulation, I need an OpenAI API key. You can add one in the Lab settings (Admin) or continue with our pre-made options.`,
          quickReplies: [`View pre-made ${detectedGoal} blends`, 'How to add API key']
        };
      }

      try {
        const { generateFormulation } = await import('./formulation-service.js');
        const result = await generateFormulation({
          goal: detectedGoal,
          format: 'tea', // Default to tea for chat
          constraints: [],
          apiKey
        });

        return {
          response: `I've formulated a special blend for you: **${result.name}**. ${result.description}\n\nKey Ingredients: ${result.ingredients.map(i => i.name).join(', ')}.\n\nWould you like to add this custom mix to your cart?`,
          metadata: { formulation: result },
          quickReplies: ['Add to Cart', 'Adjust Blend', 'Start Over']
        };
      } catch (error) {
        return {
          response: 'I encountered an error while formulating your blend. Please try again or check your API key.',
          quickReplies: ['Try Again', 'Contact Support']
        };
      }
    }

    return {
      response: 'What is your primary wellness goal? (e.g., Better sleep, more focus, or reduced stress?)',
      quickReplies: ['Better Sleep', 'More Focus', 'Reduced Stress', 'Energy Boost']
    };
  }

  /**
   * Close a chat session
   */
  static async closeSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_sessions')
      .update({ status: 'closed', updated_at: new Date().toISOString() })
      .eq('session_id', sessionId);

    if (error) {
      throw new Error(`Failed to close session: ${error.message} `);
    }
  }

  /**
   * Get chat statistics (for admin)
   */
  static async getChatStats(startDate?: string, endDate?: string) {
    let query = supabase
      .from('chat_sessions')
      .select('id, status, created_at, last_message_at');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch chat stats: ${error.message} `);
    }

    const stats = {
      totalSessions: data?.length || 0,
      activeSessions: data?.filter(s => s.status === 'active').length || 0,
      closedSessions: data?.filter(s => s.status === 'closed').length || 0,
      transferredSessions: data?.filter(s => s.status === 'transferred').length || 0,
      averageSessionDuration: 0
    };

    return stats;
  }
}