import React, { useState } from 'react';
import { MessageCircle, X, Minimize2, Send, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { useLanguage } from '../../contexts/language-context';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  quickReplies?: string[];
}

export default function Chat() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize chat with welcome message when opened
  React.useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: t('chat.welcome'),
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: [
          t('chat.quickReplies.trackOrder'),
          t('chat.quickReplies.productQuestions'),
          t('chat.quickReplies.shippingInfo'),
          t('chat.quickReplies.other')
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, t]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('track') || message.includes('order')) {
      return t('chat.response.orderTracking');
    }
    
    if (message.includes('shipping')) {
      return t('chat.response.shipping');
    }
    
    if (message.includes('return') || message.includes('refund')) {
      return t('chat.response.returns');
    }
    
    if (message.includes('payment') || message.includes('stripe') || message.includes('card')) {
      return t('chat.response.payment');
    }
    
    if (message.includes('product') || message.includes('herb')) {
      return t('chat.response.product');
    }
    
    if (message.includes('age') || message.includes('21') || message.includes('verification')) {
      return t('chat.response.ageVerification');
    }
    
    if (message.includes('international') || message.includes('europe')) {
      return t('chat.response.international');
    }
    
    if (message.includes('contact') || message.includes('email') || message.includes('support')) {
      return t('chat.response.contact');
    }
    
    if (message.includes('price') || message.includes('cost') || message.includes('money')) {
      return t('chat.response.pricing');
    }
    
    return t('chat.response.fallback');
  };

  const handleSendMessage = (text: string) => {
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
        quickReplies: [
          t('chat.quickReplies.trackOrder'),
          t('chat.quickReplies.shippingInfo'),
          t('chat.quickReplies.productQuestions'),
          t('chat.quickReplies.contactSupport')
        ]
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-brand text-white w-14 h-14 rounded-full shadow-lg hover:bg-brand-light transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
          aria-label={t('chat.openAriaLabel')}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Chat Header */}
          <div className="bg-brand text-white p-4 rounded-t-lg flex items-center justify-between">
            <h3 className="font-semibold text-lg">{t('chat.header')}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label={t('chat.minimizeAriaLabel')}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label={t('chat.closeAriaLabel')}
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
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('chat.inputPlaceholder')}
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
              onClick={() => handleSendMessage(t('chat.speakToHuman'))}
              className="w-full mt-2 text-xs text-gray-500 hover:text-brand transition-colors py-1"
            >
              → {t('chat.speakToHuman')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}