'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, MessageSquare, CheckCircle, XCircle, Briefcase, Star, ExternalLink } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useLanguage } from '@/contexts/LanguageContext';

export interface NotificationItem {
  id: string;
  type: 'NEW_MESSAGE' | 'APPLICATION_ACCEPTED' | 'APPLICATION_REJECTED' | 'NEW_APPLICATION' | 'JOB_COMPLETED' | 'JOB_INVITATION' | 'SYSTEM';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
  applicationId?: string;
}

export default function NotificationBell({
  userId,
  theme = 'primary',
  onNotificationClick,
}: {
  userId?: string;
  theme?: 'primary' | 'amber';
  onNotificationClick?: (notif: NotificationItem) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useSocket();
  const { t } = useLanguage();

  const isAmber = theme === 'amber';
  const badgeBg = isAmber ? 'bg-amber-500' : 'bg-primary';
  const textAccent = isAmber ? 'text-amber-400' : 'text-primary';
  const activeDotBg = isAmber ? 'bg-amber-500' : 'bg-blue-500';

  const storageKey = userId ? `jobconnect_notifs_${userId}` : 'jobconnect_notifs';

  // Load persisted notifications
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        // Sample initial notifications if empty
        setNotifications([
          {
            id: 'sample-1',
            type: 'SYSTEM',
            title: 'Bienvenue sur JobConnect ! 🚀',
            message: 'Votre compte est prêt. Explorez les annonces ou complétez votre profil.',
            createdAt: new Date().toISOString(),
            read: false,
          },
        ]);
      }
    } catch (e) {
      console.error('Failed to load notifications from localStorage', e);
    }
  }, [storageKey]);

  // Save notifications to localStorage
  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
  };

  // Real-time socket notification listener
  useEffect(() => {
    if (socket && isConnected) {
      const handleSocketNotif = (notifData: any) => {
        const newNotif: NotificationItem = {
          id: notifData.id || `notif-${Date.now()}`,
          type: notifData.type || 'SYSTEM',
          title: notifData.title || (notifData.type === 'NEW_MESSAGE' ? `Message de ${notifData.senderName || 'un utilisateur'}` : 'Nouvelle notification'),
          message: notifData.content || notifData.message || `Concernant la mission ${notifData.jobTitle || ''}`,
          createdAt: new Date().toISOString(),
          read: false,
          link: notifData.applicationId ? `/messages/${notifData.applicationId}` : undefined,
          applicationId: notifData.applicationId,
        };

        setNotifications((prev) => {
          const updated = [newNotif, ...prev];
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      };

      socket.on('notification', handleSocketNotif);
      return () => {
        socket.off('notification', handleSocketNotif);
      };
    }
  }, [socket, isConnected, storageKey]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
  };

  const handleNotifClick = (notif: NotificationItem) => {
    // Mark as read
    const updated = notifications.map((n) => (n.id === notif.id ? { ...n, read: true } : n));
    saveNotifications(updated);
    setIsOpen(false);

    if (onNotificationClick) {
      onNotificationClick(notif);
    } else if (notif.link) {
      window.location.href = notif.link;
    }
  };

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'NEW_MESSAGE':
        return <MessageSquare className="w-4 h-4 text-blue-400 shrink-0" />;
      case 'APPLICATION_ACCEPTED':
        return <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'APPLICATION_REJECTED':
        return <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
      case 'NEW_APPLICATION':
        return <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'JOB_COMPLETED':
        return <Star className="w-4 h-4 text-yellow-400 shrink-0" />;
      case 'JOB_INVITATION':
        return <Star className="w-4 h-4 text-violet-400 shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-primary shrink-0" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return "À l'instant";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-muted-foreground hover:text-white transition-all relative cursor-pointer active:scale-95 shadow-md"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 ? (
          <span className={`absolute -top-1 -right-1 min-w-5 h-5 px-1 ${badgeBg} text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background shadow-lg animate-bounce`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : (
          <span className={`absolute top-0 right-0 w-2.5 h-2.5 ${badgeBg} rounded-full border-2 border-background`}></span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#141414]/95 border border-white/15 backdrop-blur-2xl rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Bell className={`w-4 h-4 ${textAccent}`} />
              <h3 className="text-sm font-extrabold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className={`text-[10px] font-black ${badgeBg} text-white px-2 py-0.5 rounded-full`}>
                  {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] font-bold text-muted-foreground hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  title="Tout marquer comme lu"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Tout lire</span>
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer pl-1"
                  title="Vider la liste"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List Body */}
          <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className={`p-4 transition-all cursor-pointer flex items-start gap-3 relative hover:bg-white/5 ${
                    !notif.read ? 'bg-white/[0.04]' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Unread Active Dot Indicator */}
                  {!notif.read && (
                    <span className={`absolute left-2 top-5 w-2 h-2 rounded-full ${activeDotBg} animate-pulse`} />
                  )}

                  {/* Icon */}
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0 mt-0.5">
                    {getNotifIcon(notif.type)}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className={`text-xs font-bold truncate ${!notif.read ? 'text-white' : 'text-muted-foreground'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                      {notif.message}
                    </p>

                    {notif.link && (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${textAccent} mt-2 hover:underline`}>
                        <span>Ouvrir la discussion</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 px-4 text-center">
                <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs font-semibold text-muted-foreground">Aucune notification pour le moment.</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">Vous recevrez vos messages et mises à jour en direct ici.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-white/[0.02] border-t border-white/10 text-center">
            <span className="text-[10px] font-semibold text-muted-foreground/70">
              ⚡ Notifications en direct activées
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
