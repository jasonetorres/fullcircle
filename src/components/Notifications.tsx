import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Heart, MessageCircle, UserPlus, Reply, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { badgeManager } from '../lib/badgeManager';

interface Notification {
  id: string;
  actor_id: string;
  type: 'like' | 'comment' | 'reply' | 'follow';
  log_id: string | null;
  comment_id: string | null;
  is_read: boolean;
  created_at: string;
  actor: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
  log: {
    title: string;
  } | null;
}

interface NotificationsProps {
  onNotificationClick?: (logId: string) => void;
  userId: string;
}

export default function Notifications({ onNotificationClick, userId }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    badgeManager.setBadge(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      const { data: notificationsData, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error || !notificationsData || notificationsData.length === 0) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      const actorIds = [...new Set(notificationsData.map(n => n.actor_id))];
      const logIds = [...new Set(notificationsData.map(n => n.log_id).filter(Boolean))];

      const [{ data: actors }, { data: logs }] = await Promise.all([
        supabase.from('profiles').select('id, username, display_name, avatar_url').in('id', actorIds),
        logIds.length > 0
          ? supabase.from('logs').select('id, title').in('id', logIds)
          : Promise.resolve({ data: [] })
      ]);

      const actorMap = new Map(actors?.map(a => [a.id, a]) || []);
      const logMap = new Map(logs?.map(l => [l.id, l]) || []);

      const enriched = notificationsData.map(n => ({
        ...n,
        actor: actorMap.get(n.actor_id) || null,
        log: n.log_id ? logMap.get(n.log_id) || null : null,
      }));

      setNotifications(enriched);
      setUnreadCount(enriched.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />;
      case 'comment': return <MessageCircle className="w-3.5 h-3.5 text-blue-500" />;
      case 'reply': return <Reply className="w-3.5 h-3.5 text-teal-500" />;
      case 'follow': return <UserPlus className="w-3.5 h-3.5 text-emerald-500" />;
      default: return <Bell className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const name = notification.actor?.display_name || notification.actor?.username || 'Someone';
    const title = notification.log?.title || 'your post';
    switch (notification.type) {
      case 'like': return <><strong>{name}</strong> liked <strong>"{title}"</strong></>;
      case 'comment': return <><strong>{name}</strong> commented on <strong>"{title}"</strong></>;
      case 'reply': return <><strong>{name}</strong> replied to your comment</>;
      case 'follow': return <><strong>{name}</strong> started following you</>;
      default: return '';
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.type !== 'follow' && onNotificationClick && notification.log_id) {
      onNotificationClick(notification.log_id);
    }
  };

  const renderAvatar = (notification: Notification) => {
    const actor = notification.actor;
    if (actor?.avatar_url) {
      return (
        <img
          src={actor.avatar_url}
          alt={actor.username}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-white text-sm font-bold">
        {actor?.username?.[0]?.toUpperCase() || '?'}
      </div>
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center font-bold leading-none px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 sm:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:left-auto z-50 w-full sm:w-[672px] sm:max-w-2xl animate-slide-up sm:animate-fade-in">
            <div className="bg-white dark:bg-dark-panel sm:rounded-xl rounded-t-2xl shadow-2xl border-t sm:border border-slate-200 dark:border-dark-border max-h-[75dvh] sm:max-h-[500px] flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-dark-border flex items-center justify-between flex-shrink-0">
                <h3 className="font-bold text-slate-800 dark:text-dark-text-primary">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary font-medium transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="overflow-y-auto flex-1 overscroll-contain">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-slate-800 dark:border-dark-border dark:border-t-dark-text-primary mx-auto" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-slate-200 dark:text-dark-border mx-auto mb-2" />
                    <p className="text-sm text-slate-400 dark:text-dark-text-secondary">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map(notification => {
                    const content = (
                      <div className="flex items-start gap-3 w-full">
                        <div className="relative flex-shrink-0">
                          {renderAvatar(notification)}
                          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white dark:bg-dark-panel flex items-center justify-center shadow-sm">
                            {getTypeIcon(notification.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 py-0.5">
                          <p className="text-sm text-slate-700 dark:text-dark-text-primary leading-snug line-clamp-2">
                            {getNotificationText(notification)}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-dark-text-secondary mt-0.5">
                            {getTimeAgo(notification.created_at)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        )}
                      </div>
                    );

                    const baseClassName = `block w-full p-3 text-left transition-colors ${
                      !notification.is_read
                        ? 'bg-blue-50/50 dark:bg-dark-hover hover:bg-blue-50 dark:hover:bg-dark-border'
                        : 'hover:bg-slate-50 dark:hover:bg-dark-hover'
                    }`;

                    if (notification.type === 'follow') {
                      return (
                        <Link
                          key={notification.id}
                          to={`/profile/${notification.actor_id}`}
                          onClick={() => {
                            if (!notification.is_read) markAsRead(notification.id);
                            setIsOpen(false);
                          }}
                          className={baseClassName}
                        >
                          {content}
                        </Link>
                      );
                    }

                    return (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={baseClassName}
                      >
                        {content}
                      </button>
                    );
                  })
                )}
              </div>

              <div className="sm:hidden px-4 py-3 border-t border-slate-100 dark:border-dark-border flex-shrink-0">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 text-sm font-medium text-slate-600 dark:text-dark-text-primary bg-slate-100 dark:bg-dark-hover rounded-xl transition hover:bg-slate-200 dark:hover:bg-dark-border active:scale-[0.98]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
