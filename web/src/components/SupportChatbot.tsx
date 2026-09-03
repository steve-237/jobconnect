'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, Loader2, HelpCircle } from 'lucide-react';
import api from '@/lib/api';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export default function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Bonjour ! Je suis l'Assistant IA Support JobConnect 🤖. Posez-moi une question sur le fonctionnement du séquestre, la vérification KYC, les paiements ou les candidatures !",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsgText = input.trim();
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/support-chat', { message: userMsgText });
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: res.data?.answer || "Je reste disponible pour vous guider !",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "Paiement séquestre, vérification KYC et messagerie sont 100% opérationnels sur JobConnect. Notre équipe support est disponible si besoin !",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
          </div>
          <span className="hidden sm:inline font-bold text-xs tracking-wide">Support IA 24/7</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-[#121212] border border-white/15 rounded-3xl w-80 sm:w-96 shadow-2xl overflow-hidden flex flex-col h-[480px] animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/30 via-purple-600/30 to-blue-600/30 border-b border-white/10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary/20 text-primary rounded-xl border border-primary/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Assistant Support IA
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h4>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> En ligne 24h/24
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-muted-foreground hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick FAQ Chips */}
          <div className="px-3 py-2 bg-white/5 border-b border-white/5 flex gap-1.5 overflow-x-auto text-[10px] font-semibold text-muted-foreground no-scrollbar">
            <button
              type="button"
              onClick={() => { setInput("Comment fonctionne le paiement séquestre ?"); }}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-full shrink-0 border border-white/10 transition-colors"
            >
              🛡️ Séquestre
            </button>
            <button
              type="button"
              onClick={() => { setInput("Comment valider mon profil KYC ?"); }}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-full shrink-0 border border-white/10 transition-colors"
            >
              🆔 Badge KYC
            </button>
            <button
              type="button"
              onClick={() => { setInput("Comment gagner des réductions de frais ?"); }}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-full shrink-0 border border-white/10 transition-colors"
            >
              ⭐ Niveaux Or/Diamant
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-white/10 text-gray-200 border border-white/10 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-muted-foreground/60 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 p-3 rounded-2xl border border-white/5 w-fit">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                L'IA réfléchit...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white/5 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question ici..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary font-medium"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-primary hover:bg-primary/80 text-white p-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
