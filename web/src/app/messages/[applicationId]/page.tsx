'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2, User } from 'lucide-react';
import Link from 'next/link';
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
  }
}

export default function ChatRoomPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const router = useRouter();
  const { applicationId } = use(params);
  const { socket, isConnected } = useSocket();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    setCurrentUserId(payload.userId);

    // Fetch history
    api.get(`/messages/${applicationId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error('Failed to load history', err))
      .finally(() => setIsLoading(false));
  }, [applicationId, router]);

  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('joinRoom', { applicationId });

      socket.on('newMessage', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      socket.on('error', (err) => {
        console.error('Socket error:', err);
      });
    }

    return () => {
      if (socket) {
        socket.off('newMessage');
        socket.off('error');
      }
    };
  }, [socket, isConnected, applicationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket) return;

    socket.emit('sendMessage', {
      applicationId,
      content: inputMessage.trim(),
    });

    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-[#111] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Chat Room</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
              {isConnected ? 'Connected' : 'Connecting...'}
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center flex-col text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-2 max-w-[75%] sm:max-w-[60%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    {msg.sender?.avatarUrl ? (
                      <img src={msg.sender.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-muted-foreground mb-1 mx-1">
                      {msg.sender?.firstName} {msg.sender?.lastName}
                    </span>
                    <div className={`px-4 py-3 rounded-2xl ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-white/10 text-white rounded-bl-sm border border-white/5'}`}>
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="bg-[#111] border-t border-white/10 p-4 shrink-0 pb-safe">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button 
            type="submit" 
            disabled={!inputMessage.trim() || !isConnected}
            className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl transition-colors flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
}

// Just importing MessageSquare here for the empty state
import { MessageSquare } from 'lucide-react';
