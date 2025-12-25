import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Send, Clock, Sparkles, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { useLanguage } from '../../contexts/language-context';
import { useCart } from '../../contexts/cart-context';
import { generateFormulation, FormulationResult, FormulationCriteria } from '../../../application/services/formulation-service';
import { CustomFormula } from '../../../domain/entities/index';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  quickReplies?: { text: string; action?: string }[];
  formulation?: FormulationResult;
}

type ChatFlowState = 'IDLE' | 'COLLECT_GOAL' | 'COLLECT_FORMAT' | 'COLLECT_SAFETY' | 'GENERATING';

export default function Chat() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [baseCustomProduct, setBaseCustomProduct] = useState<any>(null);

  // Master Herbalist State
  const [flowState, setFlowState] = useState<ChatFlowState>('IDLE');
  const [selections, setSelections] = useState<Partial<FormulationCriteria>>({
    constraints: []
  });

  // Load base custom product
  useEffect(() => {
    fetch('/data/products.json')
      .then(res => res.json())
      .then(products => {
        const product = products.find((p: any) => p.id === 'master-herbalist-custom-blend');
        setBaseCustomProduct(product);
      })
      .catch(err => console.error('Failed to load custom product base', err));
  }, []);

  // Initialize chat with welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: t('chat.welcome'),
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: [
          { text: t('chat.quickReplies.customBlend'), action: 'START_CUSTOM' },
          { text: t('chat.quickReplies.trackOrder') },
          { text: t('chat.quickReplies.productQuestions') },
          { text: t('chat.quickReplies.shippingInfo') }
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, t]);

  const handleMasterHerbalistFlow = async (action: string | undefined, userText: string) => {
    let nextState: ChatFlowState = flowState;
    let botResponseText = '';
    let quickReplies: { text: string; action?: string }[] = [];

    if (action === 'START_CUSTOM') {
      nextState = 'COLLECT_GOAL';
      botResponseText = t('chat.masterHerbalist.intro') + '\n\n' + t('chat.masterHerbalist.askGoal');
      quickReplies = [
        { text: t('chat.masterHerbalist.goal.anxiety'), action: 'SET_GOAL:calm' },
        { text: t('chat.masterHerbalist.goal.sleep'), action: 'SET_GOAL:sleep' },
        { text: t('chat.masterHerbalist.goal.focus'), action: 'SET_GOAL:focus' }
      ];
      setSelections({ constraints: [] });
    }
    else if (action?.startsWith('SET_GOAL:')) {
      const goal = action.split(':')[1] as any;
      setSelections(prev => ({ ...prev, goal }));
      nextState = 'COLLECT_FORMAT';
      botResponseText = t('chat.masterHerbalist.askFormat');
      quickReplies = [
        { text: t('chat.masterHerbalist.format.tea'), action: 'SET_FORMAT:tea' },
        { text: t('chat.masterHerbalist.format.smoking_blend'), action: 'SET_FORMAT:smoking_blend' }
      ];
    }
    else if (action?.startsWith('SET_FORMAT:')) {
      const format = action.split(':')[1] as any;
      setSelections(prev => ({ ...prev, format }));
      nextState = 'COLLECT_SAFETY';
      botResponseText = t('chat.masterHerbalist.askSafety');
      quickReplies = [
        { text: t('chat.masterHerbalist.safety.none'), action: 'GENERATE:none' },
        { text: t('chat.masterHerbalist.safety.pregnancy'), action: 'GENERATE:pregnancy' },
        { text: t('chat.masterHerbalist.safety.medication'), action: 'GENERATE:medication' }
      ];
    }
    else if (action?.startsWith('GENERATE:')) {
      const constraint = action.split(':')[1];
      const finalConstraints = constraint === 'none' ? [] : [constraint];
      const criteria: FormulationCriteria = {
        ...selections,
        constraints: finalConstraints,
        apiKey: (process.env.NEXT_PUBLIC_OPENAI_API_KEY as string) || 'dummy-key'
      } as FormulationCriteria;

      setFlowState('GENERATING');
      setIsTyping(true);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: t('chat.masterHerbalist.generating'),
        sender: 'bot',
        timestamp: new Date()
      }]);

      try {
        const result = await generateFormulation(criteria);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: t('chat.masterHerbalist.success'),
          sender: 'bot',
          timestamp: new Date(),
          formulation: result
        }]);
      } catch (error) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: t('common.error') + ': Failed to generate blend.',
          sender: 'bot',
          timestamp: new Date()
        }]);
      } finally {
        setIsTyping(false);
        setFlowState('IDLE');
      }
      return;
    }

    if (botResponseText) {
      setFlowState(nextState);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
        quickReplies
      }]);
    }
  };

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    if (message.includes('track') || message.includes('order')) return t('chat.response.orderTracking');
    if (message.includes('shipping')) return t('chat.response.shipping');
    if (message.includes('return') || message.includes('refund')) return t('chat.response.returns');
    if (message.includes('payment')) return t('chat.response.payment');
    if (message.includes('product') || message.includes('herb')) return t('chat.response.product');
    return t('chat.response.fallback');
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), text, sender: 'user', timestamp: new Date() }]);
    setInputValue('');
    if (flowState !== 'IDLE') setFlowState('IDLE');
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(text),
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: [
          { text: t('chat.quickReplies.customBlend'), action: 'START_CUSTOM' },
          { text: t('chat.quickReplies.trackOrder') },
          { text: t('chat.quickReplies.contactSupport') }
        ]
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickReply = (reply: { text: string; action?: string }) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), text: reply.text, sender: 'user', timestamp: new Date() }]);
    if (reply.action || flowState !== 'IDLE') {
      handleMasterHerbalistFlow(reply.action, reply.text);
    } else {
      handleSendMessage(reply.text);
    }
  };

  const handleAddToCart = (formula: FormulationResult) => {
    if (!baseCustomProduct) return;
    const customItem: CustomFormula = {
      id: `custom-${Date.now()}`,
      name: formula.name,
      price: 49.99,
      ingredients: formula.ingredients,
      instructions: formula.instructions,
      isCustom: true
    };
    addToCart(baseCustomProduct, 1, customItem);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-brand text-white w-14 h-14 rounded-full shadow-lg hover:bg-brand-light transition-all flex items-center justify-center z-50 hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-brand text-white p-4 rounded-t-lg flex items-center justify-between">
            <h3 className="font-semibold text-lg">{t('chat.header')}</h3>
            <div className="flex gap-2">
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200"><Minimize2 className="w-4 h-4" /></button>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200"><X className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 ${m.sender === 'user' ? 'bg-brand text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                  <p className="text-sm whitespace-pre-wrap">{m.text}</p>

                  {m.formulation && (
                    <div className="mt-4 bg-white rounded-lg p-4 border border-brand/20 shadow-sm text-gray-800">
                      <div className="flex items-center gap-2 mb-3 text-brand">
                        <Sparkles className="w-5 h-5" />
                        <h4 className="font-bold">{m.formulation.name}</h4>
                      </div>
                      <p className="text-xs mb-4 text-gray-600 italic">"{m.formulation.description}"</p>
                      <div className="space-y-3 mb-4">
                        {m.formulation.ingredients.map((ing, i) => (
                          <div key={i} className="flex justify-between items-start text-xs border-l-2 border-brand/10 pl-2">
                            <div className="flex-1">
                              <span className="font-semibold">{ing.name}</span>
                              <p className="text-[10px] text-gray-500 line-clamp-1">{ing.reason}</p>
                            </div>
                            <span className="bg-brand/5 px-2 py-0.5 rounded font-mono text-brand">{ing.percentage}%</span>
                          </div>
                        ))}
                      </div>
                      {m.formulation.safetyStatus && !m.formulation.safetyStatus.safe && (
                        <div className="mb-4 p-2 bg-amber-50 rounded border border-amber-200 text-amber-700 text-[10px] flex gap-2">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                          <div>
                            <p className="font-bold uppercase">Safety Warning</p>
                            <ul className="list-disc pl-3">
                              {m.formulation.safetyStatus.warnings.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => handleAddToCart(m.formulation!)}
                        className="w-full bg-brand text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-brand-light"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {t('chat.masterHerbalist.addToCart')}
                        <span className="ml-auto text-[10px] opacity-70">$49.99</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                    <Clock className="w-3 h-3" />
                    <span>{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {m.quickReplies && (
                    <div className="mt-3 space-y-2">
                      {m.quickReplies.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuickReply(r)}
                          className="block w-full text-left text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between group"
                        >
                          <span>{r.text}</span>
                          <Sparkles className={`w-3 h-3 text-brand opacity-0 group-hover:opacity-100 ${r.action ? '' : 'hidden'}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('chat.inputPlaceholder')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                disabled={isTyping}
              />
              <button type="submit" disabled={!inputValue.trim() || isTyping} className="px-4 py-2 bg-brand text-white rounded-lg disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </form>
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