'use client';

import { useEffect, useState, useRef } from 'react';
import { X, Send, Loader2, User, MessageSquare, CheckCheck, Lock } from 'lucide-react';
import api from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

interface ChatModalProps {
  applicationId: string;
  title?: string;
  onClose: () => void;
}

export default function ChatModal({ applicationId, title = 'Discussion en direct', onClose }: ChatModalProps) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
      } catch (e) {}
    }

    // Fetch message history
    api.get(`/messages/${applicationId}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setMessages(res.data);
        } else if (res.data && Array.isArray(res.data.messages)) {
          setMessages(res.data.messages);
          if (res.data.isCompleted || res.data.jobStatus === 'COMPLETED') {
            setIsReadOnly(true);
          }
        }
      })
      .catch((err) => console.error('Failed to load chat history', err))
      .finally(() => setIsLoading(false));
  }, [applicationId]);

  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('joinRoom', { applicationId });

      const handleNewMessage = (message: Message) => {
        setMessages((prev) => {
          // Prevent duplicates by ID
          if (prev.some((m) => m.id === message.id)) return prev;

          // Replace temp message if present
          const filtered = prev.filter(
            (m) => !(m.id.startsWith('temp-') && m.content === message.content && m.senderId === message.senderId)
          );
          return [...filtered, message];
        });
      };

      socket.on('newMessage', handleNewMessage);

      socket.on('error', (err) => {
        console.error('Socket error:', err);
      });

      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.off('error');
      };
    }
  }, [socket, isConnected, applicationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputMessage.trim();
    if (!content) return;

    setInputMessage('');

    // 1. Optimistic Update (Immediate Feedback)
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      content: content,
      createdAt: new Date().toISOString(),
      senderId: currentUserId || 'me',
      sender: {
        id: currentUserId || 'me',
        firstName: 'Vous',
        lastName: '',
        avatarUrl: null,
      },
    };

    setMessages((prev) => [...prev, tempMsg]);

    // 2. Emit websocket message
    if (socket && isConnected) {
      socket.emit('sendMessage', {
        applicationId,
        content: content,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div
        className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Background effect */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-xl shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground leading-snug flex items-center gap-2">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400 animate-pulse'}`}></span>
                {isConnected ? 'En direct (Connecté)' : 'Connexion en cours...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10 scrollbar-thin scrollbar-thumb-white/10">
          {isLoading ? (
            <div className="flex flex-col h-full items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm">Chargement des messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center flex-col text-muted-foreground py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-primary/60" />
              </div>
              <h4 className="text-base font-semibold text-foreground mb-1">Aucun message pour l'instant</h4>
              <p className="text-xs text-muted-foreground max-w-xs">
                Envoyez un premier message pour lancer la discussion avec votre interlocuteur.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.senderId === currentUserId;
              const initials = `${msg.sender?.firstName?.[0] || ''}${msg.sender?.lastName?.[0] || ''}`.toUpperCase() || 'U';

              return (
                <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}>
                  <div className={`flex items-end gap-2.5 max-w-[82%] sm:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isMe ? 'bg-primary text-white' : 'bg-white/10 text-muted-foreground border border-white/10'
                    }`}>
                      {msg.sender?.avatarUrl ? (
                        <img src={msg.sender.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        initials || <User className="w-4 h-4" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[11px] text-muted-foreground/70 mb-1 px-1">
                        {isMe ? 'Vous' : `${msg.sender?.firstName || ''} ${msg.sender?.lastName || ''}`}
                      </span>
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-r from-primary to-blue-600 text-white rounded-br-xs shadow-lg shadow-primary/20'
                            : 'bg-white/[0.08] text-foreground rounded-bl-xs border border-white/10 backdrop-blur-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 mt-1 px-1">
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-primary/80" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar or Read-Only Archived Banner */}
        {isReadOnly ? (
          <div className="p-4 border-t border-white/10 bg-amber-500/10 backdrop-blur-xl shrink-0 z-10 flex items-center justify-center gap-2 text-amber-400 text-xs font-semibold rounded-b-3xl">
            <Lock className="w-4 h-4" />
            <span>Cette mission est terminée. La discussion est archivée en mode lecture seule.</span>
          </div>
        ) : (
          <div className="p-4 border-t border-white/10 bg-black/50 backdrop-blur-xl shrink-0 z-10">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="bg-primary hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed text-white p-3.5 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 shrink-0 flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
