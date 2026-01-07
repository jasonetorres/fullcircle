import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  } | null;
  log: {
    title: string;
  } | null;
}

interface NotificationsProps {
  onNotificationClick?: (logId: string) => void;
}

export default function Notifications({ onNotificationClick }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`,
          },
          () => {
            loadNotifications();
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: notificationsData, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading notifications:', error);
        setLoading(false);
        return;
      }

      if (!notificationsData || notificationsData.length === 0) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      const actorIds = [...new Set(notificationsData.map(n => n.actor_id))];
      const logIds = [...new Set(notificationsData.map(n => n.log_id).filter(Boolean))];

      const [{ data: actors }, { data: logs }] = await Promise.all([
        supabase.from('profiles').select('id, username, display_name').in('id', actorIds),
        logIds.length > 0
          ? supabase.from('logs').select('id, title').in('id', logIds)
          : Promise.resolve({ data: [] })
      ]);

      const actorMap = new Map(actors?.map(a => [a.id, a]) || []);
      const logMap = new Map(logs?.map(l => [l.id, l]) || []);

      const enrichedNotifications = notificationsData.map(n => ({
        ...n,
        actor: actorMap.get(n.actor_id) || null,
        log: n.log_id ? logMap.get(n.log_id) || null : null,
      }));

      setNotifications(enrichedNotifications);
      setUnreadCount(enrichedNotifications.filter(n => !n.is_read).length);
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', user.id)
      .eq('is_read', false);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getNotificationText = (notification: Notification) => {
    const name = notification.actor?.display_name || notification.actor?.username || 'Someone';
    const title = notification.log?.title || 'your post';
    switch (notification.type) {
      case 'like':
        return `${name} liked "${title}"`;
      case 'comment':
        return `${name} commented on "${title}"`;
      case 'reply':
        return `${name} replied to your comment`;
      case 'follow':
        return `${name} started following you`;
      default:
        return '';
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.type === 'follow') {
      return;
    }
    if (onNotificationClick && notification.log_id) {
      onNotificationClick(notification.log_id);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-[calc(100vh-5rem)] sm:max-h-[500px] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <h3 className="font-semibold text-slate-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1 overscroll-contain" style={{ scrollbarWidth: 'thin' }}>
              {loading ? (
                <div className="p-8 text-center text-slate-500">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No notifications yet
                </div>
              ) : (
                notifications.map(notification => {
                  const content = (
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed text-slate-800">
                          {getNotificationText(notification)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {getTimeAgo(notification.created_at)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                      )}
                    </div>
                  );

                  const className = `w-full p-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`;

                  if (notification.type === 'follow') {
                    return (
                      <Link
                        key={notification.id}
                        to={`/profile/${notification.actor_id}`}
                        onClick={() => {
                          if (!notification.is_read) {
                            markAsRead(notification.id);
                          }
                          setIsOpen(false);
                        }}
                        className={className}
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={className}
                    >
                      {content}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}