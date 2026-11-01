/**
 * @file AssistantChat.tsx
 * @description Accessible conversational AI Event Copilot drawer with quick suggestions,
 * prompt sanitization, and real-time event context grounding.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  Lightbulb, 
  Trash2 
} from 'lucide-react';
import { FullEventPlan, ChatMessage } from '../types/event';
import { queryAssistantCopilot } from '../services/gemini';
import { sanitizeText } from '../utils/security';

interface AssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
  plan: FullEventPlan;
  onUpdatePlan: (updated: FullEventPlan) => void;
  externalPrompt?: string;
  clearExternalPrompt?: () => void;
}

const QUICK_PROMPTS = [
  'How can I save $1,000 on catering without guests noticing?',
  'Suggest 3 fun interactive icebreakers for our guest count',
  'What should my weather backup plan be?',
  'What key questions should I ask before signing with the venue?',
];

export const AssistantChat: React.FC<AssistantChatProps> = ({
  isOpen,
  onClose,
  plan,
  onUpdatePlan,
  externalPrompt,
  clearExternalPrompt,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, plan.chatHistory]);

  // Handle external prompt injection from other tabs
  useEffect(() => {
    if (externalPrompt && externalPrompt.trim()) {
      handleSendMessage(externalPrompt);
      if (clearExternalPrompt) clearExternalPrompt();
    }
  }, [externalPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = sanitizeText(textToSend || inputMessage, 500);
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...plan.chatHistory, userMsg];
    onUpdatePlan({ ...plan, chatHistory: updatedHistory });
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await queryAssistantCopilot(text, plan);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
      };

      onUpdatePlan({
        ...plan,
        chatHistory: [...updatedHistory, assistantMsg],
      });
    } catch {
      const errorMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: "I'm having trouble connecting right now, but your event plan is safe! Feel free to ask another question.",
        timestamp: new Date().toISOString(),
      };
      onUpdatePlan({
        ...plan,
        chatHistory: [...updatedHistory, errorMsg],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    onUpdatePlan({ ...plan, chatHistory: [] });
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Gatherly AI Copilot Chat Drawer"
      role="complementary"
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 md:w-[420px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slide-up sm:animate-fade-in"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-50 to-white dark:from-slate-900 dark:to-brand-950/20">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span>Gatherly Copilot</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                Online
              </span>
            </h3>
            <span className="text-[11px] text-slate-400">Context: {plan.details.title}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition focus-visible:ring-2 focus-visible:ring-rose-500"
            title="Clear Chat History"
            aria-label="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition focus-visible:ring-2 focus-visible:ring-brand-500"
            title="Close Drawer"
            aria-label="Close Copilot chat drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">
        {plan.chatHistory.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Ask your Event Copilot anything
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              I can calculate savings, suggest creative games, draft vendor emails, or tweak your schedule.
            </p>
          </div>
        ) : (
          plan.chatHistory.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 ${
                  isUser ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-slate-700 text-white'
                      : 'bg-brand-600 text-white shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    isUser
                      ? 'bg-brand-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-start space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2 font-medium">Gatherly AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
        <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span>Quick Suggestions:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:text-brand-600 dark:hover:text-brand-300 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700 transition truncate max-w-full focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <label htmlFor="copilot-user-input" className="sr-only">
            Ask Gatherly AI Copilot
          </label>
          <input
            id="copilot-user-input"
            type="text"
            placeholder="Ask Copilot (e.g. 'Cut $500 from florals')..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
          />
          <button
            type="submit"
            aria-label="Send message to Copilot"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 shadow-xs transition focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
};
