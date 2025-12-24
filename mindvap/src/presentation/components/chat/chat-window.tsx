import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Send, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  quickReplies?: string[];
}

interface ChatWindowProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatWindow({ isOpen, onToggle }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: 'Hi! How can we help you today?',
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: ['Track my order', 'Product questions', 'Shipping info', 'Other']
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('track') || message.includes('order')) {
      return 'Please provide your order number and we\'ll help you track it. You can also check your order status in your account dashboard.';
    }
    
    if (message.includes('shipping')) {
      return 'We offer standard shipping (5-7 days) and express shipping (2-3 days). Free shipping on orders over $50 (€75 in Europe). You can track your shipment once it\'s dispatched.';
    }
    
    if (message.includes('return') || message.includes('refund')) {
      return 'Our return policy allows returns within 30 days of purchase. Items must be in original condition. Contact support@mindvap.com for return instructions.';
    }
    
    if (message.includes('payment') || message.includes('stripe') || message.includes('card')) {
      return 'We accept all major credit cards securely through Stripe. Your payment information is encrypted and protected. We also support PayPal and other secure payment methods.';
    }
    
    if (message.includes('product') || message.includes('herb')) {
      return 'Our herbal blends are carefully crafted using premium ingredients. Each product page contains detailed information about ingredients, benefits, and usage. What specific product are you interested in?';
    }
    
    if (message.includes('age') || message.includes('21') || message.includes('verification')) {
      return 'Yes, you must be 21 years or older to purchase our herbal products. This is required by law and we take age verification seriously.';
    }
    
    if (message.includes('international') || message.includes('europe')) {
      return 'Yes, we ship internationally! We currently ship to 30+ European countries with European shipping rates and VAT calculations. Delivery typically takes 3-5 business days.';
    }
    
    if (message.includes('contact') || message.includes('email') || message.includes('support')) {
      return 'You can reach our support team at support@mindvap.com or through this chat. We typically respond within 2-4 hours during business hours.';
    }
    
    if (message.includes('price') || message.includes('cost') || message.includes('money')) {
      return 'Our prices vary by product and quantity. You can find all pricing information on our product pages. We offer competitive rates and free shipping on orders over $50.';
    }
    
    // Default response
    return 'Thanks for your message! A support agent will respond shortly. For immediate assistance, you can also email us at support@mindvap.com or call us at +1 (555) 123-4567.';
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(text),
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: ['Track my order', 'Shipping info', 'Product questions', 'Contact support']
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
      {/* Chat Header */}
      <div className="bg-brand text-white p-4 rounded-t-lg flex items-center justify-between">
        <h3 className="font-semibold text-lg">Customer Support</h3>
        <div className="flex gap-2">
          <button
            onClick={onToggle}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Minimize chat"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggle}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${
              message.sender === 'user' 
                ? 'bg-brand text-white rounded-br-sm' 
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              <p className="text-sm">{message.text}</p>
              <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                <Clock className="w-3 h-3" />
                <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              
              {/* Quick Replies */}
              {message.quickReplies && (
                <div className="mt-3 space-y-2">
                  {message.quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="block w-full text-left text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-sm p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        
        {/* Agent Transfer Button */}
        <button
          onClick={() => handleSendMessage('Speak to a human')}
          className="w-full mt-2 text-xs text-gray-500 hover:text-brand transition-colors py-1"
        >
          → Speak to a human
        </button>
      </div>
    </div>
  );
}